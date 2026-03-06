/**
 * ============================================================
 * REGRAS DE ESTRATÉGIA DIA DE SORTE - BOLÃOMAX
 * ============================================================
 * 
 * Este arquivo contém as estratégias de geração de apostas para
 * bolões de Dia de Sorte, incluindo:
 * - Geração de apostas com 7-15 números
 * - Distribuição inteligente de meses da sorte
 * - Cobertura otimizada do universo 1-31
 * 
 * ESTRATÉGIA BASE:
 * - Cada aposta contém 7-15 números do universo 1-31
 * - Mês da Sorte obrigatório (1-12)
 * - Apostas podem ser principais ou surpresinha
 * ============================================================
 */

import { 
  REGRAS_MODALIDADE_DIA_DE_SORTE,
  ApostaDiaDeSorte,
  MESES_DA_SORTE,
  validarQuantidadeNumeros,
  gerarSurpresinha,
  gerarMesDaSorteAleatorio,
  formatarNumero,
  getMesDaSorteById,
} from './regras-modalidade';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

export type ModoEstrategia = 'conservador' | 'equilibrado' | 'agressivo';

export interface ConfiguracaoEstrategia {
  modo: ModoEstrategia;
  numerosPorAposta: number; // 7-15
  apostasMinimas: number;
  apostasMaximas: number;
  distribuirMeses: boolean; // Se true, distribui apostas entre meses diferentes
  mesDaSorteFavorito?: number; // Mês preferido (1-12)
  teimosinha: number;
}

export interface ApostaGerada {
  id: string;
  numeros: number[];
  numerosFormatados: string[];
  mesDaSorteId: number;
  mesDaSorteNome: string;
  ordem: number;
  tipo: 'principal' | 'surpresinha';
}

export interface DistribuicaoMeses {
  mesId: number;
  mesNome: string;
  quantidadeApostas: number;
  apostasIds: string[];
}

export interface ResultadoGeracaoApostas {
  apostas: ApostaGerada[];
  distribuicaoMeses: DistribuicaoMeses[];
  estatisticas: EstatisticasGeracao;
  configuracao: ConfiguracaoEstrategia;
}

export interface EstatisticasGeracao {
  totalApostas: number;
  numerosPorAposta: number;
  mesesUtilizados: number;
  totalNumerosCobertos: number;
  percentualCoberturaUniverso: number;
  frequenciaPorNumero: Map<number, number>;
  numerosNaoCobertos: number[];
  mesesDistribuicao: { [mesId: number]: number };
}

// ============================================================
// CONFIGURAÇÕES DE ESTRATÉGIA
// ============================================================

export const CONFIGURACOES_ESTRATEGIA: Record<ModoEstrategia, ConfiguracaoEstrategia> = {
  conservador: {
    modo: 'conservador',
    numerosPorAposta: 7, // Aposta simples
    apostasMinimas: 2,
    apostasMaximas: 5,
    distribuirMeses: false, // Mesmo mês para todas
    teimosinha: 1,
  },
  equilibrado: {
    modo: 'equilibrado',
    numerosPorAposta: 10, // Aposta com 10 números
    apostasMinimas: 3,
    apostasMaximas: 8,
    distribuirMeses: true, // Distribui entre meses
    teimosinha: 1,
  },
  agressivo: {
    modo: 'agressivo',
    numerosPorAposta: 15, // Aposta máxima
    apostasMinimas: 5,
    apostasMaximas: 10,
    distribuirMeses: true,
    teimosinha: 3,
  },
} as const;

export const TERMOMETRO_AGRESSIVIDADE = {
  baixa: { min: 0, max: 33, label: 'Baixa', cor: '#22c55e' },
  media: { min: 34, max: 66, label: 'Média', cor: '#eab308' },
  alta: { min: 67, max: 100, label: 'Alta', cor: '#ef4444' },
} as const;

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

/**
 * Gerador de números pseudo-aleatórios com seed
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// ============================================================
// FUNÇÕES DE GERAÇÃO DE APOSTAS
// ============================================================

/**
 * Gera uma aposta com números aleatórios
 */
