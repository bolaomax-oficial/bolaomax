/**
 * API de Integração com Caixa Econômica Federal
 * 
 * Documentação oficial:
 * https://servicebus2.caixa.gov.br/portaldeloterias/api/home
 * 
 * Endpoints disponíveis:
 * - /resultados (último resultado)
 * - /{modalidade}/{concurso} (resultado específico)
 */

export interface CaixaLotteryResult {
  acumulado: boolean;
  concursoEspecial: boolean;
  dataApuracao: string;
  dataProximoConcurso: string;
  dezenas: string[];
  dezenasOrdemSorteio: string[];
  exibirDetalhamentoPorCidade: boolean;
  id: number | null;
  indicadorConcursoEspecial: number;
  listaDezenas: string[];
  listaDezenasSegundoSorteio: string[] | null; // Para Dupla Sena
  listaMunicipioUFGanhadores: any[];
  listaRateioPremio: {
    descricaoFaixa: string;
    faixa: number;
    numeroDeGanhadores: number;
    valorPremio: number;
  }[];
  listaResultadoEquipeEsportiva: any[] | null; // Para Timemania
  localSorteio: string;
  nomeMunicipioUFSorteio: string;
  nomeTimeCoracaoMesSorte: string | null;
  numero: number;
  numeroConcursoAnterior: number;
  numeroConcursoFinal_0_5: number;
  numeroConcursoProximo: number;
  numeroJogo: number;
  observacao: string;
  premiacaoContingencia: string | null;
  tipoJogo: string;
  tipoPublicacao: number;
  ultimoConcurso: boolean;
  valorArrecadado: number;
  valorAcumuladoConcurso_0_5: number;
  valorAcumuladoConcursoEspecial: number;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  valorSaldoReservaGarantidora: number;
  valorTotalPremioFaixaUm: number;
}

export type LotteryType = 
  | 'megasena' 
  | 'lotofacil' 
  | 'quina' 
  | 'lotomania' 
  | 'duplasena' 
  | 'timemania' 
  | 'diadesorte' 
  | 'supersete' 
  | 'federal';

const LOTTERY_ENDPOINTS: Record<LotteryType, string> = {
  megasena: 'mega-sena',
  lotofacil: 'lotofacil',
  quina: 'quina',
  lotomania: 'lotomania',
  duplasena: 'duplasena',
  timemania: 'timemania',
  diadesorte: 'diadesorte',
  supersete: 'super-sete',
  federal: 'federal',
};

const BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';

/**
 * Busca o último resultado de uma loteria
 */
export async function fetchLatestResult(
  lotteryType: LotteryType
): Promise<CaixaLotteryResult | null> {
  try {
    const endpoint = LOTTERY_ENDPOINTS[lotteryType];
    const url = `${BASE_URL}/${endpoint}`;
    
    console.log(`[CAIXA API] Buscando resultado: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[CAIXA API] Erro HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[CAIXA API] Resultado recebido: Concurso ${data.numero}`);
    
    return data;
  } catch (error) {
    console.error(`[CAIXA API] Erro ao buscar resultado de ${lotteryType}:`, error);
    return null;
  }
}

/**
 * Busca um resultado específico por número de concurso
 */
export async function fetchResultByContest(
  lotteryType: LotteryType,
  contestNumber: number
): Promise<CaixaLotteryResult | null> {
  try {
    const endpoint = LOTTERY_ENDPOINTS[lotteryType];
    const url = `${BASE_URL}/${endpoint}/${contestNumber}`;
    
    console.log(`[CAIXA API] Buscando concurso ${contestNumber}: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[CAIXA API] Erro HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[CAIXA API] Erro ao buscar concurso ${contestNumber} de ${lotteryType}:`, error);
    return null;
  }
}

/**
 * Busca resultados de todas as loterias
 */
export async function fetchAllResults(): Promise<
  Record<LotteryType, CaixaLotteryResult | null>
> {
  console.log('[CAIXA API] Iniciando busca de todas as loterias...');
  
  const results = await Promise.allSettled(
    Object.keys(LOTTERY_ENDPOINTS).map(async (type) => {
      const result = await fetchLatestResult(type as LotteryType);
      return { type, result };
    })
  );

  const mappedResults: Record<string, CaixaLotteryResult | null> = {};
  
  results.forEach((promiseResult) => {
    if (promiseResult.status === 'fulfilled') {
      const { type, result } = promiseResult.value;
      mappedResults[type] = result;
    } else {
      console.error('[CAIXA API] Erro ao buscar resultado:', promiseResult.reason);
    }
  });

  console.log(`[CAIXA API] Busca concluída: ${Object.keys(mappedResults).length} loterias`);
  
  return mappedResults as Record<LotteryType, CaixaLotteryResult | null>;
}

/**
 * Verifica se há novos resultados disponíveis
 */
export async function checkForNewResults(
  currentContests: Record<LotteryType, number>
): Promise<Record<LotteryType, boolean>> {
  console.log('[CAIXA API] Verificando novos resultados...');
  
  const newResults: Record<string, boolean> = {};
  
  for (const [type, currentNumber] of Object.entries(currentContests)) {
    const latest = await fetchLatestResult(type as LotteryType);
    if (latest && latest.numero > currentNumber) {
      newResults[type] = true;
      console.log(`[CAIXA API] Novo resultado disponível para ${type}: ${latest.numero}`);
    } else {
      newResults[type] = false;
    }
  }
  
  return newResults as Record<LotteryType, boolean>;
}

/**
 * Formata resultado da Caixa para o formato interno
 */
export function formatCaixaResult(data: CaixaLotteryResult) {
  return {
    numero: data.numero,
    data: new Date(data.dataApuracao).toLocaleDateString('pt-BR'),
    dezenas: data.listaDezenas.map(Number),
    dezenas2: data.listaDezenasSegundoSorteio?.map(Number) || null, // Dupla Sena
    premios: data.listaRateioPremio.map((premio) => ({
      faixa: premio.descricaoFaixa,
      ganhadores: premio.numeroDeGanhadores,
      premio: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(premio.valorPremio),
    })),
    acumulado: data.acumulado,
    valorAcumulado: data.valorAcumuladoProximoConcurso,
    proximoConcurso: {
      numero: data.numeroConcursoProximo,
      data: new Date(data.dataProximoConcurso).toLocaleDateString('pt-BR'),
      premio: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(data.valorEstimadoProximoConcurso),
    },
    timeCoração: data.nomeTimeCoracaoMesSorte || null, // Timemania
    mesDaSorte: data.nomeTimeCoracaoMesSorte || null, // Dia de Sorte
  };
}

/**
 * Testa conexão com API da Caixa
 */
export async function testCaixaConnection(): Promise<boolean> {
  try {
    console.log('[CAIXA API] Testando conexão...');
    const result = await fetchLatestResult('megasena');
    if (result) {
      console.log('[CAIXA API] ✅ Conexão OK - Mega-Sena concurso:', result.numero);
      return true;
    }
    console.error('[CAIXA API] ❌ Conexão falhou - Sem resposta');
    return false;
  } catch (error) {
    console.error('[CAIXA API] ❌ Erro ao testar conexão:', error);
    return false;
  }
}
