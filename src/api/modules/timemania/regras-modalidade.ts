/**
 * ============================================================
 * REGRAS DA MODALIDADE - TIMEMANIA
 * ============================================================
 * 
 * Este arquivo contém APENAS as regras estruturais oficiais da
 * Timemania conforme definido pela Caixa Econômica Federal.
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

export interface RegrasModalidadeTimemania {
  // Identificação
  readonly nomeModalidade: string;
  readonly slugModalidade: string;
  readonly codigoModalidade: string;
  
  // Estrutura da aposta
  readonly numerosPorAposta: number;
  readonly universoNumerosMin: number;
  readonly universoNumerosMax: number;
  readonly timeDoCoracaoObrigatorio: boolean;
  readonly quantidadeTimesDisponiveis: number;
  
  // Valores oficiais de referência (Caixa)
  readonly valorApostaBase: number;
  readonly valorMinimoBolaoReferencia: number;
  readonly cotaMinimaReferencia: number;
  readonly cotasMaximasReferencia: number;
  readonly cotasMinimasReferencia: number;
  readonly apostasPorBolaoMax: number;
  
  // Estrutura do bolão
  readonly mesmaQtdNumerosEmTodasApostas: boolean;
  
  // Sorteio
  readonly diasSorteio: readonly string[];
  readonly horarioSorteioBRT: string;
  readonly timezoneOficial: string;
  
  // Faixas de premiação
  readonly faixasPremiacao: readonly FaixaPremiacao[];
}

export interface FaixaPremiacao {
  readonly faixa: number;
  readonly descricao: string;
  readonly acertos: number | string;
  readonly percentualRateio: number;
}

export interface TimeDoCoracao {
  readonly id: number;
  readonly nome: string;
  readonly nomeCompleto: string;
  readonly uf: string;
  readonly slug: string;
  readonly ativo: boolean;
}

export interface ApostaTimemania {
  numeros: number[];
  timeDoCoracaoId: number;
}

export interface ResultadoValidacaoAposta {
  valido: boolean;
  erros: string[];
  camadaValidacao: 'MODALIDADE';
}

// ============================================================
// CONSTANTES - REGRAS DA MODALIDADE
// ============================================================

export const REGRAS_MODALIDADE_TIMEMANIA: RegrasModalidadeTimemania = {
  // Identificação
  nomeModalidade: "Timemania",
  slugModalidade: "timemania",
  codigoModalidade: "TM",
  
  // Estrutura da aposta (IMUTÁVEL)
  numerosPorAposta: 10,
  universoNumerosMin: 1,
  universoNumerosMax: 80,
  timeDoCoracaoObrigatorio: true,
  quantidadeTimesDisponiveis: 80,
  
  // Valores oficiais de referência da Caixa
  valorApostaBase: 3.50,
  valorMinimoBolaoReferencia: 7.00,
  cotaMinimaReferencia: 3.50,
  cotasMaximasReferencia: 15,
  cotasMinimasReferencia: 2,
  apostasPorBolaoMax: 15,
  
  // Estrutura do bolão
  mesmaQtdNumerosEmTodasApostas: true,
  
  // Sorteio
  diasSorteio: ["terça", "quinta", "sábado"] as const,
  horarioSorteioBRT: "21:00",
  timezoneOficial: "America/Sao_Paulo",
  
  // Faixas de premiação oficiais
  faixasPremiacao: [
    { faixa: 1, descricao: "7 acertos", acertos: 7, percentualRateio: 35 },
    { faixa: 2, descricao: "6 acertos", acertos: 6, percentualRateio: 12 },
    { faixa: 3, descricao: "5 acertos", acertos: 5, percentualRateio: 8 },
    { faixa: 4, descricao: "4 acertos", acertos: 4, percentualRateio: 8 },
    { faixa: 5, descricao: "3 acertos", acertos: 3, percentualRateio: 8 },
    { faixa: 6, descricao: "Time do Coração", acertos: "time", percentualRateio: 8 },
  ] as const,
} as const;

// ============================================================
// LISTA OFICIAL DE TIMES DO CORAÇÃO (80 TIMES)
// ============================================================

export const TIMES_DO_CORACAO: readonly TimeDoCoracao[] = [
  { id: 1, nome: "ABC", nomeCompleto: "ABC Futebol Clube", uf: "RN", slug: "abc", ativo: true },
  { id: 2, nome: "América-MG", nomeCompleto: "América Futebol Clube", uf: "MG", slug: "america-mg", ativo: true },
  { id: 3, nome: "América-RN", nomeCompleto: "América Futebol Clube", uf: "RN", slug: "america-rn", ativo: true },
  { id: 4, nome: "Athletico-PR", nomeCompleto: "Club Athletico Paranaense", uf: "PR", slug: "athletico-pr", ativo: true },
  { id: 5, nome: "Atlético-GO", nomeCompleto: "Atlético Clube Goianiense", uf: "GO", slug: "atletico-go", ativo: true },
  { id: 6, nome: "Atlético-MG", nomeCompleto: "Clube Atlético Mineiro", uf: "MG", slug: "atletico-mg", ativo: true },
  { id: 7, nome: "Avaí", nomeCompleto: "Avaí Futebol Clube", uf: "SC", slug: "avai", ativo: true },
  { id: 8, nome: "Bahia", nomeCompleto: "Esporte Clube Bahia", uf: "BA", slug: "bahia", ativo: true },
  { id: 9, nome: "Botafogo", nomeCompleto: "Botafogo de Futebol e Regatas", uf: "RJ", slug: "botafogo", ativo: true },
  { id: 10, nome: "Botafogo-SP", nomeCompleto: "Botafogo Futebol Clube", uf: "SP", slug: "botafogo-sp", ativo: true },
  { id: 11, nome: "Bragantino", nomeCompleto: "Red Bull Bragantino", uf: "SP", slug: "bragantino", ativo: true },
  { id: 12, nome: "Brasiliense", nomeCompleto: "Brasiliense Futebol Clube", uf: "DF", slug: "brasiliense", ativo: true },
  { id: 13, nome: "Ceará", nomeCompleto: "Ceará Sporting Club", uf: "CE", slug: "ceara", ativo: true },
  { id: 14, nome: "Chapecoense", nomeCompleto: "Associação Chapecoense de Futebol", uf: "SC", slug: "chapecoense", ativo: true },
  { id: 15, nome: "Corinthians", nomeCompleto: "Sport Club Corinthians Paulista", uf: "SP", slug: "corinthians", ativo: true },
  { id: 16, nome: "Coritiba", nomeCompleto: "Coritiba Foot Ball Club", uf: "PR", slug: "coritiba", ativo: true },
  { id: 17, nome: "CRB", nomeCompleto: "Clube de Regatas Brasil", uf: "AL", slug: "crb", ativo: true },
  { id: 18, nome: "Criciúma", nomeCompleto: "Criciúma Esporte Clube", uf: "SC", slug: "criciuma", ativo: true },
  { id: 19, nome: "Cruzeiro", nomeCompleto: "Cruzeiro Esporte Clube", uf: "MG", slug: "cruzeiro", ativo: true },
  { id: 20, nome: "CSA", nomeCompleto: "Centro Sportivo Alagoano", uf: "AL", slug: "csa", ativo: true },
  { id: 21, nome: "Cuiabá", nomeCompleto: "Cuiabá Esporte Clube", uf: "MT", slug: "cuiaba", ativo: true },
  { id: 22, nome: "Figueirense", nomeCompleto: "Figueirense Futebol Clube", uf: "SC", slug: "figueirense", ativo: true },
  { id: 23, nome: "Flamengo", nomeCompleto: "Clube de Regatas do Flamengo", uf: "RJ", slug: "flamengo", ativo: true },
  { id: 24, nome: "Fluminense", nomeCompleto: "Fluminense Football Club", uf: "RJ", slug: "fluminense", ativo: true },
  { id: 25, nome: "Fortaleza", nomeCompleto: "Fortaleza Esporte Clube", uf: "CE", slug: "fortaleza", ativo: true },
  { id: 26, nome: "Goiás", nomeCompleto: "Goiás Esporte Clube", uf: "GO", slug: "goias", ativo: true },
  { id: 27, nome: "Grêmio", nomeCompleto: "Grêmio Foot-Ball Porto Alegrense", uf: "RS", slug: "gremio", ativo: true },
  { id: 28, nome: "Guarani", nomeCompleto: "Guarani Futebol Clube", uf: "SP", slug: "guarani", ativo: true },
  { id: 29, nome: "Internacional", nomeCompleto: "Sport Club Internacional", uf: "RS", slug: "internacional", ativo: true },
  { id: 30, nome: "Joinville", nomeCompleto: "Joinville Esporte Clube", uf: "SC", slug: "joinville", ativo: true },
  { id: 31, nome: "Juventude", nomeCompleto: "Esporte Clube Juventude", uf: "RS", slug: "juventude", ativo: true },
  { id: 32, nome: "Londrina", nomeCompleto: "Londrina Esporte Clube", uf: "PR", slug: "londrina", ativo: true },
  { id: 33, nome: "Náutico", nomeCompleto: "Clube Náutico Capibaribe", uf: "PE", slug: "nautico", ativo: true },
  { id: 34, nome: "Novorizontino", nomeCompleto: "Grêmio Novorizontino", uf: "SP", slug: "novorizontino", ativo: true },
  { id: 35, nome: "Operário-PR", nomeCompleto: "Operário Ferroviário Esporte Clube", uf: "PR", slug: "operario-pr", ativo: true },
  { id: 36, nome: "Palmeiras", nomeCompleto: "Sociedade Esportiva Palmeiras", uf: "SP", slug: "palmeiras", ativo: true },
  { id: 37, nome: "Paraná", nomeCompleto: "Paraná Clube", uf: "PR", slug: "parana", ativo: true },
  { id: 38, nome: "Paysandu", nomeCompleto: "Paysandu Sport Club", uf: "PA", slug: "paysandu", ativo: true },
  { id: 39, nome: "Ponte Preta", nomeCompleto: "Associação Atlética Ponte Preta", uf: "SP", slug: "ponte-preta", ativo: true },
  { id: 40, nome: "Portuguesa", nomeCompleto: "Associação Portuguesa de Desportos", uf: "SP", slug: "portuguesa", ativo: true },
  { id: 41, nome: "Remo", nomeCompleto: "Clube do Remo", uf: "PA", slug: "remo", ativo: true },
  { id: 42, nome: "Sampaio Corrêa", nomeCompleto: "Sampaio Corrêa Futebol Clube", uf: "MA", slug: "sampaio-correa", ativo: true },
  { id: 43, nome: "Santa Cruz", nomeCompleto: "Santa Cruz Futebol Clube", uf: "PE", slug: "santa-cruz", ativo: true },
  { id: 44, nome: "Santos", nomeCompleto: "Santos Futebol Clube", uf: "SP", slug: "santos", ativo: true },
  { id: 45, nome: "São Paulo", nomeCompleto: "São Paulo Futebol Clube", uf: "SP", slug: "sao-paulo", ativo: true },
  { id: 46, nome: "Sport", nomeCompleto: "Sport Club do Recife", uf: "PE", slug: "sport", ativo: true },
  { id: 47, nome: "Vasco", nomeCompleto: "Club de Regatas Vasco da Gama", uf: "RJ", slug: "vasco", ativo: true },
  { id: 48, nome: "Vila Nova", nomeCompleto: "Vila Nova Futebol Clube", uf: "GO", slug: "vila-nova", ativo: true },
  { id: 49, nome: "Vitória", nomeCompleto: "Esporte Clube Vitória", uf: "BA", slug: "vitoria", ativo: true },
  { id: 50, nome: "XV de Piracicaba", nomeCompleto: "Esporte Clube XV de Novembro", uf: "SP", slug: "xv-piracicaba", ativo: true },
  { id: 51, nome: "Mirassol", nomeCompleto: "Mirassol Futebol Clube", uf: "SP", slug: "mirassol", ativo: true },
  { id: 52, nome: "Ituano", nomeCompleto: "Ituano Futebol Clube", uf: "SP", slug: "ituano", ativo: true },
  { id: 53, nome: "São Bento", nomeCompleto: "Esporte Clube São Bento", uf: "SP", slug: "sao-bento", ativo: true },
  { id: 54, nome: "Ferroviária", nomeCompleto: "Associação Ferroviária de Esportes", uf: "SP", slug: "ferroviaria", ativo: true },
  { id: 55, nome: "Santo André", nomeCompleto: "Esporte Clube Santo André", uf: "SP", slug: "santo-andre", ativo: true },
  { id: 56, nome: "Água Santa", nomeCompleto: "Esporte Clube Água Santa", uf: "SP", slug: "agua-santa", ativo: true },
  { id: 57, nome: "Tombense", nomeCompleto: "Tombense Futebol Clube", uf: "MG", slug: "tombense", ativo: true },
  { id: 58, nome: "Ypiranga", nomeCompleto: "Ypiranga Futebol Clube", uf: "RS", slug: "ypiranga", ativo: true },
  { id: 59, nome: "Brasil de Pelotas", nomeCompleto: "Grêmio Esportivo Brasil", uf: "RS", slug: "brasil-pelotas", ativo: true },
  { id: 60, nome: "São José-RS", nomeCompleto: "Esporte Clube São José", uf: "RS", slug: "sao-jose-rs", ativo: true },
  { id: 61, nome: "Confiança", nomeCompleto: "Associação Desportiva Confiança", uf: "SE", slug: "confianca", ativo: true },
  { id: 62, nome: "Altos", nomeCompleto: "Altos Esporte Clube", uf: "PI", slug: "altos", ativo: true },
  { id: 63, nome: "Floresta", nomeCompleto: "Floresta Esporte Clube", uf: "CE", slug: "floresta", ativo: true },
  { id: 64, nome: "Ferroviário", nomeCompleto: "Ferroviário Atlético Clube", uf: "CE", slug: "ferroviario", ativo: true },
  { id: 65, nome: "Manaus", nomeCompleto: "Manaus Futebol Clube", uf: "AM", slug: "manaus", ativo: true },
  { id: 66, nome: "Amazonas", nomeCompleto: "Amazonas Futebol Clube", uf: "AM", slug: "amazonas", ativo: true },
  { id: 67, nome: "Aparecidense", nomeCompleto: "Associação Atlética Aparecidense", uf: "GO", slug: "aparecidense", ativo: true },
  { id: 68, nome: "Atlético-BA", nomeCompleto: "Esporte Clube Atlético", uf: "BA", slug: "atletico-ba", ativo: true },
  { id: 69, nome: "Caxias", nomeCompleto: "Sociedade Esportiva e Recreativa Caxias do Sul", uf: "RS", slug: "caxias", ativo: true },
  { id: 70, nome: "Volta Redonda", nomeCompleto: "Volta Redonda Futebol Clube", uf: "RJ", slug: "volta-redonda", ativo: true },
  { id: 71, nome: "Nova Iguaçu", nomeCompleto: "Nova Iguaçu Futebol Clube", uf: "RJ", slug: "nova-iguacu", ativo: true },
  { id: 72, nome: "Madureira", nomeCompleto: "Madureira Esporte Clube", uf: "RJ", slug: "madureira", ativo: true },
  { id: 73, nome: "ABC-RN", nomeCompleto: "ABC Futebol Clube", uf: "RN", slug: "abc-rn", ativo: true },
  { id: 74, nome: "Treze", nomeCompleto: "Treze Futebol Clube", uf: "PB", slug: "treze", ativo: true },
  { id: 75, nome: "Botafogo-PB", nomeCompleto: "Botafogo Futebol Clube", uf: "PB", slug: "botafogo-pb", ativo: true },
  { id: 76, nome: "CSA-AL", nomeCompleto: "Centro Sportivo Alagoano", uf: "AL", slug: "csa-al", ativo: true },
  { id: 77, nome: "Sergipe", nomeCompleto: "Club Sportivo Sergipe", uf: "SE", slug: "sergipe", ativo: true },
  { id: 78, nome: "Itabaiana", nomeCompleto: "Associação Olímpica de Itabaiana", uf: "SE", slug: "itabaiana", ativo: true },
  { id: 79, nome: "Jacuipense", nomeCompleto: "Jacuipense Esporte Clube", uf: "BA", slug: "jacuipense", ativo: true },
  { id: 80, nome: "Juazeirense", nomeCompleto: "Juazeirense Esporte Clube", uf: "BA", slug: "juazeirense", ativo: true },
] as const;

// ============================================================
// FUNÇÕES DE VALIDAÇÃO - REGRAS DA MODALIDADE
// ============================================================

/**
 * Valida se um número está dentro do universo permitido
 * [CAMADA: MODALIDADE]
 */
