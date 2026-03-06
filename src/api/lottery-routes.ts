/**
 * Endpoints simplificados da API de Loterias
 * Versão de desenvolvimento com dados mock
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drawsCache, initializeDrawsCache, generateDraws } from './database/seeds';
import {
  generateiCal,
  generateGoogleCalendarUrl,
  getProximityBadge,
} from './services/calendar-service';

const app = new Hono();

// CORS
app.use('/*', cors());

// Inicializar cache de sorteios
initializeDrawsCache();

// Mock data para desenvolvimento
const mockResult = {
  success: true,
  data: {
    id: "megasena_2789",
    tipo: "megasena",
    concurso: 2789,
    data: "2025-02-06",
    dezenas: [7, 15, 23, 38, 42, 58],
    acumulado: false,
    premios: [
      { faixa: "Sena (6 acertos)", ganhadores: 2, premio: "R$ 78.453.219,32" },
      { faixa: "Quina (5 acertos)", ganhadores: 156, premio: "R$ 45.892,17" },
    ]
  }
};

/**
 * GET /api/lottery/results/:tipo
 */
app.get('/api/lottery/results/:tipo', async (c) => {
  const tipo = c.req.param('tipo');
  return c.json({
    ...mockResult,
    data: { ...mockResult.data, tipo }
  });
});

/**
 * GET /api/health
 */
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    services: {
      api: 'ok',
      mode: 'development'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/lottery/update
 */
app.post('/api/lottery/update', async (c) => {
  return c.json({
    success: true,
    message: 'Atualização simulada (modo desenvolvimento)',
    stats: {
      sucesso: 9,
      falhas: 0
    }
  });
});

/**
 * GET /api/cron/status
 */
app.get('/api/cron/status', (c) => {
  return c.json({
    success: true,
    data: {
      isRunning: false,
      mode: 'development',
      message: 'Cron desabilitado em modo desenvolvimento'
    }
  });
});

// ============ ENDPOINTS DE CALENDÁRIO ============

/**
 * GET /api/calendar/draws
 * Query: mes, ano, tipo
 */
app.get('/api/calendar/draws', (c) => {
  const mes = parseInt(c.req.query('mes') || new Date().getMonth() + 1);
  const ano = parseInt(c.req.query('ano') || new Date().getFullYear());
  const tipo = c.req.query('tipo');

  const draws = Array.from(drawsCache.values()).filter((draw) => {
    const drawDate = new Date(draw.data);
    const isSameMonth =
      drawDate.getMonth() + 1 === mes && drawDate.getFullYear() === ano;
    const isSameLottery = !tipo || draw.tipo === tipo;
    return isSameMonth && isSameLottery;
  });

  return c.json({
    success: true,
    data: draws.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    meta: { total: draws.length, mes, ano }
  });
});

/**
 * GET /api/calendar/draws/upcoming
 * Query: dias (padrão: 30)
 */
app.get('/api/calendar/draws/upcoming', (c) => {
  const dias = parseInt(c.req.query('dias') || '30');
  const hoje = new Date();
  const futuro = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);

  const draws = Array.from(drawsCache.values()).filter((draw) => {
    const drawDate = new Date(draw.data);
    return drawDate >= hoje && drawDate <= futuro;
  });

  return c.json({
    success: true,
    data: draws.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()),
    meta: { total: draws.length, dias }
  });
});

/**
 * GET /api/calendar/draws/:id
 */
app.get('/api/calendar/draws/:id', (c) => {
  const id = c.req.param('id');
  const draw = drawsCache.get(id);

  if (!draw) {
    return c.json({ success: false, error: 'Sorteio não encontrado' }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...draw,
      badge: getProximityBadge(draw.data),
      googleCalendarUrl: generateGoogleCalendarUrl(draw)
    }
  });
});

/**
 * GET /api/calendar/export/ical
 * Query: drawIds (comma-separated)
 */
app.get('/api/calendar/export/ical', (c) => {
  const drawIdsParam = c.req.query('drawIds');
  const drawIds = drawIdsParam ? drawIdsParam.split(',') : Array.from(drawsCache.keys());

  const selectedDraws = drawIds
    .map((id) => drawsCache.get(id))
    .filter((draw) => draw !== undefined);

  if (selectedDraws.length === 0) {
    return c.json({ success: false, error: 'Nenhum sorteio selecionado' }, 400);
  }

  const icalContent = generateiCal(selectedDraws);

  c.header('Content-Type', 'text/calendar; charset=utf-8');
  c.header('Content-Disposition', 'attachment; filename="sorteios.ics"');

  return c.text(icalContent);
});

/**
 * GET /api/calendar/export/google
 * Query: drawId
 */
app.get('/api/calendar/export/google', (c) => {
  const drawId = c.req.query('drawId');

  if (!drawId) {
    return c.json({ success: false, error: 'drawId requerido' }, 400);
  }

  const draw = drawsCache.get(drawId);

  if (!draw) {
    return c.json({ success: false, error: 'Sorteio não encontrado' }, 404);
  }

  const googleUrl = generateGoogleCalendarUrl(draw);

  return c.json({
    success: true,
    data: { url: googleUrl }
  });
});

/**
 * GET /api/calendar/statistics
 */
app.get('/api/calendar/statistics', (c) => {
  const draws = Array.from(drawsCache.values());
  const byLottery: Record<string, number> = {};

  for (const draw of draws) {
    byLottery[draw.tipo] = (byLottery[draw.tipo] || 0) + 1;
  }

  const proximosSete = draws
    .filter((d) => {
      const daysUntil =
        (new Date(d.data).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return c.json({
    success: true,
    data: {
      totalSorteios: draws.length,
      porLoteria: byLottery,
      proximosSete: proximosSete.slice(0, 7),
    }
  });
});

// Rota raiz
app.get('/', (c) => {
  return c.json({
    name: 'BolãoMax Lottery API',
    version: '1.0.0 (dev)',
    mode: 'development',
    endpoints: {
      health: '/api/health',
      results: '/api/lottery/results/:tipo',
      update: '/api/lottery/update',
      cron: '/api/cron/status',
      calendar: {
        draws: '/api/calendar/draws?mes=2&ano=2026&tipo=megasena',
        upcoming: '/api/calendar/draws/upcoming?dias=30',
        details: '/api/calendar/draws/:id',
        exportIcal: '/api/calendar/export/ical?drawIds=...',
        exportGoogle: '/api/calendar/export/google?drawId=...',
        statistics: '/api/calendar/statistics'
      }
    }
  });
});

export default app;