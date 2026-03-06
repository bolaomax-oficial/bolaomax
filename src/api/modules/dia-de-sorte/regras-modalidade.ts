/**
 * ============================================================
 * REGRAS DA MODALIDADE - DIA DE SORTE
 * ============================================================
 * 
 * Este arquivo contém APENAS as regras estruturais oficiais do
 * Dia de Sorte conforme definido pela Caixa Econômica Federal.
 * 
 * ESTAS REGRAS SÃO IMUTÁVEIS do ponto de vista comercial.
 * Não devem ser alteradas para fins de negócio.
 * 
 * Qualquer regra comercial (preço mínimo de cota, limites da
 * plataforma, etc.) deve estar em regras-comerciais.ts
 * ============================================================
 */

// ============================================================
// TIPOS - REGRAS DA MODALIDADE
// ============================================================

export interface RegrasModalidadeDiaDeSorte {
  // Identificação
  readonly nomeModalidade: string;
  readonly slugModalidade: string;
  readonly codigoModalidade: string;
  
  // Estrutura da aposta
  readonly numerosMinimoPorAposta: number;
  readonly numerosMaximoPorAposta: number;
  readonly universoNumerosMin: number;
  readonly universoNumerosMax: number;
  readonly mesDaSorteObrigatorio: boolean;
  readonly quantidadeMeses: number;
  
  // Valores oficiais de referência (Caixa)
  readonly valorApostaBase: number; // 7 números + mês
  readonly valorMinimoBolaoReferencia: number;
  readonly cotaMinimaReferencia: number;
  readonly apostasPorBolaoMax: number;
  
  // Limites de cotas por quantidade de números (oficial Caixa)
  readonly limiteCotasPorNumeros: readonly LimiteCotasPorNumeros[];
  
  // Sorteio
  readonly diasSorteio: readonly string[];
  readonly horarioSorteioBRT: string;
  readonly timezoneOficial: string;
  
  // Faixas de premiação
  readonly faixasPremiacao: readonly FaixaPremiacao[];
  
  // Recursos especiais
  readonly teimosinhaPermitida: boolean;
  readonly surpresinhaPermitida: boolean;
}

export interface LimiteCotasPorNumeros {
  readonly numeros: number;
  readonly cotasMinimas: number;
  readonly cotasMaximas: number;
  readonly valorAposta: number;
}

export interface FaixaPremiacao {
  readonly faixa: number;
  readonly descricao: string;
  readonly acertos: number | string;
  readonly percentualRateio: number;
}

export interface MesDaSorte {
  readonly id: number;
  readonly nome: string;
  readonly nomeCompleto: string;
  readonly abreviacao: string;
}

export interface ApostaDiaDeSorte {
  numeros: number[];
  mesDaSorteId: number;
  ordem: number;
  tipo: 'principal' | 'surpresinha';
}

export interface ResultadoValidacaoAposta {
  valido: boolean;
  erros: string[];
  camadaValidacao: 'MODALIDADE';
}

// ============================================================
// CONSTANTES - REGRAS DA MODALIDADE
// ============================================================

