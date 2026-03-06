import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Wallet,
  PiggyBank,
  PieChart,
  BarChart3,
  Download,
  Calendar,
  Building,
  Building2,
  User,
  Hash,
  Key,
  Save,
  ChevronRight,
  AlertCircle,
  Lock,
  Zap,
  Banknote,
  Receipt,
  RefreshCw,
  Crown,
  Ticket,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  MoreVertical,
  Filter,
  Search,
  Send,
  X,
  Upload,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Copy,
  Trophy,
  Target,
  Sparkles,
  Star,
  Users,
  CheckCheck,
  Ban,
  Settings,
  Divide,
  Info,
  Calculator,
  Split,
  Loader2,
} from "lucide-react";
import {
  buscarDashboard,
  buscarSaquesPendentes,
  aprovarSaque,
  recusarSaque,
  aportarFundo,
  formatCurrency as formatCurrencyService,
  getFundoStatusColor,
  getFundoStatusLabel,
  type FinanceiroDashboard,
  type SaquePendente,
} from "@/services/financeiroService";

// Tab Button Component
const TabButton = ({ active, onClick, children, badge }: { active: boolean; onClick: () => void; children: React.ReactNode; badge?: number }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
      active
        ? "text-bolao-green border-bolao-green"
        : "text-muted-foreground border-transparent hover:text-white hover:border-[#1C2432]"
    }`}
  >
    {children}
    {badge !== undefined && badge > 0 && (
      <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-bolao-orange/20 text-bolao-orange">
        {badge}
      </span>
    )}
  </button>
);

// Enhanced KPI Card with Trend
const KPICard = ({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  value, 
  label, 
  sublabel,
  trend,
  trendValue,
  large,
  highlight 
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  large?: boolean;
  highlight?: "green" | "orange" | "blue";
}) => {
  const highlightStyles = {
    green: "border-bolao-green/30 bg-gradient-to-br from-bolao-green/5 to-transparent",
    orange: "border-bolao-orange/30 bg-gradient-to-br from-bolao-orange/5 to-transparent",
    blue: "border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent",
  };

  return (
    <Card className={`p-5 bg-[#111827] border-[#1C2432] ${large ? "md:col-span-2" : ""} ${highlight ? highlightStyles[highlight] : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className={`${large ? "text-3xl" : "text-2xl"} font-bold`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {sublabel && <p className="text-xs text-bolao-green mt-1">{sublabel}</p>}
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === "up" ? "bg-bolao-green/10 text-bolao-green" :
            trend === "down" ? "bg-red-500/10 text-red-400" :
            "bg-gray-500/10 text-gray-400"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : 
             trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
            {trendValue}
          </div>
        )}
      </div>
    </Card>
  );
};

