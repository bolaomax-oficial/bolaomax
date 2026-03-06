import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";
import {
  liveNotificationService,
  PurchaseNotification,
} from "@/services/liveNotificationService";
import { getThisMonthStats, getRecentConversions } from "@/services/affiliateTrackingService";
import {
  DollarSign,
  Users,
  Ticket,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Zap,
  ShoppingCart,
  Clock,
  CheckCircle,
  Loader2,
  Globe,
  MousePointerClick,
  RefreshCw,
  Download,
  Settings,
  ExternalLink,
} from "lucide-react";

// Metric Card Component
interface MetricCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel?: string;
  trend?: string;
  trendPositive?: boolean;
}

const MetricCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
  sublabel,
  trend,
  trendPositive,
}: MetricCardProps) => {
  const { isDark } = useTheme();
  
  return (
    <Card className={`relative p-5 overflow-hidden group hover:border-bolao-green/30 transition-colors ${
      isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
    }`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-bolao-green/5 transition-all" />
      <div className="relative flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
          {sublabel && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trendPositive ? "text-bolao-green" : "text-bolao-orange"}`}>
              {trend && (
                <>
                  <ArrowUpRight className="w-3 h-3" />
                  {trend}
                </>
              )}
              {!trend && sublabel}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Chart Placeholder Component
const ChartPlaceholder = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => {
  const { isDark } = useTheme();
  
  return (
    <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      <h3 className={`text-base font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <div className={`h-48 flex flex-col items-center justify-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        <Icon className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm opacity-50">Gráfico de {title.toLowerCase()}</p>
      </div>
    </Card>
  );
};

// Recent Bolao Item
interface BolaoItemProps {
  name: string;
  date: string;
  progress: number;
  value: string;
}

const BolaoItem = ({ name, date, progress, value }: BolaoItemProps) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center gap-4 py-3 border-b last:border-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{value} • {date}</p>
      </div>
      <div className="w-24 flex items-center gap-2">
        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#1C2432]" : "bg-gray-200"}`}>
          <div
            className="h-full bg-gradient-to-r from-bolao-green to-bolao-green-light rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-xs w-8 text-right ${isDark ? "text-gray-400" : "text-gray-500"}`}>{progress}%</span>
      </div>
    </div>
  );
};

// User Item
interface UserItemProps {
  name: string;
  date: string;
  initials: string;
  color: string;
}

const UserItem = ({ name, date, initials, color }: UserItemProps) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center gap-3 py-3 border-b last:border-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${color}`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{date}</p>
      </div>
    </div>
  );
};

// Withdrawal Item
interface WithdrawalItemProps {
  name: string;
  date: string;
  amount: string;
}

const WithdrawalItem = ({ name, date, amount }: WithdrawalItemProps) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{date}</p>
      </div>
      <span className="text-bolao-orange font-semibold">{amount}</span>
    </div>
  );
};

// Section Header
const SectionHeader = ({ title, href }: { title: string; href: string }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <Button variant="ghost" size="sm" className="text-bolao-green hover:text-bolao-green-light text-xs">
        Ver todos
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

// Live Sales Feed Component
const LiveSalesFeed = () => {
  const { isDark } = useTheme();
  const [sales, setSales] = useState<PurchaseNotification[]>([]);
  const [totalSales, setTotalSales] = useState(12450);
  const [newSaleIndicator, setNewSaleIndicator] = useState(false);
  const [filter, setFilter] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    // Initialize with some recent purchases
    const initial = liveNotificationService.generateInitialNotifications(10);
    setSales(initial);

    // Subscribe to new notifications
    const unsubscribe = liveNotificationService.subscribeToNewPurchases((notification) => {
      if (notification.type === "purchase") {
        setSales(prev => [notification, ...prev].slice(0, 10));
        setTotalSales(prev => prev + (notification.amount || 100));
        
        // Show new sale indicator
        setNewSaleIndicator(true);
        setTimeout(() => setNewSaleIndicator(false), 2000);
      }
    });

    // Start auto-generation for demo
    const stopAutoGen = liveNotificationService.startAutoGeneration(15000, 30000);

    return () => {
      unsubscribe();
      stopAutoGen();
    };
  }, []);

  const getLotteryColor = (type: string) => {
    switch (type) {
      case "lotofacil": return "text-violet-400 bg-violet-500/10";
      case "megasena": return "text-emerald-400 bg-emerald-500/10";
      case "quina": return "text-sky-400 bg-sky-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getLotteryLabel = (type: string) => {
    switch (type) {
      case "lotofacil": return "Lotofácil";
      case "megasena": return "Mega-Sena";
      case "quina": return "Quina";
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${newSaleIndicator ? "bg-bolao-green/20 animate-pulse" : "bg-bolao-green/10"}`}>
            <ShoppingCart className="w-4 h-4 text-bolao-green" />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Últimas Vendas
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-bolao-green animate-pulse" />
              <span className="text-xs text-bolao-green">Ao vivo</span>
            </div>
          </div>
        </div>
        
        {/* Total Counter */}
        <div className="text-right">
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total hoje</p>
          <p className="text-lg font-bold text-bolao-green">
            R$ {totalSales.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {(["today", "week", "month"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-bolao-green text-bolao-dark"
                : isDark
                ? "bg-[#1C2432] text-gray-400 hover:text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            {f === "today" ? "Hoje" : f === "week" ? "7 dias" : "30 dias"}
          </button>
        ))}
      </div>

      {/* Sales List */}
      <div className="space-y-1 max-h-[320px] overflow-y-auto">
        {sales.filter(s => s.type === "purchase").slice(0, 10).map((sale, index) => (
          <div
            key={sale.id}
            className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-all ${
              index === 0 && newSaleIndicator
                ? isDark ? "bg-bolao-green/10 border border-bolao-green/30" : "bg-bolao-green/5 border border-bolao-green/20"
                : isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-50"
            }`}
          >
            {/* User Initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center text-xs font-bold text-bolao-dark">
              {sale.userInitials.split(" ")[0]?.charAt(0) || "U"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                {sale.userInitials}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${getLotteryColor(sale.lotteryType)}`}>
                  {getLotteryLabel(sale.lotteryType)}
                </span>
                <span className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {sale.bolaoName}
                </span>
              </div>
            </div>

            {/* Amount & Time */}
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-bolao-green">
                R$ {(sale.amount || 150).toLocaleString("pt-BR")}
              </p>
              <div className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {formatTime(sale.timestamp)}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-bolao-green/10">
                <CheckCircle className="w-3 h-3 text-bolao-green" />
                <span className="text-xs text-bolao-green font-medium">Pago</span>
              </div>
            </div>
          </div>
        ))}

        {sales.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Carregando vendas...</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-[#1C2432]">
        <Button 
          variant="ghost" 
          className="w-full text-bolao-green hover:text-bolao-green-light hover:bg-bolao-green/10"
        >
          Ver todas as transações
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

// TheLotter Affiliate Performance Widget
const TheLotterAffiliateWidget = () => {
  const { isDark } = useTheme();
  const [syncing, setSyncing] = useState(false);
  
  // Mock stats for display - in production would use getThisMonthStats()
  const stats = {
    totalClicks: 245,
    totalConversions: 12,
    conversionRate: 4.9,
    estimatedCommission: 1890.50,
    clicksGrowth: 15,
    conversionsGrowth: 20,
  };

  const topLotteries = [
    { name: 'Powerball', flag: '🇺🇸', clicks: 89, conversions: 5, color: '#C41E3A' },
    { name: 'Mega Millions', flag: '🇺🇸', clicks: 67, conversions: 3, color: '#FFD700' },
    { name: 'EuroMillions', flag: '🇪🇺', clicks: 45, conversions: 2, color: '#003399' },
  ];

  const recentConversions = [
    { initials: 'J.S.', lottery: 'Powerball', date: '19/02', commission: 'R$ 245,00' },
    { initials: 'M.F.', lottery: 'EuroMillions', date: '18/02', commission: 'R$ 180,00' },
    { initials: 'A.C.', lottery: 'Mega Millions', date: '17/02', commission: 'R$ 150,00' },
  ];

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              TheLotter - Afiliado
            </h3>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Performance este mês
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/admin/configuracoes">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Cliques</span>
            <span className={`text-xs flex items-center ${stats.clicksGrowth >= 0 ? "text-bolao-green" : "text-red-500"}`}>
              {stats.clicksGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.clicksGrowth)}%
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {stats.totalClicks}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Conversões</span>
            <span className={`text-xs flex items-center ${stats.conversionsGrowth >= 0 ? "text-bolao-green" : "text-red-500"}`}>
              {stats.conversionsGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(stats.conversionsGrowth)}%
            </span>
          </div>
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {stats.totalConversions}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-gray-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Taxa Conv.</span>
          </div>
          <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {stats.conversionRate}%
          </p>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs text-purple-400`}>Comissão Est.</span>
          </div>
          <p className="text-xl font-bold text-purple-500">
            R$ {stats.estimatedCommission.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Top Performing Lotteries */}
      <div className="mb-5">
        <h4 className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          TOP LOTERIAS
        </h4>
        <div className="space-y-2">
          {topLotteries.map((lottery, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg ${
                isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lottery.flag}</span>
                <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                  {lottery.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {lottery.clicks} cliques
                </span>
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: lottery.color }}
                >
                  {lottery.conversions} conv.
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="mb-4">
        <h4 className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          CONVERSÕES RECENTES
        </h4>
        <div className="space-y-2">
          {recentConversions.map((conversion, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between py-2 border-b last:border-0 ${
                isDark ? "border-[#1C2432]" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-medium text-purple-400">
                  {conversion.initials}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {conversion.lottery}
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {conversion.date}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-purple-500">
                {conversion.commission}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Alert for low conversion rate */}
      {stats.conversionRate < 2 && (
        <div className={`p-3 rounded-lg mb-4 ${isDark ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50 border border-amber-200"}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className={`text-xs ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Taxa de conversão abaixo do esperado ({"<"}2%)
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs"
        >
          <Download className="w-3 h-3 mr-1" />
          Relatório
        </Button>
        <a 
          href="https://www.thelotter.com/pt/affiliates"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button 
            size="sm" 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Painel TheLotter
          </Button>
        </a>
      </div>
    </Card>
  );
};

const AdminDashboard = () => {
  const { isDark } = useTheme();
  
  const metrics = [
    {
      icon: DollarSign,
      iconBg: "bg-bolao-green/10",
      iconColor: "text-bolao-green",
      value: "R$ 287.456,80",
      label: "Receita Total",
      sublabel: "+R$ 45.678,90 este mês",
      trend: "+88%",
      trendPositive: true,
    },
    {
      icon: Users,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      value: "15.847",
      label: "Usuários",
      sublabel: "+234 novos este mês",
      trend: "+234",
      trendPositive: true,
    },
    {
      icon: Ticket,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500",
      value: "42",
      label: "Bolões Ativos",
      sublabel: "Apostas: 30 bolões",
      trendPositive: true,
    },
    {
      icon: AlertCircle,
      iconBg: "bg-bolao-orange/10",
      iconColor: "text-bolao-orange",
      value: "8",
      label: "Saques Pendentes",
      sublabel: "Aguardando aprovação",
      trendPositive: false,
    },
  ];

  const recentBolaos = [
    { name: "Lotofácil 18 dez", date: "18/12/2024", progress: 72, value: "R$ 2.448" },
    { name: "Mega-Sena 12 dez", date: "12/12/2024", progress: 85, value: "R$ 4.620" },
    { name: "Quina 10 dez", date: "10/12/2024", progress: 100, value: "R$ 1.350" },
  ];

  const newUsers = [
    { name: "Maria Silva", date: "19/12/2024", initials: "M", color: "bg-bolao-green text-bolao-dark" },
    { name: "João Santos", date: "19/12/2024", initials: "J", color: "bg-blue-500 text-white" },
    { name: "Ana Costa", date: "18/12/2024", initials: "UM", color: "bg-purple-500/20 text-purple-400" },
  ];

  const pendingWithdrawals = [
    { name: "Carlos Mendes", date: "19/12/2024", amount: "R$ 500" },
    { name: "Patricia Lima", date: "19/12/2024", amount: "R$ 200" },
  ];

  return (
    <AdminLayout title="Painel" subtitle="Visão geral do sistema">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Row + Live Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 space-y-4">
          <ChartPlaceholder title="Receita Mensal" icon={TrendingUp} />
          <ChartPlaceholder title="Novos Usuários" icon={BarChart3} />
        </div>
        <LiveSalesFeed />
      </div>

      {/* Middle Row - TheLotter Widget + Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* TheLotter Affiliate Widget */}
        <TheLotterAffiliateWidget />

        {/* Recent Bolaos */}
        <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <SectionHeader title="Bolões Recentes" href="/admin/boloes" />
          <div>
            {recentBolaos.map((bolao, index) => (
              <BolaoItem key={index} {...bolao} />
            ))}
          </div>
        </Card>

        {/* New Users */}
        <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <SectionHeader title="Novos Usuários" href="/admin/usuarios" />
          <div>
            {newUsers.map((user, index) => (
              <UserItem key={index} {...user} />
            ))}
          </div>
        </Card>

        {/* Pending Withdrawals */}
        <Card className={`p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <SectionHeader title="Saques Pendentes" href="/admin/saques" />
          <div>
            {pendingWithdrawals.map((withdrawal, index) => (
              <WithdrawalItem key={index} {...withdrawal} />
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
