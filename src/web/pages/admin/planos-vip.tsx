import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  Eye,
  Edit,
  FileText,
  Settings,
  Plus,
  Minus,
  Check,
  X,
  Award,
  Gem,
  Sparkles,
  Ticket,
  Zap,
  Headphones,
  MessageCircle,
  BarChart3,
  Shield,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  GripVertical,
  Trash2,
  Copy,
  History,
  RotateCcw,
  ExternalLink,
  Monitor,
  Smartphone,
  Calendar,
  Gift,
  Users2,
  ArrowUpDown,
  Target,
  Activity,
  PieChart,
  LineChart,
  Download,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
  EyeOff,
  CircleDollarSign,
} from "lucide-react";

// Plan type definition
interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
  highlight?: boolean;
  category: string;
  icon?: string;
}

interface PlanBoloes {
  lotofacil: number;
  megasena: number;
  quina: number;
  especiais: number;
}

interface Plan {
  id: string;
  name: string;
  icon: string;
  monthlyPrice: number;
  annualPrice: number;
  annualMonthly: number;
  discount: number;
  color: string;
  borderColor: string;
  bgGlow: string;
  textColor: string;
  badge: string | null;
  badgeColor?: string;
  features: PlanFeature[];
  boloes: PlanBoloes;
  status: "active" | "inactive" | "hidden";
  visibility: "public" | "hidden" | "admin-only";
  featured: boolean;
  allowNewSubscriptions: boolean;
  activeSubscribers: number;
  // Advanced settings
  trialDays: number;
  setupFee: number;
  upgradeBonusPercent: number;
  loyaltyMonths: number;
  referralBonus: number;
  cancellationPenalty: number;
}

interface PlanVersion {
  id: string;
  planId: string;
  timestamp: Date;
  adminUser: string;
  changes: { field: string; before: string; after: string }[];
  reason: string;
}

