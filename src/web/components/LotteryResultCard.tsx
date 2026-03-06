import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Flame,
  Snowflake,
  Clover,
  Star,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import type { LotteryResult, LotteryInfo, LotteryStatistics, NextDraw } from "@/hooks/useLotteryResults";

// Props interface
interface LotteryResultCardProps {
  info: LotteryInfo;
  result: LotteryResult;
  proximoConcurso?: NextDraw;
  estatisticas?: LotteryStatistics;
  variant?: "compact" | "full";
  showStats?: boolean;
  showPrizes?: boolean;
  showNextDraw?: boolean;
  onViewBoloes?: () => void;
}

// Number Ball Component
const NumberBall = ({
  numero,
  corBola,
  size = "normal",
}: {
  numero: number;
  corBola: string;
  size?: "small" | "normal" | "large";
}) => {
  const sizeClasses = {
    small: "w-7 h-7 text-xs",
    normal: "w-10 h-10 text-sm",
    large: "w-14 h-14 text-xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${corBola} rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-110`}
    >
      {numero.toString().padStart(2, "0")}
    </div>
  );
};

// Lottery icon getter
const getLotteryIcon = (tipo: string) => {
  switch (tipo.toLowerCase()) {
    case "mega-sena":
      return <Clover className="w-5 h-5" />;
    case "quina":
      return <Star className="w-5 h-5" />;
    case "lotofácil":
      return <Sparkles className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

export const LotteryResultCard = ({
  info,
  result,
  proximoConcurso,
  estatisticas,
  variant = "full",
  showStats = false,
  showPrizes = true,
  showNextDraw = true,
  onViewBoloes,
}: LotteryResultCardProps) => {
  const isCompact = variant === "compact";

  return (
    <Card className={`overflow-hidden bg-bolao-card border-bolao-card-border ${info.corBorder}`}>
      {/* Header */}
      <div className={`p-4 ${info.corBg} border-b ${info.corBorder}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${info.corBola} flex items-center justify-center text-white`}>
              {getLotteryIcon(info.tipo)}
            </div>
            <div>
              <h3 className={`font-bold ${info.cor}`}>{info.tipo}</h3>
              <p className="text-xs text-muted-foreground">{info.sorteios}</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${info.corBg} border ${info.corBorder}`}>
            <span className={`font-bold text-sm ${info.cor}`}>#{result.numero}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Date and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{result.data}</span>
          </div>
          {result.acumulado ? (
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">
              Acumulou
            </Badge>
          ) : (
            <Badge className="bg-bolao-green/10 text-bolao-green border-bolao-green/30 text-xs">
              Teve ganhador
            </Badge>
          )}
        </div>

        {/* Numbers */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Números sorteados:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {result.dezenas.map((num, idx) => (
              <NumberBall
                key={idx}
                numero={num}
                corBola={info.corBola}
                size={isCompact ? "small" : "normal"}
              />
            ))}
          </div>
        </div>

        {/* Prizes Table (if showPrizes and not compact) */}
        {showPrizes && result.premios.length > 0 && !isCompact && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-semibold">Premiação</span>
            </div>
            <div className="space-y-2">
              {result.premios.slice(0, 3).map((premio, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-bolao-dark/30"
                >
                  <span className="text-muted-foreground">{premio.faixa}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {premio.ganhadores.toLocaleString("pt-BR")}
                    </span>
                    <span className={idx === 0 ? "font-bold text-bolao-green" : "font-medium"}>
                      {premio.premio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics (if showStats) */}
        {showStats && estatisticas && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* Hot Numbers */}
            <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400">Quentes</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {estatisticas.quentes.slice(0, 3).map((num) => (
                  <div
                    key={num}
                    className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Cold Numbers */}
            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Frios</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {estatisticas.frios.slice(0, 3).map((num) => (
                  <div
                    key={num}
                    className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Next Draw (if showNextDraw) */}
        {showNextDraw && proximoConcurso && (
          <div className={`p-3 rounded-lg ${info.corBg} border ${info.corBorder}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Próximo sorteio</p>
                <p className="font-semibold">{proximoConcurso.data}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Prêmio estimado</p>
                <p className="font-bold text-bolao-green">{proximoConcurso.premio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {onViewBoloes && (
          <Button
            onClick={onViewBoloes}
            className={`w-full mt-4 ${info.corBola} hover:opacity-90 text-white gap-2`}
          >
            Ver Bolões
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

// Compact variant for listing in sidebar or smaller spaces
export const LotteryResultCardCompact = ({
  info,
  result,
}: {
  info: LotteryInfo;
  result: LotteryResult;
}) => (
  <div className={`p-3 rounded-lg ${info.corBg} border ${info.corBorder}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-md ${info.corBola} flex items-center justify-center text-white`}>
          {getLotteryIcon(info.tipo)}
        </div>
        <span className={`font-semibold text-sm ${info.cor}`}>{info.tipo}</span>
      </div>
      <span className="text-xs text-muted-foreground">#{result.numero}</span>
    </div>
    <div className="flex flex-wrap gap-1 justify-center">
      {result.dezenas.slice(0, 6).map((num, idx) => (
        <div
          key={idx}
          className={`w-6 h-6 ${info.corBola} rounded-full flex items-center justify-center text-white text-xs font-bold`}
        >
          {num.toString().padStart(2, "0")}
        </div>
      ))}
      {result.dezenas.length > 6 && (
        <div className="w-6 h-6 bg-bolao-card border border-bolao-card-border rounded-full flex items-center justify-center text-xs text-muted-foreground">
          +{result.dezenas.length - 6}
        </div>
      )}
    </div>
  </div>
);

// History row component
export const LotteryHistoryRow = ({
  result,
  info,
  onClick,
}: {
  result: LotteryResult;
  info: LotteryInfo;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-lg hover:bg-bolao-dark/30 transition-colors ${
      onClick ? "cursor-pointer" : ""
    }`}
  >
    <div className="flex items-center gap-4">
      <span className={`font-bold ${info.cor}`}>#{result.numero}</span>
      <span className="text-sm text-muted-foreground">{result.data}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {result.dezenas.slice(0, 4).map((num, idx) => (
          <span key={idx} className={`w-6 h-6 ${info.corBola} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
            {num.toString().padStart(2, "0")}
          </span>
        ))}
        {result.dezenas.length > 4 && (
          <span className="w-6 h-6 bg-bolao-card border border-bolao-card-border rounded-full flex items-center justify-center text-xs text-muted-foreground">
            +{result.dezenas.length - 4}
          </span>
        )}
      </div>
      {result.acumulado ? (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">Acumulou</Badge>
      ) : (
        <Badge className="bg-bolao-green/10 text-bolao-green border-bolao-green/30 text-xs">Ganhador</Badge>
      )}
    </div>
  </div>
);

export default LotteryResultCard;
