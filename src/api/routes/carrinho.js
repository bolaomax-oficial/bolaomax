/**
 * BolãoMax — Rotas do Carrinho
 * POST /api/carrinho/adicionar
 * GET  /api/carrinho
 * DELETE /api/carrinho/item/:id
 * DELETE /api/carrinho/limpar
 * POST /api/carrinho/finalizar    ← checkout com débito de saldo
 * GET  /api/carrinho/participacoes ← histórico de participações
 */

import express from 'express';
import * as carrinhoService from '../services/carrinho.js';
import { debitarSaldo, buscarSaldo } from '../services/carteira.js';
import { requireAuth } from '../middleware/auth.js';
import { rawDb, dialect } from '../database/connection.js';
import { randomUUID } from 'crypto';

const router = express.Router();

// ── Helpers SQL ──────────────────────────────────────────────
function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function run(sql, params = []) {
  if (!rawDb) throw new Error('DB não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  return rawDb.query(sql, params);
}

async function all(sql, params = []) {
  if (!rawDb) return [];
  if (dialect === 'sqlite') return rawDb.prepare(sql).all(...params);
  const { rows } = await rawDb.query(sql, params);
  return rows;
}

async function one(sql, params = []) {
  if (!rawDb) return null;
  if (dialect === 'sqlite') return rawDb.prepare(sql).get(...params) ?? null;
  const { rows } = await rawDb.query(sql, params);
  return rows[0] ?? null;
}

// POST /api/carrinho/adicionar
router.post('/adicionar', requireAuth, async (req, res) => {
  try {
    const { bolaoId, quantidadeCotas = 1 } = req.body;
    if (!bolaoId) return res.status(400).json({ success: false, error: 'bolaoId obrigatório' });
    if (quantidadeCotas < 1) return res.status(400).json({ success: false, error: 'Quantidade deve ser >= 1' });

    const resultado = await carrinhoService.adicionarAoCarrinho({
      userId: req.user.id,
      bolaoId,
      quantidadeCotas: parseInt(quantidadeCotas),
    });
    res.json(resultado);
  } catch (error) {
    console.error('[CARRINHO] Erro ao adicionar:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/carrinho
router.get('/', requireAuth, async (req, res) => {
  try {
    const resultado = await carrinhoService.buscarCarrinho(req.user.id);
    res.json(resultado);
  } catch (error) {
    console.error('[CARRINHO] Erro ao buscar:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar carrinho' });
  }
});

// DELETE /api/carrinho/item/:id
router.delete('/item/:id', requireAuth, async (req, res) => {
  try {
    const resultado = await carrinhoService.removerDoCarrinho({
      userId: req.user.id,
      itemId: req.params.id,
    });
    res.json(resultado);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/carrinho/limpar
router.delete('/limpar', requireAuth, async (req, res) => {
  try {
    const resultado = await carrinhoService.limparCarrinho(req.user.id);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao limpar carrinho' });
  }
});

// POST /api/carrinho/finalizar — CHECKOUT COMPLETO
router.post('/finalizar', requireAuth, async (req, res) => {
  try {
    const { formaPagamento = 'saldo' } = req.body;

    // 1. Buscar itens do carrinho
    const { itens, valorTotal } = await carrinhoService.buscarCarrinho(req.user.id);

    if (!itens || itens.length === 0) {
      return res.status(400).json({ success: false, error: 'Carrinho vazio ou expirado' });
    }

    // 2. Validar forma de pagamento
    const formasValidas = ['saldo', 'pix', 'credit_card', 'boleto'];
    if (!formasValidas.includes(formaPagamento)) {
      return res.status(400).json({ success: false, error: `Forma de pagamento inválida. Use: ${formasValidas.join(', ')}` });
    }

    // 3. Se pagamento via saldo, verificar e debitar
    if (formaPagamento === 'saldo') {
      const saldoInfo = await buscarSaldo(req.user.id);
      if (saldoInfo.saldo < valorTotal) {
        return res.status(400).json({
          success: false,
          error: `Saldo insuficiente. Saldo: R$ ${saldoInfo.saldo.toFixed(2)}, necessário: R$ ${valorTotal.toFixed(2)}`,
          saldoAtual: saldoInfo.saldo,
          valorNecessario: valorTotal,
        });
      }

      // Debitar saldo
      await debitarSaldo({
        userId: req.user.id,
        valor: valorTotal,
        descricao: `Compra de ${itens.length} bolão(ões) — ${itens.map(i => i.bolaoNome).join(', ')}`,
      });
    }

    // 4. Finalizar carrinho (marcar como comprado)
    const now = new Date().toISOString();
    let participacoesCriadas = 0;

    for (const item of itens) {
      // Criar participação no banco
      const partId = randomUUID();
      try {
        await run(
          `INSERT INTO participacoes (id, user_id, bolao_id, quantidade_cotas, valor_total, status, pagamento_confirmado, criado_em, atualizado_em)
           VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},'confirmado',1,${ph(6)},${ph(7)})`,
          [partId, req.user.id, item.bolaoId, item.quantidadeCotas, item.valorTotal, now, now]
        );

        // Reduzir cotas disponíveis no bolão
        await run(
          `UPDATE boloes SET cotas_disponiveis = cotas_disponiveis - ${ph(1)}, atualizado_em = ${ph(2)} WHERE id = ${ph(3)}`,
          [item.quantidadeCotas, now, item.bolaoId]
        );

        participacoesCriadas++;
      } catch (err) {
        console.error('[CHECKOUT] Erro ao criar participação:', err.message);
      }

      // Marcar item do carrinho como comprado
      await run(
        `UPDATE carrinho_itens SET status = 'comprado' WHERE id = ${ph(1)}`,
        [item.id]
      );
    }

    // 5. Buscar saldo atualizado
    const saldoAtualizado = await buscarSaldo(req.user.id);

    console.log(`✅ [CHECKOUT] Usuário ${req.user.id} comprou ${participacoesCriadas} participação(ões) — R$ ${valorTotal.toFixed(2)}`);

    res.json({
      success: true,
      message: `Compra realizada com sucesso! ${participacoesCriadas} participação(ões) confirmada(s).`,
      participacoes: participacoesCriadas,
      valorPago: valorTotal,
      formaPagamento,
      novoSaldo: formaPagamento === 'saldo' ? saldoAtualizado.saldo : undefined,
      itens: itens.map(i => ({
        bolaoNome: i.bolaoNome,
        quantidadeCotas: i.quantidadeCotas,
        valorTotal: i.valorTotal,
      })),
    });
  } catch (error) {
    console.error('[CHECKOUT] Erro ao finalizar:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/carrinho/participacoes — Histórico de participações
router.get('/participacoes', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let rows, countRow;
    if (dialect === 'sqlite') {
      [countRow, rows] = await Promise.all([
        one(`SELECT COUNT(*) as n FROM participacoes WHERE user_id = ?`, [req.user.id]),
        all(
          `SELECT p.*, b.nome as bolao_nome, b.tipo as tipo_loteria, b.data_sorteio, b.premiado, b.valor_premio
           FROM participacoes p
           LEFT JOIN boloes b ON b.id = p.bolao_id
           WHERE p.user_id = ?
           ORDER BY p.criado_em DESC
           LIMIT ? OFFSET ?`,
          [req.user.id, parseInt(limit), offset]
        ),
      ]);
    } else {
      [countRow, rows] = await Promise.all([
        one(`SELECT COUNT(*) as n FROM participacoes WHERE user_id = $1`, [req.user.id]),
        all(
          `SELECT p.*, b.nome as bolao_nome, b.tipo as tipo_loteria, b.data_sorteio, b.premiado, b.valor_premio
           FROM participacoes p
           LEFT JOIN boloes b ON b.id = p.bolao_id
           WHERE p.user_id = $1
           ORDER BY p.criado_em DESC
           LIMIT $2 OFFSET $3`,
          [req.user.id, parseInt(limit), offset]
        ),
      ]);
    }

    res.json({
      success: true,
      participacoes: rows.map(p => ({
        id: p.id,
        bolaoId: p.bolao_id,
        bolaoNome: p.bolao_nome ?? 'Bolão',
        tipoLoteria: p.tipo_loteria ?? '',
        quantidadeCotas: p.quantidade_cotas,
        valorTotal: Number(p.valor_total),
        status: p.status,
        formaPagamento: p.forma_pagamento,
        dataSorteio: p.data_sorteio,
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
    console.error('[CARRINHO] Erro ao buscar participações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
