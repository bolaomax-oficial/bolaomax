/**
 * ============================================================
 * TERMÔMETRO DE AGRESSIVIDADE - COMPONENTE REUTILIZÁVEL
 * ============================================================
 * 
 * Indicador visual do nível de agressividade do bolão baseado
 * no FECHAMENTO (jogos gerados) e DEZENAS por jogo.
 * 
 * LÓGICA DE CÁLCULO INTELIGENTE:
 * - Para loterias com dezenas variáveis: combinação de fechamento + dezenas
 * - Para loterias com dezenas fixas: baseado apenas no fechamento
 * 
 * NÍVEIS:
 * - BAIXA (0-33): Bolões conservadores, menor investimento
 * - MÉDIA (34-66): Bolões equilibrados, bom custo-benefício  
 * - ALTA (67-100): Bolões agressivos, máxima cobertura
 * 
 * O score considera:
 * 1. Fator de Fechamento: quantidade de jogos gerados (peso dinâmico)
 * 2. Fator de Dezenas: quantas dezenas extras acima do mínimo (peso dinâmico)
 * ============================================================
 */

import { Flame, Info } from "lucide-react";
import { useState } from "react";

export type NivelAgressividade = "baixa" | "media" | "alta";
export type LotteryType = "megasena" | "lotofacil" | "quina" | "timemania" | "dia-de-sorte" | "super-sete" | "dupla-sena" | "lotomania" | "federal";

interface TermometroAgressividadeProps {
  nivel: NivelAgressividade;
  colorScheme?: "default" | "emerald" | "violet" | "sky" | "yellow" | "orange" | "pink";
  className?: string;
  showScore?: boolean;
  score?: number;
}

// Configuração de dezenas mínimas/máximas por modalidade
const REGRAS_DEZENAS: Record<LotteryType, { min: number; max: number; fixo: boolean }> = {
  megasena: { min: 6, max: 20, fixo: false },
  lotofacil: { min: 15, max: 20, fixo: false },
  quina: { min: 5, max: 15, fixo: false },
  timemania: { min: 10, max: 10, fixo: true },
  "dia-de-sorte": { min: 7, max: 15, fixo: false },
  "super-sete": { min: 7, max: 21, fixo: false },
  "dupla-sena": { min: 6, max: 15, fixo: false },
  lotomania: { min: 50, max: 50, fixo: true },
  federal: { min: 1, max: 1, fixo: true },
};

// Configuração de fechamento (jogos) de referência por modalidade
// Ajustado para ser mais preciso e realista
const FECHAMENTO_REFERENCIA: Record<LotteryType, { baixo: number; medio: number; alto: number; extremo: number }> = {
  megasena: { baixo: 30, medio: 100, alto: 250, extremo: 500 },
  lotofacil: { baixo: 20, medio: 80, alto: 180, extremo: 350 },
  quina: { baixo: 25, medio: 90, alto: 200, extremo: 400 },
  timemania: { baixo: 20, medio: 60, alto: 120, extremo: 250 },
  "dia-de-sorte": { baixo: 25, medio: 80, alto: 160, extremo: 300 },
  "super-sete": { baixo: 20, medio: 60, alto: 120, extremo: 250 },
  "dupla-sena": { baixo: 25, medio: 80, alto: 160, extremo: 300 },
  lotomania: { baixo: 15, medio: 45, alto: 100, extremo: 200 },
  federal: { baixo: 3, medio: 10, alto: 25, extremo: 50 },
};

// Descrições dos níveis para tooltip
const DESCRICAO_NIVEIS = {
  baixa: "Bolão conservador com menor investimento. Ideal para quem quer participar com risco controlado.",
  media: "Bolão equilibrado com bom custo-benefício. Combina quantidade de jogos e chances razoáveis.",
  alta: "Bolão agressivo com máxima cobertura. Maior investimento visando aumentar probabilidades.",
};

const configNiveis = {
  baixa: { label: "Baixa", width: "33%" },
  media: { label: "Média", width: "66%" },
  alta: { label: "Alta", width: "100%" },
};

const configCores = {
  default: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  emerald: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  violet: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  sky: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  yellow: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  orange: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
  pink: {
    baixa: { cor: "bg-green-500", textCor: "text-green-400", glowCor: "shadow-green-500/30" },
    media: { cor: "bg-yellow-500", textCor: "text-yellow-400", glowCor: "shadow-yellow-500/30" },
    alta: { cor: "bg-red-500", textCor: "text-red-400", glowCor: "shadow-red-500/30" },
  },
};

/**
 * Calcula o score de agressividade baseado em fechamento e dezenas
 * Usa algoritmo inteligente que se adapta ao tipo de loteria
 * 
 * @param jogosGerados - Quantidade de jogos no bolão (fechamento)
 * @param dezenas - Quantidade de dezenas por jogo
 * @param tipo - Tipo de loteria para usar as regras corretas
 * @returns Score de 0-100 representando a agressividade
 */
