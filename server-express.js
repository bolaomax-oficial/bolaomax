/**
 * BolãoMax - Express Server
 * Backend API server para desenvolvimento e produção (Railway)
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

// Importar rotas e middlewares de auth
import authRoutes from './src/api/routes/auth.js';
import { requireAuth, requireAdmin } from './src/api/middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// IN-MEMORY STORE
// Mesmos dados do Hono (admin-boloes-hono.ts)
// ============================================================

const boloesStore = new Map();

// Seed data - Dados sincronizados com Hono
const seedBoloes = [
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

// Inicializar store com dados seed
seedBoloes.forEach(bolao => {
  boloesStore.set(bolao.id, bolao);
});

console.log(`✅ [STORE] ${boloesStore.size} bolões carregados`);

// ============================================================
// API ROUTES - AUTENTICAÇÃO
// ============================================================

app.use('/api/auth', authRoutes);

console.log('✅ [AUTH] Rotas de autenticação carregadas');

// ============================================================
// API ROUTES - PAGAMENTOS (PAGAR.ME)
// ============================================================

import pagarmeRoutes from './src/api/routes/pagarme.js';
app.use('/api/pagarme', pagarmeRoutes);
app.use('/api/webhooks/pagarme', pagarmeRoutes); // Alias para webhook

console.log('✅ [PAGARME] Rotas de pagamento carregadas');

// ============================================================
// API ROUTES - FINANCEIRO (CARTEIRA + FUNDO + SAQUES)
// ============================================================

import financeiroRoutes from './src/api/routes/financeiro.js';
app.use('/api/financeiro', financeiroRoutes);

console.log('✅ [FINANCEIRO] Rotas financeiras carregadas');

// ============================================================
// API ROUTES - CARRINHO
// ============================================================

import carrinhoRoutes from './src/api/routes/carrinho.js';
import { iniciarServicoLimpeza } from './src/api/services/carrinho.js';

app.use('/api/carrinho', carrinhoRoutes);

// Iniciar serviço de limpeza automática (expira reservas antigas)
iniciarServicoLimpeza();

console.log('✅ [CARRINHO] Rotas e serviço de limpeza carregados');

// ============================================================
// API ROUTES - CARTEIRA (RECARGA DE SALDO)
// ============================================================

import carteiraRoutes from './src/api/routes/carteira.js';
app.use('/api/carteira', carteiraRoutes);

console.log('✅ [CARTEIRA] Rotas de recarga carregadas');

// ============================================================
// API ROUTES - SUB-USUÁRIOS (GESTÃO DE EQUIPE)
// ============================================================

import subUsuariosRoutes from './src/api/routes/sub-usuarios.js';
app.use('/api/admin/sub-usuarios', subUsuariosRoutes);

console.log('✅ [SUB-USUARIOS] Rotas de gestão de equipe carregadas');

// ============================================================
// API ROUTES - BOLÕES ESPECIAIS
// ============================================================

import boloesEspeciaisRoutes from './src/api/routes/boloes-especiais.js';
app.use('/api/boloes-especiais', boloesEspeciaisRoutes);

console.log('✅ [BOLOES-ESPECIAIS] Rotas de bolões especiais carregadas');

// ============================================================
// API ROUTES - AUTOMAÇÃO DE BOLÕES
// ============================================================

import automacaoRoutes from './src/api/routes/automacao.js';
app.use('/api/admin/automacao', automacaoRoutes);

console.log('✅ [AUTOMACAO] Rotas de automação carregadas');

// ============================================================
// API ROUTES - CONFIGURAÇÕES DO SISTEMA
// ============================================================

import configuracoesRoutes from './src/api/routes/configuracoes.js';
app.use('/api/admin/configuracoes', configuracoesRoutes);

console.log('✅ [CONFIGURACOES] Rotas de configurações do sistema carregadas');

// ============================================================
// INICIAR CRON JOBS
// ============================================================

import { iniciarCronJobs } from './src/api/cron-jobs.js';
iniciarCronJobs();

console.log('✅ [CRON] Jobs de automação iniciados');

// ============================================================
// API ROUTES - ADMIN BOLÕES
// PROTEGIDAS COM AUTENTICAÇÃO
// ============================================================

// GET /api/admin/boloes - Listar todos os bolões
app.get('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
  try {
    const { status, tipo, search, page = '1', limit = '50' } = req.query;
    
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const paginatedBoloes = allBoloes.slice(offset, offset + limitNum);
    
    // Resposta no formato Hono
    res.json({
      success: true,
      boloes: paginatedBoloes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
    
    console.log(`✅ [GET] Listados ${paginatedBoloes.length} bolões`);
  } catch (error) {
    console.error('❌ [GET] Erro ao listar bolões:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao listar bolões', 
      message: error.message 
    });
  }
});

// GET /api/admin/boloes/stats/summary - Estatísticas gerais
app.get('/api/admin/boloes/stats/summary', requireAuth, requireAdmin, (req, res) => {
  try {
    const allBoloes = Array.from(boloesStore.values());
    
    const stats = {
      totalBoloes: allBoloes.length,
      boloesAbertos: allBoloes.filter(b => b.status === 'aberto').length,
      boloesFechados: allBoloes.filter(b => b.status === 'fechado').length,
      boloesEmAndamento: allBoloes.filter(b => b.status === 'em_andamento').length,
      totalUsuarios: 150, // Mock value
    };
    
    res.json({
      success: true,
      stats,
    });
    
    console.log(`✅ [GET] Estatísticas calculadas`);
  } catch (error) {
    console.error('❌ [GET] Erro ao calcular estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas', 
      message: error.message 
    });
  }
});

// GET /api/admin/boloes/:id - Buscar bolão por ID
app.get('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const bolao = boloesStore.get(id);
    
    if (!bolao) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bolão não encontrado' 
      });
    }
    
    res.json({
      success: true,
      bolao,
    });
    
    console.log(`✅ [GET] Bolão ${id} encontrado`);
  } catch (error) {
    console.error('❌ [GET] Erro ao buscar bolão:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar bolão', 
      message: error.message 
    });
  }
});

// POST /api/admin/boloes - Criar novo bolão
app.post('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
  try {
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
    } = req.body;
    
    // Validação básica
    if (!nome || !tipo || !quantidadeCotas || !valorCota) {
      return res.status(400).json({ 
        success: false, 
        error: 'Campos obrigatórios faltando (nome, tipo, quantidadeCotas, valorCota)' 
      });
    }
    
    // Criar bolão
    const novoBolao = {
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
      criadoPor: 'admin',
      aprovado: true,
      aprovadoPor: 'admin',
      visualizacoes: 0,
      compartilhamentos: 0,
      metadados: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    
    boloesStore.set(novoBolao.id, novoBolao);
    
    res.status(201).json({
      success: true,
      message: 'Bolão criado com sucesso',
      bolao: novoBolao,
    });
    
    console.log(`✅ [POST] Bolão criado: ${novoBolao.id} - ${nome}`);
  } catch (error) {
    console.error('❌ [POST] Erro ao criar bolão:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar bolão', 
      message: error.message 
    });
  }
});

// PUT /api/admin/boloes/:id - Atualizar bolão
app.put('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se bolão existe
    const existing = boloesStore.get(id);
    
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bolão não encontrado' 
      });
    }
    
    // Preparar updates
    const updates = { ...req.body };
    
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
    const updated = { ...existing, ...updates };
    boloesStore.set(id, updated);
    
    res.json({
      success: true,
      message: 'Bolão atualizado com sucesso',
      bolao: updated,
    });
    
    console.log(`✅ [PUT] Bolão atualizado: ${id}`);
  } catch (error) {
    console.error('❌ [PUT] Erro ao atualizar bolão:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar bolão', 
      message: error.message 
    });
  }
});

// DELETE /api/admin/boloes/:id - Excluir bolão
app.delete('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se bolão existe
    if (!boloesStore.has(id)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bolão não encontrado' 
      });
    }
    
    boloesStore.delete(id);
    
    res.json({
      success: true,
      message: 'Bolão excluído com sucesso',
    });
    
    console.log(`✅ [DELETE] Bolão excluído: ${id}`);
  } catch (error) {
    console.error('❌ [DELETE] Erro ao excluir bolão:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao excluir bolão', 
      message: error.message 
    });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/ping', (req, res) => {
  res.json({ 
    message: `Pong! ${Date.now()}`,
    boloes: boloesStore.size
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    boloes: boloesStore.size
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('❌ [ERROR]', err);
  res.status(500).json({ 
    success: false,
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Rota não encontrada' 
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ========================================');
  console.log(`   BolãoMax Express Server (Dev)`);
  console.log(`   Rodando em: http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Bolões carregados: ${boloesStore.size}`);
  console.log('');
  console.log('   APIs disponíveis:');
  console.log('   - GET  /api/admin/boloes');
  console.log('   - GET  /api/admin/boloes/:id');
  console.log('   - POST /api/admin/boloes');
  console.log('   - PUT  /api/admin/boloes/:id');
  console.log('   - DELETE /api/admin/boloes/:id');
  console.log('   - GET  /api/admin/boloes/stats/summary');
  console.log('   - GET  /api/ping');
  console.log('   - GET  /api/health');
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT recebido, encerrando servidor...');
  process.exit(0);
});
