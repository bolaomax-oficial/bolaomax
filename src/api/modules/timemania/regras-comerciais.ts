/**
 * ============================================================
 * REGRAS COMERCIAIS - BOLÃOMAX (TIMEMANIA)
 * ============================================================
 * 
 * Este arquivo contém as regras COMERCIAIS da plataforma BolãoMax
 * aplicadas especificamente à modalidade Timemania.
 * 
 * ESTAS REGRAS SÃO CONFIGURÁVEIS e podem ser alteradas pela
 * plataforma para fins de negócio, sem afetar as regras da
 * modalidade oficial.
 * 
 * Separação clara:
 * - regras-modalidade.ts = regras da Caixa (imutáveis)
 * - regras-comerciais.ts = regras do BolãoMax (configuráveis)
 * ============================================================
 */

import { REGRAS_MODALIDADE_TIMEMANIA, ApostaTimemania, validarListaApostasTimemania } from './regras-modalidade';

// ============================================================
// TIPOS - REGRAS COMERCIAIS
// ============================================================

export interface RegrasComerciais {
  // Limites comerciais
  cotaMinimaComercial: number;
  cotaMaximaComercial: number;
  totalCotasMinimo: number;
  totalCotasMaximo: number;
  
  // Configurações de card
  quantidadeMaximaJogosPorCard: number;
  quantidadeMinimaJogosPorCard: number;
  
  // Taxas e margens
  taxaPlataformaPercentual: number;
  taxaPlataformaMinima: number;
  taxaPlataformaMaxima: number;
  
  // Limites de tempo
  minutosAntesParaClosing: number;
  minutosAntesParaBloquearCompra: number;
  
  // Políticas
  politicasCotasNaoVendidas: PoliticaCotasNaoVendidas[];
  
  // Termômetro de agressividade
  termometroConfig: TermometroConfig;
  
  // Formatação
  moeda: string;
  locale: string;
}

export type PoliticaCotasNaoVendidas = 'garantido' | 'condicionado' | 'hibrido';

export interface TermometroConfig {
  baixa: { min: number; max: number; label: string; cor: string };
  media: { min: number; max: number; label: string; cor: string };
  alta: { min: number; max: number; label: string; cor: string };
}

export type StatusBolao = 
  | 'draft' 
  | 'active' 
  | 'closing' 
  | 'closed' 
  | 'aguardando_resultado' 
  | 'finalizado' 
  | 'cancelado';

export interface ResultadoValidacaoComercial {
  valido: boolean;
  erros: string[];
  avisos: string[];
  camadaValidacao: 'COMERCIAL';
}

export interface CalculoBolao {
  // Valores calculados
  valorTotalJogo: number;
  valorTotalBolao: number;
  valorPorCota: number;
  taxaPlataforma: number;
  valorLiquidoBolao: number;
  
  // Métricas
  margemPercentual: number;
  termometroAgressividade: 'baixa' | 'media' | 'alta';
  
  // Status
  cotasDisponiveis: number;
  percentualPreenchimento: number;
  
  // Detalhamento
  detalhamento: {
    valorApostaBase: number;
    quantidadeApostas: number;
    totalCotas: number;
    cotasVendidas: number;
  };
}

export interface BolaoTimemania {
  id: string;
  titulo: string;
  descricao: string;
  modalidade: 'timemania';
  
  // Concurso
  concurso: string;
  dataSorteio: Date;
  horarioLimiteCompra: Date;
  
  // Apostas
  apostas: ApostaTimemania[];
  quantidadeApostas: number;
  
  // Cotas
  totalCotas: number;
  cotasVendidas: number;
  cotasDisponiveis: number;
  valorPorCota: number;
  
  // Valores
  valorTotalBolao: number;
  taxaPlataforma: number;
  
  // Políticas
  politicaCotasNaoVendidas: PoliticaCotasNaoVendidas;
  cotaMinimaConfirmacao?: number;
  
  // Status
  status: StatusBolao;
  
  // Estratégia
  estrategia: string;
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
  criadoPor: string;
  publicadoEm?: Date;
}

// ============================================================
// CONSTANTES - REGRAS COMERCIAIS BOLÃOMAX
// ============================================================

