// Custos por jogo conforme as regras da Caixa
export const CUSTO_POR_JOGO = {
  lotofacil: 3.0,      // R$ 3,00 por jogo
  megasena: 5.0,       // R$ 5,00 por jogo
  quina: 2.5,          // R$ 2,50 por jogo
  timemania: 3.5,      // R$ 3,50 por jogo
  "dia-de-sorte": 2.5, // R$ 2,50 por jogo
  "super-sete": 2.5,   // R$ 2,50 por jogo
  "dupla-sena": 2.5,   // R$ 2,50 por jogo
  lotomania: 3.0,      // R$ 3,00 por jogo
  federal: 10.0,       // R$ 10,00 por bilhete
} as const;

// Prêmios médios estimados (em milhões)
export const PREMIO_MEDIO = {
  lotofacil: { min: 1.5, max: 5 },        // R$ 1.5M a R$ 5M normal
  megasena: { min: 45, max: 300 },        // R$ 45M a R$ 300M normal
  quina: { min: 1.5, max: 10 },           // R$ 1.5M a R$ 10M normal
  timemania: { min: 5, max: 30 },         // R$ 5M a R$ 30M
  "dia-de-sorte": { min: 1, max: 5 },     // R$ 1M a R$ 5M
  "super-sete": { min: 0.5, max: 3 },     // R$ 500K a R$ 3M
  "dupla-sena": { min: 1, max: 8 },       // R$ 1M a R$ 8M
  lotomania: { min: 1.5, max: 8 },        // R$ 1.5M a R$ 8M
  federal: { min: 0.5, max: 1.5 },        // R$ 500K a R$ 1.5M
  lotofacil_independencia: { min: 8, max: 12 },  // R$ 8M a R$ 12M
  megasena_virada: { min: 450, max: 600 },       // R$ 450M a R$ 600M
  quina_saojoao: { min: 5, max: 15 },            // R$ 5M a R$ 15M
} as const;

export type LotteryType = "lotofacil" | "megasena" | "quina" | "timemania" | "dia-de-sorte" | "super-sete" | "dupla-sena" | "lotomania" | "federal";

export interface BolaoFinancials {
  valorBolao: number;        // Valor total do bolão em R$
  minParticipacao: number;   // Participação mínima em R$
  premioEstimado: number;    // Prêmio em milhões
  custoJogo: number;         // Custo unitário do jogo
  jogosGerados: number;      // Quantidade de jogos
}

/**
 * Calcula o valor total de um bolão com base no número de jogos
 */
export const calculateBolaoValue = (jogos: number, tipo: LotteryType): number => {
  return jogos * CUSTO_POR_JOGO[tipo];
};

/**
 * Calcula a participação mínima (geralmente entre 1% e 5% do valor total)
 */
export const calculateMinParticipation = (valorBolao: number): number => {
  // Participação mínima é cerca de 1-2% do valor total, arredondado para valores inteiros
  const percentMin = 0.01;
  const percentMax = 0.05;
  const percent = Math.random() * (percentMin + percentMax - percentMin) + percentMin;
  const valor = valorBolao * percent;
  
  // Arredondar para R$ 5 mais próximo, mínimo R$ 20
  return Math.max(20, Math.round(valor / 5) * 5);
};

/**
 * Gera um prêmio estimado realista para uma loteria
 */
export const generatePrizeEstimate = (tipo: LotteryType, isSpecial: boolean = false): number => {
  let range = PREMIO_MEDIO[tipo];
  
  if (isSpecial) {
    switch (tipo) {
      case "lotofacil":
        range = PREMIO_MEDIO.lotofacil_independencia;
        break;
      case "megasena":
        range = PREMIO_MEDIO.megasena_virada;
        break;
      case "quina":
        range = PREMIO_MEDIO.quina_saojoao;
        break;
    }
  }
  
  const value = Math.random() * (range.max - range.min) + range.min;
  // Arredondar para 0.5 milhões mais próximo
  return Math.round(value * 2) / 2;
};

/**
 * Calcula todos os valores financeiros de um bolão
 */
export const calculateBolaoFinancials = (
  jogos: number, 
  tipo: LotteryType, 
  isSpecial: boolean = false
): BolaoFinancials => {
  const custoJogo = CUSTO_POR_JOGO[tipo];
  const valorBolao = jogos * custoJogo;
  const minParticipacao = calculateMinParticipation(valorBolao);
  const premioEstimado = generatePrizeEstimate(tipo, isSpecial);
  
  return {
    valorBolao,
    minParticipacao,
    premioEstimado,
    custoJogo,
    jogosGerados: jogos,
  };
};

/**
 * Formata valor em reais brasileiro
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

/**
 * Formata prêmio em milhões
 */
export const formatPrize = (valueInMillions: number): string => {
  if (valueInMillions >= 1) {
    const formatted = valueInMillions.toFixed(1).replace(".", ",").replace(",0", "");
    return `R$ ${formatted} Milhões`;
  }
  return `R$ ${(valueInMillions * 1000).toFixed(0)} Mil`;
};

/**
 * Calcula o número de jogos necessários para atingir um valor de bolão específico
 */
export const calculateJogosFromValue = (valorBolao: number, tipo: LotteryType): number => {
  return Math.round(valorBolao / CUSTO_POR_JOGO[tipo]);
};

/**
 * Gera dados realistas para um bolão
 */
export const generateRealisticBolao = (
  tipo: LotteryType,
  dezenas: number,
  isSpecial: boolean = false
) => {
  // Número de jogos varia conforme dezenas (mais dezenas = mais jogos)
  const baseJogos = tipo === "megasena" ? 100 : tipo === "lotofacil" ? 50 : 40;
  const multiplicador = Math.max(1, dezenas - (tipo === "megasena" ? 6 : tipo === "lotofacil" ? 15 : 5));
  const jogosGerados = baseJogos + Math.floor(Math.random() * multiplicador * 20);
  
  const financials = calculateBolaoFinancials(jogosGerados, tipo, isSpecial);
  const fillPercentage = Math.floor(Math.random() * 70) + 20; // 20% a 90%
  
  return {
    dezenas,
    jogosGerados,
    ...financials,
    fillPercentage,
    status: fillPercentage > 75 ? "Quase Completo" : "Aberto",
  };
};
