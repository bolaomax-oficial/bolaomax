/**
 * BolãoMax — Rotas da Carteira
 * GET /api/carteira/saldo
 * GET /api/carteira/transacoes
 * GET /api/carteira/recargas
 * POST /api/carteira/recarregar
 * POST /api/carteira/confirmar/:id  (sandbox: simula confirmação de pagamento)
 */

import express from 'express';
import * as carteira from '../services/carteira.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/carteira/saldo
router.get('/saldo', requireAuth, async (req, res) => {
  try {
    const dados = await carteira.buscarSaldo(req.user.id);
    res.json(dados);
  } catch (error) {
    console.error('[CARTEIRA] Erro ao buscar saldo:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/carteira/transacoes
router.get('/transacoes', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const dados = await carteira.buscarTransacoes(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(dados);
  } catch (error) {
    console.error('[CARTEIRA] Erro ao buscar transações:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/carteira/recargas
router.get('/recargas', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const dados = await carteira.buscarRecargas(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(dados);
  } catch (error) {
    console.error('[CARTEIRA] Erro ao buscar recargas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/carteira/recarregar
router.post('/recarregar', requireAuth, async (req, res) => {
  try {
    const { valor, formaPagamento, dadosPagamento } = req.body;

    if (!valor || Number(valor) <= 0) {
      return res.status(400).json({ success: false, error: 'Valor inválido' });
    }
    if (!formaPagamento || !['pix', 'credit_card', 'boleto'].includes(formaPagamento)) {
      return res.status(400).json({ success: false, error: 'Forma de pagamento inválida. Use: pix, credit_card ou boleto' });
    }

    const resultado = await carteira.solicitarRecarga({
      userId: req.user.id,
      valor: parseFloat(valor),
      formaPagamento,
      dadosPagamento: dadosPagamento || {},
    });

    res.json(resultado);
  } catch (error) {
    console.error('[CARTEIRA] Erro ao recarregar:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/carteira/confirmar/:id  (sandbox/teste)
router.post('/confirmar/:id', requireAuth, async (req, res) => {
  try {
    const resultado = await carteira.confirmarRecarga(req.params.id);
    res.json(resultado);
  } catch (error) {
    console.error('[CARTEIRA] Erro ao confirmar recarga:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
