/**
 * Rotas API - Sistema Financeiro
 * Carteira virtual, saques, histórico
 */

import express from 'express';
import * as financeiro from '../services/financeiro.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// CARTEIRA VIRTUAL (Usuário)
// ============================================================

/**
 * GET /api/financeiro/saldo
 * Consultar saldo da carteira
 */
router.get('/saldo', requireAuth, async (req, res) => {
  try {
    // Saldo já vem no req.user, mas vamos buscar atualizado
    const user = await db.select().from(schema.users)
      .where(eq(schema.users.id, req.user.id))
      .limit(1);
    
    res.json({
      success: true,
      saldo: user[0]?.saldo || 0,
      saldoFormatado: `R$ ${(user[0]?.saldo || 0).toFixed(2).replace('.', ',')}`
    });
  } catch (error) {
    console.error('[API] Erro ao consultar saldo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao consultar saldo'
    });
  }
});

/**
 * GET /api/financeiro/extrato
 * Extrato de transações
 */
router.get('/extrato', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo } = req.query;
    
    // Buscar transações do usuário
    const transacoes = await db.select().from(schema.transactions)
      .where(eq(schema.transactions.userId, req.user.id))
      .orderBy(desc(schema.transactions.criadoEm))
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));
    
    res.json({
      success: true,
      transacoes: transacoes.map(t => ({
        id: t.id,
        tipo: t.tipo,
        valor: t.valor,
        saldoAnterior: t.saldoAnterior,
        saldoNovo: t.saldoNovo,
        descricao: t.descricao,
        status: t.status,
        data: t.criadoEm
      })),
      page: parseInt(page),
      hasMore: transacoes.length === parseInt(limit)
    });
  } catch (error) {
    console.error('[API] Erro ao buscar extrato:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar extrato'
    });
  }
});

// ============================================================
// SAQUES
// ============================================================

/**
 * POST /api/financeiro/saque
 * Solicitar saque
 */
