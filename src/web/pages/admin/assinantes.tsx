import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Mail,
  Award,
  Gem,
  Star,
  ChevronDown,
  Eye,
  Ban,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  CircleDot,
  Target,
  Zap,
  Power,
  AlertTriangle,
  Bell,
  ToggleLeft,
  ToggleRight,
  Play,
  Pause,
  UserCheck,
  UserX,
  UserMinus,
  AlertCircle,
  History,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Extended status type for subscription management
type SubscriberStatus = "active" | "inactive" | "canceled" | "paused" | "expired";
type PaymentStatus = "paid" | "pending" | "overdue" | "canceled";

// Status change history entry
interface StatusChangeHistory {
  id: string;
  previousStatus: SubscriberStatus;
  newStatus: SubscriberStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// Extended subscriber interface
interface Subscriber {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: "bronze" | "prata" | "ouro";
  status: SubscriberStatus;
  startDate: string;
  nextPayment: string;
  paymentStatus: PaymentStatus;
  totalSpent: number;
  prizesWon: number;
  boloesParticipated: number;
  subscriptionEndDate?: string;
  isEligibleForDistribution: boolean;
  statusHistory?: StatusChangeHistory[];
}

// Mock subscriber data with extended fields
const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    avatar: "JS",
    plan: "ouro",
    status: "active",
    startDate: "15/01/2025",
    nextPayment: "15/03/2025",
    paymentStatus: "paid",
    totalSpent: 998,
    prizesWon: 2500,
    boloesParticipated: 32,
    subscriptionEndDate: "15/01/2026",
    isEligibleForDistribution: true,
    statusHistory: [
      { id: "h1", previousStatus: "inactive", newStatus: "active", changedBy: "Admin", changedAt: "15/01/2025", reason: "Primeira assinatura" },
    ],
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    avatar: "MS",
    plan: "prata",
    status: "active",
    startDate: "01/12/2024",
    nextPayment: "01/03/2025",
    paymentStatus: "paid",
    totalSpent: 597,
    prizesWon: 850,
    boloesParticipated: 48,
    subscriptionEndDate: "01/12/2025",
    isEligibleForDistribution: true,
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    avatar: "CO",
    plan: "bronze",
    status: "active",
    startDate: "20/02/2025",
    nextPayment: "20/03/2025",
    paymentStatus: "pending",
    totalSpent: 79,
    prizesWon: 0,
    boloesParticipated: 6,
    subscriptionEndDate: "20/02/2026",
    isEligibleForDistribution: false, // Payment pending
  },
  {
    id: "4",
    name: "Ana Paula Ferreira",
    email: "ana.ferreira@email.com",
    avatar: "AF",
    plan: "prata",
    status: "paused",
    startDate: "10/10/2024",
    nextPayment: "10/01/2025",
    paymentStatus: "overdue",
    totalSpent: 398,
    prizesWon: 1200,
    boloesParticipated: 28,
    subscriptionEndDate: "10/10/2025",
    isEligibleForDistribution: false,
    statusHistory: [
      { id: "h2", previousStatus: "active", newStatus: "paused", changedBy: "Sistema", changedAt: "10/01/2025", reason: "Pagamento atrasado" },
    ],
  },
  {
    id: "5",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    avatar: "PC",
    plan: "ouro",
    status: "active",
    startDate: "05/01/2025",
    nextPayment: "05/03/2025",
    paymentStatus: "paid",
    totalSpent: 499,
    prizesWon: 3800,
    boloesParticipated: 24,
    subscriptionEndDate: "05/01/2026",
    isEligibleForDistribution: true,
  },
  {
    id: "6",
    name: "Lucia Mendes",
    email: "lucia.mendes@email.com",
    avatar: "LM",
    plan: "bronze",
    status: "canceled",
    startDate: "01/11/2024",
    nextPayment: "—",
    paymentStatus: "canceled",
    totalSpent: 237,
    prizesWon: 150,
    boloesParticipated: 12,
    subscriptionEndDate: "01/02/2025",
    isEligibleForDistribution: false,
    statusHistory: [
      { id: "h3", previousStatus: "active", newStatus: "canceled", changedBy: "Usuário", changedAt: "01/12/2024", reason: "Cancelamento solicitado pelo usuário" },
    ],
  },
  {
    id: "7",
    name: "Roberto Almeida",
    email: "roberto.almeida@email.com",
    avatar: "RA",
    plan: "prata",
    status: "active",
    startDate: "15/12/2024",
    nextPayment: "15/03/2025",
    paymentStatus: "paid",
    totalSpent: 398,
    prizesWon: 650,
    boloesParticipated: 36,
    subscriptionEndDate: "15/12/2025",
    isEligibleForDistribution: true,
  },
  {
    id: "8",
    name: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    avatar: "FL",
    plan: "ouro",
    status: "active",
    startDate: "01/02/2025",
    nextPayment: "01/04/2025",
    paymentStatus: "paid",
    totalSpent: 499,
    prizesWon: 1850,
    boloesParticipated: 18,
    subscriptionEndDate: "01/02/2026",
    isEligibleForDistribution: true,
  },
  {
    id: "9",
    name: "Ricardo Santos",
    email: "ricardo.santos@email.com",
    avatar: "RS",
    plan: "bronze",
    status: "expired",
    startDate: "15/11/2024",
    nextPayment: "—",
    paymentStatus: "canceled",
    totalSpent: 158,
    prizesWon: 0,
    boloesParticipated: 8,
    subscriptionEndDate: "15/01/2025",
    isEligibleForDistribution: false,
    statusHistory: [
      { id: "h4", previousStatus: "active", newStatus: "expired", changedBy: "Sistema", changedAt: "15/01/2025", reason: "Período de assinatura expirado" },
    ],
  },
  {
    id: "10",
    name: "Mariana Costa",
    email: "mariana.costa@email.com",
    avatar: "MC",
    plan: "prata",
    status: "paused",
    startDate: "01/01/2025",
    nextPayment: "01/02/2025",
    paymentStatus: "overdue",
    totalSpent: 199,
    prizesWon: 350,
    boloesParticipated: 14,
    subscriptionEndDate: "01/01/2026",
    isEligibleForDistribution: false,
    statusHistory: [
      { id: "h5", previousStatus: "active", newStatus: "paused", changedBy: "Admin", changedAt: "05/02/2025", reason: "Pausa solicitada pelo usuário" },
    ],
  },
];