export const REGRAS_COMERCIAIS_TIMEMANIA: RegrasComerciais = {
  // Limites comerciais (PODEM ser maiores que os da modalidade)
  cotaMinimaComercial: 20.00, // R$ 20,00 mínimo no BolãoMax
  cotaMaximaComercial: 500.00,
  totalCotasMinimo: 10,
  totalCotasMaximo: 100,
  
  // Configurações de card
  quantidadeMaximaJogosPorCard: 3, // Até 3 bolões por card
  quantidadeMinimaJogosPorCard: 1,
  
  // Taxas e margens
  taxaPlataformaPercentual: 10, // 10% de taxa
  taxaPlataformaMinima: 5.00,
  taxaPlataformaMaxima: 100.00,
  
  // Limites de tempo
  minutosAntesParaClosing: 60, // 60 min antes = status closing
  minutosAntesParaBloquearCompra: 5, // 5 min antes = bloqueia compra
  
  // Políticas disponíveis
  politicasCotasNaoVendidas: ['garantido', 'condicionado', 'hibrido'],
  
  // Termômetro de agressividade
  termometroConfig: {
    baixa: { min: 0, max: 33, label: 'Baixa', cor: '#22c55e' }, // Verde
    media: { min: 34, max: 66, label: 'Média', cor: '#eab308' }, // Amarelo
    alta: { min: 67, max: 100, label: 'Alta', cor: '#ef4444' }, // Vermelho
  },
  
  // Formatação
  moeda: 'BRL',
  locale: 'pt-BR',
};

// ============================================================
// STATUS E TRANSIÇÕES
// ============================================================

export const STATUS_PERMITIDOS_COMPRA: StatusBolao[] = ['active', 'closing'];
export const STATUS_PERMITIDOS_EDICAO: StatusBolao[] = ['draft'];
export const STATUS_PERMITIDOS_CANCELAMENTO: StatusBolao[] = ['draft', 'active', 'closing'];

export const TRANSICOES_STATUS: Record<StatusBolao, StatusBolao[]> = {
  draft: ['active', 'cancelado'],
  active: ['closing', 'closed', 'cancelado'],
  closing: ['closed', 'cancelado'],
  closed: ['aguardando_resultado', 'cancelado'],
  aguardando_resultado: ['finalizado', 'cancelado'],
  finalizado: [],
  cancelado: [],
};

export const STATUS_LABELS: Record<StatusBolao, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  closing: 'Encerrando',
  closed: 'Encerrado',
  aguardando_resultado: 'Aguardando Resultado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export const STATUS_CORES: Record<StatusBolao, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
  active: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
  closing: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  closed: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  aguardando_resultado: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  finalizado: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  cancelado: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
};

// ============================================================
// FUNÇÕES DE VALIDAÇÃO - REGRAS COMERCIAIS
// ============================================================

/**
 * Valida valor da cota conforme regras comerciais
 * [CAMADA: COMERCIAL]
 */
