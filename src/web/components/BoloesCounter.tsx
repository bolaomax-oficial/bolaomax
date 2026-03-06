import { Ticket, Info } from "lucide-react";
import { useState } from "react";

interface BoloesCounterProps {
  quantidadeBoloes?: number;
  type?: string;
  className?: string;
  variant?: "default" | "compact" | "large";
  colorScheme?: "orange" | "violet" | "emerald" | "sky" | "green" | "amber" | "pink" | "yellow";
}

const colorSchemes = {
  orange: {
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-300",
    icon: "text-orange-400",
    tooltipBg: "bg-orange-500/20",
  },
  violet: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-300",
    icon: "text-violet-400",
    tooltipBg: "bg-violet-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    tooltipBg: "bg-emerald-500/20",
  },
  sky: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    text: "text-sky-300",
    icon: "text-sky-400",
    tooltipBg: "bg-sky-500/20",
  },
  green: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    tooltipBg: "bg-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-300",
    icon: "text-amber-400",
    tooltipBg: "bg-amber-500/20",
  },
  pink: {
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    text: "text-pink-300",
    icon: "text-pink-400",
    tooltipBg: "bg-pink-500/20",
  },
  yellow: {
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    icon: "text-yellow-400",
    tooltipBg: "bg-yellow-500/20",
  },
};

const lotteryStats = {
  "lotofacil": { count: 42, color: "violet" as const },
  "megasena": { count: 38, color: "green" as const },
  "quina": { count: 45, color: "sky" as const },
  "dia-de-sorte": { count: 24, color: "amber" as const },
  "lotomania": { count: 31, color: "pink" as const },
  "timemania": { count: 18, color: "emerald" as const },
  "dupla-sena": { count: 15, color: "sky" as const },
  "federal": { count: 12, color: "orange" as const },
  "super-sete": { count: 14, color: "green" as const },
};

export const BoloesCounter = ({
  quantidadeBoloes,
  type,
  className = "",
  variant = "default",
  colorScheme,
}: BoloesCounterProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const stats = type ? (lotteryStats[type as keyof typeof lotteryStats] || { count: 0, color: "orange" }) : null;
  const count = quantidadeBoloes ?? stats?.count ?? 0;
  const activeColorScheme = colorScheme ?? stats?.color ?? "orange";
  const colors = colorSchemes[activeColorScheme as keyof typeof colorSchemes];

  const label = count === 1 ? "bolão ativo" : "bolões ativos";
  const tooltipText = count === 1 
    ? "Temos 1 bolão disponível para esta loteria"
    : `Temos ${count} bolões disponíveis para esta loteria`;

  if (variant === "compact") {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          ${colors.bg} ${colors.border} border
          ${className}
        `}
      >
        <Ticket className={`w-3.5 h-3.5 ${colors.icon}`} />
        <span className={`text-sm font-bold ${colors.text}`}>{count}</span>
        <span className="text-[10px] text-muted-foreground">bolões</span>
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div
        className={`
          relative flex flex-col items-center justify-center p-4 rounded-xl
          ${colors.bg} ${colors.border} border
          ${className}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={`p-2 rounded-lg ${colors.bg} mb-2`}>
          <Ticket className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <span className={`text-3xl font-extrabold ${colors.text}`}>{count}</span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-bolao-dark border border-bolao-card-border rounded-lg shadow-xl z-10 whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-xs">
              <Info className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{tooltipText}</span>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-bolao-dark border-r border-b border-bolao-card-border"></div>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        ${colors.bg} ${colors.border} border
        transition-all duration-200 hover:scale-[1.02]
        ${className}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`p-1.5 rounded-md ${colors.bg}`}>
        <Ticket className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <div className="flex flex-col">
        <span className={`text-lg font-extrabold ${colors.text} leading-tight`}>{count}</span>
        <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-bolao-dark border border-bolao-card-border rounded-lg shadow-xl z-10 whitespace-nowrap max-w-xs">
          <div className="flex items-center gap-1.5 text-xs">
            <Info className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{tooltipText}</span>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-bolao-dark border-r border-b border-bolao-card-border"></div>
        </div>
      )}
    </div>
  );
};

export default BoloesCounter;
