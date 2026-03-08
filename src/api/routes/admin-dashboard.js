/**
 * BolãoMax — Dashboard Admin
 * GET /api/admin/dashboard     — resumo geral (stats, gráficos)
 * GET /api/admin/usuarios      — listar usuários
 * GET /api/admin/usuarios/:id  — detalhes do usuário
 * PATCH /api/admin/usuarios/:id/status — alterar status
 * GET /api/admin/participacoes — todas as participações
 * GET /api/admin/transacoes    — todas as transações
 */

import express from 'express';
import { rawDb, dialect } from '../database/connection.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function one(sql, params = []) {
  if (!rawDb) return null;
  if (dialect === 'sqlite') return rawDb.prepare(sql).get(...params) ?? null;
  const { rows } = await rawDb.query(sql, params);
  return rows[0] ?? null;
}

async function all(sql, params = []) {
  if (!rawDb) return [];
  if (dialect === 'sqlite') return rawDb.prepare(sql).all(...params);
  const { rows } = await rawDb.query(sql, params);
  return rows;
}

async function run(sql, params = []) {
  if (!rawDb) throw new Error('DB não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  return rawDb.query(sql, params);
}

// ── GET /api/admin/dashboard ─────────────────────────────────
router.get('/dashboard', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [
      statsUsuarios,
      statsBoloes,
      statsFinanceiro,
      statsParticipacoes,
      boloesRecentes,
      usuariosRecentes,
      transacoesRecentes,
    ] = await Promise.all([
      // Usuários
      one(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as ativos,
        SUM(CASE WHEN status='inactive' OR status='suspended' THEN 1 ELSE 0 END) as inativos,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as admins,
        SUM(COALESCE(saldo,0)) as saldo_total_usuarios
        FROM users`),
      // Bolões
      one(`SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status='aberto' THEN 1 ELSE 0 END) as abertos,
        SUM(CASE WHEN status='fechado' THEN 1 ELSE 0 END) as fechados,
        SUM(CASE WHEN status='em_andamento' THEN 1 ELSE 0 END) as em_andamento,
        SUM(CASE WHEN status='encerrado' THEN 1 ELSE 0 END) as encerrados,
        SUM(quantidade_cotas - cotas_disponiveis) as total_cotas_vendidas,
        SUM((quantidade_cotas - cotas_disponiveis) * valor_cota) as receita_cotas
        FROM boloes`),
      // Financeiro
      one(`SELECT
        COUNT(*) as total_transacoes,
        SUM(CASE WHEN tipo='recarga' AND status='aprovado' THEN valor ELSE 0 END) as total_recargas,
        SUM(CASE WHEN tipo='debito' AND status='aprovado' THEN valor ELSE 0 END) as total_debitos,
        SUM(CASE WHEN status='pendente' THEN 1 ELSE 0 END) as pendentes
        FROM transactions`),
      // Participações
      one(`SELECT
        COUNT(*) as total,
        SUM(valor_total) as valor_total,
        SUM(CASE WHEN status='confirmado' THEN 1 ELSE 0 END) as confirmadas
        FROM participacoes`),
      // Bolões recentes
      all(`SELECT id, nome, tipo, status, quantidade_cotas, cotas_disponiveis, valor_cota, criado_em
           FROM boloes ORDER BY criado_em DESC LIMIT 5`),
      // Usuários recentes
      all(`SELECT id, name, email, role, status, saldo, criado_em
           FROM users ORDER BY criado_em DESC LIMIT 5`),
      // Transações recentes
      all(`SELECT t.id, t.tipo, t.valor, t.status, t.criado_em, u.name as user_name, u.email as user_email
           FROM transactions t LEFT JOIN users u ON u.id = t.user_id
           ORDER BY t.criado_em DESC LIMIT 10`),
    ]);

    res.json({
      success: true,
      stats: {
        usuarios: {
          total: Number(statsUsuarios?.total ?? 0),
          ativos: Number(statsUsuarios?.ativos ?? 0),
          inativos: Number(statsUsuarios?.inativos ?? 0),
          admins: Number(statsUsuarios?.admins ?? 0),
          saldoTotal: Number(statsUsuarios?.saldo_total_usuarios ?? 0),
        },
        boloes: {
          total: Number(statsBoloes?.total ?? 0),
          abertos: Number(statsBoloes?.abertos ?? 0),
          fechados: Number(statsBoloes?.fechados ?? 0),
          emAndamento: Number(statsBoloes?.em_andamento ?? 0),
          encerrados: Number(statsBoloes?.encerrados ?? 0),
          cotasVendidas: Number(statsBoloes?.total_cotas_vendidas ?? 0),
          receitaCotas: Number(statsBoloes?.receita_cotas ?? 0),
        },
        financeiro: {
          totalTransacoes: Number(statsFinanceiro?.total_transacoes ?? 0),
          totalRecargas: Number(statsFinanceiro?.total_recargas ?? 0),
          totalDebitos: Number(statsFinanceiro?.total_debitos ?? 0),
          pendentes: Number(statsFinanceiro?.pendentes ?? 0),
        },
        participacoes: {
          total: Number(statsParticipacoes?.total ?? 0),
          valorTotal: Number(statsParticipacoes?.valor_total ?? 0),
          confirmadas: Number(statsParticipacoes?.confirmadas ?? 0),
        },
      },
      recentes: {
        boloes: boloesRecentes.map(b => ({
          id: b.id,
          nome: b.nome,
          tipo: b.tipo,
          status: b.status,
          cotasVendidas: Number(b.quantidade_cotas) - Number(b.cotas_disponiveis),
          totalCotas: Number(b.quantidade_cotas),
          valorCota: Number(b.valor_cota),
          criadoEm: b.criado_em,
        })),
        usuarios: usuariosRecentes.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          saldo: Number(u.saldo ?? 0),
          criadoEm: u.criado_em,
        })),
        transacoes: transacoesRecentes.map(t => ({
          id: t.id,
          tipo: t.tipo,
          valor: Number(t.valor),
          status: t.status,
          userName: t.user_name,
          userEmail: t.user_email,
          criadoEm: t.criado_em,
        })),
      },
    });
  } catch (error) {
    console.error('[ADMIN] Erro no dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/admin/usuarios ──────────────────────────────────
router.get('/usuarios', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['1=1'];
    const params = [];
    let i = 1;

    if (status) { conditions.push(`status = ${ph(i++)}`); params.push(status); }
    if (role)   { conditions.push(`role = ${ph(i++)}`);   params.push(role); }
    if (search) {
      conditions.push(`(name LIKE ${ph(i)} OR email LIKE ${ph(i+1)} OR cpf LIKE ${ph(i+2)})`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      i += 3;
    }

    const where = conditions.join(' AND ');

    const [countRow, usuarios] = await Promise.all([
      one(`SELECT COUNT(*) as n FROM users WHERE ${where}`, params),
      all(
        `SELECT id, name, email, role, status, saldo, cpf, telefone, criado_em FROM users WHERE ${where} ORDER BY criado_em DESC LIMIT ${ph(i)} OFFSET ${ph(i+1)}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    res.json({
      success: true,
      usuarios: usuarios.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        saldo: Number(u.saldo ?? 0),
        cpf: u.cpf,
        telefone: u.telefone,
        criadoEm: u.criado_em,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countRow?.n ?? 0),
        totalPages: Math.ceil(Number(countRow?.n ?? 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[ADMIN] Erro ao listar usuários:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/admin/usuarios/:id ──────────────────────────────
router.get('/usuarios/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [user, participacoes, transacoes] = await Promise.all([
      one(`SELECT id, name, email, role, status, saldo, cpf, telefone, avatar, criado_em FROM users WHERE id = ${ph(1)}`, [req.params.id]),
      all(`SELECT p.*, b.nome as bolao_nome, b.tipo as tipo_loteria
           FROM participacoes p LEFT JOIN boloes b ON b.id = p.bolao_id
           WHERE p.user_id = ${ph(1)} ORDER BY p.criado_em DESC LIMIT 10`, [req.params.id]),
      all(`SELECT * FROM transactions WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT 10`, [req.params.id]),
    ]);

    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    res.json({
      success: true,
      usuario: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        saldo: Number(user.saldo ?? 0),
        cpf: user.cpf,
        telefone: user.telefone,
        avatar: user.avatar,
        criadoEm: user.criado_em,
      },
      participacoes: participacoes.map(p => ({
        id: p.id,
        bolaoNome: p.bolao_nome,
        tipoLoteria: p.tipo_loteria,
        quantidadeCotas: p.quantidade_cotas,
        valorTotal: Number(p.valor_total),
        status: p.status,
        criadoEm: p.criado_em,
      })),
      transacoes: transacoes.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: Number(t.valor),
        status: t.status,
        descricao: t.descricao,
        criadoEm: t.criado_em,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PATCH /api/admin/usuarios/:id/status ─────────────────────
router.patch('/usuarios/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validos = ['active', 'inactive', 'suspended'];
    if (!validos.includes(status)) {
      return res.status(400).json({ success: false, error: `Status inválido. Use: ${validos.join(', ')}` });
    }

    const user = await one(`SELECT id FROM users WHERE id = ${ph(1)}`, [req.params.id]);
    if (!user) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });

    await run(
      `UPDATE users SET status = ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
      [status, new Date().toISOString(), req.params.id]
    );

    res.json({ success: true, message: `Status atualizado para ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/admin/participacoes ─────────────────────────────
router.get('/participacoes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, bolaoId, userId, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['1=1'];
    const params = [];
    let i = 1;

    if (bolaoId) { conditions.push(`p.bolao_id = ${ph(i++)}`); params.push(bolaoId); }
    if (userId)  { conditions.push(`p.user_id = ${ph(i++)}`);  params.push(userId); }
    if (status)  { conditions.push(`p.status = ${ph(i++)}`);   params.push(status); }

    const where = conditions.join(' AND ');

    const [countRow, rows] = await Promise.all([
      one(`SELECT COUNT(*) as n FROM participacoes p WHERE ${where}`, params),
      all(
        `SELECT p.*, b.nome as bolao_nome, b.tipo as tipo_loteria, u.name as user_name, u.email as user_email
         FROM participacoes p
         LEFT JOIN boloes b ON b.id = p.bolao_id
         LEFT JOIN users u ON u.id = p.user_id
         WHERE ${where}
         ORDER BY p.criado_em DESC
         LIMIT ${ph(i)} OFFSET ${ph(i+1)}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    res.json({
      success: true,
      participacoes: rows.map(p => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userEmail: p.user_email,
        bolaoId: p.bolao_id,
        bolaoNome: p.bolao_nome,
        tipoLoteria: p.tipo_loteria,
        quantidadeCotas: p.quantidade_cotas,
        valorTotal: Number(p.valor_total),
        status: p.status,
        premiado: p.premiado === 1 || p.premiado === true,
        valorPremio: Number(p.valor_premio ?? 0),
        criadoEm: p.criado_em,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countRow?.n ?? 0),
        totalPages: Math.ceil(Number(countRow?.n ?? 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/admin/transacoes ────────────────────────────────
router.get('/transacoes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = ['1=1'];
    const params = [];
    let i = 1;

    if (tipo)   { conditions.push(`t.tipo = ${ph(i++)}`);   params.push(tipo); }
    if (status) { conditions.push(`t.status = ${ph(i++)}`); params.push(status); }

    const where = conditions.join(' AND ');

    const [countRow, rows] = await Promise.all([
      one(`SELECT COUNT(*) as n FROM transactions t WHERE ${where}`, params),
      all(
        `SELECT t.*, u.name as user_name, u.email as user_email
         FROM transactions t LEFT JOIN users u ON u.id = t.user_id
         WHERE ${where}
         ORDER BY t.criado_em DESC
         LIMIT ${ph(i)} OFFSET ${ph(i+1)}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    res.json({
      success: true,
      transacoes: rows.map(t => ({
        id: t.id,
        userId: t.user_id,
        userName: t.user_name,
        userEmail: t.user_email,
        tipo: t.tipo,
        valor: Number(t.valor),
        status: t.status,
        metodoPagamento: t.metodo_pagamento,
        descricao: t.descricao,
        bolaoId: t.bolao_id,
        criadoEm: t.criado_em,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countRow?.n ?? 0),
        totalPages: Math.ceil(Number(countRow?.n ?? 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
