import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getAllLotteries,
  iconMap as lotteryIconMap,
  colorClasses,
  type LotteryConfig,
} from "@/services/lotteryService";
import { LotteryEditorModal, type ExtendedLotteryConfig } from "@/components/admin/LotteryEditorModal";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Upload,
  FileText,
  CheckCircle,
  EyeOff,
  Clock,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  Circle,
  Clover,
  LayoutGrid,
  List,
  Filter,
  X,
  ExternalLink,
  DollarSign,
  Users,
  Ticket,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  History,
  Activity,
} from "lucide-react";

// Sort options
type SortOption = "name-asc" | "name-desc" | "created-asc" | "created-desc" | "status";
type ViewMode = "grid" | "list";
type DevicePreview = "desktop" | "tablet" | "mobile";

// Mock modification history
interface ModificationEntry {
  id: string;
  lotteryName: string;
  action: string;
  timestamp: Date;
  user: string;
}

const mockModifications: ModificationEntry[] = [
  { id: "1", lotteryName: "Lotofácil", action: "Status alterado para Ativo", timestamp: new Date(Date.now() - 1000 * 60 * 5), user: "Admin" },
  { id: "2", lotteryName: "Mega-Sena", action: "Cor atualizada", timestamp: new Date(Date.now() - 1000 * 60 * 30), user: "Admin" },
  { id: "3", lotteryName: "Quina", action: "Descrição editada", timestamp: new Date(Date.now() - 1000 * 60 * 60), user: "Admin" },
  { id: "4", lotteryName: "Timemania", action: "Loteria criada", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), user: "Admin" },
  { id: "5", lotteryName: "Dia de Sorte", action: "Status alterado para Em Breve", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), user: "Admin" },
];

