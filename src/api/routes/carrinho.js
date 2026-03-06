/**
 * Rotas API - Carrinho
 * Gerenciamento do carrinho de compras
 */

import express from 'express';
import * as carrinho from '../services/carrinho.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/carrinho/adicionar
 * Adicionar item ao carrinho
 */
router.post('/adicionar', requireAuth, async (req, res) => {
  try {
    const { bolaoId, quantidadeCotas = 1 } = req.body;
    
    if (!bolaoId) {
      return res.status(400).json({
        success: false,
        error: 'bolaoId obrigatório'
      });
    }
    
    if (quantidadeCotas < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade deve ser maior que zero'
      });
    }
    
    const resultado = await carrinho.adicionarAoCarrinho({
      userId: req.user.id,
      bolaoId,
      quantidadeCotas: parseInt(quantidadeCotas)
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao adicionar ao carrinho:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/carrinho
 * Buscar carrinho do usuário
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const resultado = await carrinho.buscarCarrinho(req.user.id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao buscar carrinho:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar carrinho'
    });
  }
});

/**
 * DELETE /api/carrinho/item/:id
 * Remover item do carrinho
 */
router.delete('/item/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await carrinho.removerDoCarrinho({
      userId: req.user.id,
      itemId: id
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao remover do carrinho:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/carrinho/limpar
 * Limpar todo o carrinho
 */
router.delete('/limpar', requireAuth, async (req, res) => {
  try {
    const resultado = await carrinho.limparCarrinho(req.user.id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao limpar carrinho:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar carrinho'
    });
  }
});

/**
 * POST /api/carrinho/finalizar
 * Finalizar compra do carrinho
 */
router.post('/finalizar', requireAuth, async (req, res) => {
  try {
    const { formaPagamento } = req.body;
    
    if (!formaPagamento) {
      return res.status(400).json({
        success: false,
        error: 'Forma de pagamento obrigatória'
      });
    }
    
    const resultado = await carrinho.finalizarCarrinho({
      userId: req.user.id,
      formaPagamento
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao finalizar carrinho:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
