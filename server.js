/**
 * BolãoMax — Production Server
 * Node.js ESM + Express 5  |  Railway-ready
 *
 * Serve:
 *   • Frontend React (dist/)         → GET /*
 *   • API REST completa              → /api/*
 *   • Health check                   → /health
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app     = express();
const PORT    = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const DIST    = path.join(__dirname, 'dist');

// ─────────────────────────────────────────────
// MIDDLEWARES GLOBAIS
// ─────────────────────────────────────────────

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// logger
app.use((req, _res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health') {
    process.stdout.write(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`);
  }
  next();
});

// ─────────────────────────────────────────────
// HEALTH CHECK  (Railway healthcheck path)
// ─────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ─────────────────────────────────────────────
// API  /api/ping
// ─────────────────────────────────────────────

app.get('/api/ping', (_req, res) => {
  res.json({
    status: 'ok',
    message: `Pong! ${Date.now()}`,
    env: process.env.NODE_ENV || 'development',
    db: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
  });
});

// ─────────────────────────────────────────────
// CARREGA ROTAS DA API  (importação dinâmica)
// ─────────────────────────────────────────────

async function loadRoutes () {
  const tryLoad = async (label, importPath, mountPath) => {
    try {
      const mod = await import(importPath);
      const router = mod.default ?? mod.router;
      if (router) {
        app.use(mountPath, router);
        console.log(`✅ [${label}] montado em ${mountPath}`);
      }
    } catch (err) {
      console.warn(`⚠️  [${label}] não carregado: ${err.message}`);
    }
  };

  await tryLoad('AUTH',           './src/api/routes/auth.js',            '/api/auth');
  await tryLoad('BOLOES',         './src/api/routes/boloes.js',          '/api/boloes');
  await tryLoad('PERFIL',         './src/api/routes/perfil.js',          '/api/perfil');
  await tryLoad('RESULTADOS',     './src/api/routes/resultados.js',      '/api/resultados');
  await tryLoad('NOTIFICACOES',   './src/api/routes/notificacoes.js',    '/api/notificacoes');
  await tryLoad('PAGARME',        './src/api/routes/pagarme.js',         '/api/pagarme');
  await tryLoad('FINANCEIRO',     './src/api/routes/financeiro.js',      '/api/financeiro');
  await tryLoad('CARRINHO',       './src/api/routes/carrinho.js',        '/api/carrinho');
  await tryLoad('CARTEIRA',       './src/api/routes/carteira.js',        '/api/carteira');
  await tryLoad('ADMIN-DASH',     './src/api/routes/admin-dashboard.js', '/api/admin');
  await tryLoad('SUB-USUARIOS',   './src/api/routes/sub-usuarios.js',    '/api/admin/sub-usuarios');
  await tryLoad('BOLOES-ESP',     './src/api/routes/boloes-especiais.js','/api/boloes-especiais');
  await tryLoad('AUTOMACAO',      './src/api/routes/automacao.js',       '/api/admin/automacao');
  await tryLoad('CONFIGURACOES',  './src/api/routes/configuracoes.js',   '/api/admin/configuracoes');

  // serviço de limpeza do carrinho
  try {
    const { iniciarServicoLimpeza } = await import('./src/api/services/carrinho.js');
    iniciarServicoLimpeza();
    console.log('✅ [CARRINHO] serviço de limpeza ativo');
  } catch (_) {}

  // cron jobs
  try {
    const { iniciarCronJobs } = await import('./src/api/cron-jobs.js');
    iniciarCronJobs();
    console.log('✅ [CRON] jobs iniciados');
  } catch (_) {}
}

// ─────────────────────────────────────────────
// SEED DE BOLÕES  (garante dados iniciais no DB)
// ─────────────────────────────────────────────

async function seedBoloes () {
  try {
    const { seedBoloes: seed } = await import('./src/api/services/boloes.js');
    const result = await seed(null);
    if (result?.seeded) {
      console.log(`✅ [SEED] ${result.total} bolões inseridos no banco`);
    } else {
      console.log(`ℹ️  [SEED] Banco já possui bolões — seed ignorado`);
    }
  } catch (err) {
    console.warn(`⚠️  [SEED] Falha no seed de bolões: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// ADMIN BOLÕES  (rotas CRUD via service real)
// ─────────────────────────────────────────────

async function loadAdminBoloes () {
  let requireAuth  = (_r, _s, n) => n();
  let requireAdmin = (_r, _s, n) => n();

  try {
    const mod = await import('./src/api/middleware/auth.js');
    requireAuth  = mod.requireAuth  ?? requireAuth;
    requireAdmin = mod.requireAdmin ?? requireAdmin;
  } catch (_) {}

  // Importar service de bolões (DB real)
  let boloesService = null;
  try {
    boloesService = await import('./src/api/services/boloes.js');
  } catch (e) {
    console.warn('[ADMIN-BOLOES] Service não carregado:', e.message);
  }

  // ── listagem admin
  app.get('/api/admin/boloes', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (boloesService) {
        const { status, tipo, page = 1, limit = 50, search } = req.query;
        const result = await boloesService.listarBoloes({ status: status || 'todos', tipo, page: parseInt(page), limit: parseInt(limit), search });
        return res.json({ success: true, ...result });
      }
      res.json({ success: true, boloes: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── stats
  app.get('/api/admin/boloes/stats/summary', requireAuth, requireAdmin, async (_req, res) => {
    try {
      if (boloesService) {
        const stats = await boloesService.estatisticas();
        return res.json({ success: true, stats });
      }
      res.json({ success: true, stats: { total: 0 } });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── busca por id
  app.get('/api/admin/boloes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const bolao = boloesService ? await boloesService.buscarBolaoPorId(req.params.id) : null;
      if (!bolao) return res.status(404).json({ success: false, error: 'Bolão não encontrado' });
      res.json({ success: true, bolao });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── criar
  app.post('/api/admin/boloes', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!boloesService) return res.status(503).json({ success: false, error: 'Service indisponível' });
      const bolao = await boloesService.criarBolao({ ...req.body, criadoPor: req.user?.id });
      res.status(201).json({ success: true, message: 'Bolão criado', bolao });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ── atualizar
  app.put('/api/admin/boloes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!boloesService) return res.status(503).json({ success: false, error: 'Service indisponível' });
      const bolao = await boloesService.atualizarBolao(req.params.id, req.body);
      res.json({ success: true, message: 'Bolão atualizado', bolao });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ── excluir
  app.delete('/api/admin/boloes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!boloesService) return res.status(503).json({ success: false, error: 'Service indisponível' });
      await boloesService.excluirBolao(req.params.id);
      res.json({ success: true, message: 'Bolão excluído' });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ── alterar status
  app.patch('/api/admin/boloes/:id/status', requireAuth, requireAdmin, async (req, res) => {
    try {
      if (!boloesService) return res.status(503).json({ success: false, error: 'Service indisponível' });
      const bolao = await boloesService.alterarStatus(req.params.id, req.body.status);
      res.json({ success: true, message: 'Status atualizado', bolao });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });
}

// ─────────────────────────────────────────────
// FRONTEND ESTÁTICO  (dist/)
// ─────────────────────────────────────────────

function serveStatic () {
  // assets com cache longo
  app.use(express.static(DIST, { maxAge:'1y', index:false }));

  // SPA fallback  ← Express 5 safe (sem wildcard *)
  app.get(/^(?!\/api|\/health).*/, (_req, res) => {
    const index = path.join(DIST, 'index.html');
    res.sendFile(index, err => {
      if (err) {
        res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BolãoMax</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#111827;color:#fff;display:flex;align-items:center;
         justify-content:center;height:100vh;font-family:system-ui,sans-serif}
    h1{color:#02CF51;font-size:2rem;margin-bottom:.5rem}
    p{color:#9ca3af;margin:.3rem 0}
    a{color:#02CF51}
  </style>
</head>
<body>
  <div style="text-align:center">
    <h1>🎰 BolãoMax</h1>
    <p>Servidor no ar!</p>
    <p><a href="/api/ping">→ API Status</a></p>
  </div>
</body>
</html>`);
      }
    });
  });
}

// ─────────────────────────────────────────────
// ERROR HANDLERS  (Express 5: 4-arg function)
// ─────────────────────────────────────────────

function setupErrors () {
  // 404 de API
  app.use('/api', (_req, res) => {
    res.status(404).json({ success:false, error:'Endpoint não encontrado' });
  });

  // handler global de erros  (Express 5 aceita async)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('❌ [SERVER]', err);
    res.status(err.status||500).json({ success:false, error:'Erro interno', message:err.message });
  });
}

// ─────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────

async function boot () {
  console.log(`\n🎰 BolãoMax  |  env=${process.env.NODE_ENV||'dev'}  port=${PORT}`);
  console.log(`   DB: ${process.env.DATABASE_URL ? 'PostgreSQL ✅' : 'SQLite 💾'}\n`);

  await loadRoutes();
  await seedBoloes();
  await loadAdminBoloes();
  serveStatic();
  setupErrors();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor ouvindo em http://0.0.0.0:${PORT}`);
    console.log('   GET  /health       → healthcheck Railway');
    console.log('   GET  /api/ping     → status da API');
    console.log('   GET  /             → frontend React\n');
  });
}

// graceful shutdown
['SIGTERM','SIGINT'].forEach(sig => process.on(sig, () => {
  console.log(`\n🛑 ${sig} recebido — encerrando...`);
  process.exit(0);
}));

process.on('uncaughtException',  err => { console.error('UNCAUGHT', err); process.exit(1); });
process.on('unhandledRejection', err => { console.error('UNHANDLED', err); });

boot();
