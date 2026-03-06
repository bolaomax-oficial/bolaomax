/**
 * Lottery Configuration Service
 * 
 * This service provides a centralized configuration for all lotteries in the system.
 * To add a new lottery:
 * 
 * 1. Add a new LotteryConfig object to the lotteryConfigs array
 * 2. Set active: true when the lottery page is ready
 * 3. Set comingSoon: false when launching
 * 4. Create the corresponding page in src/web/pages/
 * 5. Add the route to src/web/app.tsx
 * 
 * The Header dropdown will automatically include any lottery marked as active.
 * Coming soon lotteries appear in a separate section with muted styling.
 * 
 * @example
 * // Adding a new lottery
 * {
 *   id: "timemania",
 *   name: "Timemania",
 *   slug: "timemania",
 *   color: "#FF5722",
 *   colorName: "orange",
 *   icon: "clock",
 *   active: true,
 *   comingSoon: false,
 *   description: "Sorteios às terças e quintas",
 *   route: "/timemania",
 *   drawDays: ["ter", "qui"],
 *   drawTime: "20:00",
 *   numberRange: "1-80",
 *   numbersToPick: 10,
 * }
 */

import { type LucideIcon, Circle, Clover, Star, Clock, Gem, Dices, Hash, Layers, Globe } from "lucide-react";

/**
 * Extended configuration interface for a lottery
 * Includes additional fields for lottery specifications, SEO, and display settings
 */
export interface LotteryConfig {
  /** Unique identifier for the lottery */
  id: string;
  /** Display name (e.g., "Lotofácil") */
  name: string;
  /** URL slug (e.g., "lotofacil") - used in routes and page identification */
  slug: string;
  /** Primary hex color for the lottery theme */
  color: string;
  /** Tailwind color name for easier styling (e.g., "violet", "emerald", "sky") */
  colorName: "violet" | "emerald" | "sky" | "orange" | "pink" | "amber" | "cyan" | "rose";
  /** Lucide icon identifier */
  icon: "circle" | "clover" | "star" | "clock" | "gem" | "dices" | "hash" | "layers" | "globe";
  /** Whether the lottery is currently active and available */
  active: boolean;
  /** Whether the lottery is marked as "coming soon" */
  comingSoon: boolean;
  /** Short description shown in the dropdown (e.g., "Sorteios diários") */
  description: string;
  /** Route path for the lottery page */
  route: string;
  
  // ===== Extended Fields =====
  /** Days of the week when draws occur (seg, ter, qua, qui, sex, sab, dom) */
  drawDays?: string[];
  /** Time of the draw (e.g., "20:00") */
  drawTime?: string;
  /** Range of numbers available for selection (e.g., "1-60") */
  numberRange?: string;
  /** How many numbers the player picks per game */
  numbersToPick?: number;
  /** Minimum bet amount in R$ */
  minBet?: number;
  /** Maximum bet amount in R$ */
  maxBet?: number;
  /** Estimated prize pool in R$ */
  prizeEstimate?: number;
  /** Whether this lottery should be featured/highlighted */
  featured?: boolean;
  /** SEO meta title for the lottery page */
  metaTitle?: string;
  /** SEO meta description for the lottery page */
  metaDescription?: string;
  /** SEO keywords for the lottery page */
  keywords?: string[];
  /** Whether to display in the menu (can hide while testing) */
  displayInMenu?: boolean;
}

/**
 * Icon mapping from string identifiers to Lucide components
 */
export const iconMap: Record<LotteryConfig["icon"], LucideIcon> = {
  circle: Circle,
  clover: Clover,
  star: Star,
  clock: Clock,
  gem: Gem,
  dices: Dices,
  hash: Hash,
  layers: Layers,
  globe: Globe,
};

/**
 * Tailwind color classes mapping for each color name
 */
export const colorClasses: Record<
  LotteryConfig["colorName"],
  { text: string; bg: string; border: string; iconBg: string; activeBg: string }
> = {
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500",
    border: "border-violet-500/30",
    iconBg: "bg-violet-500/20",
    activeBg: "bg-violet-500/10",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/20",
    activeBg: "bg-emerald-500/10",
  },
  sky: {
    text: "text-sky-400",
    bg: "bg-sky-500",
    border: "border-sky-500/30",
    iconBg: "bg-sky-500/20",
    activeBg: "bg-sky-500/10",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500",
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/20",
    activeBg: "bg-orange-500/10",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-500",
    border: "border-pink-500/30",
    iconBg: "bg-pink-500/20",
    activeBg: "bg-pink-500/10",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/20",
    activeBg: "bg-amber-500/10",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500",
    border: "border-cyan-500/30",
    iconBg: "bg-cyan-500/20",
    activeBg: "bg-cyan-500/10",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500",
    border: "border-rose-500/30",
    iconBg: "bg-rose-500/20",
    activeBg: "bg-rose-500/10",
  },
};

