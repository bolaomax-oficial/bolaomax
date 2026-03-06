/**
 * Rotas API - Recarga de Carteira
 * Permite usuários adicionarem saldo via PIX, Cartão ou Boleto
 */

import express from 'express';
import * as recarga from '../services/recarga-carteira.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/carteira/recarregar
 * Solicitar recarga de saldo
 */
router.post('/recarregar', requireAuth, async (req, res) => {
  try {
    const { valor, formaPagamento, dadosPagamento } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    if (!formaPagamento || !['pix', 'credit_card', 'boleto'].includes(formaPagamento)) {
      return res.status(400).json({
        success: false,
        error: 'Forma de pagamento inválida'
      });
    }
    
    const resultado = await recarga.solicitarRecarga({
      userId: req.user.id,
      valor: parseFloat(valor),
      formaPagamento,
      dadosPagamento: dadosPagamento || {}
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao recarregar:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/carteira/recargas
 * Listar histórico de recargas
 */
router.get('/recargas', requireAuth, async (req, res) => {
  try {
    const resultado = await recarga.buscarRecargas(req.user.id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao buscar recargas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar recargas'
    });
  }
});

export default router;