// Initial plans data
const initialPlans: Plan[] = [
  {
    id: "bronze",
    name: "Bronze",
    icon: "award",
    monthlyPrice: 29.90,
    annualPrice: 287.04,
    annualMonthly: 23.92,
    discount: 20,
    color: "from-amber-700 to-amber-900",
    borderColor: "border-amber-700/50",
    bgGlow: "bg-amber-700/20",
    textColor: "text-amber-500",
    badge: null,
    status: "active",
    visibility: "public",
    featured: false,
    allowNewSubscriptions: true,
    activeSubscribers: 892,
    trialDays: 0,
    setupFee: 0,
    upgradeBonusPercent: 10,
    loyaltyMonths: 6,
    referralBonus: 10,
    cancellationPenalty: 20,
    features: [
      { id: "f1", text: "1 bolão Lotofácil por semana", included: true, category: "Bolões" },
      { id: "f2", text: "1 bolão Quina por semana", included: true, category: "Bolões" },
      { id: "f3", text: "0 bolões Mega-Sena", included: false, category: "Bolões" },
      { id: "f4", text: "Jogos especiais", included: false, category: "Exclusivos" },
      { id: "f5", text: "Estratégias básicas", included: true, category: "Estratégias" },
      { id: "f6", text: "Suporte padrão", included: true, category: "Suporte" },
      { id: "f7", text: "Grupo exclusivo", included: false, category: "Exclusivos" },
      { id: "f8", text: "Análises básicas", included: true, category: "Analytics" },
      { id: "f9", text: "Taxa cancelamento: 20%", included: true, highlight: false, category: "Financeiro" },
    ],
    boloes: {
      lotofacil: 1,
      megasena: 0,
      quina: 1,
      especiais: 0,
    }
  },
  {
    id: "prata",
    name: "Prata",
    icon: "gem",
    monthlyPrice: 59.90,
    annualPrice: 574.08,
    annualMonthly: 47.84,
    discount: 20,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/50",
    bgGlow: "bg-cyan-500/20",
    textColor: "text-cyan-400",
    badge: "MAIS POPULAR",
    badgeColor: "bg-cyan-500",
    status: "active",
    visibility: "public",
    featured: true,
    allowNewSubscriptions: true,
    activeSubscribers: 2156,
    trialDays: 7,
    setupFee: 0,
    upgradeBonusPercent: 15,
    loyaltyMonths: 6,
    referralBonus: 20,
    cancellationPenalty: 10,
    features: [
      { id: "f1", text: "2 bolões Lotofácil por semana", included: true, category: "Bolões" },
      { id: "f2", text: "2 bolões Quina por semana", included: true, category: "Bolões" },
      { id: "f3", text: "2 bolões Mega-Sena por semana", included: true, category: "Bolões" },
      { id: "f4", text: "Jogos especiais", included: false, category: "Exclusivos" },
      { id: "f5", text: "Estratégias avançadas", included: true, category: "Estratégias" },
      { id: "f6", text: "Suporte prioritário", included: true, category: "Suporte" },
      { id: "f7", text: "Grupo exclusivo", included: false, category: "Exclusivos" },
      { id: "f8", text: "Análises completas", included: true, category: "Analytics" },
      { id: "f9", text: "Taxa cancelamento: 10%", included: true, highlight: true, category: "Financeiro" },
    ],
    boloes: {
      lotofacil: 2,
      megasena: 2,
      quina: 2,
      especiais: 0,
    }
  },
  {
    id: "ouro",
    name: "Ouro",
    icon: "crown",
    monthlyPrice: 149.90,
    annualPrice: 1439.04,
    annualMonthly: 119.92,
    discount: 20,
    color: "from-amber-400 via-yellow-500 to-amber-600",
    borderColor: "border-amber-400/50",
    bgGlow: "bg-amber-400/20",
    textColor: "text-amber-400",
    badge: "CLUBE VIP",
    badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-500",
    status: "active",
    visibility: "public",
    featured: false,
    allowNewSubscriptions: true,
    activeSubscribers: 487,
    trialDays: 14,
    setupFee: 0,
    upgradeBonusPercent: 20,
    loyaltyMonths: 3,
    referralBonus: 50,
    cancellationPenalty: 0,
    features: [
      { id: "f1", text: "12 bolões Lotofácil por semana", included: true, category: "Bolões" },
      { id: "f2", text: "6 bolões Quina por semana", included: true, category: "Bolões" },
      { id: "f3", text: "3 bolões Mega-Sena por semana", included: true, category: "Bolões" },
      { id: "f4", text: "4 jogos especiais por mês", included: true, category: "Exclusivos" },
      { id: "f5", text: "Estratégias premium exclusivas", included: true, category: "Estratégias" },
      { id: "f6", text: "Suporte VIP em até 2h", included: true, category: "Suporte" },
      { id: "f7", text: "Grupo VIP Telegram/WhatsApp", included: true, category: "Exclusivos" },
      { id: "f8", text: "Análises avançadas com IA", included: true, category: "Analytics" },
      { id: "f9", text: "Taxa cancelamento: ISENTO", included: true, highlight: true, category: "Financeiro" },
    ],
    boloes: {
      lotofacil: 12,
      megasena: 3,
      quina: 6,
      especiais: 4,
    }
  },
  {
    id: "diamante",
    name: "💎 Diamante",
    icon: "gem",
    monthlyPrice: 249.90,
    annualPrice: 2399.04,
    annualMonthly: 199.92,
    discount: 20,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/50",
    bgGlow: "bg-violet-500/20",
    textColor: "text-violet-400",
    badge: "AVANÇADO",
    badgeColor: "bg-gradient-to-r from-violet-500 to-purple-500",
    status: "active",
    visibility: "public",
    featured: false,
    allowNewSubscriptions: true,
    activeSubscribers: 287,
    trialDays: 14,
    setupFee: 0,
    upgradeBonusPercent: 25,
    loyaltyMonths: 3,
    referralBonus: 75,
    cancellationPenalty: 0,
    features: [
      { id: "f1", text: "20 bolões Lotofácil por semana", included: true, category: "Bolões" },
      { id: "f2", text: "10 bolões Quina por semana", included: true, category: "Bolões" },
      { id: "f3", text: "5 bolões Mega-Sena por semana", included: true, category: "Bolões" },
      { id: "f4", text: "6 jogos especiais por mês", included: true, category: "Exclusivos" },
      { id: "f5", text: "IA avançada (modelos preditivos + filtros estatísticos)", included: true, category: "Estratégias" },
      { id: "f6", text: "Relatórios semanais detalhados", included: true, category: "Analytics" },
      { id: "f7", text: "Grupo Diamante exclusivo (Telegram)", included: true, category: "Exclusivos" },
      { id: "f8", text: "Suporte prioritário (até 1h)", included: true, category: "Suporte" },
      { id: "f9", text: "Taxa cancelamento: ISENTO", included: true, highlight: true, category: "Financeiro" },
      { id: "f10", text: "Grupo limitado (até 150 assinantes)", included: true, category: "Exclusivos" },
    ],
    boloes: {
      lotofacil: 20,
      megasena: 5,
      quina: 10,
      especiais: 6,
    }
  },
  {
    id: "rubi",
    name: "🔮 Rubi",
    icon: "gem",
    monthlyPrice: 399.90,
    annualPrice: 3839.04,
    annualMonthly: 319.92,
    discount: 20,
    color: "from-red-500 to-rose-600",
    borderColor: "border-red-500/50",
    bgGlow: "bg-red-500/20",
    textColor: "text-red-400",
    badge: "PREMIUM",
    badgeColor: "bg-gradient-to-r from-red-500 to-rose-500",
    status: "active",
    visibility: "public",
    featured: false,
    allowNewSubscriptions: true,
    activeSubscribers: 142,
    trialDays: 21,
    setupFee: 0,
    upgradeBonusPercent: 30,
    loyaltyMonths: 2,
    referralBonus: 100,
    cancellationPenalty: 0,
    features: [
      { id: "f1", text: "30 bolões Lotofácil por semana", included: true, category: "Bolões" },
      { id: "f2", text: "15 bolões Quina por semana", included: true, category: "Bolões" },
      { id: "f3", text: "8 bolões Mega-Sena por semana", included: true, category: "Bolões" },
      { id: "f4", text: "10 jogos especiais por mês", included: true, category: "Exclusivos" },
      { id: "f5", text: "IA premium exclusiva", included: true, category: "Estratégias" },
      { id: "f6", text: "Análises probabilísticas + simulações", included: true, category: "Analytics" },
      { id: "f7", text: "Conteúdos estratégicos semanais (PDF/vídeo)", included: true, category: "Estratégias" },
      { id: "f8", text: "Grupo Rubi VIP (Telegram + WhatsApp)", included: true, category: "Exclusivos" },
      { id: "f9", text: "Suporte VIP (até 30 min)", included: true, category: "Suporte" },
      { id: "f10", text: "Taxa cancelamento: ISENTO", included: true, highlight: true, category: "Financeiro" },
      { id: "f11", text: "Vagas extremamente limitadas (80 membros)", included: true, category: "Exclusivos" },
    ],
    boloes: {
      lotofacil: 30,
      megasena: 8,
      quina: 15,
      especiais: 10,
    }
  },
  {
    id: "onix",
    name: "🖤 Ônix ELITE",
    icon: "crown",
    monthlyPrice: 699.90,
    annualPrice: 6719.04,
    annualMonthly: 559.92,
    discount: 20,
    color: "from-slate-800 to-black",
    borderColor: "border-slate-700/50",
    bgGlow: "bg-slate-800/20",
    textColor: "text-slate-300",
    badge: "ELITE",
    badgeColor: "bg-gradient-to-r from-slate-600 to-black",
    status: "active",
    visibility: "public",
    featured: false,
    allowNewSubscriptions: true,
    activeSubscribers: 28,
    trialDays: 30,
    setupFee: 0,
    upgradeBonusPercent: 35,
    loyaltyMonths: 1,
    referralBonus: 150,
    cancellationPenalty: 0,
    features: [
      { id: "f1", text: "Bolões diários (Lotofácil, Quina e Mega-Sena)", included: true, category: "Bolões" },
      { id: "f2", text: "Prioridade máxima nos melhores fechamentos", included: true, category: "Bolões" },
      { id: "f3", text: "Jogos especiais ilimitados", included: true, category: "Exclusivos" },
      { id: "f4", text: "IA dedicada (modelos exclusivos Ônix)", included: true, category: "Estratégias" },
      { id: "f5", text: "Dashboard exclusivo com histórico", included: true, category: "Analytics" },
      { id: "f6", text: "Consultoria estratégica mensal (grupo fechado)", included: true, category: "Estratégias" },
      { id: "f7", text: "Grupo ultra exclusivo (máx. 30 membros)", included: true, category: "Exclusivos" },
      { id: "f8", text: "Suporte imediato 24/7", included: true, category: "Suporte" },
      { id: "f9", text: "Status ELITE no site", included: true, highlight: true, category: "Exclusivos" },
      { id: "f10", text: "Taxa cancelamento: ISENTO", included: true, highlight: true, category: "Financeiro" },
      { id: "f11", text: "Atendimento VIP dedicado", included: true, category: "Suporte" },
    ],
    boloes: {
      lotofacil: 0,
      megasena: 0,
      quina: 0,
      especiais: 0,
    }
  },
];

