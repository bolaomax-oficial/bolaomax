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
  await tryLoad('PAGARME',        './src/api/routes/pagarme.js',         '/api/pagarme');
  await tryLoad('FINANCEIRO',     './src/api/routes/financeiro.js',      '/api/financeiro');
  await tryLoad('CARRINHO',       './src/api/routes/carrinho.js',        '/api/carrinho');
  await tryLoad('CARTEIRA',       './src/api/routes/carteira.js',        '/api/carteira');
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
// ADMIN BOLÕES  (in-memory store + DB future)
// ─────────────────────────────────────────────

async function loadAdminBoloes () {
  let requireAuth  = (_r, _s, n) => n();
  let requireAdmin = (_r, _s, n) => n();

  try {
    const mod = await import('./src/api/middleware/auth.js');
    requireAuth  = mod.requireAuth  ?? requireAuth;
    requireAdmin = mod.requireAdmin ?? requireAdmin;
  } catch (_) {}

  // seed em memória
  const store = new Map();
  [
    { id:'b-001', nome:'Mega-Sena Especial',  tipo:'megasena',  concurso:2856, status:'aberto', quantidadeCotas:100, cotasDisponiveis:65,  valorCota:50,  valorPremio:550000000 },
    { id:'b-002', nome:'Lotofácil Semanal',   tipo:'lotofacil', concurso:3245, status:'aberto', quantidadeCotas:50,  cotasDisponiveis:28,  valorCota:25,  valorPremio:3500000 },
    { id:'b-003', nome:'Quina Premium',       tipo:'quina',     concurso:6523, status:'aberto', quantidadeCotas:80,  cotasDisponiveis:12,  valorCota:30,  valorPremio:10000000 },
    { id:'b-004', nome:'Dupla Sena Relâmpago',tipo:'duplasena', concurso:2512, status:'aberto', quantidadeCotas:60,  cotasDisponiveis:40,  valorCota:20,  valorPremio:1200000 },
  ].forEach(b => {
    const now = new Date().toISOString();
    store.set(b.id, {
      ...b,
      descricao: `Bolão ${b.nome} — participe agora!`,
      numerosDezenas: JSON.stringify([]),
      dataAbertura:   now,
      dataFechamento: new Date(Date.now() + 7*86400*1000).toISOString(),
      dataSorteio:    new Date(Date.now() + 7*86400*1000).toISOString(),
      premiado:false, faixaPremio:null, acertos:null,
      criadoPor:'admin', aprovado:true, aprovadoPor:'admin',
      visualizacoes:0, compartilhamentos:0, metadados:null,
      criadoEm:now, atualizadoEm:now,
    });
  });
  console.log(`✅ [STORE] ${store.size} bolões seed carregados`);

  // ── listagem
  app.get('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
    let list = [...store.values()].sort((a,b)=>new Date(b.criadoEm)-new Date(a.criadoEm));
    const { status, tipo, search, page='1', limit='50' } = req.query;
    if (status && status !== 'todos') list = list.filter(b=>b.status===status);
    if (tipo   && tipo   !== 'todos') list = list.filter(b=>b.tipo===tipo);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b=>b.nome.toLowerCase().includes(q)||b.id.toLowerCase().includes(q));
    }
    const p=parseInt(page), l=parseInt(limit), total=list.length;
    res.json({ success:true, boloes:list.slice((p-1)*l, p*l),
               pagination:{ page:p, limit:l, total, totalPages:Math.ceil(total/l) } });
  });

  // ── stats
  app.get('/api/admin/boloes/stats/summary', requireAuth, requireAdmin, (_req, res) => {
    const all=[...store.values()];
    res.json({ success:true, stats:{
      totalBoloes:all.length,
      boloesAbertos:   all.filter(b=>b.status==='aberto').length,
      boloesFechados:  all.filter(b=>b.status==='fechado').length,
      boloesEmAndamento:all.filter(b=>b.status==='em_andamento').length,
      totalUsuarios:150,
    }});
  });

  // ── busca por id
  app.get('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    const b = store.get(req.params.id);
    if (!b) return res.status(404).json({ success:false, error:'Bolão não encontrado' });
    res.json({ success:true, bolao:b });
  });

  // ── criar
  app.post('/api/admin/boloes', requireAuth, requireAdmin, (req, res) => {
    const { nome, descricao, tipo, concurso, numerosDezenas, quantidadeCotas, valorCota,
            dataAbertura, dataFechamento, dataSorteio } = req.body;
    if (!nome||!tipo||!quantidadeCotas||!valorCota)
      return res.status(400).json({ success:false, error:'Campos obrigatórios: nome, tipo, quantidadeCotas, valorCota' });
    const now=new Date().toISOString();
    const novo = {
      id:`b-${Date.now()}`, nome, descricao:descricao||null, tipo,
      concurso:concurso?Number(concurso):null, status:'aberto',
      numerosDezenas:JSON.stringify(numerosDezenas||[]),
      quantidadeCotas:Number(quantidadeCotas), cotasDisponiveis:Number(quantidadeCotas),
      valorCota:Number(valorCota),
      dataAbertura:dataAbertura||now, dataFechamento:dataFechamento||now, dataSorteio:dataSorteio||now,
      premiado:false, valorPremio:0, faixaPremio:null, acertos:null,
      criadoPor:'admin', aprovado:true, aprovadoPor:'admin',
      visualizacoes:0, compartilhamentos:0, metadados:null, criadoEm:now, atualizadoEm:now,
    };
    store.set(novo.id, novo);
    res.status(201).json({ success:true, message:'Bolão criado', bolao:novo });
  });

  // ── atualizar
  app.put('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    const b=store.get(req.params.id);
    if (!b) return res.status(404).json({ success:false, error:'Bolão não encontrado' });
    const upd={...req.body}; delete upd.id; delete upd.criadoEm; delete upd.criadoPor;
    if (Array.isArray(upd.numerosDezenas)) upd.numerosDezenas=JSON.stringify(upd.numerosDezenas);
    upd.atualizadoEm=new Date().toISOString();
    const updated={...b,...upd};
    store.set(req.params.id, updated);
    res.json({ success:true, message:'Bolão atualizado', bolao:updated });
  });

  // ── excluir
  app.delete('/api/admin/boloes/:id', requireAuth, requireAdmin, (req, res) => {
    if (!store.has(req.params.id))
      return res.status(404).json({ success:false, error:'Bolão não encontrado' });
    store.delete(req.params.id);
    res.json({ success:true, message:'Bolão excluído' });
  });

  // ── alterar status
  app.patch('/api/admin/boloes/:id/status', requireAuth, requireAdmin, (req, res) => {
    const b=store.get(req.params.id);
    if (!b) return res.status(404).json({ success:false, error:'Bolão não encontrado' });
    b.status=req.body.status; b.atualizadoEm=new Date().toISOString();
    store.set(req.params.id, b);
    res.json({ success:true, message:'Status atualizado', bolao:b });
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
