/**
 * ============================================================
 * SCHEMA DO BANCO DE DADOS - BOLÕES TIMEMANIA
 * ============================================================
 * 
 * Schema para armazenamento de bolões da Timemania usando Drizzle ORM.
 * Compatível com SQLite/D1 e PostgreSQL.
 * ============================================================
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================
// TABELA: BOLOES_TIMEMANIA
// ============================================================

export const boloesTimemania = sqliteTable('boloes_timemania', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  modalidade: text('modalidade').notNull().default('timemania'),
  
  // Concurso
  concurso: text('concurso').notNull(),
  dataSorteio: text('data_sorteio').notNull(), // ISO 8601
  horarioLimiteCompra: text('horario_limite_compra').notNull(), // ISO 8601
  
  // Apostas (JSON array)
  apostas: text('apostas').notNull(), // JSON: ApostaTimemania[]
  quantidadeApostas: integer('quantidade_apostas').notNull(),
  
  // Cotas
  totalCotas: integer('total_cotas').notNull(),
  cotasVendidas: integer('cotas_vendidas').notNull().default(0),
  valorPorCota: real('valor_por_cota').notNull(),
  
  // Valores
  valorTotalJogo: real('valor_total_jogo').notNull(),
  valorTotalBolao: real('valor_total_bolao').notNull(),
  taxaPlataforma: real('taxa_plataforma').notNull(),
  taxaPercentual: real('taxa_percentual').notNull(),
  
  // Políticas
  politicaCotasNaoVendidas: text('politica_cotas_nao_vendidas').notNull().default('garantido'),
  cotaMinimaConfirmacao: integer('cota_minima_confirmacao'),
  
  // Status
  status: text('status').notNull().default('draft'),
  
  // Estratégia
  estrategia: text('estrategia'),
  termometroAgressividade: text('termometro_agressividade'),
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
  atualizadoEm: text('atualizado_em').notNull(),
  publicadoEm: text('publicado_em'),
  criadoPor: text('criado_por').notNull(),
  
  // Resultado (preenchido após sorteio)
  resultado: text('resultado'), // JSON: números sorteados + time sorteado
  premioTotal: real('premio_total'),
  rateioProcessado: integer('rateio_processado').default(0),
});

// ============================================================
// TABELA: APOSTAS_TIMEMANIA (NORMALIZADA)
// ============================================================

export const apostasTimemania = sqliteTable('apostas_timemania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesTimemania.id),
  ordem: integer('ordem').notNull(),
  
  // Números (JSON array de 10 números)
  numeros: text('numeros').notNull(), // JSON: number[]
  
  // Time do Coração
  timeDoCoracaoId: integer('time_do_coracao_id').notNull(),
  timeDoCoracaoNome: text('time_do_coracao_nome').notNull(),
  timeDoCoracaoUf: text('time_do_coracao_uf').notNull(),
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
});

// ============================================================
// TABELA: COTAS_VENDIDAS_TIMEMANIA
// ============================================================

export const cotasVendidasTimemania = sqliteTable('cotas_vendidas_timemania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesTimemania.id),
  usuarioId: text('usuario_id').notNull(),
  
  // Quantidade de cotas
  quantidadeCotas: integer('quantidade_cotas').notNull(),
  
  // Valores
  valorTotal: real('valor_total').notNull(),
  valorPorCota: real('valor_por_cota').notNull(),
  
  // Pagamento
  statusPagamento: text('status_pagamento').notNull().default('pendente'),
  transacaoId: text('transacao_id'),
  metodoPagamento: text('metodo_pagamento'),
  
  // Prêmio (preenchido após sorteio)
  premioRecebido: real('premio_recebido'),
  percentualPremio: real('percentual_premio'),
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
  atualizadoEm: text('atualizado_em').notNull(),
});

// ============================================================
// TABELA: LOG_STATUS_TIMEMANIA
// ============================================================

export const logStatusTimemania = sqliteTable('log_status_timemania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesTimemania.id),
  
  statusAnterior: text('status_anterior').notNull(),
  statusNovo: text('status_novo').notNull(),
  
  motivo: text('motivo'),
  usuarioId: text('usuario_id'),
  automatico: integer('automatico').notNull().default(1), // 1 = automático, 0 = manual
  
  criadoEm: text('criado_em').notNull(),
});

// ============================================================
// TABELA: TIMES_DO_CORACAO (CACHE/REFERÊNCIA)
// ============================================================

export const timesDoCoracao = sqliteTable('times_do_coracao', {
  id: integer('id').primaryKey(),
  nome: text('nome').notNull(),
  nomeCompleto: text('nome_completo').notNull(),
  uf: text('uf').notNull(),
  slug: text('slug').notNull(),
  ativo: integer('ativo').notNull().default(1),
  
  // Opcional: logo/escudo
  logoUrl: text('logo_url'),
  
  criadoEm: text('criado_em').notNull(),
  atualizadoEm: text('atualizado_em').notNull(),
});

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type BolaoTimemaniaDrizzle = typeof boloesTimemania.$inferSelect;
export type BolaoTimemaniaInsert = typeof boloesTimemania.$inferInsert;

export type ApostaTimemaniaDrizzle = typeof apostasTimemania.$inferSelect;
export type ApostaTimemaniaInsert = typeof apostasTimemania.$inferInsert;

export type CotaVendidaDrizzle = typeof cotasVendidasTimemania.$inferSelect;
export type CotaVendidaInsert = typeof cotasVendidasTimemania.$inferInsert;

export type LogStatusDrizzle = typeof logStatusTimemania.$inferSelect;
export type LogStatusInsert = typeof logStatusTimemania.$inferInsert;

export type TimeDoCoracaoDrizzle = typeof timesDoCoracao.$inferSelect;
export type TimeDoCoracaoInsert = typeof timesDoCoracao.$inferInsert;

export default {
  boloesTimemania,
  apostasTimemania,
  cotasVendidasTimemania,
  logStatusTimemania,
  timesDoCoracao,
};