export function validarValorCotaComercial(valorCota: number): ResultadoValidacaoComercial {
  const erros: string[] = [];
  const avisos: string[] = [];
  const { cotaMinimaComercial, cotaMaximaComercial } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  if (valorCota < cotaMinimaComercial) {
    erros.push(`[COMERCIAL] Valor da cota (${formatarMoeda(valorCota)}) abaixo do mínimo permitido no BolãoMax (${formatarMoeda(cotaMinimaComercial)})`);
  }
  
  if (valorCota > cotaMaximaComercial) {
    erros.push(`[COMERCIAL] Valor da cota (${formatarMoeda(valorCota)}) acima do máximo permitido no BolãoMax (${formatarMoeda(cotaMaximaComercial)})`);
  }
  
  // Aviso se valor está próximo do mínimo da modalidade
  if (valorCota < REGRAS_MODALIDADE_TIMEMANIA.cotaMinimaReferencia * 6) {
    avisos.push(`[COMERCIAL] Valor da cota está abaixo de 6x o valor de referência da modalidade`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    camadaValidacao: 'COMERCIAL'
  };
}

/**
 * Valida total de cotas conforme regras comerciais
 * [CAMADA: COMERCIAL]
 */
export function validarTotalCotasComercial(totalCotas: number): ResultadoValidacaoComercial {
  const erros: string[] = [];
  const avisos: string[] = [];
  const { totalCotasMinimo, totalCotasMaximo } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  if (totalCotas < totalCotasMinimo) {
    erros.push(`[COMERCIAL] Total de cotas (${totalCotas}) abaixo do mínimo (${totalCotasMinimo})`);
  }
  
  if (totalCotas > totalCotasMaximo) {
    erros.push(`[COMERCIAL] Total de cotas (${totalCotas}) acima do máximo (${totalCotasMaximo})`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    camadaValidacao: 'COMERCIAL'
  };
}

/**
 * Valida se a compra de cotas é permitida
 * [CAMADA: COMERCIAL]
 */
export function validarPermissaoCompra(
  status: StatusBolao, 
  horarioLimiteCompra: Date,
  cotasDisponiveis: number,
  quantidadeCotas: number
): ResultadoValidacaoComercial {
  const erros: string[] = [];
  const avisos: string[] = [];
  const agora = new Date();
  const { minutosAntesParaBloquearCompra } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  // Verificar status
  if (!STATUS_PERMITIDOS_COMPRA.includes(status)) {
    erros.push(`[COMERCIAL] Compra não permitida para bolões com status "${STATUS_LABELS[status]}"`);
  }
  
  // Verificar horário limite
  const limiteReal = new Date(horarioLimiteCompra.getTime() - minutosAntesParaBloquearCompra * 60 * 1000);
  if (agora >= limiteReal) {
    erros.push(`[COMERCIAL] Horário limite de compra já passou`);
  }
  
  // Verificar disponibilidade de cotas
  if (quantidadeCotas > cotasDisponiveis) {
    erros.push(`[COMERCIAL] Quantidade solicitada (${quantidadeCotas}) maior que cotas disponíveis (${cotasDisponiveis})`);
  }
  
  if (cotasDisponiveis === 0) {
    erros.push(`[COMERCIAL] Bolão esgotado - não há cotas disponíveis`);
  }
  
  // Avisos
  if (status === 'closing') {
    avisos.push(`[COMERCIAL] Bolão em fase de encerramento - finalize a compra rapidamente`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    camadaValidacao: 'COMERCIAL'
  };
}

/**
 * Valida transição de status
 * [CAMADA: COMERCIAL]
 */
export function validarTransicaoStatus(
  statusAtual: StatusBolao, 
  novoStatus: StatusBolao
): ResultadoValidacaoComercial {
  const erros: string[] = [];
  const avisos: string[] = [];
  
  const transicoesPermitidas = TRANSICOES_STATUS[statusAtual];
  
  if (!transicoesPermitidas.includes(novoStatus)) {
    erros.push(`[COMERCIAL] Transição de "${STATUS_LABELS[statusAtual]}" para "${STATUS_LABELS[novoStatus]}" não é permitida`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    camadaValidacao: 'COMERCIAL'
  };
}

// ============================================================
// FUNÇÕES DE CÁLCULO - REGRAS COMERCIAIS
// ============================================================

/**
 * Calcula todos os valores do bolão
 * [CAMADA: COMERCIAL + MODALIDADE]
 */
export function calcularBolao(
  apostas: ApostaTimemania[],
  totalCotas: number,
  cotasVendidas: number = 0,
  taxaPercentual?: number
): CalculoBolao {
  const { valorApostaBase } = REGRAS_MODALIDADE_TIMEMANIA;
  const { taxaPlataformaPercentual, taxaPlataformaMinima, taxaPlataformaMaxima } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  const quantidadeApostas = apostas.length;
  const valorTotalJogo = quantidadeApostas * valorApostaBase;
  
  // Taxa da plataforma
  const percentualTaxa = taxaPercentual ?? taxaPlataformaPercentual;
  let taxaPlataforma = valorTotalJogo * (percentualTaxa / 100);
  taxaPlataforma = Math.max(taxaPlataformaMinima, Math.min(taxaPlataformaMaxima, taxaPlataforma));
  
  // Valor total do bolão (jogo + taxa)
  const valorTotalBolao = valorTotalJogo + taxaPlataforma;
  
  // Valor por cota
  const valorPorCota = valorTotalBolao / totalCotas;
  
  // Métricas
  const cotasDisponiveis = totalCotas - cotasVendidas;
  const percentualPreenchimento = (cotasVendidas / totalCotas) * 100;
  const margemPercentual = (taxaPlataforma / valorTotalJogo) * 100;
  
  // Termômetro de agressividade
  const termometroAgressividade = calcularTermometroAgressividade(valorPorCota, quantidadeApostas);
  
  return {
    valorTotalJogo,
    valorTotalBolao,
    valorPorCota,
    taxaPlataforma,
    valorLiquidoBolao: valorTotalJogo,
    margemPercentual,
    termometroAgressividade,
    cotasDisponiveis,
    percentualPreenchimento,
    detalhamento: {
      valorApostaBase,
      quantidadeApostas,
      totalCotas,
      cotasVendidas,
    }
  };
}

/**
 * Calcula termômetro de agressividade
 * [CAMADA: COMERCIAL]
 */
export function calcularTermometroAgressividade(
  valorPorCota: number, 
  quantidadeApostas: number
): 'baixa' | 'media' | 'alta' {
  const { cotaMinimaComercial } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  // Score baseado em: valor da cota (peso 60%) + quantidade de apostas (peso 40%)
  const scoreValor = Math.min((valorPorCota / (cotaMinimaComercial * 5)) * 100, 100);
  const scoreApostas = Math.min((quantidadeApostas / REGRAS_MODALIDADE_TIMEMANIA.apostasPorBolaoMax) * 100, 100);
  
  const scoreTotal = (scoreValor * 0.6) + (scoreApostas * 0.4);
  
  const { termometroConfig } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  if (scoreTotal <= termometroConfig.baixa.max) return 'baixa';
  if (scoreTotal <= termometroConfig.media.max) return 'media';
  return 'alta';
}

/**
 * Determina o status atual do bolão baseado no horário
 * [CAMADA: COMERCIAL]
 */
export function determinarStatusPorHorario(
  statusAtual: StatusBolao,
  horarioLimiteCompra: Date,
  cotasVendidas: number,
  cotaMinimaConfirmacao?: number,
  politica?: PoliticaCotasNaoVendidas
): StatusBolao {
  const agora = new Date();
  const { minutosAntesParaClosing } = REGRAS_COMERCIAIS_TIMEMANIA;
  
  // Se já está em status final, não muda
  if (['finalizado', 'cancelado'].includes(statusAtual)) {
    return statusAtual;
  }
  
  // Calcular tempo até o limite
  const msAteLimit = horarioLimiteCompra.getTime() - agora.getTime();
  const minutosAteLimit = msAteLimit / (1000 * 60);
  
  // Se passou do limite
  if (minutosAteLimit <= 0) {
    // Verificar se é condicionado e não atingiu mínimo
    if (politica === 'condicionado' && cotaMinimaConfirmacao && cotasVendidas < cotaMinimaConfirmacao) {
      return 'cancelado';
    }
    return 'closed';
  }
  
  // Se está nos últimos X minutos
  if (minutosAteLimit <= minutosAntesParaClosing) {
    return 'closing';
  }
  
  // Se ainda é rascunho, mantém
  if (statusAtual === 'draft') {
    return 'draft';
  }
  
  return 'active';
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Formata valor em moeda BRL
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat(REGRAS_COMERCIAIS_TIMEMANIA.locale, {
    style: 'currency',
    currency: REGRAS_COMERCIAIS_TIMEMANIA.moeda,
  }).format(valor);
}

/**
 * Valida bolão completo (MODALIDADE + COMERCIAL)
 */
export function validarBolaoCompleto(
  apostas: ApostaTimemania[],
  totalCotas: number,
  valorPorCota: number
): { modalidade: ReturnType<typeof validarListaApostasTimemania>; comercial: ResultadoValidacaoComercial } {
  // Validação da modalidade
  const validacaoModalidade = validarListaApostasTimemania(apostas);
  
  // Validação comercial
  const errosComerciais: string[] = [];
  const avisosComerciais: string[] = [];
  
  const validacaoCota = validarValorCotaComercial(valorPorCota);
  const validacaoTotalCotas = validarTotalCotasComercial(totalCotas);
  
  errosComerciais.push(...validacaoCota.erros, ...validacaoTotalCotas.erros);
  avisosComerciais.push(...validacaoCota.avisos, ...validacaoTotalCotas.avisos);
  
  return {
    modalidade: validacaoModalidade,
    comercial: {
      valido: errosComerciais.length === 0,
      erros: errosComerciais,
      avisos: avisosComerciais,
      camadaValidacao: 'COMERCIAL'
    }
  };
}

/**
 * Gera código único para o bolão
 */
export function gerarCodigoBolao(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TM-${timestamp}-${random}`;
}

export default REGRAS_COMERCIAIS_TIMEMANIA;