const AdminLoterias = () => {
  const { isDark } = useTheme();
  const [lotteries, setLotteries] = useState<LotteryConfig[]>(getAllLotteries());
  const [filterTab, setFilterTab] = useState<"all" | "active" | "coming" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLottery, setEditingLottery] = useState<LotteryConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewLottery, setIsNewLottery] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Bulk selection state
  const [selectedLotteries, setSelectedLotteries] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<string | null>(null);
  
  // New features: sorting, view mode, advanced filters
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterMinCost, setFilterMinCost] = useState<number | null>(null);
  const [filterMaxCost, setFilterMaxCost] = useState<number | null>(null);
  
  // Live Preview state
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewLottery, setPreviewLottery] = useState<LotteryConfig | null>(null);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>("desktop");
  const [previewKey, setPreviewKey] = useState(0);
  
  // Modification history
  const [showHistory, setShowHistory] = useState(false);

  // Filter lotteries based on tab, search, and advanced filters
  const filteredLotteries = useMemo(() => {
    let result = [...lotteries];
    
    // Filter by tab
    if (filterTab === "active") {
      result = result.filter(l => l.active && !l.comingSoon);
    } else if (filterTab === "coming") {
      result = result.filter(l => l.comingSoon);
    } else if (filterTab === "inactive") {
      result = result.filter(l => !l.active && !l.comingSoon);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.name.toLowerCase().includes(query) || 
        l.slug.toLowerCase().includes(query)
      );
    }
    
    // Advanced filters
    if (filterColor) {
      result = result.filter(l => l.colorName === filterColor);
    }
    
    if (filterMinCost !== null) {
      result = result.filter(l => (l.minBet || 0) >= filterMinCost);
    }
    
    if (filterMaxCost !== null) {
      result = result.filter(l => (l.minBet || 0) <= filterMaxCost);
    }
    
    // Sorting
    switch (sortOption) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "created-asc":
        result.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "created-desc":
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "status":
        result.sort((a, b) => {
          const statusOrder = (l: LotteryConfig) => {
            if (l.active && !l.comingSoon) return 0;
            if (l.comingSoon) return 1;
            return 2;
          };
          return statusOrder(a) - statusOrder(b);
        });
        break;
    }
    
    return result;
  }, [lotteries, filterTab, searchQuery, sortOption, filterColor, filterMinCost, filterMaxCost]);

  // Get statistics
  const stats = useMemo(() => {
    const activeLotteries = lotteries.filter(l => l.active && !l.comingSoon);
    const avgCost = activeLotteries.length > 0 
      ? activeLotteries.reduce((sum, l) => sum + (l.minBet || 0), 0) / activeLotteries.length 
      : 0;
    const totalBoloes = activeLotteries.reduce((sum, l) => sum + (l.totalBoloes || Math.floor(Math.random() * 30) + 5), 0);
    
    return {
      total: lotteries.length,
      active: activeLotteries.length,
      comingSoon: lotteries.filter(l => l.comingSoon).length,
      inactive: lotteries.filter(l => !l.active && !l.comingSoon).length,
      estimatedRevenue: activeLotteries.reduce((sum, l) => sum + (l.prizeEstimate || 0), 0),
      avgCost,
      totalBoloes,
      mostPopular: activeLotteries[0]?.name || "N/A",
    };
  }, [lotteries]);

  // Toggle selection for a single lottery
  const toggleSelection = (id: string) => {
    setSelectedLotteries(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setShowBulkActions(next.size > 0);
      return next;
    });
  };

  // Select all visible lotteries
  const selectAll = () => {
    const allIds = new Set(filteredLotteries.map(l => l.id));
    setSelectedLotteries(allIds);
    setShowBulkActions(allIds.size > 0);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLotteries(new Set());
    setShowBulkActions(false);
    setBulkActionConfirm(null);
  };

  // Bulk activate selected lotteries
  const bulkActivate = () => {
    setLotteries(prev => prev.map(l => 
      selectedLotteries.has(l.id) 
        ? { ...l, active: true, comingSoon: false } 
        : l
    ));
    showToast(`${selectedLotteries.size} loterias ativadas!`);
    clearSelection();
  };

  // Bulk deactivate selected lotteries
  const bulkDeactivate = () => {
    setLotteries(prev => prev.map(l => 
      selectedLotteries.has(l.id) 
        ? { ...l, active: false } 
        : l
    ));
    showToast(`${selectedLotteries.size} loterias desativadas!`);
    clearSelection();
  };

  // Bulk mark as coming soon
  const bulkMarkComingSoon = () => {
    setLotteries(prev => prev.map(l => 
      selectedLotteries.has(l.id) 
        ? { ...l, active: false, comingSoon: true } 
        : l
    ));
    showToast(`${selectedLotteries.size} loterias marcadas como "Em Breve"!`);
    clearSelection();
  };

  // Bulk delete selected lotteries
  const bulkDelete = () => {
    setLotteries(prev => prev.filter(l => !selectedLotteries.has(l.id)));
    showToast(`${selectedLotteries.size} loterias excluídas!`);
    clearSelection();
  };

  // Bulk duplicate selected lotteries
  const bulkDuplicate = () => {
    const duplicates = lotteries
      .filter(l => selectedLotteries.has(l.id))
      .map(l => ({
        ...l,
        id: `${l.id}-copy-${Date.now()}`,
        name: `${l.name} (Cópia)`,
        slug: `${l.slug}-copy`,
        route: `/${l.slug}-copy`,
        active: false,
        comingSoon: true,
      }));
    setLotteries(prev => [...prev, ...duplicates]);
    showToast(`${duplicates.length} loterias duplicadas!`);
    clearSelection();
  };

  // Export selected lotteries as JSON
  const exportSelected = () => {
    const selected = lotteries.filter(l => selectedLotteries.has(l.id));
    const configJson = JSON.stringify(selected, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lottery-config-selected-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${selected.length} loterias exportadas!`);
  };

  // Import lottery configuration
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const newLotteries = imported.map((l: LotteryConfig) => ({
            ...l,
            id: `${l.id || l.slug}-imported-${Date.now()}`,
          }));
          setLotteries(prev => [...prev, ...newLotteries]);
          showToast(`${newLotteries.length} loterias importadas!`);
        } else {
          showToast("Formato inválido. Esperado um array de loterias.");
        }
      } catch {
        showToast("Erro ao importar arquivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Toggle lottery active state
  const toggleLotteryActive = (id: string) => {
    setLotteries(prev => prev.map(l => {
      if (l.id === id) {
        const newActive = !l.active;
        return { ...l, active: newActive, comingSoon: newActive ? false : l.comingSoon };
      }
      return l;
    }));
    showToast("Status da loteria atualizado!");
  };

  // Duplicate lottery
  const duplicateLottery = (lottery: LotteryConfig) => {
    const newLottery: LotteryConfig = {
      ...lottery,
      id: `${lottery.id}-copy-${Date.now()}`,
      name: `${lottery.name} (Cópia)`,
      slug: `${lottery.slug}-copy`,
      route: `/${lottery.slug}-copy`,
      active: false,
      comingSoon: true,
    };
    setLotteries(prev => [...prev, newLottery]);
    showToast(`Loteria "${lottery.name}" duplicada com sucesso!`);
  };

  // Open edit modal
  const openEditModal = (lottery: LotteryConfig | null, isNew = false) => {
    setEditingLottery(lottery);
    setIsNewLottery(isNew);
    setIsEditModalOpen(true);
  };

  // Save lottery
  const saveLottery = (lottery: LotteryConfig) => {
    if (isNewLottery) {
      setLotteries(prev => [...prev, lottery]);
      showToast(`Loteria "${lottery.name}" criada com sucesso!`);
    } else {
      setLotteries(prev => prev.map(l => l.id === lottery.id ? lottery : l));
      showToast(`Loteria "${lottery.name}" atualizada com sucesso!`);
    }
    setIsEditModalOpen(false);
  };

  // Delete lottery handler
  const deleteLottery = (lotteryId: string) => {
    setLotteries(prev => prev.filter(l => l.id !== lotteryId));
    showToast("Loteria excluída com sucesso!");
  };

  // Show toast notification
  const showToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Quick action: activate all
  const activateAll = () => {
    setLotteries(prev => prev.map(l => ({ ...l, active: true, comingSoon: false })));
    showToast("Todas as loterias foram ativadas!");
  };

  // Clear advanced filters
  const clearAdvancedFilters = () => {
    setFilterColor(null);
    setFilterMinCost(null);
    setFilterMaxCost(null);
  };

  // Open Live Preview for a lottery
  const openLivePreview = (lottery: LotteryConfig) => {
    setPreviewLottery(lottery);
    setShowLivePreview(true);
    setPreviewKey(prev => prev + 1);
  };

  // Refresh Preview iframe
  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  // Get preview iframe dimensions based on device
  const getPreviewDimensions = () => {
    switch (devicePreview) {
      case "desktop": return { width: "100%", height: "600px" };
      case "tablet": return { width: "768px", height: "1024px" };
      case "mobile": return { width: "375px", height: "667px" };
    }
  };

  // Format time ago for modification history
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  // Filter Tab Component
  const FilterTab = ({ 
    value, 
    label, 
    count, 
    active 
  }: { 
    value: typeof filterTab; 
    label: string; 
    count: number; 
    active: boolean;
  }) => (
    <button
      onClick={() => setFilterTab(value)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
        active
          ? "bg-bolao-green text-white"
          : isDark
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
      <Badge className={`text-[10px] ${
        active 
          ? "bg-white/20 text-white" 
          : isDark 
            ? "bg-[#1C2432] text-gray-400" 
            : "bg-gray-200 text-gray-600"
      }`}>
        {count}
      </Badge>
    </button>
  );

  // Lottery Card Component (Grid View)
  const LotteryCard = ({ lottery }: { lottery: LotteryConfig }) => {
    const Icon = lotteryIconMap[lottery.icon] || Circle;
    const colors = colorClasses[lottery.colorName];
    const hasPage = ["lotofacil", "megasena", "quina", "timemania", "dia-de-sorte", "super-sete", "dupla-sena", "lotomania", "federal", "internacional"].includes(lottery.slug);
    const isSelected = selectedLotteries.has(lottery.id);

    return (
      <div className={`p-4 rounded-xl border transition-all hover:shadow-lg relative ${
        isDark 
          ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#2D3748]"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isSelected ? "ring-2 ring-bolao-green ring-offset-2 ring-offset-[#111827]" : ""}`}>
        {/* Selection Checkbox */}
        <button
          onClick={() => toggleSelection(lottery.id)}
          className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-bolao-green border-bolao-green"
              : isDark 
                ? "border-[#1C2432] hover:border-bolao-green/50 bg-transparent"
                : "border-gray-300 hover:border-bolao-green/50 bg-transparent"
          }`}
        >
          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-3 ml-6">
          <div className="flex items-center gap-3">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.iconBg}`}
              style={{ backgroundColor: `${lottery.color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color: lottery.color }} />
            </div>
            <div>
              <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {lottery.name}
              </h4>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                /{lottery.slug}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge className={`text-[10px] ${
            lottery.active && !lottery.comingSoon
              ? "bg-emerald-500/20 text-emerald-400"
              : lottery.comingSoon
                ? "bg-amber-500/20 text-amber-400"
                : "bg-gray-500/20 text-gray-400"
          }`}>
            {lottery.active && !lottery.comingSoon 
              ? "Ativo" 
              : lottery.comingSoon 
                ? "Em Breve" 
                : "Inativo"}
          </Badge>
        </div>

        {/* Color Preview */}
        <div className="flex items-center gap-2 mb-3">
          <div 
            className="w-6 h-6 rounded-lg border border-white/20"
            style={{ backgroundColor: lottery.color }}
          />
          <span className={`text-xs font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {lottery.color}
          </span>
          <Badge className={`text-[10px] ${colors.bg} text-white`}>
            {lottery.colorName}
          </Badge>
        </div>

        {/* Description */}
        <p className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {lottery.description}
        </p>

        {/* Mini Stats */}
        {lottery.minBet && (
          <div className={`flex items-center gap-2 mb-3 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <DollarSign className="w-3 h-3" />
            <span>Min: R$ {lottery.minBet?.toFixed(2)}</span>
          </div>
        )}

        {/* Warning if no page */}
        {lottery.active && !hasPage && (
          <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
            isDark ? "bg-amber-500/10" : "bg-amber-50"
          }`}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-500">
              Crie a página /{lottery.slug} antes de ativar
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-700/30">
          {/* Toggle Active */}
          <button
            onClick={() => toggleLotteryActive(lottery.id)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              lottery.active && !lottery.comingSoon
                ? "bg-bolao-green" 
                : isDark ? "bg-[#1C2432]" : "bg-gray-300"
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
              lottery.active && !lottery.comingSoon ? "left-6" : "left-1"
            }`} />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Live Preview Button */}
            {hasPage && (
              <button
                onClick={() => openLivePreview(lottery)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? "hover:bg-bolao-green/20 text-gray-400 hover:text-bolao-green"
                    : "hover:bg-bolao-green/10 text-gray-500 hover:text-bolao-green"
                }`}
                title="Visualizar Página"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => duplicateLottery(lottery)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
              title="Duplicar"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditModal(lottery)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                  : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
              }`}
              title="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteLottery(lottery.id)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                  : "hover:bg-red-100 text-gray-500 hover:text-red-600"
              }`}
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Lottery List Item Component (List View)
  const LotteryListItem = ({ lottery }: { lottery: LotteryConfig }) => {
    const Icon = lotteryIconMap[lottery.icon] || Circle;
    const colors = colorClasses[lottery.colorName];
    const isSelected = selectedLotteries.has(lottery.id);
    const hasPage = ["lotofacil", "megasena", "quina", "timemania", "dia-de-sorte", "super-sete", "dupla-sena", "lotomania", "federal", "internacional"].includes(lottery.slug);

    return (
      <div className={`p-4 rounded-xl border transition-all hover:shadow-lg flex items-center gap-4 ${
        isDark 
          ? "bg-[#0A0E14] border-[#1C2432] hover:border-[#2D3748]"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isSelected ? "ring-2 ring-bolao-green" : ""}`}>
        {/* Selection Checkbox */}
        <button
          onClick={() => toggleSelection(lottery.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            isSelected
              ? "bg-bolao-green border-bolao-green"
              : isDark 
                ? "border-[#1C2432] hover:border-bolao-green/50 bg-transparent"
                : "border-gray-300 hover:border-bolao-green/50 bg-transparent"
          }`}
        >
          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
        </button>

        {/* Icon */}
        <div 
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: `${lottery.color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: lottery.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {lottery.name}
            </h4>
            <Badge className={`text-[10px] ${
              lottery.active && !lottery.comingSoon
                ? "bg-emerald-500/20 text-emerald-400"
                : lottery.comingSoon
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-gray-500/20 text-gray-400"
            }`}>
              {lottery.active && !lottery.comingSoon 
                ? "Ativo" 
                : lottery.comingSoon 
                  ? "Em Breve" 
                  : "Inativo"}
            </Badge>
          </div>
          <p className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {lottery.description}
          </p>
        </div>

        {/* Color */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div 
            className="w-5 h-5 rounded border border-white/20"
            style={{ backgroundColor: lottery.color }}
          />
          <span className={`text-xs font-mono hidden sm:inline ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {lottery.color}
          </span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => toggleLotteryActive(lottery.id)}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
            lottery.active && !lottery.comingSoon
              ? "bg-bolao-green" 
              : isDark ? "bg-[#1C2432]" : "bg-gray-300"
          }`}
        >
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
            lottery.active && !lottery.comingSoon ? "left-6" : "left-1"
          }`} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Live Preview Button */}
          {hasPage && (
            <button
              onClick={() => openLivePreview(lottery)}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? "hover:bg-bolao-green/20 text-gray-400 hover:text-bolao-green"
                  : "hover:bg-bolao-green/10 text-gray-500 hover:text-bolao-green"
              }`}
              title="Visualizar Página"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => duplicateLottery(lottery)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => openEditModal(lottery)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
            }`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteLottery(lottery.id)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                : "hover:bg-red-100 text-gray-500 hover:text-red-600"
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="Loterias" subtitle="Gerencie todas as loterias da plataforma">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" : "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-emerald-500/20" : "bg-emerald-500/10"}`}>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">
              {Math.round((stats.active / Math.max(stats.total, 1)) * 100)}%
            </Badge>
          </div>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total de Loterias</p>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20" : "bg-gradient-to-br from-green-50 to-green-100 border-green-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-green-500/20" : "bg-green-500/10"}`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <Badge className="bg-green-500/20 text-green-400 text-[10px]">Ativas</Badge>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.active}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Disponíveis</p>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20" : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-amber-500/20" : "bg-amber-500/10"}`}>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">Em Breve</Badge>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats.comingSoon}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Em Desenvolvimento</p>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20" : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-500/10"}`}>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <Badge className="bg-purple-500/20 text-purple-400 text-[10px]">Estimado</Badge>
          </div>
          <p className="text-3xl font-bold text-purple-400">
            R$ {(stats.estimatedRevenue / 1000000).toFixed(1)}M
          </p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Receita Estimada</p>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20" : "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-cyan-500/20" : "bg-cyan-500/10"}`}>
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 text-[10px]">Média</Badge>
          </div>
          <p className="text-2xl font-bold text-cyan-400">
            R$ {stats.avgCost.toFixed(2)}
          </p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Custo Médio por Jogo</p>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20" : "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-pink-500/20" : "bg-pink-500/10"}`}>
              <Ticket className="w-5 h-5 text-pink-500" />
            </div>
            <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">Total</Badge>
          </div>
          <p className="text-2xl font-bold text-pink-400">{stats.totalBoloes}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões Disponíveis</p>
        </Card>

        <Card className={`p-4 ${isDark ? "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20" : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${isDark ? "bg-orange-500/20" : "bg-orange-500/10"}`}>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <Badge className="bg-orange-500/20 text-orange-400 text-[10px]">Top</Badge>
          </div>
          <p className="text-xl font-bold text-orange-400 truncate">{stats.mostPopular}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mais Popular</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className={`p-4 mb-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <Zap className="w-4 h-4 text-bolao-green" />
          Ações Rápidas
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={activateAll}
            className="text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativar Todas
          </Button>
          <Button
            size="sm"
            onClick={() => openEditModal(null, true)}
            className="bg-bolao-green hover:bg-bolao-green-dark text-white text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Nova Loteria
          </Button>
          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer border transition-colors ${
            isDark 
              ? "bg-[#1C2432] hover:bg-[#2D3748] text-gray-300 border-[#2D3748]"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
          }`}>
            <Upload className="w-3 h-3" />
            Importar Configuração
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      {/* Two Column Layout for Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Live Preview Section */}
        <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <button 
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="w-full flex items-center justify-between"
          >
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <Monitor className="w-4 h-4 text-bolao-green" />
              Visualização ao Vivo
              {previewLottery && (
                <Badge className="bg-bolao-green/20 text-bolao-green text-[10px] ml-2">
                  {previewLottery.name}
                </Badge>
              )}
            </h3>
            {showLivePreview ? (
              <ChevronUp className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            )}
          </button>
          
          {showLivePreview && (
            <div className="mt-4">
              {previewLottery ? (
                <>
                  {/* Device Selector */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                      <button
                        onClick={() => setDevicePreview("desktop")}
                        className={`p-2 rounded-l-lg transition-colors ${
                          devicePreview === "desktop" 
                            ? "bg-bolao-green text-white" 
                            : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                        }`}
                        title="Desktop"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDevicePreview("tablet")}
                        className={`p-2 transition-colors ${
                          devicePreview === "tablet" 
                            ? "bg-bolao-green text-white" 
                            : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                        }`}
                        title="Tablet"
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDevicePreview("mobile")}
                        className={`p-2 rounded-r-lg transition-colors ${
                          devicePreview === "mobile" 
                            ? "bg-bolao-green text-white" 
                            : isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                        }`}
                        title="Mobile"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshPreview}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Atualizar
                      </Button>
                      <a
                        href={`/${previewLottery.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                          isDark 
                            ? "bg-[#1C2432] hover:bg-[#2D3748] text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Abrir
                      </a>
                    </div>
                  </div>
                  
                  {/* Preview iframe container */}
                  <div 
                    className={`border rounded-lg overflow-hidden mx-auto transition-all duration-300 ${
                      isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-200 bg-gray-50"
                    }`}
                    style={{ 
                      width: getPreviewDimensions().width,
                      maxWidth: "100%"
                    }}
                  >
                    <iframe
                      key={previewKey}
                      src={`/${previewLottery.slug}`}
                      title={`Preview: ${previewLottery.name}`}
                      className="w-full bg-white"
                      style={{ 
                        height: devicePreview === "desktop" ? "400px" : "500px",
                        transform: devicePreview !== "desktop" ? "scale(0.8)" : "none",
                        transformOrigin: "top center"
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                  isDark ? "border-[#1C2432]" : "border-gray-200"
                }`}>
                  <Eye className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Clique no ícone <Eye className="w-4 h-4 inline" /> em uma loteria para visualizar
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modification History Section */}
        <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between"
          >
            <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <History className="w-4 h-4 text-bolao-green" />
              Histórico de Modificações
              <Badge className="bg-bolao-green/20 text-bolao-green text-[10px] ml-2">
                {mockModifications.length} recentes
              </Badge>
            </h3>
            {showHistory ? (
              <ChevronUp className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            )}
          </button>
          
          {showHistory && (
            <div className="mt-4 space-y-2">
              {mockModifications.map((mod) => (
                <div 
                  key={mod.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    isDark ? "bg-[#0A0E14]" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? "bg-bolao-green/20" : "bg-bolao-green/10"
                    }`}>
                      <Activity className="w-4 h-4 text-bolao-green" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {mod.lotteryName}
                      </p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {mod.action}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      {mod.user}
                    </p>
                    <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {formatTimeAgo(mod.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Gerenciamento de Loterias
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {filteredLotteries.length} loterias encontradas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Import Button */}
            <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
              isDark 
                ? "bg-[#1C2432] hover:bg-[#2D3748] text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Button
              onClick={() => openEditModal(null, true)}
              className="bg-bolao-green hover:bg-bolao-green-dark text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar Loteria
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className={`mb-4 p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 ${
            isDark 
              ? "bg-bolao-green/5 border-bolao-green/20"
              : "bg-bolao-green/5 border-bolao-green/20"
          }`}>
            <div className="flex items-center gap-2">
              <Badge className="bg-bolao-green/20 text-bolao-green">
                {selectedLotteries.size} selecionadas
              </Badge>
              <button
                onClick={clearSelection}
                className={`text-xs hover:underline ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Limpar seleção
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {bulkActionConfirm === "delete" ? (
                <>
                  <span className="text-xs text-red-400">Confirmar exclusão?</span>
                  <Button size="sm" variant="outline" onClick={() => setBulkActionConfirm(null)} className="text-xs h-7">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={bulkDelete} className="bg-red-500 hover:bg-red-600 text-white text-xs h-7">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir {selectedLotteries.size}
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={bulkActivate} className="text-xs h-7">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativar
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkDeactivate} className="text-xs h-7">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Desativar
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkMarkComingSoon} className="text-xs h-7">
                    <Clock className="w-3 h-3 mr-1" />
                    Em Breve
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkDuplicate} className="text-xs h-7">
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicar
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportSelected} className="text-xs h-7">
                    <FileText className="w-3 h-3 mr-1" />
                    Exportar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setBulkActionConfirm("delete")}
                    className="text-xs h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
            isDark 
              ? "bg-bolao-green/10 border border-bolao-green/20"
              : "bg-bolao-green/5 border border-bolao-green/20"
          }`}>
            <CheckCircle className="w-4 h-4 text-bolao-green" />
            <p className="text-sm text-bolao-green">{successMessage}</p>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterTab value="all" label="Todas" count={stats.total} active={filterTab === "all"} />
            <FilterTab value="active" label="Ativas" count={stats.active} active={filterTab === "active"} />
            <FilterTab value="coming" label="Em Breve" count={stats.comingSoon} active={filterTab === "coming"} />
            <FilterTab value="inactive" label="Inativas" count={stats.inactive} active={filterTab === "inactive"} />
          </div>

          <div className="flex-1" />

          {/* View Mode Toggle */}
          <div className={`flex items-center rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === "grid" 
                  ? "bg-bolao-green text-white" 
                  : isDark 
                    ? "text-gray-400 hover:text-white" 
                    : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-bolao-green text-white" 
                  : isDark 
                    ? "text-gray-400 hover:text-white" 
                    : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
              isDark 
                ? "bg-[#0A0E14] border-[#1C2432] text-white"
                : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          >
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="status">Por Status</option>
            <option value="created-asc">Mais Antigos</option>
            <option value="created-desc">Mais Recentes</option>
          </select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`text-xs ${showAdvancedFilters ? "border-bolao-green text-bolao-green" : ""}`}
          >
            <Filter className="w-3 h-3 mr-1" />
            Filtros
            {(filterColor || filterMinCost || filterMaxCost) && (
              <Badge className="ml-1 bg-bolao-green/20 text-bolao-green text-[10px]">
                {[filterColor, filterMinCost, filterMaxCost].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className={`mb-4 p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                Filtros Avançados
              </h4>
              <button
                onClick={clearAdvancedFilters}
                className={`text-xs hover:underline ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Limpar filtros
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Color Filter */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Cor
                </label>
                <select
                  value={filterColor || ""}
                  onChange={(e) => setFilterColor(e.target.value || null)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                    isDark 
                      ? "bg-[#111827] border-[#1C2432] text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="">Todas as cores</option>
                  <option value="violet">Violeta</option>
                  <option value="emerald">Verde</option>
                  <option value="sky">Azul</option>
                  <option value="orange">Laranja</option>
                  <option value="pink">Rosa</option>
                  <option value="amber">Âmbar</option>
                  <option value="cyan">Ciano</option>
                  <option value="rose">Rosé</option>
                </select>
              </div>

              {/* Min Cost Filter */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Custo Mínimo
                </label>
                <input
                  type="number"
                  placeholder="R$ 0"
                  value={filterMinCost || ""}
                  onChange={(e) => setFilterMinCost(e.target.value ? Number(e.target.value) : null)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                    isDark 
                      ? "bg-[#111827] border-[#1C2432] text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Max Cost Filter */}
              <div>
                <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Custo Máximo
                </label>
                <input
                  type="number"
                  placeholder="R$ ∞"
                  value={filterMaxCost || ""}
                  onChange={(e) => setFilterMaxCost(e.target.value ? Number(e.target.value) : null)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                    isDark 
                      ? "bg-[#111827] border-[#1C2432] text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search and Select All */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={selectAll}
            className={`px-3 py-2 text-xs rounded-lg transition-colors ${
              isDark 
                ? "bg-[#1C2432] hover:bg-[#2D3748] text-gray-300"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Selecionar Todas
          </button>
          <div className="flex-1 md:max-w-xs">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              <input
                type="text"
                placeholder="Buscar loteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Lottery Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLotteries.map((lottery) => (
              <LotteryListItem key={lottery.id} lottery={lottery} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredLotteries.length === 0 && (
          <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
            isDark ? "border-[#1C2432]" : "border-gray-200"
          }`}>
            <Clover className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {searchQuery ? "Nenhuma loteria encontrada" : "Nenhuma loteria nesta categoria"}
            </p>
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {searchQuery ? "Tente outro termo de busca" : "Adicione uma nova loteria ou mude o filtro"}
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className={`mt-4 p-3 rounded-lg border flex items-start gap-3 ${
          isDark 
            ? "bg-bolao-green/5 border-bolao-green/20"
            : "bg-bolao-green/5 border-bolao-green/20"
        }`}>
          <Info className="w-4 h-4 text-bolao-green mt-0.5 flex-shrink-0" />
          <div>
            <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              <strong>Dica:</strong> Antes de ativar uma nova loteria, certifique-se de que a página correspondente 
              (<code className="text-bolao-green">/slug</code>) foi criada. Loterias "Em Breve" aparecem no menu 
              com indicação visual, preparando os usuários para o lançamento.
            </p>
          </div>
        </div>

        {/* Edit Modal */}
        <LotteryEditorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lottery={editingLottery as ExtendedLotteryConfig | null}
          isNew={isNewLottery}
          onSave={(lottery) => saveLottery(lottery as LotteryConfig)}
          onDelete={deleteLottery}
        />
      </Card>
    </AdminLayout>
  );
};

export default AdminLoterias;
