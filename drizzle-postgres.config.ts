import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema:  './src/api/database/schema-postgres.ts',
  out:     './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/bolaomax',
  },
});
