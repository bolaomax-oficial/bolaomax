/**
 * ============================================================
 * REGRAS COMERCIAIS LOTOMANIA - BOLÃOMAX
 * ============================================================
 * 
 * Este arquivo contém as regras comerciais específicas da plataforma
 * BolãoMax para bolões de Lotomania.
 * 
 * SEPARADO das regras oficiais da modalidade.
 * ============================================================
 */

import { REGRAS_MODALIDADE_LOTOMANIA } from './regras-modalidade';

// ============================================================
// CONSTANTES COMERCIAIS DO BOLÃOMAX
// ============================================================

/**
 * Taxa da plataforma BolãoMax (percentual sobre valor total dos jogos)
 */
export const TAXA_PLATAFORMA_PERCENTUAL = 10; // 10%

/**
 * Limites de cotas por bolão
 */
export const LIMITES_COTAS = {
  minimo: 10,
  maximo: 500,
  padrao: 100,
} as const;

/**
 * Valor mínimo da cota comercial
 */
export const COTA_MINIMA_COMERCIAL = 5.00; // R$ 5,00

/**
 * Limites de apostas por bolão
 */
export const LIMITES_APOSTAS = {
  minimo: 1,
  maximo: 50,
  padrao: 5,
} as const;

/**
 * Políticas de cotas não vendidas
 */
export const POLITICAS_COTAS = {
  garantido: {
    codigo: "garantido",
    nome: "Garantido",
    descricao: "Bolão é executado independente do número de cotas vendidas. Cotas não vendidas ficam com a plataforma.",
  },
  condicionado: {
    codigo: "condicionado",
    nome: "Condicionado",
    descricao: "Bolão só é executado se atingir 70% das cotas vendidas. Caso contrário, valores são devolvidos.",
  },
  hibrido: {
    codigo: "hibrido",
    nome: "Híbrido",
    descricao: "Bolão é executado com cotas vendidas proporcionalmente redistribuídas entre participantes.",
  },
} as const;

/**
 * Percentual mínimo para execução em política condicionada
 */
export const PERCENTUAL_MINIMO_CONDICIONADO = 70;

/**
 * Horário limite para vendas (horas antes do sorteio)
 */
export const HORAS_LIMITE_VENDA_ANTES_SORTEIO = 2;

/**
 * Status possíveis do bolão
 */
export const STATUS_BOLAO = {
  rascunho: { codigo: "rascunho", nome: "Rascunho", podeComprar: false },
  publicado: { codigo: "publicado", nome: "Publicado", podeComprar: true },
  ativo: { codigo: "ativo", nome: "Ativo", podeComprar: true },
  encerrando: { codigo: "encerrando", nome: "Encerrando", podeComprar: true },
  fechado: { codigo: "fechado", nome: "Fechado", podeComprar: false },
  aguardando_sorteio: { codigo: "aguardando_sorteio", nome: "Aguardando Sorteio", podeComprar: false },
  finalizado: { codigo: "finalizado", nome: "Finalizado", podeComprar: false },
  cancelado: { codigo: "cancelado", nome: "Cancelado", podeComprar: false },
} as const;

// ============================================================
// INTERFACE DE REGRAS COMERCIAIS
// ============================================================

export interface RegrasComerciais {
  // Taxa
  readonly taxaPlataformaPercentual: number;
  
  // Cotas
  readonly totalCotasMinimo: number;
  readonly totalCotasMaximo: number;
  readonly totalCotasPadrao: number;
  readonly cotaMinimaComercial: number;
  
  // Apostas
  readonly apostasPorBolaoMinimo: number;
  readonly apostasPorBolaoMaximo: number;
  readonly apostasPorBolaoPadrao: number;
  
  // Políticas
  readonly politicasCotasDisponiveis: typeof POLITICAS_COTAS;
  readonly percentualMinimoCondicionado: number;
  
  // Tempo
  readonly horasLimiteVendaAntesSorteio: number;
  
  // Status
  readonly statusBolao: typeof STATUS_BOLAO;
}

