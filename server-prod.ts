/**
 * BolãoMax - Production Server para Railway
 * 
 * Executa com: npx tsx server-prod.ts
 * 
 * Serve:
 *  - API REST completa (/api/*)
 *  - Frontend React buildado (dist/client)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
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
// HEALTH CHECK
// ============================================================

app.get('/api/ping', (_req, res) => {
  res.json({ 
    message: `Pong! ${Date.now()}`,
    status: 'ok',
    env: NODE_ENV,
    uptime: Math.floor(process.uptime()),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: NODE_ENV,
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
  });
});

// ============================================================
// CARREGAR ROTAS DA API (via import dinâmico)
// ============================================================

async function loadRoutes() {
  // Autenticação
  try {
    const { default: authRoutes } = await import('./src/api/routes/auth.js');
    app.use('/api/auth', authRoutes);
    console.log('✅ [AUTH] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [AUTH] Falha:', e.message);
  }

  // Pagar.me
  try {
    const { default: pagarmeRoutes } = await import('./src/api/routes/pagarme.js');
    app.use('/api/pagarme', pagarmeRoutes);
    app.use('/api/webhooks/pagarme', pagarmeRoutes);
    console.log('✅ [PAGARME] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [PAGARME] Falha:', e.message);
  }

  // Financeiro
  try {
    const { default: financeiroRoutes } = await import('./src/api/routes/financeiro.js');
    app.use('/api/financeiro', financeiroRoutes);
    console.log('✅ [FINANCEIRO] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [FINANCEIRO] Falha:', e.message);
  }

  // Carrinho
  try {
    const { default: carrinhoRoutes } = await import('./src/api/routes/carrinho.js');
    app.use('/api/carrinho', carrinhoRoutes);
    console.log('✅ [CARRINHO] Rotas carregadas');
    const { iniciarServicoLimpeza } = await import('./src/api/services/carrinho.js');
    iniciarServicoLimpeza();
  } catch (e: any) {
    console.warn('⚠️  [CARRINHO] Falha:', e.message);
  }

  // Carteira
  try {
    const { default: carteiraRoutes } = await import('./src/api/routes/carteira.js');
    app.use('/api/carteira', carteiraRoutes);
    console.log('✅ [CARTEIRA] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [CARTEIRA] Falha:', e.message);
  }

  // Sub-usuários
  try {
    const { default: subUsuariosRoutes } = await import('./src/api/routes/sub-usuarios.js');
    app.use('/api/admin/sub-usuarios', subUsuariosRoutes);
    console.log('✅ [SUB-USUARIOS] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [SUB-USUARIOS] Falha:', e.message);
  }

  // Bolões especiais
  try {
    const { default: boloesEspeciaisRoutes } = await import('./src/api/routes/boloes-especiais.js');
    app.use('/api/boloes-especiais', boloesEspeciaisRoutes);
    console.log('✅ [BOLOES-ESPECIAIS] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [BOLOES-ESPECIAIS] Falha:', e.message);
  }

  // Automação
  try {
    const { default: automacaoRoutes } = await import('./src/api/routes/automacao.js');
    app.use('/api/admin/automacao', automacaoRoutes);
    console.log('✅ [AUTOMACAO] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [AUTOMACAO] Falha:', e.message);
  }

  // Configurações
  try {
    const { default: configuracoesRoutes } = await import('./src/api/routes/configuracoes.js');
    app.use('/api/admin/configuracoes', configuracoesRoutes);
    console.log('✅ [CONFIGURACOES] Rotas carregadas');
  } catch (e: any) {
    console.warn('⚠️  [CONFIGURACOES] Falha:', e.message);
  }

  // Cron Jobs
  try {
    const { iniciarCronJobs } = await import('./src/api/cron-jobs.js');
    iniciarCronJobs();
    console.log('✅ [CRON] Jobs iniciados');
  } catch (e: any) {
    console.warn('⚠️  [CRON] Falha:', e.message);
  }
}

// ============================================================
// ADMIN BOLÕES (in-memory store)
// ============================================================

async function setupAdminRoutes() {
  let requireAuth: any = (_req: any, _res: any, next: any) => next();
  let requireAdmin: any = (_req: any, _res: any, next: any) => next();

  try {
    const authMiddleware = await import('./src/api/middleware/auth.js');
    requireAuth = authMiddleware.requireAuth;
    requireAdmin = authMiddleware.requireAdmin;
    console.log('✅ [AUTH-MIDDLEWARE] Carregado');
  } catch (e: any) {
    console.warn('⚠️  [AUTH-MIDDLEWARE] Usando bypass (sem auth):', e.message);
  }

  const boloesStore = new Map<string, any>();

  // Seed inicial
  const now = new Date().toISOString();
  const seeds = [
    {
      id: 'bolao-001', nome: 'Mega-Sena Especial',
      descricao: 'Bolão especial Mega-Sena com premiação acumulada',
      tipo: 'megasena', concurso: 2856, status: 'aberto',
      numerosDezenas: JSON.stringify([7, 15, 23, 38, 42, 58]),
      quantidadeCotas: 100, cotasDisponiveis: 65, valorCota: 50,
      dataAbertura: now,
      dataFechamento: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 550000000,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 1250, compartilhamentos: 85,
      criadoEm: now, atualizadoEm: now,
    },
    {
      id: 'bolao-002', nome: 'Lotofácil Semanal',
      descricao: 'Bolão semanal com 15 dezenas',
      tipo: 'lotofacil', concurso: 3245, status: 'aberto',
      numerosDezenas: JSON.stringify([1,2,3,5,7,9,10,11,13,15,17,18,20,22,25]),
      quantidadeCotas: 50, cotasDisponiveis: 28, valorCota: 25,
      dataAbertura: now,
      dataFechamento: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 3500000,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 456, compartilhamentos: 23,
      criadoEm: now, atualizadoEm: now,
    },
    {
      id: 'bolao-003', nome: 'Quina Premium',
      descricao: 'Bolão exclusivo da Quina',
      tipo: 'quina', concurso: 6523, status: 'aberto',
      numerosDezenas: JSON.stringify([12, 25, 37, 48, 62]),
      quantidadeCotas: 80, cotasDisponiveis: 12, valorCota: 30,
      dataAbertura: now,
      dataFechamento: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      dataSorteio: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
      premiado: false, valorPremio: 10000000,
      criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
      visualizacoes: 320, compartilhamentos: 45,
      criadoEm: now, atualizadoEm: now,
    },
  ];
  seeds.forEach(b => boloesStore.set(b.id, b));
  console.log(`✅ [STORE] ${boloesStore.size} bolões seed carregados`);

  app.get('/api/admin/boloes', requireAuth, requireAdmin, (req: any, res: any) => {
    try {
      const { status, tipo, search, page = '1', limit = '50' } = req.query;
      let list = Array.from(boloesStore.values());
      list.sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
      if (status && status !== 'todos') list = list.filter((b: any) => b.status === status);
      if (tipo && tipo !== 'todos') list = list.filter((b: any) => b.tipo === tipo);
      if (search) {
        const s = String(search).toLowerCase();
        list = list.filter((b: any) => b.nome.toLowerCase().includes(s) || b.id.toLowerCase().includes(s));
      }
      const total = list.length;
      const p = parseInt(String(page)), l = parseInt(String(limit));
      const paged = list.slice((p - 1) * l, p * l);
      res.json({ success: true, boloes: paged, pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) } });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.get('/api/admin/boloes/stats/summary', requireAuth, requireAdmin, (_req: any, res: any) => {
    const all = Array.from(boloesStore.values());
    res.json({
      success: true,
      stats: {
        totalBoloes: all.length,
        boloesAbertos: all.filter((b: any) => b.status === 'aberto').length,
        boloesFechados: all.filter((b: any) => b.status === 'fechado').length,
        boloesEmAndamento: all.filter((b: any) => b.status === 'em_andamento').length,
        totalUsuarios: 150,
      }
    });
  });

  app.get('/api/admin/boloes/:id', requireAuth, requireAdmin, (req: any, res: any) => {
    const bolao = boloesStore.get(req.params.id);
    if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    res.json({ success: true, bolao });
  });

  app.post('/api/admin/boloes', requireAuth, requireAdmin, (req: any, res: any) => {
    try {
      const { nome, descricao, tipo, concurso, numerosDezenas, quantidadeCotas, valorCota, dataAbertura, dataFechamento, dataSorteio } = req.body;
      if (!nome || !tipo || !quantidadeCotas || !valorCota) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios: nome, tipo, quantidadeCotas, valorCota' });
      }
      const novo: any = {
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
        premiado: false, valorPremio: 0,
        criadoPor: 'admin', aprovado: true, aprovadoPor: 'admin',
        visualizacoes: 0, compartilhamentos: 0,
        criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(),
      };
      boloesStore.set(novo.id, novo);
      res.status(201).json({ success: true, message: 'Bolão criado', bolao: novo });
    } catch (e: any) { res.status(500).json({ success: false, error: e.message }); }
  });

  app.put('/api/admin/boloes/:id', requireAuth, requireAdmin, (req: any, res: any) => {
    const existing = boloesStore.get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    const updates: any = { ...req.body };
    delete updates.id; delete updates.criadoEm; delete updates.criadoPor;
    updates.atualizadoEm = new Date().toISOString();
    if (Array.isArray(updates.numerosDezenas)) updates.numerosDezenas = JSON.stringify(updates.numerosDezenas);
    const updated = { ...existing, ...updates };
    boloesStore.set(req.params.id, updated);
    res.json({ success: true, message: 'Bolão atualizado', bolao: updated });
  });

  app.delete('/api/admin/boloes/:id', requireAuth, requireAdmin, (req: any, res: any) => {
    if (!boloesStore.has(req.params.id)) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
    boloesStore.delete(req.params.id);
    res.json({ success: true, message: 'Bolão excluído' });
  });

  app.patch('/api/admin/boloes/:id/status', requireAuth, requireAdmin, (req: any, res: any) => {
    const bolao = boloesStore.get(req.params.id);
    if (!bolao) return res.status(404).json({ success: false, error: 'Não encontrado' });
    if (!req.body.status) return res.status(400).json({ success: false, error: 'Status obrigatório' });
    bolao.status = req.body.status;
    bolao.atualizadoEm = new Date().toISOString();
    boloesStore.set(req.params.id, bolao);
    res.json({ success: true, bolao });
  });
}

// ============================================================
// SERVIR FRONTEND (dist/client)
// ============================================================

function setupStaticFiles() {
  const distPath = path.join(__dirname, 'dist', 'client');
  const indexPath = path.join(distPath, 'index.html');

  if (fs.existsSync(distPath)) {
    // Arquivos estáticos com cache
    app.use(express.static(distPath, {
      maxAge: '1y',
      etag: true,
    }));

    // SPA fallback - tudo que não é /api retorna index.html
    app.use((req: any, res: any, next: any) => {
      if (req.path.startsWith('/api')) return next();
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(getFallbackHtml());
      }
    });

    console.log(`✅ [STATIC] Frontend servindo de: ${distPath}`);
  } else {
    // Sem build: mostrar página informativa
    app.use((req: any, res: any, next: any) => {
      if (req.path.startsWith('/api')) return next();
      res.status(200).send(getFallbackHtml());
    });
    console.warn('⚠️  [STATIC] dist/client não encontrado. Execute: npm run build');
  }
}

function getFallbackHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BolãoMax</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #111827; color: #fff; 
           display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; max-width: 400px; }
    h1 { color: #02CF51; font-size: 2.5rem; margin-bottom: 0.5rem; }
    p { color: #9ca3af; margin: 0.5rem 0; }
    a { color: #02CF51; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
    .badge { background: #1f2937; padding: 0.25rem 0.75rem; border-radius: 999px; 
             font-size: 0.8rem; color: #6ee7b7; border: 1px solid #02CF51; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🎰 BolãoMax</h1>
    <p>Servidor iniciado com sucesso!</p>
    <p><span class="badge">API Online</span></p>
    <br>
    <p><a href="/api/ping">→ API Status</a></p>
    <p><a href="/api/health">→ Health Check</a></p>
  </div>
</body>
</html>`;
}

// ============================================================
// ERROR HANDLERS
// ============================================================

function setupErrorHandlers() {
  app.use('/api', (_req: any, res: any) => {
    res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
  });

  app.use((err: any, req: any, res: any, _next: any) => {
    console.error('❌ [SERVER ERROR]', err);
    if (req.path.startsWith('/api')) {
      res.status(500).json({ success: false, error: 'Erro interno', message: err.message });
    } else {
      res.status(500).send('Erro interno do servidor');
    }
  });
}

// ============================================================
// START
// ============================================================

async function startServer() {
  console.log('\n🎰 ================================================');
  console.log('   BolãoMax - Iniciando servidor...');
  console.log(`   Ambiente: ${NODE_ENV}`);
  console.log(`   Porta: ${PORT}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? 'PostgreSQL ✅' : 'SQLite (local) 💾'}`);
  console.log('================================================\n');

  await loadRoutes();
  await setupAdminRoutes();
  setupStaticFiles();
  setupErrorHandlers();

  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 ================================================');
    console.log(`   BolãoMax online em http://0.0.0.0:${PORT}`);
    console.log('================================================\n');
  });
}

process.on('SIGTERM', () => { console.log('🛑 SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { console.log('\n🛑 SIGINT'); process.exit(0); });
process.on('uncaughtException', (err) => { console.error('❌ UNCAUGHT:', err); process.exit(1); });
process.on('unhandledRejection', (reason) => { console.error('❌ UNHANDLED:', reason); });

startServer();
