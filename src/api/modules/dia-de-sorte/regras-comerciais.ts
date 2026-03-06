/**
 * ============================================================
 * REGRAS COMERCIAIS - BOLÃOMAX (DIA DE SORTE)
 * ============================================================
 * 
 * Este arquivo contém as regras COMERCIAIS da plataforma BolãoMax
 * aplicadas especificamente à modalidade Dia de Sorte.
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

import { 
  REGRAS_MODALIDADE_DIA_DE_SORTE, 
  ApostaDiaDeSorte, 
  validarListaApostasDiaDeSorte,
  calcularValorAposta,
  getMesDaSorteById,
} from './regras-modalidade';

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
  | 'rascunho' 
  | 'publicado'
  | 'ativo' 
  | 'encerrando' 
  | 'encerrado' 
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
    quantidadeNumerosPorAposta: number;
    totalCotas: number;
    cotasVendidas: number;
    mesDaSorte: string;
  };
}

export interface BolaoDiaDeSorte {
  id: string;
  titulo: string;
  descricao: string;
  modalidade: 'dia-de-sorte';
  
  // Concurso
  concurso: string;
  dataSorteio: Date;
  horarioLimiteCompra: Date;
  
  // Apostas
  apostas: ApostaDiaDeSorte[];
  quantidadeApostas: number;
  quantidadeNumerosPorAposta: number;
  mesDaSorteId: number;
  
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

export const REGRAS_COMERCIAIS_DIA_DE_SORTE: RegrasComerciais = {
  // Limites comerciais (PODEM ser maiores que os da modalidade)
  cotaMinimaComercial: 20.00, // R$ 20,00 mínimo no BolãoMax
  cotaMaximaComercial: 500.00,
  totalCotasMinimo: 10,
  totalCotasMaximo: 100,
  
  // Configurações de card
  quantidadeMaximaJogosPorCard: 10, // Até 10 apostas por card (limite da modalidade)
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

// Alias para manter compatibilidade
export const REGRAS_COMERCIAIS = REGRAS_COMERCIAIS_DIA_DE_SORTE;

// ============================================================
// STATUS E TRANSIÇÕES
// ============================================================

export const STATUS_BOLAO: Record<StatusBolao, { label: string; descricao: string }> = {
  rascunho: { label: 'Rascunho', descricao: 'Bolão em criação, não visível para usuários' },
  publicado: { label: 'Publicado', descricao: 'Bolão publicado, disponível para visualização' },
  ativo: { label: 'Ativo', descricao: 'Bolão aberto para compra de cotas' },
  encerrando: { label: 'Encerrando', descricao: 'Últimas horas para compra' },
  encerrado: { label: 'Encerrado', descricao: 'Vendas encerradas, aguardando sorteio' },
  aguardando_resultado: { label: 'Aguardando Resultado', descricao: 'Sorteio realizado, processando resultado' },
  finalizado: { label: 'Finalizado', descricao: 'Resultado processado, prêmios distribuídos' },
  cancelado: { label: 'Cancelado', descricao: 'Bolão cancelado' },
};

export const STATUS_PERMITIDOS_COMPRA: StatusBolao[] = ['ativo', 'encerrando'];
export const STATUS_PERMITIDOS_EDICAO: StatusBolao[] = ['rascunho'];
export const STATUS_PERMITIDOS_CANCELAMENTO: StatusBolao[] = ['rascunho', 'publicado', 'ativo', 'encerrando'];

export const TRANSICOES_STATUS: Record<StatusBolao, StatusBolao[]> = {
  rascunho: ['publicado', 'cancelado'],
  publicado: ['ativo', 'cancelado'],
  ativo: ['encerrando', 'encerrado', 'cancelado'],
  encerrando: ['encerrado', 'cancelado'],
  encerrado: ['aguardando_resultado', 'cancelado'],
  aguardando_resultado: ['finalizado', 'cancelado'],
  finalizado: [],
  cancelado: [],
};

export const STATUS_LABELS: Record<StatusBolao, string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  ativo: 'Ativo',
  encerrando: 'Encerrando',
  encerrado: 'Encerrado',
  aguardando_resultado: 'Aguardando Resultado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

export const STATUS_CORES: Record<StatusBolao, { bg: string; text: string; border: string }> = {
  rascunho: { bg: 'bg-gray-500/20', text: 'text-gray-300', border: 'border-gray-500/30' },
  publicado: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  ativo: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
  encerrando: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  encerrado: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  aguardando_resultado: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
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
  const { cotaMinimaComercial, cotaMaximaComercial } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  if (valorCota < cotaMinimaComercial) {
    erros.push(`[COMERCIAL] Valor da cota (${formatarMoeda(valorCota)}) abaixo do mínimo permitido no BolãoMax (${formatarMoeda(cotaMinimaComercial)})`);
  }
  
  if (valorCota > cotaMaximaComercial) {
    erros.push(`[COMERCIAL] Valor da cota (${formatarMoeda(valorCota)}) acima do máximo permitido no BolãoMax (${formatarMoeda(cotaMaximaComercial)})`);
  }
  
  // Aviso se valor está próximo do mínimo da modalidade
  if (valorCota < REGRAS_MODALIDADE_DIA_DE_SORTE.cotaMinimaReferencia * 6) {
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
  const { totalCotasMinimo, totalCotasMaximo } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
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
  const { minutosAntesParaBloquearCompra } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
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
  if (status === 'encerrando') {
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

/**
 * Valida compra de cotas
 * [CAMADA: COMERCIAL]
 */
