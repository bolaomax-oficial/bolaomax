import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  RefreshCw,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  Flame,
  Snowflake,
  Clock,
  DollarSign,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  Clover,
  Repeat,
} from "lucide-react";

// Types for lottery results
interface Premio {
  faixa: string;
  ganhadores: number;
  premio: string;
}

interface ConcursoResult {
  numero: number;
  data: string;
  dezenas: number[];
  premios: Premio[];
  acumulado: boolean;
  proximoEstimado?: string;
}

interface LotteryData {
  tipo: string;
  cor: string;
  corBg: string;
  corBorder: string;
  corBola: string;
  totalNumeros: number;
  numerosJogo: number;
  sorteios: string;
  icon: React.ReactNode;
  ultimoConcurso: ConcursoResult;
  proximoConcurso: {
    data: string;
    premio: string;
  };
  historico: ConcursoResult[];
  estatisticas: {
    maisFrequentes: { numero: number; vezes: number }[];
    menosFrequentes: { numero: number; vezes: number }[];
    quentes: number[];
    frios: number[];
  };
}

// Mock data for lottery results
const mockLotteryData: Record<string, LotteryData> = {
  megasena: {
    tipo: "Mega-Sena",
    cor: "text-emerald-400",
    corBg: "bg-emerald-500/10",
    corBorder: "border-emerald-500/30",
    corBola: "bg-emerald-500",
    totalNumeros: 60,
    numerosJogo: 6,
    sorteios: "Quartas e Sábados",
    icon: <Clover className="w-6 h-6" />,
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
  },
  quina: {
    tipo: "Quina",
    cor: "text-sky-400",
    corBg: "bg-sky-500/10",
    corBorder: "border-sky-500/30",
    corBola: "bg-sky-500",
    totalNumeros: 80,
    numerosJogo: 5,
    sorteios: "Segunda a Sábado",
    icon: <Star className="w-6 h-6" />,
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
  },
  lotofacil: {
    tipo: "Lotofácil",
    cor: "text-violet-400",
    corBg: "bg-violet-500/10",
    corBorder: "border-violet-500/30",
    corBola: "bg-violet-500",
    totalNumeros: 25,
    numerosJogo: 15,
    sorteios: "Segunda a Sábado",
    icon: <Sparkles className="w-6 h-6" />,
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
  },
  lotomania: {
    tipo: "Lotomania",
    cor: "text-orange-400",
    corBg: "bg-orange-500/10",
    corBorder: "border-orange-500/30",
    corBola: "bg-orange-500",
    totalNumeros: 100,
    numerosJogo: 50,
    sorteios: "Terças, Quintas e Sábados",
    icon: <Star className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 2850,
      data: "06/02/2025",
      dezenas: [1, 5, 8, 12, 15, 18, 22, 25, 28, 31, 35, 38, 42, 45, 48, 51, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 91, 95, 98, 2, 6, 10, 14, 17, 20, 24, 27, 30, 33, 37, 40, 43, 46, 50, 53, 56, 60, 63, 67],
      premios: [
        { faixa: "50 acertos", ganhadores: 0, premio: "R$ 0,00" },
        { faixa: "19 acertos", ganhadores: 2, premio: "R$ 45.892,17" },
        { faixa: "18 acertos", ganhadores: 156, premio: "R$ 2.156,78" },
        { faixa: "17 acertos", ganhadores: 2847, premio: "R$ 123,45" },
        { faixa: "16 acertos", ganhadores: 18945, premio: "R$ 12,00" },
        { faixa: "0 acertos", ganhadores: 1, premio: "R$ 78.453.219,32" },
      ],
      acumulado: true,
      proximoEstimado: "R$ 95.000.000,00",
    },
    proximoConcurso: {
      data: "08/02/2025",
      premio: "R$ 3.500.000,00",
    },
    historico: [
      { numero: 2849, data: "03/02/2025", dezenas: [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63, 67, 71, 75, 79, 83, 87, 91, 95, 99, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100], premios: [], acumulado: true },
      { numero: 2848, data: "01/02/2025", dezenas: [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94, 98, 1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93, 97], premios: [], acumulado: true },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 50, vezes: 856 },
        { numero: 25, vezes: 843 },
        { numero: 75, vezes: 838 },
        { numero: 10, vezes: 829 },
        { numero: 90, vezes: 821 },
      ],
      menosFrequentes: [
        { numero: 1, vezes: 556 },
        { numero: 100, vezes: 563 },
        { numero: 99, vezes: 571 },
        { numero: 2, vezes: 578 },
        { numero: 98, vezes: 585 },
      ],
      quentes: [50, 25, 75, 10, 90, 35, 60, 15, 85, 40],
      frios: [1, 100, 99, 2, 98, 3, 97, 4, 96, 5],
    },
  },
  duplasena: {
    tipo: "Dupla Sena",
    cor: "text-purple-400",
    corBg: "bg-purple-500/10",
    corBorder: "border-purple-500/30",
    corBola: "bg-purple-500",
    totalNumeros: 50,
    numerosJogo: 6,
    sorteios: "Terças, Quintas e Sábados",
    icon: <Repeat className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 2789,
      data: "06/02/2025",
      dezenas: [7, 15, 23, 38, 42, 58],
      premios: [
        { faixa: "1º Sorteio - Sena", ganhadores: 1, premio: "R$ 15.453.219,32" },
        { faixa: "1º Sorteio - Quina", ganhadores: 95, premio: "R$ 12.892,17" },
        { faixa: "1º Sorteio - Quadra", ganhadores: 4247, premio: "R$ 523,45" },
        { faixa: "2º Sorteio - Sena", ganhadores: 0, premio: "R$ 0,00" },
        { faixa: "2º Sorteio - Quina", ganhadores: 112, premio: "R$ 9.156,78" },
        { faixa: "2º Sorteio - Quadra", ganhadores: 5847, premio: "R$ 423,45" },
      ],
      acumulado: true,
      proximoEstimado: "R$ 18.000.000,00",
    },
    proximoConcurso: {
      data: "08/02/2025",
      premio: "R$ 2.500.000,00",
    },
    historico: [
      { numero: 2788, data: "03/02/2025", dezenas: [4, 12, 28, 33, 47, 55], premios: [], acumulado: true },
      { numero: 2787, data: "01/02/2025", dezenas: [9, 17, 24, 39, 44, 52], premios: [], acumulado: false },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 23, vezes: 1256 },
        { numero: 10, vezes: 1243 },
        { numero: 33, vezes: 1238 },
        { numero: 5, vezes: 1229 },
        { numero: 42, vezes: 1221 },
      ],
      menosFrequentes: [
        { numero: 1, vezes: 856 },
        { numero: 50, vezes: 863 },
        { numero: 49, vezes: 871 },
        { numero: 2, vezes: 878 },
        { numero: 48, vezes: 885 },
      ],
      quentes: [23, 10, 33, 5, 42, 15, 28, 37, 46, 19],
      frios: [1, 50, 49, 2, 48, 3, 47, 4, 46, 5],
    },
  },
  timemania: {
    tipo: "Timemania",
    cor: "text-green-400",
    corBg: "bg-green-500/10",
    corBorder: "border-green-500/30",
    corBola: "bg-green-500",
    totalNumeros: 80,
    numerosJogo: 10,
    sorteios: "Terças, Quintas e Sábados",
    icon: <Trophy className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 2145,
      data: "06/02/2025",
      dezenas: [5, 12, 23, 34, 45, 56, 67, 72, 78, 80],
      premios: [
        { faixa: "7 acertos", ganhadores: 0, premio: "R$ 0,00" },
        { faixa: "6 acertos", ganhadores: 15, premio: "R$ 25.892,17" },
        { faixa: "5 acertos", ganhadores: 456, premio: "R$ 1.156,78" },
        { faixa: "4 acertos", ganhadores: 8247, premio: "R$ 123,45" },
        { faixa: "3 acertos", ganhadores: 68945, premio: "R$ 12,00" },
        { faixa: "Time do Coração", ganhadores: 2345, premio: "R$ 8,50" },
      ],
      acumulado: true,
      proximoEstimado: "R$ 12.000.000,00",
    },
    proximoConcurso: {
      data: "08/02/2025",
      premio: "R$ 1.800.000,00",
    },
    historico: [
      { numero: 2144, data: "03/02/2025", dezenas: [3, 14, 25, 36, 47, 58, 69, 74, 79, 80], premios: [], acumulado: true },
      { numero: 2143, data: "01/02/2025", dezenas: [7, 18, 29, 40, 51, 62, 73, 76, 78, 79], premios: [], acumulado: false },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 40, vezes: 456 },
        { numero: 25, vezes: 443 },
        { numero: 60, vezes: 438 },
        { numero: 15, vezes: 429 },
        { numero: 75, vezes: 421 },
      ],
      menosFrequentes: [
        { numero: 1, vezes: 256 },
        { numero: 80, vezes: 263 },
        { numero: 79, vezes: 271 },
        { numero: 2, vezes: 278 },
        { numero: 78, vezes: 285 },
      ],
      quentes: [40, 25, 60, 15, 75, 30, 45, 55, 70, 10],
      frios: [1, 80, 79, 2, 78, 3, 77, 4, 76, 5],
    },
  },
  diadesorte: {
    tipo: "Dia de Sorte",
    cor: "text-yellow-400",
    corBg: "bg-yellow-500/10",
    corBorder: "border-yellow-500/30",
    corBola: "bg-yellow-500",
    totalNumeros: 31,
    numerosJogo: 7,
    sorteios: "Terças, Quintas e Sábados",
    icon: <Clover className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 1056,
      data: "06/02/2025",
      dezenas: [3, 7, 12, 18, 23, 28, 31],
      premios: [
        { faixa: "7 acertos", ganhadores: 0, premio: "R$ 0,00" },
        { faixa: "6 acertos", ganhadores: 12, premio: "R$ 18.892,17" },
        { faixa: "5 acertos", ganhadores: 345, premio: "R$ 856,78" },
        { faixa: "4 acertos", ganhadores: 6247, premio: "R$ 56,45" },
        { faixa: "Mês da Sorte", ganhadores: 1234, premio: "R$ 3,50" },
      ],
      acumulado: true,
      proximoEstimado: "R$ 8.000.000,00",
    },
    proximoConcurso: {
      data: "08/02/2025",
      premio: "R$ 800.000,00",
    },
    historico: [
      { numero: 1055, data: "03/02/2025", dezenas: [2, 8, 14, 19, 24, 29, 30], premios: [], acumulado: true },
      { numero: 1054, data: "01/02/2025", dezenas: [5, 11, 16, 21, 26, 27, 31], premios: [], acumulado: false },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 15, vezes: 256 },
        { numero: 10, vezes: 243 },
        { numero: 20, vezes: 238 },
        { numero: 5, vezes: 229 },
        { numero: 25, vezes: 221 },
      ],
      menosFrequentes: [
        { numero: 1, vezes: 156 },
        { numero: 31, vezes: 163 },
        { numero: 30, vezes: 171 },
        { numero: 2, vezes: 178 },
        { numero: 29, vezes: 185 },
      ],
      quentes: [15, 10, 20, 5, 25, 12, 18, 23, 28, 7],
      frios: [1, 31, 30, 2, 29, 3, 28, 4, 27, 6],
    },
  },
  supersete: {
    tipo: "Super Sete",
    cor: "text-pink-400",
    corBg: "bg-pink-500/10",
    corBorder: "border-pink-500/30",
    corBola: "bg-pink-500",
    totalNumeros: 10,
    numerosJogo: 7,
    sorteios: "Segundas, Quartas e Sextas",
    icon: <Star className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 678,
      data: "06/02/2025",
      dezenas: [0, 2, 4, 5, 7, 8, 9],
      premios: [
        { faixa: "7 acertos", ganhadores: 0, premio: "R$ 0,00" },
        { faixa: "6 acertos", ganhadores: 8, premio: "R$ 12.892,17" },
        { faixa: "5 acertos", ganhadores: 234, premio: "R$ 456,78" },
        { faixa: "4 acertos", ganhadores: 4247, premio: "R$ 23,45" },
        { faixa: "3 acertos", ganhadores: 38945, premio: "R$ 6,00" },
      ],
      acumulado: true,
      proximoEstimado: "R$ 5.000.000,00",
    },
    proximoConcurso: {
      data: "07/02/2025",
      premio: "R$ 500.000,00",
    },
    historico: [
      { numero: 677, data: "05/02/2025", dezenas: [1, 3, 4, 6, 7, 8, 9], premios: [], acumulado: true },
      { numero: 676, data: "03/02/2025", dezenas: [0, 2, 3, 5, 6, 8, 9], premios: [], acumulado: false },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 7, vezes: 156 },
        { numero: 5, vezes: 143 },
        { numero: 3, vezes: 138 },
        { numero: 9, vezes: 129 },
        { numero: 2, vezes: 121 },
      ],
      menosFrequentes: [
        { numero: 0, vezes: 56 },
        { numero: 1, vezes: 63 },
        { numero: 6, vezes: 71 },
        { numero: 4, vezes: 78 },
        { numero: 8, vezes: 85 },
      ],
      quentes: [7, 5, 3, 9, 2, 4, 6, 8, 1, 0],
      frios: [0, 1, 6, 4, 8, 2, 9, 3, 5, 7],
    },
  },
  federal: {
    tipo: "Federal",
    cor: "text-blue-400",
    corBg: "bg-blue-500/10",
    corBorder: "border-blue-500/30",
    corBola: "bg-blue-500",
    totalNumeros: 100000,
    numerosJogo: 5,
    sorteios: "Quartas e Sábados",
    icon: <Trophy className="w-6 h-6" />,
    ultimoConcurso: {
      numero: 5987,
      data: "06/02/2025",
      dezenas: [12345],
      premios: [
        { faixa: "1º Prêmio", ganhadores: 1, premio: "R$ 500.000,00" },
        { faixa: "2º Prêmio", ganhadores: 1, premio: "R$ 27.000,00" },
        { faixa: "3º Prêmio", ganhadores: 1, premio: "R$ 24.000,00" },
        { faixa: "4º Prêmio", ganhadores: 1, premio: "R$ 19.000,00" },
        { faixa: "5º Prêmio", ganhadores: 1, premio: "R$ 18.329,00" },
      ],
      acumulado: false,
    },
    proximoConcurso: {
      data: "10/02/2025",
      premio: "R$ 500.000,00",
    },
    historico: [
      { numero: 5986, data: "03/02/2025", dezenas: [67890], premios: [], acumulado: false },
      { numero: 5985, data: "31/01/2025", dezenas: [23456], premios: [], acumulado: false },
    ],
    estatisticas: {
      maisFrequentes: [
        { numero: 5, vezes: 1256 },
        { numero: 3, vezes: 1243 },
        { numero: 7, vezes: 1238 },
        { numero: 1, vezes: 1229 },
        { numero: 9, vezes: 1221 },
      ],
      menosFrequentes: [
        { numero: 0, vezes: 856 },
        { numero: 2, vezes: 863 },
        { numero: 4, vezes: 871 },
        { numero: 6, vezes: 878 },
        { numero: 8, vezes: 885 },
      ],
      quentes: [5, 3, 7, 1, 9, 4, 6, 8, 2, 0],
      frios: [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
    },
  },
};