export function gerarApostaAleatoria(
  quantidadeNumeros: number,
  mesDaSorteId: number,
  ordem: number,
  seed?: number
): ApostaGerada {
  if (!validarQuantidadeNumeros(quantidadeNumeros)) {
    throw new Error(`Quantidade de números deve ser entre 7 e 15`);
  }
  
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  const numeros: number[] = [];
  const random = seed ? seededRandom(seed) : Math.random;
  
  while (numeros.length < quantidadeNumeros) {
    const numero = Math.floor(random() * (universoNumerosMax - universoNumerosMin + 1)) + universoNumerosMin;
    if (!numeros.includes(numero)) {
      numeros.push(numero);
    }
  }
  
  const numerosOrdenados = numeros.sort((a, b) => a - b);
  const mesDaSorte = getMesDaSorteById(mesDaSorteId);
  
  return {
    id: `APT-${ordem.toString().padStart(3, '0')}`,
    numeros: numerosOrdenados,
    numerosFormatados: numerosOrdenados.map(formatarNumero),
    mesDaSorteId,
    mesDaSorteNome: mesDaSorte?.nome || 'Desconhecido',
    ordem,
    tipo: 'principal',
  };
}

/**
 * Gera apostas com cobertura máxima do universo
 * Garante que cada número do universo apareça com frequência similar
 */
export function gerarApostasCoberturMaxima(
  quantidadeApostas: number,
  numerosPorAposta: number,
  mesDaSorteId: number,
  seed?: number
): ApostaGerada[] {
  const apostas: ApostaGerada[] = [];
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  const frequencia: Map<number, number> = new Map();
  
  // Inicializar frequência de todos os números
  for (let i = universoNumerosMin; i <= universoNumerosMax; i++) {
    frequencia.set(i, 0);
  }
  
  const mesDaSorte = getMesDaSorteById(mesDaSorteId);
  
  for (let i = 0; i < quantidadeApostas; i++) {
    // Ordenar números por frequência (menor primeiro)
    const numerosOrdenados = Array.from({ length: universoNumerosMax - universoNumerosMin + 1 }, 
      (_, idx) => universoNumerosMin + idx
    ).sort((a, b) => {
      const freqA = frequencia.get(a) || 0;
      const freqB = frequencia.get(b) || 0;
      if (freqA !== freqB) return freqA - freqB;
      // Em caso de empate, usar random
      return (seed ? seededRandom(seed + i + a)() : Math.random()) - 0.5;
    });
    
    // Selecionar os números com menor frequência
    const numerosAposta = numerosOrdenados.slice(0, numerosPorAposta);
    
    // Atualizar frequência
    numerosAposta.forEach(n => frequencia.set(n, (frequencia.get(n) || 0) + 1));
    
    // Criar aposta
    apostas.push({
      id: `APT-${(i + 1).toString().padStart(3, '0')}`,
      numeros: numerosAposta.sort((a, b) => a - b),
      numerosFormatados: numerosAposta.map(formatarNumero).sort(),
      mesDaSorteId,
      mesDaSorteNome: mesDaSorte?.nome || 'Desconhecido',
      ordem: i + 1,
      tipo: 'principal',
    });
  }
  
  return apostas;
}

/**
 * Distribui apostas entre diferentes meses da sorte
 */
export function distribuirApostasPorMeses(
  apostas: ApostaGerada[],
  mesesFavoritos?: number[]
): ApostaGerada[] {
  const mesesParaUsar = mesesFavoritos?.length 
    ? mesesFavoritos 
    : MESES_DA_SORTE.map(m => m.id);
  
  return apostas.map((aposta, index) => {
    const mesId = mesesParaUsar[index % mesesParaUsar.length];
    const mesDaSorte = getMesDaSorteById(mesId);
    
    return {
      ...aposta,
      mesDaSorteId: mesId,
      mesDaSorteNome: mesDaSorte?.nome || 'Desconhecido',
    };
  });
}

/**
 * Gera apostas Surpresinha
 */