export function validarCompraCotas(params: {
  status: StatusBolao;
  horarioLimiteCompra: Date;
  cotasDisponiveis: number;
  quantidadeCotas: number;
}): ResultadoValidacaoComercial {
  return validarPermissaoCompra(
    params.status,
    params.horarioLimiteCompra,
    params.cotasDisponiveis,
    params.quantidadeCotas
  );
}

// ============================================================
// FUNÇÕES DE CÁLCULO - REGRAS COMERCIAIS
// ============================================================

/**
 * Calcula todos os valores do bolão
 * [CAMADA: COMERCIAL + MODALIDADE]
 */
export function calcularBolao(
  apostas: ApostaDiaDeSorte[],
  totalCotas: number,
  cotasVendidas: number = 0,
  taxaPercentual?: number
): CalculoBolao {
  const { taxaPlataformaPercentual, taxaPlataformaMinima, taxaPlataformaMaxima } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  const quantidadeApostas = apostas.length;
  const quantidadeNumerosPorAposta = apostas[0]?.numeros.length || 7;
  const valorApostaBase = calcularValorAposta(quantidadeNumerosPorAposta);
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
  
  // Mês da Sorte
  const mesDaSorteId = apostas[0]?.mesDaSorteId || 1;
  const mesDaSorte = getMesDaSorteById(mesDaSorteId);
  
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
      quantidadeNumerosPorAposta,
      totalCotas,
      cotasVendidas,
      mesDaSorte: mesDaSorte?.nome || 'Não definido',
    }
  };
}

/**
 * Interface para cálculo financeiro
 */
export interface CalculoFinanceiro {
  valorTotalJogos: number;
  valorTotalBolao: number;
  valorPorCota: number;
  taxaPlataforma: number;
  taxaPercentual: number;
}

/**
 * Calcula valores financeiros do bolão
 * [CAMADA: COMERCIAL]
 */