router.post('/saque', requireAuth, async (req, res) => {
  try {
    const { valor, tipoConta, chavePix, banco, agencia, conta, tipoConta2 } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    const dadosBancarios = {};
    
    if (tipoConta === 'pix') {
      if (!chavePix) {
        return res.status(400).json({
          success: false,
          error: 'Chave PIX obrigatória'
        });
      }
      dadosBancarios.chavePix = chavePix;
    } else {
      if (!banco || !agencia || !conta) {
        return res.status(400).json({
          success: false,
          error: 'Dados bancários incompletos'
        });
      }
      dadosBancarios.banco = banco;
      dadosBancarios.agencia = agencia;
      dadosBancarios.conta = conta;
      dadosBancarios.tipoConta2 = tipoConta2;
    }
    
    const resultado = await financeiro.solicitarSaque({
      userId: req.user.id,
      valor,
      tipoConta,
      dadosBancarios
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao solicitar saque:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/financeiro/saques
 * Listar saques do usuário
 */
router.get('/saques', requireAuth, async (req, res) => {
  try {
    const saques = await db.select().from(schema.saques)
      .where(eq(schema.saques.userId, req.user.id))
      .orderBy(desc(schema.saques.dataSolicitacao));
    
    res.json({
      success: true,
      saques: saques.map(s => ({
        id: s.id,
        valorSolicitado: s.valorSolicitado,
        valorTaxa: s.valorTaxa,
        valorLiquido: s.valorLiquido,
        tipoConta: s.tipoConta,
        status: s.status,
        dataSolicitacao: s.dataSolicitacao,
        dataConclusao: s.dataConclusao
      }))
    });
  } catch (error) {
    console.error('[API] Erro ao listar saques:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar saques'
    });
  }
});

// ============================================================
// ADMIN - GESTÃO FINANCEIRA
// ============================================================

/**
 * GET /api/financeiro/admin/dashboard
 * Dashboard financeiro completo
 */
router.get('/admin/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Buscar dados do fundo
    const statusFundo = await financeiro.monitorarFundo();
    
    // Buscar estatísticas
    const totalUsuarios = await db.select({
      count: sql`COUNT(*)`,
      totalSaldo: sql`SUM(saldo)`
    }).from(schema.users);
    
    const transacoesHoje = await db.select({
      count: sql`COUNT(*)`,
      total: sql`SUM(valor)`
    }).from(schema.transactions)
      .where(sql`DATE(criado_em) = CURRENT_DATE`);
    
    const saqesPendentes = await db.select({
      count: sql`COUNT(*)`,
      total: sql`SUM(valor_solicitado)`
    }).from(schema.saques)
      .where(eq(schema.saques.status, 'solicitado'));
    
    res.json({
      success: true,
      fundo: statusFundo,
      usuarios: {
        total: totalUsuarios[0]?.count || 0,
        saldoTotal: totalUsuarios[0]?.totalSaldo || 0
      },
      transacoesHoje: {
        quantidade: transacoesHoje[0]?.count || 0,
        valor: transacoesHoje[0]?.total || 0
      },
      saquesPendentes: {
        quantidade: saqesPendentes[0]?.count || 0,
        valor: saqesPendentes[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('[API] Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar dashboard'
    });
  }
});


/**
 * POST /api/financeiro/admin/fundo/inicializar
 * Inicializar o fundo com capital inicial
 */
router.post('/admin/fundo/inicializar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { valor } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    const resultado = await financeiro.inicializarFundo(valor);
    
    res.json({
      success: true,
      message: `Fundo inicializado com R$ ${valor}`,
      fundo: resultado
    });
  } catch (error) {
    console.error('[API] Erro ao inicializar fundo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao inicializar fundo'
    });
  }
});

/**
 * POST /api/financeiro/admin/fundo/aportar
 * Aportar capital no fundo
 */
router.post('/admin/fundo/aportar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { valor } = req.body;
    
    if (!valor || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido'
      });
    }
    
    const resultado = await financeiro.adicionarAoFundo(valor, 'aporte_manual');
    
    res.json({
      success: true,
      message: `Aporte de R$ ${valor} realizado com sucesso`,
      novoSaldo: resultado.novoSaldo
    });
  } catch (error) {
    console.error('[API] Erro ao aportar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao realizar aporte'
    });
  }
});

/**
 * GET /api/financeiro/admin/saques-pendentes
 * Listar saques pendentes de aprovação
 */
router.get('/admin/saques-pendentes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const saques = await db.select().from(schema.saques)
      .where(eq(schema.saques.status, 'solicitado'))
      .orderBy(schema.saques.dataSolicitacao);
    
    res.json({
      success: true,
      saques: saques.map(s => ({
        id: s.id,
        userId: s.userId,
        valorSolicitado: s.valorSolicitado,
        valorLiquido: s.valorLiquido,
        tipoConta: s.tipoConta,
        chavePix: s.chavePix,
        banco: s.banco,
        agencia: s.agencia,
        conta: s.conta,
        dataSolicitacao: s.dataSolicitacao
      }))
    });
  } catch (error) {
    console.error('[API] Erro ao listar saques pendentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar saques'
    });
  }
});

/**
 * POST /api/financeiro/admin/saque/:id/aprovar
 * Aprovar saque
 */
router.post('/admin/saque/:id/aprovar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(schema.saques)
      .set({
        status: 'aprovado',
        dataAprovacao: new Date(),
        apronadoPor: req.user.id
      })
      .where(eq(schema.saques.id, id));
    
    res.json({
      success: true,
      message: 'Saque aprovado'
    });
  } catch (error) {
    console.error('[API] Erro ao aprovar saque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao aprovar saque'
    });
  }
});

/**
 * POST /api/financeiro/admin/reconciliar
 * Executar reconciliação financeira
 */
router.post('/admin/reconciliar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const resultado = await financeiro.reconciliarFinanceiro();
    
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    console.error('[API] Erro na reconciliação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao reconciliar'
    });
  }
});

export default router;
