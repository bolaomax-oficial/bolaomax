import { Clover, Star, Sparkles } from "lucide-react";

// Type definitions for lottery configuration
export interface LotteryConfig {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  description: string;
  color: {
    primary: string;
    text: string;
    bg: string;
    border: string;
    ball: string;
    gradient: string;
  };
  icon: typeof Clover | typeof Star | typeof Sparkles;
  dezenas: {
    min: number;
    max: number;
    range: number[];
  };
  numerosTotal: number;
  sorteios: string;
  frequencia: string;
  premioMinimo: string;
  enabled: boolean;
}

// Lottery configurations
export const LOTTERIES: LotteryConfig[] = [
  {
    id: "lotofacil",
    name: "Lotofácil",
    slug: "lotofacil",
    shortName: "LF",
    description: "A loteria mais fácil de ganhar! Escolha 15 números entre 25.",
    color: {
      primary: "violet",
      text: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      ball: "bg-violet-500",
      gradient: "from-violet-600 to-purple-600",
    },
    icon: Clover,
    dezenas: {
      min: 16,
      max: 20,
      range: [16, 17, 18, 19, 20],
    },
    numerosTotal: 25,
    sorteios: "Segunda a Sábado",
    frequencia: "Diário",
    premioMinimo: "R$ 1.500.000,00",
    enabled: true,
  },
  {
    id: "megasena",
    name: "Mega-Sena",
    slug: "megasena",
    shortName: "MS",
    description: "A loteria mais popular do Brasil! Prêmios milionários toda semana.",
    color: {
      primary: "emerald",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      ball: "bg-emerald-500",
      gradient: "from-emerald-600 to-green-600",
    },
    icon: Sparkles,
    dezenas: {
      min: 7,
      max: 20,
      range: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    numerosTotal: 60,
    sorteios: "Quartas e Sábados",
    frequencia: "Duas vezes por semana",
    premioMinimo: "R$ 3.000.000,00",
    enabled: true,
  },
  {
    id: "quina",
    name: "Quina",
    slug: "quina",
    shortName: "QN",
    description: "Sorteios todos os dias! Acerte 5 números entre 80.",
    color: {
      primary: "sky",
      text: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      ball: "bg-sky-500",
      gradient: "from-sky-600 to-blue-600",
    },
    icon: Star,
    dezenas: {
      min: 6,
      max: 15,
      range: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    numerosTotal: 80,
    sorteios: "Segunda a Sábado",
    frequencia: "Diário",
    premioMinimo: "R$ 1.000.000,00",
    enabled: true,
  },
  {
    id: "lotomania",
    name: "Lotomania",
    slug: "lotomania",
    shortName: "LTM",
    description: "Fácil de jogar e de ganhar: escolha 50 números e ganhe até com zero acertos!",
    color: {
      primary: "orange",
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      ball: "bg-orange-500",
      gradient: "from-orange-600 to-yellow-600",
    },
    icon: Clover,
    dezenas: {
      min: 50,
      max: 50,
      range: [50],
    },
    numerosTotal: 100,
    sorteios: "Segundas, Quartas e Sextas",
    frequencia: "Três vezes por semana",
    premioMinimo: "R$ 500.000,00",
    enabled: true,
  },
  {
    id: "timemania",
    name: "Timemania",
    slug: "timemania",
    shortName: "TM",
    description: "A loteria dos apaixonados por futebol. Escolha seu time do coração!",
    color: {
      primary: "yellow",
      text: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      ball: "bg-yellow-500",
      gradient: "from-yellow-500 to-green-500",
    },
    icon: Clover,
    dezenas: {
      min: 10,
      max: 10,
      range: [10],
    },
    numerosTotal: 80,
    sorteios: "Terças, Quintas e Sábados",
    frequencia: "Três vezes por semana",
    premioMinimo: "R$ 100.000,00",
    enabled: true,
  },
  {
    id: "dia-de-sorte",
    name: "Dia de Sorte",
    slug: "dia-de-sorte",
    shortName: "DS",
    description: "A loteria onde você aposta seus números da sorte e seu mês favorito.",
    color: {
      primary: "amber",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      ball: "bg-amber-500",
      gradient: "from-amber-500 to-yellow-500",
    },
    icon: Clover,
    dezenas: {
      min: 7,
      max: 15,
      range: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    numerosTotal: 31,
    sorteios: "Terças, Quintas e Sábados",
    frequencia: "Três vezes por semana",
    premioMinimo: "R$ 150.000,00",
    enabled: true,
  },
  {
    id: "super-sete",
    name: "Super Sete",
    slug: "super-sete",
    shortName: "SS",
    description: "A loteria em colunas. Escolha um número em cada uma das 7 colunas.",
    color: {
      primary: "cyan",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      ball: "bg-cyan-500",
      gradient: "from-cyan-600 to-blue-600",
    },
    icon: Clover,
    dezenas: {
      min: 7,
      max: 21,
      range: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
    },
    numerosTotal: 70, // 7 colunas de 10
    sorteios: "Segundas, Quartas e Sextas",
    frequencia: "Três vezes por semana",
    premioMinimo: "R$ 100.000,00",
    enabled: true,
  },
  {
    id: "dupla-sena",
    name: "Dupla Sena",
    slug: "dupla-sena",
    shortName: "DSN",
    description: "Com apenas um bilhete, você tem o dobro de chances de ganhar.",
    color: {
      primary: "red",
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      ball: "bg-red-500",
      gradient: "from-red-600 to-rose-600",
    },
    icon: Clover,
    dezenas: {
      min: 6,
      max: 15,
      range: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    numerosTotal: 50,
    sorteios: "Segundas, Quartas e Sextas",
    frequencia: "Três vezes por semana",
    premioMinimo: "R$ 150.000,00",
    enabled: true,
  },
  {
    id: "federal",
    name: "Federal",
    slug: "federal",
    shortName: "FED",
    description: "A loteria mais tradicional do Brasil, com sorteios as quartas e sábados.",
    color: {
      primary: "blue",
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      ball: "bg-blue-500",
      gradient: "from-blue-600 to-indigo-600",
    },
    icon: Clover,
    dezenas: {
      min: 1,
      max: 1,
      range: [1],
    },
    numerosTotal: 99999, // Na verdade são bilhetes de 5 algarismos
    sorteios: "Quartas e Sábados",
    frequencia: "Duas vezes por semana",
    premioMinimo: "R$ 500.000,00",
    enabled: true,
  },
];

// Helper functions
export const getLotteryById = (id: string): LotteryConfig | undefined => {
  return LOTTERIES.find((lottery) => lottery.id === id);
};

export const getLotteryBySlug = (slug: string): LotteryConfig | undefined => {
  return LOTTERIES.find((lottery) => lottery.slug === slug);
};

export const getActiveLotteries = (): LotteryConfig[] => {
  return LOTTERIES.filter((lottery) => lottery.enabled);
};

export const getLotteryColor = (id: string) => {
  const lottery = getLotteryById(id);
  return lottery?.color || LOTTERIES[0].color;
};

// Prize tier configurations
export interface PrizeTier {
  id: string;
  name: string;
  description: string;
  minimumMatches: number;
}

export const MEGA_SENA_TIERS: PrizeTier[] = [
  { id: "sena", name: "Sena", description: "6 acertos", minimumMatches: 6 },
  { id: "quina", name: "Quina", description: "5 acertos", minimumMatches: 5 },
  { id: "quadra", name: "Quadra", description: "4 acertos", minimumMatches: 4 },
];

export const QUINA_TIERS: PrizeTier[] = [
  { id: "quina", name: "Quina", description: "5 acertos", minimumMatches: 5 },
  { id: "quadra", name: "Quadra", description: "4 acertos", minimumMatches: 4 },
  { id: "terno", name: "Terno", description: "3 acertos", minimumMatches: 3 },
  { id: "duque", name: "Duque", description: "2 acertos", minimumMatches: 2 },
];

export const LOTOFACIL_TIERS: PrizeTier[] = [
  { id: "15", name: "15 acertos", description: "Prêmio principal", minimumMatches: 15 },
  { id: "14", name: "14 acertos", description: "Segundo prêmio", minimumMatches: 14 },
  { id: "13", name: "13 acertos", description: "Terceiro prêmio", minimumMatches: 13 },
  { id: "12", name: "12 acertos", description: "Quarto prêmio", minimumMatches: 12 },
  { id: "11", name: "11 acertos", description: "Quinto prêmio", minimumMatches: 11 },
];

// Special events configuration
export interface SpecialEvent {
  id: string;
  lotteryId: string;
  name: string;
  shortName: string;
  description: string;
  date: string;
  estimatedPrize: string;
  color: {
    primary: string;
    bg: string;
    border: string;
  };
  emoji: string;
  enabled: boolean;
}

export const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: "mega-virada",
    lotteryId: "megasena",
    name: "Mega da Virada",
    shortName: "Virada",
    description: "O maior prêmio do ano! Sorteio especial de fim de ano.",
    date: "31/12",
    estimatedPrize: "R$ 550.000.000,00",
    color: {
      primary: "orange",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
    },
    emoji: "🎆",
    enabled: true,
  },
  {
    id: "quina-sao-joao",
    lotteryId: "quina",
    name: "Quina de São João",
    shortName: "São João",
    description: "Sorteio especial de São João com prêmio garantido!",
    date: "24/06",
    estimatedPrize: "R$ 200.000.000,00",
    color: {
      primary: "red",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
    emoji: "🔥",
    enabled: true,
  },
  {
    id: "lotofacil-independencia",
    lotteryId: "lotofacil",
    name: "Lotofácil da Independência",
    shortName: "Independência",
    description: "Sorteio especial do 7 de setembro!",
    date: "07/09",
    estimatedPrize: "R$ 150.000.000,00",
    color: {
      primary: "green",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
    },
    emoji: "🇧🇷",
    enabled: true,
  },
];

export const getSpecialEventsByLottery = (lotteryId: string): SpecialEvent[] => {
  return SPECIAL_EVENTS.filter((event) => event.lotteryId === lotteryId && event.enabled);
};

export const getActiveSpecialEvents = (): SpecialEvent[] => {
  return SPECIAL_EVENTS.filter((event) => event.enabled);
};

// Participation limits
export const PARTICIPATION_LIMITS = {
  min: 5, // 5%
  max: 50, // 50%
  step: 5, // 5% steps
  default: 10, // 10% default
};

// Currency formatting
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `R$ ${millions.toFixed(1).replace(".", ",")} Milhões`;
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return `R$ ${thousands.toFixed(0)} Mil`;
  }
  return formatCurrency(value);
};

// Number formatting
export const formatNumber = (num: number, padLength = 2): string => {
  return num.toString().padStart(padLength, "0");
};

// Bolao status types
export type BolaoStatus = "aberto" | "quase_completo" | "fechado" | "em_andamento" | "finalizado";

export const BOLAO_STATUS_LABELS: Record<BolaoStatus, string> = {
  aberto: "Aberto",
  quase_completo: "Quase Completo",
  fechado: "Fechado",
  em_andamento: "Em Andamento",
  finalizado: "Finalizado",
};

export const BOLAO_STATUS_COLORS: Record<BolaoStatus, { text: string; bg: string; border: string }> = {
  aberto: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  quase_completo: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  fechado: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  em_andamento: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  finalizado: { text: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30" },
};

export default LOTTERIES;
