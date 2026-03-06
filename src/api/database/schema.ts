import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

// ============================================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================================

/**
 * Tabela de Usuários
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  cpf: text("cpf"),
  telefone: text("telefone"),
  saldo: real("saldo").default(0),
  avatar: text("avatar"),
  role: text("role").default("user"), // user, admin
  status: text("status").default("active"), // active, suspended, deleted
  emailVerified: integer("email_verified", { mode: 'boolean' }).default(false),
  telefoneVerified: integer("telefone_verified", { mode: 'boolean' }).default(false),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Tabela de Sessões (Better Auth)
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// BOLÕES
// ============================================================

/**
 * Tabela de Bolões
 */
export const boloes = sqliteTable("boloes", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  tipo: text("tipo").notNull(), // megasena, lotofacil, quina, etc
  concurso: integer("concurso"),
  status: text("status").default("aberto"), // aberto, fechado, sorteado, finalizado
  
  // Configuração do bolão
  numerosDezenas: text("numeros_dezenas").notNull(), // JSON array com as dezenas
  quantidadeCotas: integer("quantidade_cotas").notNull(),
  cotasDisponiveis: integer("cotas_disponiveis").notNull(),
  valorCota: real("valor_cota").notNull(),
  
  // Datas
  dataAbertura: text("data_abertura").notNull(),
  dataFechamento: text("data_fechamento").notNull(),
  dataSorteio: text("data_sorteio").notNull(),
  
  // Premiação
  premiado: integer("premiado", { mode: 'boolean' }).default(false),
  valorPremio: real("valor_premio").default(0),
  faixaPremio: text("faixa_premio"), // 6 números, 5 números, etc
  acertos: integer("acertos"),
  
  // Gestão
  criadoPor: text("criado_por").notNull().references(() => users.id),
  aprovado: integer("aprovado", { mode: 'boolean' }).default(false),
  aprovadoPor: text("aprovado_por"),
  
  // Metadados
  visualizacoes: integer("visualizacoes").default(0),
  compartilhamentos: integer("compartilhamentos").default(0),
  metadados: text("metadados"), // JSON com dados extras
  
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

/**
 * Participações nos Bolões
 */
export const participacoes = sqliteTable("participacoes", {
  id: text("id").primaryKey(),
  bolaoId: text("bolao_id").notNull().references(() => boloes.id, { onDelete: 'cascade' }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  quantidadeCotas: integer("quantidade_cotas").notNull().default(1),
  valorTotal: real("valor_total").notNull(),
  
  status: text("status").default("ativa"), // ativa, cancelada, premiada
  pagamentoConfirmado: integer("pagamento_confirmado", { mode: 'boolean' }).default(false),
  transacaoId: text("transacao_id"),
  
  // Prêmio (se ganhar)
  premiado: integer("premiado", { mode: 'boolean' }).default(false),
  valorPremio: real("valor_premio").default(0),
  premioRecebido: integer("premio_recebido", { mode: 'boolean' }).default(false),
  
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// CALENDÁRIO E SORTEIOS
// ============================================================

export const lotteryDraws = sqliteTable("lottery_draws", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(),
  data: text("data").notNull(),
  hora: text("hora"),
  diaSemana: text("dia_semana"),
  concurso: integer("concurso"),
  premioEstimado: real("premio_estimado"),
  local: text("local"),
  observacoes: text("observacoes"),
  especial: integer("especial", { mode: 'boolean' }).default(false),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

export const lotteryResults = sqliteTable("lottery_results", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(),
  concurso: integer("concurso").notNull(),
  data: text("data").notNull(),
  dezenas: text("dezenas").notNull(), // JSON array
  dezenas2: text("dezenas2"),
  premios: text("premios").notNull(), // JSON array
  acumulado: integer("acumulado", { mode: 'boolean' }).default(false),
  valorAcumulado: real("valor_acumulado").default(0),
  proximoConcurso: text("proximo_concurso"),
  timeCoracao: text("time_coracao"),
  mesDaSorte: text("mes_da_sorte"),
  metadados: text("metadados"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// TRANSAÇÕES E FINANCEIRO
// ============================================================

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  tipo: text("tipo").notNull(), // compra_cota, premio, recarga, saque
  valor: real("valor").notNull(),
  status: text("status").notNull(), // pendente, aprovado, rejeitado, cancelado
  
  // Pagamento
  metodoPagamento: text("metodo_pagamento"), // pix, cartao, boleto
  pagSeguroTransactionId: text("pagseguro_transaction_id"),
  pagSeguroStatus: text("pagseguro_status"),
  
  // Relacionamentos
  bolaoId: text("bolao_id"),
  participacaoId: text("participacao_id"),
  
  // Metadados
  descricao: text("descricao"),
  metadados: text("metadados"), // JSON
  
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text("atualizado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// NOTIFICAÇÕES E ALERTAS
// ============================================================

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tipo: text("tipo").notNull(), // bolao_fechado, sorteio, premio, sistema
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  link: text("link"),
  lida: integer("lida", { mode: 'boolean' }).default(false),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// LOGS E ANALYTICS
// ============================================================

export const systemLogs = sqliteTable("system_logs", {
  id: text("id").primaryKey(),
  nivel: text("nivel").notNull(), // info, warn, error, debug
  categoria: text("categoria").notNull(),
  mensagem: text("mensagem").notNull(),
  detalhes: text("detalhes"),
  usuarioId: text("usuario_id"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(),
  tipo: text("tipo").notNull(),
  categoria: text("categoria"),
  acao: text("acao"),
  label: text("label"),
  valor: real("valor"),
  usuarioId: text("usuario_id"),
  sessaoId: text("sessao_id"),
  dispositivo: text("dispositivo"),
  navegador: text("navegador"),
  origem: text("origem"),
  metadados: text("metadados"),
  criadoEm: text("criado_em").default(sql`CURRENT_TIMESTAMP`),
});

// ============================================================
// TIPOS TYPESCRIPT
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Bolao = typeof boloes.$inferSelect;
export type NewBolao = typeof boloes.$inferInsert;

export type Participacao = typeof participacoes.$inferSelect;
export type NewParticipacao = typeof participacoes.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type LotteryDraw = typeof lotteryDraws.$inferSelect;
export type NewLotteryDraw = typeof lotteryDraws.$inferInsert;

export type LotteryResult = typeof lotteryResults.$inferSelect;
export type NewLotteryResult = typeof lotteryResults.$inferInsert;

export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
