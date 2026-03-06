import { Ticket, Grid3x3, Brain } from "lucide-react";

interface BolaoInfoSectionProps {
  quantidadeBoloes: number;
  jogosGerados: number;
  dezenas?: number;
  estrategia?: string;
  colorScheme?: "violet" | "emerald" | "sky" | "orange" | "green";
  className?: string;
}

const colorSchemes = {
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    iconBolao: "text-violet-400",
    iconJogos: "text-violet-400",
    iconEstrategia: "text-emerald-400",
    textBolao: "text-violet-300",
    textJogos: "text-violet-300",
    textEstrategia: "text-emerald-300",
  },
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    iconBolao: "text-emerald-400",
    iconJogos: "text-emerald-400",
    iconEstrategia: "text-emerald-400",
    textBolao: "text-emerald-300",
    textJogos: "text-emerald-300",
    textEstrategia: "text-emerald-300",
  },
  sky: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    iconBolao: "text-sky-400",
    iconJogos: "text-sky-400",
    iconEstrategia: "text-emerald-400",
    textBolao: "text-sky-300",
    textJogos: "text-sky-300",
    textEstrategia: "text-emerald-300",
  },
  orange: {
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    iconBolao: "text-orange-400",
    iconJogos: "text-orange-400",
    iconEstrategia: "text-emerald-400",
    textBolao: "text-orange-300",
    textJogos: "text-orange-300",
    textEstrategia: "text-emerald-300",
  },
  green: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    iconBolao: "text-emerald-400",
    iconJogos: "text-emerald-400",
    iconEstrategia: "text-emerald-400",
    textBolao: "text-emerald-300",
    textJogos: "text-emerald-300",
    textEstrategia: "text-emerald-300",
  },
};

export const BolaoInfoSection = ({
  quantidadeBoloes,
  jogosGerados,
  dezenas,
  estrategia = "Balanceada",
  colorScheme = "violet",
  className = "",
}: BolaoInfoSectionProps) => {
  const colors = colorSchemes[colorScheme];
  const formattedJogos = jogosGerados.toLocaleString("pt-BR");
  
  // Fixed: Now correctly describes the number of lottery tickets in this card
  const boloesText = quantidadeBoloes === 1 
    ? "1 jogo de loteria" 
    : `${quantidadeBoloes} jogos de loteria`;

  return (
    <div className={`rounded-lg p-3 border ${colors.border} ${colors.bg} ${className}`}>
      <div className="grid grid-cols-1 gap-2">
        {/* Quantidade de Jogos/Bilhetes neste card */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${colors.bg}`}>
            <Ticket className={`w-3.5 h-3.5 ${colors.iconBolao}`} />
          </div>
          <span className={`text-sm font-medium ${colors.textBolao}`}>
            Este card inclui {boloesText}
            {dezenas && <span className="text-muted-foreground"> ({dezenas} dezenas cada)</span>}
          </span>
        </div>

        {/* Quantidade Total de Combinações */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${colors.bg}`}>
            <Grid3x3 className={`w-3.5 h-3.5 ${colors.iconJogos}`} />
          </div>
          <span className={`text-sm font-medium ${colors.textJogos}`}>
            {formattedJogos} combinações totais
          </span>
        </div>

        {/* Estratégia */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/15">
            <Brain className={`w-3.5 h-3.5 ${colors.iconEstrategia}`} />
          </div>
          <span className={`text-sm font-medium ${colors.textEstrategia}`}>
            Estratégia: {estrategia}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BolaoInfoSection;
