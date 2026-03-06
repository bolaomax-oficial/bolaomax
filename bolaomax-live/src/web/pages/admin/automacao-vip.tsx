import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Bot,
  Play,
  Pause,
  History,
  Users,
  Ticket,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Crown,
  Medal,
  Trophy,
  XCircle,
  Save,
  TestTube,
  Bell,
  Mail,
  Smartphone,
  Globe,
  Shuffle,
  Target,
  Star,
  Sparkles,
  Download,
  Eye,
  RotateCcw,
  Filter,
  BarChart3,
  PieChart,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  AlertTriangle,
  UserX,
  UserCheck,
  UserMinus,
  CircleDot,
  BanIcon,
  CircleDollarSign,
} from "lucide-react";

// Import validation types from VIP automation service
import type { SubscriptionStatus, PaymentStatus } from "@/services/vipAutomationService";

interface DistributionLog {
  id: string;
  date: string;
  time: string;
  plan: "Bronze" | "Prata" | "Ouro";
  subscribersCount: number;
  boloesDistributed: number;
  status: "success" | "error" | "partial";
  errorMessage?: string;
  // New fields for excluded subscribers tracking
  totalSubscribers?: number;
  eligibleSubscribers?: number;
  excludedCount?: number;
  excludedSubscribers?: Array<{
    id: string;
    name: string;
    email: string;
    reason: string;
  }>;
}

interface PlanConfig {
  lotofacil: number;
  megasena: number;
  quina: number;
  selectionCriteria: "random" | "best_odds" | "user_preference";
  strategy: "combined" | "diverse";
  specialGames: boolean;
  prioritySelection: boolean;
  active: boolean;
}

interface NotificationConfig {
  sendImmediately: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  customMessage: string;
}

