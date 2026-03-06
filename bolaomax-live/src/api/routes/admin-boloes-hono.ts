/**
 * Admin API - CRUD de Bolões (Hono)
 * 
 * Rotas para administradores gerenciarem bolões
 * Usando armazenamento em memória para compatibilidade com Cloudflare Workers
 * 
 * PROTEÇÃO: Todas as rotas requerem autenticação JWT com role = admin
 */

import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import crypto from 'crypto';
import { validateSession, UserRecord } from '../auth/auth-store';

// ============================================================
// Types
// ============================================================
interface BolaoRecord {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  concurso: number | null;
  status: string;
  numerosDezenas: string;
  quantidadeCotas: number;
  cotasDisponiveis: number;
  valorCota: number;
  dataAbertura: string;
  dataFechamento: string;
  dataSorteio: string;
  premiado: boolean;
  valorPremio: number;
  faixaPremio: string | null;
  acertos: number | null;
  criadoPor: string;
  aprovado: boolean;
  aprovadoPor: string | null;
  visualizacoes: number;
  compartilhamentos: number;
  metadados: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// Extend Hono context with authenticated user
type Variables = {
  user: UserRecord;
};

const app = new Hono<{ Variables: Variables }>();

// ============================================================
// Admin Authentication Middleware
// ============================================================
const adminAuthMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  // Get Authorization header
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Token de autenticação não fornecido',
      code: 'NO_TOKEN',
    }, 401);
  }

  const token = authHeader.substring(7);

  // Validate session
  const result = validateSession(token);

  if (!result.valid || !result.user) {
    return c.json({
      success: false,
      error: result.error || 'Sessão inválida ou expirada',
      code: 'INVALID_SESSION',
    }, 401);
  }

  // Check if user is admin
  if (result.user.role !== 'admin') {
    return c.json({
      success: false,
      error: 'Acesso negado. Permissão de administrador necessária.',
      code: 'FORBIDDEN',
    }, 403);
  }

  // Attach user to context for use in routes
  c.set('user', result.user);

  await next();
});

// Apply admin auth middleware to all routes
app.use('/*', adminAuthMiddleware);

// ============================================================
// In-memory store for bolões (initialized with seed data)
// ============================================================
const boloesStore = new Map<string, BolaoRecord>();

