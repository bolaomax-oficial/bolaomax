/**
 * BolãoMax — Rotas de Notificações
 * GET    /api/notificacoes                — listar notificações do usuário
 * GET    /api/notificacoes/nao-lidas      — contar não lidas
 * PATCH  /api/notificacoes/:id/lida       — marcar como lida
 * PATCH  /api/notificacoes/todas-lidas    — marcar todas como lidas
 * DELETE /api/notificacoes/:id            — excluir notificação
 * POST   /api/notificacoes/enviar         — admin: enviar notificação
 */

import express from 'express';
import { rawDb, dialect } from '../database/connection.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const router = express.Router();

function ph(i) { return dialect === 'postgresql' ? `$${i}` : '?'; }

async function one(sql, params = []) {
  if (!rawDb) return null;
  if (dialect === 'sqlite') return rawDb.prepare(sql).get(...params) ?? null;
  const { rows } = await rawDb.query(sql, params);
  return rows[0] ?? null;
}

async function all(sql, params = []) {
  if (!rawDb) return [];
  if (dialect === 'sqlite') return rawDb.prepare(sql).all(...params);
  const { rows } = await rawDb.query(sql, params);
  return rows;
}

async function run(sql, params = []) {
  if (!rawDb) throw new Error('DB não disponível');
  if (dialect === 'sqlite') return rawDb.prepare(sql).run(...params);
  return rawDb.query(sql, params);
}

// ── Verificar/criar tabela notificações ──────────────────────
async function ensureTable() {
  if (!rawDb) return;
  // Verificar se a tabela existe (sem recriar — respeita schema existente)
  try {
    if (dialect === 'sqlite') rawDb.prepare("SELECT 1 FROM notifications LIMIT 1").get();
    else await rawDb.query("SELECT 1 FROM notifications LIMIT 1");
  } catch (_) {
    // Criar se não existir
    const sql = dialect === 'sqlite'
      ? `CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          tipo TEXT DEFAULT 'info',
          titulo TEXT NOT NULL,
          mensagem TEXT,
          link TEXT,
          lida INTEGER DEFAULT 0,
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP
         )`
      : `CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          tipo TEXT DEFAULT 'info',
          titulo TEXT NOT NULL,
          mensagem TEXT,
          link TEXT,
          lida BOOLEAN DEFAULT FALSE,
          criado_em TIMESTAMP DEFAULT NOW()
         )`;
    if (dialect === 'sqlite') rawDb.prepare(sql).run();
    else await rawDb.query(sql);
  }
}

// ── GET /api/notificacoes ────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const { page = 1, limit = 20, tipo } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [`user_id = ${ph(1)}`];
    const params = [req.user.id];
    let i = 2;

    if (tipo) { conditions.push(`tipo = ${ph(i++)}`); params.push(tipo); }

    const where = conditions.join(' AND ');

    const [countRow, rows] = await Promise.all([
      one(`SELECT COUNT(*) as n FROM notifications WHERE ${where}`, params),
      all(
        `SELECT * FROM notifications WHERE ${where} ORDER BY criado_em DESC LIMIT ${ph(i)} OFFSET ${ph(i+1)}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    res.json({
      success: true,
      notificacoes: rows.map(n => ({
        id: n.id,
        titulo: n.titulo,
        mensagem: n.mensagem,
        tipo: n.tipo,
        lida: n.lida === 1 || n.lida === true,
        link: n.link ?? null,
        criadoEm: n.criado_em,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countRow?.n ?? 0),
        totalPages: Math.ceil(Number(countRow?.n ?? 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /api/notificacoes/nao-lidas ──────────────────────────
router.get('/nao-lidas', requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const count = await one(
      `SELECT COUNT(*) as n FROM notifications WHERE user_id = ${ph(1)} AND lida = 0`,
      [req.user.id]
    );
    res.json({ success: true, count: Number(count?.n ?? 0) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PATCH /api/notificacoes/todas-lidas ──────────────────────
router.patch('/todas-lidas', requireAuth, async (req, res) => {
  try {
    await ensureTable();
    if (dialect === 'sqlite') {
      rawDb.prepare(`UPDATE notifications SET lida = 1 WHERE user_id = ?`).run(req.user.id);
    } else {
      await rawDb.query(`UPDATE notifications SET lida = TRUE WHERE user_id = $1`, [req.user.id]);
    }
    res.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PATCH /api/notificacoes/:id/lida ─────────────────────────
router.patch('/:id/lida', requireAuth, async (req, res) => {
  try {
    await ensureTable();
    const notif = await one(
      `SELECT id FROM notifications WHERE id = ${ph(1)} AND user_id = ${ph(2)}`,
      [req.params.id, req.user.id]
    );
    if (!notif) return res.status(404).json({ success: false, error: 'Notificação não encontrada' });

    if (dialect === 'sqlite') {
      rawDb.prepare(`UPDATE notifications SET lida = 1 WHERE id = ?`).run(req.params.id);
    } else {
      await rawDb.query(`UPDATE notifications SET lida = TRUE WHERE id = $1`, [req.params.id]);
    }

    res.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── DELETE /api/notificacoes/:id ─────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureTable();
    await run(
      `DELETE FROM notifications WHERE id = ${ph(1)} AND user_id = ${ph(2)}`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notificação excluída' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /api/notificacoes/enviar — admin ────────────────────
router.post('/enviar', requireAuth, requireAdmin, async (req, res) => {
  try {
    await ensureTable();
    const { userId, titulo, mensagem, tipo = 'info', dadosExtras } = req.body;

    if (!titulo) return res.status(400).json({ success: false, error: 'titulo é obrigatório' });

    // Se userId especificado, enviar para 1; senão para todos
    let userIds = [];
    if (userId) {
      userIds = [userId];
    } else {
      const users = await all(`SELECT id FROM users WHERE status = 'active'`);
      userIds = users.map(u => u.id);
    }

    const now = new Date().toISOString();
    let count = 0;

    for (const uid of userIds) {
      const id = randomUUID();
      await run(
        `INSERT INTO notifications (id, user_id, tipo, titulo, mensagem, lida, criado_em)
         VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},0,${ph(6)})`,
        [id, uid, tipo, titulo, mensagem ?? '', now]
      );
      count++;
    }

    console.log(`📢 [NOTIF] Enviado para ${count} usuário(s): ${titulo}`);
    res.json({ success: true, message: `Notificação enviada para ${count} usuário(s)`, count });
  } catch (error) {
    console.error('[NOTIF] Erro ao enviar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Helper exportado para criar notificações programaticamente ──
export async function criarNotificacao({ userId, titulo, mensagem, tipo = 'info', link = null }) {
  await ensureTable();
  const now = new Date().toISOString();
  const id = randomUUID();
  await run(
    `INSERT INTO notifications (id, user_id, tipo, titulo, mensagem, link, lida, criado_em)
     VALUES (${ph(1)},${ph(2)},${ph(3)},${ph(4)},${ph(5)},${ph(6)},0,${ph(7)})`,
    [id, userId, tipo, titulo, mensagem ?? '', link, now]
  );
  return id;
}

export default router;