/**
 * Central configuration array for all lotteries
 * 
 * Active lotteries will appear in the main dropdown menu.
 * Coming soon lotteries appear in a separate "Em breve" section.
 */
export const lotteryConfigs: LotteryConfig[] = [
  // ===== ACTIVE LOTTERIES =====
  
  /**
   * Lotofácil - Caixa Econômica Federal
   * Sorteios diários (exceto domingos)
   * 25 números disponíveis (01-25), jogador escolhe 15-20 dezenas
   * Prêmio mínimo garantido de R$ 2 milhões
   */
  {
    id: "lotofacil",
    name: "Lotofácil",
    slug: "lotofacil",
    color: "#9C27B0",
    colorName: "violet",
    icon: "circle",
    active: true,
    comingSoon: false,
    description: "Sorteios diários",
    route: "/lotofacil",
    drawDays: ["seg", "ter", "qua", "qui", "sex", "sab"],
    drawTime: "20:00",
    numberRange: "1-25",
    numbersToPick: 15,
    minBet: 3,
    maxBet: 5000,
    prizeEstimate: 2000000,
    featured: true,
    metaTitle: "Bolões Lotofácil | BolãoMax - Participe dos Melhores Bolões",
    metaDescription: "Participe dos melhores bolões de Lotofácil com cotas acessíveis. Maior chance de ganhar, menor investimento. Sorteios diários!",
    keywords: ["lotofacil", "bolao lotofacil", "loteria", "sorteio diario", "bolao"],
    displayInMenu: true,
  },
  
  /**
   * Mega-Sena - Caixa Econômica Federal
   * Sorteios às quartas-feiras e sábados
   * 60 números disponíveis (01-60), jogador escolhe 6-15 dezenas
   * Prêmios frequentemente acima de R$ 50 milhões
   */
  {
    id: "megasena",
    name: "Mega-Sena",
    slug: "megasena",
    color: "#00C853",
    colorName: "emerald",
    icon: "clover",
    active: true,
    comingSoon: false,
    description: "Quartas e sábados",
    route: "/megasena",
    drawDays: ["qua", "sab"],
    drawTime: "20:00",
    numberRange: "1-60",
    numbersToPick: 6,
    minBet: 5,
    maxBet: 10000,
    prizeEstimate: 50000000,
    featured: true,
    metaTitle: "Bolões Mega-Sena | BolãoMax - Os Maiores Prêmios do Brasil",
    metaDescription: "Entre nos maiores bolões de Mega-Sena do Brasil. Prêmios milionários com cotas a partir de R$5. Quartas e sábados às 20h!",
    keywords: ["megasena", "mega sena", "bolao mega sena", "mega da virada", "loteria"],
    displayInMenu: true,
  },
  
  /**
   * Quina - Caixa Econômica Federal
   * Sorteios diários (segunda a sábado)
   * 80 números disponíveis (01-80), jogador escolhe 5-15 dezenas
   * Prêmios típicos entre R$ 1-10 milhões
   */
  {
    id: "quina",
    name: "Quina",
    slug: "quina",
    color: "#2196F3",
    colorName: "sky",
    icon: "star",
    active: true,
    comingSoon: false,
    description: "Sorteios diários",
    route: "/quina",
    drawDays: ["seg", "ter", "qua", "qui", "sex", "sab"],
    drawTime: "20:00",
    numberRange: "1-80",
    numbersToPick: 5,
    minBet: 2.5,
    maxBet: 5000,
    prizeEstimate: 3000000,
    featured: false,
    metaTitle: "Bolões Quina | BolãoMax - Sorteios Diários com Ótimas Chances",
    metaDescription: "Participe dos bolões de Quina com sorteios diários. Excelentes chances de ganhar com cotas acessíveis. Jogue agora!",
    keywords: ["quina", "bolao quina", "loteria quina", "sorteio quina", "bolao"],
    displayInMenu: true,
  },

  // ===== COMING SOON LOTTERIES =====
  
  /**
   * Timemania - Caixa Econômica Federal
   * Sorteios às terças e sábados às 20h
   * 80 números disponíveis (01-80), jogador escolhe 10 dezenas
   * Inclui Time do Coração que dá direito a prêmio extra
   * Apostas a partir de R$ 3,50
   */
  {
    id: "timemania",
    name: "Timemania",
    slug: "timemania",
    color: "#FF5722",
    colorName: "orange",
    icon: "clock",
    active: true,
    comingSoon: false,
    description: "Terças e sábados",
    route: "/timemania",
    drawDays: ["ter", "sab"],
    drawTime: "20:00",
    numberRange: "1-80",
    numbersToPick: 10,
    minBet: 3.5,
    maxBet: 5000,
    prizeEstimate: 15000000,
    featured: false,
    metaTitle: "Bolões Timemania | BolãoMax - Torça pelo Seu Time e Ganhe",
    metaDescription: "Bolões de Timemania com o time do coração. Escolha seu time e concorra a prêmios milionários às terças e sábados!",
    keywords: ["timemania", "bolao timemania", "time do coracao", "loteria timemania"],
    displayInMenu: true,
  },
  
  /**
   * Dia de Sorte - Caixa Econômica Federal
   * Sorteios às terças, quintas e sábados às 20h
   * 31 números disponíveis (01-31), jogador escolhe 7 dezenas
   * Inclui Mês da Sorte que dá direito a prêmio extra
   * Apostas a partir de R$ 2,50
   */
  {
    id: "dia-de-sorte",
    name: "Dia de Sorte",
    slug: "dia-de-sorte",
    color: "#FFC107",
    colorName: "amber",
    icon: "clover",
    active: true,
    comingSoon: false,
    description: "Terças, quintas e sábados",
    route: "/dia-de-sorte",
    drawDays: ["ter", "qui", "sab"],
    drawTime: "20:00",
    numberRange: "1-31",
    numbersToPick: 7,
    minBet: 2.5,
    maxBet: 5000,
    prizeEstimate: 5000000,
    featured: false,
    metaTitle: "Bolões Dia de Sorte | BolãoMax - Seu Mês da Sorte Está Aqui",
    metaDescription: "Participe dos bolões Dia de Sorte. Escolha seu mês da sorte e concorra a prêmios às terças, quintas e sábados!",
    keywords: ["dia de sorte", "bolao dia de sorte", "mes da sorte", "loteria dia de sorte"],
    displayInMenu: true,
  },
  
  /**
   * Super Sete - Caixa Econômica Federal
   * Sorteios às segundas, quartas e sextas às 20h
   * 7 colunas com números de 0-9, jogador escolhe 1 número por coluna
   * Possibilidade de marcar mais números por coluna aumentando as chances
   * Apostas a partir de R$ 2,50
   */
  {
    id: "super-sete",
    name: "Super Sete",
    slug: "super-sete",
    color: "#E91E63",
    colorName: "rose",
    icon: "layers",
    active: true,
    comingSoon: false,
    description: "Segundas, quartas e sextas",
    route: "/super-sete",
    drawDays: ["seg", "qua", "sex"],
    drawTime: "20:00",
    numberRange: "0-9",
    numbersToPick: 7,
    minBet: 2.5,
    maxBet: 5000,
    prizeEstimate: 8000000,
    featured: false,
    metaTitle: "Bolões Super Sete | BolãoMax - 7 Colunas de Sorte",
    metaDescription: "Entre nos bolões Super Sete com 7 colunas de sorte. Sorteios às segundas, quartas e sextas. Jogue agora!",
    keywords: ["super sete", "bolao super sete", "super 7", "loteria super sete"],
    displayInMenu: true,
  },
  
  /**
   * Dupla Sena - Caixa Econômica Federal
   * Sorteios às terças, quintas e sábados às 20h
   * 50 números disponíveis (01-50), jogador escolhe 6-15 dezenas
   * Dois sorteios por concurso, dobrando as chances de ganhar
   * Apostas a partir de R$ 2,50
   */
  {
    id: "dupla-sena",
    name: "Dupla Sena",
    slug: "dupla-sena",
    color: "#00BCD4",
    colorName: "cyan",
    icon: "dices",
    active: true,
    comingSoon: false,
    description: "Terças, quintas e sábados",
    route: "/dupla-sena",
    drawDays: ["ter", "qui", "sab"],
    drawTime: "20:00",
    numberRange: "1-50",
    numbersToPick: 6,
    minBet: 2.5,
    maxBet: 5000,
    prizeEstimate: 4000000,
    featured: false,
    metaTitle: "Bolões Dupla Sena | BolãoMax - Duas Chances de Ganhar",
    metaDescription: "Bolões Dupla Sena com duas chances de ganhar em cada sorteio. Terças, quintas e sábados às 20h!",
    keywords: ["dupla sena", "bolao dupla sena", "loteria dupla sena", "dois sorteios"],
    displayInMenu: true,
  },
  
  /**
   * Lotomania - Caixa Econômica Federal
   * Sorteios às terças, quintas e sábados às 20h
   * 100 números disponíveis (00-99), jogador marca 50 dezenas
   * Pode ganhar com 20, 19, 18, 17, 16, 15 ou 0 acertos
   * Apostas a partir de R$ 3,00
   */
  {
    id: "lotomania",
    name: "Lotomania",
    slug: "lotomania",
    color: "#EC4899",
    colorName: "pink",
    icon: "star",
    active: true,
    comingSoon: false,
    description: "Terças, quintas e sábados",
    route: "/lotomania",
    drawDays: ["ter", "qui", "sab"],
    drawTime: "20:00",
    numberRange: "0-99",
    numbersToPick: 50,
    minBet: 3,
    maxBet: 5000,
    prizeEstimate: 6000000,
    featured: false,
    metaTitle: "Bolões Lotomania | BolãoMax - 50 Números, Infinitas Chances",
    metaDescription: "Participe dos bolões Lotomania. Marque 50 números e ganhe até com zero acertos! Sorteios às terças, quintas e sábados.",
    keywords: ["lotomania", "bolao lotomania", "loteria lotomania", "50 numeros"],
    displayInMenu: true,
  },
  
  /**
   * Federal - Caixa Econômica Federal
   * Sorteios às quartas e sábados às 19h
   * Bilhete com 5 dígitos (00000 a 99999)
   * Modalidade tradicional com bilhetes físicos
   * Apostas a partir de R$ 5,00
   */
  {
    id: "federal",
    name: "Federal",
    slug: "federal",
    color: "#10B981",
    colorName: "emerald",
    icon: "gem",
    active: true,
    comingSoon: false,
    description: "Quartas e sábados",
    route: "/federal",
    drawDays: ["qua", "sab"],
    drawTime: "19:00",
    numberRange: "00000-99999",
    numbersToPick: 1,
    minBet: 5,
    maxBet: 10000,
    prizeEstimate: 500000,
    featured: false,
    metaTitle: "Bolões Federal | BolãoMax - A Loteria Tradicional do Brasil",
    metaDescription: "Bolões da Loteria Federal, a mais tradicional do Brasil. Sorteios às quartas e sábados às 19h!",
    keywords: ["federal", "loteria federal", "bolao federal", "bilhete federal"],
    displayInMenu: true,
  },
  
  /**
   * Internacional - Loterias Internacionais via TheLotter
   * Acesso a loterias de diversos países através de parceria com TheLotter
   * Inclui Powerball, Mega Millions, EuroMillions, etc.
   * ACTIVE: Integração com TheLotter como afiliado
   */
  {
    id: "internacional",
    name: "Internacional",
    slug: "internacional",
    color: "#9333EA",
    colorName: "violet",
    icon: "globe",
    active: true, // Ativado com integração TheLotter
    comingSoon: false,
    description: "Loterias do mundo todo",
    route: "/internacional",
    drawDays: [],
    drawTime: "",
    numberRange: "varies",
    numbersToPick: 0,
    minBet: 10,
    maxBet: 50000,
    prizeEstimate: 1000000000,
    featured: true,
    metaTitle: "Loterias Internacionais | BolãoMax - Prêmios do Mundo Inteiro",
    metaDescription: "Acesse loterias internacionais como Mega Millions, Powerball e EuroMillions via TheLotter. Prêmios bilionários!",
    keywords: ["loteria internacional", "mega millions", "powerball", "euromillions", "loteria mundial", "thelotter"],
    displayInMenu: true,
  },
];

