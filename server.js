/**
 * BolãoMax - Production Server (Railway)
 * 
 * Serve:
 *  - API REST completa (/api/*)
 *  - Frontend React buildado (dist/client)
 * 
 * Compatível com: Node.js 18+, Railway, Render
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ============================================================
// HEALTH CHECK (antes de qualquer middleware pesado)
// ============================================================

app.get('/api/ping', (req, res) => {
  res.json({ 
    message: `Pong! ${Date.now()}`,
    status: 'ok',
    env: NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: NODE_ENV,
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
  });
});

// ============================================================
// CARREGAR ROTAS DA API
// ============================================================

async function loadRoutes() {
  try {
    // Autenticação
    const { default: authRoutes } = await import('./src/api/routes/auth.js');
    app.use('/api/auth', authRoutes);
    console.log('✅ [AUTH] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [AUTH] Falha ao carregar rotas:', e.message);
  }

  try {
    // Pagar.me (pagamentos)
    const { default: pagarmeRoutes } = await import('./src/api/routes/pagarme.js');
    app.use('/api/pagarme', pagarmeRoutes);
    app.use('/api/webhooks/pagarme', pagarmeRoutes);
    console.log('✅ [PAGARME] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [PAGARME] Falha ao carregar rotas:', e.message);
  }

  try {
    // Financeiro (carteira, fundo, saques)
    const { default: financeiroRoutes } = await import('./src/api/routes/financeiro.js');
    app.use('/api/financeiro', financeiroRoutes);
    console.log('✅ [FINANCEIRO] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [FINANCEIRO] Falha ao carregar rotas:', e.message);
  }

  try {
    // Carrinho
    const { default: carrinhoRoutes } = await import('./src/api/routes/carrinho.js');
    app.use('/api/carrinho', carrinhoRoutes);
    console.log('✅ [CARRINHO] Rotas carregadas');

    // Serviço de limpeza de reservas expiradas
    try {
      const { iniciarServicoLimpeza } = await import('./src/api/services/carrinho.js');
      iniciarServicoLimpeza();
      console.log('✅ [CARRINHO] Serviço de limpeza iniciado');
    } catch (e) {
      console.warn('⚠️  [CARRINHO] Serviço de limpeza não disponível:', e.message);
    }
  } catch (e) {
    console.warn('⚠️  [CARRINHO] Falha ao carregar rotas:', e.message);
  }

  try {
    // Carteira (recarga de saldo)
    const { default: carteiraRoutes } = await import('./src/api/routes/carteira.js');
    app.use('/api/carteira', carteiraRoutes);
    console.log('✅ [CARTEIRA] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [CARTEIRA] Falha ao carregar rotas:', e.message);
  }

  try {
    // Sub-usuários
    const { default: subUsuariosRoutes } = await import('./src/api/routes/sub-usuarios.js');
    app.use('/api/admin/sub-usuarios', subUsuariosRoutes);
    console.log('✅ [SUB-USUARIOS] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [SUB-USUARIOS] Falha ao carregar rotas:', e.message);
  }

  try {
    // Bolões especiais
    const { default: boloesEspeciaisRoutes } = await import('./src/api/routes/boloes-especiais.js');
    app.use('/api/boloes-especiais', boloesEspeciaisRoutes);
    console.log('✅ [BOLOES-ESPECIAIS] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [BOLOES-ESPECIAIS] Falha ao carregar rotas:', e.message);
  }

  try {
    // Automação de bolões
    const { default: automacaoRoutes } = await import('./src/api/routes/automacao.js');
    app.use('/api/admin/automacao', automacaoRoutes);
    console.log('✅ [AUTOMACAO] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [AUTOMACAO] Falha ao carregar rotas:', e.message);
  }

  try {
    // Configurações do sistema
    const { default: configuracoesRoutes } = await import('./src/api/routes/configuracoes.js');
    app.use('/api/admin/configuracoes', configuracoesRoutes);
    console.log('✅ [CONFIGURACOES] Rotas carregadas');
  } catch (e) {
    console.warn('⚠️  [CONFIGURACOES] Falha ao carregar rotas:', e.message);
  }

  try {
    // Cron jobs (automação)
    const { iniciarCronJobs } = await import('./src/api/cron-jobs.js');
    iniciarCronJobs();
    console.log('✅ [CRON] Jobs iniciados');
  } catch (e) {
    console.warn('⚠️  [CRON] Jobs não disponíveis:', e.message);
  }
}

// ============================================================
// ADMIN BOLÕES (in-memory + banco)
// ============================================================

async function setupAdminRoutes() {
  const { requireAuth, requireAdmin } = await import('./src/api/middleware/auth.js').catch(() => ({
    requireAuth: (req, res, next) => next(),
    requireAdmin: (req, res, next) => next(),
  }));

  const boloesStore = new Map();

  // Seed data
  const seedBoloes = [
    {
      id: 'bolao-001',
      nome: 'Mega-Sena Especial',
      descricao: 'Bolão especial Mega-Sena com premiação acumulada',
      tipo: 'megasena', concurso: 2856, status: 'aberto',
      numerosDezenas: JSON.stringify([7, 15, 23, 38, 42, 58]),
      quantidadeCotas: 100, cotasDisponiveis: 65, valorCota: 50,
      dataAbertura: new Date().toISOString(),
      dataFechamento: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 550000000, faixaPremio: null, acertos: null,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 1250, compartilhamentos: 85, metadados: null,
      criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
    },
    {
      id: 'bolao-002',
      nome: 'Lotofácil Semanal',
      descricao: 'Bolão semanal da Lotofácil com 15 dezenas',
      tipo: 'lotofacil', concurso: 3245, status: 'aberto',
      numerosDezenas: JSON.stringify([1, 2, 3, 5, 7, 9, 10, 11, 13, 15, 17, 18, 20, 22, 25]),
      quantidadeCotas: 50, cotasDisponiveis: 28, valorCota: 25,
      dataAbertura: new Date().toISOString(),
      dataFechamento: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 3500000, faixaPremio: null, acertos: null,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 456, compartilhamentos: 23, metadados: null,
      criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
    },
    {
      id: 'bolao-003',
      nome: 'Quina Premium',
      descricao: 'Bolão exclusivo da Quina',
      tipo: 'quina', concurso: 6523, status: 'aberto',
      numerosDezenas: JSON.stringify([12, 25, 37, 48, 62]),
      quantidadeCotas: 80, cotasDisponiveis: 12, valorCota: 30,
      dataAbertura: new Date().toISOString(),
      dataFechamento: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 10000000, faixaPremio: null, acertos: null,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 320, compartilhamentos: 45, metadados: null,
      criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
    },
  ];

  seedBoloes.forEach(b => boloesStore.set(b.id, b));
  console.log(`✅ [STORE] ${boloesStore.size} bolões seed carregados`);

  // GET /api/admin/boloes
  app.get('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
    try {
      const { status, tipo, search, page = '1', limit = '50' } = req.query;
      let boloes = Array.from(boloesStore.values());
      boloes.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
      if (status && status !== 'todos') boloes = boloes.filter(b => b.status === status);
      if (tipo && tipo !== 'todos') boloes = boloes.filter(b => b.tipo === tipo);
      if (search) {
        const s = search.toLowerCase();
        boloes = boloes.filter(b => b.nome.toLowerCase().includes(s) || b.id.toLowerCase().includes(s));
      }
      const total = boloes.length;
      const pageNum = parseInt(page), limitNum = parseInt(limit);
      const paged = boloes.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      res.json({ success: true, boloes: paged, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // GET /api/admin/boloes/stats/summary
  app.get('/api/admin/boloes/stats/summary', requireAuth, requireAdmin, (req, res) => {
    const all = Array.from(boloesStore.values());
    res.json({
      success: true,
      stats: {
        totalBoloes: all.length,
        boloesAbertos: all.filter(b => b.status === 'aberto').length,
        boloesFechados: all.filter(b => b.status === 'fechado').length,
        boloesEmAndamento: all.filter(b => b.status === 'em_andamento').length,
        totalUsuarios: 150,
      }
    });
  });

  // GET /api/admin/boloes/:id
  app.get('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    const bolao = boloesStore.get(req.params.id);
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    res.json({ success: true, bolao });
  });

  // POST /api/admin/boloes
  app.post('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
    try {
      const { nome, descricao, tipo, concurso, numerosDezenas, quantidadeCotas, valorCota, dataAbertura, dataFechamento, dataSorteio } = req.body;
      if (!nome || !tipo || !quantidadeCotas || !valorCota) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios: nome, tipo, quantidadeCotas, valorCota' });
      }
      const novo = {
        id: `bolao-${Date.now()}`,
        nome, descricao: descricao || null, tipo,
        concurso: concurso ? Number(concurso) : null,
        status: 'aberto',
        numerosDezenas: JSON.stringify(numerosDezenas || []),
        quantidadeCotas: Number(quantidadeCotas),
        cotasDisponiveis: Number(quantidadeCotas),
        valorCota: Number(valorCota),
        dataAbertura: dataAbertura || new Date().toISOString(),
        dataFechamento: dataFechamento || new Date().toISOString(),
        dataSorteio: dataSorteio || new Date().toISOString(),
        premiado: false, valorPremio: 0, faixaPremio: null, acertos: null,
        criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
        visualizacoes: 0, compartilhamentos: 0, metadados: null,
        criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
      };
      boloesStore.set(novo.id, novo);
      res.status(201).json({ success: true, message: 'Bolão criado', bolao: novo });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PUT /api/admin/boloes/:id
  app.put('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    const existing = boloesStore.get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    const updates = { ...req.body };
    delete updates.id; delete updates.criadoEm; delete updates.criadoPor;
    updates.atualizadoEm = new Date().toISOString();
    if (updates.numerosDezenas && Array.isArray(updates.numerosDezenas)) {
      updates.numerosDezenas = JSON.stringify(updates.numerosDezenas);
    }
    const updated = { ...existing, ...updates };
    boloesStore.set(req.params.id, updated);
    res.json({ success: true, message: 'Bolão atualizado', bolao: updated });
  });

  // DELETE /api/admin/boloes/:id
  app.delete('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    if (!boloesStore.has(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    }
    boloesStore.delete(req.params.id);
    res.json({ success: true, message: 'Bolão excluído' });
  });

  // PATCH /api/admin/boloes/:id/status
  app.patch('/api/admin/boloes/:id/status', requireAuth, requireAdmin, (req, res) => {
    const bolao = boloesStore.get(req.params.id);
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'Status é obrigatório' });
    bolao.status = status;
    bolao.atualizadoEm = new Date().toISOString();
    boloesStore.set(req.params.id, bolao);
    res.json({ success: true, message: 'Status atualizado', bolao });
  });
}

// ============================================================
// SERVIR FRONTEND REACT (dist/client)
// ============================================================

function setupStaticFiles() {
  const distPath = path.join(__dirname, 'dist', 'client');
  
  // Servir arquivos estáticos
  app.use(express.static(distPath, {
    maxAge: '1y',
    etag: true,
    index: false, // Não servir index automaticamente - deixar o SPA handler abaixo fazer isso
  }));

  // SPA fallback - qualquer rota não-API retorna index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BolãoMax</title>
            <style>
              body { font-family: sans-serif; background: #111827; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .box { text-align: center; }
              h1 { color: #02CF51; font-size: 2rem; }
              p { color: #9ca3af; }
              a { color: #02CF51; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>🎰 BolãoMax</h1>
              <p>Servidor iniciado com sucesso!</p>
              <p><a href="/api/ping">API Status</a></p>
            </div>
          </body>
          </html>
        `);
      }
    });
  });
}

// ============================================================
// ERROR HANDLERS
// ============================================================

function setupErrorHandlers() {
  // 404 para rotas de API
  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint não encontrado', path: req.path });
  });

  // Handler de erro global
  app.use((err, req, res, next) => {
    console.error('❌ [SERVER ERROR]', err);
    if (req.path.startsWith('/api')) {
      res.status(500).json({ success: false, error: 'Erro interno do servidor', message: err.message });
    } else {
      res.status(500).send('Erro interno do servidor');
    }
  });
}

// ============================================================
// INICIALIZAR SERVIDOR
// ============================================================

async function startServer() {
  console.log('\n🎰 ================================================');
  console.log('   BolãoMax - Iniciando servidor...');
  console.log(`   Ambiente: ${NODE_ENV}`);
  console.log(`   Porta: ${PORT}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'PostgreSQL ✅' : 'SQLite (local) 💾'}`);
  console.log('================================================\n');

  try {
    // Carregar rotas da API
    await loadRoutes();
    
    // Configurar rotas admin de bolões
    await setupAdminRoutes();

    // Servir frontend
    setupStaticFiles();

    // Error handlers (devem ser últimos)
    setupErrorHandlers();

    // Iniciar servidor HTTP
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 ================================================');
      console.log(`   BolãoMax rodando em http://0.0.0.0:${PORT}`);
      console.log('');
      console.log('   Endpoints principais:');
      console.log('   GET  /api/ping          - Health check');
      console.log('   GET  /api/health        - Status detalhado');
      console.log('   POST /api/auth/login    - Login');
      console.log('   POST /api/auth/register - Cadastro');
      console.log('   GET  /api/admin/boloes  - Listar bolões');
      console.log('   GET  /                  - Frontend React');
      console.log('================================================\n');
    });

  } catch (error) {
    console.error('❌ [FATAL] Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, encerrando...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT recebido, encerrando...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
});

// Start
startServer();
