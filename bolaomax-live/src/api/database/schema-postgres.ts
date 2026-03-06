import { pgTable, text, integer, real, boolean, timestamp, uuid, jsonb, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// ============================================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================================

/**
 * Tabela de Usuários
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  cpf: text("cpf"),
  telefone: text("telefone"),
  saldo: real("saldo").default(0),
  avatar: text("avatar"),
  role: text("role").default("user"), // user, admin
  status: text("status").default("active"), // active, suspended, deleted
  emailVerified: boolean("email_verified").default(false),
  telefoneVerified: boolean("telefone_verified").default(false),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

/**
 * Tabela de Sessões (Better Auth)
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ============================================================
// BOLÕES
// ============================================================

/**
 * Tabela de Bolões
 */
export const boloes = pgTable("boloes", {
  id: uuid("id").primaryKey().defaultRandom(),
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
  dataAbertura: timestamp("data_abertura").notNull(),
  dataFechamento: timestamp("data_fechamento").notNull(),
  dataSorteio: timestamp("data_sorteio").notNull(),
  
  // Premiação
  premiado: boolean("premiado").default(false),
  valorPremio: real("valor_premio").default(0),
  faixaPremio: text("faixa_premio"), // 6 números, 5 números, etc
  acertos: integer("acertos"),
  
  // Gestão
  criadoPor: uuid("criado_por").notNull().references(() => users.id),
  aprovado: boolean("aprovado").default(false),
  aprovadoPor: uuid("aprovado_por"),
  
  // Metadados
  visualizacoes: integer("visualizacoes").default(0),
  compartilhamentos: integer("compartilhamentos").default(0),
  metadados: text("metadados"), // JSON com dados extras
  
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

/**
 * Participações nos Bolões
 */
export const participacoes = pgTable("participacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  bolaoId: uuid("bolao_id").notNull().references(() => boloes.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  quantidadeCotas: integer("quantidade_cotas").notNull().default(1),
  valorTotal: real("valor_total").notNull(),
  
  status: text("status").default("ativa"), // ativa, cancelada, premiada
  pagamentoConfirmado: boolean("pagamento_confirmado").default(false),
  transacaoId: text("transacao_id"),
  
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

// ============================================================
// FINANCEIRO
// ============================================================

/**
 * Transações Financeiras
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tipo: text("tipo").notNull(), // deposito, saque, compra_cota, premio, reembolso
  valor: real("valor").notNull(),
  saldoAnterior: real("saldo_anterior").notNull(),
  saldoNovo: real("saldo_novo").notNull(),
  
  // Informações de pagamento
  metodoPagamento: text("metodo_pagamento"), // pix, cartao, boleto
  statusPagamento: text("status_pagamento").default("pendente"), // pendente, confirmado, cancelado
  transacaoExternaId: text("transacao_externa_id"), // ID do PagSeguro, etc
  
  // Referências
  bolaoId: uuid("bolao_id"),
  participacaoId: uuid("participacao_id"),
  
  descricao: text("descricao"),
  metadados: text("metadados"), // JSON
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ============================================================
// NOTIFICAÇÕES
// ============================================================

/**
 * Notificações
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  tipo: text("tipo").notNull(), // bolao_criado, participacao_confirmada, sorteio_realizado, premio_ganho
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  
  lida: boolean("lida").default(false),
  bolaoId: uuid("bolao_id"),
  
  metadados: text("metadados"), // JSON
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ============================================================
// SORTEIOS E RESULTADOS
// ============================================================

/**
 * Sorteios (histórico de concursos)
 */
export const lottery_draws = pgTable("lottery_draws", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: text("tipo").notNull(), // megasena, lotofacil, quina
  concurso: integer("concurso").notNull(),
  
  dataSorteio: timestamp("data_sorteio").notNull(),
  numerossorteados: text("numeros_sorteados").notNull(), // JSON array
  
  premioTotal: real("premio_total"),
  ganhadores: text("ganhadores"), // JSON com informações dos ganhadores
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

/**
 * Resultados dos Bolões
 */
export const lottery_results = pgTable("lottery_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  bolaoId: uuid("bolao_id").notNull().references(() => boloes.id),
  drawId: uuid("draw_id").notNull().references(() => lottery_draws.id),
  
  acertos: integer("acertos").notNull(),
  faixaPremio: text("faixa_premio"),
  valorPremio: real("valor_premio"),
  
  processado: boolean("processado").default(false),
  processadoEm: timestamp("processado_em"),
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ============================================================
// AUDITORIA E LOGS
// ============================================================

/**
 * Logs do Sistema
 */
export const system_logs = pgTable("system_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  nivel: text("nivel").notNull(), // info, warning, error
  modulo: text("modulo").notNull(), // auth, boloes, pagamentos
  mensagem: text("mensagem").notNull(),
  
  userId: uuid("user_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  metadados: text("metadados"), // JSON
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

/**
 * Analytics Events
 */
export const analytics_events = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  evento: text("evento").notNull(), // page_view, bolao_visualizado, cota_comprada
  
  userId: uuid("user_id"),
  bolaoId: uuid("bolao_id"),
  
  propriedades: text("propriedades"), // JSON
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

// ============================================================
// SISTEMA FINANCEIRO
// ============================================================

/**
 * Transações Financeiras (já existe no schema principal)
 * Extendendo com novos campos
 */

// ============================================================
// SISTEMA FINANCEIRO - FUNDO E REPASSES
// ============================================================

export const fundoRegistro = pgTable("fundo_registro", {
  id: uuid("id").primaryKey().defaultRandom(),
  saldoDisponivel: real("saldo_disponivel").notNull().default(0),
  saldoBloqueado: real("saldo_bloqueado").notNull().default(0),
  saldoTotal: real("saldo_total").notNull().default(0),
  limiteMinimo: real("limite_minimo").default(5000),
  limiteIdeal: real("limite_ideal").default(20000),
  totalUtilizado: real("total_utilizado").default(0),
  totalReposto: real("total_reposto").default(0),
  ultimaAtualizacao: timestamp("ultima_atualizacao").defaultNow(),
  historico: text("historico"),
});

export const reservasFundo = pgTable("reservas_fundo", {
  id: uuid("id").primaryKey().defaultRandom(),
  bolaoId: uuid("bolao_id").notNull(),
  valorReservado: real("valor_reservado").notNull(),
  valorUtilizado: real("valor_utilizado").default(0),
  valorReposto: real("valor_reposto").default(0),
  status: text("status").default("reservado"),
  dataReserva: timestamp("data_reserva").defaultNow(),
  dataUtilizacao: timestamp("data_utilizacao"),
  dataReposicao: timestamp("data_reposicao"),
  codigoRegistro: text("codigo_registro"),
  metadata: text("metadata"),
});

export const repassesGateway = pgTable("repasses_gateway", {
  id: uuid("id").primaryKey().defaultRandom(),
  gatewayId: text("gateway_id"),
  valorBruto: real("valor_bruto").notNull(),
  valorTaxas: real("valor_taxas").notNull(),
  valorLiquido: real("valor_liquido").notNull(),
  periodoInicio: timestamp("periodo_inicio").notNull(),
  periodoFim: timestamp("periodo_fim").notNull(),
  status: text("status").default("pendente"),
  dataPrevisao: timestamp("data_previsao"),
  dataRecebimento: timestamp("data_recebimento"),
  dataConciliacao: timestamp("data_conciliacao"),
  transacoes: text("transacoes"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const saques = pgTable("saques", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  valorSolicitado: real("valor_solicitado").notNull(),
  valorTaxa: real("valor_taxa").default(0),
  valorLiquido: real("valor_liquido").notNull(),
  tipoConta: text("tipo_conta"),
  chavePix: text("chave_pix"),
  banco: text("banco"),
  agencia: text("agencia"),
  conta: text("conta"),
  tipoConta2: text("tipo_conta2"),
  status: text("status").default("solicitado"),
  motivoRecusa: text("motivo_recusa"),
  comprovante: text("comprovante"),
  dataSolicitacao: timestamp("data_solicitacao").defaultNow(),
  dataAprovacao: timestamp("data_aprovacao"),
  dataProcessamento: timestamp("data_processamento"),
  dataConclusao: timestamp("data_conclusao"),
  apronadoPor: uuid("aprovado_por"),
  processadoPor: uuid("processado_por"),
});

export const auditFinanceira = pgTable("audit_financeira", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: text("tipo").notNull(),
  userId: uuid("user_id"),
  adminId: uuid("admin_id"),
  dadosAntes: text("dados_antes"),
  dadosDepois: text("dados_depois"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  criadoEm: timestamp("criado_em").defaultNow(),
});

export const configFinanceira = pgTable("config_financeira", {
  id: uuid("id").primaryKey().defaultRandom(),
  taxaSaquePercentual: real("taxa_saque_percentual").default(0),
  taxaSaqueFixa: real("taxa_saque_fixa").default(0),
  taxaSaqueMinima: real("taxa_saque_minima").default(2.00),
  saqueMinimo: real("saque_minimo").default(20.00),
  saqueMaximo: real("saque_maximo").default(10000.00),
  saqueDiarioMaximo: real("saque_diario_maximo").default(5000.00),
  prazoAprovacaoSaque: integer("prazo_aprovacao_saque").default(24),
  prazoProcessamentoSaque: integer("prazo_processamento_saque").default(2),
  fundoAportesAutomaticos: boolean("fundo_aportes_automaticos").default(true),
  fundoPercentualReserva: real("fundo_percentual_reserva").default(150),
  alertaFundoBaixo: boolean("alerta_fundo_baixo").default(true),
  alertaFundoBaixoPercentual: real("alerta_fundo_baixo_percentual").default(20),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});