const AdminAutomacaoVIP = () => {
  const { isDark } = useTheme();
  const [automationActive, setAutomationActive] = useState(true);
  const [scheduleDay, setScheduleDay] = useState("Segunda-feira");
  const [scheduleTime, setScheduleTime] = useState("06:00");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [activeTab, setActiveTab] = useState<"overview" | "config" | "historico">("overview");
  const [distributionMethod, setDistributionMethod] = useState<"equal" | "proportional">("proportional");
  
  // Subscriber filter state
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [includeInactiveInManual, setIncludeInactiveInManual] = useState(false);
  
  // History filters state
  const [historyDateFilter, setHistoryDateFilter] = useState("last30");
  const [historyPlanFilter, setHistoryPlanFilter] = useState("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [selectedDistribution, setSelectedDistribution] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Plan configurations
  const [bronzeConfig, setBronzeConfig] = useState<PlanConfig>({
    lotofacil: 1,
    megasena: 0,
    quina: 0,
    selectionCriteria: "best_odds",
    strategy: "combined",
    specialGames: false,
    prioritySelection: false,
    active: true,
  });
  
  const [prataConfig, setPrataConfig] = useState<PlanConfig>({
    lotofacil: 1,
    megasena: 0,
    quina: 1,
    selectionCriteria: "best_odds",
    strategy: "diverse",
    specialGames: false,
    prioritySelection: false,
    active: true,
  });
  
  const [ouroConfig, setOuroConfig] = useState<PlanConfig>({
    lotofacil: 1,
    megasena: 1,
    quina: 1,
    selectionCriteria: "best_odds",
    strategy: "diverse",
    specialGames: true,
    prioritySelection: true,
    active: true,
  });
  
  // Notification configuration
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    sendImmediately: true,
    channels: {
      inApp: true,
      email: true,
      push: false,
    },
    customMessage: "🎉 Seus bolões da semana estão disponíveis! Acesse sua conta para conferir.",
  });

  // Mock data with subscriber status breakdown
  const subscriberStatus = {
    total: 923,
    ativos: 847,
    inativos: 45,
    cancelados: 23,
    pausados: 8,
  };

  const stats = {
    totalSubscribers: subscriberStatus.total,
    activeSubscribers: subscriberStatus.ativos,
    inactiveSubscribers: subscriberStatus.total - subscriberStatus.ativos,
    boloesToDistribute: 24,
    lastDistribution: "15/01/2025",
    successRate: 98.5,
  };

  // Status breakdown by plan
  const statusByPlan = {
    Ouro: { total: 280, ativos: 234, inativos: 25, cancelados: 15, pausados: 6 },
    Prata: { total: 456, ativos: 412, inativos: 28, cancelados: 12, pausados: 4 },
    Bronze: { total: 187, ativos: 201, inativos: 12, cancelados: 6, pausados: 2 },
  };

  // State for showing excluded subscribers modal
  const [showExcludedModal, setShowExcludedModal] = useState(false);
  const [selectedLogForExcluded, setSelectedLogForExcluded] = useState<DistributionLog | null>(null);

  const distributionLogs: DistributionLog[] = [
    { 
      id: "1", date: "15/01/2025", time: "06:00", plan: "Ouro", subscribersCount: 234, boloesDistributed: 12, status: "success",
      totalSubscribers: 280, eligibleSubscribers: 234, excludedCount: 46,
      excludedSubscribers: [
        { id: "exc1", name: "Roberto Gomes", email: "roberto@email.com", reason: "Status da assinatura: Cancelado" },
        { id: "exc2", name: "Juliana Pereira", email: "juliana@email.com", reason: "Status da assinatura: Expirado" },
        { id: "exc3", name: "Fernando Lima", email: "fernando@email.com", reason: "Status de pagamento: Atrasado" },
        { id: "exc4", name: "Camila Santos", email: "camila@email.com", reason: "Conta suspensa" },
      ]
    },
    { 
      id: "2", date: "15/01/2025", time: "06:02", plan: "Prata", subscribersCount: 412, boloesDistributed: 8, status: "success",
      totalSubscribers: 456, eligibleSubscribers: 412, excludedCount: 44,
      excludedSubscribers: [
        { id: "exc5", name: "Fernanda Costa", email: "fernanda@email.com", reason: "Status da assinatura: Pausado" },
        { id: "exc6", name: "Marcos Silva", email: "marcos@email.com", reason: "Conta suspensa" },
      ]
    },
    { 
      id: "3", date: "15/01/2025", time: "06:04", plan: "Bronze", subscribersCount: 201, boloesDistributed: 4, status: "success",
      totalSubscribers: 221, eligibleSubscribers: 201, excludedCount: 20,
      excludedSubscribers: [
        { id: "exc7", name: "Ricardo Oliveira", email: "ricardo@email.com", reason: "Status de pagamento: Atrasado" },
        { id: "exc8", name: "Camila Santos", email: "camila@email.com", reason: "Status da assinatura: Pendente" },
      ]
    },
    { 
      id: "4", date: "08/01/2025", time: "06:00", plan: "Ouro", subscribersCount: 228, boloesDistributed: 12, status: "success",
      totalSubscribers: 275, eligibleSubscribers: 228, excludedCount: 47,
      excludedSubscribers: []
    },
    { 
      id: "5", date: "08/01/2025", time: "06:02", plan: "Prata", subscribersCount: 405, boloesDistributed: 8, status: "partial", 
      errorMessage: "3 assinantes não receberam por saldo insuficiente",
      totalSubscribers: 450, eligibleSubscribers: 408, excludedCount: 42,
      excludedSubscribers: []
    },
    { 
      id: "6", date: "01/01/2025", time: "06:00", plan: "Ouro", subscribersCount: 220, boloesDistributed: 10, status: "error", 
      errorMessage: "Timeout na conexão - redistribuição automática em 06:15",
      totalSubscribers: 270, eligibleSubscribers: 225, excludedCount: 45,
      excludedSubscribers: []
    },
  ];

  const days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const timezones = [
    { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
    { value: "America/Manaus", label: "Manaus (GMT-4)" },
    { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
    { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
  ];

  const getNextDistributionDate = () => {
    const today = new Date();
    const targetDay = days.indexOf(scheduleDay);
    const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate.toLocaleDateString("pt-BR");
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "Ouro": return Trophy;
      case "Prata": return Medal;
      default: return Crown;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Ouro": return "from-yellow-500 to-amber-600";
      case "Prata": return "from-gray-400 to-slate-500";
      default: return "from-amber-600 to-orange-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Sucesso
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Parcial
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default: return null;
    }
  };

  const handleSaveConfig = () => {
    console.log("Saving configuration...", {
      schedule: { day: scheduleDay, time: scheduleTime, timezone },
      plans: { bronze: bronzeConfig, prata: prataConfig, ouro: ouroConfig },
      notifications: notificationConfig,
      distributionMethod,
    });
    alert("Configuração salva com sucesso!");
  };

  const handleDryRun = () => {
    console.log("Starting dry run...");
    alert("Iniciando teste de distribuição (Dry Run)...\n\nO sistema simulará a distribuição sem efetivamente atribuir bolões.");
  };

  const inputClasses = `w-full px-4 py-2.5 rounded-lg border ${
    isDark 
      ? "bg-[#0D1117] border-[#1C2432] text-white" 
      : "bg-white border-gray-300 text-gray-900"
  } focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green`;

  const selectClasses = `px-4 py-2.5 rounded-lg border ${
    isDark 
      ? "bg-[#0D1117] border-[#1C2432] text-white" 
      : "bg-white border-gray-300 text-gray-900"
  } focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green`;

  return (
    <AdminLayout title="Automação VIP" subtitle="Gerenciar distribuição automática de bolões para assinantes">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          className={activeTab === "overview" ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : ""}
        >
          <Bot className="w-4 h-4 mr-2" />
          Visão Geral
        </Button>
        <Button
          variant={activeTab === "config" ? "default" : "outline"}
          onClick={() => setActiveTab("config")}
          className={activeTab === "config" ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : ""}
        >
          <Settings className="w-4 h-4 mr-2" />
          Configurar Distribuição
        </Button>
        <Button
          variant={activeTab === "historico" ? "default" : "outline"}
          onClick={() => setActiveTab("historico")}
          className={activeTab === "historico" ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : ""}
        >
          <History className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Status Indicator and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Automation Status Card */}
            <Card className={`p-6 relative overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-bolao-green/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${automationActive ? "bg-green-500/20" : "bg-red-500/20"} flex items-center justify-center`}>
                      <Bot className={`w-6 h-6 ${automationActive ? "text-green-400" : "text-red-400"}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status da Automação</p>
                      <p className={`text-xl font-bold ${automationActive ? "text-green-400" : "text-red-400"}`}>
                        {automationActive ? "Ativa" : "Pausada"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${automationActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                </div>
                <div className="flex gap-2">
                  {automationActive ? (
                    <Button
                      variant="outline"
                      className="flex-1 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                      onClick={() => setAutomationActive(false)}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setAutomationActive(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Next Distribution */}
            <Card className={`p-6 relative overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Próxima Distribuição</p>
                    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {getNextDistributionDate()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                    {scheduleDay} às {scheduleTime}
                  </span>
                </div>
              </div>
            </Card>

            {/* Execute Now */}
            <Card className={`p-6 relative overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-bolao-green/5" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-bolao-green/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-bolao-green" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ação Rápida</p>
                    <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Distribuição Manual
                    </p>
                  </div>
                </div>
                
                {/* Include inactive checkbox for manual distribution */}
                <div className={`mb-3 p-3 rounded-lg ${isDark ? "bg-[#0D1117] border border-[#1C2432]" : "bg-gray-50 border border-gray-200"}`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeInactiveInManual}
                      onChange={(e) => setIncludeInactiveInManual(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                    />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Incluir inativos
                    </span>
                  </label>
                  {includeInactiveInManual && (
                    <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Atenção: {stats.inactiveSubscribers} assinantes inativos serão incluídos
                    </p>
                  )}
                </div>
                
                <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <Play className="w-4 h-4 mr-2" />
                  Executar Distribuição Agora
                </Button>
                <p className={`text-xs text-center mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Distribuição para {includeInactiveInManual ? stats.totalSubscribers : stats.activeSubscribers} assinantes {!includeInactiveInManual && <span className="text-green-500 font-medium">ATIVOS</span>}
                </p>
              </div>
            </Card>
          </div>

          {/* Warning Banner for Inactive Subscribers */}
          {stats.inactiveSubscribers > 0 && (
            <div className={`mb-6 p-4 rounded-xl border-l-4 border-yellow-500 ${isDark ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-50 border-yellow-400"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDark ? "text-yellow-300" : "text-yellow-800"}`}>
                    {stats.inactiveSubscribers} assinantes inativos não receberão bolões
                  </h4>
                  <p className={`text-sm mt-1 ${isDark ? "text-yellow-200/70" : "text-yellow-700"}`}>
                    Existem assinantes com status inativo, cancelado, pausado ou com pagamento pendente. 
                    Esses assinantes não serão incluídos na distribuição automática.
                  </p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                      <span className="text-gray-500">Inativos:</span> <span className="font-medium text-gray-400">{subscriberStatus.inativos}</span>
                    </span>
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                      <span className="text-red-400">Cancelados:</span> <span className="font-medium text-red-400">{subscriberStatus.cancelados}</span>
                    </span>
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                      <span className="text-yellow-500">Pausados:</span> <span className="font-medium text-yellow-400">{subscriberStatus.pausados}</span>
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 flex-shrink-0"
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          )}

          {/* Subscriber Status Breakdown Card */}
          <Card className={`p-6 mb-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Status dos Assinantes</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Breakdown por status de assinatura</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Mostrar apenas ativos</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={showOnlyActive}
                      onChange={(e) => setShowOnlyActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      isDark 
                        ? "bg-[#1C2432] peer-checked:bg-bolao-green after:bg-gray-400 peer-checked:after:bg-white" 
                        : "bg-gray-200 peer-checked:bg-bolao-green after:bg-white"
                    }`}></div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ativos */}
              <div className={`p-4 rounded-xl ${isDark ? "bg-green-500/10 border border-green-500/20" : "bg-green-50 border border-green-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{subscriberStatus.ativos}</p>
                    <p className={`text-sm ${isDark ? "text-green-400" : "text-green-600"}`}>Ativos</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-green-500/20 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(subscriberStatus.ativos / subscriberStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Inativos */}
              <div className={`p-4 rounded-xl ${isDark ? "bg-gray-500/10 border border-gray-500/20" : "bg-gray-100 border border-gray-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                    <UserMinus className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-400">{subscriberStatus.inativos}</p>
                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Inativos</p>
                  </div>
                </div>
                <div className={`w-full h-1.5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"} overflow-hidden`}>
                  <div 
                    className="h-full bg-gray-400 rounded-full" 
                    style={{ width: `${(subscriberStatus.inativos / subscriberStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cancelados */}
              <div className={`p-4 rounded-xl ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{subscriberStatus.cancelados}</p>
                    <p className={`text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>Cancelados</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-red-500/20 overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(subscriberStatus.cancelados / subscriberStatus.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Pausados */}
              <div className={`p-4 rounded-xl ${isDark ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Pause className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">{subscriberStatus.pausados}</p>
                    <p className={`text-sm ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>Pausados</p>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-yellow-500/20 overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${(subscriberStatus.pausados / subscriberStatus.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Distribution Preview */}
            <div className={`mt-6 p-4 rounded-xl ${isDark ? "bg-bolao-green/10 border border-bolao-green/20" : "bg-green-50 border border-green-200"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bolao-green/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-bolao-green" />
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? "text-bolao-green" : "text-green-700"}`}>
                      Distribuição para {stats.activeSubscribers} assinantes ATIVOS
                    </p>
                    <p className={`text-sm ${isDark ? "text-green-400/70" : "text-green-600"}`}>
                      Próxima distribuição: {getNextDistributionDate()} às {scheduleTime}
                    </p>
                  </div>
                </div>
                <Badge className="bg-bolao-green/20 text-bolao-green border-bolao-green/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Pronto
                </Badge>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    <span className="text-green-500">{stats.activeSubscribers}</span>
                    <span className={`text-sm font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}>/{stats.totalSubscribers}</span>
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinantes ativos</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.boloesToDistribute}</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões esta semana</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bolao-orange/20 flex items-center justify-center">
                  <History className="w-6 h-6 text-bolao-orange" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.lastDistribution}</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Última distribuição</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.successRate}%</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Taxa de sucesso</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Distributions Log */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bolao-orange/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-bolao-orange" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Histórico de Distribuições</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Registro das últimas execuções automáticas</p>
                </div>
              </div>
              <Button variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? "border-b border-[#1C2432]" : "border-b border-gray-200"}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Data/Hora</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Plano</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinantes</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Observações</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionLogs.map((log) => {
                    const PlanIcon = getPlanIcon(log.plan);
                    return (
                      <tr key={log.id} className={`border-b ${isDark ? "border-[#1C2432] hover:bg-[#0D1117]" : "border-gray-100 hover:bg-gray-50"}`}>
                        <td className="px-4 py-4">
                          <div>
                            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{log.date}</p>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{log.time}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlanColor(log.plan)} flex items-center justify-center`}>
                              <PlanIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{log.plan}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span className={`font-medium text-green-500`}>{log.subscribersCount}</span>
                            {log.totalSubscribers && (
                              <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>/{log.totalSubscribers}</span>
                            )}
                            {log.excludedCount && log.excludedCount > 0 && (
                              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                ({log.excludedCount} excluídos)
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{log.boloesDistributed}</span>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-4 py-4">
                          {log.errorMessage ? (
                            <p className={`text-sm ${log.status === "error" ? "text-red-400" : "text-yellow-400"}`}>
                              {log.errorMessage}
                            </p>
                          ) : (
                            <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {log.excludedCount && log.excludedCount > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${isDark ? "border-[#1C2432] text-gray-300 hover:bg-[#1C2432]" : "border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                              onClick={() => {
                                setSelectedLogForExcluded(log);
                                setShowExcludedModal(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Excluídos
                            </Button>
                          ) : (
                            <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
                Ver Histórico Completo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Excluded Subscribers Modal */}
          {showExcludedModal && selectedLogForExcluded && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <Card className={`w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
                <div className={`p-6 border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Assinantes Excluídos da Distribuição
                        </h3>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {selectedLogForExcluded.plan} • {selectedLogForExcluded.date} às {selectedLogForExcluded.time}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowExcludedModal(false);
                        setSelectedLogForExcluded(null);
                      }}
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Summary Stats */}
                  <div className={`p-4 rounded-xl mb-6 ${isDark ? "bg-[#0D1117]" : "bg-gray-50"}`}>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-500">{selectedLogForExcluded.totalSubscribers}</p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{selectedLogForExcluded.eligibleSubscribers}</p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Elegíveis</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">{selectedLogForExcluded.excludedCount}</p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Excluídos</p>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Elegíveis para distribuição: <span className="font-semibold text-green-500">{selectedLogForExcluded.eligibleSubscribers}</span> de <span className="font-semibold">{selectedLogForExcluded.totalSubscribers}</span> total
                  </p>

                  {/* Excluded List */}
                  {selectedLogForExcluded.excludedSubscribers && selectedLogForExcluded.excludedSubscribers.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        Motivos de Exclusão:
                      </h4>
                      {selectedLogForExcluded.excludedSubscribers.map((sub) => (
                        <div 
                          key={sub.id} 
                          className={`p-3 rounded-lg ${isDark ? "bg-[#0D1117] border border-[#1C2432]" : "bg-gray-50 border border-gray-200"}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{sub.name}</p>
                              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{sub.email}</p>
                            </div>
                            <Badge 
                              className={`${
                                sub.reason.includes("Cancelado") ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                sub.reason.includes("Pausado") ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                sub.reason.includes("pagamento") ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                                sub.reason.includes("suspensa") ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }`}
                            >
                              {sub.reason.includes("Cancelado") && <XCircle className="w-3 h-3 mr-1" />}
                              {sub.reason.includes("Pausado") && <Pause className="w-3 h-3 mr-1" />}
                              {sub.reason.includes("pagamento") && <AlertCircle className="w-3 h-3 mr-1" />}
                              {sub.reason.includes("suspensa") && <BanIcon className="w-3 h-3 mr-1" />}
                              {sub.reason}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-8 text-center rounded-xl ${isDark ? "bg-[#0D1117]" : "bg-gray-50"}`}>
                      <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Detalhes completos não disponíveis para esta distribuição
                      </p>
                    </div>
                  )}
                </div>
                
                <div className={`p-4 border-t ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowExcludedModal(false);
                        setSelectedLogForExcluded(null);
                      }}
                      className={isDark ? "border-[#1C2432]" : ""}
                    >
                      Fechar
                    </Button>
                    <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Relatório
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      ) : activeTab === "config" ? (
        /* Configuration Tab */
        <div className="space-y-6">
          {/* Schedule Settings */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Configurações de Agendamento</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Defina quando a distribuição automática acontece</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Dia da Semana
                </label>
                <select
                  value={scheduleDay}
                  onChange={(e) => setScheduleDay(e.target.value)}
                  className={selectClasses + " w-full"}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Horário
                </label>
                <select
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className={selectClasses + " w-full"}
                >
                  {["05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "12:00", "18:00", "20:00"].map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Fuso Horário
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={selectClasses + " w-full"}
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`mt-4 p-4 rounded-lg ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                <span className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-700"}`}>Próxima execução programada</span>
              </div>
              <p className={isDark ? "text-white" : "text-gray-900"}>
                {scheduleDay}, {getNextDistributionDate()} às {scheduleTime} ({timezones.find(t => t.value === timezone)?.label})
              </p>
            </div>
          </Card>

          {/* Financial Rules Info Card */}
          <Card className={`p-6 ${isDark ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20" : "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200"}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <CircleDollarSign className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-lg mb-2 ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                  💰 Regras Financeiras VIP
                </h4>
                <div className={`space-y-3 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]/50" : "bg-white/60"}`}>
                    <p className="font-semibold mb-1">📊 Distribuição de Valores:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Taxa Administrativa:</strong> <span className="text-amber-400 font-bold">40%</span> do valor pago</li>
                      <li>• <strong>Crédito Disponibilizado:</strong> <span className="text-bolao-green font-bold">60%</span> do valor do plano</li>
                    </ul>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]/50" : "bg-white/60"}`}>
                    <p className="font-semibold mb-1">💵 Créditos por Plano (Mensal):</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong className="text-amber-600">Bronze (R$ 29,90):</strong> Crédito de R$ 17,94 disponibilizado</li>
                      <li>• <strong className="text-cyan-400">Prata (R$ 59,90):</strong> Crédito de R$ 35,94 disponibilizado</li>
                      <li>• <strong className="text-amber-400">Ouro (R$ 149,90):</strong> Crédito de R$ 89,94 disponibilizado</li>
                    </ul>
                  </div>
                  <div className={`p-2 rounded-lg border ${isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
                    <p className={`text-xs ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      <strong>Nota:</strong> Os 40% de taxa cobrem: gateway de pagamento, hospedagem, suporte VIP, desenvolvimento e custos operacionais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Plan Rules - Bronze */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Plano Bronze</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Configuração de distribuição para assinantes Bronze</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bronzeConfig.active}
                  onChange={(e) => setBronzeConfig({ ...bronzeConfig, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Ativo</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-purple-400">Lotofácil</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bronzeConfig.lotofacil}
                  onChange={(e) => setBronzeConfig({ ...bronzeConfig, lotofacil: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-green-400">Mega-Sena</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bronzeConfig.megasena}
                  onChange={(e) => setBronzeConfig({ ...bronzeConfig, megasena: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-blue-400">Quina</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={bronzeConfig.quina}
                  onChange={(e) => setBronzeConfig({ ...bronzeConfig, quina: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Critério de Seleção
                </label>
                <select
                  value={bronzeConfig.selectionCriteria}
                  onChange={(e) => setBronzeConfig({ ...bronzeConfig, selectionCriteria: e.target.value as any })}
                  className={selectClasses + " w-full"}
                >
                  <option value="random">Aleatório</option>
                  <option value="best_odds">Melhores Chances</option>
                  <option value="user_preference">Preferência do Usuário</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Plan Rules - Prata */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-400 to-slate-500 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Plano Prata</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Configuração de distribuição para assinantes Prata</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prataConfig.active}
                  onChange={(e) => setPrataConfig({ ...prataConfig, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Ativo</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-purple-400">Lotofácil</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={prataConfig.lotofacil}
                  onChange={(e) => setPrataConfig({ ...prataConfig, lotofacil: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-green-400">Mega-Sena</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={prataConfig.megasena}
                  onChange={(e) => setPrataConfig({ ...prataConfig, megasena: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-blue-400">Quina</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={prataConfig.quina}
                  onChange={(e) => setPrataConfig({ ...prataConfig, quina: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Critério de Seleção
                </label>
                <select
                  value={prataConfig.selectionCriteria}
                  onChange={(e) => setPrataConfig({ ...prataConfig, selectionCriteria: e.target.value as any })}
                  className={selectClasses + " w-full"}
                >
                  <option value="random">Aleatório</option>
                  <option value="best_odds">Melhores Chances</option>
                  <option value="user_preference">Preferência do Usuário</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Estratégia
                </label>
                <select
                  value={prataConfig.strategy}
                  onChange={(e) => setPrataConfig({ ...prataConfig, strategy: e.target.value as any })}
                  className={selectClasses + " w-full"}
                >
                  <option value="combined">Combinada</option>
                  <option value="diverse">Diversificada</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Plan Rules - Ouro */}
          <Card className={`p-6 border-2 border-yellow-500/30 ${isDark ? "bg-[#111827]" : "bg-white"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Plano Ouro</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Configuração premium para assinantes Ouro</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ouroConfig.active}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                />
                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Ativo</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-purple-400">Lotofácil</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ouroConfig.lotofacil}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, lotofacil: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-green-400">Mega-Sena</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ouroConfig.megasena}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, megasena: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <span className="text-blue-400">Quina</span> /semana
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={ouroConfig.quina}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, quina: parseInt(e.target.value) || 0 })}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Critério de Seleção
                </label>
                <select
                  value={ouroConfig.selectionCriteria}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, selectionCriteria: e.target.value as any })}
                  className={selectClasses + " w-full"}
                >
                  <option value="random">Aleatório</option>
                  <option value="best_odds">Melhores Chances</option>
                  <option value="user_preference">Preferência do Usuário</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Estratégia
                </label>
                <select
                  value={ouroConfig.strategy}
                  onChange={(e) => setOuroConfig({ ...ouroConfig, strategy: e.target.value as any })}
                  className={selectClasses + " w-full"}
                >
                  <option value="combined">Combinada</option>
                  <option value="diverse">Diversificada</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={ouroConfig.specialGames}
                    onChange={(e) => setOuroConfig({ ...ouroConfig, specialGames: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                  />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    <Sparkles className="w-4 h-4 inline mr-1 text-yellow-400" />
                    Jogos Especiais (Virada, Independência)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ouroConfig.prioritySelection}
                    onChange={(e) => setOuroConfig({ ...ouroConfig, prioritySelection: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                  />
                  <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    <Star className="w-4 h-4 inline mr-1 text-yellow-400" />
                    Seleção Prioritária (VIP primeiro)
                  </span>
                </label>
              </div>
            </div>
          </Card>

          {/* Distribution Method */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Método de Distribuição</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Como os bolões são alocados entre os planos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  distributionMethod === "equal"
                    ? isDark ? "border-bolao-green bg-bolao-green/10" : "border-bolao-green bg-bolao-green/5"
                    : isDark ? "border-[#1C2432] hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="distributionMethod"
                  value="equal"
                  checked={distributionMethod === "equal"}
                  onChange={(e) => setDistributionMethod(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Igual</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Todos os assinantes recebem a mesma quantidade de bolões (conforme regras do plano)
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  distributionMethod === "proportional"
                    ? isDark ? "border-bolao-green bg-bolao-green/10" : "border-bolao-green bg-bolao-green/5"
                    : isDark ? "border-[#1C2432] hover:border-gray-600" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="distributionMethod"
                  value="proportional"
                  checked={distributionMethod === "proportional"}
                  onChange={(e) => setDistributionMethod(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Proporcional ao Valor</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Bolões distribuídos proporcionalmente ao valor pago no plano
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-bolao-orange/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-bolao-orange" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Configurações de Notificação</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Como os assinantes são notificados sobre novos bolões</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Momento do Envio
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTiming"
                      checked={notificationConfig.sendImmediately}
                      onChange={() => setNotificationConfig({ ...notificationConfig, sendImmediately: true })}
                      className="w-4 h-4 text-bolao-green focus:ring-bolao-green"
                    />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>Enviar imediatamente após distribuição</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendTiming"
                      checked={!notificationConfig.sendImmediately}
                      onChange={() => setNotificationConfig({ ...notificationConfig, sendImmediately: false })}
                      className="w-4 h-4 text-bolao-green focus:ring-bolao-green"
                    />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>Agendar para horário específico</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Canais de Notificação
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.channels.inApp}
                      onChange={(e) => setNotificationConfig({
                        ...notificationConfig,
                        channels: { ...notificationConfig.channels, inApp: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                    />
                    <Globe className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>In-App (Painel do usuário)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.channels.email}
                      onChange={(e) => setNotificationConfig({
                        ...notificationConfig,
                        channels: { ...notificationConfig.channels, email: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                    />
                    <Mail className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>E-mail</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationConfig.channels.push}
                      onChange={(e) => setNotificationConfig({
                        ...notificationConfig,
                        channels: { ...notificationConfig.channels, push: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-gray-300 text-bolao-green focus:ring-bolao-green"
                    />
                    <Smartphone className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>Push Notification</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Mensagem Personalizada
              </label>
              <textarea
                value={notificationConfig.customMessage}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, customMessage: e.target.value })}
                placeholder="Digite a mensagem que será enviada aos assinantes..."
                rows={3}
                className={`${inputClasses} resize-none`}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Variáveis disponíveis: {"{nome}"}, {"{plano}"}, {"{quantidade_boloes}"}
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleDryRun}
              className={`${isDark ? "border-[#1C2432]" : ""} min-w-[200px]`}
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar com Dry Run
            </Button>
            <Button
              onClick={handleSaveConfig}
              className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold min-w-[200px]"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      ) : activeTab === "historico" ? (
        /* History Tab */
        <div className="space-y-6">
          {/* History Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>156</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total de Distribuições</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>98.5%</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Taxa de Sucesso</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>12.847</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinantes Atendidos</p>
                </div>
              </div>
            </Card>

            <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-bolao-orange/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-bolao-orange" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>4.523</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões Distribuídos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {/* Date Range Filter */}
                <select
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="last7">Últimos 7 dias</option>
                  <option value="last30">Últimos 30 dias</option>
                  <option value="last90">Últimos 90 dias</option>
                  <option value="year">Este ano</option>
                  <option value="all">Todo o período</option>
                </select>

                {/* Plan Filter */}
                <select
                  value={historyPlanFilter}
                  onChange={(e) => setHistoryPlanFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="all">Todos os planos</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                </select>

                {/* Status Filter */}
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="all">Todos os status</option>
                  <option value="success">Sucesso</option>
                  <option value="partial">Parcial</option>
                  <option value="error">Erro</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <input
                    type="text"
                    placeholder="Buscar por ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClasses} pl-10 w-40`}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className={isDark ? "border-[#1C2432]" : ""}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Success Rate Chart */}
            <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Taxa de Sucesso ao Longo do Tempo</h3>
                <BarChart3 className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className={`h-48 flex flex-col items-center justify-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm opacity-50">Gráfico de taxa de sucesso</p>
                {/* Chart placeholder - in production would use Recharts */}
                <div className="w-full mt-4 flex items-end justify-around h-24">
                  {[85, 92, 95, 88, 98, 97, 99, 96, 98, 99, 97, 98].map((value, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-gradient-to-t from-bolao-green to-bolao-green-light rounded-t"
                        style={{ height: `${value * 0.8}px` }}
                      />
                      <span className="text-[8px] mt-1">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Distribution by Plan Chart */}
            <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Distribuição por Plano</h3>
                <PieChart className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </div>
              <div className="flex items-center justify-center gap-8">
                {/* Simple pie chart visualization */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="75.4 251.2" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#9ca3af" strokeWidth="20" strokeDasharray="100.5 251.2" strokeDashoffset="-75.4" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="20" strokeDasharray="75.4 251.2" strokeDashoffset="-175.9" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Bronze: 30%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Prata: 40%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>Ouro: 30%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Distribution History Table */}
          <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-bolao-orange/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-bolao-orange" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Histórico de Distribuições</h3>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Registro detalhado de todas as execuções</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? "border-b border-[#1C2432]" : "border-b border-gray-200"}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>ID</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Data/Hora</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Plano</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinantes</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Sucesso</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Duração</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "DIST-2025-0156", date: "15/01/2025", time: "06:00", plan: "Ouro" as const, subscribers: 234, boloes: 702, success: 100, duration: "2m 34s", status: "success" as const, errors: 0 },
                    { id: "DIST-2025-0155", date: "15/01/2025", time: "06:02", plan: "Prata" as const, subscribers: 412, boloes: 824, success: 99.5, duration: "3m 12s", status: "success" as const, errors: 2 },
                    { id: "DIST-2025-0154", date: "15/01/2025", time: "06:04", plan: "Bronze" as const, subscribers: 201, boloes: 201, success: 100, duration: "1m 45s", status: "success" as const, errors: 0 },
                    { id: "DIST-2025-0153", date: "08/01/2025", time: "06:00", plan: "Ouro" as const, subscribers: 228, boloes: 684, success: 100, duration: "2m 28s", status: "success" as const, errors: 0 },
                    { id: "DIST-2025-0152", date: "08/01/2025", time: "06:02", plan: "Prata" as const, subscribers: 405, boloes: 810, success: 98.3, duration: "3m 45s", status: "partial" as const, errors: 7 },
                    { id: "DIST-2025-0151", date: "08/01/2025", time: "06:04", plan: "Bronze" as const, subscribers: 198, boloes: 198, success: 100, duration: "1m 38s", status: "success" as const, errors: 0 },
                    { id: "DIST-2025-0150", date: "01/01/2025", time: "06:00", plan: "Ouro" as const, subscribers: 220, boloes: 0, success: 0, duration: "0m 12s", status: "error" as const, errors: 220 },
                  ].map((dist) => {
                    const PlanIcon = getPlanIcon(dist.plan);
                    return (
                      <tr key={dist.id} className={`border-b ${isDark ? "border-[#1C2432] hover:bg-[#0D1117]" : "border-gray-100 hover:bg-gray-50"}`}>
                        <td className="px-4 py-4">
                          <span className={`font-mono text-sm ${isDark ? "text-blue-400" : "text-blue-600"}`}>{dist.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{dist.date}</p>
                            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{dist.time}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPlanColor(dist.plan)} flex items-center justify-center`}>
                              <PlanIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{dist.plan}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{dist.subscribers}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{dist.boloes}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-medium ${dist.success === 100 ? "text-green-400" : dist.success > 95 ? "text-yellow-400" : "text-red-400"}`}>
                            {dist.success}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{dist.duration}</span>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(dist.status)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDistribution(dist.id === selectedDistribution ? null : dist.id)}
                              className={`p-2 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {dist.status === "error" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`p-2 text-yellow-500 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            {dist.date === "15/01/2025" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`p-2 text-red-400 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`}
                                title="Reverter Distribuição"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Distribution Details */}
            {selectedDistribution && (
              <div className={`mt-6 p-4 rounded-lg border ${isDark ? "bg-[#0D1117] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Detalhes da Distribuição {selectedDistribution}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDistribution(null)}
                    className={isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinantes Processados</p>
                    <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>234</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Notificações Enviadas</p>
                    <p className={`text-xl font-bold text-green-400`}>234</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Notificações Lidas</p>
                    <p className={`text-xl font-bold text-blue-400`}>198 (84.6%)</p>
                  </div>
                </div>

                <h5 className={`text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Amostra de Assinantes</h5>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={isDark ? "border-b border-[#1C2432]" : "border-b border-gray-200"}>
                        <th className={`px-3 py-2 text-left text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assinante</th>
                        <th className={`px-3 py-2 text-left text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões Recebidos</th>
                        <th className={`px-3 py-2 text-left text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Notificação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "João Silva", boloes: ["Lotofácil 18 Dez", "Mega-Sena Semanal", "Quina Premium"], status: "read" },
                        { name: "Maria Santos", boloes: ["Lotofácil 20 Dez", "Mega-Sena Semanal", "Quina Diária"], status: "delivered" },
                        { name: "Carlos Mendes", boloes: ["Lotofácil 18 Dez", "Mega da Virada VIP", "Quina Premium"], status: "read" },
                      ].map((sub, i) => (
                        <tr key={i} className={`border-b ${isDark ? "border-[#1C2432]" : "border-gray-100"}`}>
                          <td className={`px-3 py-2 ${isDark ? "text-white" : "text-gray-900"}`}>{sub.name}</td>
                          <td className={`px-3 py-2`}>
                            <div className="flex flex-wrap gap-1">
                              {sub.boloes.map((b, j) => (
                                <Badge key={j} variant="outline" className="text-xs">{b}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className={`px-3 py-2`}>
                            <Badge className={sub.status === "read" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}>
                              {sub.status === "read" ? "Lida" : "Entregue"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Mostrando 7 de 156 distribuições
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className={isDark ? "border-[#1C2432]" : ""}>
                  Anterior
                </Button>
                <Button variant="outline" size="sm" className={isDark ? "border-[#1C2432]" : ""}>
                  Próximo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </AdminLayout>
  );
};

export default AdminAutomacaoVIP;
