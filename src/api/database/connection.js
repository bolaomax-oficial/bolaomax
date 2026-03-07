/**
 * BolãoMax — Database Connection (multi-dialect)
 *
 *  ✅ Produção (Railway)  → PostgreSQL via DATABASE_URL
 *  ✅ Desenvolvimento     → SQLite local (better-sqlite3 opcional)
 *
 *  Usa importação dinâmica para todos os schemas TypeScript,
 *  garantindo compatibilidade com --import tsx/esm e sem quebrar
 *  em ambientes que não tenham better-sqlite3.
 */

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
const IS_POSTGRES  = !!DATABASE_URL?.startsWith('postgres');

let db;
let dialect;
let schema;

if (IS_POSTGRES) {
  // ──────────────────────────────────────────────
  // POSTGRESQL  (produção — Railway)
  // ──────────────────────────────────────────────
  console.log('🐘 [DB] Conectando ao PostgreSQL...');

  // Importação dinâmica do schema Postgres (TypeScript via tsx/esm)
  const schemaPg = await import('./schema-postgres.ts').catch(() =>
    import('./schema-postgres.js').catch(() => ({}))
  );

  const { Pool } = pg;
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis:      30_000,
    connectionTimeoutMillis: 5_000,
  });

  db      = drizzlePg(pool, { schema: schemaPg });
  dialect = 'postgresql';
  schema  = schemaPg;

  pool.connect()
    .then(c => { console.log('✅ [DB] PostgreSQL conectado'); c.release(); })
    .catch(e => console.error('❌ [DB] PostgreSQL erro:', e.message));

} else {
  // ──────────────────────────────────────────────
  // SQLITE  (desenvolvimento local)
  // ──────────────────────────────────────────────
  console.log('📁 [DB] Iniciando SQLite local...');

  // Importação dinâmica do schema SQLite (TypeScript via tsx/esm)
  const schemaSqlite = await import('./schema.ts').catch(() =>
    import('./schema.js').catch(() => ({}))
  );

  try {
    const BetterSqlite = (await import('better-sqlite3')).default;
    const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');

    const DB_PATH = process.env.DB_PATH || './bolaomax.db';
    const sqlite  = new BetterSqlite(DB_PATH);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    db      = drizzleSqlite(sqlite, { schema: schemaSqlite });
    dialect = 'sqlite';
    schema  = schemaSqlite;

    console.log(`✅ [DB] SQLite inicializado: ${DB_PATH}`);
  } catch (err) {
    console.warn('⚠️  [DB] better-sqlite3 indisponível — stub em memória');
    db      = null;
    dialect = 'none';
    schema  = schemaSqlite;
  }
}

export { db, dialect, schema };
