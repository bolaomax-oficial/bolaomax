import { useState, useEffect, useCallback } from "react";

// TypeScript interfaces for lottery data
export interface Prize {
  faixa: string;
  ganhadores: number;
  premio: string;
}

export interface LotteryResult {
  numero: number;
  data: string;
  dezenas: number[];
  premios: Prize[];
  acumulado: boolean;
  proximoEstimado?: string;
}

export interface NumberFrequency {
  numero: number;
  vezes: number;
}

export interface LotteryStatistics {
  maisFrequentes: NumberFrequency[];
  menosFrequentes: NumberFrequency[];
  quentes: number[];
  frios: number[];
}

export interface NextDraw {
  data: string;
  premio: string;
}

export interface LotteryInfo {
  tipo: string;
  cor: string;
  corBg: string;
  corBorder: string;
  corBola: string;
  totalNumeros: number;
  numerosJogo: number;
  sorteios: string;
}

export interface LotteryData {
  info: LotteryInfo;
  ultimoConcurso: LotteryResult;
  proximoConcurso: NextDraw;
  historico: LotteryResult[];
  estatisticas: LotteryStatistics;
}

export type LotteryType = "megasena" | "quina" | "lotofacil";

// Mock data generator functions
const generateMockMegaSena = (): LotteryData => ({
  info: {
    tipo: "Mega-Sena",
    cor: "text-emerald-400",
    corBg: "bg-emerald-500/10",
    corBorder: "border-emerald-500/30",
    corBola: "bg-emerald-500",
    totalNumeros: 60,
    numerosJogo: 6,
    sorteios: "Quartas e Sábados",
  },
  ultimoConcurso: {
    numero: 2789,
    data: "06/02/2025",
    dezenas: [7, 15, 23, 38, 42, 58],
    premios: [
      { faixa: "Sena (6 acertos)", ganhadores: 2, premio: "R$ 78.453.219,32" },
      { faixa: "Quina (5 acertos)", ganhadores: 156, premio: "R$ 45.892,17" },
      { faixa: "Quadra (4 acertos)", ganhadores: 9847, premio: "R$ 1.023,45" },
    ],
    acumulado: false,
  },
  proximoConcurso: {
    data: "08/02/2025",
    premio: "R$ 3.500.000,00",
  },
  historico: [
    { numero: 2788, data: "03/02/2025", dezenas: [4, 12, 28, 33, 47, 55], premios: [], acumulado: true },
    { numero: 2787, data: "01/02/2025", dezenas: [9, 17, 24, 39, 44, 52], premios: [], acumulado: true },
    { numero: 2786, data: "29/01/2025", dezenas: [2, 19, 27, 36, 48, 59], premios: [], acumulado: false },
    { numero: 2785, data: "25/01/2025", dezenas: [6, 14, 22, 35, 41, 56], premios: [], acumulado: true },
    { numero: 2784, data: "22/01/2025", dezenas: [3, 11, 29, 37, 45, 53], premios: [], acumulado: true },
    { numero: 2783, data: "18/01/2025", dezenas: [8, 16, 25, 34, 46, 57], premios: [], acumulado: false },
    { numero: 2782, data: "15/01/2025", dezenas: [5, 13, 26, 38, 43, 54], premios: [], acumulado: true },
    { numero: 2781, data: "11/01/2025", dezenas: [1, 18, 23, 32, 49, 60], premios: [], acumulado: true },
    { numero: 2780, data: "08/01/2025", dezenas: [10, 20, 30, 40, 50, 58], premios: [], acumulado: false },
    { numero: 2779, data: "04/01/2025", dezenas: [7, 21, 31, 41, 51, 59], premios: [], acumulado: true },
  ],
  estatisticas: {
    maisFrequentes: [
      { numero: 10, vezes: 287 },
      { numero: 53, vezes: 281 },
      { numero: 42, vezes: 278 },
      { numero: 5, vezes: 274 },
      { numero: 23, vezes: 271 },
      { numero: 33, vezes: 268 },
      { numero: 4, vezes: 265 },
      { numero: 37, vezes: 262 },
      { numero: 51, vezes: 259 },
      { numero: 17, vezes: 256 },
    ],
    menosFrequentes: [
      { numero: 26, vezes: 198 },
      { numero: 55, vezes: 205 },
      { numero: 22, vezes: 209 },
      { numero: 9, vezes: 212 },
      { numero: 48, vezes: 215 },
      { numero: 3, vezes: 218 },
      { numero: 19, vezes: 221 },
      { numero: 45, vezes: 224 },
      { numero: 31, vezes: 227 },
      { numero: 7, vezes: 230 },
    ],
    quentes: [10, 53, 42, 5, 23],
    frios: [26, 55, 22, 9, 48],
  },
});