export function calcularFinanceiroBolao(params: {
  apostas: ApostaDiaDeSorte[];
  totalCotas: number;
  taxaPercentual?: number;
}): CalculoFinanceiro {
  const { apostas, totalCotas, taxaPercentual } = params;
  const { taxaPlataformaPercentual, taxaPlataformaMinima, taxaPlataformaMaxima } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  const quantidadeNumerosPorAposta = apostas[0]?.numeros.length || 7;
  const valorApostaBase = calcularValorAposta(quantidadeNumerosPorAposta);
  const valorTotalJogos = apostas.length * valorApostaBase;
  
  const percentualTaxa = taxaPercentual ?? taxaPlataformaPercentual;
  let taxaPlataforma = valorTotalJogos * (percentualTaxa / 100);
  taxaPlataforma = Math.max(taxaPlataformaMinima, Math.min(taxaPlataformaMaxima, taxaPlataforma));
  
  const valorTotalBolao = valorTotalJogos + taxaPlataforma;
  const valorPorCota = valorTotalBolao / totalCotas;
  
  return {
    valorTotalJogos,
    valorTotalBolao,
    valorPorCota,
    taxaPlataforma,
    taxaPercentual: percentualTaxa,
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
  const { cotaMinimaComercial } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  // Score baseado em: valor da cota (peso 60%) + quantidade de apostas (peso 40%)
  const scoreValor = Math.min((valorPorCota / (cotaMinimaComercial * 5)) * 100, 100);
  const scoreApostas = Math.min((quantidadeApostas / REGRAS_MODALIDADE_DIA_DE_SORTE.apostasPorBolaoMax) * 100, 100);
  
  const scoreTotal = (scoreValor * 0.6) + (scoreApostas * 0.4);
  
  const { termometroConfig } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  if (scoreTotal <= termometroConfig.baixa.max) return 'baixa';
  if (scoreTotal <= termometroConfig.media.max) return 'media';
  return 'alta';
}

/**
 * Calcula horário limite de venda baseado na data do sorteio
 * [CAMADA: COMERCIAL]
 */
export function calcularHorarioLimiteVenda(dataSorteio: Date): Date {
  const { minutosAntesParaBloquearCompra, minutosAntesParaClosing } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  
  // Horário limite é X minutos antes do sorteio
  const horarioLimite = new Date(dataSorteio.getTime() - minutosAntesParaClosing * 60 * 1000);
  
  return horarioLimite;
}

/**
 * Calcula percentual de preenchimento
 * [CAMADA: COMERCIAL]
 */
export function calcularPercentualPreenchimento(cotasVendidas: number, totalCotas: number): number {
  if (totalCotas === 0) return 0;
  return Math.round((cotasVendidas / totalCotas) * 100);
}

/**
 * Calcula cotas disponíveis
 * [CAMADA: COMERCIAL]
 */
export function calcularCotasDisponiveis(totalCotas: number, cotasVendidas: number): number {
  return Math.max(0, totalCotas - cotasVendidas);
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Formata valor como moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  const { moeda, locale } = REGRAS_COMERCIAIS_DIA_DE_SORTE;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda,
  }).format(valor);
}

/**
 * Gera código único para bolão
 */
export function gerarCodigoBolao(): string {
  const prefixo = 'DS'; // Dia de Sorte
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefixo}-${timestamp.slice(-4)}${random}`;
}

/**
 * Valida bolão completo (modalidade + comercial)
 */
export function validarBolaoCompleto(params: {
  apostas: ApostaDiaDeSorte[];
  totalCotas: number;
  valorPorCota: number;
}): { valido: boolean; erros: string[]; avisos: string[] } {
  const erros: string[] = [];
  const avisos: string[] = [];
  
  // Validar regras da modalidade
  const validacaoModalidade = validarListaApostasDiaDeSorte(params.apostas);
  if (!validacaoModalidade.valido) {
    erros.push(...validacaoModalidade.erros);
  }
  
  // Validar regras comerciais - valor da cota
  const validacaoCota = validarValorCotaComercial(params.valorPorCota);
  if (!validacaoCota.valido) {
    erros.push(...validacaoCota.erros);
  }
  avisos.push(...validacaoCota.avisos);
  
  // Validar regras comerciais - total de cotas
  const validacaoCotas = validarTotalCotasComercial(params.totalCotas);
  if (!validacaoCotas.valido) {
    erros.push(...validacaoCotas.erros);
  }
  avisos.push(...validacaoCotas.avisos);
  
  return {
    valido: erros.length === 0,
    erros,
    avisos
  };
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default {
  REGRAS_COMERCIAIS: REGRAS_COMERCIAIS_DIA_DE_SORTE,
  STATUS_BOLAO,
  STATUS_PERMITIDOS_COMPRA,
  STATUS_PERMITIDOS_EDICAO,
  STATUS_PERMITIDOS_CANCELAMENTO,
  TRANSICOES_STATUS,
  STATUS_LABELS,
  STATUS_CORES,
  validarValorCotaComercial,
  validarTotalCotasComercial,
  validarPermissaoCompra,
  validarTransicaoStatus,
  validarCompraCotas,
  calcularBolao,
  calcularFinanceiroBolao,
  calcularTermometroAgressividade,
  calcularHorarioLimiteVenda,
  calcularPercentualPreenchimento,
  calcularCotasDisponiveis,
  formatarMoeda,
  gerarCodigoBolao,
  validarBolaoCompleto,
};
