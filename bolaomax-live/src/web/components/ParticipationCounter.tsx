import { Users, Info } from "lucide-react";
import { useState } from "react";

interface ParticipationCounterProps {
  participationCount: number;
  className?: string;
  variant?: "default" | "compact" | "badge";
  colorScheme?: "orange" | "violet" | "emerald" | "sky" | "green";
}

const colorSchemes = {
  orange: {
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    text: "text-orange-300",
    icon: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-600/10",
  },
  violet: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    text: "text-violet-300",
    icon: "text-violet-400",
    gradient: "from-violet-500/20 to-violet-600/10",
  },
  emerald: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-600/10",
  },
  sky: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    text: "text-sky-300",
    icon: "text-sky-400",
    gradient: "from-sky-500/20 to-sky-600/10",
  },
  green: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-600/10",
  },
};

export const ParticipationCounter = ({
  participationCount,
  className = "",
  variant = "default",
  colorScheme = "orange",
}: ParticipationCounterProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = colorSchemes[colorScheme];

  // If user is not participating, don't show anything
  if (participationCount <= 0) {
    return null;
  }

  const label = participationCount === 1 
    ? "Você está em 1 bolão" 
    : `Você está em ${participationCount} bolões`;
  
  const tooltipText = participationCount === 1 
    ? "Você já possui uma participação neste bolão"
    : `Você possui ${participationCount} participações neste bolão`;

  if (variant === "compact") {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 rounded-md
          ${colors.bg} ${colors.border} border
          ${className}
        `}
        title={tooltipText}
      >
        <Users className={`w-3 h-3 ${colors.icon}`} />
        <span className={`text-xs font-semibold ${colors.text}`}>{participationCount}</span>
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-gradient-to-r ${colors.gradient} ${colors.border} border
          ${className}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Users className={`w-3.5 h-3.5 ${colors.icon}`} />
        <span className={`text-xs font-bold ${colors.text}`}>
          {participationCount === 1 ? "1 participação" : `${participationCount} participações`}
        </span>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-bolao-dark border border-bolao-card-border rounded-lg shadow-xl z-20 whitespace-nowrap">
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

  // Default variant - styled like JogosCounter
  return (
    <div
      className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-gradient-to-r ${colors.gradient} ${colors.border} border
        transition-all duration-200 hover:scale-[1.02]
        ${className}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`p-1.5 rounded-md ${colors.bg}`}>
        <Users className={`w-4 h-4 ${colors.icon}`} />
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-bold ${colors.text} leading-tight`}>{label}</span>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-bolao-dark border border-bolao-card-border rounded-lg shadow-xl z-20 whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Info className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{tooltipText}</span>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-bolao-dark border-r border-b border-bolao-card-border"></div>
        </div>
      )}
    </div>
  );
};

export default ParticipationCounter;