const generateMockQuina = (): LotteryData => ({
  info: {
    tipo: "Quina",
    cor: "text-sky-400",
    corBg: "bg-sky-500/10",
    corBorder: "border-sky-500/30",
    corBola: "bg-sky-500",
    totalNumeros: 80,
    numerosJogo: 5,
    sorteios: "Segunda a Sábado",
  },
  ultimoConcurso: {
    numero: 6587,
    data: "06/02/2025",
    dezenas: [12, 28, 45, 63, 77],
    premios: [
      { faixa: "Quina (5 acertos)", ganhadores: 1, premio: "R$ 2.847.621,89" },
      { faixa: "Quadra (4 acertos)", ganhadores: 89, premio: "R$ 8.452,33" },
      { faixa: "Terno (3 acertos)", ganhadores: 5621, premio: "R$ 187,92" },
    ],
    acumulado: false,
  },
  proximoConcurso: {
    data: "07/02/2025",
    premio: "R$ 1.200.000,00",
  },
  historico: [
    { numero: 6586, data: "05/02/2025", dezenas: [8, 22, 41, 58, 72], premios: [], acumulado: true },
    { numero: 6585, data: "04/02/2025", dezenas: [15, 33, 49, 67, 79], premios: [], acumulado: true },
    { numero: 6584, data: "03/02/2025", dezenas: [3, 19, 37, 54, 68], premios: [], acumulado: false },
    { numero: 6583, data: "01/02/2025", dezenas: [11, 26, 44, 61, 75], premios: [], acumulado: true },
    { numero: 6582, data: "31/01/2025", dezenas: [6, 24, 42, 59, 73], premios: [], acumulado: true },
    { numero: 6581, data: "30/01/2025", dezenas: [9, 27, 46, 64, 78], premios: [], acumulado: false },
    { numero: 6580, data: "29/01/2025", dezenas: [14, 31, 48, 66, 80], premios: [], acumulado: true },
    { numero: 6579, data: "28/01/2025", dezenas: [2, 20, 38, 55, 69], premios: [], acumulado: true },
    { numero: 6578, data: "27/01/2025", dezenas: [7, 25, 43, 60, 74], premios: [], acumulado: false },
    { numero: 6577, data: "25/01/2025", dezenas: [13, 30, 47, 65, 76], premios: [], acumulado: true },
  ],
  estatisticas: {
    maisFrequentes: [
      { numero: 4, vezes: 752 },
      { numero: 39, vezes: 746 },
      { numero: 65, vezes: 741 },
      { numero: 18, vezes: 735 },
      { numero: 52, vezes: 729 },
      { numero: 70, vezes: 724 },
      { numero: 31, vezes: 718 },
      { numero: 8, vezes: 713 },
      { numero: 44, vezes: 707 },
      { numero: 73, vezes: 702 },
    ],
    menosFrequentes: [
      { numero: 77, vezes: 598 },
      { numero: 21, vezes: 605 },
      { numero: 56, vezes: 612 },
      { numero: 9, vezes: 619 },
      { numero: 63, vezes: 626 },
      { numero: 35, vezes: 633 },
      { numero: 80, vezes: 640 },
      { numero: 12, vezes: 647 },
      { numero: 48, vezes: 654 },
      { numero: 27, vezes: 661 },
    ],
    quentes: [4, 39, 65, 18, 52],
    frios: [77, 21, 56, 9, 63],
  },
});

