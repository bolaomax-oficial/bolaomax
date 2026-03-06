/**
 * ============================================================
 * SCHEMA DO BANCO DE DADOS - BOLÕES DIA DE SORTE
 * ============================================================
 * 
 * Schema para armazenamento de bolões do Dia de Sorte usando Drizzle ORM.
 * Compatível com SQLite/D1 e PostgreSQL.
 * ============================================================
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================
// TABELA: BOLOES_DIA_DE_SORTE
// ============================================================

export const boloesDiaDeSorte = sqliteTable('boloes_dia_de_sorte', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  modalidade: text('modalidade').notNull().default('dia-de-sorte'),
  
  // Concurso
  concurso: text('concurso').notNull(),
  dataSorteio: text('data_sorteio').notNull(), // ISO 8601
  horarioLimiteCompra: text('horario_limite_compra').notNull(), // ISO 8601
  
  // Apostas
  apostas: text('apostas').notNull(), // JSON: ApostaGerada[]
  quantidadeApostas: integer('quantidade_apostas').notNull(),
  quantidadeNumerosPorAposta: integer('quantidade_numeros_por_aposta').notNull().default(7),
  
  // Mês da Sorte
  mesDaSorteId: integer('mes_da_sorte_id').notNull(), // 1-12
  mesDaSorteNome: text('mes_da_sorte_nome').notNull(),
  
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
  resultado: text('resultado'), // JSON: números sorteados + mês sorteado
  premioTotal: real('premio_total'),
  rateioProcessado: integer('rateio_processado').default(0),
});

// ============================================================
// TABELA: APOSTAS_DIA_DE_SORTE (NORMALIZADA)
// ============================================================

export const apostasDiaDeSorte = sqliteTable('apostas_dia_de_sorte', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesDiaDeSorte.id),
  ordem: integer('ordem').notNull(),
  
  // Números (JSON array de 7-15 números)
  numeros: text('numeros').notNull(), // JSON: number[]
  numerosFormatados: text('numeros_formatados').notNull(), // JSON: string[]
  quantidadeNumeros: integer('quantidade_numeros').notNull(),
  
  // Mês da Sorte
  mesDaSorteId: integer('mes_da_sorte_id').notNull(), // 1-12
  mesDaSorteNome: text('mes_da_sorte_nome').notNull(),
  
  // Tipo de aposta
  tipo: text('tipo').notNull().default('principal'), // 'principal' | 'surpresinha'
  
  // Metadados
  criadoEm: text('criado_em').notNull(),
});

// ============================================================
// TABELA: COTAS_VENDIDAS_DIA_DE_SORTE
// ============================================================

export const cotasVendidasDiaDeSorte = sqliteTable('cotas_vendidas_dia_de_sorte', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesDiaDeSorte.id),
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
// TABELA: LOG_STATUS_DIA_DE_SORTE
// ============================================================

export const logStatusDiaDeSorte = sqliteTable('log_status_dia_de_sorte', {
  id: text('id').primaryKey(),
  bolaoId: text('bolao_id').notNull().references(() => boloesDiaDeSorte.id),
  
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

export type BolaoDiaDeSorteDrizzle = typeof boloesDiaDeSorte.$inferSelect;
export type BolaoDiaDeSorteInsert = typeof boloesDiaDeSorte.$inferInsert;

export type ApostaDiaDeSorteDrizzle = typeof apostasDiaDeSorte.$inferSelect;
export type ApostaDiaDeSorteInsert = typeof apostasDiaDeSorte.$inferInsert;

export type CotaVendidaDiaDeSorteDrizzle = typeof cotasVendidasDiaDeSorte.$inferSelect;
export type CotaVendidaDiaDeSorteInsert = typeof cotasVendidasDiaDeSorte.$inferInsert;

export type LogStatusDiaDeSorteDrizzle = typeof logStatusDiaDeSorte.$inferSelect;
export type LogStatusDiaDeSorteInsert = typeof logStatusDiaDeSorte.$inferInsert;

export default {
  boloesDiaDeSorte,
  apostasDiaDeSorte,
  cotasVendidasDiaDeSorte,
  logStatusDiaDeSorte,
};
