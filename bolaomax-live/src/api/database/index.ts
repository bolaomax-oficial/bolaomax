/**
 * Database Connection - BolãoMax
 * 
 * ✅ Produção (Railway): PostgreSQL via DATABASE_URL
 * ✅ Desenvolvimento: SQLite local (fallback)
 * 
 * Drizzle ORM detecta automaticamente o dialect
 */

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const isPostgres = DATABASE_URL?.includes('postgres');

let db: any;
let dbClient: Pool | Database.Database;

try {
  if (isPostgres && DATABASE_URL) {
    // ============================================================
    // PRODUÇÃO: PostgreSQL (Railway)
    // ============================================================
    console.log('🐘 [DATABASE] Conectando ao PostgreSQL...');
    
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
    
    dbClient = pool;
    db = drizzlePg(pool, { schema });
    
    // Testar conexão
    pool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.error('❌ [DATABASE] Erro ao conectar PostgreSQL:', err.message);
      } else {
        console.log('✅ [DATABASE] PostgreSQL conectado com sucesso');
        console.log(`   Timestamp: ${res.rows[0].now}`);
      }
    });
    
  } else {
    // ============================================================
    // DESENVOLVIMENTO: SQLite
    // ============================================================
    console.log('💾 [DATABASE] Usando SQLite (desenvolvimento)...');
    
    const dbPath = './bolaomax.db';
    const sqlite = new Database(dbPath);
    
    // Habilitar foreign keys
    sqlite.pragma('foreign_keys = ON');
    
    dbClient = sqlite;
    db = drizzleSqlite(sqlite, { schema });
    
    console.log(`✅ [DATABASE] SQLite conectado: ${dbPath}`);
  }
} catch (error) {
  console.error('❌ [DATABASE] Erro fatal:', error);
  
  // Fallback: SQLite em memória
  console.log('⚠️  [DATABASE] Usando SQLite em memória (temporário)');
  const memDb = new Database(':memory:');
  dbClient = memDb;
  db = drizzleSqlite(memDb, { schema });
}

// ============================================================
// FUNÇÃO PARA VERIFICAR SAÚDE DO DB
// ============================================================
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (isPostgres) {
      await (dbClient as Pool).query('SELECT 1');
    } else {
      (dbClient as Database.Database).prepare('SELECT 1').get();
    }
    return true;
  } catch (error) {
    console.error('[DATABASE] Health check falhou:', error);
    return false;
  }
}

// ============================================================
// FUNÇÃO PARA FECHAR CONEXÃO
// ============================================================
export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (isPostgres) {
      await (dbClient as Pool).end();
      console.log('👋 [DATABASE] Conexão PostgreSQL encerrada');
    } else {
      (dbClient as Database.Database).close();
      console.log('👋 [DATABASE] Conexão SQLite encerrada');
    }
  } catch (error) {
    console.error('[DATABASE] Erro ao fechar conexão:', error);
  }
}

// ============================================================
// EXPORTS
// ============================================================
export { db, dbClient, isPostgres };
export * from './schema';

// Log inicial
console.log('📊 [DATABASE] Configuração:');
console.log(`   Modo: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
console.log(`   Dialect: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
console.log(`   DATABASE_URL: ${DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