const generateMockLotofacil = (): LotteryData => ({
  info: {
    tipo: "Lotofácil",
    cor: "text-violet-400",
    corBg: "bg-violet-500/10",
    corBorder: "border-violet-500/30",
    corBola: "bg-violet-500",
    totalNumeros: 25,
    numerosJogo: 15,
    sorteios: "Segunda a Sábado",
  },
  ultimoConcurso: {
    numero: 3258,
    data: "06/02/2025",
    dezenas: [1, 3, 5, 6, 8, 10, 11, 13, 15, 17, 18, 20, 22, 24, 25],
    premios: [
      { faixa: "15 acertos", ganhadores: 3, premio: "R$ 1.234.567,89" },
      { faixa: "14 acertos", ganhadores: 287, premio: "R$ 2.156,78" },
      { faixa: "13 acertos", ganhadores: 8945, premio: "R$ 30,00" },
      { faixa: "12 acertos", ganhadores: 67823, premio: "R$ 12,00" },
      { faixa: "11 acertos", ganhadores: 298456, premio: "R$ 6,00" },
    ],
    acumulado: false,
  },
  proximoConcurso: {
    data: "07/02/2025",
    premio: "R$ 1.500.000,00",
  },
  historico: [
    { numero: 3257, data: "05/02/2025", dezenas: [2, 4, 6, 7, 9, 11, 12, 14, 16, 18, 19, 21, 23, 24, 25], premios: [], acumulado: true },
    { numero: 3256, data: "04/02/2025", dezenas: [1, 2, 3, 5, 7, 8, 10, 12, 14, 16, 17, 19, 21, 23, 25], premios: [], acumulado: false },
    { numero: 3255, data: "03/02/2025", dezenas: [1, 3, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22, 24, 25], premios: [], acumulado: true },
    { numero: 3254, data: "01/02/2025", dezenas: [2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21, 22, 24, 25], premios: [], acumulado: true },
    { numero: 3253, data: "31/01/2025", dezenas: [1, 2, 4, 6, 7, 9, 11, 13, 14, 16, 18, 20, 21, 23, 25], premios: [], acumulado: false },
    { numero: 3252, data: "30/01/2025", dezenas: [1, 3, 5, 6, 8, 10, 11, 13, 15, 16, 18, 20, 22, 23, 25], premios: [], acumulado: true },
    { numero: 3251, data: "29/01/2025", dezenas: [2, 4, 5, 7, 9, 10, 12, 14, 16, 17, 19, 21, 23, 24, 25], premios: [], acumulado: true },
    { numero: 3250, data: "28/01/2025", dezenas: [1, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 19, 21, 22, 24], premios: [], acumulado: false },
    { numero: 3249, data: "27/01/2025", dezenas: [1, 3, 4, 6, 8, 9, 11, 13, 14, 16, 18, 20, 22, 23, 25], premios: [], acumulado: true },
    { numero: 3248, data: "25/01/2025", dezenas: [2, 3, 5, 7, 8, 10, 11, 13, 15, 17, 18, 20, 22, 24, 25], premios: [], acumulado: true },
  ],
  estatisticas: {
    maisFrequentes: [
      { numero: 20, vezes: 2156 },
      { numero: 10, vezes: 2143 },
      { numero: 25, vezes: 2138 },
      { numero: 11, vezes: 2129 },
      { numero: 5, vezes: 2121 },
      { numero: 14, vezes: 2114 },
      { numero: 3, vezes: 2107 },
      { numero: 13, vezes: 2099 },
      { numero: 24, vezes: 2092 },
      { numero: 4, vezes: 2085 },
    ],
    menosFrequentes: [
      { numero: 16, vezes: 1945 },
      { numero: 22, vezes: 1952 },
      { numero: 8, vezes: 1959 },
      { numero: 19, vezes: 1966 },
      { numero: 6, vezes: 1973 },
      { numero: 15, vezes: 1980 },
      { numero: 23, vezes: 1987 },
      { numero: 7, vezes: 1994 },
      { numero: 21, vezes: 2001 },
      { numero: 9, vezes: 2008 },
    ],
    quentes: [20, 10, 25, 11, 5],
    frios: [16, 22, 8, 19, 6],
  },
});

// Mock data fetcher - simulates API call
const fetchLotteryData = async (type: LotteryType): Promise<LotteryData> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  switch (type) {
    case "megasena":
      return generateMockMegaSena();
    case "quina":
      return generateMockQuina();
    case "lotofacil":
      return generateMockLotofacil();
    default:
      throw new Error(`Unknown lottery type: ${type}`);
  }
};

// Main hook
export const useLotteryResults = (initialType: LotteryType = "megasena") => {
  const [lotteryType, setLotteryType] = useState<LotteryType>(initialType);
  const [data, setData] = useState<LotteryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchResults = useCallback(async (type: LotteryType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchLotteryData(type);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar resultados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchResults(lotteryType);
  }, [lotteryType, fetchResults]);

  const changeLotteryType = useCallback((type: LotteryType) => {
    setLotteryType(type);
    fetchResults(type);
  }, [fetchResults]);

  // Initial fetch
  useEffect(() => {
    fetchResults(lotteryType);
  }, []);

  return {
    data,
    lotteryType,
    isLoading,
    error,
    lastUpdated,
    refresh,
    changeLotteryType,
  };
};

// Additional utility functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatNumber = (num: number): string => {
  return num.toString().padStart(2, "0");
};

export const getLotteryColor = (type: LotteryType) => {
  const colors = {
    megasena: {
      main: "emerald",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      ball: "bg-emerald-500",
    },
    quina: {
      main: "sky",
      text: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      ball: "bg-sky-500",
    },
    lotofacil: {
      main: "violet",
      text: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      ball: "bg-violet-500",
    },
  };
  return colors[type];
};

export default useLotteryResults;
