import { Eye } from "lucide-react";

interface ViewGamesButtonProps {
  onClick: () => void;
  colorScheme?: "violet" | "emerald" | "sky" | "orange" | "green" | "pink" | "yellow";
  className?: string;
}

const colorSchemes = {
  violet: {
    bg: "bg-violet-500/20",
    bgHover: "hover:bg-violet-500/40",
    border: "border-violet-500/50",
    text: "text-violet-300",
    icon: "text-violet-300",
    glow: "hover:shadow-violet-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/20",
    bgHover: "hover:bg-emerald-500/40",
    border: "border-emerald-500/50",
    text: "text-emerald-300",
    icon: "text-emerald-300",
    glow: "hover:shadow-emerald-500/30",
  },
  sky: {
    bg: "bg-sky-500/20",
    bgHover: "hover:bg-sky-500/40",
    border: "border-sky-500/50",
    text: "text-sky-300",
    icon: "text-sky-300",
    glow: "hover:shadow-sky-500/30",
  },
  orange: {
    bg: "bg-orange-500/20",
    bgHover: "hover:bg-orange-500/40",
    border: "border-orange-500/50",
    text: "text-orange-300",
    icon: "text-orange-300",
    glow: "hover:shadow-orange-500/30",
  },
  green: {
    bg: "bg-emerald-500/20",
    bgHover: "hover:bg-emerald-500/40",
    border: "border-emerald-500/50",
    text: "text-emerald-300",
    icon: "text-emerald-300",
    glow: "hover:shadow-emerald-500/30",
  },
  pink: {
    bg: "bg-pink-500/20",
    bgHover: "hover:bg-pink-500/40",
    border: "border-pink-500/50",
    text: "text-pink-300",
    icon: "text-pink-300",
    glow: "hover:shadow-pink-500/30",
  },
  yellow: {
    bg: "bg-yellow-500/20",
    bgHover: "hover:bg-yellow-500/40",
    border: "border-yellow-500/50",
    text: "text-yellow-300",
    icon: "text-yellow-300",
    glow: "hover:shadow-yellow-500/30",
  },
};

export const ViewGamesButton = ({
  onClick,
  colorScheme = "violet",
  className = "",
}: ViewGamesButtonProps) => {
  const colors = colorSchemes[colorScheme];

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
        ${colors.bg} ${colors.bgHover} ${colors.border} border
        transition-all duration-200 
        hover:scale-105 hover:shadow-lg ${colors.glow}
        ${className}
      `}
      title="Ver jogos do bolão"
    >
      <Eye className={`w-4 h-4 ${colors.icon}`} />
      <span className={`text-xs font-semibold ${colors.text}`}>Ver Jogos</span>
    </button>
  );
};

export default ViewGamesButton;