export function validarNumeroUniverso(numero: number): boolean {
  const { universoNumerosMin, universoNumerosMax } = REGRAS_MODALIDADE_TIMEMANIA;
  return Number.isInteger(numero) && 
         numero >= universoNumerosMin && 
         numero <= universoNumerosMax;
}

/**
 * Valida se o Time do Coração é válido
 * [CAMADA: MODALIDADE]
 */
export function validarTimeDoCoracao(timeId: number): boolean {
  return TIMES_DO_CORACAO.some(time => time.id === timeId && time.ativo);
}

/**
 * Obtém o Time do Coração pelo ID
 * [CAMADA: MODALIDADE]
 */
export function getTimeDoCoracaoById(timeId: number): TimeDoCoracao | undefined {
  return TIMES_DO_CORACAO.find(time => time.id === timeId);
}

/**
 * Obtém todos os Times do Coração ativos
 * [CAMADA: MODALIDADE]
 */
export function getTimesDoCoracaoAtivos(): readonly TimeDoCoracao[] {
  return TIMES_DO_CORACAO.filter(time => time.ativo);
}

/**
 * Valida uma aposta individual da Timemania
 * [CAMADA: MODALIDADE]
 * 
 * Regras validadas:
 * - Exatamente 10 números
 * - Números entre 1 e 80
 * - Sem repetição
 * - Time do Coração obrigatório e válido
 */
