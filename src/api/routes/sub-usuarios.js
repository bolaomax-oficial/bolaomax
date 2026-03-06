/**
 * Rotas API - Sub-Usuários
 * Gerenciamento de equipe com permissões granulares
 */

import express from 'express';
import * as subUsuarios from '../services/sub-usuarios.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/admin/sub-usuarios
 * Listar todos os sub-usuários
 */
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const resultado = await subUsuarios.listarSubUsuarios(req.user.id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao listar sub-usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar sub-usuários'
    });
  }
});

/**
 * GET /api/admin/sub-usuarios/:id
 * Buscar sub-usuário específico
 */
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await subUsuarios.buscarSubUsuario(id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao buscar sub-usuário:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/admin/sub-usuarios
 * Criar novo sub-usuário
 */
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { nome, email, senha, telefone, cargo, permissoes } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres'
      });
    }
    
    const resultado = await subUsuarios.criarSubUsuario({
      nome,
      email,
      senha,
      telefone,
      cargo,
      permissoes: permissoes || [],
      criadoPor: req.user.id
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao criar sub-usuário:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/sub-usuarios/:id
 * Atualizar dados do sub-usuário
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cargo, senha } = req.body;
    
    const resultado = await subUsuarios.atualizarSubUsuario({
      id,
      nome,
      email,
      telefone,
      cargo,
      senha
    });
    
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao atualizar sub-usuário:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/admin/sub-usuarios/:id/permissoes
 * Atualizar permissões do sub-usuário
 */
router.put('/:id/permissoes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;
    
    if (!Array.isArray(permissoes)) {
      return res.status(400).json({
        success: false,
        error: 'Permissões devem ser um array'
      });
    }
    
    const resultado = await subUsuarios.atualizarPermissoes(id, permissoes);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao atualizar permissões:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/admin/sub-usuarios/:id/status
 * Alterar status (ativar/desativar/bloquear)
 */
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['ativo', 'inativo', 'bloqueado'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido'
      });
    }
    
    const resultado = await subUsuarios.alterarStatus(id, status);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao alterar status:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/admin/sub-usuarios/:id
 * Excluir sub-usuário
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await subUsuarios.excluirSubUsuario(id);
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao excluir sub-usuário:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/sub-usuarios/roles
 * Buscar roles pré-definidas (templates)
 */
router.get('/roles/templates', requireAuth, requireAdmin, async (req, res) => {
  try {
    const resultado = await subUsuarios.buscarRoles();
    res.json(resultado);
  } catch (error) {
    console.error('[API] Erro ao buscar roles:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar roles'
    });
  }
});

export default router;