export const REGRAS_MODALIDADE_DIA_DE_SORTE: RegrasModalidadeDiaDeSorte = {
  // Identificação
  nomeModalidade: "Dia de Sorte",
  slugModalidade: "dia-de-sorte",
  codigoModalidade: "DS",
  
  // Estrutura da aposta (IMUTÁVEL)
  numerosMinimoPorAposta: 7,
  numerosMaximoPorAposta: 15,
  universoNumerosMin: 1,
  universoNumerosMax: 31,
  mesDaSorteObrigatorio: true,
  quantidadeMeses: 12,
  
  // Valores oficiais de referência da Caixa
  valorApostaBase: 2.50, // 7 números + mês
  valorMinimoBolaoReferencia: 12.00,
  cotaMinimaReferencia: 3.00,
  apostasPorBolaoMax: 10,
  
  // Limites de cotas por quantidade de números (oficial Caixa)
  limiteCotasPorNumeros: [
    { numeros: 7, cotasMinimas: 2, cotasMaximas: 8, valorAposta: 2.50 },
    { numeros: 8, cotasMinimas: 2, cotasMaximas: 20, valorAposta: 20.00 },
    { numeros: 9, cotasMinimas: 2, cotasMaximas: 25, valorAposta: 60.00 },
    { numeros: 10, cotasMinimas: 2, cotasMaximas: 50, valorAposta: 150.00 },
    { numeros: 11, cotasMinimas: 2, cotasMaximas: 60, valorAposta: 330.00 },
    { numeros: 12, cotasMinimas: 2, cotasMaximas: 60, valorAposta: 660.00 },
    { numeros: 13, cotasMinimas: 2, cotasMaximas: 60, valorAposta: 1215.00 },
    { numeros: 14, cotasMinimas: 2, cotasMaximas: 100, valorAposta: 2100.00 },
    { numeros: 15, cotasMinimas: 2, cotasMaximas: 100, valorAposta: 3432.50 },
  ] as const,
  
  // Sorteio
  diasSorteio: ["terça", "quinta", "sábado"] as const,
  horarioSorteioBRT: "21:00",
  timezoneOficial: "America/Sao_Paulo",
  
  // Faixas de premiação oficiais
  faixasPremiacao: [
    { faixa: 1, descricao: "7 acertos", acertos: 7, percentualRateio: 30 },
    { faixa: 2, descricao: "6 acertos", acertos: 6, percentualRateio: 10 },
    { faixa: 3, descricao: "5 acertos", acertos: 5, percentualRateio: 8 },
    { faixa: 4, descricao: "4 acertos", acertos: 4, percentualRateio: 8 },
    { faixa: 5, descricao: "Mês da Sorte", acertos: "mes", percentualRateio: 5 },
  ] as const,
  
  // Recursos especiais
  teimosinhaPermitida: true,
  surpresinhaPermitida: true,
} as const;

// ============================================================
// LISTA OFICIAL DE MESES DA SORTE (12 MESES)
// ============================================================

export const MESES_DA_SORTE: readonly MesDaSorte[] = [
  { id: 1, nome: "Janeiro", nomeCompleto: "Janeiro", abreviacao: "JAN" },
  { id: 2, nome: "Fevereiro", nomeCompleto: "Fevereiro", abreviacao: "FEV" },
  { id: 3, nome: "Março", nomeCompleto: "Março", abreviacao: "MAR" },
  { id: 4, nome: "Abril", nomeCompleto: "Abril", abreviacao: "ABR" },
  { id: 5, nome: "Maio", nomeCompleto: "Maio", abreviacao: "MAI" },
  { id: 6, nome: "Junho", nomeCompleto: "Junho", abreviacao: "JUN" },
  { id: 7, nome: "Julho", nomeCompleto: "Julho", abreviacao: "JUL" },
  { id: 8, nome: "Agosto", nomeCompleto: "Agosto", abreviacao: "AGO" },
  { id: 9, nome: "Setembro", nomeCompleto: "Setembro", abreviacao: "SET" },
  { id: 10, nome: "Outubro", nomeCompleto: "Outubro", abreviacao: "OUT" },
  { id: 11, nome: "Novembro", nomeCompleto: "Novembro", abreviacao: "NOV" },
  { id: 12, nome: "Dezembro", nomeCompleto: "Dezembro", abreviacao: "DEZ" },
] as const;

// ============================================================
// FUNÇÕES DE VALIDAÇÃO - REGRAS DA MODALIDADE
// ============================================================

/**
 * Valida se um número está dentro do universo permitido (1-31)
 * [CAMADA: MODALIDADE]
 */
export function validarNumeroUniverso(numero: number): boolean {
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  return Number.isInteger(numero) && 
         numero >= universoNumerosMin && 
         numero <= universoNumerosMax;
}

/**
 * Valida se a quantidade de números está dentro do permitido (7-15)
 * [CAMADA: MODALIDADE]
 */
export function validarQuantidadeNumeros(quantidade: number): boolean {
  const { numerosMinimoPorAposta, numerosMaximoPorAposta } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  return Number.isInteger(quantidade) && 
         quantidade >= numerosMinimoPorAposta && 
         quantidade <= numerosMaximoPorAposta;
}

/**
 * Valida se o Mês da Sorte é válido
 * [CAMADA: MODALIDADE]
 */