export function gerarApostasSurpresinha(
  quantidadeApostas: number,
  numerosPorAposta: number,
  distribuirMeses: boolean = false,
  seed?: number
): ApostaGerada[] {
  const apostas: ApostaGerada[] = [];
  
  for (let i = 0; i < quantidadeApostas; i++) {
    const mesDaSorteId = distribuirMeses 
      ? (i % 12) + 1 
      : gerarMesDaSorteAleatorio();
    const mesDaSorte = getMesDaSorteById(mesDaSorteId);
    
    const numeros = gerarSurpresinha(numerosPorAposta);
    
    apostas.push({
      id: `APS-${(i + 1).toString().padStart(3, '0')}`,
      numeros,
      numerosFormatados: numeros.map(formatarNumero),
      mesDaSorteId,
      mesDaSorteNome: mesDaSorte?.nome || 'Desconhecido',
      ordem: i + 1,
      tipo: 'surpresinha',
    });
  }
  
  return apostas;
}

// ============================================================
// FUNÇÃO PRINCIPAL DE GERAÇÃO
// ============================================================

/**
 * Gera apostas completas baseado em configuração de estratégia
 */
export function gerarApostasEstrategia(params: {
  modo?: ModoEstrategia;
  quantidadeApostas?: number;
  numerosPorAposta?: number;
  mesDaSorteFavorito?: number;
  distribuirMeses?: boolean;
  teimosinha?: number;
  seed?: number;
}): ResultadoGeracaoApostas {
  const {
    modo = 'equilibrado',
    quantidadeApostas,
    numerosPorAposta,
    mesDaSorteFavorito,
    distribuirMeses,
    teimosinha,
    seed,
  } = params;
  
  // Obter configuração base
  const configBase = CONFIGURACOES_ESTRATEGIA[modo];
  
  // Determinar quantidade de apostas
  const qtdApostas = quantidadeApostas ?? 
    Math.floor((configBase.apostasMinimas + configBase.apostasMaximas) / 2);
  
  // Determinar quantidade de números por aposta
  const numPorAposta = numerosPorAposta ?? configBase.numerosPorAposta;
  
  // Determinar mês da sorte
  const mesDaSorteId = mesDaSorteFavorito ?? gerarMesDaSorteAleatorio();
  
  // Gerar apostas com cobertura máxima
  let apostas = gerarApostasCoberturMaxima(qtdApostas, numPorAposta, mesDaSorteId, seed);
  
  // Distribuir meses se solicitado
  const usarDistribuicaoMeses = distribuirMeses ?? configBase.distribuirMeses;
  if (usarDistribuicaoMeses) {
    apostas = distribuirApostasPorMeses(apostas);
  }
  
  // Calcular estatísticas
  const estatisticas = calcularEstatisticasApostas(apostas);
  
  // Calcular distribuição de meses
  const distribuicaoMeses = calcularDistribuicaoMeses(apostas);
  
  // Montar configuração efetiva
  const configuracao: ConfiguracaoEstrategia = {
    modo,
    numerosPorAposta: numPorAposta,
    apostasMinimas: configBase.apostasMinimas,
    apostasMaximas: configBase.apostasMaximas,
    distribuirMeses: usarDistribuicaoMeses,
    mesDaSorteFavorito: mesDaSorteFavorito,
    teimosinha: teimosinha ?? configBase.teimosinha,
  };
  
  return {
    apostas,
    distribuicaoMeses,
    estatisticas,
    configuracao,
  };
}

// ============================================================
// FUNÇÕES DE ESTATÍSTICAS E ANÁLISE
// ============================================================

/**
 * Calcula estatísticas das apostas geradas
 */
