/**
 * ============================================================
 * REGRAS DA MODALIDADE LOTOMANIA - OFICIAIS DA CAIXA
 * ============================================================
 * 
 * Este arquivo contém APENAS as regras oficiais da loteria Lotomania
 * conforme definidas pela Caixa Econômica Federal.
 * 
 * NÃO MISTURAR com regras comerciais do BolãoMax.
 * ============================================================
 */

// ============================================================
// CONSTANTES OFICIAIS DA LOTOMANIA
// ============================================================

/**
 * Universo de números válidos para a Lotomania
 * Números de 00 a 99 (total: 100 números)
 */
export const UNIVERSO_NUMEROS = {
  min: 0,
  max: 99,
  total: 100,
} as const;

/**
 * Quantidade de números por aposta (FIXO)
 * Na Lotomania, cada aposta deve conter exatamente 50 números
 */
export const NUMEROS_POR_APOSTA = 50;

/**
 * Valor base da aposta simples
 */
export const VALOR_APOSTA_BASE = 3.00;

/**
 * Dias de sorteio da Lotomania
 */
export const DIAS_SORTEIO = ["segunda", "quarta", "sexta"] as const;

/**
 * Horário oficial do sorteio
 */
export const HORARIO_SORTEIO = {
  hora: 21,
  minuto: 0,
  timezone: "America/Sao_Paulo",
} as const;

/**
 * Opções de Teimosinha disponíveis (quantidade de concursos)
 */
export const OPCOES_TEIMOSINHA = [2, 3, 4, 6, 8, 9, 12] as const;

/**
 * Faixas de premiação da Lotomania
 */
export const FAIXAS_PREMIACAO = {
  acertos_20: { nome: "20 acertos", percentual: 37.0 },
  acertos_19: { nome: "19 acertos", percentual: 9.0 },
  acertos_18: { nome: "18 acertos", percentual: 8.0 },
  acertos_17: { nome: "17 acertos", percentual: 8.0 },
  acertos_16: { nome: "16 acertos", percentual: 10.0 },
  acertos_15: { nome: "15 acertos", percentual: 13.0 },
  acertos_0: { nome: "0 acertos", percentual: 15.0 },
} as const;

// ============================================================
// INTERFACE DE REGRAS DA MODALIDADE
// ============================================================

export interface RegrasModalidadeLotomania {
  // Identificação
  readonly nome: string;
  readonly codigo: string;
  readonly descricao: string;
  
  // Universo de números
  readonly universoNumerosMin: number;
  readonly universoNumerosMax: number;
  readonly universoNumerosTotal: number;
  
  // Aposta
  readonly numerosPorAposta: number;
  readonly valorApostaBase: number;
  
  // Sorteio
  readonly diasSorteio: readonly string[];
  readonly horarioSorteio: {
    readonly hora: number;
    readonly minuto: number;
    readonly timezone: string;
  };
  
  // Recursos especiais
  readonly apostaEspelhoPermitida: boolean;
  readonly teimosinhaPermitida: boolean;
  readonly opcoesTeimosinhaDisponiveis: readonly number[];
  
  // Premiação
  readonly faixasPremiacao: typeof FAIXAS_PREMIACAO;
}

// ============================================================
// OBJETO DE REGRAS EXPORTADO
// ============================================================

export const REGRAS_MODALIDADE_LOTOMANIA: RegrasModalidadeLotomania = {
  // Identificação
  nome: "Lotomania",
  codigo: "LOTOMANIA",
  descricao: "Loteria com apostas de 50 números entre 00 e 99. Ganha quem acertar 20, 19, 18, 17, 16, 15 ou 0 números.",
  
  // Universo de números
  universoNumerosMin: UNIVERSO_NUMEROS.min,
  universoNumerosMax: UNIVERSO_NUMEROS.max,
  universoNumerosTotal: UNIVERSO_NUMEROS.total,
  
  // Aposta
  numerosPorAposta: NUMEROS_POR_APOSTA,
  valorApostaBase: VALOR_APOSTA_BASE,
  
  // Sorteio
  diasSorteio: DIAS_SORTEIO,
  horarioSorteio: HORARIO_SORTEIO,
  
  // Recursos especiais
  apostaEspelhoPermitida: true,
  teimosinhaPermitida: true,
  opcoesTeimosinhaDisponiveis: OPCOES_TEIMOSINHA,
  
  // Premiação
  faixasPremiacao: FAIXAS_PREMIACAO,
} as const;

// ============================================================
// FUNÇÕES DE VALIDAÇÃO - REGRAS OFICIAIS
// ============================================================

/**
 * Valida se um número está dentro do universo permitido (00-99)
 */
export function validarNumero(numero: number): boolean {
  return Number.isInteger(numero) && 
         numero >= UNIVERSO_NUMEROS.min && 
         numero <= UNIVERSO_NUMEROS.max;
}

/**
 * Valida se um array de números é válido para uma aposta Lotomania
 */