export function validarMesDaSorte(mesId: number): boolean {
  return MESES_DA_SORTE.some(mes => mes.id === mesId);
}

/**
 * Obtém o Mês da Sorte pelo ID
 * [CAMADA: MODALIDADE]
 */
export function getMesDaSorteById(mesId: number): MesDaSorte | undefined {
  return MESES_DA_SORTE.find(mes => mes.id === mesId);
}

/**
 * Obtém os limites de cotas para uma quantidade de números
 * [CAMADA: MODALIDADE]
 */
export function getLimitesCotasPorNumeros(quantidade: number): LimiteCotasPorNumeros | undefined {
  return REGRAS_MODALIDADE_DIA_DE_SORTE.limiteCotasPorNumeros.find(
    limite => limite.numeros === quantidade
  );
}

/**
 * Calcula o valor da aposta baseado na quantidade de números
 * [CAMADA: MODALIDADE]
 */
export function calcularValorAposta(quantidadeNumeros: number): number {
  const limite = getLimitesCotasPorNumeros(quantidadeNumeros);
  if (!limite) {
    throw new Error(`Quantidade de números ${quantidadeNumeros} não é válida para Dia de Sorte`);
  }
  return limite.valorAposta;
}

/**
 * Valida uma aposta individual do Dia de Sorte
 * [CAMADA: MODALIDADE]
 */
export function validarApostaDiaDeSorte(aposta: ApostaDiaDeSorte): ResultadoValidacaoAposta {
  const erros: string[] = [];
  const { numerosMinimoPorAposta, numerosMaximoPorAposta, mesDaSorteObrigatorio } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  
  // Verificar quantidade de números
  if (aposta.numeros.length < numerosMinimoPorAposta) {
    erros.push(`[MODALIDADE] Aposta deve ter no mínimo ${numerosMinimoPorAposta} números. Recebido: ${aposta.numeros.length}`);
  }
  if (aposta.numeros.length > numerosMaximoPorAposta) {
    erros.push(`[MODALIDADE] Aposta deve ter no máximo ${numerosMaximoPorAposta} números. Recebido: ${aposta.numeros.length}`);
  }
  
  // Verificar se todos os números são válidos
  const numerosInvalidos = aposta.numeros.filter(n => !validarNumeroUniverso(n));
  if (numerosInvalidos.length > 0) {
    erros.push(`[MODALIDADE] Números fora do universo permitido (1-31): ${numerosInvalidos.join(', ')}`);
  }
  
  // Verificar duplicatas
  const numerosUnicos = new Set(aposta.numeros);
  if (numerosUnicos.size !== aposta.numeros.length) {
    erros.push(`[MODALIDADE] Aposta contém números duplicados`);
  }
  
  // Verificar mês da sorte
  if (mesDaSorteObrigatorio && !validarMesDaSorte(aposta.mesDaSorteId)) {
    erros.push(`[MODALIDADE] Mês da Sorte inválido: ${aposta.mesDaSorteId}. Deve ser entre 1 e 12`);
  }
  
  return {
    valido: erros.length === 0,
    erros,
    camadaValidacao: 'MODALIDADE'
  };
}

/**
 * Valida uma lista de apostas para um bolão
 * [CAMADA: MODALIDADE]
 */
