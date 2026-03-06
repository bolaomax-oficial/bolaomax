import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Sparkles } from "lucide-react";

interface RecentlyUpdatedBadgeProps {
  isUpdated: boolean;
  showDuration?: number; // How long to show the badge in ms
  className?: string;
}

export const RecentlyUpdatedBadge = ({
  isUpdated,
  showDuration = 30000,
  className = "",
}: RecentlyUpdatedBadgeProps) => {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isUpdated) {
      setVisible(true);
      setAnimate(true);
      
      // Remove animation class after animation completes
      const animTimer = setTimeout(() => setAnimate(false), 1000);
      
      // Hide badge after duration
      const hideTimer = setTimeout(() => setVisible(false), showDuration);
      
      return () => {
        clearTimeout(animTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isUpdated, showDuration]);

  if (!visible) return null;

  return (
    <Badge
      className={`
        bg-gradient-to-r from-bolao-green to-bolao-green-dark text-white border-0
        ${animate ? "animate-pulse" : ""}
        ${className}
      `}
    >
      <RefreshCw className={`w-3 h-3 mr-1 ${animate ? "animate-spin" : ""}`} />
      Atualizado agora
    </Badge>
  );
};

// Dev Panel for testing updates
interface DevUpdatePanelProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onTriggerUpdate: (bolaoId: string, data: { premioEstimado?: string; dataSorteio?: string }) => void;
  bolaos: Array<{ id: string; codigoBolao?: string; name?: string }>;
  className?: string;
}

export const DevUpdatePanel = ({
  enabled,
  onToggle,
  onTriggerUpdate,
  bolaos,
  className = "",
}: DevUpdatePanelProps) => {
  const [selectedBolao, setSelectedBolao] = useState<string>("");
  const [newPrize, setNewPrize] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");

  if (!enabled) {
    return (
      <button
        onClick={() => onToggle(true)}
        className={`
          fixed bottom-4 left-4 z-50 p-2 rounded-lg
          bg-purple-500/10 border border-purple-500/30
          text-purple-400 text-xs font-medium
          hover:bg-purple-500/20 transition-colors
          ${className}
        `}
      >
        <Sparkles className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      className={`
        fixed bottom-4 left-4 z-50 p-4 rounded-xl
        bg-[#111827] border border-purple-500/30
        shadow-lg max-w-xs
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Dev Mode</span>
        </div>
        <button
          onClick={() => onToggle(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          Fechar
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Bolão</label>
          <select
            value={selectedBolao}
            onChange={(e) => setSelectedBolao(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-[#0A0E14] border border-[#1C2432] text-white text-sm"
          >
            <option value="">Selecione...</option>
            {bolaos.slice(0, 10).map((b) => (
              <option key={b.id} value={b.id}>
                {b.codigoBolao || b.id} - {b.name || "Bolão"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Novo Prêmio</label>
          <input
            type="text"
            value={newPrize}
            onChange={(e) => setNewPrize(e.target.value)}
            placeholder="R$ 5 Milhões"
            className="w-full px-2 py-1.5 rounded bg-[#0A0E14] border border-[#1C2432] text-white text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nova Data</label>
          <input
            type="text"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            placeholder="25/12"
            className="w-full px-2 py-1.5 rounded bg-[#0A0E14] border border-[#1C2432] text-white text-sm"
          />
        </div>

        <button
          onClick={() => {
            if (selectedBolao) {
              onTriggerUpdate(selectedBolao, {
                premioEstimado: newPrize || undefined,
                dataSorteio: newDate || undefined,
              });
            }
          }}
          disabled={!selectedBolao}
          className="
            w-full py-2 rounded-lg text-sm font-medium
            bg-purple-500 hover:bg-purple-600 text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          Simular Atualização
        </button>
      </div>
    </div>
  );
};

export default RecentlyUpdatedBadge;
