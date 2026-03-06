/**
 * ============================================================
 * REGRAS DE ESTRATÉGIA LOTOMANIA - BOLÃOMAX
 * ============================================================
 * 
 * Este arquivo contém as estratégias de geração de apostas para
 * bolões de Lotomania, incluindo a cobertura inteligente de 80
 * dezenas e geração de apostas espelho.
 * 
 * ESTRATÉGIA BASE:
 * - Pool de 80 dezenas selecionadas do universo 00-99
 * - Cada aposta utiliza 50 números desse pool
 * - Apostas espelho cobrem os 50 números restantes
 * - Teimosinha amplifica participação em múltiplos concursos
 * ============================================================
 */

import { 
  UNIVERSO_NUMEROS, 
  NUMEROS_POR_APOSTA,
  validarNumerosAposta,
  gerarApostaEspelho,
  formatarNumero,
} from './regras-modalidade';

// ============================================================
// TIPOS E INTERFACES
// ============================================================

export type ModoEstrategia = 'conservador' | 'equilibrado' | 'agressivo';

export interface ConfiguracaoEstrategia {
  modo: ModoEstrategia;
  poolDezenas: number; // Geralmente 80
  apostasMinimas: number;
  apostasMaximas: number;
  incluirEspelhos: boolean;
  teimosinha: number;
}

export interface ApostaGerada {
  id: string;
  numeros: number[];
  numerosFormatados: string[];
  ordem: number;
  tipo: 'principal' | 'espelho';
  apostaOrigemId?: string; // Para espelhos, referência à aposta principal
}

export interface PoolDezenas {
  dezenas: number[];
  dezenasFormatadas: string[];
  dezenasExcluidas: number[];
  dezenasExcluidasFormatadas: string[];
  tamanho: number;
}

export interface ResultadoGeracaoApostas {
  apostas: ApostaGerada[];
  pool: PoolDezenas;
  estatisticas: EstatisticasGeracao;
  configuracao: ConfiguracaoEstrategia;
}

export interface EstatisticasGeracao {
  totalApostas: number;
  totalApostasPrincipais: number;
  totalApostasEspelho: number;
  totalNumerosCobertos: number;
  percentualCoberturaUniverso: number;
  frequenciaPorNumero: Map<number, number>;
  numerosNaoCobertos: number[];
}

// ============================================================
// CONFIGURAÇÕES DE ESTRATÉGIA
// ============================================================

export const CONFIGURACOES_ESTRATEGIA: Record<ModoEstrategia, ConfiguracaoEstrategia> = {
  conservador: {
    modo: 'conservador',
    poolDezenas: 80,
    apostasMinimas: 2,
    apostasMaximas: 5,
    incluirEspelhos: false,
    teimosinha: 1,
  },
  equilibrado: {
    modo: 'equilibrado',
    poolDezenas: 80,
    apostasMinimas: 5,
    apostasMaximas: 15,
    incluirEspelhos: true,
    teimosinha: 1,
  },
  agressivo: {
    modo: 'agressivo',
    poolDezenas: 80,
    apostasMinimas: 10,
    apostasMaximas: 30,
    incluirEspelhos: true,
    teimosinha: 3,
  },
} as const;

export const TERMOMETRO_AGRESSIVIDADE = {
  baixa: { min: 0, max: 33, label: 'Baixa', cor: '#22c55e' },
  media: { min: 34, max: 66, label: 'Média', cor: '#eab308' },
  alta: { min: 67, max: 100, label: 'Alta', cor: '#ef4444' },
} as const;

// ============================================================
// FUNÇÕES DE GERAÇÃO DE POOL
// ============================================================

/**
 * Gera um pool de dezenas selecionadas aleatoriamente do universo 00-99
 * @param tamanhoPool - Quantidade de dezenas no pool (geralmente 80)
 * @param seed - Seed opcional para reprodutibilidade
 */
