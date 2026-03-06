/**
 * Database Connection - Multi-dialect
 * Detecta automaticamente qual database usar baseado na DATABASE_URL
 * 
 * - PostgreSQL: Produção (Railway)
 * - SQLite: Desenvolvimento local
 */

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import pg from 'pg';
import Database from 'better-sqlite3';

// Schemas
import * as schemaPg from './schema-postgres.ts';
import * as schemaSqlite from './schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

let db;
let dialect;

if (DATABASE_URL && DATABASE_URL.startsWith('postgres')) {
  // ============================================================
  // POSTGRESQL (Produção - Railway)
  // ============================================================
  
  console.log('🐘 [DB] Conectando ao PostgreSQL...');
  
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 10, // Máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  db = drizzlePg(pool, { schema: schemaPg });
  dialect = 'postgresql';
  
  // Teste de conexão
  pool.connect()
    .then((client) => {
      console.log('✅ [DB] Conectado ao PostgreSQL');
      client.release();
    })
    .catch((err) => {
      console.error('❌ [DB] Erro ao conectar PostgreSQL:', err.message);
    });
  
} else {
  // ============================================================
  // SQLITE (Desenvolvimento local)
  // ============================================================
  
  console.log('📁 [DB] Usando SQLite local...');
  
  const DB_PATH = process.env.DB_PATH || './bolaomax.db';
  const sqlite = new Database(DB_PATH);
  
  // WAL mode para melhor concorrência
  sqlite.pragma('journal_mode = WAL');
  
  db = drizzleSqlite(sqlite, { schema: schemaSqlite });
  dialect = 'sqlite';
  
  console.log(`✅ [DB] SQLite inicializado: ${DB_PATH}`);
}

export { db, dialect };
export const schema = dialect === 'postgresql' ? schemaPg : schemaSqlite;
