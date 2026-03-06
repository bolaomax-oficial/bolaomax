/**
 * ============================================================
 * SCHEMA DO BANCO DE DADOS - BOLÕES LOTOMANIA
 * ============================================================
 * 
 * Schema para armazenamento de bolões da Lotomania usando Drizzle ORM.
 * Compatível com SQLite/D1 e PostgreSQL.
 * ============================================================
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================
// TABELA: BOLOES_LOTOMANIA
// ============================================================

export const boloesLotomania = sqliteTable('boloes_lotomania', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  modalidade: text('modalidade').notNull().default('lotomania'),
  
  // Concurso
  concurso: text('concurso').notNull(),
  dataSorteio: text('data_sorteio').notNull(), // ISO 8601
  horarioLimiteCompra: text('horario_limite_compra').notNull(), // ISO 8601
  
  // Pool e Apostas
  poolDezenas: text('pool_dezenas').notNull(), // JSON: number[] (geralmente 80 dezenas)
  apostas: text('apostas').notNull(), // JSON: ApostaGerada[]
  quantidadeApostas: integer('quantidade_apostas').notNull(),
  quantidadeApostasEspelho: integer('quantidade_apostas_espelho').notNull().default(0),
  
  // Teimosinha
  teimosinhaAtiva: integer('teimosinha_ativa').notNull().default(0),
  teimosinhaConcursos: integer('teimosinha_concursos').default(1),
  
  // Cotas
  totalCotas: integer('total_cotas').notNull(),
  cotasVendidas: integer('cotas_vendidas').notNull().default(0),
  valorPorCota: real('valor_por_cota').notNull(),
  
  // Valores
  valorTotalJogos: real('valor_total_jogos').notNull(),
  valorTotalBolao: real('valor_total_bolao').notNull(),
  taxaPlataforma: real('taxa_plataforma').notNull(),
  taxaPercentual: real('taxa_percentual').notNull(),
  
  // Políticas
  politicaCotasNaoVendidas: text('politica_cotas_nao_vendidas').notNull().default('garantido'),
  cotaMinimaConfirmacao: integer('cota_minima_confirmacao'),
  
  // Status
  status: text('status').notNull().default('rascunho'),
  
  // Estratégia
  estrategia: text('estrategia'), // JSON: ConfiguracaoEstrategia
  termometroAgressividade: text('termometro_agressividade'),
  termometroScore: integer('termometro_score'),
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
  atualizadoEm: text('atualizado_em').notNull(),
  publicadoEm: text('publicado_em'),
  criadoPor: text('criado_por').notNull(),
  
  // Resultado (preenchido após sorteio)
  resultado: text('resultado'), // JSON: números sorteados
  premioTotal: real('premio_total'),
  rateioProcessado: integer('rateio_processado').default(0),
});

// ============================================================
// TABELA: APOSTAS_LOTOMANIA (NORMALIZADA)
// ============================================================

export const apostasLotomania = sqliteTable('apostas_lotomania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesLotomania.id),
  ordem: integer('ordem').notNull(),
  
  // Números (JSON array de 50 números)
  numeros: text('numeros').notNull(), // JSON: number[]
  numerosFormatados: text('numeros_formatados').notNull(), // JSON: string[]
  
  // Tipo de aposta
  tipo: text('tipo').notNull().default('principal'), // 'principal' | 'espelho'
  apostaOrigemId: text('aposta_origem_id'), // Para espelhos
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
});

// ============================================================
// TABELA: COTAS_VENDIDAS_LOTOMANIA
// ============================================================

export const cotasVendidasLotomania = sqliteTable('cotas_vendidas_lotomania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesLotomania.id),
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
// TABELA: LOG_STATUS_LOTOMANIA
// ============================================================

export const logStatusLotomania = sqliteTable('log_status_lotomania', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesLotomania.id),
  
  statusAnterior: text('status_anterior').notNull(),
  statusNovo: text('status_novo').notNull(),
  
  motivo: text('motivo'),
  usuarioId: text('usuario_id'),
  automatico: integer('automatico').notNull().default(1), // 1 = automático, 0 = manual
  
  criadoEm: text('criado_em').notNull(),
});

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type BolaoLotomaniaDrizzle = typeof boloesLotomania.$inferSelect;
export type BolaoLotomaniaInsert = typeof boloesLotomania.$inferInsert;

export type ApostaLotomaniaDrizzle = typeof apostasLotomania.$inferSelect;
export type ApostaLotomaniaInsert = typeof apostasLotomania.$inferInsert;

export type CotaVendidaLotomaniaDrizzle = typeof cotasVendidasLotomania.$inferSelect;
export type CotaVendidaLotomaniaInsert = typeof cotasVendidasLotomania.$inferInsert;

export type LogStatusLotomaniaDrizzle = typeof logStatusLotomania.$inferSelect;
export type LogStatusLotomaniaInsert = typeof logStatusLotomania.$inferInsert;

export default {
  boloesLotomania,
  apostasLotomania,
  cotasVendidasLotomania,
  logStatusLotomania,
};