export function gerarPoolDezenas(tamanhoPool: number = 80, seed?: number): PoolDezenas {
  if (tamanhoPool < NUMEROS_POR_APOSTA) {
    throw new Error(`Pool deve ter no mínimo ${NUMEROS_POR_APOSTA} dezenas`);
  }
  if (tamanhoPool > UNIVERSO_NUMEROS.total) {
    throw new Error(`Pool não pode exceder ${UNIVERSO_NUMEROS.total} dezenas`);
  }
  
  // Criar array com todos os números do universo
  const universo: number[] = [];
  for (let i = UNIVERSO_NUMEROS.min; i <= UNIVERSO_NUMEROS.max; i++) {
    universo.push(i);
  }
  
  // Shuffle usando Fisher-Yates (com seed opcional)
  const shuffled = [...universo];
  let random = seed ? seededRandom(seed) : Math.random;
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    if (seed) random = seededRandom(seed + i);
  }
  
  // Selecionar as dezenas do pool
  const dezenas = shuffled.slice(0, tamanhoPool).sort((a, b) => a - b);
  const dezenasExcluidas = shuffled.slice(tamanhoPool).sort((a, b) => a - b);
  
  return {
    dezenas,
    dezenasFormatadas: dezenas.map(formatarNumero),
    dezenasExcluidas,
    dezenasExcluidasFormatadas: dezenasExcluidas.map(formatarNumero),
    tamanho: tamanhoPool,
  };
}

/**
 * Gera um pool de dezenas personalizado a partir de uma lista fornecida
 */
export function gerarPoolPersonalizado(dezenas: number[]): PoolDezenas {
  // Validar dezenas
  const dezenasUnicas = [...new Set(dezenas)];
  const dezenasValidas = dezenasUnicas.filter(
    n => n >= UNIVERSO_NUMEROS.min && n <= UNIVERSO_NUMEROS.max
  );
  
  if (dezenasValidas.length < NUMEROS_POR_APOSTA) {
    throw new Error(`Pool deve ter no mínimo ${NUMEROS_POR_APOSTA} dezenas válidas`);
  }
  
  const dezenasOrdenadas = dezenasValidas.sort((a, b) => a - b);
  const dezenasExcluidas: number[] = [];
  
  for (let i = UNIVERSO_NUMEROS.min; i <= UNIVERSO_NUMEROS.max; i++) {
    if (!dezenasOrdenadas.includes(i)) {
      dezenasExcluidas.push(i);
    }
  }
  
  return {
    dezenas: dezenasOrdenadas,
    dezenasFormatadas: dezenasOrdenadas.map(formatarNumero),
    dezenasExcluidas,
    dezenasExcluidasFormatadas: dezenasExcluidas.map(formatarNumero),
    tamanho: dezenasOrdenadas.length,
  };
}

// ============================================================
// FUNÇÕES DE GERAÇÃO DE APOSTAS
// ============================================================

/**
 * Gera uma aposta selecionando 50 números do pool
 */
export function gerarApostaDoPool(
  pool: PoolDezenas,
  ordem: number,
  seed?: number
): ApostaGerada {
  if (pool.tamanho < NUMEROS_POR_APOSTA) {
    throw new Error(`Pool insuficiente para gerar aposta`);
  }
  
  // Shuffle do pool para seleção aleatória
  const poolShuffled = [...pool.dezenas];
  let random = seed ? seededRandom(seed) : Math.random;
  
  for (let i = poolShuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [poolShuffled[i], poolShuffled[j]] = [poolShuffled[j], poolShuffled[i]];
    if (seed) random = seededRandom(seed + i);
  }
  
  // Selecionar 50 números
  const numeros = poolShuffled.slice(0, NUMEROS_POR_APOSTA).sort((a, b) => a - b);
  
  return {
    id: `APT-${ordem.toString().padStart(3, '0')}`,
    numeros,
    numerosFormatados: numeros.map(formatarNumero),
    ordem,
    tipo: 'principal',
  };
}

/**
 * Gera aposta espelho a partir de uma aposta principal
 */
export function gerarApostaEspelhoDoPool(
  apostaPrincipal: ApostaGerada,
  ordem: number
): ApostaGerada {
  const numerosEspelho = gerarApostaEspelho(apostaPrincipal.numeros);
  
  return {
    id: `APE-${ordem.toString().padStart(3, '0')}`,
    numeros: numerosEspelho,
    numerosFormatados: numerosEspelho.map(formatarNumero),
    ordem,
    tipo: 'espelho',
    apostaOrigemId: apostaPrincipal.id,
  };
}