// Initialize with seed data
const seedBoloes: BolaoRecord[] = [
  {
    id: 'bolao-seed-001',
    nome: 'Mega da Virada 2024',
    descricao: 'Bolão especial de final de ano',
    tipo: 'megasena',
    concurso: 2856,
    status: 'aberto',
    numerosDezenas: JSON.stringify([7, 15, 23, 38, 42, 58]),
    quantidadeCotas: 100,
    cotasDisponiveis: 65,
    valorCota: 50,
    dataAbertura: '2024-12-01T10:00:00Z',
    dataFechamento: '2024-12-31T17:00:00Z',
    dataSorteio: '2024-12-31T20:00:00Z',
    premiado: false,
    valorPremio: 550000000,
    faixaPremio: null,
    acertos: null,
    criadoPor: 'admin',
    aprovado: true,
    aprovadoPor: 'admin',
    visualizacoes: 1250,
    compartilhamentos: 85,
    metadados: null,
    criadoEm: '2024-12-01T10:00:00Z',
    atualizadoEm: '2024-12-15T14:30:00Z',
  },
  {
    id: 'bolao-seed-002',
    nome: 'Lotofácil Especial',
    descricao: 'Bolão semanal da Lotofácil',
    tipo: 'lotofacil',
    concurso: 3245,
    status: 'aberto',
    numerosDezenas: JSON.stringify([1, 2, 3, 5, 7, 9, 10, 11, 13, 15, 17, 18, 20, 22, 25]),
    quantidadeCotas: 50,
    cotasDisponiveis: 28,
    valorCota: 25,
    dataAbertura: '2024-12-15T08:00:00Z',
    dataFechamento: '2024-12-20T18:00:00Z',
    dataSorteio: '2024-12-20T20:00:00Z',
    premiado: false,
    valorPremio: 3500000,
    faixaPremio: null,
    acertos: null,
    criadoPor: 'admin',
    aprovado: true,
    aprovadoPor: 'admin',
    visualizacoes: 456,
    compartilhamentos: 23,
    metadados: null,
    criadoEm: '2024-12-15T08:00:00Z',
    atualizadoEm: '2024-12-15T08:00:00Z',
  },
  {
    id: 'bolao-seed-003',
    nome: 'Quina de São João',
    descricao: 'Bolão especial São João',
    tipo: 'quina',
    concurso: 6523,
    status: 'aberto',
    numerosDezenas: JSON.stringify([12, 25, 37, 48, 62]),
    quantidadeCotas: 80,
    cotasDisponiveis: 12,
    valorCota: 30,
    dataAbertura: '2025-06-01T10:00:00Z',
    dataFechamento: '2025-06-24T18:00:00Z',
    dataSorteio: '2025-06-24T20:00:00Z',
    premiado: false,
    valorPremio: 10000000,
    faixaPremio: null,
    acertos: null,
    criadoPor: 'admin',
    aprovado: true,
    aprovadoPor: 'admin',
    visualizacoes: 320,
    compartilhamentos: 45,
    metadados: null,
    criadoEm: '2025-01-15T10:00:00Z',
    atualizadoEm: '2025-01-15T10:00:00Z',
  },
  {
    id: 'bolao-seed-004',
    nome: 'Mega Milhões Semanal',
    descricao: 'Bolão semanal Mega-Sena',
    tipo: 'megasena',
    concurso: 2855,
    status: 'em_andamento',
    numerosDezenas: JSON.stringify([5, 18, 27, 34, 45, 60]),
    quantidadeCotas: 120,
    cotasDisponiveis: 45,
    valorCota: 40,
    dataAbertura: '2024-12-18T08:00:00Z',
    dataFechamento: '2024-12-22T17:00:00Z',
    dataSorteio: '2024-12-22T20:00:00Z',
    premiado: false,
    valorPremio: 45000000,
    faixaPremio: null,
    acertos: null,
    criadoPor: 'admin',
    aprovado: true,
    aprovadoPor: 'admin',
    visualizacoes: 892,
    compartilhamentos: 67,
    metadados: null,
    criadoEm: '2024-12-18T08:00:00Z',
    atualizadoEm: '2024-12-20T12:00:00Z',
  },
];

// Initialize store with seed data
seedBoloes.forEach(bolao => {
  boloesStore.set(bolao.id, bolao);
});

