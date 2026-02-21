import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5174;

// Express app para servir frontend
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

// API Routes (Hono convertido para Express)
app.get('/api/ping', (req, res) => {
  res.json({ message: `Pong! ${Date.now()}` });
});

// API placeholder - adicione suas rotas aqui
app.get('/api/loterias/:id', (req, res) => {
  res.json({ 
    message: 'API funcionando',
    id: req.params.id,
    timestamp: Date.now()
  });
});

// Serve static files from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BolãoMax Server Started!');
  console.log(`📡 API: http://localhost:${PORT}/api`);
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
