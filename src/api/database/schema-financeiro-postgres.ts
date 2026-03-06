import { pgTable, text, integer, real, boolean, timestamp, uuid, jsonb, varchar } from "drizzle-orm/pg-core"

// ============================================================
// SISTEMA FINANCEIRO
// ============================================================

/**
 * Transações Financeiras (já existe no schema principal)
 * Extendendo com novos campos
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  
  // Tipo de transação
  tipo: varchar("tipo", { length: 50 }).notNull(), 
  // deposito, saque, compra_cota, premio, reembolso, taxa, ajuste, bonus
  
  valor: real("valor").notNull(),
  saldoAnterior: real("saldo_anterior").notNull(),
  saldoNovo: real("saldo_novo").notNull(),
  
  // Status
  status: varchar("status", { length: 20 }).default("pendente"),
  // pendente, processando, confirmado, cancelado, falhou
  
  // Informações de pagamento
  metodoPagamento: varchar("metodo_pagamento", { length: 20 }),
  // pix, cartao, boleto, saldo
  
  gatewayTransactionId: text("gateway_transaction_id"),
  gatewayStatus: varchar("gateway_status", { length: 50 }),
  
  // Referências
  bolaoId: uuid("bolao_id"),
  participacaoId: uuid("participacao_id"),
  
  // Detalhes
  descricao: text("descricao"),
  metadata: jsonb("metadata"), // Dados extras (comprovantes, etc)
  
  // Controle
  processadoEm: timestamp("processado_em"),
  criadoEm: timestamp("criado_em").defaultNow(),
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});

/**
 * Fundo de Registro
 * Capital de giro para registrar bolões
 */
export const fundoRegistro = pgTable("fundo_registro", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Saldos
  saldoDisponivel: real("saldo_disponivel").notNull().default(0),
  saldoBloqueado: real("saldo_bloqueado").notNull().default(0),
  saldoTotal: real("saldo_total").notNull().default(0), // disponivel + bloqueado
  
  // Limites
  limiteMinimo: real("limite_minimo").default(5000), // Alerta se abaixo
  limiteIdeal: real("limite_ideal").default(20000), // Meta de operação
  
  // Estatísticas
  totalUtilizado: real("total_utilizado").default(0), // Histórico total usado
  totalReposto: real("total_reposto").default(0), // Histórico total reposto
  
  // Controle
  ultimaAtualizacao: timestamp("ultima_atualizacao").defaultNow(),
  historico: jsonb("historico"), // Array de movimentações
});

/**
 * Reservas do Fundo
 * Rastreamento de uso do fundo por bolão
 */
export const reservasFundo = pgTable("reservas_fundo", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  bolaoId: uuid("bolao_id").notNull(),
  
  // Valores
  valorReservado: real("valor_reservado").notNull(),
  valorUtilizado: real("valor_utilizado").default(0),
  valorReposto: real("valor_reposto").default(0),
  
  // Status
  status: varchar("status", { length: 20 }).default("reservado"),
  // reservado, utilizado, reposto_parcial, reposto_total, cancelado
  
  // Datas
  dataReserva: timestamp("data_reserva").defaultNow(),
  dataUtilizacao: timestamp("data_utilizacao"),
  dataReposicao: timestamp("data_reposicao"),
  
  // Referência ao registro da lotérica
  codigoRegistro: text("codigo_registro"),
  
  // Metadados
  metadata: jsonb("metadata"),
});

/**
 * Repasses do Gateway
 * Controle de transferências do Pagar.me para conta bancária
 */