export function validarListaApostasDiaDeSorte(
  apostas: ApostaDiaDeSorte[], 
  mesmaQuantidadeNumeros: boolean = true
): ResultadoValidacaoAposta {
  const erros: string[] = [];
  const { apostasPorBolaoMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  
  // Verificar quantidade de apostas
  if (apostas.length === 0) {
    erros.push(`[MODALIDADE] Bolão deve ter pelo menos 1 aposta`);
  }
  if (apostas.length > apostasPorBolaoMax) {
    erros.push(`[MODALIDADE] Bolão não pode ter mais que ${apostasPorBolaoMax} apostas. Recebido: ${apostas.length}`);
  }
  
  // Validar cada aposta individualmente
  apostas.forEach((aposta, index) => {
    const resultado = validarApostaDiaDeSorte(aposta);
    if (!resultado.valido) {
      resultado.erros.forEach(erro => {
        erros.push(`Aposta ${index + 1}: ${erro}`);
      });
    }
  });
  
  // Verificar se todas as apostas têm a mesma quantidade de números (se aplicável)
  if (mesmaQuantidadeNumeros && apostas.length > 1) {
    const quantidades = new Set(apostas.map(a => a.numeros.length));
    if (quantidades.size > 1) {
      erros.push(`[MODALIDADE] Todas as apostas do bolão devem ter a mesma quantidade de números`);
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
    camadaValidacao: 'MODALIDADE'
  };
}

/**
 * Calcula o valor total de um bolão
 * [CAMADA: MODALIDADE]
 */
export function calcularValorTotalBolao(apostas: ApostaDiaDeSorte[]): number {
  return apostas.reduce((total, aposta) => {
    return total + calcularValorAposta(aposta.numeros.length);
  }, 0);
}

/**
 * Formata um número para exibição (01-31)
 * [CAMADA: MODALIDADE]
 */
export function formatarNumero(numero: number): string {
  return numero.toString().padStart(2, '0');
}

/**
 * Formata array de números para exibição
 * [CAMADA: MODALIDADE]
 */
export function formatarNumerosAposta(numeros: number[]): string[] {
  return numeros.map(formatarNumero).sort();
}

/**
 * Calcula próxima data de sorteio
 * [CAMADA: MODALIDADE]
 */
export function calcularProximoSorteio(dataReferencia: Date = new Date()): Date {
  const diasSemana: Record<string, number> = {
    domingo: 0,
    segunda: 1,
    terça: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sábado: 6,
  };
  
  const diasSorteioNumeros = REGRAS_MODALIDADE_DIA_DE_SORTE.diasSorteio.map(
    dia => diasSemana[dia]
  );
  const agora = new Date(dataReferencia);
  const diaAtual = agora.getDay();
  const horaAtual = agora.getHours();
  const [horasSorteio] = REGRAS_MODALIDADE_DIA_DE_SORTE.horarioSorteioBRT.split(':').map(Number);
  
  // Verificar se hoje é dia de sorteio e ainda não passou o horário
  if (diasSorteioNumeros.includes(diaAtual)) {
    if (horaAtual < horasSorteio) {
      const proximoSorteio = new Date(agora);
      proximoSorteio.setHours(horasSorteio, 0, 0, 0);
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
  proximoSorteio.setHours(horasSorteio, 0, 0, 0);
  
  return proximoSorteio;
}

/**
 * Gera números aleatórios para Surpresinha
 * [CAMADA: MODALIDADE]
 */
export function gerarSurpresinha(quantidadeNumeros: number = 7): number[] {
  if (!validarQuantidadeNumeros(quantidadeNumeros)) {
    throw new Error(`Quantidade de números deve ser entre 7 e 15`);
  }
  
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_DIA_DE_SORTE;
  const numeros: number[] = [];
  
  while (numeros.length < quantidadeNumeros) {
    const numero = Math.floor(Math.random() * (universoNumerosMax - universoNumerosMin + 1)) + universoNumerosMin;
    if (!numeros.includes(numero)) {
      numeros.push(numero);
    }
  }
  
  return numeros.sort((a, b) => a - b);
}

/**
 * Gera mês da sorte aleatório
 * [CAMADA: MODALIDADE]
 */
export function gerarMesDaSorteAleatorio(): number {
  return Math.floor(Math.random() * 12) + 1;
}

// ============================================================
// EXPORTAÇÕES
// ============================================================

export const REGRAS_MODALIDADE = REGRAS_MODALIDADE_DIA_DE_SORTE;

export default {
  REGRAS_MODALIDADE: REGRAS_MODALIDADE_DIA_DE_SORTE,
  MESES_DA_SORTE,
  validarNumeroUniverso,
  validarQuantidadeNumeros,
  validarMesDaSorte,
  getMesDaSorteById,
  getLimitesCotasPorNumeros,
  calcularValorAposta,
  validarApostaDiaDeSorte,
  validarListaApostasDiaDeSorte,
  calcularValorTotalBolao,
  formatarNumero,
  formatarNumerosAposta,
  calcularProximoSorteio,
  gerarSurpresinha,
  gerarMesDaSorteAleatorio,
};
