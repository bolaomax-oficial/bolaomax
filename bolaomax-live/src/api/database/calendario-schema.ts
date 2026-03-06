/**
 * Schema para Sistema de Calendário de Sorteios
 */

import { sqliteTable, text, integer, boolean } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

/**
 * Tabela: Sorteios (40+ pré-cadastrados)
 */
export const sorteios = sqliteTable("sorteios", {
  id: text("id").primaryKey(), // formato: megasena_2025_001
  tipo: text("tipo").notNull(), // megasena, lotofacil, quina, etc
  numero: integer("numero").notNull(), // número do concurso
  data: text("data").notNull(), // data do sorteio (ISO)
  hora: text("hora").notNull(), // horário (HH:mm)
  dia_semana: text("dia_semana").notNull(), // Segunda, Terça, etc
  mes: integer("mes").notNull(), // 1-12
  ano: integer("ano").notNull(), // 2025, 2026, etc
  valor_estimado: text("valor_estimado"), // Prêmio estimado
  local_sorteio: text("local_sorteio"), // São Paulo, Rio, etc
  ativo: integer("ativo", { mode: 'boolean' }).default(true),
  destaque: integer("destaque", { mode: 'boolean' }).default(false), // Mega da Virada
  cor: text("cor"), // Para cores no calendário (#FF0000)
  icone: text("icone"), // Nome do ícone
  descricao: text("descricao"), // Descrição especial
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tabela: Alertas de Sorteios
 */
export const alertas = sqliteTable("alertas", {
  id: text("id").primaryKey(),
  usuarioId: text("usuario_id").notNull(),
  sorteioId: text("sorteio_id").notNull(),
  tipo: text("tipo").notNull(), // email, sms, push, in-app
  diasAntes: integer("dias_antes").default(1), // Alertar 1 dia antes
  ativo: integer("ativo", { mode: 'boolean' }).default(true),
  enviado: integer("enviado", { mode: 'boolean' }).default(false),
  dataEnvio: text("data_envio"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tabela: Exportações (histórico de .ics gerados)
 */
export const exportacoes = sqliteTable("exportacoes", {
  id: text("id").primaryKey(),
  usuarioId: text("usuario_id"),
  tipo: text("tipo").notNull(), // ics, json, csv
  formato: text("formato").notNull(), // ical, google-calendar, outlook
  loterias: text("loterias"), // JSON array de loterias selecionadas
  mes: integer("mes"),
  ano: integer("ano"),
  url: text("url"), // URL do arquivo gerado
  compartilhado: integer("compartilhado", { mode: 'boolean' }).default(false),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  expiresEm: text("expires_em"), // Quando expira o link
});

/**
 * Tabela: Histórico de Sorteios (resultados realizados)
 */
export const historicoSorteios = sqliteTable("historico_sorteios", {
  id: text("id").primaryKey(), // formato: megasena_2789
  sorteioId: text("sorteio_id").notNull(),
  tipo: text("tipo").notNull(),
  numero: integer("numero").notNull(),
  data: text("data").notNull(),
  dezenas: text("dezenas"), // JSON array
  dezenas2: text("dezenas2"), // Dupla Sena
  premios: text("premios"), // JSON array com prêmios
  acumulado: integer("acumulado", { mode: 'boolean' }).default(false),
  valorAcumulado: text("valor_acumulado"),
  ganhadores: integer("ganhadores"),
  arrecadacao: text("arrecadacao"),
  localSorteio: text("local_sorteio"),
  observacoes: text("observacoes"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tipos TypeScript
 */
export type Sorteio = typeof sorteios.$inferSelect;
export type NewSorteio = typeof sorteios.$inferInsert;

export type Alerta = typeof alertas.$inferSelect;
export type NewAlerta = typeof alertas.$inferInsert;

export type Exportacao = typeof exportacoes.$inferSelect;
export type NewExportacao = typeof exportacoes.$inferInsert;

export type HistoricoSorteio = typeof historicoSorteios.$inferSelect;
export type NewHistoricoSorteio = typeof historicoSorteios.$inferInsert;
