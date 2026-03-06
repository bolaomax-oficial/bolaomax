/**
 * Admin API - CRUD de Bolões
 * 
 * Rotas protegidas para administradores gerenciarem bolões
 */

import { Router } from 'express';
import { db } from '../database';
import { boloes, users } from '../database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO (temporário - será substituído)
// ============================================================
function requireAdmin(req: any, res: any, next: any) {
  // TODO: Implementar verificação real de sessão
  // Por enquanto, aceita qualquer requisição (INSEGURO!)
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }
  
  // Mock: extrair userId do token (depois será sessão real)
  req.userId = authHeader.replace('Bearer ', '');
  next();
}

// ============================================================
// GET /api/admin/boloes - Listar todos os bolões
// ============================================================
router.get('/boloes', requireAdmin, async (req, res) => {
  try {
    const { status, tipo, page = 1, limit = 20 } = req.query;
    
    // Construir query
    let query = db.select().from(boloes);
    
    // Filtros
    const conditions = [];
    if (status) {
      conditions.push(eq(boloes.status, status as string));
    }
    if (tipo) {
      conditions.push(eq(boloes.tipo, tipo as string));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Ordenação e paginação
    const offset = (Number(page) - 1) * Number(limit);
    const allBoloes = await query
      .orderBy(desc(boloes.criadoEm))
      .limit(Number(limit))
      .offset(offset);
    
    // Contar total
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(boloes);
    
    res.json({
      boloes: allBoloes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('[API] Erro ao listar bolões:', error);
    res.status(500).json({ error: 'Erro ao listar bolões', message: error.message });
  }
});

// ============================================================
// GET /api/admin/boloes/:id - Buscar bolão por ID
// ============================================================
router.get('/boloes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bolao] = await db
      .select()
      .from(boloes)
      .where(eq(boloes.id, id))
      .limit(1);
    
    if (!bolao) {
      return res.status(404).json({ error: 'Bolão não encontrado' });
    }
    
    res.json(bolao);
  } catch (error: any) {
    console.error('[API] Erro ao buscar bolão:', error);
    res.status(500).json({ error: 'Erro ao buscar bolão', message: error.message });
  }
});

// ============================================================
// POST /api/admin/boloes - Criar novo bolão
// ============================================================
router.post('/boloes', requireAdmin, async (req, res) => {
  try {
    const {
      nome,
      descricao,
      tipo,
      concurso,
      numerosDezenas, // Array de números
      quantidadeCotas,
      valorCota,
      dataAbertura,
      dataFechamento,
      dataSorteio,
    } = req.body;
    
    // Validação básica
    if (!nome || !tipo || !numerosDezenas || !quantidadeCotas || !valorCota) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    // Criar bolão
    const novoBolao = {
      id: crypto.randomUUID(),
      nome,
      descricao: descricao || null,
      tipo,
      concurso: concurso || null,
      status: 'aberto',
      numerosDezenas: JSON.stringify(numerosDezenas),
      quantidadeCotas: Number(quantidadeCotas),
      cotasDisponiveis: Number(quantidadeCotas),
      valorCota: Number(valorCota),
      dataAbertura: dataAbertura || new Date().toISOString(),
      dataFechamento,
      dataSorteio,
      premiado: false,
      valorPremio: 0,
      criadoPor: req.userId || 'admin',
      aprovado: true,
      visualizacoes: 0,
      compartilhamentos: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    await db.insert(boloes).values(novoBolao);
    
    res.status(201).json({
      message: 'Bolão criado com sucesso',
      bolao: novoBolao,
    });
  } catch (error: any) {
    console.error('[API] Erro ao criar bolão:', error);
    res.status(500).json({ error: 'Erro ao criar bolão', message: error.message });
  }
});

// ============================================================
// PUT /api/admin/boloes/:id - Atualizar bolão
// ============================================================
router.put('/boloes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remover campos que não devem ser atualizados diretamente
    delete updates.id;
    delete updates.criadoEm;
    delete updates.criadoPor;
    
    // Adicionar timestamp de atualização
    updates.atualizadoEm = new Date().toISOString();
    
    // Converter numerosDezenas para JSON se necessário
    if (updates.numerosDezenas && Array.isArray(updates.numerosDezenas)) {
      updates.numerosDezenas = JSON.stringify(updates.numerosDezenas);
    }
    
    const result = await db
      .update(boloes)
      .set(updates)
      .where(eq(boloes.id, id));
    
    res.json({
      message: 'Bolão atualizado com sucesso',
      updated: true,
    });
  } catch (error: any) {
    console.error('[API] Erro ao atualizar bolão:', error);
    res.status(500).json({ error: 'Erro ao atualizar bolão', message: error.message });
  }
});

// ============================================================
// DELETE /api/admin/boloes/:id - Excluir bolão
// ============================================================
router.delete('/boloes/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se bolão existe
    const [bolao] = await db
      .select()
      .from(boloes)
      .where(eq(boloes.id, id))
      .limit(1);
    
    if (!bolao) {
      return res.status(404).json({ error: 'Bolão não encontrado' });
    }
    
    // Não permitir excluir bolão com participações
    // TODO: Verificar participações antes de excluir
    
    await db.delete(boloes).where(eq(boloes.id, id));
    
    res.json({
      message: 'Bolão excluído com sucesso',
      deleted: true,
    });
  } catch (error: any) {
    console.error('[API] Erro ao excluir bolão:', error);
    res.status(500).json({ error: 'Erro ao excluir bolão', message: error.message });
  }
});

// ============================================================
// GET /api/admin/stats - Estatísticas gerais
// ============================================================
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = {
      totalBoloes: await db.select({ count: sql<number>`count(*)` }).from(boloes),
      boloesAbertos: await db.select({ count: sql<number>`count(*)` }).from(boloes).where(eq(boloes.status, 'aberto')),
      boloesFechados: await db.select({ count: sql<number>`count(*)` }).from(boloes).where(eq(boloes.status, 'fechado')),
      totalUsuarios: await db.select({ count: sql<number>`count(*)` }).from(users),
    };
    
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', message: error.message });
  }
});

export default router;
