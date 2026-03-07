/**
 * BolãoMax — Database Migration Runner
 *
 * Uso:
 *   node src/api/database/migrate.js
 *   npm run db:migrate
 *
 * Lê todos os arquivos .sql de /migrations/ em ordem e aplica no PostgreSQL.
 * Mantém tabela _migrations para evitar re-execução.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate () {
  const client = await pool.connect();
  console.log('🐘 [MIGRATE] Conectado ao PostgreSQL');

  try {
    // tabela de controle
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   TEXT   NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // ler arquivos de migrations
    const migrationsDir = path.join(__dirname, '../../../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 [MIGRATE] ${files.length} arquivo(s) encontrado(s)`);

    for (const file of files) {
      // verificar se já foi aplicada
      const { rows } = await client.query(
        'SELECT id FROM _migrations WHERE filename = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`⏭  [MIGRATE] ${file} — já aplicada, pulando`);
        continue;
      }

      // aplicar migration
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`🔄 [MIGRATE] Aplicando ${file}...`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ [MIGRATE] ${file} aplicada com sucesso`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ [MIGRATE] Erro em ${file}:`, err.message);
        throw err;
      }
    }

    console.log('\n✅ [MIGRATE] Todas as migrations aplicadas!\n');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('❌ [MIGRATE] Falha fatal:', err);
  process.exit(1);
});