// ============================================================
// GET /admin/boloes/stats/summary - Estatísticas gerais
// (Must be before /:id to avoid being caught by the param route)
// ============================================================
app.get('/stats/summary', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[ADMIN] Stats requested by: ${user.email}`);

    const allBoloes = Array.from(boloesStore.values());
    
    const stats = {
      totalBoloes: allBoloes.length,
      boloesAbertos: allBoloes.filter(b => b.status === 'aberto').length,
      boloesFechados: allBoloes.filter(b => b.status === 'fechado').length,
      boloesEmAndamento: allBoloes.filter(b => b.status === 'em_andamento').length,
      totalUsuarios: 150, // Mock value
    };
    
    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[API] Erro ao buscar estatísticas:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /admin/boloes - Listar todos os bolões
// ============================================================
app.get('/', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[ADMIN] Bolões list requested by: ${user.email}`);

    const status = c.req.query('status');
    const tipo = c.req.query('tipo');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const search = c.req.query('search');
    
    // Get all bolões
    let allBoloes = Array.from(boloesStore.values());
    
    // Sort by criadoEm descending
    allBoloes.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    
    // Apply filters
    if (status && status !== 'todos') {
      allBoloes = allBoloes.filter(b => b.status === status);
    }
    if (tipo && tipo !== 'todos') {
      allBoloes = allBoloes.filter(b => b.tipo === tipo);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      allBoloes = allBoloes.filter(b => 
        b.nome.toLowerCase().includes(searchLower) ||
        b.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const total = allBoloes.length;
    const offset = (page - 1) * limit;
    const paginatedBoloes = allBoloes.slice(offset, offset + limit);
    
    return c.json({
      success: true,
      boloes: paginatedBoloes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('[API] Erro ao listar bolões:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao listar bolões', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /admin/boloes/:id - Buscar bolão por ID
// ============================================================
app.get('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    console.log(`[ADMIN] Bolão ${id} requested by: ${user.email}`);

    const bolao = boloesStore.get(id);
    
    if (!bolao) {
      return c.json({ 
        success: false, 
        error: 'Bolão não encontrado',
        code: 'NOT_FOUND',
      }, 404);
    }
    
    return c.json({
      success: true,
      bolao,
    });
  } catch (error: any) {
    console.error('[API] Erro ao buscar bolão:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao buscar bolão', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /admin/boloes - Criar novo bolão
// ============================================================
app.post('/', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[ADMIN] Creating bolão by: ${user.email}`);

    const body = await c.req.json();
    const {
      nome,
      descricao,
      tipo,
      concurso,
      numerosDezenas,
      quantidadeCotas,
      valorCota,
      dataAbertura,
      dataFechamento,
      dataSorteio,
    } = body;
    
    // Validação básica
    if (!nome || !tipo || !quantidadeCotas || !valorCota) {
      return c.json({ 
        success: false, 
        error: 'Campos obrigatórios faltando (nome, tipo, quantidadeCotas, valorCota)',
        code: 'VALIDATION_ERROR',
      }, 400);
    }
    
    // Criar bolão
    const novoBolao: BolaoRecord = {
      id: `bolao-${crypto.randomUUID()}`,
      nome,
      descricao: descricao || null,
      tipo,
      concurso: concurso ? Number(concurso) : null,
      status: 'aberto',
      numerosDezenas: JSON.stringify(numerosDezenas || []),
      quantidadeCotas: Number(quantidadeCotas),
      cotasDisponiveis: Number(quantidadeCotas),
      valorCota: Number(valorCota),
      dataAbertura: dataAbertura || new Date().toISOString(),
      dataFechamento: dataFechamento || new Date().toISOString(),
      dataSorteio: dataSorteio || new Date().toISOString(),
      premiado: false,
      valorPremio: 0,
      faixaPremio: null,
      acertos: null,
      criadoPor: user.id, // Use authenticated user ID
      aprovado: true,
      aprovadoPor: user.id,
      visualizacoes: 0,
      compartilhamentos: 0,
      metadados: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    boloesStore.set(novoBolao.id, novoBolao);
    
    return c.json({
      success: true,
      message: 'Bolão criado com sucesso',
      bolao: novoBolao,
    }, 201);
  } catch (error: any) {
    console.error('[API] Erro ao criar bolão:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao criar bolão', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// PUT /admin/boloes/:id - Atualizar bolão
// ============================================================
app.put('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    console.log(`[ADMIN] Updating bolão ${id} by: ${user.email}`);

    const body = await c.req.json();
    
    // Verificar se bolão existe
    const existing = boloesStore.get(id);
    
    if (!existing) {
      return c.json({ 
        success: false, 
        error: 'Bolão não encontrado',
        code: 'NOT_FOUND',
      }, 404);
    }
    
    // Preparar updates
    const updates: Partial<BolaoRecord> = { ...body };
    
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
    
    // Merge updates
    const updated: BolaoRecord = { ...existing, ...updates };
    boloesStore.set(id, updated);
    
    return c.json({
      success: true,
      message: 'Bolão atualizado com sucesso',
      bolao: updated,
    });
  } catch (error: any) {
    console.error('[API] Erro ao atualizar bolão:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao atualizar bolão', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// DELETE /admin/boloes/:id - Excluir bolão
// ============================================================
app.delete('/:id', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    console.log(`[ADMIN] Deleting bolão ${id} by: ${user.email}`);

    // Verificar se bolão existe
    if (!boloesStore.has(id)) {
      return c.json({ 
        success: false, 
        error: 'Bolão não encontrado',
        code: 'NOT_FOUND',
      }, 404);
    }
    
    boloesStore.delete(id);
    
    return c.json({
      success: true,
      message: 'Bolão excluído com sucesso',
    });
  } catch (error: any) {
    console.error('[API] Erro ao excluir bolão:', error);
    return c.json({ 
      success: false, 
      error: 'Erro ao excluir bolão', 
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

export default app;
