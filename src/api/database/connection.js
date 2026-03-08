/**
 * BolãoMax — Database Connection (multi-dialect)
 *
 *  ✅ Produção (Railway)  → PostgreSQL via DATABASE_URL
 *  ✅ Desenvolvimento     → SQLite local (better-sqlite3)
 *
 *  Exporta:
 *    db       — instância Drizzle ORM
 *    rawDb    — driver nativo (pg.Pool | BetterSqlite.Database)
 *    dialect  — 'postgresql' | 'sqlite' | 'none'
 *    schema   — tabelas Drizzle
 */

import { drizzle as drizzlePg }  from 'drizzle-orm/node-postgres';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const IS_POSTGRES  = !!DATABASE_URL?.startsWith('postgres');

let db;
let rawDb;   // driver nativo para queries SQL diretas
let dialect;
let schema = {};

if (IS_POSTGRES) {
  // ── POSTGRESQL (produção — Railway) ──────────────────────
  console.log('🐘 [DB] Conectando ao PostgreSQL...');

  const schemaPg = await import('./schema-postgres.ts')
    .catch(() => import('./schema-postgres.js')
    .catch(() => ({})));

  const { Pool } = pg;
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis:       30_000,
    connectionTimeoutMillis:  5_000,
  });

  db      = drizzlePg(pool, { schema: schemaPg });
  rawDb   = pool;      // pg.Pool — use rawDb.query(sql, params)
  dialect = 'postgresql';
  schema  = schemaPg;

  pool.connect()
    .then(c => { console.log('✅ [DB] PostgreSQL conectado'); c.release(); })
    .catch(e => console.error('❌ [DB] PostgreSQL erro:', e.message));

} else {
  // ── SQLITE (desenvolvimento local) ───────────────────────
  console.log('📁 [DB] Iniciando SQLite local...');

  const schemaSq = await import('./schema.ts')
    .catch(() => import('./schema.js')
    .catch(() => ({})));

  schema = schemaSq;

  try {
    const BetterSqlite           = (await import('better-sqlite3')).default;
    const { drizzle: drizzleSq } = await import('drizzle-orm/better-sqlite3');

    const DB_PATH = process.env.DB_PATH || './bolaomax.db';
    const sqlite  = new BetterSqlite(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    db      = drizzleSq(sqlite, { schema: schemaSq });
    rawDb   = sqlite;  // BetterSqlite.Database — use rawDb.prepare(sql).get/run/all
    dialect = 'sqlite';

    console.log(`✅ [DB] SQLite: ${DB_PATH}`);
  } catch (err) {
    console.warn('⚠️  [DB] better-sqlite3 indisponível — stub em memória');
    db      = null;
    rawDb   = null;
    dialect = 'none';
  }
}

export { db, rawDb, dialect, schema };