// Interactive Chart Component with mock data visualization
const CashflowChart = () => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const data = [45, 52, 48, 61, 55, 72, 68, 85, 92, 88, 95, 102];
  const maxValue = Math.max(...data);

  return (
    <Card className="p-5 bg-[#111827] border-[#1C2432]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold">Fluxo de Caixa</h3>
          <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bolao-green"></span>
            <span className="text-xs text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bolao-orange"></span>
            <span className="text-xs text-muted-foreground">Saídas</span>
          </div>
        </div>
      </div>
      <div className="h-64 flex items-end gap-2">
        {data.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col gap-1">
              <div 
                className="w-full bg-gradient-to-t from-bolao-green to-bolao-green/50 rounded-t transition-all hover:from-bolao-green hover:to-bolao-green/70"
                style={{ height: `${(value / maxValue) * 180}px` }}
              ></div>
              <div 
                className="w-full bg-gradient-to-t from-bolao-orange/70 to-bolao-orange/30 rounded-t"
                style={{ height: `${(value * 0.3 / maxValue) * 180}px` }}
              ></div>
            </div>
            <span className="text-[10px] text-muted-foreground">{months[i]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Revenue by Source Chart
const RevenueSourceChart = () => {
  const sources = [
    { name: "Bolões Avulsos", value: 45, color: "bg-bolao-green" },
    { name: "Assinaturas", value: 35, color: "bg-blue-500" },
    { name: "Taxas de Serviço", value: 15, color: "bg-purple-500" },
    { name: "Outros", value: 5, color: "bg-gray-500" },
  ];

  return (
    <Card className="p-5 bg-[#111827] border-[#1C2432]">
      <h3 className="text-base font-semibold mb-6">Receita por Fonte</h3>
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {sources.reduce((acc, source, i) => {
              const offset = acc.offset;
              acc.elements.push(
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="transparent"
                  stroke={source.color.replace("bg-", "").includes("bolao-green") ? "#00C853" : 
                         source.color.includes("blue") ? "#3B82F6" :
                         source.color.includes("purple") ? "#A855F7" : "#6B7280"}
                  strokeWidth="3"
                  strokeDasharray={`${source.value} ${100 - source.value}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-500"
                />
              );
              acc.offset += source.value;
              return acc;
            }, { elements: [] as JSX.Element[], offset: 0 }).elements}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">100%</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {sources.map((source, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
              <span className="text-sm flex-1">{source.name}</span>
              <span className="text-sm font-semibold">{source.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Deposits vs Withdrawals Chart
const DepositsWithdrawalsChart = () => {
  const months = ["Set", "Out", "Nov", "Dez", "Jan", "Fev"];
  const deposits = [125000, 142000, 158000, 185000, 168000, 192000];
  const withdrawals = [45000, 52000, 48000, 62000, 55000, 58000];
  const maxValue = Math.max(...deposits);

  return (
    <Card className="p-5 bg-[#111827] border-[#1C2432]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold">Entradas vs Saídas</h3>
          <p className="text-xs text-muted-foreground">Comparativo mensal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bolao-green"></span>
            <span className="text-xs text-muted-foreground">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="text-xs text-muted-foreground">Saídas</span>
          </div>
        </div>
      </div>
      <div className="h-48 flex items-end gap-4">
        {months.map((month, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center gap-1">
              <div 
                className="w-5 bg-bolao-green rounded-t transition-all"
                style={{ height: `${(deposits[i] / maxValue) * 140}px` }}
              ></div>
              <div 
                className="w-5 bg-red-400/70 rounded-t transition-all"
                style={{ height: `${(withdrawals[i] / maxValue) * 140}px` }}
              ></div>
            </div>
            <span className="text-[10px] text-muted-foreground">{month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Quick Stats Row
const QuickStats = () => {
  const stats = [
    { label: "Depósitos Hoje", value: "R$ 12.450,00", count: "23 transações", trend: "up", trendValue: "+15%" },
    { label: "Saques Hoje", value: "R$ 3.200,00", count: "8 solicitações", trend: "down", trendValue: "-5%" },
    { label: "Prêmios Pagos Hoje", value: "R$ 8.500,00", count: "3 ganhadores", trend: "up", trendValue: "+120%" },
    { label: "Taxa de Conversão", value: "68%", count: "PIX aprovados", trend: "neutral", trendValue: "0%" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-4 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.count}</p>
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              stat.trend === "up" ? "bg-bolao-green/10 text-bolao-green" :
              stat.trend === "down" ? "bg-red-500/10 text-red-400" :
              "bg-gray-500/10 text-gray-400"
            }`}>
              {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : 
               stat.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
              {stat.trendValue}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Top Bettors Table
const TopBettors = () => {
  const bettors = [
    { rank: 1, name: "Maria Silva Santos", value: "R$ 12.500,00", bets: 45 },
    { rank: 2, name: "João Pedro Oliveira", value: "R$ 9.800,00", bets: 38 },
    { rank: 3, name: "Ana Carolina Costa", value: "R$ 8.450,00", bets: 32 },
    { rank: 4, name: "Roberto Almeida", value: "R$ 7.200,00", bets: 28 },
    { rank: 5, name: "Patricia Mendes", value: "R$ 6.800,00", bets: 25 },
  ];

  return (
    <Card className="p-5 bg-[#111827] border-[#1C2432]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Maiores Apostadores</h3>
        <Button variant="ghost" size="sm" className="text-xs text-bolao-green">
          Ver todos <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {bettors.map((bettor) => (
          <div key={bettor.rank} className="flex items-center gap-4">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              bettor.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
              bettor.rank === 2 ? "bg-gray-400/20 text-gray-400" :
              bettor.rank === 3 ? "bg-amber-600/20 text-amber-600" :
              "bg-[#1C2432] text-muted-foreground"
            }`}>
              {bettor.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{bettor.name}</p>
              <p className="text-xs text-muted-foreground">{bettor.bets} apostas</p>
            </div>
            <p className="text-sm font-semibold text-bolao-green">{bettor.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Bank Account Form
const BankAccountForm = () => (
  <Card className="p-5 bg-[#111827] border-[#1C2432]">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
        <Building className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h3 className="font-semibold">Conta Principal da Empresa</h3>
        <p className="text-xs text-muted-foreground">Conta para recebimento de valores</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Banco</label>
        <input
          type="text"
          placeholder="Ex: Banco do Brasil"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Agência</label>
        <input
          type="text"
          placeholder="0000"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Conta</label>
        <input
          type="text"
          placeholder="00000-0"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Titular</label>
        <input
          type="text"
          placeholder="Nome completo"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">CPF/CNPJ</label>
        <input
          type="text"
          placeholder="000.000.000-00"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Chave PIX</label>
        <input
          type="text"
          placeholder="email@empresa.com"
          className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        />
      </div>
    </div>

    <Button className="mt-5 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
      <Save className="w-4 h-4 mr-2" />
      Salvar Conta
    </Button>
  </Card>
);

// Pending Withdrawals Card
const PendingWithdrawals = () => {
  const withdrawals = [
    { name: "Carlos Mendes", value: "R$ 500,00" },
    { name: "Patricia Lima", value: "R$ 200,00" },
    { name: "Roberto Silva", value: "R$ 1.200,00" },
  ];

  return (
    <Card className="p-5 bg-gradient-to-br from-bolao-orange/10 to-transparent border-bolao-orange/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-bolao-orange/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-bolao-orange" />
        </div>
        <div>
          <h3 className="font-semibold">Valores Pendentes</h3>
          <p className="text-xs text-muted-foreground">Saques aguardando aprovação</p>
        </div>
      </div>
      <div className="space-y-2">
        {withdrawals.map((w, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-[#1C2432]/50 last:border-0">
            <p className="text-sm">{w.name}</p>
            <p className="text-sm font-semibold text-bolao-orange">{w.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-lg font-bold text-bolao-orange">Total: R$ 1.900,00</p>
    </Card>
  );
};

// Extracts Tab Content
// Comprehensive Transaction Logging Tab
const ExtractsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  const transactions = [
    { 
      id: "TRX-2025-00001", 
      type: "DEPOSIT", 
      typeLabel: "Depósito",
      user: "Maria Silva Santos",
      userId: "USR001",
      amount: 500.00,
      balanceBefore: 1250.00,
      balanceAfter: 1750.00,
      status: "completed",
      date: "15/02/2025 14:32:15",
      method: "PIX",
      description: "Depósito via PIX",
      metadata: { pixKey: "maria@email.com" }
    },
    { 
      id: "TRX-2025-00002", 
      type: "BOLAO_PURCHASE", 
      typeLabel: "Compra de Bolão",
      user: "João Pedro Oliveira",
      userId: "USR002",
      amount: -150.00,
      balanceBefore: 850.00,
      balanceAfter: 700.00,
      status: "completed",
      date: "15/02/2025 14:15:45",
      method: "Saldo",
      description: "Participação em Bolão MG-2025-0234",
      metadata: { bolaoId: "MG-2025-0234", cota: "10%" }
    },
    { 
      id: "TRX-2025-00003", 
      type: "WITHDRAWAL", 
      typeLabel: "Saque",
      user: "Ana Costa",
      userId: "USR003",
      amount: -300.00,
      balanceBefore: 2500.00,
      balanceAfter: 2200.00,
      status: "pending",
      date: "15/02/2025 13:45:22",
      method: "PIX",
      description: "Saque via PIX",
      metadata: { pixKey: "ana@email.com" }
    },
    { 
      id: "TRX-2025-00004", 
      type: "PRIZE_WON", 
      typeLabel: "Prêmio",
      user: "Carlos Lima",
      userId: "USR004",
      amount: 12500.00,
      balanceBefore: 450.00,
      balanceAfter: 12950.00,
      status: "completed",
      date: "15/02/2025 12:30:00",
      method: "Sistema",
      description: "Prêmio Bolão LF-2025-0891 - Quadra",
      metadata: { bolaoId: "LF-2025-0891", acertos: "Quadra" }
    },
    { 
      id: "TRX-2025-00005", 
      type: "SUBSCRIPTION", 
      typeLabel: "Assinatura",
      user: "Roberto Almeida",
      userId: "USR005",
      amount: -29.90,
      balanceBefore: 150.00,
      balanceAfter: 120.10,
      status: "completed",
      date: "15/02/2025 10:15:33",
      method: "Saldo",
      description: "Assinatura Plano Prata - Mensal",
      metadata: { plan: "prata", period: "monthly" }
    },
    { 
      id: "TRX-2025-00006", 
      type: "REFUND", 
      typeLabel: "Reembolso",
      user: "Fernanda Silva",
      userId: "USR006",
      amount: 75.00,
      balanceBefore: 320.00,
      balanceAfter: 395.00,
      status: "completed",
      date: "15/02/2025 09:45:12",
      method: "Sistema",
      description: "Reembolso Bolão QN-2025-0756 cancelado",
      metadata: { bolaoId: "QN-2025-0756", reason: "Bolão cancelado" }
    },
    { 
      id: "TRX-2025-00007", 
      type: "BONUS", 
      typeLabel: "Bônus",
      user: "Patricia Mendes",
      userId: "USR007",
      amount: 50.00,
      balanceBefore: 100.00,
      balanceAfter: 150.00,
      status: "completed",
      date: "15/02/2025 08:30:00",
      method: "Sistema",
      description: "Bônus de indicação - Novo usuário USR025",
      metadata: { referredUser: "USR025" }
    },
    { 
      id: "TRX-2025-00008", 
      type: "ADMIN_ADJUSTMENT", 
      typeLabel: "Ajuste Admin",
      user: "João Pedro Oliveira",
      userId: "USR002",
      amount: 100.00,
      balanceBefore: 700.00,
      balanceAfter: 800.00,
      status: "completed",
      date: "14/02/2025 17:22:45",
      method: "Admin",
      description: "Correção manual - Erro no sistema",
      metadata: { adminId: "ADM001", reason: "Compensação por erro" }
    },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (searchTerm && !t.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !t.user.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      DEPOSIT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      WITHDRAWAL: "bg-red-500/10 text-red-400 border-red-500/30",
      BOLAO_PURCHASE: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      PRIZE_WON: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      SUBSCRIPTION: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      REFUND: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      BONUS: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      ADMIN_ADJUSTMENT: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    };
    return colors[type] || "bg-gray-500/10 text-gray-400 border-gray-500/30";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Concluída</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "failed": return <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Falhou</Badge>;
      default: return null;
    }
  };

  // Calculate summaries
  const totalIn = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header with info */}
      <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border-purple-500/30">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-purple-400" />
          <div>
            <p className="font-semibold text-purple-400">Log de Transações - Fonte de Verdade</p>
            <p className="text-xs text-muted-foreground">Registro completo de todas as operações financeiras do sistema. Cada transação gera um registro imutável.</p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111827] border-[#1C2432]">
          <p className="text-xs text-muted-foreground mb-1">Total de Transações</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </Card>
        <Card className="p-4 bg-[#111827] border-[#1C2432]">
          <p className="text-xs text-muted-foreground mb-1">Total Entradas</p>
          <p className="text-2xl font-bold text-emerald-400">+R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4 bg-[#111827] border-[#1C2432]">
          <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
          <p className="text-2xl font-bold text-red-400">-R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4 bg-[#111827] border-[#1C2432]">
          <p className="text-xs text-muted-foreground mb-1">Saldo Líquido</p>
          <p className={`text-2xl font-bold ${(totalIn - totalOut) >= 0 ? "text-bolao-green" : "text-red-400"}`}>
            R$ {(totalIn - totalOut).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card className="p-4 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Filtros Avançados</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Buscar (ID ou Usuário)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="TRX-2025-00001 ou Nome..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data Início</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Data Fim</label>
            <input
              type="date"
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
            >
              <option value="all">Todos</option>
              <option value="DEPOSIT">Depósito</option>
              <option value="WITHDRAWAL">Saque</option>
              <option value="BOLAO_PURCHASE">Compra de Bolão</option>
              <option value="PRIZE_WON">Prêmio</option>
              <option value="SUBSCRIPTION">Assinatura</option>
              <option value="REFUND">Reembolso</option>
              <option value="BONUS">Bônus</option>
              <option value="ADMIN_ADJUSTMENT">Ajuste Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
            >
              <option value="all">Todos</option>
              <option value="completed">Concluída</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falhou</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex-1"></div>
          <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data/Hora</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Tipo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Descrição</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-4">Saldo Após</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                  <td className="p-4 text-sm font-mono text-muted-foreground">{t.id}</td>
                  <td className="p-4 text-sm text-muted-foreground">{t.date}</td>
                  <td className="p-4">
                    <Badge variant="outline" className={getTypeColor(t.type)}>
                      {t.typeLabel}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm">{t.user}</p>
                      <p className="text-xs text-muted-foreground font-mono">{t.userId}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">via {t.method}</p>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-semibold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.amount > 0 ? "+" : ""}R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-muted-foreground">
                      R$ {t.balanceAfter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(t.status)}
                  </td>
                  <td className="p-4 text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Money Flow Diagram */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-bolao-green" />
          Fluxo de Movimentações
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
            <ArrowUpFromLine className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-400">{transactions.filter(t => t.type === "DEPOSIT").length}</p>
            <p className="text-xs text-muted-foreground">Depósitos</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <ArrowDownToLine className="w-6 h-6 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold text-red-400">{transactions.filter(t => t.type === "WITHDRAWAL").length}</p>
            <p className="text-xs text-muted-foreground">Saques</p>
          </div>
          <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/30 text-center">
            <Ticket className="w-6 h-6 mx-auto mb-2 text-sky-400" />
            <p className="text-2xl font-bold text-sky-400">{transactions.filter(t => t.type === "BOLAO_PURCHASE").length}</p>
            <p className="text-xs text-muted-foreground">Compras</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-400" />
            <p className="text-2xl font-bold text-amber-400">{transactions.filter(t => t.type === "PRIZE_WON").length}</p>
            <p className="text-xs text-muted-foreground">Prêmios</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Conta da Empresa Tab Component
const ContaEmpresaTab = () => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTransferForUpload, setSelectedTransferForUpload] = useState<typeof transferHistoryData[0] | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [observations, setObservations] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(342680.45);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState<"all" | "with" | "without">("all");
  const [transferHistoryData, setTransferHistoryData] = useState([
    { id: "TRF001", date: "15/02/2025 16:30", value: "R$ 50.000,00", method: "PIX", status: "completed", observations: "", hasReceipt: true, receiptFileName: "comprovante_TRF001.pdf" },
    { id: "TRF002", date: "10/02/2025 14:15", value: "R$ 35.000,00", method: "PIX", status: "completed", observations: "Pagamento fornecedores", hasReceipt: true, receiptFileName: "comprovante_TRF002.png" },
    { id: "TRF003", date: "05/02/2025 11:00", value: "R$ 25.000,00", method: "PIX", status: "completed", observations: "", hasReceipt: false, receiptFileName: "" },
    { id: "TRF004", date: "01/02/2025 09:45", value: "R$ 40.000,00", method: "PIX", status: "completed", observations: "Reserva mensal", hasReceipt: false, receiptFileName: "" },
    { id: "TRF005", date: "25/01/2025 15:20", value: "R$ 30.000,00", method: "PIX", status: "completed", observations: "", hasReceipt: true, receiptFileName: "comprovante_TRF005.pdf" },
  ]);

  // Filter transfers based on receipt status
  const filteredTransfers = transferHistoryData.filter(transfer => {
    if (receiptFilter === "all") return true;
    if (receiptFilter === "with") return transfer.hasReceipt;
    if (receiptFilter === "without") return !transfer.hasReceipt;
    return true;
  });

  const transfersWithoutReceipt = transferHistoryData.filter(t => !t.hasReceipt).length;

  // Format number to BRL currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Parse currency string to number
  const parseCurrencyToNumber = (value: string) => {
    const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  // Handle transfer amount input with currency formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    if (rawValue) {
      const numValue = parseInt(rawValue) / 100;
      const formatted = numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      setTransferAmount(formatted);
    } else {
      setTransferAmount('');
    }
  };

  // Set max amount
  const handleMaxAmount = () => {
    const formatted = availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setTransferAmount(formatted);
  };

  // Process transfer
  const handleTransfer = () => {
    // Validate password (simulated - in real app would verify with backend)
    if (adminPassword !== 'admin123') {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
      return;
    }

    const amount = parseCurrencyToNumber(transferAmount);
    if (amount <= 0 || amount > availableBalance) {
      return;
    }

    setIsProcessing(true);
    setPasswordError(false);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setTransferSuccess(true);
      
      // Update balance with animation
      setAvailableBalance(prev => prev - amount);
      
      // Add to transfer history
      const newTransfer = {
        id: `TRF${String(transferHistoryData.length + 1).padStart(3, '0')}`,
        date: new Date().toLocaleString('pt-BR'),
        value: formatCurrency(amount),
        method: 'PIX',
        status: 'completed',
        observations: observations,
        hasReceipt: false,
        receiptFileName: ""
      };
      setTransferHistoryData(prev => [newTransfer, ...prev]);

      // Reset after showing success
      setTimeout(() => {
        setTransferSuccess(false);
        setShowTransferModal(false);
        setTransferAmount('');
        setAdminPassword('');
        setObservations('');
      }, 2000);
    }, 1500);
  };

  // Close modal and reset state
  const handleCloseModal = () => {
    if (!isProcessing) {
      setShowTransferModal(false);
      setTransferAmount('');
      setAdminPassword('');
      setObservations('');
      setPasswordError(false);
      setTransferSuccess(false);
    }
  };

  // Handle opening upload modal
  const handleOpenUploadModal = (transfer: typeof transferHistoryData[0]) => {
    setSelectedTransferForUpload(transfer);
    setUploadedFileName("");
    setUploadSuccess(false);
    setShowUploadModal(true);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  // Handle upload submission
  const handleUploadReceipt = () => {
    if (!uploadedFileName || !selectedTransferForUpload) return;

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Update transfer with receipt
      setTransferHistoryData(prev => 
        prev.map(t => 
          t.id === selectedTransferForUpload.id 
            ? { ...t, hasReceipt: true, receiptFileName: uploadedFileName }
            : t
        )
      );

      // Close modal after success
      setTimeout(() => {
        setShowUploadModal(false);
        setSelectedTransferForUpload(null);
        setUploadedFileName("");
        setUploadSuccess(false);
      }, 1500);
    }, 1000);
  };

  // Close upload modal
  const handleCloseUploadModal = () => {
    if (!isUploading) {
      setShowUploadModal(false);
      setSelectedTransferForUpload(null);
      setUploadedFileName("");
      setUploadSuccess(false);
    }
  };

  const pixKeys = {
    cpfCnpj: "12.345.678/0001-90",
    email: "financeiro@bolaomax.com.br",
    telefone: "+55 11 99999-9999",
    aleatoria: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  };

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
          <div>
            <p className="font-semibold text-yellow-500">Área Restrita - Super Admin</p>
            <p className="text-xs text-muted-foreground">Todas as operações são registradas e requerem confirmação de senha.</p>
          </div>
        </div>
      </Card>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-bolao-green/10 to-transparent border-bolao-green/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-green/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <p className={`text-3xl font-bold text-bolao-green transition-all duration-500 ${transferSuccess ? 'scale-110' : ''}`}>
                {formatCurrency(availableBalance)}
              </p>
              <p className="text-sm text-muted-foreground">Saldo Atual no Sistema</p>
              <p className="text-xs text-bolao-green mt-1">Disponível para transferência</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 892.450,00</p>
              <p className="text-sm text-muted-foreground">Saldo Conta Bancária</p>
              <p className="text-xs text-blue-400 mt-1">Última atualização: 15/02/2025</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Send className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ 180.000,00</p>
              <p className="text-sm text-muted-foreground">Total Transferido (Mês)</p>
              <p className="text-xs text-purple-400 mt-1">5 transferências realizadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Comparison */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-medium">Total Mês</h4>
            </div>
            <Badge className="bg-bolao-green/10 text-bolao-green border-0 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>
          <p className="text-2xl font-bold mb-1">R$ 180.000,00</p>
          <p className="text-xs text-muted-foreground">vs R$ 160.500,00 mês anterior</p>
          <div className="mt-3 h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
            <div className="h-full w-[75%] bg-gradient-to-r from-blue-500 to-bolao-green rounded-full" />
          </div>
        </Card>

        {/* Transfer Frequency */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-medium">Frequência</h4>
          </div>
          <p className="text-2xl font-bold mb-1">1.2x</p>
          <p className="text-xs text-muted-foreground">Transferências por semana</p>
          <div className="mt-3 flex gap-1">
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <div className={`h-6 rounded-sm mb-1 ${i === 1 || i === 4 ? 'bg-purple-500/50' : 'bg-[#0A0E14]'}`} />
                <span className="text-[10px] text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Largest Transfer */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h4 className="text-sm font-medium">Maior Transferência</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-500 mb-1">R$ 75.000,00</p>
          <p className="text-xs text-muted-foreground">Realizada em 20/01/2025</p>
          <p className="text-xs text-muted-foreground mt-1">Obs: Reserva trimestral</p>
        </Card>
      </div>

      {/* Transfer Chart & Balance Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer History Chart */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-bolao-green" />
              <h4 className="font-semibold">Transferências Mensais</h4>
            </div>
            <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {[
              { month: 'Set', value: 120000, percentage: 60 },
              { month: 'Out', value: 145000, percentage: 72 },
              { month: 'Nov', value: 95000, percentage: 47 },
              { month: 'Dez', value: 200000, percentage: 100 },
              { month: 'Jan', value: 160500, percentage: 80 },
              { month: 'Fev', value: 180000, percentage: 90 },
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    i === 5 ? 'bg-bolao-green' : 'bg-[#1C2432]'
                  }`}
                  style={{ height: `${item.percentage}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#1C2432]">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Média do período</span>
              <span className="font-medium">R$ 150.083,33</span>
            </div>
          </div>
        </Card>

        {/* Balance Goals & Scheduled Transfers */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-bolao-orange" />
              <h4 className="font-semibold">Meta de Saldo</h4>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
              <Settings className="w-3 h-3 mr-1" />
              Configurar
            </Button>
          </div>
          
          {/* Current vs Target Balance */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Saldo Atual</span>
                <span className="font-semibold text-bolao-green">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Meta Máxima</span>
                <span className="font-semibold">R$ 400.000,00</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground">Meta Mínima</span>
                <span className="font-semibold text-yellow-500">R$ 100.000,00</span>
              </div>
              <div className="h-2.5 bg-[#1C2432] rounded-full overflow-hidden relative">
                {/* Min marker */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-yellow-500" style={{ left: '25%' }} />
                {/* Current balance bar */}
                <div 
                  className="h-full bg-gradient-to-r from-bolao-green to-bolao-green/70 rounded-full"
                  style={{ width: `${Math.min(100, (availableBalance / 400000) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>R$ 0</span>
                <span>R$ 100k</span>
                <span>R$ 400k</span>
              </div>
            </div>

            {/* Balance Status Alert */}
            {availableBalance > 350000 ? (
              <div className="p-3 rounded-lg bg-bolao-green/10 border border-bolao-green/20 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-bolao-green mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-bolao-green">Saldo elevado</p>
                  <p className="text-xs text-muted-foreground">
                    Considere transferir {formatCurrency(availableBalance - 300000)} para atingir a meta ideal.
                  </p>
                </div>
              </div>
            ) : availableBalance < 150000 ? (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-500">Saldo baixo</p>
                  <p className="text-xs text-muted-foreground">
                    Mantenha pelo menos R$ 100.000 para cobrir prêmios e saques pendentes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">Saldo ideal</p>
                  <p className="text-xs text-muted-foreground">
                    Seu saldo está dentro da faixa ideal de operação.
                  </p>
                </div>
              </div>
            )}

            {/* Scheduled Transfer Info */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">Transferência Agendada</span>
                </div>
                <Badge className="bg-purple-500/10 text-purple-400 border-0 text-xs">Ativa</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Toda segunda-feira, transferir R$ 10.000 se saldo &gt; R$ 150.000
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Próxima:</span>
                <span className="text-xs font-medium">24/02/2025</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transfer Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowTransferModal(true)}
          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
        >
          <Send className="w-4 h-4 mr-2" />
          Transferir para Conta Bancária
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Account Details */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Conta Bancária da Empresa</h3>
              <p className="text-xs text-muted-foreground">Dados para recebimento de transferências</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Banco</label>
                <input
                  type="text"
                  defaultValue="Banco do Brasil"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Código</label>
                <input
                  type="text"
                  defaultValue="001"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Agência</label>
                <input
                  type="text"
                  defaultValue="1234-5"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Conta</label>
                <input
                  type="text"
                  defaultValue="12345-6"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo de Conta</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
                  <option>Conta Corrente</option>
                  <option>Conta Poupança</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Titular</label>
                <input
                  type="text"
                  defaultValue="BolãoMax LTDA"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">CNPJ</label>
              <input
                type="text"
                defaultValue="12.345.678/0001-90"
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
              />
            </div>
            <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Salvar Dados Bancários
            </Button>
          </div>
        </Card>

        {/* PIX Keys */}
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <h3 className="font-semibold">Chaves PIX da Empresa</h3>
              <p className="text-xs text-muted-foreground">Configuração de chaves PIX para recebimento</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* CPF/CNPJ PIX Key */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                <Hash className="w-3 h-3" /> CPF/CNPJ
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={pixKeys.cpfCnpj}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
                <Button variant="outline" size="icon" className="border-[#1C2432]">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Email PIX Key */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                <Mail className="w-3 h-3" /> Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  defaultValue={pixKeys.email}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
                <Button variant="outline" size="icon" className="border-[#1C2432]">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Phone PIX Key */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                <Phone className="w-3 h-3" /> Telefone
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={pixKeys.telefone}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
                <Button variant="outline" size="icon" className="border-[#1C2432]">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Random PIX Key */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1.5">
                <Key className="w-3 h-3" /> Chave Aleatória
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={pixKeys.aleatoria}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm font-mono text-xs focus:outline-none focus:border-bolao-green"
                />
                <Button variant="outline" size="icon" className="border-[#1C2432]">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Salvar Chaves PIX
            </Button>
          </div>
        </Card>
      </div>

      {/* Transfer History */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Histórico de Transferências</h3>
              <p className="text-xs text-muted-foreground">Transferências realizadas para conta bancária</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter by receipt status */}
            <div className="flex items-center gap-1 bg-[#0A0E14] rounded-lg p-1">
              <button
                onClick={() => setReceiptFilter("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  receiptFilter === "all" 
                    ? "bg-[#1C2432] text-white" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setReceiptFilter("with")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  receiptFilter === "with" 
                    ? "bg-bolao-green/20 text-bolao-green" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <FileText className="w-3 h-3" />
                Com Comprovante
              </button>
              <button
                onClick={() => setReceiptFilter("without")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  receiptFilter === "without" 
                    ? "bg-yellow-500/20 text-yellow-500" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                Pendentes
                {transfersWithoutReceipt > 0 && (
                  <span className="bg-yellow-500/30 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                    {transfersWithoutReceipt}
                  </span>
                )}
              </button>
            </div>
            <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data/Hora</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Método</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Comprovante</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                  <td className="p-4 text-sm font-mono text-muted-foreground">{transfer.id}</td>
                  <td className="p-4 text-sm">{transfer.date}</td>
                  <td className="p-4 text-sm font-semibold text-bolao-green">{transfer.value}</td>
                  <td className="p-4 text-sm">
                    <Badge variant="outline" className="border-[#1C2432]">{transfer.method}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-bolao-green/10 text-bolao-green border-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Concluída
                    </Badge>
                  </td>
                  <td className="p-4">
                    {transfer.hasReceipt ? (
                      <Badge className="bg-bolao-green/10 text-bolao-green border-0 cursor-pointer hover:bg-bolao-green/20 transition-colors">
                        <FileText className="w-3 h-3 mr-1" />
                        Com Comprovante
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Sem Comprovante
                      </Badge>
                    )}
                  </td>
                  <td className="p-4">
                    {transfer.hasReceipt ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-bolao-green hover:text-bolao-green hover:bg-bolao-green/10"
                        onClick={() => handleOpenUploadModal(transfer)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Anexar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransfers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma transferência encontrada com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Receipt Modal */}
      {showUploadModal && selectedTransferForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111827] border-[#1C2432] p-6 mx-4">
            {uploadSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-bolao-green/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-bolao-green" />
                </div>
                <h3 className="text-xl font-bold text-bolao-green mb-2">Comprovante Anexado!</h3>
                <p className="text-muted-foreground">O arquivo foi salvo com sucesso.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Anexar Comprovante</h3>
                      <p className="text-xs text-muted-foreground">Transferência {selectedTransferForUpload.id}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseUploadModal} disabled={isUploading}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Transfer Details */}
                <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432] mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Data</span>
                    <span className="text-sm">{selectedTransferForUpload.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Valor</span>
                    <span className="text-sm font-semibold text-bolao-green">{selectedTransferForUpload.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Método</span>
                    <span className="text-sm">{selectedTransferForUpload.method}</span>
                  </div>
                  {selectedTransferForUpload.observations && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Observação</span>
                      <span className="text-sm text-muted-foreground">{selectedTransferForUpload.observations}</span>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Selecionar Arquivo</label>
                  <label className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block ${
                    uploadedFileName 
                      ? 'border-bolao-green/50 bg-bolao-green/5' 
                      : 'border-[#1C2432] hover:border-bolao-green/30'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {uploadedFileName ? (
                      <>
                        <FileText className="w-10 h-10 mx-auto mb-2 text-bolao-green" />
                        <p className="text-sm font-medium text-bolao-green">{uploadedFileName}</p>
                        <p className="text-xs text-muted-foreground mt-1">Clique para alterar</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Arraste ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, PNG ou JPG (máx. 5MB)</p>
                      </>
                    )}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-[#1C2432]" 
                    onClick={handleCloseUploadModal}
                    disabled={isUploading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50"
                    onClick={handleUploadReceipt}
                    disabled={isUploading || !uploadedFileName}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Salvar Comprovante
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !isProcessing) handleCloseModal();
            if (e.key === 'Enter' && !isProcessing && transferAmount && adminPassword && parseCurrencyToNumber(transferAmount) > 0 && parseCurrencyToNumber(transferAmount) <= availableBalance) {
              handleTransfer();
            }
          }}
        >
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6 mx-4">
            {/* Success State with Confetti for Large Transfers */}
            {transferSuccess ? (
              <div className="text-center py-8 relative overflow-hidden">
                {/* Confetti Animation for large transfers (>R$ 10,000) */}
                {parseCurrencyToNumber(transferAmount) >= 10000 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 50}%`,
                          backgroundColor: ['#00C853', '#FFB300', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 4)],
                          animationDelay: `${Math.random() * 0.5}s`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="w-20 h-20 rounded-full bg-bolao-green/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-bolao-green" />
                </div>
                <h3 className="text-xl font-bold text-bolao-green mb-2">Transferência Realizada!</h3>
                <p className="text-muted-foreground mb-4">O valor foi transferido com sucesso.</p>
                <div className="p-4 rounded-lg bg-[#0A0E14] border border-bolao-green/30">
                  <p className="text-xs text-muted-foreground mb-1">Novo saldo disponível</p>
                  <p className="text-2xl font-bold text-bolao-green animate-pulse">{formatCurrency(availableBalance)}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                      <Send className="w-5 h-5 text-bolao-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Transferir para Conta</h3>
                      <p className="text-xs text-muted-foreground">Transferência imediata via PIX</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleCloseModal} disabled={isProcessing}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Available Balance - Prominent */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-bolao-green/10 to-transparent border border-bolao-green/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Wallet className="w-3 h-3" /> Saldo disponível
                        </p>
                        <p className="text-2xl font-bold text-bolao-green">{formatCurrency(availableBalance)}</p>
                      </div>
                      {/* Balance After Transfer Preview */}
                      {transferAmount && parseCurrencyToNumber(transferAmount) > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Saldo após transferência</p>
                          <p className={`text-lg font-semibold ${
                            availableBalance - parseCurrencyToNumber(transferAmount) < 50000 
                              ? 'text-yellow-500' 
                              : 'text-white'
                          }`}>
                            {formatCurrency(Math.max(0, availableBalance - parseCurrencyToNumber(transferAmount)))}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Low Balance Warning */}
                    {transferAmount && parseCurrencyToNumber(transferAmount) > 0 && availableBalance - parseCurrencyToNumber(transferAmount) < 50000 && (
                      <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <p className="text-xs text-yellow-500">
                          Atenção: Saldo restante pode ser insuficiente para prêmios e saques pendentes.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Valor rápido</label>
                    <div className="flex flex-wrap gap-2">
                      {[1000, 5000, 10000, 50000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            if (amount <= availableBalance) {
                              const formatted = amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              setTransferAmount(formatted);
                            }
                          }}
                          disabled={isProcessing || amount > availableBalance}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            amount > availableBalance
                              ? 'bg-[#1C2432]/50 text-muted-foreground cursor-not-allowed'
                              : parseCurrencyToNumber(transferAmount) === amount
                                ? 'bg-bolao-green text-bolao-dark'
                                : 'bg-[#1C2432] text-white hover:bg-[#2C3442]'
                          }`}
                        >
                          R$ {amount.toLocaleString('pt-BR')}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleMaxAmount}
                        disabled={isProcessing}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          parseCurrencyToNumber(transferAmount) === availableBalance
                            ? 'bg-bolao-green text-bolao-dark'
                            : 'bg-bolao-green/20 text-bolao-green hover:bg-bolao-green/30'
                        }`}
                      >
                        Máximo
                      </button>
                    </div>
                  </div>

                  {/* Transfer Amount Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor a transferir</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                      <input
                        type="text"
                        value={transferAmount}
                        onChange={handleAmountChange}
                        placeholder="0,00"
                        disabled={isProcessing}
                        autoFocus
                        className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-xl font-bold focus:outline-none focus:border-bolao-green disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Admin Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Senha financeira
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setPasswordError(false);
                        }}
                        placeholder="Digite sua senha para confirmar"
                        disabled={isProcessing}
                        className={`w-full px-4 py-3 rounded-lg bg-[#0A0E14] border pr-12 focus:outline-none transition-colors disabled:opacity-50 ${
                          passwordError ? 'border-red-500 focus:border-red-500' : 'border-[#1C2432] focus:border-bolao-green'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        disabled={isProcessing}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Senha incorreta. Tente novamente.
                      </p>
                    )}
                  </div>

                  {/* Observations - Optional (Collapsible) */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Observações (opcional)
                    </label>
                    <input
                      type="text"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: Pagamento fornecedores, reserva mensal..."
                      disabled={isProcessing}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green disabled:opacity-50"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-[#1C2432]" 
                      onClick={handleCloseModal}
                      disabled={isProcessing}
                    >
                      Cancelar
                      <span className="ml-1 text-xs text-muted-foreground">(Esc)</span>
                    </Button>
                    <Button 
                      className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50"
                      onClick={handleTransfer}
                      disabled={isProcessing || !transferAmount || !adminPassword || parseCurrencyToNumber(transferAmount) <= 0 || parseCurrencyToNumber(transferAmount) > availableBalance}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Transferir
                          <span className="ml-1 text-xs opacity-70">(Enter)</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Quick Info */}
                  <p className="text-xs text-center text-muted-foreground">
                    Transferência via PIX • Processamento imediato
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

// Prêmios Pendentes Tab Component
const PremiosPendentesTab = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [lotteryFilter, setLotteryFilter] = useState("all");
  const [selectedPrizes, setSelectedPrizes] = useState<string[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDepositWarningModal, setShowDepositWarningModal] = useState(false);
  const [showDivisionWarningModal, setShowDivisionWarningModal] = useState(false); // Task 156
  const [selectedPrize, setSelectedPrize] = useState<typeof pendingPrizes[0] | null>(null);

  // Task 146: Define deposit status for each bolão
  const depositedBoloes = ["MG-2025-0198", "QN-2025-0645", "LF-2025-0912"]; // Bolões with deposits registered
  
  // Task 156: Define bolões with confirmed division status
  const divisionConfirmedBoloes: { [key: string]: { confirmed: boolean; totalWinners?: number; ourShare?: string; totalPrize?: string } } = {
    "MG-2025-0234": { confirmed: false }, // Awaiting division confirmation
    "QN-2025-0891": { confirmed: true, totalWinners: 5, ourShare: "R$ 3.500.000,00", totalPrize: "R$ 17.500.000,00" },
    "LF-2025-1234": { confirmed: true, totalWinners: 1, ourShare: "R$ 2.800.000,00", totalPrize: "R$ 2.800.000,00" },
    "QN-2025-0756": { confirmed: true, totalWinners: 1, ourShare: "R$ 85.000,00", totalPrize: "R$ 85.000,00" },
    "MG-2025-0198": { confirmed: true, totalWinners: 3, ourShare: "R$ 125.000,00", totalPrize: "R$ 375.000,00" },
  };
  
  const pendingPrizes = [
    { 
      id: "PRZ001", 
      concurso: "3025", 
      dataSorteio: "15/02/2025", 
      bolaoCode: "MG-2025-0234",
      lotteryType: "Mega-Sena",
      cliente: "Maria Silva Santos",
      clienteAvatar: "MS",
      cota: "15%",
      acertos: "Sena (6 acertos)",
      premioTotal: "R$ 45.000.000,00",
      premioCalculado: "R$ 6.750.000,00",
      status: "pending",
      // Task 156: Division info flag
      divisionPending: true,
    },
    { 
      id: "PRZ002", 
      concurso: "3025", 
      dataSorteio: "15/02/2025", 
      bolaoCode: "MG-2025-0234",
      lotteryType: "Mega-Sena",
      cliente: "João Pedro Oliveira",
      clienteAvatar: "JP",
      cota: "10%",
      acertos: "Sena (6 acertos)",
      premioTotal: "R$ 45.000.000,00",
      premioCalculado: "R$ 4.500.000,00",
      status: "pending",
      divisionPending: true,
    },
    { 
      id: "PRZ003", 
      concurso: "3025", 
      dataSorteio: "15/02/2025", 
      bolaoCode: "MG-2025-0234",
      lotteryType: "Mega-Sena",
      cliente: "Ana Costa",
      clienteAvatar: "AC",
      cota: "5%",
      acertos: "Sena (6 acertos)",
      premioTotal: "R$ 45.000.000,00",
      premioCalculado: "R$ 2.250.000,00",
      status: "approved",
      divisionPending: true,
    },
    { 
      id: "PRZ004", 
      concurso: "6842", 
      dataSorteio: "14/02/2025", 
      bolaoCode: "QN-2025-0891",
      lotteryType: "Quina",
      cliente: "Carlos Lima",
      clienteAvatar: "CL",
      cota: "20%",
      acertos: "Quina (5 acertos)",
      premioTotal: "R$ 3.500.000,00",
      premioCalculado: "R$ 700.000,00",
      status: "pending",
      divisionPending: false, // Division confirmed (5 winners)
    },
    { 
      id: "PRZ005", 
      concurso: "3210", 
      dataSorteio: "13/02/2025", 
      bolaoCode: "LF-2025-1234",
      lotteryType: "Lotofácil",
      cliente: "Patricia Mendes",
      clienteAvatar: "PM",
      cota: "8%",
      acertos: "15 acertos",
      premioTotal: "R$ 2.800.000,00",
      premioCalculado: "R$ 224.000,00",
      status: "paid",
      divisionPending: false,
    },
    { 
      id: "PRZ006", 
      concurso: "6840", 
      dataSorteio: "12/02/2025", 
      bolaoCode: "QN-2025-0756",
      lotteryType: "Quina",
      cliente: "Roberto Almeida",
      clienteAvatar: "RA",
      cota: "12%",
      acertos: "Quadra (4 acertos)",
      premioTotal: "R$ 85.000,00",
      premioCalculado: "R$ 10.200,00",
      status: "rejected",
      divisionPending: false,
    },
    { 
      id: "PRZ007", 
      concurso: "3024", 
      dataSorteio: "12/02/2025", 
      bolaoCode: "MG-2025-0198",
      lotteryType: "Mega-Sena",
      cliente: "Fernanda Silva",
      clienteAvatar: "FS",
      cota: "25%",
      acertos: "Quina (5 acertos)",
      premioTotal: "R$ 125.000,00",
      premioCalculado: "R$ 31.250,00",
      status: "pending",
      divisionPending: false, // Division confirmed (3 winners)
    },
  ];

  // Task 146: Check if bolão deposit is registered
  const isDepositRegistered = (bolaoCode: string) => depositedBoloes.includes(bolaoCode);
  
  // Task 156: Check if division is confirmed for bolão
  const isDivisionConfirmed = (bolaoCode: string) => divisionConfirmedBoloes[bolaoCode]?.confirmed ?? false;

  // Task 146 + 156: Handle approval with deposit and division check
  const handleApprovalClick = (prize: typeof pendingPrizes[0]) => {
    setSelectedPrize(prize);
    // First check deposit
    if (!isDepositRegistered(prize.bolaoCode)) {
      setShowDepositWarningModal(true);
      return;
    }
    // Task 156: Then check division confirmation
    if (!isDivisionConfirmed(prize.bolaoCode)) {
      setShowDivisionWarningModal(true);
      return;
    }
    // All checks passed, show approval modal
    setShowApprovalModal(true);
  };

  const filteredPrizes = pendingPrizes.filter(prize => {
    if (statusFilter !== "all" && prize.status !== statusFilter) return false;
    if (lotteryFilter !== "all" && prize.lotteryType !== lotteryFilter) return false;
    return true;
  });

  const pendingCount = pendingPrizes.filter(p => p.status === "pending").length;
  const totalPendingValue = pendingPrizes
    .filter(p => p.status === "pending")
    .reduce((sum, p) => {
      const value = parseFloat(p.premioCalculado.replace(/[R$.\s]/g, "").replace(",", "."));
      return sum + value;
    }, 0);

  const getLotteryColor = (type: string) => {
    switch (type) {
      case "Mega-Sena": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Lotofácil": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Quina": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "approved": return <Badge className="bg-blue-500/10 text-blue-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "paid": return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCheck className="w-3 h-3 mr-1" />Pago</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Recusado</Badge>;
      default: return null;
    }
  };

  const toggleSelectPrize = (id: string) => {
    setSelectedPrizes(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAllPending = () => {
    const pendingIds = pendingPrizes.filter(p => p.status === "pending").map(p => p.id);
    setSelectedPrizes(pendingIds);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Prêmios Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-orange/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-bolao-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {(totalPendingValue / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-muted-foreground">Valor Total Pendente</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingPrizes.filter(p => p.status === "paid").length}</p>
              <p className="text-sm text-muted-foreground">Pagos Este Mês</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingPrizes.length}</p>
              <p className="text-sm text-muted-foreground">Total Detectados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Auto-Detection Info */}
      <Card className="p-4 bg-gradient-to-r from-bolao-green/10 to-transparent border-bolao-green/30">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-bolao-green" />
          <div className="flex-1">
            <p className="font-semibold text-bolao-green">Sistema de Detecção Automática Ativo</p>
            <p className="text-xs text-muted-foreground">Os prêmios são detectados automaticamente quando um resultado de loteria é publicado. O sistema cruza os números sorteados com os bolões ativos e calcula os prêmios proporcionalmente.</p>
          </div>
          <Button variant="outline" className="border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Verificar Agora
          </Button>
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="paid">Pagos</option>
          <option value="rejected">Recusados</option>
        </select>

        <select 
          value={lotteryFilter}
          onChange={(e) => setLotteryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        >
          <option value="all">Todas as Loterias</option>
          <option value="Mega-Sena">Mega-Sena</option>
          <option value="Lotofácil">Lotofácil</option>
          <option value="Quina">Quina</option>
        </select>

        <div>
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>

        <div className="flex-1"></div>

        {selectedPrizes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedPrizes.length} selecionados</span>
            <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
              <CheckCheck className="w-4 h-4 mr-2" />
              Aprovar Selecionados
            </Button>
          </div>
        )}

        <Button variant="outline" className="border-[#1C2432]" onClick={selectAllPending}>
          <CheckCheck className="w-4 h-4 mr-2" />
          Selecionar Pendentes
        </Button>
      </div>

      {/* Prizes Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4 w-10">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Concurso</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Bolão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Loteria</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cota</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Acertos</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Prêmio</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrizes.map((prize) => (
                <tr key={prize.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={selectedPrizes.includes(prize.id)}
                      onChange={() => toggleSelectPrize(prize.id)}
                      disabled={prize.status !== "pending"}
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">#{prize.concurso}</span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{prize.dataSorteio}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-bolao-green">{prize.bolaoCode}</span>
                      {/* Task 146: Deposit Status Badge */}
                      {isDepositRegistered(prize.bolaoCode) ? (
                        <Badge className="bg-bolao-green/10 text-bolao-green border-0 text-[10px] px-1.5">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                          Depositado
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 border-0 text-[10px] px-1.5">
                          <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                          Sem Depósito
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={getLotteryColor(prize.lotteryType)}>
                      {prize.lotteryType}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-bolao-green">{prize.clienteAvatar}</span>
                      </div>
                      <span className="text-sm">{prize.cliente}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-semibold">{prize.cota}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{prize.acertos}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-bolao-green">{prize.premioCalculado}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(prize.status)}
                  </td>
                  <td className="p-4">
                    {prize.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
                          onClick={() => handleApprovalClick(prize)}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedPrize(prize);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    )}
                    {prize.status === "approved" && (
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Send className="w-3 h-3 mr-1" />
                        Processar
                      </Button>
                    )}
                    {prize.status === "paid" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    )}
                    {prize.status === "rejected" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Motivo
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* How It Works Section */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-bolao-green" />
          Como Funciona a Detecção Automática
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-bolao-green/10 flex items-center justify-center mb-3">
              <span className="text-bolao-green font-bold">1</span>
            </div>
            <h4 className="font-medium mb-1">Resultado Publicado</h4>
            <p className="text-xs text-muted-foreground">Sistema detecta novo resultado da Caixa Econômica</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-bolao-green/10 flex items-center justify-center mb-3">
              <span className="text-bolao-green font-bold">2</span>
            </div>
            <h4 className="font-medium mb-1">Cruzamento</h4>
            <p className="text-xs text-muted-foreground">Números sorteados são comparados com bolões ativos</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-bolao-green/10 flex items-center justify-center mb-3">
              <span className="text-bolao-green font-bold">3</span>
            </div>
            <h4 className="font-medium mb-1">Cálculo Proporcional</h4>
            <p className="text-xs text-muted-foreground">Prêmio distribuído conforme % de cota de cada participante</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-bolao-green/10 flex items-center justify-center mb-3">
              <span className="text-bolao-green font-bold">4</span>
            </div>
            <h4 className="font-medium mb-1">Aprovação Admin</h4>
            <p className="text-xs text-muted-foreground">Admin verifica e aprova/rejeita cada pagamento</p>
          </div>
        </div>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Aprovar Prêmio</h3>
                  <p className="text-xs text-muted-foreground">Confirme o pagamento do prêmio</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowApprovalModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Prize Details */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">DETALHES DO PRÊMIO</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{selectedPrize.cliente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedPrize.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cota</p>
                    <p className="font-semibold">{selectedPrize.cota}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Acertos</p>
                    <p className="font-semibold">{selectedPrize.acertos}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concurso</p>
                    <p className="font-semibold">#{selectedPrize.concurso}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loteria</p>
                    <p className="font-semibold">{selectedPrize.lotteryType}</p>
                  </div>
                </div>
              </div>

              {/* Prize Value */}
              <div className="p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
                <p className="text-xs text-muted-foreground mb-1">Valor a ser creditado na conta do usuário</p>
                <p className="text-2xl font-bold text-bolao-green">{selectedPrize.premioCalculado}</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg bg-[#0A0E14] border-2 border-bolao-green text-center">
                    <Wallet className="w-5 h-5 mx-auto mb-1 text-bolao-green" />
                    <span className="text-sm font-medium">Saldo em Conta</span>
                    <span className="text-xs text-muted-foreground block">Crédito imediato</span>
                  </button>
                  <button className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-center hover:border-[#3C4452] transition-colors">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-sm font-medium">PIX Direto</span>
                    <span className="text-xs text-muted-foreground block">Transferência imediata</span>
                  </button>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Observações do Admin (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Adicione notas internas sobre esta aprovação..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green resize-none"
                />
              </div>

              {/* Audit Info */}
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Esta ação será registrada: <span className="text-white">Administrador</span> • {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Aprovação
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Recusar Prêmio</h3>
                  <p className="text-xs text-muted-foreground">Informe o motivo da recusa</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowRejectModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Prize Info */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{selectedPrize.cliente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedPrize.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor</p>
                    <p className="font-semibold text-bolao-orange">{selectedPrize.premioCalculado}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Acertos</p>
                    <p className="font-semibold">{selectedPrize.acertos}</p>
                  </div>
                </div>
              </div>

              {/* Rejection Reason Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Motivo da Recusa *</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400">
                  <option value="">Selecione um motivo</option>
                  <option value="bolao-invalido">Bolão inválido</option>
                  <option value="calculo-incorreto">Cálculo incorreto</option>
                  <option value="suspeita-fraude">Suspeita de fraude</option>
                  <option value="duplicidade">Prêmio duplicado</option>
                  <option value="documentacao">Documentação pendente</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Detalhes adicionais (opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes adicionais sobre a recusa..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              {/* Notification */}
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-sm text-yellow-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>O usuário será notificado sobre a recusa do prêmio.</span>
                </div>
              </div>

              {/* Audit Info */}
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Esta ação será registrada: <span className="text-white">Administrador</span> • {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold">
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Recusa
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Task 146: Deposit Warning Modal */}
      {showDepositWarningModal && selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-400">Atenção!</h3>
                  <p className="text-xs text-muted-foreground">Depósito não registrado</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDepositWarningModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Warning Message */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-400 mb-2">O prêmio deste bolão ainda não foi depositado no sistema.</p>
                    <p className="text-muted-foreground">
                      Antes de aprovar o pagamento aos clientes, você deve:
                    </p>
                    <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1">
                      <li>Resgatar o prêmio na Caixa Econômica Federal</li>
                      <li>Registrar o depósito na aba <strong className="text-white">"Depósitos de Prêmios"</strong></li>
                      <li>Depois retornar aqui para aprovar os pagamentos</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Bolão Info */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">INFORMAÇÕES DO BOLÃO</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedPrize.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loteria</p>
                    <p className="font-semibold">{selectedPrize.lotteryType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prêmio Total</p>
                    <p className="font-semibold text-bolao-green">{selectedPrize.premioTotal}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concurso</p>
                    <p className="font-semibold">#{selectedPrize.concurso}</p>
                  </div>
                </div>
              </div>

              {/* Prize to pay */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Valor a pagar para {selectedPrize.cliente}</p>
                    <p className="text-xl font-bold text-yellow-500">{selectedPrize.premioCalculado}</p>
                  </div>
                  <Badge className="bg-red-500/10 text-red-400 border-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Sem Depósito
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowDepositWarningModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-bolao-orange hover:bg-bolao-orange/80 text-bolao-dark font-semibold"
                  onClick={() => {
                    setShowDepositWarningModal(false);
                    // In a real app, this would redirect to the deposits tab
                  }}
                >
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Ir para Depósitos
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Task 156: Division Warning Modal */}
      {showDivisionWarningModal && selectedPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-orange/10 flex items-center justify-center">
                  <Split className="w-5 h-5 text-bolao-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-bolao-orange">Atenção!</h3>
                  <p className="text-xs text-muted-foreground">Verificação de divisão necessária</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDivisionWarningModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Warning Message */}
              <div className="p-4 rounded-lg bg-bolao-orange/10 border border-bolao-orange/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-bolao-orange mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-bolao-orange mb-2">Este prêmio pode estar dividido com outros ganhadores.</p>
                    <p className="text-muted-foreground">
                      Antes de aprovar o pagamento, você deve verificar na Caixa quantos ganhadores existem e confirmar o valor real que receberemos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bolão Info */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">INFORMAÇÕES DO BOLÃO</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedPrize.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concurso</p>
                    <p className="font-semibold">#{selectedPrize.concurso}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loteria</p>
                    <p className="font-semibold">{selectedPrize.lotteryType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Prêmio Anunciado</p>
                    <p className="font-semibold text-yellow-500">{selectedPrize.premioTotal}</p>
                  </div>
                </div>
              </div>

              {/* What to check */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-400 mb-2">O que verificar na Caixa:</p>
                    <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Quantos bilhetes ganharam no total (incluindo fora do BolãoMax)?</li>
                      <li>Qual foi o valor por ganhador após a divisão?</li>
                      <li>Registre essas informações na aba "Depósitos de Prêmios"</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Current calculation warning */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-red-400 mb-1">Cálculo atual pode estar incorreto!</p>
                    <p className="text-muted-foreground">
                      O valor de <strong className="text-white">{selectedPrize.premioCalculado}</strong> foi calculado com base no prêmio total. 
                      Se houver outros ganhadores, o valor real será menor.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowDivisionWarningModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-bolao-orange hover:bg-bolao-orange/80 text-bolao-dark font-semibold"
                  onClick={() => {
                    setShowDivisionWarningModal(false);
                    // In a real app, this would redirect to the deposits tab to confirm division
                  }}
                >
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  Verificar Divisão
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Saques (Withdrawals) Tab Component
const SaquesTab = () => {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSaque, setSelectedSaque] = useState<typeof saques[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const saques = [
    { 
      id: "SAQ001", 
      dataSolicitacao: "15/02/2025 14:32",
      cliente: "Maria Silva Santos",
      clienteAvatar: "MS",
      clienteEmail: "maria.silva@email.com",
      valor: "R$ 2.500,00",
      metodo: "PIX",
      chavePix: "maria.silva@email.com",
      dadosBancarios: null,
      status: "pending",
      tempoDecorrido: "2h 15min",
      saldoDisponivel: true,
      contaVerificada: true,
      semPendencias: true,
    },
    { 
      id: "SAQ002", 
      dataSolicitacao: "15/02/2025 10:15",
      cliente: "João Pedro Oliveira",
      clienteAvatar: "JP",
      clienteEmail: "joao.pedro@email.com",
      valor: "R$ 850,00",
      metodo: "PIX",
      chavePix: "11999887766",
      dadosBancarios: null,
      status: "pending",
      tempoDecorrido: "6h 32min",
      saldoDisponivel: true,
      contaVerificada: true,
      semPendencias: true,
    },
    { 
      id: "SAQ003", 
      dataSolicitacao: "14/02/2025 18:45",
      cliente: "Ana Costa",
      clienteAvatar: "AC",
      clienteEmail: "ana.costa@email.com",
      valor: "R$ 5.000,00",
      metodo: "Transferência",
      chavePix: null,
      dadosBancarios: "Banco do Brasil • Ag: 1234 • CC: 56789-0",
      status: "processing",
      tempoDecorrido: "22h 02min",
      saldoDisponivel: true,
      contaVerificada: true,
      semPendencias: false,
    },
    { 
      id: "SAQ004", 
      dataSolicitacao: "14/02/2025 09:20",
      cliente: "Carlos Lima",
      clienteAvatar: "CL",
      clienteEmail: "carlos.lima@email.com",
      valor: "R$ 1.200,00",
      metodo: "PIX",
      chavePix: "12345678901",
      dadosBancarios: null,
      status: "completed",
      tempoDecorrido: "4h 10min",
      saldoDisponivel: true,
      contaVerificada: true,
      semPendencias: true,
    },
    { 
      id: "SAQ005", 
      dataSolicitacao: "13/02/2025 16:30",
      cliente: "Patricia Mendes",
      clienteAvatar: "PM",
      clienteEmail: "patricia@email.com",
      valor: "R$ 3.500,00",
      metodo: "PIX",
      chavePix: "patricia@email.com",
      dadosBancarios: null,
      status: "rejected",
      tempoDecorrido: "-",
      saldoDisponivel: false,
      contaVerificada: true,
      semPendencias: true,
    },
    { 
      id: "SAQ006", 
      dataSolicitacao: "14/02/2025 08:00",
      cliente: "Roberto Almeida",
      clienteAvatar: "RA",
      clienteEmail: "roberto@email.com",
      valor: "R$ 750,00",
      metodo: "PIX",
      chavePix: "roberto@email.com",
      dadosBancarios: null,
      status: "pending",
      tempoDecorrido: "28h 47min",
      saldoDisponivel: true,
      contaVerificada: false,
      semPendencias: true,
    },
  ];

  const filteredSaques = saques.filter(saque => {
    if (statusFilter !== "all" && saque.status !== statusFilter) return false;
    if (searchTerm && !saque.cliente.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const pendingCount = saques.filter(s => s.status === "pending").length;
  const processingCount = saques.filter(s => s.status === "processing").length;
  const overdueCount = saques.filter(s => s.status === "pending" && s.tempoDecorrido.includes("h") && parseInt(s.tempoDecorrido) > 24).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "processing": return <Badge className="bg-blue-500/10 text-blue-400 border-0"><RefreshCw className="w-3 h-3 mr-1" />Processando</Badge>;
      case "completed": return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Concluído</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Recusado</Badge>;
      case "cancelled": return <Badge className="bg-gray-500/10 text-gray-400 border-0"><Ban className="w-3 h-3 mr-1" />Cancelado</Badge>;
      default: return null;
    }
  };

  const isOverdue = (tempo: string) => {
    if (tempo === "-") return false;
    const hours = parseInt(tempo.split("h")[0]);
    return hours >= 24;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Saques Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{processingCount}</p>
              <p className="text-sm text-muted-foreground">Em Processamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{saques.filter(s => s.status === "completed").length}</p>
              <p className="text-sm text-muted-foreground">Concluídos Hoje</p>
            </div>
          </div>
        </Card>
        <Card className={`p-5 ${overdueCount > 0 ? "bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30" : "bg-[#111827] border-[#1C2432]"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${overdueCount > 0 ? "bg-red-500/20" : "bg-bolao-orange/10"}`}>
              <AlertCircle className={`w-6 h-6 ${overdueCount > 0 ? "text-red-400" : "text-bolao-orange"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-400" : ""}`}>{overdueCount}</p>
              <p className="text-sm text-muted-foreground">Acima de 24h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* SLA Warning */}
      {overdueCount > 0 && (
        <Card className="p-4 bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Atenção: Saques fora do SLA!</p>
              <p className="text-xs text-muted-foreground">{overdueCount} saque(s) estão pendentes há mais de 24 horas. Processe-os imediatamente.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="processing">Processando</option>
          <option value="completed">Concluídos</option>
          <option value="rejected">Recusados</option>
          <option value="cancelled">Cancelados</option>
        </select>

        <div>
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>

        <Button variant="outline" className="border-[#1C2432]">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Saques Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Método</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Destino</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Tempo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSaques.map((saque) => (
                <tr key={saque.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                  <td className="p-4 text-sm text-muted-foreground">{saque.dataSolicitacao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-bolao-green">{saque.clienteAvatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{saque.cliente}</p>
                        <p className="text-xs text-muted-foreground">{saque.clienteEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-bolao-green">{saque.valor}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="border-[#1C2432]">
                      {saque.metodo === "PIX" ? <Zap className="w-3 h-3 mr-1" /> : <Building className="w-3 h-3 mr-1" />}
                      {saque.metodo}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-muted-foreground">
                      {saque.chavePix || saque.dadosBancarios}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${isOverdue(saque.tempoDecorrido) ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>
                      {saque.tempoDecorrido}
                      {isOverdue(saque.tempoDecorrido) && <AlertCircle className="w-3 h-3 inline ml-1" />}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(saque.status)}
                  </td>
                  <td className="p-4">
                    {(saque.status === "pending" || saque.status === "processing") && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
                          onClick={() => {
                            setSelectedSaque(saque);
                            setShowProcessModal(true);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Processar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedSaque(saque);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {saque.status === "completed" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <FileText className="w-3 h-3 mr-1" />
                        Comprovante
                      </Button>
                    )}
                    {saque.status === "rejected" && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver Motivo
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Process Withdrawal Modal */}
      {showProcessModal && selectedSaque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                  <Send className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Processar Saque</h3>
                  <p className="text-xs text-muted-foreground">Confirme o pagamento do saque</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowProcessModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* User Details */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">DADOS DO CLIENTE</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-bolao-green">{selectedSaque.clienteAvatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedSaque.cliente}</p>
                    <p className="text-sm text-muted-foreground">{selectedSaque.clienteEmail}</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div className="p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
                <p className="text-xs text-muted-foreground mb-1">Valor do Saque</p>
                <p className="text-2xl font-bold text-bolao-green">{selectedSaque.valor}</p>
              </div>

              {/* Payment Destination */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">DESTINO DO PAGAMENTO</h4>
                <div className="flex items-center gap-3">
                  {selectedSaque.metodo === "PIX" ? (
                    <>
                      <Zap className="w-5 h-5 text-bolao-green" />
                      <div>
                        <p className="text-sm font-medium">PIX</p>
                        <p className="text-sm font-mono text-muted-foreground">{selectedSaque.chavePix}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Building className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium">Transferência Bancária</p>
                        <p className="text-sm text-muted-foreground">{selectedSaque.dadosBancarios}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">VERIFICAÇÃO</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Saldo disponível</span>
                    {selectedSaque.saldoDisponivel ? (
                      <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />OK</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Insuficiente</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conta verificada</span>
                    {selectedSaque.contaVerificada ? (
                      <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />OK</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sem pendências</span>
                    {selectedSaque.semPendencias ? (
                      <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />OK</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><AlertCircle className="w-3 h-3 mr-1" />Verificar</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Comprovante */}
              <div>
                <label className="block text-sm font-medium mb-2">Upload do Comprovante</label>
                <div className="border-2 border-dashed border-[#1C2432] rounded-lg p-4 text-center hover:border-bolao-green/50 transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Anexe o comprovante de pagamento</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Adicione notas internas..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green resize-none"
                />
              </div>

              {/* Audit Info */}
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ação registrada: <span className="text-white">Administrador</span> • {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowProcessModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Pagamento
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Withdrawal Modal */}
      {showRejectModal && selectedSaque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Recusar Saque</h3>
                  <p className="text-xs text-muted-foreground">Informe o motivo da recusa</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowRejectModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-sm"><span className="text-muted-foreground">Cliente:</span> {selectedSaque.cliente}</p>
                <p className="text-sm"><span className="text-muted-foreground">Valor:</span> <span className="text-bolao-orange">{selectedSaque.valor}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivo da Recusa *</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400">
                  <option value="">Selecione um motivo</option>
                  <option value="saldo-insuficiente">Saldo insuficiente</option>
                  <option value="dados-incorretos">Dados bancários incorretos</option>
                  <option value="conta-nao-verificada">Conta não verificada</option>
                  <option value="suspeita-fraude">Suspeita de fraude</option>
                  <option value="limite-excedido">Limite diário excedido</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Detalhes (opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes adicionais..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 text-sm text-yellow-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>O valor será devolvido ao saldo do usuário.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold">
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirmar Recusa
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Reembolsos (Refunds) Tab Component
const ReembolsosTab = () => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedReembolso, setSelectedReembolso] = useState<typeof reembolsos[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [refundFeePercentage, setRefundFeePercentage] = useState(20);

  // Calculate refund values with automatic 20% fee
  const calculateRefundValues = (valorOriginal: string) => {
    const original = parseFloat(valorOriginal.replace(/[R$.\s]/g, "").replace(",", "."));
    const taxa = original * (refundFeePercentage / 100);
    const valorReembolso = original - taxa;
    return {
      valorOriginal: original,
      taxa,
      valorReembolso,
      taxaFormatted: `R$ ${taxa.toFixed(2).replace(".", ",")}`,
      valorReembolsoFormatted: `R$ ${valorReembolso.toFixed(2).replace(".", ",")}`
    };
  };

  const reembolsos = [
    { 
      id: "RMB001", 
      dataSolicitacao: "15/02/2025 14:32",
      cliente: "Maria Silva Santos",
      clienteAvatar: "MS",
      clienteEmail: "maria.silva@email.com",
      bolaoCode: "MG-2025-0234",
      lotteryType: "Mega-Sena",
      motivo: "Desistência voluntária",
      valorOriginal: "R$ 150,00",
      ...calculateRefundValues("R$ 150,00"),
      status: "pending",
      applyFee: true
    },
    { 
      id: "RMB002", 
      dataSolicitacao: "15/02/2025 10:15",
      cliente: "João Pedro Oliveira",
      clienteAvatar: "JP",
      clienteEmail: "joao.pedro@email.com",
      bolaoCode: "LF-2025-1122",
      lotteryType: "Lotofácil",
      motivo: "Compra duplicada",
      valorOriginal: "R$ 75,00",
      taxa: 0,
      valorReembolso: 75,
      taxaFormatted: "R$ 0,00",
      valorReembolsoFormatted: "R$ 75,00",
      status: "pending",
      applyFee: false // Compra duplicada = sem taxa
    },
    { 
      id: "RMB003", 
      dataSolicitacao: "14/02/2025 18:45",
      cliente: "Ana Costa",
      clienteAvatar: "AC",
      clienteEmail: "ana.costa@email.com",
      bolaoCode: "QN-2025-0891",
      lotteryType: "Quina",
      motivo: "Bolão cancelado",
      valorOriginal: "R$ 200,00",
      taxa: 0,
      valorReembolso: 200,
      taxaFormatted: "R$ 0,00",
      valorReembolsoFormatted: "R$ 200,00",
      status: "approved",
      applyFee: false // Bolão cancelado = sem taxa
    },
    { 
      id: "RMB004", 
      dataSolicitacao: "14/02/2025 09:20",
      cliente: "Carlos Lima",
      clienteAvatar: "CL",
      clienteEmail: "carlos.lima@email.com",
      bolaoCode: "MG-2025-0198",
      lotteryType: "Mega-Sena",
      motivo: "Erro no sistema",
      valorOriginal: "R$ 350,00",
      taxa: 0,
      valorReembolso: 350,
      taxaFormatted: "R$ 0,00",
      valorReembolsoFormatted: "R$ 350,00",
      status: "processed",
      applyFee: false // Erro no sistema = sem taxa
    },
    { 
      id: "RMB005", 
      dataSolicitacao: "13/02/2025 16:30",
      cliente: "Patricia Mendes",
      clienteAvatar: "PM",
      clienteEmail: "patricia@email.com",
      bolaoCode: "LF-2025-0987",
      lotteryType: "Lotofácil",
      motivo: "Desistência voluntária",
      valorOriginal: "R$ 100,00",
      ...calculateRefundValues("R$ 100,00"),
      status: "processed",
      applyFee: true
    },
  ];

  const filteredReembolsos = reembolsos.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = reembolsos.filter(r => r.status === "pending").length;
  const totalPendingValue = reembolsos
    .filter(r => r.status === "pending")
    .reduce((sum, r) => sum + parseFloat(r.valor.replace(/[R$.\s]/g, "").replace(",", ".")), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "approved": return <Badge className="bg-blue-500/10 text-blue-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case "processed": return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCheck className="w-3 h-3 mr-1" />Processado</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Recusado</Badge>;
      default: return null;
    }
  };

  const getLotteryColor = (type: string) => {
    switch (type) {
      case "Mega-Sena": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Lotofácil": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Quina": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  // Calculate refund rate
  const refundRate = ((reembolsos.filter(r => r.status === "processed").length / reembolsos.length) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-orange/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-bolao-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {totalPendingValue.toLocaleString('pt-BR')}</p>
              <p className="text-sm text-muted-foreground">Valor Pendente</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reembolsos.filter(r => r.status === "processed").length}</p>
              <p className="text-sm text-muted-foreground">Processados</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reembolsos.filter(r => r.status === "rejected").length}</p>
              <p className="text-sm text-muted-foreground">Recusados</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{refundRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Reembolso</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="processed">Processados</option>
          <option value="rejected">Recusados</option>
        </select>

        <div>
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>

        <div className="flex-1"></div>

        <Button variant="outline" className="border-[#1C2432]">
          <Download className="w-4 h-4 mr-2" />
          Relatório
        </Button>

        <Button 
          variant="outline" 
          className="border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10"
          onClick={() => setShowConfigModal(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Políticas
        </Button>
      </div>

      {/* Reembolsos Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Bolão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Motivo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor Original</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Taxa (20%)</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor Reembolso</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredReembolsos.map((reembolso) => (
                <tr key={reembolso.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                  <td className="p-4 text-sm text-muted-foreground">{reembolso.dataSolicitacao}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-bolao-green">{reembolso.clienteAvatar}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{reembolso.cliente}</p>
                        <p className="text-xs text-muted-foreground">{reembolso.clienteEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="font-mono text-sm text-bolao-green">{reembolso.bolaoCode}</span>
                      <Badge variant="outline" className={`ml-2 ${getLotteryColor(reembolso.lotteryType)}`}>
                        {reembolso.lotteryType}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{reembolso.motivo}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{reembolso.valorOriginal}</span>
                  </td>
                  <td className="p-4">
                    {reembolso.applyFee ? (
                      <span className="text-sm text-bolao-orange font-semibold">{reembolso.taxaFormatted}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Isento</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-bolao-green">{reembolso.valorReembolsoFormatted}</span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(reembolso.status)}
                  </td>
                  <td className="p-4">
                    {reembolso.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
                          onClick={() => {
                            setSelectedReembolso(reembolso);
                            setShowApprovalModal(true);
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => {
                            setSelectedReembolso(reembolso);
                            setShowRejectModal(true);
                          }}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {reembolso.status === "approved" && (
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Send className="w-3 h-3 mr-1" />
                        Processar
                      </Button>
                    )}
                    {(reembolso.status === "processed" || reembolso.status === "rejected") && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <Eye className="w-3 h-3 mr-1" />
                        Detalhes
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Automatic Refund Triggers Info */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-bolao-green" />
          Reembolsos Automáticos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="font-medium mb-1">Bolão Cancelado</h4>
            <p className="text-xs text-muted-foreground">Reembolso integral automático quando um bolão é cancelado pelo admin</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <h4 className="font-medium mb-1">Erro no Sistema</h4>
            <p className="text-xs text-muted-foreground">Reembolso automático para transações com erro de processamento</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="font-medium mb-1">Sorteio Adiado</h4>
            <p className="text-xs text-muted-foreground">Opção de reembolso oferecida quando sorteio é adiado pela Caixa</p>
          </div>
        </div>
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedReembolso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Aprovar Reembolso</h3>
                  <p className="text-xs text-muted-foreground">Confirme o reembolso com cálculo automático de taxa</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowApprovalModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-semibold">{selectedReembolso.cliente}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedReembolso.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Motivo</p>
                    <p className="font-semibold">{selectedReembolso.motivo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Taxa aplicada</p>
                    <p className="font-semibold">{selectedReembolso.applyFee ? `${refundFeePercentage}%` : "Isento"}</p>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432] space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Original</span>
                  <span className="font-medium">{selectedReembolso.valorOriginal}</span>
                </div>
                {selectedReembolso.applyFee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Cancelamento ({refundFeePercentage}%)</span>
                    <span className="text-bolao-orange font-medium">- {selectedReembolso.taxaFormatted}</span>
                  </div>
                )}
                <div className="border-t border-[#1C2432] pt-3 flex justify-between">
                  <span className="text-muted-foreground font-medium">Valor a Reembolsar</span>
                  <span className="text-bolao-green font-bold text-lg">{selectedReembolso.valorReembolsoFormatted}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
                <p className="text-xs text-muted-foreground mb-1">Valor a ser creditado na conta do usuário</p>
                <p className="text-2xl font-bold text-bolao-green">{selectedReembolso.valorReembolsoFormatted}</p>
              </div>

              {selectedReembolso.applyFee && (
                <div className="p-3 rounded-lg bg-bolao-orange/10 border border-bolao-orange/30">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-bolao-orange font-semibold">{selectedReembolso.taxaFormatted}</span> será retido como taxa de cancelamento (tipo: REFUND_FEE)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Observações (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Adicione notas sobre esta aprovação..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Reembolso
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReembolso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Recusar Reembolso</h3>
                  <p className="text-xs text-muted-foreground">Informe o motivo</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowRejectModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-sm"><span className="text-muted-foreground">Cliente:</span> {selectedReembolso.cliente}</p>
                <p className="text-sm"><span className="text-muted-foreground">Valor:</span> <span className="text-bolao-orange">{selectedReembolso.valor}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivo da Recusa *</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400">
                  <option value="">Selecione um motivo</option>
                  <option value="prazo">Fora do prazo permitido</option>
                  <option value="politica">Não se enquadra na política</option>
                  <option value="bolao-fechado">Bolão já fechado</option>
                  <option value="abuso">Suspeita de abuso</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Detalhes (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Descreva detalhes..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold">
                  <XCircle className="w-4 h-4 mr-2" />
                  Recusar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Políticas de Reembolso</h3>
                  <p className="text-xs text-muted-foreground">Configure as regras de reembolso</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowConfigModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Taxa de Cancelamento (%)</label>
                <input
                  type="number"
                  value={refundFeePercentage}
                  onChange={(e) => setRefundFeePercentage(Number(e.target.value))}
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
                <p className="text-xs text-muted-foreground mt-1">Taxa padrão: 20%. Valor retido do usuário em caso de cancelamento voluntário.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prazo Máximo para Solicitação</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
                  <option value="24">Até 24 horas antes do sorteio</option>
                  <option value="12">Até 12 horas antes do sorteio</option>
                  <option value="6">Até 6 horas antes do sorteio</option>
                  <option value="3">Até 3 horas antes do sorteio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivos com Taxa ({refundFeePercentage}%)</label>
                <div className="space-y-2">
                  {[
                    { motivo: "Desistência voluntária", hasFee: true },
                    { motivo: "Compra duplicada", hasFee: false },
                    { motivo: "Erro no sistema", hasFee: false },
                    { motivo: "Bolão cancelado", hasFee: false },
                    { motivo: "Sorteio adiado", hasFee: false }
                  ].map(({ motivo, hasFee }) => (
                    <label key={motivo} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0E14]">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">{motivo}</span>
                      </div>
                      <Badge variant="outline" className={hasFee ? "text-bolao-orange border-bolao-orange/30" : "text-bolao-green border-bolao-green/30"}>
                        {hasFee ? `${refundFeePercentage}% taxa` : "Isento"}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-bolao-orange/10 border border-bolao-orange/30">
                <h4 className="text-sm font-semibold text-bolao-orange mb-2">Exemplo de cálculo</h4>
                <p className="text-xs text-muted-foreground">
                  Participação de R$ 100,00 com taxa de {refundFeePercentage}%:
                  <br />
                  • Taxa retida: R$ {(100 * refundFeePercentage / 100).toFixed(2).replace(".", ",")}
                  <br />
                  • Valor reembolsado: R$ {(100 * (1 - refundFeePercentage / 100)).toFixed(2).replace(".", ",")}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Políticas
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Depósitos da Empresa (Prize Deposits) Tab Component - Task 143
const DepositosEmpresaTab = () => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<typeof depositHistory[0] | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSource, setDepositSource] = useState("");
  const [relatedBolao, setRelatedBolao] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [concursoNumber, setConcursoNumber] = useState("");
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  // Task 154: Prize Division State
  const [isPrizeDivided, setIsPrizeDivided] = useState(false);
  const [totalWinners, setTotalWinners] = useState("1");
  const [totalAnnouncedPrize, setTotalAnnouncedPrize] = useState("");
  const [ourBolaoWinningTickets, setOurBolaoWinningTickets] = useState("1");
  
  // Task 154: Calculate our share based on division
  const calculateOurShare = () => {
    if (!isPrizeDivided) return totalAnnouncedPrize;
    const total = parseFloat(totalAnnouncedPrize.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    const winners = parseInt(totalWinners) || 1;
    const ourTickets = parseInt(ourBolaoWinningTickets) || 1;
    const perWinner = total / winners;
    const ourShare = perWinner * ourTickets;
    return ourShare;
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Task 158: Mock winning bolões with division info
  const winningBoloes = [
    { 
      code: "MG-2025-0234", 
      type: "Mega-Sena", 
      concurso: "3025", 
      prize: "R$ 45.000.000,00", 
      date: "15/02/2025", 
      status: "awaiting_deposit",
      // Task 158: Division info
      isDivided: false,
      totalWinners: 1,
      totalAnnouncedPrize: "R$ 45.000.000,00",
      ourShare: "R$ 45.000.000,00",
    },
    { 
      code: "QN-2025-0891", 
      type: "Quina", 
      concurso: "6842", 
      prize: "R$ 3.500.000,00", 
      date: "14/02/2025", 
      status: "awaiting_deposit",
      // Divided prize (5 winners)
      isDivided: true,
      totalWinners: 5,
      totalAnnouncedPrize: "R$ 17.500.000,00",
      ourShare: "R$ 3.500.000,00",
    },
    { 
      code: "LF-2025-1234", 
      type: "Lotofácil", 
      concurso: "3210", 
      prize: "R$ 2.800.000,00", 
      date: "13/02/2025", 
      status: "deposited",
      isDivided: false,
      totalWinners: 1,
      totalAnnouncedPrize: "R$ 2.800.000,00",
      ourShare: "R$ 2.800.000,00",
    },
    { 
      code: "MG-2025-0198", 
      type: "Mega-Sena", 
      concurso: "3024", 
      prize: "R$ 125.000,00", 
      date: "12/02/2025", 
      status: "distributed",
      // Divided prize (3 winners)
      isDivided: true,
      totalWinners: 3,
      totalAnnouncedPrize: "R$ 375.000,00",
      ourShare: "R$ 125.000,00",
    },
  ];

  // Task 158: Mock deposit history with division info
  const depositHistory = [
    {
      id: "DEP001",
      date: "13/02/2025 16:45",
      amount: "R$ 2.800.000,00",
      source: "Prêmio Lotofácil",
      bolaoCode: "LF-2025-1234",
      concurso: "3210",
      paymentMethod: "TED Caixa",
      status: "completed",
      hasReceipt: true,
      adminName: "Admin João",
      notes: "Resgate na agência central da Caixa",
      // Task 158: Division info for history
      isDivided: false,
      totalWinners: 1,
    },
    {
      id: "DEP002",
      date: "10/02/2025 11:30",
      amount: "R$ 125.000,00",
      source: "Prêmio Mega-Sena",
      bolaoCode: "MG-2025-0198",
      concurso: "3024",
      paymentMethod: "PIX Caixa",
      status: "completed",
      hasReceipt: true,
      adminName: "Admin Maria",
      notes: "Quina - 5 acertos",
      // Task 158: Divided prize (3 winners)
      isDivided: true,
      totalWinners: 3,
      totalAnnouncedPrize: "R$ 375.000,00",
    },
    {
      id: "DEP003",
      date: "05/02/2025 09:15",
      amount: "R$ 85.420,00",
      source: "Prêmio Quina",
      bolaoCode: "QN-2025-0645",
      concurso: "6830",
      paymentMethod: "TED Caixa",
      status: "completed",
      hasReceipt: true,
      adminName: "Admin João",
      notes: "Quadra - 4 acertos",
      isDivided: false,
      totalWinners: 1,
    },
    {
      id: "DEP004",
      date: "28/01/2025 14:22",
      amount: "R$ 1.250.000,00",
      source: "Prêmio Lotofácil",
      bolaoCode: "LF-2025-0912",
      concurso: "3195",
      paymentMethod: "TED Caixa",
      status: "completed",
      hasReceipt: true,
      adminName: "Admin Maria",
      notes: "15 acertos",
      // Task 158: Divided prize (2 winners)
      isDivided: true,
      totalWinners: 2,
      totalAnnouncedPrize: "R$ 2.500.000,00",
    },
  ];

  // Stats calculations
  const totalDeposited = depositHistory.reduce((sum, d) => {
    const value = parseFloat(d.amount.replace(/[R$.\s]/g, "").replace(",", "."));
    return sum + value;
  }, 0);

  const awaitingDepositCount = winningBoloes.filter(b => b.status === "awaiting_deposit").length;
  const totalAwaitingValue = winningBoloes
    .filter(b => b.status === "awaiting_deposit")
    .reduce((sum, b) => {
      const value = parseFloat(b.prize.replace(/[R$.\s]/g, "").replace(",", "."));
      return sum + value;
    }, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_deposit": 
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-0"><Clock className="w-3 h-3 mr-1" />Aguardando Depósito</Badge>;
      case "deposited": 
        return <Badge className="bg-blue-500/10 text-blue-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Depositado</Badge>;
      case "distributed": 
        return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCheck className="w-3 h-3 mr-1" />Distribuído</Badge>;
      case "completed":
        return <Badge className="bg-bolao-green/10 text-bolao-green border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Concluído</Badge>;
      default: 
        return null;
    }
  };

  const getLotteryColor = (type: string) => {
    switch (type) {
      case "Mega-Sena": return "bg-green-500/10 text-green-400 border-green-500/30";
      case "Lotofácil": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "Quina": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const handleViewDetails = (deposit: typeof depositHistory[0]) => {
    setSelectedDeposit(deposit);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-400">Depósitos de Prêmios da Caixa</p>
            <p className="text-xs text-muted-foreground">
              Registre aqui os prêmios resgatados na Caixa Econômica Federal para distribuição aos ganhadores.
              Após o registro, os prêmios poderão ser aprovados na aba "Prêmios Pendentes".
            </p>
          </div>
        </div>
      </Card>

      {/* Task 144: Workflow Explanation - Prize Flow Guide */}
      <Card className="p-6 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Guia de Gestão de Prêmios</h3>
            <p className="text-xs text-muted-foreground">Fluxo completo desde a detecção do vencedor até o crédito na conta do usuário</p>
          </div>
        </div>

        {/* 5-Step Workflow */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-bolao-green via-yellow-500 via-bolao-orange to-bolao-green hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="relative p-4 rounded-lg bg-[#0A0E14] border border-bolao-green/30 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-bolao-green/10 flex items-center justify-center ring-2 ring-bolao-green/30 relative z-10">
                <Sparkles className="w-6 h-6 text-bolao-green" />
              </div>
              <Badge className="bg-bolao-green/10 text-bolao-green border-0 mb-2">Automático</Badge>
              <h4 className="font-semibold text-sm mb-1">1. Sistema Detecta Vencedor</h4>
              <p className="text-xs text-muted-foreground">O sistema cruza automaticamente os resultados com os bolões e identifica os ganhadores</p>
            </div>

            {/* Step 2 */}
            <div className="relative p-4 rounded-lg bg-[#0A0E14] border border-yellow-500/30 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/10 flex items-center justify-center ring-2 ring-yellow-500/30 relative z-10">
                <Building className="w-6 h-6 text-yellow-500" />
              </div>
              <Badge className="bg-yellow-500/10 text-yellow-500 border-0 mb-2">Manual</Badge>
              <h4 className="font-semibold text-sm mb-1">2. Admin Resgata na Caixa</h4>
              <p className="text-xs text-muted-foreground">Admin vai fisicamente à agência da Caixa ou lotérica para resgatar o prêmio com o bilhete</p>
            </div>

            {/* Step 3 */}
            <div className="relative p-4 rounded-lg bg-[#0A0E14] border border-bolao-orange/30 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-bolao-orange/10 flex items-center justify-center ring-2 ring-bolao-orange/30 relative z-10">
                <ArrowDownToLine className="w-6 h-6 text-bolao-orange" />
              </div>
              <Badge className="bg-bolao-orange/10 text-bolao-orange border-0 mb-2">Esta Tela</Badge>
              <h4 className="font-semibold text-sm mb-1">3. Registra Depósito no Sistema</h4>
              <p className="text-xs text-muted-foreground">Após receber o dinheiro, registra nesta tela usando "Registrar Depósito de Prêmio"</p>
            </div>

            {/* Step 4 */}
            <div className="relative p-4 rounded-lg bg-[#0A0E14] border border-purple-500/30 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/10 flex items-center justify-center ring-2 ring-purple-500/30 relative z-10">
                <CheckCircle2 className="w-6 h-6 text-purple-400" />
              </div>
              <Badge className="bg-purple-500/10 text-purple-400 border-0 mb-2">Manual</Badge>
              <h4 className="font-semibold text-sm mb-1">4. Aprova Pagamentos</h4>
              <p className="text-xs text-muted-foreground">Na aba "Prêmios Pendentes", admin aprova o pagamento para cada participante do bolão</p>
            </div>

            {/* Step 5 */}
            <div className="relative p-4 rounded-lg bg-[#0A0E14] border border-bolao-green/30 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-bolao-green/10 flex items-center justify-center ring-2 ring-bolao-green/30 relative z-10">
                <Wallet className="w-6 h-6 text-bolao-green" />
              </div>
              <Badge className="bg-bolao-green/10 text-bolao-green border-0 mb-2">Automático</Badge>
              <h4 className="font-semibold text-sm mb-1">5. Crédito aos Ganhadores</h4>
              <p className="text-xs text-muted-foreground">O valor é creditado automaticamente na conta dos usuários após aprovação</p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-yellow-500">Importante - Sequência Obrigatória</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>O depósito <strong className="text-white">deve ser registrado</strong> antes de aprovar pagamentos aos usuários</li>
                <li>O resgate do prêmio na Caixa é feito <strong className="text-white">presencialmente</strong> pelo admin com o bilhete premiado</li>
                <li>Prêmios acima de R$ 10.000 são pagos exclusivamente nas <strong className="text-white">agências da Caixa</strong></li>
                <li>Mantenha o comprovante de recebimento para registro e auditoria</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{awaitingDepositCount}</p>
              <p className="text-sm text-muted-foreground">Aguardando Depósito</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-orange/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-bolao-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {(totalAwaitingValue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-muted-foreground">Valor Aguardando</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <ArrowDownToLine className="w-6 h-6 text-bolao-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{depositHistory.length}</p>
              <p className="text-sm text-muted-foreground">Depósitos Realizados</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-[#111827] border-[#1C2432]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">R$ {(totalDeposited / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-muted-foreground">Total Depositado</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Action Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowDepositModal(true)}
          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
        >
          <ArrowDownToLine className="w-4 h-4 mr-2" />
          Registrar Depósito de Prêmio
        </Button>
      </div>

      {/* Bolões Awaiting Deposit */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold">Bolões Aguardando Depósito</h3>
              <p className="text-xs text-muted-foreground">Prêmios ganhos que ainda não foram registrados no sistema</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {winningBoloes.filter(b => b.status === "awaiting_deposit").map((bolao, i) => (
            <div key={i} className={`p-4 rounded-lg bg-[#0A0E14] border transition-colors ${bolao.isDivided ? 'border-blue-500/50 bg-blue-500/5' : 'border-yellow-500/30 hover:border-yellow-500/50'}`}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Badge variant="outline" className={`${getLotteryColor(bolao.type)}`}>
                    {bolao.type}
                  </Badge>
                  <span className="font-mono text-sm font-semibold">{bolao.code}</span>
                  {/* Task 158: Division indicator */}
                  {bolao.isDivided && (
                    <Badge className="bg-blue-500/10 text-blue-400 border-0">
                      <Split className="w-3 h-3 mr-1" />
                      {bolao.totalWinners}x Dividido
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span>Concurso {bolao.concurso}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{bolao.date}</span>
                </div>
                {/* Task 158: Show division details */}
                {bolao.isDivided ? (
                  <div className="flex-1 text-right">
                    <p className="text-xs text-muted-foreground line-through">{bolao.totalAnnouncedPrize}</p>
                    <p className="text-lg font-bold text-bolao-green">{bolao.ourShare}</p>
                    <p className="text-xs text-muted-foreground">Nossa parte ({bolao.totalWinners} ganhadores)</p>
                  </div>
                ) : (
                  <div className="flex-1 text-right">
                    <p className="text-lg font-bold text-bolao-green">{bolao.prize}</p>
                  </div>
                )}
                <Button 
                  size="sm" 
                  onClick={() => {
                    setRelatedBolao(bolao.code);
                    setConcursoNumber(bolao.concurso);
                    setDepositSource(`Prêmio ${bolao.type}`);
                    // Task 158: Auto-fill division info
                    if (bolao.isDivided) {
                      setIsPrizeDivided(true);
                      setTotalWinners(String(bolao.totalWinners));
                      setTotalAnnouncedPrize(bolao.totalAnnouncedPrize.replace("R$ ", ""));
                    }
                    setShowDepositModal(true);
                  }}
                  className={bolao.isDivided 
                    ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                    : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30"
                  }
                >
                  <ArrowDownToLine className="w-4 h-4 mr-1" />
                  Registrar
                </Button>
              </div>
              {/* Task 158: Division warning banner */}
              {bolao.isDivided && (
                <div className="mt-3 p-2 rounded bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <p className="text-xs text-blue-400">
                    Prêmio dividido: {bolao.totalAnnouncedPrize} ÷ {bolao.totalWinners} = {bolao.ourShare}
                  </p>
                </div>
              )}
            </div>
          ))}

          {winningBoloes.filter(b => b.status === "awaiting_deposit").length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Todos os prêmios foram depositados!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Task 145: Prêmios Resgatados Tracking Table - Enhanced with Task 155: Division Info */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Rastreamento de Prêmios Resgatados</h3>
              <p className="text-xs text-muted-foreground">Acompanhe todo o ciclo: detecção → resgate → depósito → distribuição</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
              <option value="all">Todos os Status</option>
              <option value="pendente_resgate">Pendente Resgate</option>
              <option value="resgatado">Resgatado</option>
              <option value="depositado">Depositado no Sistema</option>
              <option value="distribuido">Distribuído</option>
            </select>
            {/* Task 155: Filter by Division Status */}
            <select className="px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
              <option value="all">Todos (Divisão)</option>
              <option value="exclusive">Ganhador Exclusivo</option>
              <option value="divided">Prêmio Dividido</option>
            </select>
            <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Concurso</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Bolão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Loteria</th>
                {/* Task 155: New columns for prize division */}
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Prêmio Total Caixa</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ganhadores</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Nossa Parte</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status Divisão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Prize 1 - Exclusive Winner (Not Divided) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono">#3025</td>
                <td className="p-4 text-sm font-mono font-semibold">MG-2025-0234</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Mega-Sena</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 45.000.000,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">1</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 45.000.000,00</td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Único Ganhador
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge className="bg-red-500/10 text-red-400 border-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pendente Resgate
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Marcar Resgatado
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Prize 2 - Divided Prize (5 winners) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 bg-blue-500/5">
                <td className="p-4 text-sm font-mono">#6842</td>
                <td className="p-4 text-sm font-mono font-semibold">QN-2025-0891</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Quina</Badge>
                </td>
                <td className="p-4 text-sm">R$ 17.500.000,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <Trophy className="w-4 h-4 text-yellow-500/70" />
                      <Trophy className="w-4 h-4 text-yellow-500/50" />
                    </div>
                    <span className="text-sm font-semibold text-blue-400">5</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 3.500.000,00</td>
                <td className="p-4">
                  <div className="relative group">
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 cursor-help">
                      <Split className="w-3 h-3 mr-1" />
                      Dividido
                    </Badge>
                    {/* Tooltip with calculation breakdown */}
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#1C2432] rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg">
                      <p className="font-semibold text-white mb-2">Cálculo da Divisão</p>
                      <div className="space-y-1 text-muted-foreground">
                        <p>Prêmio Total: <span className="text-white">R$ 17.500.000</span></p>
                        <p>÷ 5 ganhadores = <span className="text-yellow-500">R$ 3.500.000</span></p>
                        <p className="pt-1 border-t border-[#1C2432]/50">Nossa parte (1 bilhete): <span className="text-bolao-green font-semibold">R$ 3.500.000</span></p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className="bg-red-500/10 text-red-400 border-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pendente Resgate
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Marcar Resgatado
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Prize 3 - Claimed, waiting deposit (Exclusive) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono">#3210</td>
                <td className="p-4 text-sm font-mono font-semibold">LF-2025-1234</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Lotofácil</Badge>
                </td>
                <td className="p-4 text-sm">R$ 2.800.000,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">1</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 2.800.000,00</td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Único Ganhador
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Resgatado
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-bolao-orange hover:text-bolao-orange/80 hover:bg-bolao-orange/10"
                      onClick={() => {
                        setRelatedBolao("LF-2025-1234");
                        setConcursoNumber("3210");
                        setDepositSource("Prêmio Lotofácil");
                        setShowDepositModal(true);
                      }}
                    >
                      <ArrowDownToLine className="w-4 h-4 mr-1" />
                      Registrar Depósito
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Prize 4 - Deposited (Divided - 3 winners) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 bg-blue-500/5">
                <td className="p-4 text-sm font-mono">#3024</td>
                <td className="p-4 text-sm font-mono font-semibold">MG-2025-0198</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Mega-Sena</Badge>
                </td>
                <td className="p-4 text-sm">R$ 375.000,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <Trophy className="w-4 h-4 text-yellow-500/70" />
                      <Trophy className="w-4 h-4 text-yellow-500/50" />
                    </div>
                    <span className="text-sm font-semibold text-blue-400">3</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 125.000,00</td>
                <td className="p-4">
                  <div className="relative group">
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 cursor-help">
                      <Split className="w-3 h-3 mr-1" />
                      Dividido
                    </Badge>
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#1C2432] rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg">
                      <p className="font-semibold text-white mb-2">Cálculo da Divisão</p>
                      <div className="space-y-1 text-muted-foreground">
                        <p>Prêmio Total: <span className="text-white">R$ 375.000</span></p>
                        <p>÷ 3 ganhadores = <span className="text-yellow-500">R$ 125.000</span></p>
                        <p className="pt-1 border-t border-[#1C2432]/50">Nossa parte (1 bilhete): <span className="text-bolao-green font-semibold">R$ 125.000</span></p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className="bg-blue-500/10 text-blue-400 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Depositado
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Depósito
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Prize 5 - Distributed (Exclusive) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono">#6830</td>
                <td className="p-4 text-sm font-mono font-semibold">QN-2025-0645</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Quina</Badge>
                </td>
                <td className="p-4 text-sm">R$ 85.420,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">1</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 85.420,00</td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Único Ganhador
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge className="bg-bolao-green/10 text-bolao-green border-0">
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Distribuído
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-bolao-green hover:text-bolao-green/80">
                      <FileText className="w-4 h-4 mr-1" />
                      Relatório
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Prize 6 - Distributed (Divided - 2 winners) */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 bg-blue-500/5">
                <td className="p-4 text-sm font-mono">#3195</td>
                <td className="p-4 text-sm font-mono font-semibold">LF-2025-0912</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Lotofácil</Badge>
                </td>
                <td className="p-4 text-sm">R$ 2.500.000,00</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <Trophy className="w-4 h-4 text-yellow-500/70" />
                    </div>
                    <span className="text-sm font-semibold text-blue-400">2</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-bolao-green">R$ 1.250.000,00</td>
                <td className="p-4">
                  <div className="relative group">
                    <Badge className="bg-blue-500/10 text-blue-400 border-0 cursor-help">
                      <Split className="w-3 h-3 mr-1" />
                      Dividido
                    </Badge>
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#1C2432] rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg">
                      <p className="font-semibold text-white mb-2">Cálculo da Divisão</p>
                      <div className="space-y-1 text-muted-foreground">
                        <p>Prêmio Total: <span className="text-white">R$ 2.500.000</span></p>
                        <p>÷ 2 ganhadores = <span className="text-yellow-500">R$ 1.250.000</span></p>
                        <p className="pt-1 border-t border-[#1C2432]/50">Nossa parte (1 bilhete): <span className="text-bolao-green font-semibold">R$ 1.250.000</span></p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge className="bg-bolao-green/10 text-bolao-green border-0">
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Distribuído
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-bolao-green hover:text-bolao-green/80">
                      <FileText className="w-4 h-4 mr-1" />
                      Relatório
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Task 155: Division Summary Card */}
        <div className="mt-5 pt-5 border-t border-[#1C2432]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[#0A0E14] border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground">Prêmios Exclusivos</span>
              </div>
              <p className="text-xl font-bold text-yellow-500">3</p>
              <p className="text-xs text-muted-foreground mt-1">Único ganhador</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0A0E14] border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Split className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-muted-foreground">Prêmios Divididos</span>
              </div>
              <p className="text-xl font-bold text-blue-400">3</p>
              <p className="text-xs text-muted-foreground mt-1">Compartilhados</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0A0E14] border border-bolao-green/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-bolao-green" />
                <span className="text-xs font-medium text-muted-foreground">Total Anunciado (Caixa)</span>
              </div>
              <p className="text-xl font-bold text-bolao-green">R$ 68.1M</p>
              <p className="text-xs text-muted-foreground mt-1">Soma dos prêmios</p>
            </div>
            <div className="p-4 rounded-lg bg-[#0A0E14] border border-bolao-orange/30">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-4 h-4 text-bolao-orange" />
                <span className="text-xs font-medium text-muted-foreground">Nossa Parte Real</span>
              </div>
              <p className="text-xl font-bold text-bolao-orange">R$ 52.8M</p>
              <p className="text-xs text-muted-foreground mt-1">Após divisões</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Deposit History */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <h3 className="font-semibold">Histórico de Depósitos</h3>
              <p className="text-xs text-muted-foreground">Registros de prêmios depositados no sistema</p>
            </div>
          </div>
          <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Data/Hora</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Fonte</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Bolão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Concurso</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Divisão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Método</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {depositHistory.map((deposit) => (
                <tr key={deposit.id} className={`border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 ${deposit.isDivided ? 'bg-blue-500/5' : ''}`}>
                  <td className="p-4 text-sm font-mono text-muted-foreground">{deposit.id}</td>
                  <td className="p-4 text-sm">{deposit.date}</td>
                  <td className="p-4 text-sm">
                    <Badge variant="outline" className={`${getLotteryColor(deposit.source.replace("Prêmio ", ""))}`}>
                      {deposit.source}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-mono font-semibold">{deposit.bolaoCode}</td>
                  <td className="p-4 text-sm">#{deposit.concurso}</td>
                  <td className="p-4 text-sm font-semibold text-bolao-green">{deposit.amount}</td>
                  {/* Task 158: Division Status Column */}
                  <td className="p-4">
                    {deposit.isDivided ? (
                      <div className="relative group">
                        <Badge className="bg-blue-500/10 text-blue-400 border-0 cursor-help">
                          <Split className="w-3 h-3 mr-1" />
                          {deposit.totalWinners}x
                        </Badge>
                        <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-[#1C2432] rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg">
                          <p className="text-muted-foreground">Prêmio dividido entre {deposit.totalWinners} ganhadores</p>
                          {deposit.totalAnnouncedPrize && (
                            <p className="text-muted-foreground mt-1">Total Caixa: <span className="text-white">{deposit.totalAnnouncedPrize}</span></p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                        <Trophy className="w-3 h-3 mr-1" />
                        Único
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <Badge variant="outline" className="border-[#1C2432]">{deposit.paymentMethod}</Badge>
                  </td>
                  <td className="p-4">{getStatusBadge(deposit.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {deposit.hasReceipt && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => handleViewDetails(deposit)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Task 148: Prize Reconciliation Section */}
      <Card className="p-5 bg-[#111827] border-[#1C2432]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold">Conciliação de Prêmios</h3>
              <p className="text-xs text-muted-foreground">Verificação automática: Prêmio Total = Soma das Distribuições</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
              <option value="all">Todos</option>
              <option value="conciliado">Conciliado</option>
              <option value="divergente">Com Divergência</option>
              <option value="pendente">Pendente</option>
            </select>
            <Button variant="outline" className="border-[#1C2432] hover:bg-[#1C2432]">
              <Download className="w-4 h-4 mr-2" />
              Relatório Mensal
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="p-3 rounded-lg bg-bolao-green/10 border border-bolao-green/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conciliados</p>
            <p className="text-xl font-bold text-bolao-green">4</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Divergências</p>
            <p className="text-xl font-bold text-red-400">1</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
            <p className="text-xl font-bold text-yellow-500">2</p>
          </div>
          <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-center">
            <p className="text-xs text-muted-foreground mb-1">Taxa Conciliação</p>
            <p className="text-xl font-bold">80%</p>
          </div>
        </div>

        {/* Alert for discrepancy */}
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">1 bolão com divergência detectada</p>
              <p className="text-xs text-muted-foreground">Diferença de R$ 15.420,00 no bolão QN-2025-0645. Revise os pagamentos.</p>
            </div>
            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              Investigar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Bolão</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Loteria</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Prêmio Total</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Soma Distribuída</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Diferença</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 - Conciliado */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono font-semibold">MG-2025-0198</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Mega-Sena</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 125.000,00</td>
                <td className="p-4 text-sm font-semibold">R$ 125.000,00</td>
                <td className="p-4 text-sm font-semibold text-bolao-green">R$ 0,00</td>
                <td className="p-4">
                  <Badge className="bg-bolao-green/10 text-bolao-green border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conciliado
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>

              {/* Row 2 - Divergente */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 bg-red-500/5">
                <td className="p-4 text-sm font-mono font-semibold">QN-2025-0645</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Quina</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 85.420,00</td>
                <td className="p-4 text-sm font-semibold">R$ 70.000,00</td>
                <td className="p-4 text-sm font-semibold text-red-400">-R$ 15.420,00</td>
                <td className="p-4">
                  <Badge className="bg-red-500/10 text-red-400 border-0">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Divergente
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10">
                      <Settings className="w-4 h-4 mr-1" />
                      Ajuste Manual
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>

              {/* Row 3 - Conciliado */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono font-semibold">LF-2025-0912</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Lotofácil</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 1.250.000,00</td>
                <td className="p-4 text-sm font-semibold">R$ 1.250.000,00</td>
                <td className="p-4 text-sm font-semibold text-bolao-green">R$ 0,00</td>
                <td className="p-4">
                  <Badge className="bg-bolao-green/10 text-bolao-green border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conciliado
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>

              {/* Row 4 - Pendente */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono font-semibold">MG-2025-0234</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Mega-Sena</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 45.000.000,00</td>
                <td className="p-4 text-sm font-semibold text-muted-foreground">Pendente</td>
                <td className="p-4 text-sm text-muted-foreground">-</td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Aguardando Resgate
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>

              {/* Row 5 - Pendente */}
              <tr className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30">
                <td className="p-4 text-sm font-mono font-semibold">QN-2025-0891</td>
                <td className="p-4">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Quina</Badge>
                </td>
                <td className="p-4 text-sm font-semibold">R$ 3.500.000,00</td>
                <td className="p-4 text-sm font-semibold text-muted-foreground">Pendente</td>
                <td className="p-4 text-sm text-muted-foreground">-</td>
                <td className="p-4">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-0">
                    <Clock className="w-3 h-3 mr-1" />
                    Aguardando Resgate
                  </Badge>
                </td>
                <td className="p-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monthly Summary */}
        <div className="mt-5 pt-5 border-t border-[#1C2432]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Resumo Mensal - Fevereiro 2025
            </h4>
            <Badge className="bg-cyan-500/10 text-cyan-400 border-0">Parcial</Badge>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <p className="text-xs text-muted-foreground mb-1">Prêmios Ganhos</p>
              <p className="text-lg font-bold">R$ 49.96M</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <p className="text-xs text-muted-foreground mb-1">Prêmios Resgatados</p>
              <p className="text-lg font-bold text-bolao-green">R$ 1.46M</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <p className="text-xs text-muted-foreground mb-1">Depositados</p>
              <p className="text-lg font-bold text-blue-400">R$ 1.46M</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <p className="text-xs text-muted-foreground mb-1">Distribuídos</p>
              <p className="text-lg font-bold text-purple-400">R$ 1.44M</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
              <p className="text-xs text-muted-foreground mb-1">Diferença</p>
              <p className="text-lg font-bold text-red-400">-R$ 15.4K</p>
              <p className="text-[10px] text-muted-foreground">1 divergência</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-[#111827] border-[#1C2432] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                  <ArrowDownToLine className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Registrar Depósito de Prêmio</h3>
                  <p className="text-xs text-muted-foreground">Registre um prêmio recebido da Caixa Econômica Federal</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowDepositModal(false);
                setDepositAmount("");
                setDepositSource("");
                setRelatedBolao("");
                setPaymentMethod("");
                setConcursoNumber("");
                setAdminNotes("");
                // Task 154: Reset prize division state
                setIsPrizeDivided(false);
                setTotalWinners("1");
                setTotalAnnouncedPrize("");
                setOurBolaoWinningTickets("1");
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Valor Recebido *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-lg font-semibold focus:outline-none focus:border-bolao-green"
                  />
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium mb-2">Fonte do Prêmio *</label>
                <select
                  value={depositSource}
                  onChange={(e) => setDepositSource(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] focus:outline-none focus:border-bolao-green"
                >
                  <option value="">Selecione a loteria</option>
                  <option value="Prêmio Mega-Sena">Prêmio Mega-Sena</option>
                  <option value="Prêmio Lotofácil">Prêmio Lotofácil</option>
                  <option value="Prêmio Quina">Prêmio Quina</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Related Bolão */}
                <div>
                  <label className="block text-sm font-medium mb-2">Código do Bolão *</label>
                  <select
                    value={relatedBolao}
                    onChange={(e) => setRelatedBolao(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] focus:outline-none focus:border-bolao-green"
                  >
                    <option value="">Selecione o bolão</option>
                    {winningBoloes.filter(b => b.status === "awaiting_deposit").map((bolao, i) => (
                      <option key={i} value={bolao.code}>
                        {bolao.code} - {bolao.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Concurso Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Concurso *</label>
                  <input
                    type="text"
                    value={concursoNumber}
                    onChange={(e) => setConcursoNumber(e.target.value)}
                    placeholder="Ex: 3025"
                    className="w-full px-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] focus:outline-none focus:border-bolao-green"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Método de Recebimento *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setPaymentMethod("PIX Caixa")}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      paymentMethod === "PIX Caixa" 
                        ? "bg-bolao-green/10 border-bolao-green text-bolao-green" 
                        : "bg-[#0A0E14] border-[#1C2432] hover:border-[#3C4452]"
                    }`}
                  >
                    <Zap className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "PIX Caixa" ? "text-bolao-green" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">PIX Caixa</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("TED Caixa")}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      paymentMethod === "TED Caixa" 
                        ? "bg-bolao-green/10 border-bolao-green text-bolao-green" 
                        : "bg-[#0A0E14] border-[#1C2432] hover:border-[#3C4452]"
                    }`}
                  >
                    <Building className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "TED Caixa" ? "text-bolao-green" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">TED Caixa</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("Cheque/Outro")}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      paymentMethod === "Cheque/Outro" 
                        ? "bg-bolao-green/10 border-bolao-green text-bolao-green" 
                        : "bg-[#0A0E14] border-[#1C2432] hover:border-[#3C4452]"
                    }`}
                  >
                    <Receipt className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === "Cheque/Outro" ? "text-bolao-green" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">Cheque/Outro</span>
                  </button>
                </div>
              </div>

              {/* Task 154: Prize Division Section */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prizeDivided"
                      checked={isPrizeDivided}
                      onChange={(e) => setIsPrizeDivided(e.target.checked)}
                      className="w-4 h-4 rounded border-[#1C2432] text-bolao-green focus:ring-bolao-green"
                    />
                    <label htmlFor="prizeDivided" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Split className="w-4 h-4 text-bolao-orange" />
                      Prêmio Dividido com Outros Ganhadores
                    </label>
                  </div>
                  {/* Tooltip */}
                  <div className="relative group">
                    <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#1C2432] rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                      <p className="font-semibold text-white mb-1">Divisão de Prêmios</p>
                      <p>Quando há múltiplos ganhadores na loteria, o prêmio é dividido igualmente entre todos os bilhetes vencedores. Informe aqui quantos ganhadores existem no total para calcular corretamente nossa parte.</p>
                    </div>
                  </div>
                </div>

                {isPrizeDivided && (
                  <div className="space-y-4 pt-2 border-t border-[#1C2432]">
                    <div className="p-3 rounded-lg bg-bolao-orange/10 border border-bolao-orange/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-bolao-orange mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-bolao-orange">
                          Este prêmio será dividido com outros ganhadores. O valor a depositar deve ser a parte que o BolãoMax realmente receberá.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Announced Prize */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Prêmio Total Anunciado pela Caixa *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={totalAnnouncedPrize}
                            onChange={(e) => setTotalAnnouncedPrize(e.target.value)}
                            placeholder="0,00"
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                          />
                        </div>
                      </div>

                      {/* Total Winners */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Total de Ganhadores da Loteria *
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="number"
                            min="1"
                            value={totalWinners}
                            onChange={(e) => setTotalWinners(e.target.value)}
                            placeholder="1"
                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Inclui todos os bilhetes vencedores (dentro e fora do BolãoMax)</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Nossos Bilhetes Ganhadores (quantos bolões nossos ganharam)
                      </label>
                      <div className="relative">
                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="number"
                          min="1"
                          value={ourBolaoWinningTickets}
                          onChange={(e) => setOurBolaoWinningTickets(e.target.value)}
                          placeholder="1"
                          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                        />
                      </div>
                    </div>

                    {/* Calculation Display */}
                    {totalAnnouncedPrize && parseInt(totalWinners) > 0 && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-bolao-green/10 to-transparent border border-bolao-green/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator className="w-4 h-4 text-bolao-green" />
                          <span className="text-sm font-semibold text-bolao-green">Cálculo da Divisão</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prêmio Total Anunciado:</span>
                            <span className="font-medium">R$ {totalAnnouncedPrize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">÷ Total de Ganhadores:</span>
                            <span className="font-medium">{totalWinners} bilhete(s)</span>
                          </div>
                          <div className="flex justify-between border-t border-[#1C2432] pt-2">
                            <span className="text-muted-foreground">= Valor por Ganhador:</span>
                            <span className="font-medium text-yellow-500">
                              {formatCurrency(parseFloat(totalAnnouncedPrize.replace(/[^\d,]/g, "").replace(",", ".")) / parseInt(totalWinners) || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">× Nossos Bilhetes:</span>
                            <span className="font-medium">{ourBolaoWinningTickets}</span>
                          </div>
                          <div className="flex justify-between border-t border-[#1C2432] pt-2 bg-bolao-green/5 -mx-4 px-4 py-2 rounded">
                            <span className="font-semibold text-bolao-green">Nossa Cota do Prêmio:</span>
                            <span className="font-bold text-lg text-bolao-green">
                              {formatCurrency(typeof calculateOurShare() === 'number' ? calculateOurShare() : 0)}
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          O valor acima deve corresponder ao "Valor Recebido" informado no início do formulário
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-sm font-medium mb-2">Comprovante de Recebimento *</label>
                <div className="border-2 border-dashed border-[#1C2432] rounded-lg p-6 text-center hover:border-bolao-green/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arraste ou clique para anexar</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG ou JPG (máx. 10MB)</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Observações do Admin (opcional)</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Informações adicionais sobre o resgate do prêmio..."
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green resize-none"
                />
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-500">Importante</p>
                    <p className="text-muted-foreground">
                      Após registrar o depósito, os prêmios individuais dos participantes poderão ser aprovados na aba "Prêmios Pendentes".
                      Certifique-se de que o valor corresponde ao prêmio líquido já descontadas taxas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Info */}
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Esta ação será registrada: <span className="text-white">Administrador</span> • {new Date().toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount("");
                    setDepositSource("");
                    setRelatedBolao("");
                    setPaymentMethod("");
                    setConcursoNumber("");
                    setAdminNotes("");
                    // Task 154: Reset prize division state
                    setIsPrizeDivided(false);
                    setTotalWinners("1");
                    setTotalAnnouncedPrize("");
                    setOurBolaoWinningTickets("1");
                  }}
                >
                  Cancelar
                </Button>
                <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Depósito
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-[#111827] border-[#1C2432] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Detalhes do Depósito</h3>
                  <p className="text-xs text-muted-foreground">{selectedDeposit.id}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailsModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Deposit Info */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-xs font-medium text-muted-foreground mb-3">INFORMAÇÕES DO DEPÓSITO</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data/Hora</p>
                    <p className="font-semibold">{selectedDeposit.date}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fonte</p>
                    <p className="font-semibold">{selectedDeposit.source}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bolão</p>
                    <p className="font-semibold font-mono">{selectedDeposit.bolaoCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Concurso</p>
                    <p className="font-semibold">#{selectedDeposit.concurso}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Método</p>
                    <p className="font-semibold">{selectedDeposit.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registrado por</p>
                    <p className="font-semibold">{selectedDeposit.adminName}</p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
                <p className="text-xs text-muted-foreground mb-1">Valor Depositado</p>
                <p className="text-2xl font-bold text-bolao-green">{selectedDeposit.amount}</p>
              </div>

              {/* Notes */}
              {selectedDeposit.notes && (
                <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                  <p className="text-xs font-medium text-muted-foreground mb-2">OBSERVAÇÕES</p>
                  <p className="text-sm">{selectedDeposit.notes}</p>
                </div>
              )}

              {/* Receipt */}
              {selectedDeposit.hasReceipt && (
                <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                  <p className="text-xs font-medium text-muted-foreground mb-3">COMPROVANTE</p>
                  <Button variant="outline" className="w-full border-[#1C2432] hover:bg-[#1C2432]">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                </div>
              )}

              <Button 
                variant="outline" 
                className="w-full border-[#1C2432]" 
                onClick={() => setShowDetailsModal(false)}
              >
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Financial Password Settings Component
const FinancialPasswordSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordRequiredForTransfers, setPasswordRequiredForTransfers] = useState(true);
  const [passwordExpiration, setPasswordExpiration] = useState("90");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabel = passwordStrength <= 2 ? "Fraca" : passwordStrength <= 4 ? "Média" : "Forte";
  const strengthColor = passwordStrength <= 2 ? "bg-red-500" : passwordStrength <= 4 ? "bg-yellow-500" : "bg-bolao-green";

  // Password change history
  const passwordHistory = [
    { date: "15/02/2025 10:30", action: "Senha alterada", user: "Admin" },
    { date: "01/01/2025 09:00", action: "Senha criada", user: "Admin" },
  ];

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleRecoveryRequest = () => {
    setRecoverySent(true);
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoverySent(false);
      setRecoveryEmail("");
    }, 2000);
  };

  return (
    <Card className="p-5 bg-[#111827] border-[#1C2432]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-semibold">Senha Financeira</h3>
          <p className="text-xs text-muted-foreground">Senha adicional de segurança para operações financeiras sensíveis</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-400">Operações que requerem esta senha:</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <li>• Transferências bancárias para conta da empresa</li>
              <li>• Aprovação de prêmios acima de R$ 10.000</li>
              <li>• Aprovação de saques acima de R$ 5.000</li>
              <li>• Ajustes manuais de saldo de usuários</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Alterar Senha Financeira
          </h4>

          {/* Current Password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm pr-10 focus:outline-none focus:border-bolao-green"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nova senha</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm pr-10 focus:outline-none focus:border-bolao-green"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#0A0E14] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength <= 2 ? "text-red-500" : 
                    passwordStrength <= 4 ? "text-yellow-500" : "text-bolao-green"
                  }`}>
                    {strengthLabel}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Mín. 8 caracteres, maiúsculas, minúsculas, números e símbolos
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirmar nova senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className={`w-full px-3 py-2 rounded-lg bg-[#0A0E14] border text-sm pr-10 focus:outline-none ${
                  confirmPassword && newPassword !== confirmPassword 
                    ? "border-red-500 focus:border-red-500" 
                    : "border-[#1C2432] focus:border-bolao-green"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> As senhas não coincidem
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <button
            onClick={() => setShowRecoveryModal(true)}
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
          >
            Esqueci minha senha financeira
          </button>

          {/* Save Button */}
          <Button 
            onClick={handleSavePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || isSaving}
            className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Senha Alterada!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Alterar Senha
              </>
            )}
          </Button>
        </div>

        {/* Settings and History Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações de Segurança
          </h4>

          {/* Password Required Toggle */}
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Exigir senha em transferências</p>
                <p className="text-xs text-muted-foreground">Solicitar senha financeira para qualquer transferência</p>
              </div>
              <button
                onClick={() => setPasswordRequiredForTransfers(!passwordRequiredForTransfers)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  passwordRequiredForTransfers ? "bg-bolao-green" : "bg-[#1C2432]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  passwordRequiredForTransfers ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>

          {/* Password Expiration */}
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <label className="block text-sm font-medium mb-2">Expiração da senha</label>
            <select 
              value={passwordExpiration}
              onChange={(e) => setPasswordExpiration(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
            >
              <option value="never">Nunca expira</option>
              <option value="30">A cada 30 dias</option>
              <option value="60">A cada 60 dias</option>
              <option value="90">A cada 90 dias</option>
              <option value="180">A cada 180 dias</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Você será solicitado a alterar a senha periodicamente
            </p>
          </div>

          {/* Last Change Info */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-bolao-green/10 to-transparent border border-bolao-green/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-bolao-green">Última alteração</span>
            </div>
            <p className="text-sm">15/02/2025 às 10:30</p>
            <p className="text-xs text-muted-foreground mt-1">
              {passwordExpiration !== "never" ? `Próxima alteração: 15/05/2025` : "Senha não expira"}
            </p>
          </div>

          {/* Password History */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Receipt className="w-3 h-3" /> Histórico de alterações
            </h5>
            <div className="space-y-2">
              {passwordHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-[#0A0E14]">
                  <span className="text-muted-foreground">{entry.date}</span>
                  <span>{entry.action}</span>
                  <span className="text-muted-foreground">{entry.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111827] border-[#1C2432] p-6 mx-4">
            {recoverySent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-bolao-green/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-bolao-green" />
                </div>
                <h3 className="text-lg font-bold text-bolao-green mb-2">Email Enviado!</h3>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada para redefinir a senha financeira.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Key className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Recuperar Senha Financeira</h3>
                      <p className="text-xs text-muted-foreground">Enviaremos um link de redefinição</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowRecoveryModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email do administrador</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="admin@bolaomax.com.br"
                      className="w-full px-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] focus:outline-none focus:border-bolao-green"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      O email deve corresponder ao cadastrado na conta de administrador.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-[#1C2432]" 
                      onClick={() => setShowRecoveryModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                      onClick={handleRecoveryRequest}
                      disabled={!recoveryEmail}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Link
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </Card>
  );
};

// Task 157: Prize Division Calculator Widget Component
const PrizeDivisionCalculator = () => {
  const [totalPrize, setTotalPrize] = useState("");
  const [totalWinners, setTotalWinners] = useState("1");
  const [ourTickets, setOurTickets] = useState("1");
  const [copied, setCopied] = useState(false);

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const prizeValue = parseCurrency(totalPrize);
  const winnersCount = parseInt(totalWinners) || 1;
  const ourTicketsCount = parseInt(ourTickets) || 1;
  const perWinner = prizeValue / winnersCount;
  const ourShare = perWinner * ourTicketsCount;
  const percentage = prizeValue > 0 ? ((ourShare / prizeValue) * 100).toFixed(1) : "0";

  const handleCopy = () => {
    navigator.clipboard.writeText(formatCurrency(ourShare));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Prêmio Total Anunciado (R$)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={totalPrize}
              onChange={(e) => setTotalPrize(e.target.value)}
              placeholder="10.000.000,00"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Número de Ganhadores (Total)
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              min="1"
              value={totalWinners}
              onChange={(e) => setTotalWinners(e.target.value)}
              placeholder="5"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-orange"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Todos os bilhetes vencedores</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Nossos Bilhetes Ganhadores
          </label>
          <div className="relative">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              min="1"
              value={ourTickets}
              onChange={(e) => setOurTickets(e.target.value)}
              placeholder="1"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-orange"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Padrão: 1 bilhete</p>
        </div>
      </div>

      {/* Results */}
      {prizeValue > 0 && (
        <div className="p-5 rounded-lg bg-gradient-to-r from-bolao-orange/10 to-transparent border border-bolao-orange/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Input Summary */}
            <div className="p-3 rounded-lg bg-[#0A0E14]">
              <p className="text-xs text-muted-foreground mb-1">Prêmio Total</p>
              <p className="text-lg font-bold">{formatCurrency(prizeValue)}</p>
            </div>

            {/* Per Winner */}
            <div className="p-3 rounded-lg bg-[#0A0E14]">
              <p className="text-xs text-muted-foreground mb-1">÷ {winnersCount} Ganhador(es) =</p>
              <p className="text-lg font-bold text-yellow-500">{formatCurrency(perWinner)}</p>
              <p className="text-[10px] text-muted-foreground">Valor por ganhador</p>
            </div>

            {/* Our Share */}
            <div className="p-3 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
              <p className="text-xs text-muted-foreground mb-1">× {ourTicketsCount} Nosso(s) Bilhete(s) =</p>
              <p className="text-2xl font-bold text-bolao-green">{formatCurrency(ourShare)}</p>
              <p className="text-[10px] text-muted-foreground">Nossa parte total</p>
            </div>

            {/* Percentage */}
            <div className="p-3 rounded-lg bg-[#0A0E14]">
              <p className="text-xs text-muted-foreground mb-1">Percentual do Prêmio</p>
              <p className="text-lg font-bold text-purple-400">{percentage}%</p>
              <Button 
                size="sm" 
                variant="outline"
                className="mt-2 border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10 text-xs"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar Valor
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="mt-4 pt-4 border-t border-[#1C2432]">
            <p className="text-xs text-muted-foreground mb-2">
              <strong className="text-white">Cálculo:</strong>{" "}
              {formatCurrency(prizeValue)} ÷ {winnersCount} ganhador(es) = {formatCurrency(perWinner)} por ganhador 
              {ourTicketsCount > 1 && ` × ${ourTicketsCount} bilhetes = ${formatCurrency(ourShare)}`}
            </p>
          </div>
        </div>
      )}

      {/* Example */}
      <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-muted-foreground mb-1">Exemplo:</p>
            <p className="text-muted-foreground">
              Prêmio de <strong className="text-white">R$ 10 milhões</strong> dividido entre 
              <strong className="text-white"> 5 ganhadores</strong> = 
              <strong className="text-yellow-500"> R$ 2 milhões</strong> cada.
              Se tivermos <strong className="text-white">2 bilhetes</strong> ganhadores, 
              nossa parte seria <strong className="text-bolao-green">R$ 4 milhões</strong> (40% do prêmio).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminFinanceiro = () => {
  const [activeTab, setActiveTab] = useState("visao-geral");
  
  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<{
    fundo?: {
      saldoDisponivel: number;
      saldoBloqueado: number;
      saldoTotal: number;
      limiteMinimo: number;
      limiteIdeal: number;
      percentualUso: number;
      status: 'ok' | 'alerta' | 'critico';
      totalUtilizado: number;
      totalReposto: number;
    };
    usuarios?: { total: number; saldoTotal: number };
    transacoesHoje?: { quantidade: number; valor: number };
    saquesPendentes?: { quantidade: number; valor: number };
  } | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
  // Saques pendentes from API
  const [saquesPendentesAPI, setSaquesPendentesAPI] = useState<SaquePendente[]>([]);
  const [isLoadingSaques, setIsLoadingSaques] = useState(false);
  
  // Aporte modal
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteValor, setAporteValor] = useState("");
  const [isAportando, setIsAportando] = useState(false);
  
  // Load dashboard data
  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    setDashboardError(null);
    
    try {
      const response = await buscarDashboard();
      if (response.success) {
        setDashboardData({
          fundo: response.fundo,
          usuarios: response.usuarios,
          transacoesHoje: response.transacoesHoje,
          saquesPendentes: response.saquesPendentes,
        });
      } else {
        setDashboardError(response.error || 'Erro ao carregar dashboard');
      }
    } catch (error: any) {
      setDashboardError(error.message || 'Erro ao carregar dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  };
  
  // Load saques pendentes
  const loadSaquesPendentes = async () => {
    setIsLoadingSaques(true);
    try {
      const response = await buscarSaquesPendentes();
      if (response.success) {
        setSaquesPendentesAPI(response.saques);
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
    } finally {
      setIsLoadingSaques(false);
    }
  };
  
  // Handle aporte
  const handleAporte = async () => {
    const valor = parseFloat(aporteValor.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor válido');
      return;
    }
    
    setIsAportando(true);
    try {
      const response = await aportarFundo(valor);
      if (response.success) {
        alert(response.message || 'Aporte realizado com sucesso!');
        setShowAporteModal(false);
        setAporteValor("");
        loadDashboard(); // Reload dashboard
      } else {
        alert(response.error || 'Erro ao realizar aporte');
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao realizar aporte');
    } finally {
      setIsAportando(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    loadDashboard();
    loadSaquesPendentes();
  }, []);
  
  // Helper to format currency
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AdminLayout title="Financeiro" subtitle="Gestão financeira completa">
      {/* Tabs */}
      <div className="border-b border-[#1C2432] mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton active={activeTab === "visao-geral"} onClick={() => setActiveTab("visao-geral")}>
            Visão Geral
          </TabButton>
          <TabButton active={activeTab === "conta-empresa"} onClick={() => setActiveTab("conta-empresa")}>
            Conta da Empresa
          </TabButton>
          <TabButton active={activeTab === "depositos-empresa"} onClick={() => setActiveTab("depositos-empresa")} badge={2}>
            Depósitos de Prêmios
          </TabButton>
          <TabButton active={activeTab === "premios-pendentes"} onClick={() => setActiveTab("premios-pendentes")} badge={4}>
            Prêmios Pendentes
          </TabButton>
          <TabButton active={activeTab === "saques"} onClick={() => setActiveTab("saques")} badge={dashboardData?.saquesPendentes?.quantidade || saquesPendentesAPI.length}>
            Saques
          </TabButton>
          <TabButton active={activeTab === "reembolsos"} onClick={() => setActiveTab("reembolsos")} badge={2}>
            Reembolsos
          </TabButton>
          <TabButton active={activeTab === "receitas"} onClick={() => setActiveTab("receitas")}>
            Receitas
          </TabButton>
          <TabButton active={activeTab === "despesas"} onClick={() => setActiveTab("despesas")}>
            Despesas
          </TabButton>
          <TabButton active={activeTab === "extratos"} onClick={() => setActiveTab("extratos")}>
            Extratos
          </TabButton>
          <TabButton active={activeTab === "configuracoes"} onClick={() => setActiveTab("configuracoes")}>
            Configurações
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "visao-geral" && (
        <div className="space-y-6">
          {/* Loading State */}
          {isLoadingDashboard && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-bolao-green" />
              <span className="ml-3 text-muted-foreground">Carregando dados financeiros...</span>
            </div>
          )}
          
          {/* Error State */}
          {dashboardError && !isLoadingDashboard && (
            <Card className="p-6 bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="font-semibold text-red-400">Erro ao carregar dados</p>
                  <p className="text-sm text-muted-foreground">{dashboardError}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-auto border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={loadDashboard}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            </Card>
          )}
          
          {/* Dashboard Content */}
          {!isLoadingDashboard && !dashboardError && (
            <>
              {/* Fundo de Registro - Status em Destaque */}
              {dashboardData?.fundo && (
                <Card className={`p-5 border-2 ${
                  dashboardData.fundo.status === 'ok' ? 'bg-gradient-to-br from-bolao-green/10 to-transparent border-bolao-green/30' :
                  dashboardData.fundo.status === 'alerta' ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30' :
                  'bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        dashboardData.fundo.status === 'ok' ? 'bg-bolao-green/20' :
                        dashboardData.fundo.status === 'alerta' ? 'bg-yellow-500/20' :
                        'bg-red-500/20'
                      }`}>
                        <PiggyBank className={`w-7 h-7 ${
                          dashboardData.fundo.status === 'ok' ? 'text-bolao-green' :
                          dashboardData.fundo.status === 'alerta' ? 'text-yellow-500' :
                          'text-red-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Fundo de Registro</h3>
                        <p className="text-sm text-muted-foreground">Capital de giro para registrar bolões</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        dashboardData.fundo.status === 'ok' ? 'bg-bolao-green/10 text-bolao-green' :
                        dashboardData.fundo.status === 'alerta' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-400'
                      } border-0`}>
                        {dashboardData.fundo.status === 'ok' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                         dashboardData.fundo.status === 'alerta' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                         <XCircle className="w-3 h-3 mr-1" />}
                        {getFundoStatusLabel(dashboardData.fundo.status)}
                      </Badge>
                      <Button 
                        size="sm"
                        className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                        onClick={() => setShowAporteModal(true)}
                      >
                        <ArrowUpFromLine className="w-4 h-4 mr-1" />
                        Aportar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-[#0A0E14]/50">
                      <p className="text-xs text-muted-foreground mb-1">Saldo Disponível</p>
                      <p className={`text-xl font-bold ${
                        dashboardData.fundo.status === 'ok' ? 'text-bolao-green' :
                        dashboardData.fundo.status === 'alerta' ? 'text-yellow-500' :
                        'text-red-400'
                      }`}>
                        {formatCurrency(dashboardData.fundo.saldoDisponivel)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0A0E14]/50">
                      <p className="text-xs text-muted-foreground mb-1">Saldo Bloqueado</p>
                      <p className="text-xl font-bold text-bolao-orange">
                        {formatCurrency(dashboardData.fundo.saldoBloqueado)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0A0E14]/50">
                      <p className="text-xs text-muted-foreground mb-1">Limite Mínimo</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(dashboardData.fundo.limiteMinimo)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0A0E14]/50">
                      <p className="text-xs text-muted-foreground mb-1">Limite Ideal</p>
                      <p className="text-xl font-bold text-blue-400">
                        {formatCurrency(dashboardData.fundo.limiteIdeal)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Uso do Fundo</span>
                      <span>{dashboardData.fundo.percentualUso}%</span>
                    </div>
                    <div className="h-2 bg-[#1C2432] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          dashboardData.fundo.status === 'ok' ? 'bg-bolao-green' :
                          dashboardData.fundo.status === 'alerta' ? 'bg-yellow-500' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(100, dashboardData.fundo.percentualUso)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Main KPIs - Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard 
                  icon={Banknote} 
                  iconBg="bg-bolao-green/10" 
                  iconColor="text-bolao-green" 
                  value={dashboardData?.fundo ? formatCurrency(dashboardData.fundo.saldoTotal) : "R$ 0,00"} 
                  label="Total em Caixa"
                  sublabel="Saldo disponível em conta"
                  trend="up"
                  trendValue="+18.5%"
                  large
                  highlight="green"
                />
                <KPICard 
                  icon={ArrowUpFromLine} 
                  iconBg="bg-emerald-500/10" 
                  iconColor="text-emerald-400" 
                  value={dashboardData?.transacoesHoje ? formatCurrency(dashboardData.transacoesHoje.valor) : "R$ 0,00"} 
                  label={`Entradas Hoje (${dashboardData?.transacoesHoje?.quantidade || 0} transações)`}
                  trend="up"
                  trendValue="+12.3%"
                />
                <KPICard 
                  icon={ArrowDownToLine} 
                  iconBg="bg-red-500/10" 
                  iconColor="text-red-400" 
                  value={dashboardData?.saquesPendentes ? formatCurrency(dashboardData.saquesPendentes.valor) : "R$ 0,00"} 
                  label={`Saques Pendentes (${dashboardData?.saquesPendentes?.quantidade || 0})`}
                  trend="down"
                  trendValue={`${dashboardData?.saquesPendentes?.quantidade || 0} solicitações`}
                />
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                  icon={Users} 
                  iconBg="bg-blue-500/10" 
                  iconColor="text-blue-400" 
                  value={dashboardData?.usuarios?.total?.toString() || "0"} 
                  label="Total de Usuários"
                />
                <KPICard 
                  icon={Wallet} 
                  iconBg="bg-purple-500/10" 
                  iconColor="text-purple-400" 
                  value={dashboardData?.usuarios ? formatCurrency(dashboardData.usuarios.saldoTotal) : "R$ 0,00"} 
                  label="Saldo Total Usuários"
                />
                <KPICard 
                  icon={Lock} 
                  iconBg="bg-bolao-orange/10" 
                  iconColor="text-bolao-orange" 
                  value={dashboardData?.fundo ? formatCurrency(dashboardData.fundo.saldoBloqueado) : "R$ 0,00"} 
                  label="Saldo Bloqueado"
                  sublabel="Reservas em uso"
                />
                <KPICard 
                  icon={Crown} 
                  iconBg="bg-yellow-500/10" 
                  iconColor="text-yellow-500" 
                  value="R$ 8.970,00" 
                  label="Receita Assinaturas"
                  trend="up"
                  trendValue="+35%"
                />
              </div>
            </>
          )} 

          {/* Task 147: Prize Lifecycle Metrics Section */}
          <Card className="p-5 bg-[#111827] border-[#1C2432]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Ciclo de Vida dos Prêmios</h3>
                  <p className="text-xs text-muted-foreground">Visão completa do fluxo de prêmios do sistema</p>
                </div>
              </div>
            </div>

            {/* Alert for pending claims */}
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-400">2 prêmios aguardando resgate na Caixa</p>
                  <p className="text-xs text-muted-foreground">Total de R$ 48.5M pendentes de resgate. Acesse a aba "Depósitos de Prêmios" para gerenciar.</p>
                </div>
                <Badge className="bg-red-500/10 text-red-400 border-0">Urgente</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Prizes Won */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-muted-foreground">Prêmios Ganhos (Total)</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">R$ 52.7M</p>
                <p className="text-xs text-muted-foreground mt-1">6 bolões vencedores</p>
              </div>

              {/* Claimed & Deposited */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-bolao-green/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-bolao-green" />
                  <span className="text-xs font-medium text-muted-foreground">Prêmios Resgatados</span>
                </div>
                <p className="text-2xl font-bold text-bolao-green">R$ 4.2M</p>
                <p className="text-xs text-muted-foreground mt-1">Depositados no sistema</p>
              </div>

              {/* Pending Claim */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-muted-foreground">Pendente Resgate</span>
                </div>
                <p className="text-2xl font-bold text-red-400">R$ 48.5M</p>
                <p className="text-xs text-muted-foreground mt-1">2 bolões na Caixa</p>
              </div>

              {/* Distributed to Users */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-muted-foreground">Distribuídos</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">R$ 1.34M</p>
                <p className="text-xs text-muted-foreground mt-1">Pago aos ganhadores</p>
              </div>

              {/* Prize Margin */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-muted-foreground">Margem Prêmios</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">R$ 2.86M</p>
                <p className="text-xs text-muted-foreground mt-1">68% margem</p>
              </div>
            </div>

            {/* Prize Flow Chart */}
            <div className="mt-5 pt-5 border-t border-[#1C2432]">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Fluxo de Prêmios nos Últimos 6 Meses
              </h4>
              <div className="h-40 flex items-end gap-4">
                {[
                  { month: "Set", ganhos: 2.5, resgatados: 2.0, distribuidos: 1.8 },
                  { month: "Out", ganhos: 1.8, resgatados: 1.5, distribuidos: 1.3 },
                  { month: "Nov", ganhos: 3.2, resgatados: 2.8, distribuidos: 2.5 },
                  { month: "Dez", ganhos: 5.0, resgatados: 4.2, distribuidos: 3.8 },
                  { month: "Jan", ganhos: 8.5, resgatados: 4.2, distribuidos: 3.5 },
                  { month: "Fev", ganhos: 48.5, resgatados: 4.2, distribuidos: 1.34 },
                ].map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div 
                        className="w-4 bg-yellow-500/70 rounded-t"
                        style={{ height: `${Math.min(data.ganhos * 2, 100)}%` }}
                        title={`Ganhos: R$ ${data.ganhos}M`}
                      ></div>
                      <div 
                        className="w-4 bg-bolao-green/70 rounded-t"
                        style={{ height: `${Math.min(data.resgatados * 2, 100)}%` }}
                        title={`Resgatados: R$ ${data.resgatados}M`}
                      ></div>
                      <div 
                        className="w-4 bg-blue-500/70 rounded-t"
                        style={{ height: `${Math.min(data.distribuidos * 2, 100)}%` }}
                        title={`Distribuídos: R$ ${data.distribuidos}M`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                  <span className="text-xs text-muted-foreground">Ganhos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-bolao-green/70"></span>
                  <span className="text-xs text-muted-foreground">Resgatados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500/70"></span>
                  <span className="text-xs text-muted-foreground">Distribuídos</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Task 160: Prize Division Analytics Section */}
          <Card className="p-5 bg-[#111827] border-[#1C2432]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Split className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Análise de Divisão de Prêmios</h3>
                  <p className="text-xs text-muted-foreground">Estatísticas de prêmios exclusivos vs divididos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
                  <option value="all">Todos os Períodos</option>
                  <option value="month">Este Mês</option>
                  <option value="quarter">Este Trimestre</option>
                  <option value="year">Este Ano</option>
                </select>
              </div>
            </div>

            {/* Division Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Total Exclusive */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-medium text-muted-foreground">Prêmios Exclusivos</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">3</p>
                <p className="text-xs text-muted-foreground mt-1">Único ganhador</p>
              </div>

              {/* Total Divided */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Split className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-muted-foreground">Prêmios Divididos</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">3</p>
                <p className="text-xs text-muted-foreground mt-1">Compartilhados</p>
              </div>

              {/* Division Rate */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-bolao-orange/30">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-bolao-orange" />
                  <span className="text-xs font-medium text-muted-foreground">Taxa de Divisão</span>
                </div>
                <p className="text-2xl font-bold text-bolao-orange">50%</p>
                <p className="text-xs text-muted-foreground mt-1">dos prêmios</p>
              </div>

              {/* Average Winners */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-muted-foreground">Média de Ganhadores</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">3.3</p>
                <p className="text-xs text-muted-foreground mt-1">quando dividido</p>
              </div>

              {/* Financial Impact */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-muted-foreground">Impacto Financeiro</span>
                </div>
                <p className="text-2xl font-bold text-red-400">-R$ 15.3M</p>
                <p className="text-xs text-muted-foreground mt-1">por divisões</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exclusive vs Divided Over Time */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  Exclusivos vs Divididos por Mês
                </h4>
                <div className="h-32 flex items-end gap-4">
                  {[
                    { month: "Set", exclusive: 2, divided: 1 },
                    { month: "Out", exclusive: 1, divided: 2 },
                    { month: "Nov", exclusive: 3, divided: 1 },
                    { month: "Dez", exclusive: 2, divided: 2 },
                    { month: "Jan", exclusive: 1, divided: 3 },
                    { month: "Fev", exclusive: 3, divided: 3 },
                  ].map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-24">
                        <div 
                          className="w-4 bg-yellow-500/70 rounded-t"
                          style={{ height: `${data.exclusive * 25}%` }}
                          title={`Exclusivos: ${data.exclusive}`}
                        ></div>
                        <div 
                          className="w-4 bg-blue-500/70 rounded-t"
                          style={{ height: `${data.divided * 25}%` }}
                          title={`Divididos: ${data.divided}`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                    <span className="text-xs text-muted-foreground">Exclusivos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500/70"></span>
                    <span className="text-xs text-muted-foreground">Divididos</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart - Distribution */}
              <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-muted-foreground" />
                  Distribuição de Prêmios
                </h4>
                <div className="flex items-center gap-6">
                  {/* Donut Chart */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke="#EAB308"
                        strokeWidth="3"
                        strokeDasharray="50 50"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="transparent"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray="50 50"
                        strokeDashoffset="-50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold">6</span>
                      <span className="text-[10px] text-muted-foreground">Prêmios</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm flex-1">Exclusivos</span>
                      <span className="text-sm font-semibold text-yellow-500">50%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm flex-1">Divididos</span>
                      <span className="text-sm font-semibold text-blue-400">50%</span>
                    </div>
                    <div className="pt-2 border-t border-[#1C2432]">
                      <p className="text-[10px] text-muted-foreground">
                        Valor total se exclusivos: <span className="text-yellow-500">R$ 68.1M</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Valor real após divisões: <span className="text-bolao-green">R$ 52.8M</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Box */}
            <div className="mt-5 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-purple-400 mb-1">💡 Insight</p>
                  <p className="text-muted-foreground">
                    Bolões com estratégias menos populares (como sequências numéricas não convencionais) 
                    têm <strong className="text-white">menor chance de divisão</strong>. Considere criar 
                    bolões com estratégias diferenciadas para aumentar a probabilidade de prêmios exclusivos.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <QuickStats />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CashflowChart />
            <DepositsWithdrawalsChart />
          </div>

          {/* Revenue Source & Bettors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueSourceChart />
            <TopBettors />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankAccountForm />
            <PendingWithdrawals />
          </div>

          {/* Task 157: Prize Division Calculator Widget */}
          <Card className="p-5 bg-[#111827] border-[#1C2432]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-bolao-orange/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-bolao-orange" />
              </div>
              <div>
                <h3 className="font-semibold">Calculadora de Divisão de Prêmios</h3>
                <p className="text-xs text-muted-foreground">Calcule rapidamente a divisão de prêmios entre múltiplos ganhadores</p>
              </div>
            </div>

            <PrizeDivisionCalculator />
          </Card>
        </div>
      )}

      {activeTab === "conta-empresa" && <ContaEmpresaTab />}

      {activeTab === "depositos-empresa" && <DepositosEmpresaTab />}

      {activeTab === "premios-pendentes" && <PremiosPendentesTab />}

      {activeTab === "saques" && <SaquesTab />}

      {activeTab === "reembolsos" && <ReembolsosTab />}

      {activeTab === "extratos" && <ExtractsTab />}

      {activeTab === "receitas" && (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              icon={Ticket} 
              iconBg="bg-bolao-green/10" 
              iconColor="text-bolao-green" 
              value="R$ 156.780,00" 
              label="Bolões Avulsos"
              trend="up"
              trendValue="+15%"
            />
            <KPICard 
              icon={Crown} 
              iconBg="bg-blue-500/10" 
              iconColor="text-blue-400" 
              value="R$ 32.450,00" 
              label="Assinaturas"
              trend="up"
              trendValue="+28%"
            />
            <KPICard 
              icon={Receipt} 
              iconBg="bg-purple-500/10" 
              iconColor="text-purple-400" 
              value="R$ 8.230,00" 
              label="Taxas de Serviço"
              trend="up"
              trendValue="+5%"
            />
            <KPICard 
              icon={Zap} 
              iconBg="bg-yellow-500/10" 
              iconColor="text-yellow-500" 
              value="R$ 880,00" 
              label="Bônus de Indicação"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueSourceChart />
            <Card className="p-5 bg-[#111827] border-[#1C2432]">
              <h3 className="text-base font-semibold mb-4">Tendência de Receitas</h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm opacity-50">Gráfico de tendência</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "despesas" && (
        <div className="space-y-6">
          {/* Expenses Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              icon={ArrowDownToLine} 
              iconBg="bg-red-500/10" 
              iconColor="text-red-400" 
              value="R$ 45.230,00" 
              label="Saques Pagos"
            />
            <KPICard 
              icon={DollarSign} 
              iconBg="bg-bolao-orange/10" 
              iconColor="text-bolao-orange" 
              value="R$ 18.650,00" 
              label="Prêmios Distribuídos"
            />
            <KPICard 
              icon={RefreshCw} 
              iconBg="bg-purple-500/10" 
              iconColor="text-purple-400" 
              value="R$ 2.340,00" 
              label="Reembolsos"
            />
            <KPICard 
              icon={CreditCard} 
              iconBg="bg-blue-500/10" 
              iconColor="text-blue-400" 
              value="R$ 1.670,00" 
              label="Taxas Bancárias"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 bg-[#111827] border-[#1C2432]">
              <h3 className="text-base font-semibold mb-4">Despesas por Categoria</h3>
              <div className="space-y-4">
                {[
                  { label: "Saques de Usuários", value: 65, amount: "R$ 45.230" },
                  { label: "Prêmios", value: 27, amount: "R$ 18.650" },
                  { label: "Reembolsos", value: 5, amount: "R$ 2.340" },
                  { label: "Taxas", value: 3, amount: "R$ 1.670" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{item.label}</span>
                      <span className="text-sm font-semibold">{item.amount}</span>
                    </div>
                    <div className="h-2 bg-[#1C2432] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.value}% do total</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5 bg-[#111827] border-[#1C2432]">
              <h3 className="text-base font-semibold mb-4">Histórico de Despesas</h3>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm opacity-50">Gráfico de histórico</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "configuracoes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankAccountForm />
            <PendingWithdrawals />
          </div>

          {/* Additional Config Options */}
          <Card className="p-5 bg-[#111827] border-[#1C2432]">
            <h3 className="font-semibold mb-4">Configurações de Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Limite de Saque Diário</label>
                <input
                  type="text"
                  defaultValue="R$ 5.000,00"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Taxa de Saque (%)</label>
                <input
                  type="text"
                  defaultValue="0"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Valor Mínimo de Saque</label>
                <input
                  type="text"
                  defaultValue="R$ 20,00"
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Prazo de Processamento</label>
                <select className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green">
                  <option>Imediato (PIX)</option>
                  <option>Até 24h</option>
                  <option>Até 48h</option>
                  <option>Até 72h</option>
                </select>
              </div>
            </div>
            <Button className="mt-5 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </Card>

          {/* Financial Password Section */}
          <FinancialPasswordSettings />
        </div>
      )}
      
      {/* Modal de Aporte no Fundo */}
      {showAporteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-[#111827] border-[#1C2432] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Aportar no Fundo</h3>
                  <p className="text-xs text-muted-foreground">Adicionar capital ao Fundo de Registro</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAporteModal(false)} disabled={isAportando}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Saldo Atual */}
              {dashboardData?.fundo && (
                <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                  <p className="text-xs text-muted-foreground mb-1">Saldo Atual do Fundo</p>
                  <p className="text-xl font-bold text-bolao-green">
                    {formatCurrency(dashboardData.fundo.saldoTotal)}
                  </p>
                </div>
              )}

              {/* Valor do Aporte */}
              <div>
                <label className="block text-sm font-medium mb-2">Valor do Aporte</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <input
                    type="text"
                    value={aporteValor}
                    onChange={(e) => setAporteValor(e.target.value)}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-lg focus:outline-none focus:border-bolao-green"
                    disabled={isAportando}
                  />
                </div>
              </div>

              {/* Quick Buttons */}
              <div className="flex gap-2">
                {[1000, 5000, 10000, 20000].map((valor) => (
                  <button
                    key={valor}
                    onClick={() => setAporteValor(valor.toString())}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#1C2432] hover:bg-[#253040] text-sm font-medium transition-colors"
                    disabled={isAportando}
                  >
                    R$ {valor.toLocaleString('pt-BR')}
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <Info className="w-4 h-4" />
                  <span>O aporte será adicionado ao saldo disponível imediatamente.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#1C2432]" 
                  onClick={() => setShowAporteModal(false)}
                  disabled={isAportando}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                  onClick={handleAporte}
                  disabled={isAportando || !aporteValor}
                >
                  {isAportando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Aportando...
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-4 h-4 mr-2" />
                      Confirmar Aporte
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFinanceiro;
