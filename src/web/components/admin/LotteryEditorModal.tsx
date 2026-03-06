import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getAllLotteries,
  colorClasses,
  type LotteryConfig,
} from "@/services/lotteryService";
import {
  X,
  Save,
  Trash2,
  Copy,
  Circle,
  Clover,
  Star,
  Clock,
  Gem,
  Dices,
  Hash,
  Layers,
  Palette,
  Settings,
  Eye,
  Calendar,
  Globe,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
} from "lucide-react";

// Extended lottery config with additional fields
export interface ExtendedLotteryConfig extends LotteryConfig {
  drawDays?: string[];
  drawTime?: string;
  numberRange?: string;
  numbersToPick?: number;
  minBet?: number;
  maxBet?: number;
  prizeEstimate?: number;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  displayInMenu?: boolean;
}

// Lottery Icon Map
const lotteryIconMap: Record<string, React.ElementType> = {
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

interface LotteryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lottery: ExtendedLotteryConfig | null;
  isNew: boolean;
  onSave: (lottery: ExtendedLotteryConfig) => void;
  onDelete?: (lotteryId: string) => void;
}

const LotteryEditorModal = ({
  isOpen,
  onClose,
  lottery,
  isNew,
  onSave,
  onDelete,
}: LotteryEditorModalProps) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"basic" | "visual" | "status" | "specs" | "seo">("basic");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const allLotteries = getAllLotteries();

  // Form state
  const [formData, setFormData] = useState<ExtendedLotteryConfig>(
    lottery || {
      id: `lottery-${Date.now()}`,
      name: "",
      slug: "",
      color: "#00C853",
      colorName: "emerald",
      icon: "clover",
      active: false,
      comingSoon: true,
      description: "",
      route: "/",
      drawDays: [],
      drawTime: "20:00",
      numberRange: "1-60",
      numbersToPick: 6,
      minBet: 5,
      maxBet: 5000,
      prizeEstimate: 0,
      featured: false,
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      displayInMenu: true,
    }
  );

  // Reset form when lottery changes
  useEffect(() => {
    if (lottery) {
      setFormData({
        ...lottery,
        drawDays: lottery.drawDays || [],
        drawTime: lottery.drawTime || "20:00",
        numberRange: lottery.numberRange || "1-60",
        numbersToPick: lottery.numbersToPick || 6,
        minBet: lottery.minBet || 5,
        maxBet: lottery.maxBet || 5000,
        prizeEstimate: lottery.prizeEstimate || 0,
        featured: lottery.featured || false,
        metaTitle: lottery.metaTitle || "",
        metaDescription: lottery.metaDescription || "",
        keywords: lottery.keywords || [],
        displayInMenu: lottery.displayInMenu !== false,
      });
    } else if (isNew) {
      setFormData({
        id: `lottery-${Date.now()}`,
        name: "",
        slug: "",
        color: "#00C853",
        colorName: "emerald",
        icon: "clover",
        active: false,
        comingSoon: true,
        description: "",
        route: "/",
        drawDays: [],
        drawTime: "20:00",
        numberRange: "1-60",
        numbersToPick: 6,
        minBet: 5,
        maxBet: 5000,
        prizeEstimate: 0,
        featured: false,
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        displayInMenu: true,
      });
    }
    setActiveTab("basic");
  }, [lottery, isNew, isOpen]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({
      ...formData,
      slug,
      route: `/${slug}`,
    });
  };

  // Check if slug is unique
  const isSlugUnique = (slug: string) => {
    if (!slug) return true;
    return !allLotteries.some(l => l.slug === slug && l.id !== formData.id);
  };

  // Copy template from existing lottery
  const copyFromLottery = (sourceId: string) => {
    const source = allLotteries.find(l => l.id === sourceId);
    if (source) {
      setFormData({
        ...source,
        id: `lottery-${Date.now()}`,
        name: `${source.name} (Cópia)`,
        slug: `${source.slug}-copy`,
        route: `/${source.slug}-copy`,
        active: false,
        comingSoon: true,
      });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (onDelete && lottery) {
      onDelete(lottery.id);
      onClose();
    }
  };

  // Day options
  const dayOptions = [
    { value: "seg", label: "Seg" },
    { value: "ter", label: "Ter" },
    { value: "qua", label: "Qua" },
    { value: "qui", label: "Qui" },
    { value: "sex", label: "Sex" },
    { value: "sab", label: "Sáb" },
    { value: "dom", label: "Dom" },
  ];

  // Color options
  const colorOptions: Array<{ value: LotteryConfig["colorName"]; label: string; hex: string }> = [
    { value: "violet", label: "Violeta", hex: "#8B5CF6" },
    { value: "emerald", label: "Esmeralda", hex: "#10B981" },
    { value: "sky", label: "Azul Céu", hex: "#0EA5E9" },
    { value: "orange", label: "Laranja", hex: "#F97316" },
    { value: "pink", label: "Rosa", hex: "#EC4899" },
    { value: "amber", label: "Âmbar", hex: "#F59E0B" },
    { value: "cyan", label: "Ciano", hex: "#06B6D4" },
    { value: "rose", label: "Rosé", hex: "#F43F5E" },
  ];

  // Icon options
  const iconOptions: Array<{ value: LotteryConfig["icon"]; label: string }> = [
    { value: "circle", label: "Círculo" },
    { value: "clover", label: "Trevo" },
    { value: "star", label: "Estrela" },
    { value: "clock", label: "Relógio" },
    { value: "gem", label: "Gema" },
    { value: "dices", label: "Dados" },
    { value: "hash", label: "Hash" },
    { value: "layers", label: "Camadas" },
    { value: "globe", label: "Globo" },
  ];

  // Toggle draw day
  const toggleDrawDay = (day: string) => {
    const days = formData.drawDays || [];
    if (days.includes(day)) {
      setFormData({ ...formData, drawDays: days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, drawDays: [...days, day] });
    }
  };

  // Tab Button Component
  const TabButton = ({ 
    value, 
    label, 
    icon: Icon 
  }: { 
    value: typeof activeTab; 
    label: string; 
    icon: React.ElementType;
  }) => (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
        activeTab === value
          ? "bg-bolao-green text-white"
          : isDark
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  // Input Field Component
  const InputField = ({ 
    label, 
    value, 
    onChange, 
    type = "text",
    placeholder,
    required,
    error,
    hint,
  }: { 
    label: string; 
    value: string | number; 
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    hint?: string;
  }) => (
    <div>
      <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green transition-colors ${
          error 
            ? "border-red-500" 
            : isDark 
              ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
        }`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {hint && !error && <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{hint}</p>}
    </div>
  );

  if (!isOpen) return null;

  const PreviewIcon = lotteryIconMap[formData.icon] || Circle;
  const slugError = !isSlugUnique(formData.slug) ? "Este slug já está em uso" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-xl border shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col ${
        isDark 
          ? "bg-[#111827] border-[#1C2432]"
          : "bg-white border-gray-200"
      }`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-[#1C2432]" : "border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <PreviewIcon className="w-5 h-5" style={{ color: formData.color }} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {isNew ? "Adicionar Nova Loteria" : `Editar ${lottery?.name || "Loteria"}`}
              </h3>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {isNew ? "Configure os detalhes da nova loteria" : `Editando /${formData.slug || "..."}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark 
                ? "hover:bg-[#1C2432] text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-2 border-b overflow-x-auto ${
          isDark ? "border-[#1C2432]" : "border-gray-200"
        }`}>
          <TabButton value="basic" label="Básico" icon={FileText} />
          <TabButton value="visual" label="Visual" icon={Palette} />
          <TabButton value="status" label="Status" icon={Eye} />
          <TabButton value="specs" label="Especificações" icon={Settings} />
          <TabButton value="seo" label="SEO" icon={Globe} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                {/* Template Selector */}
                {isNew && (
                  <div className={`p-3 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Copiar configurações de:
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {allLotteries.slice(0, 5).map(l => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => copyFromLottery(l.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            isDark 
                              ? "border-[#1C2432] hover:border-bolao-green hover:bg-bolao-green/10"
                              : "border-gray-200 hover:border-bolao-green hover:bg-bolao-green/5"
                          }`}
                        >
                          <Copy className="w-3 h-3 inline mr-1" />
                          {l.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <InputField
                  label="Nome da Loteria"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="Ex: Timemania"
                  required
                />

                <InputField
                  label="Slug (URL)"
                  value={formData.slug}
                  onChange={(value) => setFormData({ ...formData, slug: value })}
                  placeholder="timemania (auto-gerado se vazio)"
                  error={slugError}
                  hint="Usado na URL: /slug"
                />

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Sorteios às terças e quintas"
                    rows={2}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>

                <InputField
                  label="Rota"
                  value={formData.route}
                  onChange={(value) => setFormData({ ...formData, route: value })}
                  placeholder="/timemania"
                  hint="Caminho da página da loteria"
                />
              </div>
            )}

            {/* Visual Tab */}
            {activeTab === "visual" && (
              <div className="space-y-4">
                {/* Color Picker */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Cor Principal (Hex)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-12 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:border-bolao-green ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Color Name */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Nome da Cor (Tailwind)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorName: opt.value, color: opt.hex })}
                        className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${
                          formData.colorName === opt.value
                            ? "border-bolao-green ring-2 ring-bolao-green/30"
                            : isDark 
                              ? "border-[#1C2432] hover:border-[#2D3748]"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.hex }} />
                        <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Ícone
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map(opt => {
                      const IconComp = lotteryIconMap[opt.value];
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: opt.value })}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                            formData.icon === opt.value
                              ? "border-bolao-green ring-2 ring-bolao-green/30"
                              : isDark 
                                ? "border-[#1C2432] hover:border-[#2D3748]"
                                : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <IconComp className="w-5 h-5" style={{ color: formData.color }} />
                          <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preview do Card</p>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      <PreviewIcon className="w-7 h-7" style={{ color: formData.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {formData.name || "Nome da Loteria"}
                      </h4>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {formData.description || "Descrição da loteria"}
                      </p>
                    </div>
                    <Badge 
                      className="text-[10px]"
                      style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                    >
                      {formData.colorName}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Status Tab */}
            {activeTab === "status" && (
              <div className="space-y-4">
                {/* Active Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Ativo</p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Loteria disponível para os usuários
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      active: !formData.active,
                      comingSoon: !formData.active ? false : formData.comingSoon
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.active ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      formData.active ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                {/* Coming Soon Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                } ${formData.active ? "opacity-50" : ""}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Em Breve</p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Mostrar como "Em breve" no menu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !formData.active && setFormData({ ...formData, comingSoon: !formData.comingSoon })}
                    disabled={formData.active}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.comingSoon && !formData.active ? "bg-amber-500" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                    } ${formData.active ? "cursor-not-allowed" : ""}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      formData.comingSoon && !formData.active ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                {/* Display in Menu Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Exibir no Menu</p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Mostrar no dropdown de loterias
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, displayInMenu: !formData.displayInMenu })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.displayInMenu !== false ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      formData.displayInMenu !== false ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                {/* Featured Toggle */}
                <div className={`flex items-center justify-between p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Destaque</p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Destacar na homepage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.featured ? "bg-amber-500" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                      formData.featured ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>

                {/* Status Summary */}
                <div className={`p-3 rounded-lg flex items-start gap-3 ${
                  isDark ? "bg-bolao-green/5 border border-bolao-green/20" : "bg-bolao-green/5 border border-bolao-green/20"
                }`}>
                  <Info className="w-4 h-4 text-bolao-green mt-0.5" />
                  <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Status atual: {" "}
                    <strong className={
                      formData.active ? "text-emerald-400" : formData.comingSoon ? "text-amber-400" : "text-gray-400"
                    }>
                      {formData.active ? "Ativo" : formData.comingSoon ? "Em Breve" : "Inativo"}
                    </strong>
                    {formData.featured && <span className="text-amber-400"> • Em Destaque</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Specs Tab */}
            {activeTab === "specs" && (
              <div className="space-y-4">
                {/* Draw Days */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Dias de Sorteio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDrawDay(day.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          (formData.drawDays || []).includes(day.value)
                            ? "bg-bolao-green text-white"
                            : isDark
                              ? "bg-[#0A0E14] border border-[#1C2432] text-gray-400 hover:border-bolao-green"
                              : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-bolao-green"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draw Time */}
                <InputField
                  label="Horário do Sorteio"
                  value={formData.drawTime || ""}
                  onChange={(value) => setFormData({ ...formData, drawTime: value })}
                  type="time"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Number Range */}
                  <InputField
                    label="Faixa de Números"
                    value={formData.numberRange || ""}
                    onChange={(value) => setFormData({ ...formData, numberRange: value })}
                    placeholder="Ex: 1-60"
                    hint="Números disponíveis para aposta"
                  />

                  {/* Numbers to Pick */}
                  <InputField
                    label="Dezenas por Jogo"
                    value={formData.numbersToPick || ""}
                    onChange={(value) => setFormData({ ...formData, numbersToPick: parseInt(value) || 0 })}
                    type="number"
                    placeholder="Ex: 6"
                    hint="Quantidade de dezenas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Min Bet */}
                  <InputField
                    label="Aposta Mínima (R$)"
                    value={formData.minBet || ""}
                    onChange={(value) => setFormData({ ...formData, minBet: parseFloat(value) || 0 })}
                    type="number"
                    placeholder="Ex: 5.00"
                  />

                  {/* Max Bet */}
                  <InputField
                    label="Aposta Máxima (R$)"
                    value={formData.maxBet || ""}
                    onChange={(value) => setFormData({ ...formData, maxBet: parseFloat(value) || 0 })}
                    type="number"
                    placeholder="Ex: 5000.00"
                  />
                </div>

                {/* Prize Estimate */}
                <InputField
                  label="Prêmio Estimado (R$)"
                  value={formData.prizeEstimate || ""}
                  onChange={(value) => setFormData({ ...formData, prizeEstimate: parseFloat(value) || 0 })}
                  type="number"
                  placeholder="Ex: 50000000"
                  hint="Valor médio do prêmio principal"
                />
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <InputField
                  label="Meta Title"
                  value={formData.metaTitle || ""}
                  onChange={(value) => setFormData({ ...formData, metaTitle: value })}
                  placeholder={`Bolões ${formData.name || "Loteria"} | BolãoMax`}
                  hint="Título para SEO (60 caracteres recomendados)"
                />

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Meta Description
                  </label>
                  <textarea
                    value={formData.metaDescription || ""}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder={`Participe dos melhores bolões de ${formData.name || "loteria"} com cotas acessíveis. Aumente suas chances de ganhar!`}
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green resize-none ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {(formData.metaDescription || "").length}/160 caracteres
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Keywords (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={(formData.keywords || []).join(", ")}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k) 
                    })}
                    placeholder="bolão, loteria, sorteio, prêmio"
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>

                {/* SEO Preview */}
                <div className={`p-4 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Preview no Google</p>
                  <div className="space-y-1">
                    <p className="text-blue-500 text-lg hover:underline cursor-pointer">
                      {formData.metaTitle || `Bolões ${formData.name || "Loteria"} | BolãoMax`}
                    </p>
                    <p className="text-sm text-emerald-600">
                      bolaomax.com{formData.route || "/" + (formData.slug || "loteria")}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {formData.metaDescription || `Participe dos melhores bolões de ${formData.name || "loteria"} com cotas acessíveis. Aumente suas chances de ganhar!`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`p-4 border-t flex items-center justify-between ${
            isDark ? "border-[#1C2432]" : "border-gray-200"
          }`}>
            <div>
              {!isNew && onDelete && (
                <>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Confirmar exclusão?</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Excluir Loteria
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-bolao-green hover:bg-bolao-green-dark text-white"
                disabled={!formData.name || !!slugError}
              >
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Criar Loteria" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LotteryEditorModal;
export { LotteryEditorModal };