// Number Ball Component
const NumberBall = ({ 
  numero, 
  corBola, 
  size = "normal" 
}: { 
  numero: number; 
  corBola: string;
  size?: "normal" | "small" | "large";
}) => {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    normal: "w-12 h-12 text-lg",
    large: "w-16 h-16 text-2xl",
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${corBola} rounded-full flex items-center justify-center font-bold text-white shadow-lg`}
    >
      {numero.toString().padStart(2, "0")}
    </div>
  );
};

// Stats Badge Component
const StatsBadge = ({ 
  numero, 
  vezes, 
  isHot 
}: { 
  numero: number; 
  vezes: number;
  isHot: boolean;
}) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isHot ? "bg-orange-500/10 border border-orange-500/30" : "bg-blue-500/10 border border-blue-500/30"}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isHot ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
      {numero.toString().padStart(2, "0")}
    </div>
    <div className="text-xs">
      <span className="font-semibold">{vezes}x</span>
    </div>
    {isHot ? (
      <Flame className="w-4 h-4 text-orange-400" />
    ) : (
      <Snowflake className="w-4 h-4 text-blue-400" />
    )}
  </div>
);

export default function Resultados() {
  const [activeTab, setActiveTab] = useState<"megasena" | "quina" | "lotofacil">("megasena");
  const [isLoading, setIsLoading] = useState(false);
  const [showMoreHistory, setShowMoreHistory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, setLocation] = useLocation();

  const lottery = mockLotteryData[activeTab];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1500);
  };

  // Navigate to the appropriate lottery page based on active tab
  const handleViewBoloes = () => {
    const routes: Record<typeof activeTab, string> = {
      lotofacil: "/lotofacil",
      megasena: "/megasena",
      quina: "/quina",
    };
    setLocation(routes[activeTab]);
  };

  const tabs = [
    { id: "megasena", label: "Mega-Sena", cor: "emerald" },
    { id: "lotofacil", label: "Lotofácil", cor: "violet" },
    { id: "quina", label: "Quina", cor: "sky" },
    { id: "lotomania", label: "Lotomania", cor: "orange" },
    { id: "duplasena", label: "Dupla Sena", cor: "purple" },
    { id: "timemania", label: "Timemania", cor: "green" },
    { id: "diadesorte", label: "Dia de Sorte", cor: "yellow" },
    { id: "supersete", label: "Super Sete", cor: "pink" },
    { id: "federal", label: "Federal", cor: "blue" },
  ] as const;

  return (
    <div className="min-h-screen bg-bolao-dark">
      <SEOHead 
        title="Resultados das Loterias"
        description="Confira os últimos resultados das loterias brasileiras: Lotofácil, Mega-Sena, Quina e mais. Atualização em tempo real."
        keywords={["resultado loteria", "resultado lotofácil", "resultado mega-sena", "resultado quina", "sorteio"]}
        pageType="lottery"
        canonicalUrl="https://bolaomax.com.br/resultados"
      />
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 radial-gradient" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-bolao-green/10 text-bolao-green border-bolao-green/30 px-4 py-1">
              <Trophy className="w-4 h-4 mr-2" />
              Resultados Oficiais
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              Resultados das{" "}
              <span className="gradient-text">Loterias</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Resultados atualizados em tempo quase real. Confira os números sorteados, premiação e estatísticas.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab.id
                    ? tab.cor === "emerald"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : tab.cor === "sky"
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                      : tab.cor === "violet"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                      : tab.cor === "orange"
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : tab.cor === "purple"
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                      : tab.cor === "green"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : tab.cor === "yellow"
                      ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                      : tab.cor === "pink"
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                      : tab.cor === "blue"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                      : "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                    : "bg-bolao-card border border-bolao-card-border text-muted-foreground hover:text-white hover:border-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lottery Header */}
          <div className={`flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-2xl ${lottery.corBg} border ${lottery.corBorder} mb-8`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${lottery.corBola} flex items-center justify-center text-white`}>
                {lottery.icon}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${lottery.cor}`}>{lottery.tipo}</h2>
                <p className="text-muted-foreground text-sm">
                  {lottery.sorteios} • {lottery.totalNumeros} números, {lottery.numerosJogo} dezenas
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`${lottery.corBola} hover:opacity-90 text-white gap-2`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar Resultados
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Last Result - Main Card */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">Último Concurso</h3>
                      {lottery.ultimoConcurso.acumulado && (
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                          Acumulou
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Concurso {lottery.ultimoConcurso.numero} • {lottery.ultimoConcurso.data}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${lottery.corBg} border ${lottery.corBorder}`}>
                    <span className={`font-bold ${lottery.cor}`}>#{lottery.ultimoConcurso.numero}</span>
                  </div>
                </div>

                {/* Numbers */}
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground mb-4">Números sorteados:</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {lottery.ultimoConcurso.dezenas.map((num, idx) => (
                      <div
                        key={idx}
                        className="animate-slide-in-up"
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      >
                        <NumberBall numero={num} corBola={lottery.corBola} size="large" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prizes Table */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-bolao-green" />
                    Premiação
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-bolao-card-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Faixa</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Ganhadores</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Prêmio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lottery.ultimoConcurso.premios.map((premio, idx) => (
                          <tr key={idx} className="border-b border-bolao-card-border/50 hover:bg-bolao-dark/30">
                            <td className="py-3 px-4 font-medium">{premio.faixa}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className={premio.ganhadores > 0 ? "text-bolao-green font-semibold" : ""}>
                                  {premio.ganhadores.toLocaleString("pt-BR")}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-bold ${idx === 0 ? "text-bolao-green text-lg" : ""}`}>
                                {premio.premio}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Draw */}
              <Card className={`p-6 bg-bolao-card border-bolao-card-border ${lottery.corBorder}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${lottery.corBg} flex items-center justify-center ${lottery.cor}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold">Próximo Concurso</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Data:</span>
                    <span className="font-semibold">{lottery.proximoConcurso.data}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Prêmio estimado:</span>
                    <span className="font-bold text-bolao-green text-lg">{lottery.proximoConcurso.premio}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleViewBoloes}
                  className="w-full mt-4 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                >
                  Ver Bolões Disponíveis
                </Button>
              </Card>

              {/* Hot Numbers */}
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Números Quentes</h3>
                    <p className="text-xs text-muted-foreground">Mais sorteados recentemente</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lottery.estatisticas.quentes.map((num) => (
                    <div key={num} className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {num.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Cold Numbers */}
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Snowflake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Números Frios</h3>
                    <p className="text-xs text-muted-foreground">Menos sorteados recentemente</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lottery.estatisticas.frios.map((num) => (
                    <div key={num} className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {num.toString().padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* History Section */}
          <Card className="mt-8 p-6 bg-bolao-card border-bolao-card-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Histórico de Resultados</h3>
                <p className="text-muted-foreground text-sm">Últimos 10 concursos da {lottery.tipo}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowMoreHistory(!showMoreHistory)}
                className="gap-2"
              >
                {showMoreHistory ? "Mostrar menos" : "Ver todos"}
                {showMoreHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-bolao-card-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Concurso</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Dezenas</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lottery.historico.slice(0, showMoreHistory ? 10 : 5).map((concurso, idx) => (
                    <tr key={concurso.numero} className="border-b border-bolao-card-border/50 hover:bg-bolao-dark/30">
                      <td className="py-4 px-4">
                        <span className={`font-bold ${lottery.cor}`}>#{concurso.numero}</span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{concurso.data}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {concurso.dezenas.map((num, numIdx) => (
                            <NumberBall key={numIdx} numero={num} corBola={lottery.corBola} size="small" />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {concurso.acumulado ? (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Acumulou</Badge>
                        ) : (
                          <Badge className="bg-bolao-green/10 text-bolao-green border-bolao-green/30">Teve ganhador</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* Most Frequent */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl ${lottery.corBg} flex items-center justify-center ${lottery.cor}`}>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Dezenas Mais Sorteadas</h3>
                  <p className="text-sm text-muted-foreground">Top 10 de todos os tempos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {lottery.estatisticas.maisFrequentes.map((item, idx) => (
                  <StatsBadge key={item.numero} numero={item.numero} vezes={item.vezes} isHot={true} />
                ))}
              </div>
            </Card>

            {/* Least Frequent */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl ${lottery.corBg} flex items-center justify-center ${lottery.cor}`}>
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Dezenas Menos Sorteadas</h3>
                  <p className="text-sm text-muted-foreground">Top 10 de todos os tempos</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {lottery.estatisticas.menosFrequentes.map((item, idx) => (
                  <StatsBadge key={item.numero} numero={item.numero} vezes={item.vezes} isHot={false} />
                ))}
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="mt-12 p-8 bg-gradient-to-r from-bolao-green/10 via-bolao-card to-bolao-green/10 border-bolao-green/30 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-bolao-green" />
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Pronto para tentar a sorte?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Participe de nossos bolões e aumente suas chances de ganhar com investimento reduzido!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold px-8 py-6 text-lg"
                onClick={() => window.location.href = `/${activeTab}`}
              >
                Ver Bolões de {lottery.tipo}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer activePage="resultados" />
    </div>
  );
}