export const REGRAS_COMERCIAIS: RegrasComerciais = {
  taxaPlataformaPercentual: TAXA_PLATAFORMA_PERCENTUAL,
  
  totalCotasMinimo: LIMITES_COTAS.minimo,
  totalCotasMaximo: LIMITES_COTAS.maximo,
  totalCotasPadrao: LIMITES_COTAS.padrao,
  cotaMinimaComercial: COTA_MINIMA_COMERCIAL,
  
  apostasPorBolaoMinimo: LIMITES_APOSTAS.minimo,
  apostasPorBolaoMaximo: LIMITES_APOSTAS.maximo,
  apostasPorBolaoPadrao: LIMITES_APOSTAS.padrao,
  
  politicasCotasDisponiveis: POLITICAS_COTAS,
  percentualMinimoCondicionado: PERCENTUAL_MINIMO_CONDICIONADO,
  
  horasLimiteVendaAntesSorteio: HORAS_LIMITE_VENDA_ANTES_SORTEIO,
  
  statusBolao: STATUS_BOLAO,
} as const;

// ============================================================
// FUNÇÕES DE CÁLCULO COMERCIAL
// ============================================================

/**
 * Calcula o valor total dos jogos (sem taxa)
 */
export function calcularValorTotalJogos(
  totalApostas: number,
  incluirEspelhos: boolean = false,
  teimosinha: number = 1
): number {
  const apostasEfetivas = incluirEspelhos ? totalApostas * 2 : totalApostas;
  const fatorTeimosinha = teimosinha > 1 ? teimosinha : 1;
  return apostasEfetivas * REGRAS_MODALIDADE_LOTOMANIA.valorApostaBase * fatorTeimosinha;
}

/**
 * Calcula a taxa da plataforma
 */
export function calcularTaxaPlataforma(valorTotalJogos: number): number {
  return valorTotalJogos * (TAXA_PLATAFORMA_PERCENTUAL / 100);
}

/**
 * Calcula o valor total do bolão (jogos + taxa)
 */
export function calcularValorTotalBolao(valorTotalJogos: number): number {
  return valorTotalJogos + calcularTaxaPlataforma(valorTotalJogos);
}

/**
 * Calcula o valor por cota
 */
export function calcularValorPorCota(valorTotalBolao: number, totalCotas: number): number {
  const valorCalculado = valorTotalBolao / totalCotas;
  // Arredondar para cima para múltiplo de R$ 0,50
  return Math.ceil(valorCalculado * 2) / 2;
}

/**
 * Calcula todos os valores financeiros de um bolão
 */
export interface CalculoFinanceiro {
  totalApostas: number;
  totalApostasEfetivas: number; // incluindo espelhos
  totalEspelhos: number;
  fatorTeimosinha: number;
  
  valorApostaBase: number;
  custoApostasBase: number;
  custoEspelhos: number;
  custoPorConcurso: number;
  valorTotalJogos: number;
  
  taxaPlataformaPercentual: number;
  taxaPlataformaValor: number;
  
  valorTotalBolao: number;
  totalCotas: number;
  valorPorCota: number;
  
  resumoCalculo: string;
}

export function calcularFinanceiroBolao(params: {
  totalApostas: number;
  incluirEspelhos: boolean;
  teimosinha: number;
  totalCotas: number;
}): CalculoFinanceiro {
  const { totalApostas, incluirEspelhos, teimosinha, totalCotas } = params;
  
  const totalEspelhos = incluirEspelhos ? totalApostas : 0;
  const totalApostasEfetivas = totalApostas + totalEspelhos;
  const fatorTeimosinha = teimosinha > 1 ? teimosinha : 1;
  
  const valorApostaBase = REGRAS_MODALIDADE_LOTOMANIA.valorApostaBase;
  const custoApostasBase = totalApostas * valorApostaBase;
  const custoEspelhos = totalEspelhos * valorApostaBase;
  const custoPorConcurso = custoApostasBase + custoEspelhos;
  const valorTotalJogos = custoPorConcurso * fatorTeimosinha;
  
  const taxaPlataformaPercentual = TAXA_PLATAFORMA_PERCENTUAL;
  const taxaPlataformaValor = calcularTaxaPlataforma(valorTotalJogos);
  
  const valorTotalBolao = valorTotalJogos + taxaPlataformaValor;
  const valorPorCota = calcularValorPorCota(valorTotalBolao, totalCotas);
  
  // Gerar resumo do cálculo
  let resumoCalculo = `${totalApostas} aposta(s) × R$ ${valorApostaBase.toFixed(2)}`;
  if (incluirEspelhos) {
    resumoCalculo += ` + ${totalEspelhos} espelho(s)`;
  }
  if (fatorTeimosinha > 1) {
    resumoCalculo += ` × ${fatorTeimosinha} concursos (Teimosinha)`;
  }
  resumoCalculo += ` + ${taxaPlataformaPercentual}% taxa = R$ ${valorTotalBolao.toFixed(2)}`;
  
  return {
    totalApostas,
    totalApostasEfetivas,
    totalEspelhos,
    fatorTeimosinha,
    valorApostaBase,
    custoApostasBase,
    custoEspelhos,
    custoPorConcurso,
    valorTotalJogos,
    taxaPlataformaPercentual,
    taxaPlataformaValor,
    valorTotalBolao,
    totalCotas,
    valorPorCota,
    resumoCalculo,
  };
}

