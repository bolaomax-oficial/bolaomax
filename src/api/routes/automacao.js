/**
 * Rotas de Automação de Bolões
 * 
 * Permite admin controlar o sistema de automação
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as automacaoService from '../services/automacao-boloes.js';
import { statusCronJobs } from '../cron-jobs.js';

const router = express.Router();

// Middleware: apenas admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Apenas administradores podem acessar',
      code: 'FORBIDDEN',
    });
  }
  next();
};

/**
 * GET /api/admin/automacao/configuracoes
 * Buscar configurações de automação
 */
router.get('/configuracoes', requireAuth, requireAdmin, (req, res) => {
  try {
    const config = automacaoService.buscarConfiguracoes();
    
    res.json({
      success: true,
      configuracoes: config,
    });
  } catch (error) {
    console.error('[API] Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar configurações',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * PUT /api/admin/automacao/configuracoes
 * Atualizar configurações de automação
 */
router.put('/configuracoes', requireAuth, requireAdmin, (req, res) => {
  try {
    const config = automacaoService.atualizarConfiguracoes(req.body);
    
    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      configuracoes: config,
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar configurações',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/automacao/executar-agora
 * Executar todas as tarefas de automação manualmente
 */
router.post('/executar-agora', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log(`[API] Execução manual iniciada por ${req.user.email}`);
    
    const resultado = await automacaoService.executarTodasTarefasAutomacao();
    
    res.json({
      success: true,
      message: 'Automação executada com sucesso',
      ...resultado,
    });
  } catch (error) {
    console.error('[API] Erro ao executar automação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao executar automação',
      details: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/automacao/encerrar-expirados
 * Encerrar apenas bolões expirados
 */
router.post('/encerrar-expirados', requireAuth, requireAdmin, (req, res) => {
  try {
    const resultado = automacaoService.encerrarBoloesExpirados();
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao encerrar bolões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao encerrar bolões',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/automacao/ativar-proximos
 * Ativar bolões do próximo ciclo manualmente
 */
router.post('/ativar-proximos', requireAuth, requireAdmin, (req, res) => {
  try {
    const resultado = automacaoService.ativarNovosBoloesProximoCiclo();
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao ativar bolões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao ativar bolões',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/automacao/atualizar-visibilidade
 * Atualizar visibilidade dos bolões
 */
router.post('/atualizar-visibilidade', requireAuth, requireAdmin, (req, res) => {
  try {
    const resultado = automacaoService.atualizarVisibilidadeBoloes();
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao atualizar visibilidade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar visibilidade',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/automacao/processar-especiais
 * Processar bolões especiais
 */
router.post('/processar-especiais', requireAuth, requireAdmin, (req, res) => {
  try {
    const resultado = automacaoService.processarBoloesEspeciais();
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao processar especiais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar especiais',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/admin/automacao/historico
 * Buscar histórico de execuções
 */
router.get('/historico', requireAuth, requireAdmin, (req, res) => {
  try {
    const filtros = {
      tipo_acao: req.query.tipo_acao,
      bolao_id: req.query.bolao_id,
      data_inicial: req.query.data_inicial,
      data_final: req.query.data_final,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const historico = automacaoService.buscarHistorico(filtros);
    
    res.json({
      success: true,
      historico,
      total: historico.length,
    });
  } catch (error) {
    console.error('[API] Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar histórico',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/admin/automacao/status
 * Status do sistema de automação (Cron Jobs)
 */
router.get('/status', requireAuth, requireAdmin, (req, res) => {
  try {
    const config = automacaoService.buscarConfiguracoes();
    const cronStatus = statusCronJobs();
    
    res.json({
      success: true,
      status: {
        sistema: config.status_sistema,
        encerramento_automatico: config.encerrar_automaticamente === 1,
        ativacao_automatica: config.ativar_novos_boloes_automaticamente === 1,
        horario_ativacao: config.horario_ativacao_diaria,
        ultima_execucao: config.ultima_execucao_cron,
        proxima_execucao: config.proxima_execucao_cron,
        cron_jobs: cronStatus,
      },
    });
  } catch (error) {
    console.error('[API] Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar status',
      code: 'SERVER_ERROR',
    });
  }
});

export default router;
