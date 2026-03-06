/**
 * Rotas API - Pagar.me (Stone)
 * Endpoints para processar pagamentos
 */

import express from 'express';
import * as pagarme from '../services/pagarme.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// CONFIGURAÇÃO E TESTE
// ============================================================

/**
 * GET /api/pagarme/test-connection
 * Testar conexão com Pagar.me
 */
router.get('/test-connection', requireAuth, async (req, res) => {
  try {
    const result = await pagarme.testConnection();
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao testar conexão Pagar.me:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar conexão'
    });
  }
});

// ============================================================
// TRANSAÇÕES PIX
// ============================================================

/**
 * POST /api/pagarme/pix
 * Criar transação PIX
 */
router.post('/pix', requireAuth, async (req, res) => {
  try {
    const { amount, bolaoId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    const customer = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      cpf: req.user.cpf
    };
    
    const result = await pagarme.createPixTransaction({
      amount,
      customer,
      metadata: {
        userId: req.user.id,
        bolaoId,
        type: 'compra_cota'
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao criar PIX:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento PIX'
    });
  }
});

// ============================================================
// TRANSAÇÕES CARTÃO DE CRÉDITO
// ============================================================

/**
 * POST /api/pagarme/credit-card
 * Criar transação com cartão de crédito
 */
router.post('/credit-card', requireAuth, async (req, res) => {
  try {
    const { amount, installments = 1, cardHash, bolaoId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    if (!cardHash) {
      return res.status(400).json({
        success: false,
        error: 'Dados do cartão não fornecidos'
      });
    }
    
    const customer = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      cpf: req.user.cpf,
      telefone: req.user.telefone,
      address: req.user.address
    };
    
    const result = await pagarme.createCreditCardTransaction({
      amount,
      installments,
      cardHash,
      customer,
      metadata: {
        userId: req.user.id,
        bolaoId,
        type: 'compra_cota'
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao processar cartão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar pagamento com cartão'
    });
  }
});

// ============================================================
// TRANSAÇÕES BOLETO
// ============================================================

/**
 * POST /api/pagarme/boleto
 * Criar transação com boleto
 */
router.post('/boleto', requireAuth, async (req, res) => {
  try {
    const { amount, bolaoId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    const customer = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      cpf: req.user.cpf
    };
    
    const result = await pagarme.createBoletoTransaction({
      amount,
      customer,
      metadata: {
        userId: req.user.id,
        bolaoId,
        type: 'compra_cota'
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao criar boleto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar boleto'
    });
  }
});

// ============================================================
// CONSULTAR STATUS
// ============================================================

/**
 * GET /api/pagarme/transaction/:id
 * Consultar status de transação
 */
router.get('/transaction/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pagarme.getTransactionStatus(id);
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao consultar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar transação'
    });
  }
});

// ============================================================
// LISTAR TRANSAÇÕES (ADMIN)
// ============================================================

/**
 * GET /api/pagarme/transactions
 * Listar transações (admin)
 */
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    // TODO: Adicionar middleware requireAdmin
    
    const { page = 1, count = 10, status } = req.query;
    
    const result = await pagarme.listTransactions({
      page: parseInt(page),
      count: parseInt(count),
      status
    });
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao listar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar transações'
    });
  }
});

// ============================================================
// WEBHOOK
// ============================================================

/**
 * POST /api/webhooks/pagarme
 * Receber webhooks do Pagar.me
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature'];
    const payload = JSON.parse(req.body.toString());
    
    const result = await pagarme.processWebhook(payload, signature);
    
    if (result.needsUpdate) {
      // TODO: Atualizar status da transação no database
      console.log('[WEBHOOK] Transação precisa ser atualizada:', result);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erro ao processar webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook'
    });
  }
});

// ============================================================
// ASSINATURAS (CLUBE VIP)
// ============================================================

/**
 * POST /api/pagarme/subscription
 * Criar assinatura
 */
router.post('/subscription', requireAuth, async (req, res) => {
  try {
    const { planId, cardHash } = req.body;
    
    if (!planId || !cardHash) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID e dados do cartão são obrigatórios'
      });
    }
    
    const customer = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      cpf: req.user.cpf
    };
    
    const result = await pagarme.createSubscription({
      planId,
      customer,
      cardHash,
      metadata: {
        userId: req.user.id,
        type: 'clube_vip'
      }
    });
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao criar assinatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar assinatura'
    });
  }
});

/**
 * DELETE /api/pagarme/subscription/:id
 * Cancelar assinatura
 */
router.delete('/subscription/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Verificar se a assinatura pertence ao usuário
    
    const result = await pagarme.cancelSubscription(id);
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao cancelar assinatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao cancelar assinatura'
    });
  }
});

export default router;
