/**
 * BolãoMax — Serviço de Carteira
 * Gerencia saldo, recargas e histórico de transações
 * SQL nativo (SQLite dev / PostgreSQL prod)
 */

import { rawDb, dialect } from '../database/connection.js';
import { randomUUID } from 'crypto';

// ── helpers SQL ──────────────────────────────────────────────

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function run(sql, params = []) {
  if (!rawDb) throw new Error('Banco não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  return rawDb.query(sql, params);
}

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

// ── SALDO ─────────────────────────────────────────────────────

export async function buscarSaldo(userId) {
  const user = await one(
    `SELECT id, name, email, saldo FROM users WHERE id = ${ph(1)}`,
    [userId]
  );
  if (!user) throw new Error('Usuário não encontrado');

  return {
    success: true,
    saldo: Number(user.saldo ?? 0),
    userId: user.id,
    nome: user.name,
    email: user.email,
  };
}

// ── HISTÓRICO DE TRANSAÇÕES ───────────────────────────────────

export async function buscarTransacoes(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const [countRow, rows] = await Promise.all([
    one(
      `SELECT COUNT(*) as n FROM transactions WHERE user_id = ${ph(1)}`,
      [userId]
    ),
    all(
      `SELECT * FROM transactions WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT ${ph(2)} OFFSET ${ph(3)}`,
      [userId, limit, offset]
    ),
  ]);

  return {
    success: true,
    transacoes: rows.map(t => ({
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
      page,
      limit,
      total: Number(countRow?.n ?? 0),
      totalPages: Math.ceil(Number(countRow?.n ?? 0) / limit),
    },
  };
}

// ── HISTÓRICO DE RECARGAS ─────────────────────────────────────

export async function buscarRecargas(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const [countRow, rows] = await Promise.all([
    one(`SELECT COUNT(*) as n FROM recarga_carteira WHERE user_id = ${ph(1)}`, [userId]),
    all(
      `SELECT * FROM recarga_carteira WHERE user_id = ${ph(1)} ORDER BY criado_em DESC LIMIT ${ph(2)} OFFSET ${ph(3)}`,
      [userId, limit, offset]
    ),
  ]);

  return {
    success: true,
    recargas: rows.map(r => ({
      id: r.id,
      valor: Number(r.valor),
      formaPagamento: r.forma_pagamento,
      status: r.status,
      qrCode: r.qr_code,
      qrCodeUrl: r.qr_code_url,
      expiraEm: r.expira_em,
      confirmadoEm: r.confirmado_em,
      criadoEm: r.criado_em,
    })),
    pagination: {
      page,
      limit,
      total: Number(countRow?.n ?? 0),
      totalPages: Math.ceil(Number(countRow?.n ?? 0) / limit),
    },
  };
}

// ── SOLICITAR RECARGA (PIX/Cartão/Boleto) ─────────────────────

export async function solicitarRecarga({ userId, valor, formaPagamento, dadosPagamento = {} }) {
  if (!valor || valor < 5) throw new Error('Valor mínimo de recarga: R$ 5,00');
  if (!['pix', 'credit_card', 'boleto'].includes(formaPagamento))
    throw new Error('Forma de pagamento inválida');

  const id = randomUUID();
  const now = new Date().toISOString();

  // Simular geração de PIX (sandbox)
  let qrCode = null;
  let qrCodeUrl = null;
  let boletoUrl = null;
  const expiraEm = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

  if (formaPagamento === 'pix') {
    qrCode = `00020126580014br.gov.bcb.pix0136${randomUUID()}5204000053039865802BR5913BolaoMax6008BrasiliaChv${id.slice(0,8)}6304${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`;
    qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=200x200`;
  } else if (formaPagamento === 'boleto') {
    boletoUrl = `https://bolaomax.com.br/boleto/${id}`;
  }

  await run(
    `INSERT INTO recarga_carteira (id, user_id, valor, forma_pagamento, status, qr_code, qr_code_url, boleto_url, expira_em, criado_em)
     VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},'pendente',${ph(5)},${ph(6)},${ph(7)},${ph(8)},${ph(9)})`,
    [id, userId, valor, formaPagamento, qrCode, qrCodeUrl, boletoUrl, expiraEm, now]
  );

  // Registrar transação
  const txId = randomUUID();
  await run(
    `INSERT INTO transactions (id, user_id, tipo, valor, status, metodo_pagamento, descricao, criado_em, atualizado_em)
     VALUES (${ph(1)},${ph(2)},'recarga',${ph(3)},'pendente',${ph(4)},${ph(5)},${ph(6)},${ph(7)})`,
    [txId, userId, valor, formaPagamento, `Recarga via ${formaPagamento.toUpperCase()} — R$ ${valor.toFixed(2)}`, now, now]
  );

  console.log(`💰 [CARTEIRA] Recarga R$ ${valor} via ${formaPagamento} para usuário ${userId}`);

  return {
    success: true,
    recargaId: id,
    valor,
    formaPagamento,
    status: 'pendente',
    qrCode,
    qrCodeUrl,
    boletoUrl,
    expiraEm,
    mensagem: formaPagamento === 'pix'
      ? 'PIX gerado! Escaneie o QR Code ou copie o código.'
      : formaPagamento === 'boleto'
      ? 'Boleto gerado! Pague até a data de vencimento.'
      : 'Pagamento com cartão iniciado.',
  };
}

// ── CONFIRMAR RECARGA (webhook / simulação sandbox) ───────────

export async function confirmarRecarga(recargaId) {
  const recarga = await one(
    `SELECT * FROM recarga_carteira WHERE id = ${ph(1)}`,
    [recargaId]
  );
  if (!recarga) throw new Error('Recarga não encontrada');
  if (recarga.status === 'confirmado') throw new Error('Recarga já confirmada');

  const now = new Date().toISOString();

  // Atualizar recarga
  await run(
    `UPDATE recarga_carteira SET status = 'confirmado', confirmado_em = ${ph(1)} WHERE id = ${ph(2)}`,
    [now, recargaId]
  );

  // Creditar saldo
  await run(
    `UPDATE users SET saldo = COALESCE(saldo, 0) + ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
    [Number(recarga.valor), now, recarga.user_id]
  );

  // Atualizar transação
  await run(
    `UPDATE transactions SET status = 'aprovado', atualizado_em = ${ph(1)} WHERE metodo_pagamento = ${ph(2)} AND user_id = ${ph(3)} AND status = 'pendente'`,
    [now, recarga.forma_pagamento, recarga.user_id]
  );

  const user = await one(`SELECT saldo FROM users WHERE id = ${ph(1)}`, [recarga.user_id]);
  console.log(`✅ [CARTEIRA] Recarga R$ ${recarga.valor} confirmada. Saldo: R$ ${user?.saldo}`);

  return { success: true, novoSaldo: Number(user?.saldo ?? 0) };
}

// ── DÉBITO (usado no checkout) ────────────────────────────────

export async function debitarSaldo({ userId, valor, descricao, bolaoId = null }) {
  const user = await one(`SELECT saldo FROM users WHERE id = ${ph(1)}`, [userId]);
  if (!user) throw new Error('Usuário não encontrado');
  if (Number(user.saldo) < valor) throw new Error('Saldo insuficiente');

  const now = new Date().toISOString();

  await run(
    `UPDATE users SET saldo = saldo - ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
    [valor, now, userId]
  );

  const txId = randomUUID();
  await run(
    `INSERT INTO transactions (id, user_id, tipo, valor, status, descricao, bolao_id, criado_em, atualizado_em)
     VALUES (${ph(1)},${ph(2)},'debito',${ph(3)},'aprovado',${ph(4)},${ph(5)},${ph(6)},${ph(7)})`,
    [txId, userId, valor, descricao, bolaoId, now, now]
  );

  const updated = await one(`SELECT saldo FROM users WHERE id = ${ph(1)}`, [userId]);
  return { success: true, novoSaldo: Number(updated?.saldo ?? 0) };
}

export default { buscarSaldo, buscarTransacoes, buscarRecargas, solicitarRecarga, confirmarRecarga, debitarSaldo };