/**
 * Calcula o horário limite de venda baseado na data do sorteio
 */
export function calcularHorarioLimiteVenda(dataSorteio: Date): Date {
  const limite = new Date(dataSorteio);
  limite.setHours(limite.getHours() - HORAS_LIMITE_VENDA_ANTES_SORTEIO);
  return limite;
}

/**
 * Verifica se o bolão está aberto para compras
 */
export function verificarBolaoAberto(status: string, horarioLimite: Date): boolean {
  const statusConfig = STATUS_BOLAO[status as keyof typeof STATUS_BOLAO];
  if (!statusConfig || !statusConfig.podeComprar) {
    return false;
  }
  return new Date() < horarioLimite;
}

/**
 * Calcula o percentual de preenchimento
 */
export function calcularPercentualPreenchimento(cotasVendidas: number, totalCotas: number): number {
  if (totalCotas === 0) return 0;
  return Math.round((cotasVendidas / totalCotas) * 100);
}

/**
 * Calcula cotas disponíveis
 */
export function calcularCotasDisponiveis(totalCotas: number, cotasVendidas: number): number {
  return Math.max(0, totalCotas - cotasVendidas);
}

/**
 * Valida se a compra de cotas é permitida
 */
export function validarCompraCotas(params: {
  status: string;
  horarioLimite: Date;
  cotasDisponiveis: number;
  quantidadeSolicitada: number;
}): { permitido: boolean; erro?: string } {
  const { status, horarioLimite, cotasDisponiveis, quantidadeSolicitada } = params;
  
  // Verificar status
  const statusConfig = STATUS_BOLAO[status as keyof typeof STATUS_BOLAO];
  if (!statusConfig) {
    return { permitido: false, erro: "Status inválido" };
  }
  if (!statusConfig.podeComprar) {
    return { permitido: false, erro: `Bolão ${statusConfig.nome} - não é possível comprar cotas` };
  }
  
  // Verificar horário
  if (new Date() >= horarioLimite) {
    return { permitido: false, erro: "Horário limite para compras expirado" };
  }
  
  // Verificar disponibilidade
  if (quantidadeSolicitada <= 0) {
    return { permitido: false, erro: "Quantidade deve ser maior que zero" };
  }
  if (quantidadeSolicitada > cotasDisponiveis) {
    return { permitido: false, erro: `Apenas ${cotasDisponiveis} cotas disponíveis` };
  }
  
  return { permitido: true };
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default {
  REGRAS_COMERCIAIS,
  TAXA_PLATAFORMA_PERCENTUAL,
  LIMITES_COTAS,
  COTA_MINIMA_COMERCIAL,
  LIMITES_APOSTAS,
  POLITICAS_COTAS,
  PERCENTUAL_MINIMO_CONDICIONADO,
  HORAS_LIMITE_VENDA_ANTES_SORTEIO,
  STATUS_BOLAO,
  calcularValorTotalJogos,
  calcularTaxaPlataforma,
  calcularValorTotalBolao,
  calcularValorPorCota,
  calcularFinanceiroBolao,
  calcularHorarioLimiteVenda,
  verificarBolaoAberto,
  calcularPercentualPreenchimento,
  calcularCotasDisponiveis,
  validarCompraCotas,
};
