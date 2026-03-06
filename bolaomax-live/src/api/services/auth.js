/**
 * BolãoMax - Serviço de Autenticação
 * Sistema completo de auth com JWT, bcrypt e sessões
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'bolaomax-dev-secret-change-in-production';
const TOKEN_EXPIRATION = '7d'; // 7 dias

// ============================================================
// HELPERS
// ============================================================

/**
 * Gera hash de senha com bcrypt
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara senha com hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Gera JWT token
 */
export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

/**
 * Verifica e decodifica JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Gera ID único
 */
export function generateId() {
  return crypto.randomUUID();
}

// ============================================================
// SERVIÇOS DE AUTENTICAÇÃO
// ============================================================

/**
 * Registrar novo usuário
 */
export async function register(db, schema, { name, email, password }) {
  try {
    // Verificar se email já existe
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(schema.users.email === email)
      .limit(1);
    
    if (existingUser.length > 0) {
      throw new Error('Email já cadastrado');
    }
    
    // Hash da senha
    const passwordHash = await hashPassword(password);
    
    // Criar usuário
    const userId = generateId();
    const newUser = {
      id: userId,
      name,
      email,
      passwordHash,
      role: 'user',
      status: 'active',
      saldo: 0,
      emailVerified: false,
      telefoneVerified: false,
    };
    
    await db.insert(schema.users).values(newUser);
    
    // Gerar token
    const token = generateToken(newUser);
    
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Login de usuário
 */
export async function login(db, schema, { email, password }) {
  try {
    // Buscar usuário
    const users = await db
      .select()
      .from(schema.users)
      .where(schema.users.email === email)
      .limit(1);
    
    if (users.length === 0) {
      throw new Error('Email ou senha incorretos');
    }
    
    const user = users[0];
    
    // Verificar status
    if (user.status !== 'active') {
      throw new Error('Conta inativa ou suspensa');
    }
    
    // Verificar senha
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Email ou senha incorretos');
    }
    
    // Gerar token
    const token = generateToken(user);
    
    // Criar sessão
    const sessionId = generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
    
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
    }).catch(() => {
      // Ignorar erro se tabela não existir (desenvolvimento)
    });
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        saldo: user.saldo,
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Logout (invalidar sessão)
 */
export async function logout(db, schema, token) {
  try {
    await db
      .delete(schema.sessions)
      .where(schema.sessions.token === token);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Verificar autenticação via token
 */
export async function verifyAuth(db, schema, token) {
  try {
    // Verificar JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error('Token inválido ou expirado');
    }
    
    // Buscar usuário
    const users = await db
      .select()
      .from(schema.users)
      .where(schema.users.id === decoded.id)
      .limit(1);
    
    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const user = users[0];
    
    if (user.status !== 'active') {
      throw new Error('Conta inativa');
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      saldo: user.saldo,
      avatar: user.avatar,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Atualizar senha
 */
export async function updatePassword(db, schema, userId, { currentPassword, newPassword }) {
  try {
    // Buscar usuário
    const users = await db
      .select()
      .from(schema.users)
      .where(schema.users.id === userId)
      .limit(1);
    
    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const user = users[0];
    
    // Verificar senha atual
    const passwordMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Senha atual incorreta');
    }
    
    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);
    
    // Atualizar
    await db
      .update(schema.users)
      .set({ passwordHash: newPasswordHash })
      .where(schema.users.id === userId);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

/**
 * Reset de senha (gerar token)
 */
export async function requestPasswordReset(db, schema, email) {
  try {
    const users = await db
      .select()
      .from(schema.users)
      .where(schema.users.email === email)
      .limit(1);
    
    if (users.length === 0) {
      // Não revelar se email existe
      return { success: true };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // TODO: Salvar token em tabela password_resets
    // TODO: Enviar email com link de reset
    
    return { 
      success: true,
      resetToken, // Em produção, enviar via email
    };
  } catch (error) {
    throw error;
  }
}
