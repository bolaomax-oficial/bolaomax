/**
 * BolãoMax — Rotas Públicas de Bolões
 * GET /api/boloes              — listar bolões ativos (público)
 * GET /api/boloes/:id          — detalhes de um bolão (público)
 * GET /api/boloes/tipos        — listar tipos disponíveis (público)
 * POST /api/boloes             — criar bolão (admin)
 * PUT /api/boloes/:id          — atualizar bolão (admin)
 * DELETE /api/boloes/:id       — excluir bolão (admin)
 * PATCH /api/boloes/:id/status — alterar status (admin)
 * POST /api/boloes/:id/duplicar — duplicar bolão (admin)
 */

import express from 'express';
import * as boloes from '../services/boloes.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Middleware admin local
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Acesso restrito a administradores' });
  }
  next();
}

// ── GET /api/boloes ── público
router.get('/', async (req, res) => {
  try {
    const { status = 'aberto', tipo, page = 1, limit = 20, search } = req.query;
    const result = await boloes.listarBoloes({
      status,
      tipo,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json(result);
  } catch (error) {
    console.error('[BOLOES] Erro ao listar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/boloes/tipos ── público
router.get('/tipos', async (_req, res) => {
  res.json({
    success: true,
    tipos: [
      { id: 'megasena',  nome: 'Mega-Sena',    icon: '🍀' },
      { id: 'lotofacil', nome: 'Lotofácil',     icon: '🌸' },
      { id: 'quina',     nome: 'Quina',         icon: '⭐' },
      { id: 'lotomania', nome: 'Lotomania',     icon: '🎯' },
      { id: 'timemania', nome: 'Timemania',     icon: '⚽' },
      { id: 'duplasena', nome: 'Dupla Sena',    icon: '🎲' },
      { id: 'diadesorte',nome: 'Dia de Sorte',  icon: '🍀' },
      { id: 'federal',   nome: 'Federal',       icon: '🎫' },
    ],
  });
});

// ── GET /api/boloes/stats ── admin
router.get('/stats', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const stats = await boloes.estatisticas();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/boloes/:id ── público
router.get('/:id', async (req, res) => {
  try {
    const bolao = await boloes.buscarBolaoPorId(req.params.id);
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    res.json({ success: true, bolao });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/boloes ── admin
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bolao = await boloes.criarBolao({ ...req.body, criadoPor: req.user.id });
    res.status(201).json({ success: true, bolao });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── PUT /api/boloes/:id ── admin
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bolao = await boloes.atualizarBolao(req.params.id, req.body);
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    res.json({ success: true, bolao });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── DELETE /api/boloes/:id ── admin
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await boloes.excluirBolao(req.params.id);
    res.json({ success: true, message: 'Bolão excluído' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── PATCH /api/boloes/:id/status ── admin
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status obrigatório' });
    const bolao = await boloes.alterarStatus(req.params.id, status);
    res.json({ success: true, bolao });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── POST /api/boloes/:id/duplicar ── admin
router.post('/:id/duplicar', requireAuth, requireAdmin, async (req, res) => {
  try {
    const bolao = await boloes.duplicarBolao(req.params.id);
    res.status(201).json({ success: true, bolao });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ── POST /api/boloes/seed ── admin (inicializar dados)
router.post('/seed', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await boloes.seedBoloes(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