export function validarApostaTimemania(aposta: ApostaTimemania): ResultadoValidacaoAposta {
  const erros: string[] = [];
  const { numerosPorAposta, universoNumerosMin, universoNumerosMax, timeDoCoracaoObrigatorio } = REGRAS_MODALIDADE_TIMEMANIA;
  
  // Validar quantidade de números
  if (!aposta.numeros || aposta.numeros.length !== numerosPorAposta) {
    erros.push(`[MODALIDADE] Aposta deve conter exatamente ${numerosPorAposta} números. Recebido: ${aposta.numeros?.length || 0}`);
  }
  
  // Validar se todos os números estão no universo
  if (aposta.numeros) {
    const numerosInvalidos = aposta.numeros.filter(n => !validarNumeroUniverso(n));
    if (numerosInvalidos.length > 0) {
      erros.push(`[MODALIDADE] Números fora do universo permitido (${universoNumerosMin}-${universoNumerosMax}): ${numerosInvalidos.join(', ')}`);
    }
    
    // Validar repetições
    const numerosUnicos = new Set(aposta.numeros);
    if (numerosUnicos.size !== aposta.numeros.length) {
      erros.push(`[MODALIDADE] Não são permitidos números repetidos na mesma aposta`);
    }
  }
  
  // Validar Time do Coração
  if (timeDoCoracaoObrigatorio) {
    if (!aposta.timeDoCoracaoId) {
      erros.push(`[MODALIDADE] Time do Coração é obrigatório`);
    } else if (!validarTimeDoCoracao(aposta.timeDoCoracaoId)) {
      erros.push(`[MODALIDADE] Time do Coração inválido: ${aposta.timeDoCoracaoId}`);
    }
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
export function validarListaApostasTimemania(apostas: ApostaTimemania[]): ResultadoValidacaoAposta {
  const erros: string[] = [];
  const { apostasPorBolaoMax } = REGRAS_MODALIDADE_TIMEMANIA;
  
  // Validar quantidade de apostas
  if (!apostas || apostas.length === 0) {
    erros.push(`[MODALIDADE] Bolão deve conter pelo menos 1 aposta`);
  } else if (apostas.length > apostasPorBolaoMax) {
    erros.push(`[MODALIDADE] Bolão não pode ter mais que ${apostasPorBolaoMax} apostas. Recebido: ${apostas.length}`);
  }
  
  // Validar cada aposta individualmente
  if (apostas) {
    apostas.forEach((aposta, index) => {
      const resultado = validarApostaTimemania(aposta);
      if (!resultado.valido) {
        resultado.erros.forEach(erro => {
          erros.push(`Aposta ${index + 1}: ${erro}`);
        });
      }
    });
  }
  
  return {
    valido: erros.length === 0,
    erros,
    camadaValidacao: 'MODALIDADE'
  };
}

/**
 * Calcula o valor total das apostas baseado nas regras da modalidade
 * [CAMADA: MODALIDADE]
 */
export function calcularValorTotalApostasModalidade(quantidadeApostas: number): number {
  const { valorApostaBase } = REGRAS_MODALIDADE_TIMEMANIA;
  return quantidadeApostas * valorApostaBase;
}

/**
 * Verifica se é dia de sorteio da Timemania
 * [CAMADA: MODALIDADE]
 */
export function isDiaSorteioTimemania(data: Date): boolean {
  const diasSemana = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const diaSemana = diasSemana[data.getDay()];
  return REGRAS_MODALIDADE_TIMEMANIA.diasSorteio.includes(diaSemana);
}

/**
 * Obtém o próximo dia de sorteio
 * [CAMADA: MODALIDADE]
 */
export function getProximoDiaSorteio(dataBase: Date = new Date()): Date {
  const proximaData = new Date(dataBase);
  
  // Avança até encontrar um dia de sorteio
  for (let i = 0; i < 7; i++) {
    proximaData.setDate(proximaData.getDate() + 1);
    if (isDiaSorteioTimemania(proximaData)) {
      return proximaData;
    }
  }
  
  return proximaData;
}

export default REGRAS_MODALIDADE_TIMEMANIA;