export function validarNumerosAposta(numeros: number[]): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];
  
  // Verificar quantidade
  if (numeros.length !== NUMEROS_POR_APOSTA) {
    erros.push(`Aposta deve conter exatamente ${NUMEROS_POR_APOSTA} números. Recebido: ${numeros.length}`);
  }
  
  // Verificar números válidos
  const numerosInvalidos = numeros.filter(n => !validarNumero(n));
  if (numerosInvalidos.length > 0) {
    erros.push(`Números inválidos (devem ser de ${UNIVERSO_NUMEROS.min} a ${UNIVERSO_NUMEROS.max}): ${numerosInvalidos.join(', ')}`);
  }
  
  // Verificar duplicatas
  const numerosUnicos = new Set(numeros);
  if (numerosUnicos.size !== numeros.length) {
    erros.push(`Aposta contém números duplicados`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
  };
}

/**
 * Valida a opção de teimosinha
 */
export function validarTeimosinha(concursos: number): boolean {
  return OPCOES_TEIMOSINHA.includes(concursos as typeof OPCOES_TEIMOSINHA[number]);
}

/**
 * Gera a aposta espelho (os 50 números restantes do volante)
 */
export function gerarApostaEspelho(apostaPrincipal: number[]): number[] {
  const validacao = validarNumerosAposta(apostaPrincipal);
  if (!validacao.valido) {
    throw new Error(`Aposta principal inválida: ${validacao.erros.join('; ')}`);
  }
  
  const numerosSet = new Set(apostaPrincipal);
  const espelho: number[] = [];
  
  for (let i = UNIVERSO_NUMEROS.min; i <= UNIVERSO_NUMEROS.max; i++) {
    if (!numerosSet.has(i)) {
      espelho.push(i);
    }
  }
  
  return espelho.sort((a, b) => a - b);
}

/**
 * Calcula o valor total de uma aposta considerando teimosinha
 */
export function calcularValorAposta(teimosinha: number = 1): number {
  const fatorTeimosinha = teimosinha > 1 && validarTeimosinha(teimosinha) ? teimosinha : 1;
  return VALOR_APOSTA_BASE * fatorTeimosinha;
}

/**
 * Calcula o valor total incluindo aposta espelho
 */
export function calcularValorComEspelho(
  incluirEspelho: boolean = false,
  teimosinha: number = 1
): number {
  const valorBase = calcularValorAposta(teimosinha);
  return incluirEspelho ? valorBase * 2 : valorBase;
}

/**
 * Formata um número para exibição (00-99 com zero à esquerda)
 */
export function formatarNumero(numero: number): string {
  return numero.toString().padStart(2, '0');
}

/**
 * Formata array de números para exibição
 */
export function formatarNumerosAposta(numeros: number[]): string[] {
  return numeros.map(formatarNumero).sort();
}

/**
 * Calcula próxima data de sorteio
 */
export function calcularProximoSorteio(dataReferencia: Date = new Date()): Date {
  const diasSemana: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
  };
  
  const diasSorteioNumeros = DIAS_SORTEIO.map(dia => diasSemana[dia]);
  const agora = new Date(dataReferencia);
  const diaAtual = agora.getDay();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  
  // Verificar se hoje é dia de sorteio e ainda não passou o horário
  if (diasSorteioNumeros.includes(diaAtual)) {
    if (horaAtual < HORARIO_SORTEIO.hora || 
        (horaAtual === HORARIO_SORTEIO.hora && minutoAtual < HORARIO_SORTEIO.minuto)) {
      const proximoSorteio = new Date(agora);
      proximoSorteio.setHours(HORARIO_SORTEIO.hora, HORARIO_SORTEIO.minuto, 0, 0);
      return proximoSorteio;
    }
  }
  
  // Encontrar o próximo dia de sorteio
  let diasAteProximo = 7;
  for (const diaSorteio of diasSorteioNumeros) {
    let diferenca = diaSorteio - diaAtual;
    if (diferenca <= 0) diferenca += 7;
    if (diferenca < diasAteProximo) {
      diasAteProximo = diferenca;
    }
  }
  
  const proximoSorteio = new Date(agora);
  proximoSorteio.setDate(agora.getDate() + diasAteProximo);
  proximoSorteio.setHours(HORARIO_SORTEIO.hora, HORARIO_SORTEIO.minuto, 0, 0);
  
  return proximoSorteio;
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export const REGRAS_MODALIDADE = REGRAS_MODALIDADE_LOTOMANIA;

export default {
  REGRAS_MODALIDADE: REGRAS_MODALIDADE_LOTOMANIA,
  UNIVERSO_NUMEROS,
  NUMEROS_POR_APOSTA,
  VALOR_APOSTA_BASE,
  DIAS_SORTEIO,
  HORARIO_SORTEIO,
  OPCOES_TEIMOSINHA,
  FAIXAS_PREMIACAO,
  validarNumero,
  validarNumerosAposta,
  validarTeimosinha,
  gerarApostaEspelho,
  calcularValorAposta,
  calcularValorComEspelho,
  formatarNumero,
  formatarNumerosAposta,
  calcularProximoSorteio,
};