export const repassesGateway = pgTable("repasses_gateway", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Identificação
  gatewayId: text("gateway_id"), // ID do repasse no Pagar.me
  
  // Valores
  valorBruto: real("valor_bruto").notNull(), // Valor total das transações
  valorTaxas: real("valor_taxas").notNull(), // Taxas do gateway
  valorLiquido: real("valor_liquido").notNull(), // Valor recebido
  
  // Período
  periodoInicio: timestamp("periodo_inicio").notNull(),
  periodoFim: timestamp("periodo_fim").notNull(),
  
  // Status
  status: varchar("status", { length: 20 }).default("pendente"),
  // pendente, processado, conciliado
  
  // Datas
  dataPrevisao: timestamp("data_previsao"),
  dataRecebimento: timestamp("data_recebimento"),
  dataConciliacao: timestamp("data_conciliacao"),
  
  // Transações relacionadas
  transacoes: jsonb("transacoes"), // Array de IDs
  
  // Controle
  criadoEm: timestamp("criado_em").defaultNow(),
});

/**
 * Saques
 * Solicitações de saque pelos usuários
 */
export const saques = pgTable("saques", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  userId: uuid("user_id").notNull(),
  
  // Valores
  valorSolicitado: real("valor_solicitado").notNull(),
  valorTaxa: real("valor_taxa").default(0),
  valorLiquido: real("valor_liquido").notNull(),
  
  // Dados bancários
  tipoConta: varchar("tipo_conta", { length: 20 }), // pix, ted, doc
  chavePix: text("chave_pix"),
  banco: varchar("banco", { length: 10 }),
  agencia: varchar("agencia", { length: 10 }),
  conta: varchar("conta", { length: 20 }),
  tipoConta2: varchar("tipo_conta2", { length: 20 }), // corrente, poupanca
  
  // Status
  status: varchar("status", { length: 20 }).default("solicitado"),
  // solicitado, aprovado, processando, concluido, recusado, cancelado
  
  // Controle
  motivoRecusa: text("motivo_recusa"),
  comprovante: text("comprovante"), // URL ou hash
  
  // Datas
  dataSolicitacao: timestamp("data_solicitacao").defaultNow(),
  dataAprovacao: timestamp("data_aprovacao"),
  dataProcessamento: timestamp("data_processamento"),
  dataConclusao: timestamp("data_conclusao"),
  
  // Auditoria
  apronadoPor: uuid("aprovado_por"),
  processadoPor: uuid("processado_por"),
});

/**
 * Logs de Auditoria Financeira
 */
export const auditFinanceira = pgTable("audit_financeira", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  tipo: varchar("tipo", { length: 50 }).notNull(),
  // saldo_alterado, fundo_utilizado, fundo_reposto, saque_aprovado, etc
  
  userId: uuid("user_id"),
  adminId: uuid("admin_id"),
  
  // Dados
  dadosAntes: jsonb("dados_antes"),
  dadosDepois: jsonb("dados_depois"),
  
  // Contexto
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  
  criadoEm: timestamp("criado_em").defaultNow(),
});

/**
 * Configurações Financeiras
 */
export const configFinanceira = pgTable("config_financeira", {
  id: uuid("id").primaryKey().defaultRandom(),
  
  // Taxas
  taxaSaquePercentual: real("taxa_saque_percentual").default(0), // %
  taxaSaqueFixa: real("taxa_saque_fixa").default(0), // R$
  taxaSaqueMinima: real("taxa_saque_minima").default(2.00),
  
  // Limites
  saqueMinimo: real("saque_minimo").default(20.00),
  saqueMaximo: real("saque_maximo").default(10000.00),
  saqueDiarioMaximo: real("saque_diario_maximo").default(5000.00),
  
  // Prazos
  prazoAprovacaoSaque: integer("prazo_aprovacao_saque").default(24), // horas
  prazoProcessamentoSaque: integer("prazo_processamento_saque").default(2), // dias úteis
  
  // Fundo de Registro
  fundoAportesAutomaticos: boolean("fundo_aportes_automaticos").default(true),
  fundoPercentualReserva: real("fundo_percentual_reserva").default(150), // 150% = 1.5x o necessário
  
  // Alertas
  alertaFundoBaixo: boolean("alerta_fundo_baixo").default(true),
  alertaFundoBaixoPercentual: real("alerta_fundo_baixo_percentual").default(20), // %
  
  atualizadoEm: timestamp("atualizado_em").defaultNow(),
});
