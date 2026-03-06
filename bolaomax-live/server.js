import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5174;

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================================
// API ROUTES - ADMIN (com database real)
// ============================================================

// Import dinâmico das rotas admin
let adminBoloesRouter;
try {
  const adminModule = await import('./src/api/routes/admin-boloes.ts');
  adminBoloesRouter = adminModule.default;
  app.use('/api/admin', adminBoloesRouter);
  console.log('✅ [API] Rotas admin carregadas');
} catch (error) {
  console.warn('⚠️  [API] Rotas admin não disponíveis:', error.message);
}

// ============================================================
// API ROUTES - PUBLIC
// ============================================================

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: `Pong! ${Date.now()}`,
    status: 'ok',
    version: '1.0.0',
    database: process.env.DATABASE_URL ? 'connected' : 'local',
  });
});

// Sorteios/Calendário API
app.get('/api/sorteios/proximos', (req, res) => {
  const dias = parseInt(req.query.dias) || 7;
  
  const sorteios = [];
  const hoje = new Date();
  
  for (let i = 0; i < dias; i++) {
    const data = new Date(hoje);
    data.setDate(data.getDate() + i);
    const diaSemana = data.getDay();
    
    // Mega-Sena (Quarta=3, Sábado=6)
    if (diaSemana === 3 || diaSemana === 6) {
      sorteios.push({
        id: `mega-${data.getTime()}`,
        tipo: 'megasena',
        nome: 'Mega-Sena',
        data: data.toISOString().split('T')[0],
        hora: '20:00',
        diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][diaSemana],
        premioEstimado: 5000000 + Math.random() * 10000000,
        concurso: 2700 + i
      });
    }
    
    // Lotofácil (Segunda a Sábado)
    if (diaSemana >= 1 && diaSemana <= 6) {
      sorteios.push({
        id: `lotofacil-${data.getTime()}`,
        tipo: 'lotofacil',
        nome: 'Lotofácil',
        data: data.toISOString().split('T')[0],
        hora: '20:00',
        diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][diaSemana],
        premioEstimado: 1500000 + Math.random() * 1000000,
        concurso: 3100 + i
      });
    }
    
    // Quina (Segunda a Sábado)
    if (diaSemana >= 1 && diaSemana <= 6) {
      sorteios.push({
        id: `quina-${data.getTime()}`,
        tipo: 'quina',
        nome: 'Quina',
        data: data.toISOString().split('T')[0],
        hora: '20:00',
        diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][diaSemana],
        premioEstimado: 1200000 + Math.random() * 2000000,
        concurso: 6400 + i
      });
    }
  }
  
  res.json({
    sorteios: sorteios.sort((a, b) => a.data.localeCompare(b.data)),
    total: sorteios.length,
    dias
  });
});

// Loterias info
app.get('/api/loterias/:id', (req, res) => {
  const { id } = req.params;
  
  const loterias = {
    megasena: {
      id: 'megasena',
      nome: 'Mega-Sena',
      descricao: 'A maior e mais famosa loteria do Brasil',
      diasSorteio: ['Quarta', 'Sábado'],
      horaSorteio: '20:00',
      valorMinimo: 5.00,
      numerosSorteados: 6,
      premioEstimado: 5000000
    },
    lotofacil: {
      id: 'lotofacil',
      nome: 'Lotofácil',
      descricao: 'A loteria mais fácil de ganhar',
      diasSorteio: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      horaSorteio: '20:00',
      valorMinimo: 3.00,
      numerosSorteados: 15,
      premioEstimado: 1500000
    },
    quina: {
      id: 'quina',
      nome: 'Quina',
      descricao: 'Sorteios diários com bons prêmios',
      diasSorteio: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      horaSorteio: '20:00',
      valorMinimo: 2.50,
      numerosSorteados: 5,
      premioEstimado: 1200000
    }
  };
  
  const loteria = loterias[id];
  if (!loteria) {
    return res.status(404).json({ error: 'Loteria não encontrada' });
  }
  
  res.json(loteria);
});

// Resultados mock
app.get('/api/resultados/:tipo/:concurso?', (req, res) => {
  const { tipo, concurso } = req.params;
  
  res.json({
    tipo,
    concurso: concurso || Math.floor(Math.random() * 1000) + 2000,
    data: new Date().toISOString().split('T')[0],
    numeros: Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).sort((a, b) => a - b),
    ganhadores: Math.floor(Math.random() * 5),
    premio: Math.floor(Math.random() * 10000000) + 1000000
  });
});

// ============================================================
// STATIC FILES & SPA FALLBACK
// ============================================================

// Serve static files from dist (somente em produção)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BolãoMax Server Started!');
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`   - GET /api/ping`);
  console.log(`   - GET /api/admin/boloes (CRUD)`);
  console.log(`   - GET /api/sorteios/proximos?dias=7`);
  console.log(`   - GET /api/loterias/:id`);
  console.log(`   - GET /api/resultados/:tipo/:concurso`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📂 Static files: ${distPath}`);
  console.log('✅ Ready for Railway deployment!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
