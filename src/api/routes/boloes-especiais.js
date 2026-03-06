/**
 * Rotas de Bolões Especiais
 * 
 * CRUD completo para gerenciar bolões especiais no Admin
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import * as boloesEspeciaisService from '../services/boloes-especiais.js';

const router = express.Router();

// ============================================================
// MIDDLEWARE: Apenas admin pode gerenciar bolões especiais
// ============================================================
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Apenas administradores podem gerenciar bolões especiais',
      code: 'FORBIDDEN',
    });
  }
  next();
};

// ============================================================
// ROTAS PÚBLICAS (visualização)
// ============================================================

/**
 * GET /api/boloes-especiais/visiveis
 * Listar bolões especiais visíveis (frontend público)
 */
router.get('/visiveis', (req, res) => {
  try {
    const boloes = boloesEspeciaisService.listarBoloesEspeciaisVisiveis();
    
    res.json({
      success: true,
      boloesEspeciais: boloes,
    });
  } catch (error) {
    console.error('[API] Erro ao listar bolões especiais visíveis:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar bolões especiais',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/boloes-especiais/:id
 * Buscar bolão especial específico
 */
router.get('/:id', (req, res) => {
  try {
    const bolao = boloesEspeciaisService.buscarBolaoEspecialPorId(req.params.id);
    
    if (!bolao) {
      return res.status(404).json({
        success: false,
        error: 'Bolão especial não encontrado',
        code: 'NOT_FOUND',
      });
    }
    
    res.json({
      success: true,
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao buscar bolão especial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar bolão especial',
      code: 'SERVER_ERROR',
    });
  }
});

// ============================================================
// ROTAS ADMIN (protegidas)
// ============================================================

/**
 * GET /api/admin/boloes-especiais
 * Listar todos os bolões especiais (admin)
 */
router.get('/admin/lista', requireAuth, requireAdmin, (req, res) => {
  try {
    const filtros = {
      tipo_especial: req.query.tipo_especial,
      ano: req.query.ano ? parseInt(req.query.ano) : undefined,
      status: req.query.status,
      visivel: req.query.visivel === 'true' ? true : req.query.visivel === 'false' ? false : undefined,
    };

    const boloes = boloesEspeciaisService.listarBoloesEspeciais(filtros);
    
    res.json({
      success: true,
      boloesEspeciais: boloes,
      total: boloes.length,
    });
  } catch (error) {
    console.error('[API] Erro ao listar bolões especiais (admin):', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar bolões especiais',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/boloes-especiais
 * Criar novo bolão especial
 */
router.post('/admin/criar', requireAuth, requireAdmin, (req, res) => {
  try {
    const {
      tipo_especial,
      nome,
      descricao,
      ano,
      tipo_loteria,
      concurso,
      numeros_dezenas,
      quantidade_cotas,
      valor_cota,
      data_inicio_vendas,
      data_fim_vendas,
      data_sorteio,
      status,
      visivel,
      metadados,
    } = req.body;

    // Validações
    if (!tipo_especial || !nome || !ano || !tipo_loteria) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: tipo_especial, nome, ano, tipo_loteria',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!numeros_dezenas || !Array.isArray(numeros_dezenas) || numeros_dezenas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'numeros_dezenas deve ser um array não vazio',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!quantidade_cotas || quantidade_cotas <= 0) {
      return res.status(400).json({
        success: false,
        error: 'quantidade_cotas deve ser maior que zero',
        code: 'VALIDATION_ERROR',
      });
    }

    if (!valor_cota || valor_cota <= 0) {
      return res.status(400).json({
        success: false,
        error: 'valor_cota deve ser maior que zero',
        code: 'VALIDATION_ERROR',
      });
    }

    const bolao = boloesEspeciaisService.criarBolaoEspecial(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Bolão especial criado com sucesso',
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao criar bolão especial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar bolão especial',
      details: error.message,
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * POST /api/admin/boloes-especiais/template
 * Criar bolão a partir de template
 */
router.post('/admin/criar-template', requireAuth, requireAdmin, (req, res) => {
  try {
    const { tipo_especial, ...dadosAdicionais } = req.body;

    if (!tipo_especial) {
      return res.status(400).json({
        success: false,
        error: 'tipo_especial é obrigatório',
        code: 'VALIDATION_ERROR',
      });
    }

    const bolao = boloesEspeciaisService.criarBolaoAPartirDeTemplate(
      tipo_especial,
      dadosAdicionais,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      message: 'Bolão especial criado a partir do template',
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao criar bolão a partir de template:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao criar bolão especial',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * PUT /api/admin/boloes-especiais/:id
 * Atualizar bolão especial
 */
router.put('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const bolao = boloesEspeciaisService.atualizarBolaoEspecial(
      req.params.id,
      req.body
    );
    
    res.json({
      success: true,
      message: 'Bolão especial atualizado com sucesso',
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar bolão especial:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao atualizar bolão especial',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * PATCH /api/admin/boloes-especiais/:id/status
 * Alterar status
 */
router.patch('/admin/:id/status', requireAuth, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status é obrigatório',
        code: 'VALIDATION_ERROR',
      });
    }

    const bolao = boloesEspeciaisService.alterarStatusBolaoEspecial(
      req.params.id,
      status
    );
    
    res.json({
      success: true,
      message: 'Status alterado com sucesso',
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao alterar status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao alterar status',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * PATCH /api/admin/boloes-especiais/:id/visibilidade
 * Alterar visibilidade
 */
router.patch('/admin/:id/visibilidade', requireAuth, requireAdmin, (req, res) => {
  try {
    const { visivel } = req.body;

    if (visivel === undefined) {
      return res.status(400).json({
        success: false,
        error: 'visivel é obrigatório',
        code: 'VALIDATION_ERROR',
      });
    }

    const bolao = boloesEspeciaisService.alterarVisibilidadeBolaoEspecial(
      req.params.id,
      visivel
    );
    
    res.json({
      success: true,
      message: 'Visibilidade alterada com sucesso',
      bolaoEspecial: bolao,
    });
  } catch (error) {
    console.error('[API] Erro ao alterar visibilidade:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao alterar visibilidade',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * DELETE /api/admin/boloes-especiais/:id
 * Excluir bolão especial (soft delete)
 */
router.delete('/admin/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const result = boloesEspeciaisService.excluirBolaoEspecial(req.params.id);
    
    res.json(result);
  } catch (error) {
    console.error('[API] Erro ao excluir bolão especial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir bolão especial',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/admin/boloes-especiais/templates
 * Listar templates disponíveis
 */
router.get('/admin/templates/lista', requireAuth, requireAdmin, (req, res) => {
  try {
    const templates = boloesEspeciaisService.buscarTemplates();
    
    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('[API] Erro ao listar templates:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar templates',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * GET /api/admin/boloes-especiais/estatisticas
 * Buscar estatísticas
 */
router.get('/admin/estatisticas/dados', requireAuth, requireAdmin, (req, res) => {
  try {
    const stats = boloesEspeciaisService.buscarEstatisticasBoloesEspeciais();
    
    res.json({
      success: true,
      estatisticas: stats,
    });
  } catch (error) {
    console.error('[API] Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      code: 'SERVER_ERROR',
    });
  }
});

export default router;