/**
 * Gera múltiplas apostas do pool com cobertura inteligente
 */
export function gerarApostasDoPool(
  pool: PoolDezenas,
  quantidadeApostas: number,
  incluirEspelhos: boolean = false,
  seed?: number
): ApostaGerada[] {
  const apostas: ApostaGerada[] = [];
  let ordemAtual = 1;
  
  // Gerar apostas principais
  for (let i = 0; i < quantidadeApostas; i++) {
    const apostaSeed = seed ? seed + i * 1000 : undefined;
    const aposta = gerarApostaDoPool(pool, ordemAtual, apostaSeed);
    apostas.push(aposta);
    ordemAtual++;
  }
  
  // Gerar espelhos se solicitado
  if (incluirEspelhos) {
    const apostasPrincipais = [...apostas];
    for (const aposta of apostasPrincipais) {
      const espelho = gerarApostaEspelhoDoPool(aposta, ordemAtual);
      apostas.push(espelho);
      ordemAtual++;
    }
  }
  
  return apostas;
}

/**
 * Gera apostas usando estratégia de cobertura máxima
 * Garante que cada número do pool apareça com frequência similar
 */
export function gerarApostasCoberturMaxima(
  pool: PoolDezenas,
  quantidadeApostas: number,
  seed?: number
): ApostaGerada[] {
  const apostas: ApostaGerada[] = [];
  const frequencia: Map<number, number> = new Map();
  
  // Inicializar frequência
  pool.dezenas.forEach(d => frequencia.set(d, 0));
  
  for (let i = 0; i < quantidadeApostas; i++) {
    // Ordenar números por frequência (menor primeiro)
    const numerosOrdenados = [...pool.dezenas].sort((a, b) => {
      const freqA = frequencia.get(a) || 0;
      const freqB = frequencia.get(b) || 0;
      if (freqA !== freqB) return freqA - freqB;
      // Em caso de empate, usar random
      return (seed ? seededRandom(seed + i + a)() : Math.random()) - 0.5;
    });
    
    // Selecionar os 50 números com menor frequência
    const numerosAposta = numerosOrdenados.slice(0, NUMEROS_POR_APOSTA);
    
    // Atualizar frequência
    numerosAposta.forEach(n => frequencia.set(n, (frequencia.get(n) || 0) + 1));
    
    // Criar aposta
    apostas.push({
      id: `APT-${(i + 1).toString().padStart(3, '0')}`,
      numeros: numerosAposta.sort((a, b) => a - b),
      numerosFormatados: numerosAposta.map(formatarNumero).sort(),
      ordem: i + 1,
      tipo: 'principal',
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
  poolPersonalizado?: number[];
  incluirEspelhos?: boolean;
  teimosinha?: number;
  seed?: number;
}): ResultadoGeracaoApostas {
  const {
    modo = 'equilibrado',
    quantidadeApostas,
    poolPersonalizado,
    incluirEspelhos,
    teimosinha,
    seed,
  } = params;
  
  // Obter configuração base
  const configBase = CONFIGURACOES_ESTRATEGIA[modo];
  
  // Determinar quantidade de apostas
  const qtdApostas = quantidadeApostas ?? 
    Math.floor((configBase.apostasMinimas + configBase.apostasMaximas) / 2);
  
  // Gerar ou usar pool
  const pool = poolPersonalizado 
    ? gerarPoolPersonalizado(poolPersonalizado)
    : gerarPoolDezenas(configBase.poolDezenas, seed);
  
  // Gerar apostas com cobertura máxima
  const apostas = gerarApostasCoberturMaxima(pool, qtdApostas, seed);
  
  // Adicionar espelhos se solicitado
  const usarEspelhos = incluirEspelhos ?? configBase.incluirEspelhos;
  if (usarEspelhos) {
    let ordemAtual = apostas.length + 1;
    const apostasPrincipais = [...apostas];
    for (const aposta of apostasPrincipais) {
      const espelho = gerarApostaEspelhoDoPool(aposta, ordemAtual);
      apostas.push(espelho);
      ordemAtual++;
    }
  }
  
  // Calcular estatísticas
  const estatisticas = calcularEstatisticasApostas(apostas);
  
  // Montar configuração efetiva
  const configuracao: ConfiguracaoEstrategia = {
    modo,
    poolDezenas: pool.tamanho,
    apostasMinimas: configBase.apostasMinimas,
    apostasMaximas: configBase.apostasMaximas,
    incluirEspelhos: usarEspelhos,
    teimosinha: teimosinha ?? configBase.teimosinha,
  };
  
  return {
    apostas,
    pool,
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
  const frequencia: Map<number, number> = new Map();
  const numerosCobertos = new Set<number>();
  
  // Contar frequência de cada número
  for (const aposta of apostas) {
    for (const numero of aposta.numeros) {
      frequencia.set(numero, (frequencia.get(numero) || 0) + 1);
      numerosCobertos.add(numero);
    }
  }
  
  // Identificar números não cobertos
  const numerosNaoCobertos: number[] = [];
  for (let i = UNIVERSO_NUMEROS.min; i <= UNIVERSO_NUMEROS.max; i++) {
    if (!numerosCobertos.has(i)) {
      numerosNaoCobertos.push(i);
    }
  }
  
  // Contar por tipo
  const totalApostasPrincipais = apostas.filter(a => a.tipo === 'principal').length;
  const totalApostasEspelho = apostas.filter(a => a.tipo === 'espelho').length;
  
  return {
    totalApostas: apostas.length,
    totalApostasPrincipais,
    totalApostasEspelho,
    totalNumerosCobertos: numerosCobertos.size,
    percentualCoberturaUniverso: (numerosCobertos.size / UNIVERSO_NUMEROS.total) * 100,
    frequenciaPorNumero: frequencia,
    numerosNaoCobertos,
  };
}

/**
 * Calcula nível de agressividade baseado nas apostas
 */
export function calcularNivelAgressividade(params: {
  totalApostas: number;
  incluirEspelhos: boolean;
  teimosinha: number;
}): {
  nivel: 'baixa' | 'media' | 'alta';
  score: number;
  descricao: string;
} {
  const { totalApostas, incluirEspelhos, teimosinha } = params;
  
  // Calcular score (0-100)
  let score = 0;
  
  // Fator apostas (até 40 pontos)
  const scorApostas = Math.min((totalApostas / 30) * 40, 40);
  score += scorApostas;
  
  // Fator espelhos (até 30 pontos)
  if (incluirEspelhos) score += 30;
  
  // Fator teimosinha (até 30 pontos)
  const scoreTeimosinha = Math.min((teimosinha / 12) * 30, 30);
  score += scoreTeimosinha;
  
  // Determinar nível
  let nivel: 'baixa' | 'media' | 'alta';
  let descricao: string;
  
  if (score <= TERMOMETRO_AGRESSIVIDADE.baixa.max) {
    nivel = 'baixa';
    descricao = 'Estratégia conservadora com menor investimento';
  } else if (score <= TERMOMETRO_AGRESSIVIDADE.media.max) {
    nivel = 'media';
    descricao = 'Estratégia equilibrada com boa cobertura';
  } else {
    nivel = 'alta';
    descricao = 'Estratégia agressiva para máxima cobertura';
  }
  
  return { nivel, score: Math.round(score), descricao };
}

// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Gerador de números pseudo-aleatórios com seed
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Valida uma lista de apostas geradas
 */
export function validarApostasGeradas(apostas: ApostaGerada[]): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];
  
  for (const aposta of apostas) {
    const validacao = validarNumerosAposta(aposta.numeros);
    if (!validacao.valido) {
      erros.push(`Aposta ${aposta.id}: ${validacao.erros.join('; ')}`);
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
  };
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export default {
  CONFIGURACOES_ESTRATEGIA,
  TERMOMETRO_AGRESSIVIDADE,
  gerarPoolDezenas,
  gerarPoolPersonalizado,
  gerarApostaDoPool,
  gerarApostaEspelhoDoPool,
  gerarApostasDoPool,
  gerarApostasCoberturMaxima,
  gerarApostasEstrategia,
  calcularEstatisticasApostas,
  calcularNivelAgressividade,
  validarApostasGeradas,
};