// ===== TheLotter Affiliate Configuration =====

/**
 * TheLotter Affiliate Configuration Interface
 */
export interface TheLotterConfig {
  /** Affiliate ID from TheLotter */
  affiliateId: string;
  /** Base affiliate URL */
  affiliateUrl: string;
  /** Default commission rate percentage */
  commissionRate: number;
  /** Whether tracking is enabled */
  trackingEnabled: boolean;
  /** Tracking code/pixel */
  trackingCode: string;
  /** API Key (for future use) */
  apiKey: string;
  /** API Secret (for future use) */
  apiSecret: string;
  /** Webhook URL for conversions */
  webhookUrl: string;
  /** Test mode (sandbox vs production) */
  testMode: boolean;
  /** Payment threshold in BRL */
  paymentThreshold: number;
  /** Currency preference */
  currency: 'BRL' | 'USD';
  /** Last sync timestamp */
  lastSync: Date | null;
}

/**
 * International Lottery Interface
 */
export interface InternationalLottery {
  id: string;
  name: string;
  country: string;
  flag: string;
  color: string;
  minJackpot: string;
  currentJackpot: string;
  drawDays: string[];
  drawTime: string;
  ticketPrice: string;
  ticketPriceUSD: number;
  affiliateUrlTemplate: string;
  odds: string;
  description: string;
  prizeTiers: { match: string; prize: string }[];
}