// Mock version history
const mockVersionHistory: PlanVersion[] = [
  {
    id: "v1",
    planId: "ouro",
    timestamp: new Date(Date.now() - 86400000 * 7),
    adminUser: "admin@bolaomax.com",
    changes: [{ field: "monthlyPrice", before: "129.90", after: "149.90" }],
    reason: "Ajuste de preço para refletir novos benefícios",
  },
  {
    id: "v2",
    planId: "ouro",
    timestamp: new Date(Date.now() - 86400000 * 14),
    adminUser: "admin@bolaomax.com",
    changes: [{ field: "boloes.megasena", before: "2", after: "3" }],
    reason: "Aumento de bolões Mega-Sena",
  },
  {
    id: "v3",
    planId: "prata",
    timestamp: new Date(Date.now() - 86400000 * 21),
    adminUser: "admin@bolaomax.com",
    changes: [{ field: "badge", before: "", after: "MAIS POPULAR" }],
    reason: "Destaque do plano mais vendido",
  },
];

// Feature categories
const featureCategories = [
  { id: "Bolões", icon: Ticket, color: "text-violet-400" },
  { id: "Estratégias", icon: Target, color: "text-blue-400" },
  { id: "Suporte", icon: Headphones, color: "text-green-400" },
  { id: "Exclusivos", icon: Star, color: "text-amber-400" },
  { id: "Financeiro", icon: DollarSign, color: "text-emerald-400" },
  { id: "Analytics", icon: BarChart3, color: "text-cyan-400" },
];

