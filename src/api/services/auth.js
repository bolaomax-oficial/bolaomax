/**
 * BolãoMax — Serviço de Autenticação
 * JWT + bcrypt + SQLite (dev) / PostgreSQL (prod)
 *
 * CORREÇÃO: usa sql bruto via db.all/db.get em vez de
 * Drizzle ORM com === (que não gera WHERE clause).
 */

import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import crypto   from 'crypto';
import { rawDb, dialect } from '../database/connection.js';

const SECRET_KEY       = process.env.SECRET_KEY || 'bolaomax-dev-secret-change-in-production';
const TOKEN_EXPIRATION = '7d';

// ── helpers ──────────────────────────────────────────────────

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET_KEY); }
  catch { return null; }
}

export function generateId() { return crypto.randomUUID(); }

// ── query helper (SQLite + PostgreSQL) ───────────────────────

async function queryOne(sql, params = []) {
  if (!rawDb) return null;
  try {
    if (dialect === 'sqlite') {
      return rawDb.prepare(sql).get(...params) ?? null;
    } else {
      const { rows } = await rawDb.query(sql, params);
      return rows[0] ?? null;
    }
  } catch (e) {
    console.error('[AUTH] queryOne error:', e.message);
    return null;
  }
}

async function queryRun(sql, params = []) {
  if (!rawDb) return;
  try {
    if (dialect === 'sqlite') {
      rawDb.prepare(sql).run(...params);
    } else {
      await rawDb.query(sql, params);
    }
  } catch (e) {
    if (!e.message?.includes('sessions')) console.error('[AUTH] queryRun error:', e.message);
  }
}

// placeholder ($1 para PG, ? para SQLite)
function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

// ── REGISTER ─────────────────────────────────────────────────

export async function register(_db, _schema, { name, email, password }) {
  const existing = await queryOne(
    `SELECT id FROM users WHERE email = ${ph(1)}`, [email]
  );
  if (existing) throw new Error('Email já cadastrado');

  const passwordHash = await hashPassword(password);
  const userId       = generateId();
  const now          = new Date().toISOString();

  await queryRun(
    `INSERT INTO users (id, name, email, password_hash, role, status, saldo, email_verified, telefone_verified, criado_em, atualizado_em)
     VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},'user','active',0,0,0,${ph(5)},${ph(6)})`,
    [userId, name, email, passwordHash, now, now]
  );

  const token = generateToken({ id: userId, email, role: 'user', name });
  return { user: { id: userId, name, email, role: 'user' }, token };
}

// ── LOGIN ─────────────────────────────────────────────────────

export async function login(_db, _schema, { email, password }) {
  const user = await queryOne(
    `SELECT id, name, email, password_hash, role, status, saldo, avatar
     FROM users WHERE email = ${ph(1)}`, [email]
  );

  if (!user) throw new Error('Email ou senha incorretos');
  if (user.status !== 'active') throw new Error('Conta inativa ou suspensa');

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throw new Error('Email ou senha incorretos');

  const token    = generateToken(user);
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString();

  await queryRun(
    `INSERT INTO sessions (id, user_id, token, expires_at, criado_em)
     VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)})`,
    [sessionId, user.id, token, expiresAt, new Date().toISOString()]
  );

  return {
    user: { id: user.id, name: user.name, email: user.email,
            role: user.role, saldo: user.saldo ?? 0, avatar: user.avatar ?? null },
    token,
  };
}

// ── LOGOUT ────────────────────────────────────────────────────

export async function logout(_db, _schema, token) {
  await queryRun(`DELETE FROM sessions WHERE token = ${ph(1)}`, [token]);
  return { success: true };
}

// ── VERIFY AUTH ───────────────────────────────────────────────

export async function verifyAuth(_db, _schema, token) {
  const decoded = verifyToken(token);
  if (!decoded) throw new Error('Token inválido ou expirado');

  const user = await queryOne(
    `SELECT id, name, email, role, status, saldo, avatar
     FROM users WHERE id = ${ph(1)}`, [decoded.id]
  );
  if (!user)             throw new Error('Usuário não encontrado');
  if (user.status !== 'active') throw new Error('Conta inativa');

  return { id: user.id, name: user.name, email: user.email,
           role: user.role, saldo: user.saldo ?? 0, avatar: user.avatar ?? null };
}

// ── UPDATE PASSWORD ───────────────────────────────────────────

export async function updatePassword(_db, _schema, userId, { currentPassword, newPassword }) {
  const user = await queryOne(
    `SELECT id, password_hash FROM users WHERE id = ${ph(1)}`, [userId]
  );
  if (!user) throw new Error('Usuário não encontrado');

  const ok = await comparePassword(currentPassword, user.password_hash);
  if (!ok) throw new Error('Senha atual incorreta');

  const newHash = await hashPassword(newPassword);
  await queryRun(
    `UPDATE users SET password_hash = ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
    [newHash, new Date().toISOString(), userId]
  );
  return { success: true };
}

// ── GET PROFILE ───────────────────────────────────────────────

export async function getProfile(_db, _schema, userId) {
  const user = await queryOne(
    `SELECT id, name, email, cpf, telefone, role, status, saldo, avatar,
            email_verified, telefone_verified, criado_em
     FROM users WHERE id = ${ph(1)}`, [userId]
  );
  if (!user) throw new Error('Usuário não encontrado');
  return user;
}

// ── UPDATE PROFILE ────────────────────────────────────────────

export async function updateProfile(_db, _schema, userId, { name, telefone, cpf, avatar }) {
  const fields = [];
  const vals   = [];
  let i = 1;

  if (name     !== undefined) { fields.push(`name = ${ph(i++)}`);     vals.push(name);     }
  if (telefone !== undefined) { fields.push(`telefone = ${ph(i++)}`); vals.push(telefone); }
  if (cpf      !== undefined) { fields.push(`cpf = ${ph(i++)}`);      vals.push(cpf);      }
  if (avatar   !== undefined) { fields.push(`avatar = ${ph(i++)}`);   vals.push(avatar);   }

  if (!fields.length) return { success: true };

  fields.push(`atualizado_em = ${ph(i++)}`);
  vals.push(new Date().toISOString());
  vals.push(userId);

  await queryRun(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ${ph(i)}`,
    vals
  );
  return { success: true };
}

// ── REQUEST PASSWORD RESET ────────────────────────────────────

export async function requestPasswordReset(_db, _schema, email) {
  const user = await queryOne(
    `SELECT id FROM users WHERE email = ${ph(1)}`, [email]
  );
  // Não revelar se e-mail existe
  if (!user) return { success: true };

  const resetToken = crypto.randomBytes(32).toString('hex');
  // TODO: salvar em tabela password_resets + enviar email
  return { success: true, resetToken };
}