/**
 * Default TheLotter configuration
 */
const defaultTheLotterConfig: TheLotterConfig = {
  affiliateId: '',
  affiliateUrl: 'https://www.thelotter.com',
  commissionRate: 25,
  trackingEnabled: true,
  trackingCode: '',
  apiKey: '',
  apiSecret: '',
  webhookUrl: '',
  testMode: true,
  paymentThreshold: 100,
  currency: 'BRL',
  lastSync: null,
};

const THELOTTER_CONFIG_KEY = 'thelotter_config';

/**
 * Get TheLotter configuration from localStorage
 */
export const getTheLotterConfig = (): TheLotterConfig => {
  try {
    const stored = localStorage.getItem(THELOTTER_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      return { ...defaultTheLotterConfig, ...config };
    }
  } catch (error) {
    console.error('Failed to load TheLotter config:', error);
  }
  return defaultTheLotterConfig;
};

/**
 * Save TheLotter configuration to localStorage
 */
export const saveTheLotterConfig = (config: Partial<TheLotterConfig>): void => {
  try {
    const current = getTheLotterConfig();
    const updated = { ...current, ...config, lastSync: new Date() };
    localStorage.setItem(THELOTTER_CONFIG_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save TheLotter config:', error);
  }
};

/**
 * International lotteries available via TheLotter
 */
export const internationalLotteries: InternationalLottery[] = [
  {
    id: 'powerball',
    name: 'Powerball',
    country: 'USA',
    flag: '🇺🇸',
    color: '#C41E3A',
    minJackpot: 'US$ 20 milhões',
    currentJackpot: 'US$ 850 milhões',
    drawDays: ['seg', 'qua', 'sab'],
    drawTime: '23:59 (BRT)',
    ticketPrice: 'R$ 15,00',
    ticketPriceUSD: 3,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/powerball?aff={affiliateId}',
    odds: '1 em 292.201.338',
    description: 'A maior loteria dos EUA com jackpots recordes mundiais. Em janeiro de 2024, teve o maior prêmio da história: US$ 2,04 bilhões!',
    prizeTiers: [
      { match: '5 + Powerball', prize: 'Jackpot' },
      { match: '5', prize: 'US$ 1 milhão' },
      { match: '4 + Powerball', prize: 'US$ 50.000' },
      { match: '4', prize: 'US$ 100' },
      { match: '3 + Powerball', prize: 'US$ 100' },
    ],
  },
  {
    id: 'mega-millions',
    name: 'Mega Millions',
    country: 'USA',
    flag: '🇺🇸',
    color: '#FFD700',
    minJackpot: 'US$ 20 milhões',
    currentJackpot: 'US$ 520 milhões',
    drawDays: ['ter', 'sex'],
    drawTime: '00:00 (BRT)',
    ticketPrice: 'R$ 15,00',
    ticketPriceUSD: 3,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/usa-mega-millions?aff={affiliateId}',
    odds: '1 em 302.575.350',
    description: 'Segunda maior loteria dos EUA. Famosa pelos jackpots que ultrapassam meio bilhão de dólares com frequência.',
    prizeTiers: [
      { match: '5 + Mega Ball', prize: 'Jackpot' },
      { match: '5', prize: 'US$ 1 milhão' },
      { match: '4 + Mega Ball', prize: 'US$ 10.000' },
      { match: '4', prize: 'US$ 500' },
      { match: '3 + Mega Ball', prize: 'US$ 200' },
    ],
  },
  {
    id: 'euromillions',
    name: 'EuroMillions',
    country: 'Europa',
    flag: '🇪🇺',
    color: '#003399',
    minJackpot: '€ 17 milhões',
    currentJackpot: '€ 240 milhões',
    drawDays: ['ter', 'sex'],
    drawTime: '17:00 (BRT)',
    ticketPrice: 'R$ 18,00',
    ticketPriceUSD: 3.5,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/euromillions?aff={affiliateId}',
    odds: '1 em 139.838.160',
    description: 'A maior loteria multinacional da Europa, com participação de 9 países. Jackpot máximo de € 250 milhões.',
    prizeTiers: [
      { match: '5 + 2 Lucky Stars', prize: 'Jackpot' },
      { match: '5 + 1 Lucky Star', prize: '€ 300.000+' },
      { match: '5', prize: '€ 50.000+' },
      { match: '4 + 2 Lucky Stars', prize: '€ 3.000+' },
      { match: '4 + 1 Lucky Star', prize: '€ 150+' },
    ],
  },
  {
    id: 'eurojackpot',
    name: 'EuroJackpot',
    country: 'Europa',
    flag: '🇪🇺',
    color: '#FFCC00',
    minJackpot: '€ 10 milhões',
    currentJackpot: '€ 120 milhões',
    drawDays: ['ter', 'sex'],
    drawTime: '16:00 (BRT)',
    ticketPrice: 'R$ 12,00',
    ticketPriceUSD: 2.5,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/eurojackpot?aff={affiliateId}',
    odds: '1 em 139.838.160',
    description: 'Loteria pan-europeia com 18 países participantes. Melhores odds entre as grandes loterias.',
    prizeTiers: [
      { match: '5 + 2 Euro números', prize: 'Jackpot' },
      { match: '5 + 1 Euro número', prize: '€ 1 milhão+' },
      { match: '5', prize: '€ 100.000+' },
      { match: '4 + 2 Euro números', prize: '€ 5.000+' },
      { match: '4 + 1 Euro número', prize: '€ 200+' },
    ],
  },
  {
    id: 'superenalotto',
    name: 'SuperEnalotto',
    country: 'Itália',
    flag: '🇮🇹',
    color: '#009246',
    minJackpot: '€ 2 milhões',
    currentJackpot: '€ 85 milhões',
    drawDays: ['ter', 'qui', 'sab'],
    drawTime: '15:00 (BRT)',
    ticketPrice: 'R$ 8,00',
    ticketPriceUSD: 1.5,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/italy-superenalotto?aff={affiliateId}',
    odds: '1 em 622.614.630',
    description: 'A loteria mais difícil do mundo, mas também uma das mais emocionantes. Já acumulou por mais de um ano!',
    prizeTiers: [
      { match: '6', prize: 'Jackpot' },
      { match: '5 + Jolly', prize: '€ 500.000+' },
      { match: '5', prize: '€ 30.000+' },
      { match: '4', prize: '€ 300+' },
      { match: '3', prize: '€ 25+' },
    ],
  },
  {
    id: 'uk-lotto',
    name: 'UK Lotto',
    country: 'Reino Unido',
    flag: '🇬🇧',
    color: '#012169',
    minJackpot: '£ 2 milhões',
    currentJackpot: '£ 12 milhões',
    drawDays: ['qua', 'sab'],
    drawTime: '17:00 (BRT)',
    ticketPrice: 'R$ 15,00',
    ticketPriceUSD: 3,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/uk-national-lottery?aff={affiliateId}',
    odds: '1 em 45.057.474',
    description: 'A loteria nacional do Reino Unido, uma das mais antigas e confiáveis do mundo.',
    prizeTiers: [
      { match: '6', prize: 'Jackpot' },
      { match: '5 + Bonus', prize: '£ 1 milhão' },
      { match: '5', prize: '£ 1.750' },
      { match: '4', prize: '£ 140' },
      { match: '3', prize: '£ 30' },
    ],
  },
  {
    id: 'el-gordo',
    name: 'El Gordo',
    country: 'Espanha',
    flag: '🇪🇸',
    color: '#C60B1E',
    minJackpot: '€ 5 milhões',
    currentJackpot: '€ 15 milhões',
    drawDays: ['dom'],
    drawTime: '14:30 (BRT)',
    ticketPrice: 'R$ 25,00',
    ticketPriceUSD: 5,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/spain-el-gordo?aff={affiliateId}',
    odds: '1 em 31.625.100',
    description: 'A loteria de Natal espanhola é a maior do mundo em termos de prêmios totais distribuídos.',
    prizeTiers: [
      { match: '5 + 1', prize: 'Jackpot' },
      { match: '5', prize: '€ 1 milhão+' },
      { match: '4 + 1', prize: '€ 100.000+' },
      { match: '4', prize: '€ 10.000+' },
      { match: '3 + 1', prize: '€ 1.000+' },
    ],
  },
  {
    id: 'la-primitiva',
    name: 'La Primitiva',
    country: 'Espanha',
    flag: '🇪🇸',
    color: '#FF6B35',
    minJackpot: '€ 3 milhões',
    currentJackpot: '€ 28 milhões',
    drawDays: ['qui', 'sab'],
    drawTime: '16:30 (BRT)',
    ticketPrice: 'R$ 8,00',
    ticketPriceUSD: 1.5,
    affiliateUrlTemplate: 'https://www.thelotter.com/pt/lottery-tickets/spain-la-primitiva?aff={affiliateId}',
    odds: '1 em 139.838.160',
    description: 'Uma das loterias mais antigas da Europa, operando desde 1763. Excelente custo-benefício.',
    prizeTiers: [
      { match: '6', prize: 'Jackpot' },
      { match: '5 + Complementario', prize: '€ 100.000+' },
      { match: '5', prize: '€ 3.000+' },
      { match: '4', prize: '€ 60+' },
      { match: '3', prize: '€ 8' },
    ],
  },
];

/**
 * Get all international lotteries
 */
export const getInternationalLotteries = (): InternationalLottery[] => {
  return [...internationalLotteries];
};

/**
 * Get an international lottery by ID
 */
export const getInternationalLotteryById = (id: string): InternationalLottery | undefined => {
  return internationalLotteries.find(l => l.id === id);
};

/**
 * Generate TheLotter affiliate link for a lottery
 */
export const getTheLotterAffiliateLink = (lottery: InternationalLottery, userId?: string | null): string => {
  const config = getTheLotterConfig();
  let url = lottery.affiliateUrlTemplate.replace('{affiliateId}', config.affiliateId || 'bolaomax');
  
  // Add sub-affiliate tracking if user is logged in
  if (userId) {
    url += `&subid=${userId}`;
  }
  
  return url;
};

/**
 * Get affiliate stats (mock data - would be from API in production)
 */
export const getAffiliateStats = () => {
  // In production, this would fetch from TheLotter API or backend
  return {
    totalReferrals: 156,
    totalCommissions: 2340.50,
    conversionRate: 4.2,
    lastSyncDate: new Date(),
    topLotteries: [
      { name: 'Powerball', referrals: 45, commissions: 890.00 },
      { name: 'Mega Millions', referrals: 38, commissions: 720.00 },
      { name: 'EuroMillions', referrals: 27, commissions: 480.00 },
    ],
  };
};

// ===== Internal state for dynamic updates =====
let _lotteryConfigs = [...lotteryConfigs];

/**
 * Get all active lotteries (not coming soon)
 * Use this for the main dropdown items
 */
export const getActiveLotteries = (): LotteryConfig[] => {
  return _lotteryConfigs.filter((lottery) => lottery.active && !lottery.comingSoon);
};

/**
 * Get all active lotteries with full specifications
 * Returns the same as getActiveLotteries but explicitly for when you need extended fields
 */
export const getActiveLotteriesWithSpecs = (): LotteryConfig[] => {
  return getActiveLotteries();
};

/**
 * Get all lotteries including coming soon ones
 * Use this when you need to display the full list
 */
export const getAllLotteries = (): LotteryConfig[] => {
  return [..._lotteryConfigs];
};

/**
 * Get lotteries marked as coming soon
 * Use this for the "Em breve" section
 */
export const getComingSoonLotteries = (): LotteryConfig[] => {
  return _lotteryConfigs.filter((lottery) => lottery.comingSoon);
};

/**
 * Get a specific lottery by its slug
 * Returns undefined if not found
 * 
 * @param slug - The URL slug of the lottery (e.g., "lotofacil")
 */
export const getLotteryBySlug = (slug: string): LotteryConfig | undefined => {
  return _lotteryConfigs.find((lottery) => lottery.slug === slug);
};

/**
 * Get a lottery by ID
 * Returns undefined if not found
 * 
 * @param id - The unique ID of the lottery
 */
export const getLotteryById = (id: string): LotteryConfig | undefined => {
  return _lotteryConfigs.find((lottery) => lottery.id === id);
};

/**
 * Get a lottery template for duplication
 * Returns a copy of the lottery with modified id, name, slug
 * 
 * @param id - The ID of the lottery to copy
 */
export const getLotteryTemplate = (id: string): LotteryConfig | undefined => {
  const lottery = getLotteryById(id);
  if (!lottery) return undefined;
  
  return {
    ...lottery,
    id: `${lottery.id}-copy-${Date.now()}`,
    name: `${lottery.name} (Cópia)`,
    slug: `${lottery.slug}-copy`,
    route: `/${lottery.slug}-copy`,
    active: false,
    comingSoon: true,
  };
};

/**
 * Update a lottery configuration
 * This updates the internal state (would persist to backend in production)
 * 
 * @param id - The ID of the lottery to update
 * @param config - The updated configuration
 */
export const updateLotteryConfig = (id: string, config: Partial<LotteryConfig>): boolean => {
  const index = _lotteryConfigs.findIndex((lottery) => lottery.id === id);
  if (index === -1) return false;
  
  _lotteryConfigs[index] = { ..._lotteryConfigs[index], ...config };
  return true;
};

/**
 * Add a new lottery configuration
 * 
 * @param config - The new lottery configuration
 */
export const addLotteryConfig = (config: LotteryConfig): void => {
  _lotteryConfigs.push(config);
};

/**
 * Remove a lottery configuration
 * 
 * @param id - The ID of the lottery to remove
 */
export const removeLotteryConfig = (id: string): boolean => {
  const index = _lotteryConfigs.findIndex((lottery) => lottery.id === id);
  if (index === -1) return false;
  
  _lotteryConfigs.splice(index, 1);
  return true;
};

/**
 * Get the primary color for a lottery by slug
 * Returns a default color if not found
 * 
 * @param slug - The URL slug of the lottery
 */
export const getLotteryColor = (slug: string): string => {
  const lottery = getLotteryBySlug(slug);
  return lottery?.color ?? "#00C853"; // Default to bolao-green
};

/**
 * Get the color name (Tailwind) for a lottery by slug
 * Returns "emerald" as default if not found
 * 
 * @param slug - The URL slug of the lottery
 */
export const getLotteryColorName = (slug: string): LotteryConfig["colorName"] => {
  const lottery = getLotteryBySlug(slug);
  return lottery?.colorName ?? "emerald";
};

/**
 * Get the Lucide icon component for a lottery by slug
 * 
 * @param slug - The URL slug of the lottery
 */
export const getLotteryIcon = (slug: string): LucideIcon => {
  const lottery = getLotteryBySlug(slug);
  const iconKey = lottery?.icon ?? "clover";
  return iconMap[iconKey];
};

/**
 * Get all color classes for a lottery by slug
 * 
 * @param slug - The URL slug of the lottery
 */
export const getLotteryColorClasses = (slug: string) => {
  const colorName = getLotteryColorName(slug);
  return colorClasses[colorName];
};

/**
 * Check if a given page slug is a lottery page
 * 
 * @param slug - The page slug to check
 */
export const isLotteryPage = (slug: string): boolean => {
  return _lotteryConfigs.some((lottery) => lottery.slug === slug);
};

/**
 * Get all lottery slugs (useful for route matching)
 */
export const getAllLotterySlugs = (): string[] => {
  return _lotteryConfigs.map((lottery) => lottery.slug);
};

/**
 * Get all active lottery slugs
 */
export const getActiveLotterySlugs = (): string[] => {
  return getActiveLotteries().map((lottery) => lottery.slug);
};

/**
 * Get featured lotteries (for homepage highlights)
 */
export const getFeaturedLotteries = (): LotteryConfig[] => {
  return _lotteryConfigs.filter((lottery) => lottery.featured && lottery.active);
};

/**
 * Get lottery statistics
 */
export const getLotteryStats = () => {
  const all = _lotteryConfigs;
  return {
    total: all.length,
    active: all.filter(l => l.active && !l.comingSoon).length,
    comingSoon: all.filter(l => l.comingSoon).length,
    inactive: all.filter(l => !l.active && !l.comingSoon).length,
    featured: all.filter(l => l.featured).length,
  };
};
