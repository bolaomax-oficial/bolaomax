/**
 * BolãoMax — Rotas Financeiras
 * Usando o service de carteira (SQL nativo)
 * GET /api/financeiro/saldo
 * GET /api/financeiro/extrato
 * GET /api/financeiro/dashboard  (admin)
 */

import express from 'express';
import { rawDb, dialect } from '../database/connection.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

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

// GET /api/financeiro/saldo
router.get('/saldo', requireAuth, async (req, res) => {
  try {
    const user = await one(
      `SELECT id, name, saldo FROM users WHERE id = ${ph(1)}`,
      [req.user.id]
    );
    const saldo = Number(user?.saldo ?? 0);
    res.json({
      success: true,
      saldo,
      saldoFormatado: `R$ ${saldo.toFixed(2).replace('.', ',')}`,
    });
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao consultar saldo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/financeiro/extrato
router.get('/extrato', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [countRow, transacoes] = await Promise.all([
      one(`SELECT COUNT(*) as n FROM transactions WHERE user_id = ${ph(1)}`, [req.user.id]),
      all(
        `SELECT * FROM transactions WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT ${ph(2)} OFFSET ${ph(3)}`,
        [req.user.id, parseInt(limit), offset]
      ),
    ]);

    res.json({
      success: true,
      transacoes: transacoes.map(t => ({
        id: t.id,
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
    console.error('[FINANCEIRO] Erro ao buscar extrato:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/financeiro/dashboard  (admin)
router.get('/dashboard', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [stats, recentTx] = await Promise.all([
      one(`
        SELECT
          COUNT(*) as total_transacoes,
          SUM(CASE WHEN tipo = 'recarga' AND status = 'aprovado' THEN valor ELSE 0 END) as total_recargas,
          SUM(CASE WHEN tipo = 'debito' AND status = 'aprovado' THEN valor ELSE 0 END) as total_debitos,
          SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes
        FROM transactions
      `),
      all(`SELECT t.*, u.name as user_name, u.email as user_email
           FROM transactions t LEFT JOIN users u ON u.id = t.user_id
           ORDER BY t.criado_em DESC LIMIT 10`),
    ]);

    const usersTotal = await one('SELECT COUNT(*) as n FROM users');
    const boloesStats = await one(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aberto' THEN 1 ELSE 0 END) as abertos,
        SUM(quantidade_cotas - cotas_disponiveis) as cotas_vendidas,
        SUM((quantidade_cotas - cotas_disponiveis) * valor_cota) as receita
      FROM boloes
    `);

    res.json({
      success: true,
      financeiro: {
        totalRecargas: Number(stats?.total_recargas ?? 0),
        totalDebitos: Number(stats?.total_debitos ?? 0),
        totalTransacoes: Number(stats?.total_transacoes ?? 0),
        pendentes: Number(stats?.pendentes ?? 0),
      },
      boloes: {
        total: Number(boloesStats?.total ?? 0),
        abertos: Number(boloesStats?.abertos ?? 0),
        cotasVendidas: Number(boloesStats?.cotas_vendidas ?? 0),
        receita: Number(boloesStats?.receita ?? 0),
      },
      usuarios: { total: Number(usersTotal?.n ?? 0) },
      transacoesRecentes: recentTx.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: Number(t.valor),
        status: t.status,
        userName: t.user_name,
        userEmail: t.user_email,
        criadoEm: t.criado_em,
      })),
    });
  } catch (error) {
    console.error('[FINANCEIRO] Erro no dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