export function calcularScoreAgressividade(
  jogosGerados: number,
  dezenas: number,
  tipo: LotteryType
): number {
  const regrasDezenas = REGRAS_DEZENAS[tipo];
  const fechamentoRef = FECHAMENTO_REFERENCIA[tipo];
  
  // Determina os pesos dinamicamente baseado no tipo de loteria
  // Loterias com dezenas fixas: 100% peso no fechamento
  // Loterias com dezenas variáveis: 60% fechamento, 40% dezenas
  const pesoFechamento = regrasDezenas.fixo ? 100 : 60;
  const pesoDezenas = regrasDezenas.fixo ? 0 : 40;
  
  // Fator de Fechamento (0-100 pontos, depois ajustado pelo peso)
  // Usa curva logarítmica suavizada para distribuição mais natural
  let fatorFechamento = 0;
  
  if (jogosGerados <= fechamentoRef.baixo) {
    // Zona baixa: 0-25%
    fatorFechamento = (jogosGerados / fechamentoRef.baixo) * 25;
  } else if (jogosGerados <= fechamentoRef.medio) {
    // Zona média-baixa: 25-50%
    const progresso = (jogosGerados - fechamentoRef.baixo) / (fechamentoRef.medio - fechamentoRef.baixo);
    fatorFechamento = 25 + (progresso * 25);
  } else if (jogosGerados <= fechamentoRef.alto) {
    // Zona média-alta: 50-75%
    const progresso = (jogosGerados - fechamentoRef.medio) / (fechamentoRef.alto - fechamentoRef.medio);
    fatorFechamento = 50 + (progresso * 25);
  } else if (jogosGerados <= fechamentoRef.extremo) {
    // Zona alta: 75-100%
    const progresso = (jogosGerados - fechamentoRef.alto) / (fechamentoRef.extremo - fechamentoRef.alto);
    fatorFechamento = 75 + (progresso * 25);
  } else {
    // Acima do extremo: cap em 100
    fatorFechamento = 100;
  }
  
  // Fator de Dezenas (0-100 pontos, depois ajustado pelo peso)
  let fatorDezenas = 0;
  
  if (!regrasDezenas.fixo) {
    const dezenasExtras = Math.max(0, dezenas - regrasDezenas.min);
    const maxDezenasExtras = regrasDezenas.max - regrasDezenas.min;
    
    if (maxDezenasExtras > 0) {
      // Curva exponencial suave para dezenas extras
      // Primeiras dezenas extras têm menos impacto, últimas têm mais
      const progressoLinear = dezenasExtras / maxDezenasExtras;
      // Curva que acelera: x^1.5
      fatorDezenas = Math.pow(progressoLinear, 1.3) * 100;
    }
  }
  
  // Score final combinado (0-100)
  const scoreFinal = (fatorFechamento * pesoFechamento / 100) + (fatorDezenas * pesoDezenas / 100);
  
  return Math.min(100, Math.round(scoreFinal));
}

/**
 * Converte score numérico em nível de agressividade
 */
export function scoreParaNivel(score: number): NivelAgressividade {
  if (score <= 33) return "baixa";
  if (score <= 66) return "media";
  return "alta";
}

/**
 * Calcula o nível de agressividade baseado em fechamento e dezenas
 * 
 * @param jogosGerados - Quantidade de jogos no bolão (fechamento)
 * @param dezenas - Quantidade de dezenas por jogo
 * @param tipo - Tipo de loteria
 * @returns Nível de agressividade (baixa, media, alta)
 */
export function calcularNivelAgressividade(
  jogosGerados: number,
  dezenas: number,
  tipo: LotteryType = "megasena"
): NivelAgressividade {
  const score = calcularScoreAgressividade(jogosGerados, dezenas, tipo);
  return scoreParaNivel(score);
}

/**
 * Retorna a descrição do nível de agressividade
 */
export function getDescricaoNivel(nivel: NivelAgressividade): string {
  return DESCRICAO_NIVEIS[nivel];
}

/**
 * Componente visual do Termômetro de Agressividade
 * Versão aprimorada com animação e tooltip informativo
 */
export const TermometroAgressividade = ({ 
  nivel, 
  colorScheme = "default",
  className = "",
  showScore = false,
  score,
}: TermometroAgressividadeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const nivelConfig = configNiveis[nivel];
  const corConfig = configCores[colorScheme][nivel];
  
  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Flame className={`w-3.5 h-3.5 ${corConfig.textCor} animate-pulse`} />
        <span className={`text-xs font-medium ${corConfig.textCor}`}>
          Agressividade: {nivelConfig.label}
          {showScore && score !== undefined && (
            <span className="ml-1 opacity-70">({score}%)</span>
          )}
        </span>
        <button
          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label="Informações sobre agressividade"
        >
          <Info className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 h-1.5 bg-bolao-dark/60 rounded-full overflow-hidden">
        <div 
          className={`h-full ${corConfig.cor} rounded-full transition-all duration-700 ease-out shadow-lg ${corConfig.glowCor}`}
          style={{ width: nivelConfig.width }}
        />
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
          <div className="text-xs text-gray-200 leading-relaxed">
            <p className="font-semibold mb-1 text-white">
              🔥 {nivelConfig.label} Agressividade
            </p>
            <p>{DESCRICAO_NIVEIS[nivel]}</p>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-gray-900/95" />
        </div>
      )}
    </div>
  );
};

export default TermometroAgressividade;