// Feature templates
const featureTemplates = [
  { text: "Bolões Lotofácil por semana", category: "Bolões" },
  { text: "Bolões Mega-Sena por semana", category: "Bolões" },
  { text: "Bolões Quina por semana", category: "Bolões" },
  { text: "Jogos especiais por mês", category: "Exclusivos" },
  { text: "Estratégias básicas", category: "Estratégias" },
  { text: "Estratégias avançadas", category: "Estratégias" },
  { text: "Estratégias premium exclusivas", category: "Estratégias" },
  { text: "Suporte padrão", category: "Suporte" },
  { text: "Suporte prioritário", category: "Suporte" },
  { text: "Suporte VIP em até 2h", category: "Suporte" },
  { text: "Grupo exclusivo Telegram", category: "Exclusivos" },
  { text: "Análises básicas", category: "Analytics" },
  { text: "Análises completas", category: "Analytics" },
  { text: "Análises avançadas com IA", category: "Analytics" },
];

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ElementType> = {
    award: Award,
    gem: Gem,
    crown: Crown,
  };
  return icons[iconName] || Award;
};

export default function AdminPlanosVIP() {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewBilling, setPreviewBilling] = useState<"monthly" | "annual">("monthly");
  const [changeReason, setChangeReason] = useState("");

  // Computed stats
  const totalSubscribers = plans.reduce((acc, plan) => acc + plan.activeSubscribers, 0);
  const mrr = plans.reduce((acc, plan) => acc + (plan.activeSubscribers * plan.monthlyPrice), 0);
  const activePlans = plans.filter(p => p.status === "active").length;
  const conversionRate = 23.4; // Mock value

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan, features: [...plan.features], boloes: { ...plan.boloes } });
    setSelectedPlan(plan);
    setActiveTab("info");
    setIsEditModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!editingPlan) return;
    setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
    setIsEditModalOpen(false);
    setEditingPlan(null);
    setChangeReason("");
  };

  const handleToggleStatus = (planId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return { ...p, status: p.status === "active" ? "inactive" : "active" };
      }
      return p;
    }));
  };

  const handleToggleFeatured = (planId: string) => {
    setPlans(plans.map(p => ({
      ...p,
      featured: p.id === planId ? !p.featured : p.featured,
    })));
  };

  const handleToggleNewSubscriptions = (planId: string) => {
    setPlans(plans.map(p => {
      if (p.id === planId) {
        return { ...p, allowNewSubscriptions: !p.allowNewSubscriptions };
      }
      return p;
    }));
  };

  const handleAddFeature = () => {
    if (!editingPlan) return;
    const newFeature: PlanFeature = {
      id: `f${Date.now()}`,
      text: "Novo recurso",
      included: true,
      category: "Exclusivos",
    };
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeature],
    });
  };

  const handleRemoveFeature = (featureId: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter(f => f.id !== featureId),
    });
  };

  const handleFeatureChange = (featureId: string, field: keyof PlanFeature, value: any) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.map(f =>
        f.id === featureId ? { ...f, [field]: value } : f
      ),
    });
  };

  const handleBoloesChange = (type: keyof PlanBoloes, delta: number) => {
    if (!editingPlan) return;
    const newValue = Math.max(0, editingPlan.boloes[type] + delta);
    setEditingPlan({
      ...editingPlan,
      boloes: { ...editingPlan.boloes, [type]: newValue },
    });
  };

  // Stats Cards Component
  const StatsCard = ({ icon: Icon, label, value, change, color }: { icon: React.ElementType; label: string; value: string; change?: string; color: string }) => (
    <Card className={`p-5 ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
          {change && (
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Card>
  );

  // Plan Card Component
  const PlanCard = ({ plan }: { plan: Plan }) => {
    const IconComponent = getIconComponent(plan.icon);
    return (
      <Card className={`relative overflow-hidden ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"} ${plan.status === "inactive" ? "opacity-60" : ""}`}>
        {plan.badge && (
          <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${plan.badgeColor || "bg-bolao-green"} rounded-bl-lg`}>
            {plan.badge}
          </div>
        )}
        {plan.featured && (
          <div className="absolute top-0 left-0 px-2 py-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.color}`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {plan.activeSubscribers.toLocaleString()} assinantes
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mensal</span>
              <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>R$ {plan.monthlyPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Anual</span>
              <span className={`font-bold text-green-500`}>R$ {plan.annualMonthly.toFixed(2)}/mês</span>
            </div>
            <div className={`flex justify-between items-center pt-2 border-t ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <span className={`text-xs ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>Crédito (60%)</span>
              <span className={`font-bold text-cyan-400`}>R$ {(plan.monthlyPrice * 0.6).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={plan.status === "active" ? "default" : "secondary"} className={plan.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}>
              {plan.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
            <Badge variant="outline" className={`${isDark ? "border-[#1C2432]" : ""}`}>
              {plan.features.length} recursos
            </Badge>
            {!plan.allowNewSubscriptions && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                Fechado
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-black/20 mb-4">
            <div className="text-center">
              <p className="text-lg font-bold text-violet-400">{plan.boloes.lotofacil}</p>
              <p className="text-[10px] text-gray-400">Lotofácil</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{plan.boloes.megasena}</p>
              <p className="text-[10px] text-gray-400">Mega</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{plan.boloes.quina}</p>
              <p className="text-[10px] text-gray-400">Quina</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-400">{plan.boloes.especiais}</p>
              <p className="text-[10px] text-gray-400">Especiais</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-black"
              onClick={() => handleEditPlan(plan)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={isDark ? "border-[#1C2432]" : ""}
              onClick={() => handleToggleStatus(plan.id)}
            >
              {plan.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={isDark ? "border-[#1C2432]" : ""}
              onClick={() => {
                setSelectedPlan(plan);
                setIsHistoryModalOpen(true);
              }}
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Edit Modal Tabs
  const renderEditModalContent = () => {
    if (!editingPlan) return null;

    switch (activeTab) {
      case "info":
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Nome do Plano</label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Status</label>
                <select
                  value={editingPlan.status}
                  onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="hidden">Oculto</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Visibilidade</label>
                <select
                  value={editingPlan.visibility}
                  onChange={(e) => setEditingPlan({ ...editingPlan, visibility: e.target.value as any })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                >
                  <option value="public">Público</option>
                  <option value="hidden">Oculto</option>
                  <option value="admin-only">Apenas Admin</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#1C2432]">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Em Destaque</span>
                <button
                  onClick={() => setEditingPlan({ ...editingPlan, featured: !editingPlan.featured })}
                  className={`p-1 rounded-full transition-colors ${editingPlan.featured ? "bg-amber-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
                >
                  {editingPlan.featured ? <ToggleRight className="w-6 h-6 text-white" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#1C2432]">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Novas Assinaturas</span>
                <button
                  onClick={() => setEditingPlan({ ...editingPlan, allowNewSubscriptions: !editingPlan.allowNewSubscriptions })}
                  className={`p-1 rounded-full transition-colors ${editingPlan.allowNewSubscriptions ? "bg-green-500" : isDark ? "bg-gray-700" : "bg-gray-300"}`}
                >
                  {editingPlan.allowNewSubscriptions ? <Unlock className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6" />}
                </button>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Badge</label>
              <input
                type="text"
                value={editingPlan.badge || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value || null })}
                placeholder="Ex: MAIS POPULAR, CLUBE VIP"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
              />
            </div>
          </div>
        );
      
      case "prices":
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Preço Mensal (R$)</label>
              <input
                type="number"
                step="0.01"
                value={editingPlan.monthlyPrice}
                onChange={(e) => {
                  const monthly = parseFloat(e.target.value) || 0;
                  const discount = editingPlan.discount;
                  const annualMonthly = monthly * (1 - discount / 100);
                  const annualPrice = annualMonthly * 12;
                  setEditingPlan({ ...editingPlan, monthlyPrice: monthly, annualMonthly, annualPrice });
                }}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Desconto Anual (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={editingPlan.discount}
                onChange={(e) => {
                  const discount = parseInt(e.target.value) || 0;
                  const annualMonthly = editingPlan.monthlyPrice * (1 - discount / 100);
                  const annualPrice = annualMonthly * 12;
                  setEditingPlan({ ...editingPlan, discount, annualMonthly, annualPrice });
                }}
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
              />
            </div>
            <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <h4 className={`font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Pré-visualização</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mensal</p>
                  <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>R$ {editingPlan.monthlyPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Anual (por mês)</p>
                  <p className="text-xl font-bold text-green-500">R$ {editingPlan.annualMonthly.toFixed(2)}</p>
                  <p className="text-xs text-green-500">Economia de {editingPlan.discount}%</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#1C2432]">
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Anual</p>
                <p className="text-lg font-bold text-green-500">R$ {editingPlan.annualPrice.toFixed(2)}</p>
              </div>
              <div className={`mt-3 pt-3 border-t ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                  <CircleDollarSign className="w-4 h-4 inline mr-1" />
                  Crédito Disponibilizado (60%)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mensal</p>
                    <p className="text-lg font-bold text-cyan-400">R$ {(editingPlan.monthlyPrice * 0.6).toFixed(2)}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDark ? "bg-amber-500/10" : "bg-amber-50"}`}>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Taxa (40%)</p>
                    <p className="text-lg font-bold text-amber-400">R$ {(editingPlan.monthlyPrice * 0.4).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case "boloes":
        return (
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Configure a quantidade de bolões por tipo que o assinante recebe semanalmente.</p>
            
            {[
              { key: "lotofacil", label: "Lotofácil / semana", color: "violet" },
              { key: "megasena", label: "Mega-Sena / semana", color: "green" },
              { key: "quina", label: "Quina / semana", color: "blue" },
              { key: "especiais", label: "Jogos Especiais / mês", color: "amber" },
            ].map(({ key, label, color }) => (
              <div key={key} className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>{label}</span>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className={isDark ? "border-[#1C2432]" : ""}
                    onClick={() => handleBoloesChange(key as keyof PlanBoloes, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className={`text-2xl font-bold w-10 text-center text-${color}-400`}>
                    {editingPlan.boloes[key as keyof PlanBoloes]}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={isDark ? "border-[#1C2432]" : ""}
                    onClick={() => handleBoloesChange(key as keyof PlanBoloes, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      
      case "features":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Gerencie os recursos e benefícios do plano.</p>
              <Button size="sm" onClick={handleAddFeature} className="bg-bolao-green hover:bg-bolao-green-dark text-black">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {editingPlan.features.map((feature, index) => (
                <div key={feature.id} className={`flex items-center gap-2 p-3 rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                  <button
                    onClick={() => handleFeatureChange(feature.id, "included", !feature.included)}
                    className={`p-1 rounded ${feature.included ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {feature.included ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                  </button>
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => handleFeatureChange(feature.id, "text", e.target.value)}
                    className={`flex-1 px-2 py-1 rounded border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                  />
                  <select
                    value={feature.category}
                    onChange={(e) => handleFeatureChange(feature.id, "category", e.target.value)}
                    className={`px-2 py-1 rounded border text-sm ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                  >
                    {featureCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.id}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleFeatureChange(feature.id, "highlight", !feature.highlight)}
                    className={`p-1 rounded ${feature.highlight ? "text-amber-400" : "text-gray-500"}`}
                  >
                    <Star className={`w-4 h-4 ${feature.highlight ? "fill-amber-400" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleRemoveFeature(feature.id)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className={`p-3 rounded-lg border ${isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-200 bg-gray-50"}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Templates Rápidos</p>
              <div className="flex flex-wrap gap-1">
                {featureTemplates.slice(0, 6).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newFeature: PlanFeature = {
                        id: `f${Date.now()}`,
                        text: template.text,
                        included: true,
                        category: template.category,
                      };
                      setEditingPlan({
                        ...editingPlan,
                        features: [...editingPlan.features, newFeature],
                      });
                    }}
                    className={`px-2 py-1 text-xs rounded border ${isDark ? "border-[#1C2432] hover:border-bolao-green text-gray-400 hover:text-white" : "border-gray-300 hover:border-bolao-green"}`}
                  >
                    + {template.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "advanced":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Gift className="w-4 h-4 inline mr-1" />
                  Período Trial (dias)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingPlan.trialDays}
                  onChange={(e) => setEditingPlan({ ...editingPlan, trialDays: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Taxa Setup (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingPlan.setupFee}
                  onChange={(e) => setEditingPlan({ ...editingPlan, setupFee: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Bônus Upgrade (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editingPlan.upgradeBonusPercent}
                  onChange={(e) => setEditingPlan({ ...editingPlan, upgradeBonusPercent: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  Meses p/ Fidelidade
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingPlan.loyaltyMonths}
                  onChange={(e) => setEditingPlan({ ...editingPlan, loyaltyMonths: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Users className="w-4 h-4 inline mr-1" />
                  Bônus Indicação (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingPlan.referralBonus}
                  onChange={(e) => setEditingPlan({ ...editingPlan, referralBonus: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Percent className="w-4 h-4 inline mr-1" />
                  Taxa Cancelamento (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingPlan.cancellationPenalty}
                  onChange={(e) => setEditingPlan({ ...editingPlan, cancellationPenalty: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
                />
              </div>
            </div>

            <Card className={`p-4 ${isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Configurações Avançadas</p>
                  <p className={`text-xs mt-1 ${isDark ? "text-amber-500/70" : "text-amber-600"}`}>
                    Estas configurações afetam diretamente a experiência do usuário e as métricas financeiras. Revise cuidadosamente antes de salvar.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
      
      case "history":
        return (
          <div className="space-y-4">
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Histórico de alterações deste plano.</p>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {mockVersionHistory
                .filter(v => v.planId === editingPlan.id)
                .map((version, index) => (
                  <div key={version.id} className={`p-4 rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {version.timestamp.toLocaleDateString("pt-BR")} às {version.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{version.adminUser}</span>
                    </div>
                    {version.changes.map((change, idx) => (
                      <div key={idx} className="text-sm mb-2">
                        <span className={isDark ? "text-gray-300" : "text-gray-700"}>{change.field}:</span>
                        <span className="text-red-400 line-through mx-2">{change.before}</span>
                        <span className="text-green-400">{change.after}</span>
                      </div>
                    ))}
                    {version.reason && (
                      <p className={`text-xs italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>"{version.reason}"</p>
                    )}
                    <Button size="sm" variant="outline" className={`mt-2 ${isDark ? "border-[#1C2432]" : ""}`}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                  </div>
                ))}
              {mockVersionHistory.filter(v => v.planId === editingPlan.id).length === 0 && (
                <p className={`text-center py-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Nenhum histórico disponível.</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Gestão de Planos VIP" subtitle="Gerencie os planos de assinatura da plataforma">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={Users}
          label="Total Assinantes VIP"
          value={totalSubscribers.toLocaleString()}
          change="+12% este mês"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatsCard
          icon={CircleDollarSign}
          label="Receita Mensal (MRR)"
          value={`R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change="+8.5% vs anterior"
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          icon={Crown}
          label="Planos Ativos"
          value={activePlans.toString()}
          color="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatsCard
          icon={Target}
          label="Taxa de Conversão"
          value={`${conversionRate}%`}
          change="+2.1% vs anterior"
          color="bg-gradient-to-br from-violet-500 to-violet-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          className="bg-bolao-green hover:bg-bolao-green-dark text-black"
          onClick={() => setIsPreviewModalOpen(true)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Visualizar como Cliente
        </Button>
        <Button 
          variant="outline"
          className={isDark ? "border-[#1C2432]" : ""}
          onClick={() => setIsAnalyticsModalOpen(true)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver Análises
        </Button>
        <Button 
          variant="outline"
          className={isDark ? "border-[#1C2432]" : ""}
          onClick={() => window.open("/clube-vip", "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ir para Página Pública
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Revenue Chart Section */}
      <Card className={`mt-6 p-6 ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Receita por Plano</h3>
          <Button variant="outline" size="sm" className={isDark ? "border-[#1C2432]" : ""}>
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-8 w-full">
            {plans.map((plan) => {
              const IconComponent = getIconComponent(plan.icon);
              const revenue = plan.activeSubscribers * plan.monthlyPrice;
              const percentage = (revenue / mrr) * 100;
              return (
                <div key={plan.id} className="text-center">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${plan.color} mb-3`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <p className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</p>
                  <p className={`text-2xl font-bold ${plan.textColor}`}>
                    R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{percentage.toFixed(1)}% do total</p>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${plan.color} rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Edit Plan Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Editar Plano {editingPlan?.name}
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Configure todos os aspectos do plano de assinatura.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#1C2432] pb-2 mb-4 overflow-x-auto">
            {[
              { id: "info", label: "Informações", icon: FileText },
              { id: "prices", label: "Preços", icon: DollarSign },
              { id: "boloes", label: "Bolões", icon: Ticket },
              { id: "features", label: "Recursos", icon: Star },
              { id: "advanced", label: "Avançado", icon: Settings },
              { id: "history", label: "Histórico", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-bolao-green text-black font-medium"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {renderEditModalContent()}
          </div>

          {/* Save Reason */}
          {activeTab !== "history" && (
            <div className="mt-4 pt-4 border-t border-[#1C2432]">
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Motivo da Alteração (opcional)
              </label>
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ex: Ajuste de preços para Black Friday"
                className={`w-full px-4 py-2 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-300"}`}
              />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className={isDark ? "border-[#1C2432]" : ""}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan} className="bg-bolao-green hover:bg-bolao-green-dark text-black">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className={`max-w-[95vw] max-h-[95vh] overflow-y-auto ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Visualizar como Cliente
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Veja como os planos aparecem para os clientes na página /clube-vip
            </DialogDescription>
          </DialogHeader>

          {/* Preview Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-2 rounded-lg ${previewMode === "desktop" ? "bg-bolao-green text-black" : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-2 rounded-lg ${previewMode === "mobile" ? "bg-bolao-green text-black" : isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewBilling("monthly")}
                className={`px-3 py-1.5 rounded-lg text-sm ${previewBilling === "monthly" ? "bg-bolao-green text-black" : isDark ? "text-gray-400 hover:text-white border border-[#1C2432]" : "text-gray-600 hover:text-gray-900 border border-gray-300"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setPreviewBilling("annual")}
                className={`px-3 py-1.5 rounded-lg text-sm ${previewBilling === "annual" ? "bg-bolao-green text-black" : isDark ? "text-gray-400 hover:text-white border border-[#1C2432]" : "text-gray-600 hover:text-gray-900 border border-gray-300"}`}
              >
                Anual
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-200 bg-gray-50"}`}>
            <div className={`grid gap-8 p-10 ${previewMode === "mobile" ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-3"} auto-rows-fr`}>
              {plans.filter(p => p.status === "active" && p.visibility === "public").map((plan) => {
                const IconComponent = getIconComponent(plan.icon);
                const displayPrice = previewBilling === "monthly" ? plan.monthlyPrice : plan.annualMonthly;
                return (
                  <Card key={plan.id} className={`relative overflow-hidden ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"} ${plan.featured ? "ring-2 ring-bolao-green" : ""} flex flex-col`}>
                    {plan.badge && (
                      <div className={`absolute top-0 right-0 px-3 py-1.5 text-xs font-bold text-white ${plan.badgeColor || "bg-bolao-green"} rounded-bl-lg`}>
                        {plan.badge}
                      </div>
                    )}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${plan.color}`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className={`font-bold text-2xl ${isDark ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                      </div>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                            R$ {displayPrice.toFixed(2)}
                          </span>
                          <span className={`text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>/mês</span>
                        </div>
                        {previewBilling === "annual" && (
                          <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-sm px-3 py-1">
                            -{plan.discount}% de desconto
                          </Badge>
                        )}
                      </div>
                      <ul className="space-y-3 mb-8 flex-grow min-h-[280px]">
                        {plan.features.map((feature) => (
                          <li key={feature.id} className="flex items-start gap-2.5 text-sm leading-relaxed">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={feature.included ? (isDark ? "text-gray-300" : "text-gray-700") : "text-gray-500 line-through"}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <Button className={`w-full py-7 text-lg font-bold bg-gradient-to-r ${plan.color} text-white hover:opacity-90 transition-opacity`}>
                        Assinar Agora
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)} className={isDark ? "border-[#1C2432]" : ""}>
              Fechar
            </Button>
            <Button onClick={() => window.open("/clube-vip", "_blank")} className="bg-bolao-green hover:bg-bolao-green-dark text-black">
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Página Pública
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Análises de Planos VIP
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Métricas e insights sobre os planos de assinatura.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>LTV Médio</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>R$ 847,50</p>
                <p className="text-xs text-green-500">+15% vs anterior</p>
              </Card>
              <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Churn Rate</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>2.3%</p>
                <p className="text-xs text-green-500">-0.5% vs anterior</p>
              </Card>
              <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>ARPU</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>R$ 68,40</p>
                <p className="text-xs text-green-500">+8% vs anterior</p>
              </Card>
              <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Upgrades/mês</p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>156</p>
                <p className="text-xs text-green-500">+23 vs anterior</p>
              </Card>
            </div>

            {/* Subscriber Growth Chart Placeholder */}
            <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <h4 className={`font-medium mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Crescimento de Assinantes</h4>
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Gráfico de crescimento mensal</p>
                </div>
              </div>
            </Card>

            {/* Plan Distribution */}
            <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <h4 className={`font-medium mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Distribuição por Plano</h4>
              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const percentage = (plan.activeSubscribers / totalSubscribers) * 100;
                  return (
                    <div key={plan.id} className="text-center">
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{plan.name}</p>
                      <p className={`text-2xl font-bold ${plan.textColor}`}>{percentage.toFixed(1)}%</p>
                      <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {plan.activeSubscribers.toLocaleString()} assinantes
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Conversion Funnel */}
            <Card className={`p-4 ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
              <h4 className={`font-medium mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Funil de Conversão</h4>
              <div className="space-y-3">
                {[
                  { label: "Visitantes /clube-vip", value: 12450, percentage: 100 },
                  { label: "Clicaram em plano", value: 4890, percentage: 39.3 },
                  { label: "Iniciaram checkout", value: 1856, percentage: 14.9 },
                  { label: "Concluíram assinatura", value: 892, percentage: 7.2 },
                ].map((step, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{step.label}</span>
                      <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        {step.value.toLocaleString()} ({step.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-bolao-green to-bolao-green-light rounded-full"
                        style={{ width: `${step.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => setIsAnalyticsModalOpen(false)} className="bg-bolao-green hover:bg-bolao-green-dark text-black">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Histórico de Alterações - {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription className={isDark ? "text-gray-400" : "text-gray-500"}>
              Visualize e restaure versões anteriores do plano.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {mockVersionHistory
              .filter(v => v.planId === selectedPlan?.id)
              .map((version) => (
                <div key={version.id} className={`p-4 rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {version.timestamp.toLocaleDateString("pt-BR")} às {version.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{version.adminUser}</span>
                  </div>
                  {version.changes.map((change, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm mb-2">
                      <span className={isDark ? "text-gray-400" : "text-gray-500"}>{change.field}:</span>
                      <span className="text-red-400 line-through">{change.before || "(vazio)"}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                      <span className="text-green-400">{change.after}</span>
                    </div>
                  ))}
                  {version.reason && (
                    <p className={`text-xs italic mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      <MessageCircle className="w-3 h-3 inline mr-1" />
                      {version.reason}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                    <Button size="sm" variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
                      <Copy className="w-3 h-3 mr-1" />
                      Comparar
                    </Button>
                  </div>
                </div>
              ))}
            {mockVersionHistory.filter(v => v.planId === selectedPlan?.id).length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>Nenhum histórico disponível para este plano.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsHistoryModalOpen(false)} className={isDark ? "border-[#1C2432]" : ""}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