// Mock special games for Gold subscribers
const mockSpecialGames = [
  {
    id: "1",
    lotteryType: "megasena" as const,
    name: "Mega da Virada Exclusivo",
    drawNumber: 2810,
    dezenas: 12,
    strategy: "Balanceada",
    condition: "accumulated" as const,
    status: "scheduled" as const,
    scheduledDate: "31/12/2025",
    goldSubscribersDelivered: 4,
    totalGoldSubscribers: 4,
  },
  {
    id: "2",
    lotteryType: "lotofacil" as const,
    name: "Lotofácil Final Zero",
    drawNumber: 3250,
    dezenas: 18,
    strategy: "Alta Recorrência",
    condition: "final_zero" as const,
    status: "delivered" as const,
    scheduledDate: "20/02/2025",
    goldSubscribersDelivered: 4,
    totalGoldSubscribers: 4,
  },
  {
    id: "3",
    lotteryType: "quina" as const,
    name: "Quina Acumulada Especial",
    drawNumber: 6580,
    dezenas: 10,
    strategy: "Baixa Recorrência",
    condition: "accumulated" as const,
    status: "scheduled" as const,
    scheduledDate: "25/02/2025",
    goldSubscribersDelivered: 0,
    totalGoldSubscribers: 4,
  },
];

