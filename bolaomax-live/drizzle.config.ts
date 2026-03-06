import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = DATABASE_URL?.includes('postgres');

export default defineConfig({
  schema: './src/api/database/schema.ts',
  out: './src/api/migrations',
  dialect: isPostgres ? 'postgresql' : 'sqlite',
  dbCredentials: isPostgres
    ? { url: DATABASE_URL! }
    : { url: './bolaomax.db' },
});
