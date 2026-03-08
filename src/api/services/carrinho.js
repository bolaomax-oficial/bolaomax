/**
 * BolãoMax — Serviço de Carrinho
 * SQL nativo (SQLite dev / PostgreSQL prod)
 * Schema real: carrinho_itens (id, user_id, bolao_id, quantidade_cotas, valor_unitario, valor_total, expira_em, status, criado_em)
 */

import { rawDb, dialect } from '../database/connection.js';
import { randomUUID } from 'crypto';

// ── helpers SQL ──────────────────────────────────────────────

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function run(sql, params = []) {
  if (!rawDb) throw new Error('Banco de dados não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  const res = await rawDb.query(sql, params);
  return res;
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

// ── agora/datetime helper ───────────────────────────────────

function nowExpr() { return dialect === 'postgresql' ? 'NOW()' : "datetime('now')"; }
function isoNow()  { return new Date().toISOString(); }

// ── ADICIONAR AO CARRINHO ────────────────────────────────────

export async function adicionarAoCarrinho({ userId, bolaoId, quantidadeCotas = 1 }) {
  // Buscar bolão
  const bolao = await one(
    `SELECT id, nome, tipo, status, cotas_disponiveis, valor_cota FROM boloes WHERE id = ${ph(1)} LIMIT 1`,
    [bolaoId]
  );

  if (!bolao) throw new Error('Bolão não encontrado');
  if (bolao.status !== 'aberto') throw new Error('Este bolão não está mais aceitando inscrições');

  // Cotas reservadas atualmente (não expiradas)
  let cotasReservadas = 0;
  if (dialect === 'sqlite') {
    const r = await one(
      `SELECT COALESCE(SUM(quantidade_cotas),0) as total FROM carrinho_itens
       WHERE bolao_id = ? AND status = 'reservado' AND expira_em > datetime('now')`,
      [bolaoId]
    );
    cotasReservadas = Number(r?.total ?? 0);
  } else {
    const r = await one(
      `SELECT COALESCE(SUM(quantidade_cotas),0)::int as total FROM carrinho_itens
       WHERE bolao_id = $1 AND status = 'reservado' AND expira_em > NOW()`,
      [bolaoId]
    );
    cotasReservadas = Number(r?.total ?? 0);
  }

  const cotasDisponiveis = (bolao.cotas_disponiveis ?? 0) - cotasReservadas;
  if (quantidadeCotas > cotasDisponiveis) {
    throw new Error(`Apenas ${Math.max(0, cotasDisponiveis)} cotas disponíveis`);
  }

  const expiraEm = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const valorUnitario = Number(bolao.valor_cota);
  const valorTotal = valorUnitario * quantidadeCotas;

  // Verificar se já existe item reservado para este bolão
  let itemExistente;
  if (dialect === 'sqlite') {
    itemExistente = await one(
      `SELECT * FROM carrinho_itens WHERE user_id = ? AND bolao_id = ? AND status = 'reservado' AND expira_em > datetime('now') LIMIT 1`,
      [userId, bolaoId]
    );
  } else {
    itemExistente = await one(
      `SELECT * FROM carrinho_itens WHERE user_id = $1 AND bolao_id = $2 AND status = 'reservado' AND expira_em > NOW() LIMIT 1`,
      [userId, bolaoId]
    );
  }

  if (itemExistente) {
    const novaQtd = itemExistente.quantidade_cotas + quantidadeCotas;
    const novoTotal = valorUnitario * novaQtd;
    await run(
      `UPDATE carrinho_itens SET quantidade_cotas = ${ph(1)}, valor_total = ${ph(2)}, expira_em = ${ph(3)} WHERE id = ${ph(4)}`,
      [novaQtd, novoTotal, expiraEm, itemExistente.id]
    );
    return { success: true, itemId: itemExistente.id, action: 'updated', expiraEm, bolaoNome: bolao.nome };
  }

  const itemId = randomUUID();
  await run(
    `INSERT INTO carrinho_itens (id, user_id, bolao_id, quantidade_cotas, valor_unitario, valor_total, expira_em, status, criado_em)
     VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},${ph(6)},${ph(7)},'reservado',${ph(8)})`,
    [itemId, userId, bolaoId, quantidadeCotas, valorUnitario, valorTotal, expiraEm, isoNow()]
  );

  console.log(`✅ [CARRINHO] ${quantidadeCotas} cota(s) do bolão "${bolao.nome}" adicionada(s)`);
  return { success: true, itemId, action: 'created', expiraEm, bolaoNome: bolao.nome };
}

// ── BUSCAR CARRINHO ───────────────────────────────────────────

export async function buscarCarrinho(userId) {
  let itens;
  if (dialect === 'sqlite') {
    itens = await all(
      `SELECT c.*, b.nome as bolao_nome, b.tipo as tipo_loteria
       FROM carrinho_itens c
       LEFT JOIN boloes b ON b.id = c.bolao_id
       WHERE c.user_id = ? AND c.status = 'reservado' AND c.expira_em > datetime('now')
       ORDER BY c.criado_em DESC`,
      [userId]
    );
  } else {
    itens = await all(
      `SELECT c.*, b.nome as bolao_nome, b.tipo as tipo_loteria
       FROM carrinho_itens c
       LEFT JOIN boloes b ON b.id = c.bolao_id
       WHERE c.user_id = $1 AND c.status = 'reservado' AND c.expira_em > NOW()
       ORDER BY c.criado_em DESC`,
      [userId]
    );
  }

  const valorTotal = itens.reduce((s, i) => s + Number(i.valor_total), 0);

  return {
    success: true,
    itens: itens.map(item => ({
      id: item.id,
      bolaoId: item.bolao_id,
      bolaoNome: item.bolao_nome ?? 'Bolão',
      tipoLoteria: item.tipo_loteria ?? '',
      quantidadeCotas: item.quantidade_cotas,
      valorUnitario: Number(item.valor_unitario),
      valorTotal: Number(item.valor_total),
      expiraEm: item.expira_em,
      segundosRestantes: Math.max(0, Math.floor((new Date(item.expira_em) - Date.now()) / 1000)),
    })),
    totalItens: itens.length,
    valorTotal,
  };
}

// ── REMOVER ITEM ──────────────────────────────────────────────

export async function removerDoCarrinho({ userId, itemId }) {
  const item = await one(
    `SELECT * FROM carrinho_itens WHERE id = ${ph(1)} AND user_id = ${ph(2)} LIMIT 1`,
    [itemId, userId]
  );
  if (!item) throw new Error('Item não encontrado');

  await run(
    `UPDATE carrinho_itens SET status = 'cancelado' WHERE id = ${ph(1)}`,
    [itemId]
  );
  return { success: true, message: 'Item removido do carrinho' };
}

// ── LIMPAR CARRINHO ───────────────────────────────────────────

export async function limparCarrinho(userId) {
  if (dialect === 'sqlite') {
    await run(
      `UPDATE carrinho_itens SET status = 'cancelado' WHERE user_id = ? AND status = 'reservado'`,
      [userId]
    );
  } else {
    await run(
      `UPDATE carrinho_itens SET status = 'cancelado' WHERE user_id = $1 AND status = 'reservado'`,
      [userId]
    );
  }
  return { success: true, message: 'Carrinho limpo' };
}

// ── FINALIZAR (CHECKOUT) ──────────────────────────────────────

export async function finalizarCarrinho({ userId, formaPagamento }) {
  let itens;
  if (dialect === 'sqlite') {
    itens = await all(
      `SELECT c.*, b.nome as bolao_nome FROM carrinho_itens c
       LEFT JOIN boloes b ON b.id = c.bolao_id
       WHERE c.user_id = ? AND c.status = 'reservado' AND c.expira_em > datetime('now')`,
      [userId]
    );
  } else {
    itens = await all(
      `SELECT c.*, b.nome as bolao_nome FROM carrinho_itens c
       LEFT JOIN boloes b ON b.id = c.bolao_id
       WHERE c.user_id = $1 AND c.status = 'reservado' AND c.expira_em > NOW()`,
      [userId]
    );
  }

  if (!itens.length) throw new Error('Carrinho vazio ou expirado');

  const valorTotal = itens.reduce((s, i) => s + Number(i.valor_total), 0);

  if (dialect === 'sqlite') {
    await run(
      `UPDATE carrinho_itens SET status = 'comprado' WHERE user_id = ? AND status = 'reservado' AND expira_em > datetime('now')`,
      [userId]
    );
  } else {
    await run(
      `UPDATE carrinho_itens SET status = 'comprado' WHERE user_id = $1 AND status = 'reservado' AND expira_em > NOW()`,
      [userId]
    );
  }

  console.log(`✅ [CARRINHO] Finalizado para ${userId} — R$ ${valorTotal.toFixed(2)}`);
  return { success: true, itens, valorTotal };
}

// ── SERVIÇO DE LIMPEZA AUTOMÁTICA ─────────────────────────────

export function iniciarServicoLimpeza() {
  const limpeza = async () => {
    if (!rawDb) return;
    try {
      let r;
      if (dialect === 'sqlite') {
        r = rawDb.prepare(`UPDATE carrinho_itens SET status = 'expirado' WHERE status = 'reservado' AND expira_em < datetime('now')`).run();
        if (r.changes > 0) console.log(`🧹 [CARRINHO] ${r.changes} reserva(s) expirada(s)`);
      } else {
        const res = await rawDb.query(`UPDATE carrinho_itens SET status = 'expirado' WHERE status = 'reservado' AND expira_em < NOW()`);
        if (res.rowCount > 0) console.log(`🧹 [CARRINHO] ${res.rowCount} reserva(s) expirada(s)`);
      }
    } catch (e) {
      console.error('[CARRINHO] Erro na limpeza:', e.message);
    }
  };

  setInterval(limpeza, 30_000);
  console.log('🧹 [CARRINHO] Serviço de limpeza iniciado (a cada 30s)');
}

export default { adicionarAoCarrinho, buscarCarrinho, removerDoCarrinho, limparCarrinho, finalizarCarrinho, iniciarServicoLimpeza };