export function calcularEstatisticasApostas(apostas: ApostaGerada[]): EstatisticasGeracao {
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  const frequencia: Map<number, number> = new Map();
  const numerosCobertos = new Set<number>();
  const mesesDistribuicao: { [mesId: number]: number } = {};
  
  // Contar frequência de cada número e mês
  for (const aposta of apostas) {
    for (const numero of aposta.numeros) {
      frequencia.set(numero, (frequencia.get(numero) || 0) + 1);
      numerosCobertos.add(numero);
    }
    mesesDistribuicao[aposta.mesDaSorteId] = (mesesDistribuicao[aposta.mesDaSorteId] || 0) + 1;
  }
  
  // Identificar números não cobertos
  const numerosNaoCobertos: number[] = [];
  for (let i = universoNumerosMin; i <= universoNumerosMax; i++) {
    if (!numerosCobertos.has(i)) {
      numerosNaoCobertos.push(i);
    }
  }
  
  const totalUniverso = universoNumerosMax - universoNumerosMin + 1;
  
  return {
    totalApostas: apostas.length,
    numerosPorAposta: apostas[0]?.numeros.length || 7,
    mesesUtilizados: Object.keys(mesesDistribuicao).length,
    totalNumerosCobertos: numerosCobertos.size,
    percentualCoberturaUniverso: (numerosCobertos.size / totalUniverso) * 100,
    frequenciaPorNumero: frequencia,
    numerosNaoCobertos,
    mesesDistribuicao,
  };
}

/**
 * Calcula distribuição de meses nas apostas
 */
export function calcularDistribuicaoMeses(apostas: ApostaGerada[]): DistribuicaoMeses[] {
  const distribuicao: Map<number, DistribuicaoMeses> = new Map();
  
  for (const aposta of apostas) {
    const mesId = aposta.mesDaSorteId;
    const existente = distribuicao.get(mesId);
    
    if (existente) {
      existente.quantidadeApostas++;
      existente.apostasIds.push(aposta.id);
    } else {
      distribuicao.set(mesId, {
        mesId,
        mesNome: aposta.mesDaSorteNome,
        quantidadeApostas: 1,
        apostasIds: [aposta.id],
      });
    }
  }
  
  return Array.from(distribuicao.values()).sort((a, b) => b.quantidadeApostas - a.quantidadeApostas);
}

/**
 * Calcula nível de agressividade
 */
export function calcularNivelAgressividade(
  apostas: ApostaGerada[],
  configuracao: ConfiguracaoEstrategia
): { nivel: 'baixa' | 'media' | 'alta'; score: number; descricao: string } {
  const { numerosMaximoPorAposta, apostasPorBolaoMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  
  // Score baseado em:
  // - Quantidade de números por aposta (peso 40%)
  // - Quantidade de apostas (peso 40%)
  // - Distribuição de meses (peso 20%)
  
  const scoreNumeros = (configuracao.numerosPorAposta / numerosMaximoPorAposta) * 100;
  const scoreApostas = (apostas.length / apostasPorBolaoMax) * 100;
  const scoreMeses = configuracao.distribuirMeses ? 100 : 50;
  
  const scoreTotal = (scoreNumeros * 0.4) + (scoreApostas * 0.4) + (scoreMeses * 0.2);
  
  let nivel: 'baixa' | 'media' | 'alta';
  let descricao: string;
  
  if (scoreTotal <= TERMOMETRO_AGRESSIVIDADE.baixa.max) {
    nivel = 'baixa';
    descricao = 'Estratégia conservadora com apostas simples';
  } else if (scoreTotal <= TERMOMETRO_AGRESSIVIDADE.media.max) {
    nivel = 'media';
    descricao = 'Estratégia equilibrada entre custo e cobertura';
  } else {
    nivel = 'alta';
    descricao = 'Estratégia agressiva com máxima cobertura';
  }
  
  return { nivel, score: Math.round(scoreTotal), descricao };
}

/**
 * Converte apostas geradas para formato de aposta Dia de Sorte
 */
export function converterParaApostasDiaDeSorte(apostas: ApostaGerada[]): ApostaDiaDeSorte[] {
  return apostas.map(aposta => ({
    numeros: aposta.numeros,
    mesDaSorteId: aposta.mesDaSorteId,
    ordem: aposta.ordem,
    tipo: aposta.tipo,
  }));
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default {
  CONFIGURACOES_ESTRATEGIA,
  TERMOMETRO_AGRESSIVIDADE,
  gerarApostaAleatoria,
  gerarApostasCoberturMaxima,
  distribuirApostasPorMeses,
  gerarApostasSurpresinha,
  gerarApostasEstrategia,
  calcularEstatisticasApostas,
  calcularDistribuicaoMeses,
  calcularNivelAgressividade,
  converterParaApostasDiaDeSorte,
};