const AdminAssinantes = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "bronze" | "prata" | "ouro">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriberStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [eligibilityFilter, setEligibilityFilter] = useState<"all" | "eligible" | "not_eligible">("all");
  
  // Subscriber management state
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [subscriberToChange, setSubscriberToChange] = useState<Subscriber | null>(null);
  const [newStatus, setNewStatus] = useState<SubscriberStatus | null>(null);
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSubscriberForHistory, setSelectedSubscriberForHistory] = useState<Subscriber | null>(null);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<SubscriberStatus | null>(null);
  
  // Special games state
  const [showCreateGameModal, setShowCreateGameModal] = useState(false);
  const [specialGames, setSpecialGames] = useState(mockSpecialGames);
  const [newGame, setNewGame] = useState({
    lotteryType: "megasena" as "megasena" | "lotofacil" | "quina",
    name: "",
    drawNumber: "",
    dezenas: 8,
    strategy: "Balanceada",
    condition: "accumulated" as "accumulated" | "final_zero" | "regular",
  });
  
  // Subscription system control state
  const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(true);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [pendingActivation, setPendingActivation] = useState<boolean | null>(null);
  const userThreshold = 100;
  const currentUserCount = 847; // Mock - would come from API

  // Filter subscribers with extended filters
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || sub.paymentStatus === paymentFilter;
    const matchesEligibility = eligibilityFilter === "all" || 
      (eligibilityFilter === "eligible" && sub.isEligibleForDistribution) ||
      (eligibilityFilter === "not_eligible" && !sub.isEligibleForDistribution);
    return matchesSearch && matchesPlan && matchesStatus && matchesPayment && matchesEligibility;
  });

  // Calculate extended stats
  const stats = {
    totalSubscribers: subscribers.length,
    bronze: subscribers.filter((s) => s.plan === "bronze").length,
    prata: subscribers.filter((s) => s.plan === "prata").length,
    ouro: subscribers.filter((s) => s.plan === "ouro").length,
    activeSubscribers: subscribers.filter((s) => s.status === "active").length,
    pausedSubscribers: subscribers.filter((s) => s.status === "paused").length,
    canceledSubscribers: subscribers.filter((s) => s.status === "canceled").length,
    expiredSubscribers: subscribers.filter((s) => s.status === "expired").length,
    eligibleForDistribution: subscribers.filter((s) => s.isEligibleForDistribution).length,
    paymentIssues: subscribers.filter((s) => s.paymentStatus === "overdue" || s.paymentStatus === "pending").length,
    monthlyRevenue: subscribers
      .filter((s) => s.status === "active")
      .reduce((acc, s) => {
        if (s.plan === "bronze") return acc + 79;
        if (s.plan === "prata") return acc + 199;
        if (s.plan === "ouro") return acc + 499;
        return acc;
      }, 0),
    churnRate: Math.round((subscribers.filter((s) => s.status === "canceled").length / subscribers.length) * 100),
    totalPrizesDistributed: subscribers.reduce((acc, s) => acc + s.prizesWon, 0),
  };

  // Status change handler
  const handleStatusChange = (subscriber: Subscriber, status: SubscriberStatus) => {
    setSubscriberToChange(subscriber);
    setNewStatus(status);
    setStatusChangeReason("");
    setShowStatusChangeModal(true);
  };

  const confirmStatusChange = () => {
    if (!subscriberToChange || !newStatus) return;
    
    setSubscribers(prev => prev.map(sub => {
      if (sub.id === subscriberToChange.id) {
        const newHistoryEntry: StatusChangeHistory = {
          id: `h${Date.now()}`,
          previousStatus: sub.status,
          newStatus: newStatus,
          changedBy: "Admin",
          changedAt: new Date().toLocaleDateString("pt-BR"),
          reason: statusChangeReason || undefined,
        };
        
        return {
          ...sub,
          status: newStatus,
          isEligibleForDistribution: newStatus === "active" && sub.paymentStatus === "paid",
          statusHistory: [...(sub.statusHistory || []), newHistoryEntry],
        };
      }
      return sub;
    }));
    
    setShowStatusChangeModal(false);
    setSubscriberToChange(null);
    setNewStatus(null);
    setStatusChangeReason("");
  };

  // Bulk action handler
  const handleBulkAction = (action: SubscriberStatus) => {
    if (selectedSubscribers.length === 0) return;
    setBulkAction(action);
    setShowBulkActionModal(true);
  };

  const confirmBulkAction = () => {
    if (!bulkAction) return;
    
    setSubscribers(prev => prev.map(sub => {
      if (selectedSubscribers.includes(sub.id)) {
        const newHistoryEntry: StatusChangeHistory = {
          id: `h${Date.now()}_${sub.id}`,
          previousStatus: sub.status,
          newStatus: bulkAction,
          changedBy: "Admin (em massa)",
          changedAt: new Date().toLocaleDateString("pt-BR"),
          reason: "Ação em massa",
        };
        
        return {
          ...sub,
          status: bulkAction,
          isEligibleForDistribution: bulkAction === "active" && sub.paymentStatus === "paid",
          statusHistory: [...(sub.statusHistory || []), newHistoryEntry],
        };
      }
      return sub;
    }));
    
    setSelectedSubscribers([]);
    setShowBulkActionModal(false);
    setBulkAction(null);
  };

  // Select all visible handler
  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    }
  };

  const getPlanIcon = (plan: "bronze" | "prata" | "ouro") => {
    switch (plan) {
      case "bronze":
        return <Award className="w-4 h-4 text-amber-600" />;
      case "prata":
        return <Gem className="w-4 h-4 text-slate-300" />;
      case "ouro":
        return <Crown className="w-4 h-4 text-amber-400" />;
    }
  };

  const getPlanBadge = (plan: "bronze" | "prata" | "ouro") => {
    switch (plan) {
      case "bronze":
        return <Badge className="bg-amber-700/20 text-amber-500 border-amber-700/30">Bronze</Badge>;
      case "prata":
        return <Badge className="bg-slate-400/20 text-slate-300 border-slate-400/30">Prata</Badge>;
      case "ouro":
        return <Badge className="bg-amber-400/20 text-amber-400 border-amber-400/30">Ouro</Badge>;
    }
  };

  const getStatusBadge = (status: SubscriberStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
            <UserMinus className="w-3 h-3 mr-1" />
            Inativo
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Pause className="w-3 h-3 mr-1" />
            Pausado
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
    }
  };

  const getPaymentBadge = (status: "paid" | "pending" | "overdue" | "canceled") => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Pago</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-300 text-xs">Pendente</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/20 text-red-300 text-xs">Atrasado</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500/20 text-gray-400 text-xs">—</Badge>;
    }
  };

  return (
    <AdminLayout title="Assinantes" subtitle="Gestão de assinantes do Clube Bolão Max">
      {/* Subscription System Control Panel */}
      <Card className={`mb-6 ${
        isSubscriptionEnabled 
          ? isDark 
            ? "bg-gradient-to-r from-emerald-500/10 to-bolao-card border-emerald-500/30" 
            : "bg-emerald-50 border-emerald-200"
          : isDark 
            ? "bg-gradient-to-r from-gray-500/10 to-bolao-card border-gray-500/30" 
            : "bg-gray-50 border-gray-200"
      }`}>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isSubscriptionEnabled 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-gray-500/20 border border-gray-500/30"
              }`}>
                <Power className={`w-6 h-6 ${isSubscriptionEnabled ? "text-emerald-400" : "text-gray-400"}`} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Sistema de Assinaturas
                  </h3>
                  <Badge className={`${
                    isSubscriptionEnabled 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}>
                    {isSubscriptionEnabled ? "ATIVO" : "DESATIVADO"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSubscriptionEnabled 
                    ? "O sistema de assinaturas está ativo e visível para os usuários" 
                    : "O sistema está desativado - a aba Minha Assinatura está oculta"
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Threshold Status */}
              <div className={`px-4 py-2 rounded-lg ${
                currentUserCount >= userThreshold 
                  ? isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-100"
                  : isDark ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-100"
              }`}>
                <p className="text-xs text-muted-foreground">Usuários Cadastrados</p>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    currentUserCount >= userThreshold ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {currentUserCount}
                  </span>
                  <span className="text-xs text-muted-foreground">/ {userThreshold} mín.</span>
                  {currentUserCount >= userThreshold ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => {
                  setPendingActivation(!isSubscriptionEnabled);
                  setShowActivationModal(true);
                }}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors ${
                  isSubscriptionEnabled 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                <span
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                    isSubscriptionEnabled ? "translate-x-[52px]" : "translate-x-1"
                  }`}
                />
                <span className={`absolute ${isSubscriptionEnabled ? "left-2" : "right-2"} text-white text-xs font-bold`}>
                  {isSubscriptionEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Subscribers */}
        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-violet-500/20" : "bg-violet-100"}`}>
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <span className="text-xs text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </span>
          </div>
          <p className={`text-sm ${isDark ? "text-muted-foreground" : "text-gray-500"}`}>Total Assinantes</p>
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.totalSubscribers}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs text-amber-500">{stats.bronze} Bronze</span>
            <span className="text-xs text-slate-300">{stats.prata} Prata</span>
            <span className="text-xs text-amber-400">{stats.ouro} Ouro</span>
          </div>
        </Card>

        {/* Monthly Recurring Revenue */}
        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-emerald-500/20" : "bg-emerald-100"}`}>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8%
            </span>
          </div>
          <p className={`text-sm ${isDark ? "text-muted-foreground" : "text-gray-500"}`}>Receita Mensal</p>
          <p className={`text-2xl font-bold text-emerald-400`}>
            R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Assinaturas ativas</p>
        </Card>

        {/* Active vs Inactive */}
        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-sky-500/20" : "bg-sky-100"}`}>
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <p className={`text-sm ${isDark ? "text-muted-foreground" : "text-gray-500"}`}>Assinantes Ativos</p>
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {stats.activeSubscribers}/{stats.totalSubscribers}
          </p>
          <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              style={{ width: `${(stats.activeSubscribers / stats.totalSubscribers) * 100}%` }}
            />
          </div>
        </Card>

        {/* Churn Rate */}
        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-xs text-red-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-1" />
              -2%
            </span>
          </div>
          <p className={`text-sm ${isDark ? "text-muted-foreground" : "text-gray-500"}`}>Taxa de Cancelamento</p>
          <p className={`text-2xl font-bold text-red-400`}>{stats.churnRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className={`p-4 mb-6 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-bolao-dark border-bolao-card-border text-white placeholder:text-muted-foreground"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-bolao-green/50`}
            />
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-bolao-dark border-bolao-card-border text-white"
                : "bg-white border-gray-200 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-bolao-green/50`}
          >
            <option value="all">Todos os Planos</option>
            <option value="bronze">Bronze</option>
            <option value="prata">Prata</option>
            <option value="ouro">Ouro</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-bolao-dark border-bolao-card-border text-white"
                : "bg-white border-gray-200 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-bolao-green/50`}
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="canceled">Cancelados</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
            className={`px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-bolao-dark border-bolao-card-border text-white"
                : "bg-white border-gray-200 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-bolao-green/50`}
          >
            <option value="all">Todos Pagamentos</option>
            <option value="paid">Pagos</option>
            <option value="pending">Pendentes</option>
            <option value="overdue">Atrasados</option>
          </select>

          {/* Export Button */}
          <Button variant="outline" className="border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Subscribers Table */}
      <Card className={`${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? "border-bolao-card-border bg-bolao-dark/50" : "border-gray-200 bg-gray-50"}`}>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Assinante
                </th>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Plano
                </th>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Status
                </th>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Início
                </th>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Próx. Pgto
                </th>
                <th className={`text-left py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Pagamento
                </th>
                <th className={`text-right py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Total Gasto
                </th>
                <th className={`text-right py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Prêmios
                </th>
                <th className={`text-center py-4 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber) => (
                <tr
                  key={subscriber.id}
                  className={`border-b last:border-0 transition-colors ${
                    isDark ? "border-bolao-card-border hover:bg-bolao-dark/30" : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  {/* Subscriber Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          subscriber.plan === "ouro"
                            ? "bg-gradient-to-br from-amber-400/30 to-yellow-500/20 text-amber-400 border border-amber-400/30"
                            : subscriber.plan === "prata"
                            ? "bg-gradient-to-br from-slate-400/30 to-slate-500/20 text-slate-300 border border-slate-400/30"
                            : "bg-gradient-to-br from-amber-700/30 to-amber-800/20 text-amber-500 border border-amber-700/30"
                        }`}
                      >
                        {subscriber.avatar}
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{subscriber.name}</p>
                        <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(subscriber.plan)}
                      {getPlanBadge(subscriber.plan)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">{getStatusBadge(subscriber.status)}</td>

                  {/* Start Date */}
                  <td className="py-4 px-4">
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{subscriber.startDate}</span>
                  </td>

                  {/* Next Payment */}
                  <td className="py-4 px-4">
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{subscriber.nextPayment}</span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-4 px-4">{getPaymentBadge(subscriber.paymentStatus)}</td>

                  {/* Total Spent */}
                  <td className="py-4 px-4 text-right">
                    <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                      R$ {subscriber.totalSpent.toLocaleString("pt-BR")}
                    </span>
                  </td>

                  {/* Prizes Won */}
                  <td className="py-4 px-4 text-right">
                    <span className={`font-medium ${subscriber.prizesWon > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {subscriber.prizesWon > 0 ? `R$ ${subscriber.prizesWon.toLocaleString("pt-BR")}` : "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className={`flex items-center justify-between p-4 border-t ${isDark ? "border-bolao-card-border" : "border-gray-200"}`}>
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredSubscribers.length} de {mockSubscribers.length} assinantes
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Prêmios Distribuídos</h4>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            R$ {stats.totalPrizesDistributed.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total para assinantes</p>
        </Card>

        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Star className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Ticket Médio</h4>
          </div>
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            R$ {Math.round(stats.monthlyRevenue / stats.activeSubscribers).toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Por assinante ativo</p>
        </Card>

        <Card className={`p-5 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Taxa de Retenção</h4>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{100 - stats.churnRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Últimos 90 dias</p>
        </Card>
      </div>

      {/* Jogos Especiais - Plano Ouro Section */}
      <Card className={`mt-6 ${isDark ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/5 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
        <div className="p-6 border-b border-amber-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Jogos Especiais - Plano Ouro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie jogos exclusivos para assinantes Gold
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateGameModal(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-bolao-dark font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Jogo Especial
            </Button>
          </div>
        </div>

        {/* Special Games List */}
        <div className="p-6">
          <div className="space-y-4">
            {specialGames.map((game) => (
              <div 
                key={game.id} 
                className={`p-4 rounded-xl border ${
                  isDark 
                    ? "bg-bolao-dark/50 border-bolao-card-border" 
                    : "bg-white border-gray-200"
                } flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    game.lotteryType === "megasena" ? "bg-emerald-500/20" :
                    game.lotteryType === "lotofacil" ? "bg-violet-500/20" :
                    "bg-sky-500/20"
                  }`}>
                    {game.lotteryType === "megasena" ? <Target className="w-5 h-5 text-emerald-400" /> :
                     game.lotteryType === "lotofacil" ? <CircleDot className="w-5 h-5 text-violet-400" /> :
                     <Star className="w-5 h-5 text-sky-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{game.name}</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Exclusivo Ouro
                      </Badge>
                      {game.condition === "accumulated" && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Acumulado</Badge>
                      )}
                      {game.condition === "final_zero" && (
                        <Badge className="bg-violet-500/20 text-violet-300 text-xs">Final Zero</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Concurso #{game.drawNumber}</span>
                      <span>{game.dezenas} dezenas</span>
                      <span>{game.strategy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Sorteio</p>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{game.scheduledDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Entregue</p>
                    <p className={`font-medium ${game.goldSubscribersDelivered === game.totalGoldSubscribers ? "text-emerald-400" : "text-amber-400"}`}>
                      {game.goldSubscribersDelivered}/{game.totalGoldSubscribers}
                    </p>
                  </div>
                  <Badge className={`${
                    game.status === "delivered" 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {game.status === "delivered" ? "Entregue" : "Agendado"}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Create Special Game Modal */}
      {showCreateGameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className={`w-full max-w-lg m-4 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
            <div className="p-6 border-b border-bolao-card-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Criar Jogo Especial
                  </h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateGameModal(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Lottery Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Loteria</label>
                <select
                  value={newGame.lotteryType}
                  onChange={(e) => setNewGame({ ...newGame, lotteryType: e.target.value as typeof newGame.lotteryType })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-bolao-dark border-bolao-card-border text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="megasena">Mega-Sena</option>
                  <option value="lotofacil">Lotofácil</option>
                  <option value="quina">Quina</option>
                </select>
              </div>

              {/* Game Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Jogo</label>
                <input
                  type="text"
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                  placeholder="Ex: Mega da Virada Exclusivo"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-bolao-dark border-bolao-card-border text-white placeholder:text-muted-foreground"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>

              {/* Draw Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Número do Concurso</label>
                <input
                  type="text"
                  value={newGame.drawNumber}
                  onChange={(e) => setNewGame({ ...newGame, drawNumber: e.target.value })}
                  placeholder="Ex: 2810"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-bolao-dark border-bolao-card-border text-white placeholder:text-muted-foreground"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                />
              </div>

              {/* Dezenas */}
              <div>
                <label className="block text-sm font-medium mb-2">Quantidade de Dezenas: {newGame.dezenas}</label>
                <input
                  type="range"
                  min={newGame.lotteryType === "megasena" ? 7 : newGame.lotteryType === "lotofacil" ? 16 : 6}
                  max={20}
                  value={newGame.dezenas}
                  onChange={(e) => setNewGame({ ...newGame, dezenas: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Strategy */}
              <div>
                <label className="block text-sm font-medium mb-2">Estratégia</label>
                <select
                  value={newGame.strategy}
                  onChange={(e) => setNewGame({ ...newGame, strategy: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-bolao-dark border-bolao-card-border text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="Balanceada">Balanceada</option>
                  <option value="Alta Recorrência">Alta Recorrência</option>
                  <option value="Baixa Recorrência">Baixa Recorrência</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Condição Especial</label>
                <select
                  value={newGame.condition}
                  onChange={(e) => setNewGame({ ...newGame, condition: e.target.value as typeof newGame.condition })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-bolao-dark border-bolao-card-border text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <option value="accumulated">Acumulado</option>
                  <option value="final_zero">Final Zero</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-bolao-card-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateGameModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  // Add new game logic here
                  setShowCreateGameModal(false);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-bolao-dark font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Jogo
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Activation Confirmation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className={`w-full max-w-md m-4 ${isDark ? "bg-bolao-card border-bolao-card-border" : "bg-white border-gray-200"}`}>
            <div className="p-6 border-b border-bolao-card-border">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  pendingActivation 
                    ? "bg-emerald-500/20" 
                    : "bg-amber-500/20"
                }`}>
                  {pendingActivation ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {pendingActivation ? "Ativar Sistema de Assinaturas?" : "Desativar Sistema de Assinaturas?"}
                </h3>
              </div>
            </div>

            <div className="p-6">
              {pendingActivation ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Ao ativar o sistema de assinaturas:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                      <span>A aba "Minha Assinatura" ficará visível para todos os usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-4 h-4 text-sky-400 mt-0.5" />
                      <span>Uma notificação será enviada para todos os {currentUserCount} usuários cadastrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Crown className="w-4 h-4 text-amber-400 mt-0.5" />
                      <span>Os planos Bronze, Prata e Ouro estarão disponíveis para assinatura</span>
                    </li>
                  </ul>
                  
                  {currentUserCount < userThreshold && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-400">Atenção</p>
                          <p className="text-xs text-muted-foreground">
                            O número mínimo recomendado de usuários ({userThreshold}) ainda não foi atingido. 
                            Você pode ativar mesmo assim, mas é recomendado aguardar.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Ao desativar o sistema de assinaturas:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                      <span>A aba "Minha Assinatura" será ocultada para todos os usuários</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-amber-400 mt-0.5" />
                      <span>Assinantes ativos continuarão com acesso até o fim do período pago</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span>Novas assinaturas não serão aceitas</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-bolao-card-border flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowActivationModal(false);
                  setPendingActivation(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (pendingActivation !== null) {
                    setIsSubscriptionEnabled(pendingActivation);
                  }
                  setShowActivationModal(false);
                  setPendingActivation(null);
                }}
                className={`${
                  pendingActivation 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                {pendingActivation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ativar Sistema
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Desativar Sistema
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAssinantes;
