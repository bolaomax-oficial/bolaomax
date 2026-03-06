import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuditLog, AuditLogEntry, fieldLabels, statusLabels } from "@/contexts/AuditLogContext";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Hash,
  Ticket,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  BarChart3,
  Activity,
  History,
  AlertCircle,
  Star,
  X,
  Eye,
} from "lucide-react";

// Type colors for lottery types
const typeColors = {
  lotofacil: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  megasena: { bg: "bg-bolao-green/10", text: "text-bolao-green", border: "border-bolao-green/30" },
  quina: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
};

// Change type configuration
const changeTypeConfig = {
  create: { label: "Criação", icon: Plus, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  edit: { label: "Edição", icon: Edit, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  status_change: { label: "Status", icon: RefreshCw, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  delete: { label: "Exclusão", icon: Trash2, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  bulk_edit: { label: "Lote", icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
};

// Tab button component
const TabButton = ({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
        active
          ? "bg-bolao-green text-bolao-dark"
          : isDark 
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
          active ? "bg-bolao-dark/20" : isDark ? "bg-[#1C2432]" : "bg-gray-200"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

// Audit entry row component
const AuditEntryRow = ({ entry, isExpanded, onToggle }: { entry: AuditLogEntry; isExpanded: boolean; onToggle: () => void }) => {
  const { isDark } = useTheme();
  const config = changeTypeConfig[entry.changeType];
  const date = new Date(entry.timestamp);
  const dateStr = date.toLocaleDateString("pt-BR");
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`border-b last:border-0 ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
      {/* Main Row */}
      <div
        onClick={onToggle}
        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
          isDark ? "hover:bg-[#1C2432]/30" : "hover:bg-gray-50"
        } ${isExpanded ? (isDark ? "bg-[#1C2432]/20" : "bg-gray-50") : ""}`}
      >
        {/* Expand Icon */}
        <div className={`w-6 h-6 flex items-center justify-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>

        {/* Change Type Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} border ${config.border}`}>
          <config.icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {entry.bolaoCode}
            </span>
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>•</span>
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {entry.bolaoName}
            </span>
            {entry.isSpecialEvent && (
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-[10px]">
                <Star className="w-3 h-3 mr-1" />
                ESPECIAL
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-[10px] ${config.bg} ${config.color} border ${config.border}`}>
              {config.label}
            </Badge>
            <Badge className={`text-[10px] ${typeColors[entry.bolaoType].bg} ${typeColors[entry.bolaoType].text} border ${typeColors[entry.bolaoType].border}`}>
              {entry.bolaoType === "lotofacil" ? "Lotofácil" : entry.bolaoType === "megasena" ? "Mega-Sena" : "Quina"}
            </Badge>
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {entry.changes.length} alteração{entry.changes.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        {/* Admin & Date */}
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <User className={`w-3.5 h-3.5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {entry.adminUser}
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            <Calendar className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {dateStr}
            </span>
            <Clock className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`px-4 pb-4 pl-20 ${isDark ? "bg-[#1C2432]/10" : "bg-gray-50/50"}`}>
          {/* Changes List */}
          <div className="space-y-2">
            <p className={`text-xs font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              ALTERAÇÕES REALIZADAS
            </p>
            {entry.changes.map((change, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? "bg-[#0A0E14]/60" : "bg-white"}`}
              >
                <div className={`w-2 h-2 rounded-full ${config.bg} ${config.color}`} />
                <span className={`text-sm font-medium min-w-[140px] ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {change.fieldLabel}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-sm px-2 py-0.5 rounded ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
                    {change.oldValue || "(vazio)"}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                  <span className={`text-sm px-2 py-0.5 rounded ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
                    {change.newValue || "(vazio)"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Reason if provided */}
          {entry.reason && (
            <div className={`mt-4 p-3 rounded-lg border ${isDark ? "border-[#1C2432] bg-[#0A0E14]/40" : "border-gray-200 bg-gray-50"}`}>
              <p className={`text-xs font-semibold mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                MOTIVO DA ALTERAÇÃO
              </p>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {entry.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Timeline view component
const TimelineView = ({ entries }: { entries: AuditLogEntry[] }) => {
  const { isDark } = useTheme();

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, AuditLogEntry[]> = {};
    entries.forEach((entry) => {
      const date = new Date(entry.timestamp).toLocaleDateString("pt-BR");
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    return groups;
  }, [entries]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date}>
          {/* Date Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1.5 rounded-lg ${isDark ? "bg-[#1C2432]" : "bg-gray-100"}`}>
              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {date}
              </span>
            </div>
            <div className={`flex-1 h-px ${isDark ? "bg-[#1C2432]" : "bg-gray-200"}`} />
            <Badge className={`${isDark ? "bg-[#1C2432] text-gray-400" : "bg-gray-100 text-gray-600"} border-0`}>
              {dateEntries.length} alterações
            </Badge>
          </div>

          {/* Timeline Items */}
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div className={`absolute left-3 top-0 bottom-0 w-0.5 ${isDark ? "bg-[#1C2432]" : "bg-gray-200"}`} />

            <div className="space-y-4">
              {dateEntries.map((entry) => {
                const config = changeTypeConfig[entry.changeType];
                const time = new Date(entry.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${config.bg} ${config.border}`}>
                      <div className={`absolute inset-1 rounded-full ${config.color.replace("text-", "bg-")}`} />
                    </div>

                    {/* Content Card */}
                    <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${config.bg} ${config.color} border ${config.border}`}>
                            <config.icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {time}
                          </span>
                        </div>
                        {entry.isSpecialEvent && (
                          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-[10px]">
                            <Star className="w-3 h-3 mr-1" />
                            ESPECIAL
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-3.5 h-3.5 text-bolao-green" />
                        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          {entry.bolaoCode}
                        </span>
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {entry.bolaoName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <User className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                          {entry.adminUser}
                        </span>
                        <span className={isDark ? "text-gray-600" : "text-gray-300"}>•</span>
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                          {entry.changes.length} campo{entry.changes.length !== 1 ? "s" : ""} alterado{entry.changes.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Changes Preview */}
                      <div className="mt-3 space-y-1">
                        {entry.changes.slice(0, 2).map((change, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                              {change.fieldLabel}:
                            </span>
                            <span className="text-red-400 line-through">{change.oldValue}</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <span className="text-green-400">{change.newValue}</span>
                          </div>
                        ))}
                        {entry.changes.length > 2 && (
                          <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            +{entry.changes.length - 2} mais alterações
                          </span>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Stats component
const AuditStats = ({ entries }: { entries: AuditLogEntry[] }) => {
  const { isDark } = useTheme();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekTs = thisWeek.getTime();

    return {
      total: entries.length,
      today: entries.filter((e) => e.timestamp >= todayTs).length,
      thisWeek: entries.filter((e) => e.timestamp >= weekTs).length,
      byType: {
        create: entries.filter((e) => e.changeType === "create").length,
        edit: entries.filter((e) => e.changeType === "edit").length,
        status_change: entries.filter((e) => e.changeType === "status_change").length,
        delete: entries.filter((e) => e.changeType === "delete").length,
        bulk_edit: entries.filter((e) => e.changeType === "bulk_edit").length,
      },
      specialEvents: entries.filter((e) => e.isSpecialEvent).length,
    };
  }, [entries]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bolao-green/10 flex items-center justify-center">
            <History className="w-5 h-5 text-bolao-green" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.total}</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total de registros</p>
          </div>
        </div>
      </Card>

      <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.today}</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Hoje</p>
          </div>
        </div>
      </Card>

      <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.thisWeek}</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Esta semana</p>
          </div>
        </div>
      </Card>

      <Card className={`p-4 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Star className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{stats.specialEvents}</p>
            <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bolões especiais</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Main component
const AdminAuditoria = () => {
  const { isDark } = useTheme();
  const { entries, exportToCSV } = useAuditLog();
  
  const [activeTab, setActiveTab] = useState<"list" | "timeline">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [lotteryFilter, setLotteryFilter] = useState<string>("todos");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Toggle expanded entry
  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          entry.bolaoCode.toLowerCase().includes(query) ||
          entry.bolaoName.toLowerCase().includes(query) ||
          entry.adminUser.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== "todos" && entry.changeType !== typeFilter) return false;

      // Lottery filter
      if (lotteryFilter !== "todos" && entry.bolaoType !== lotteryFilter) return false;

      // Date range filter
      if (dateRange.start) {
        const start = new Date(dateRange.start).getTime();
        if (entry.timestamp < start) return false;
      }
      if (dateRange.end) {
        const end = new Date(dateRange.end).getTime() + 24 * 60 * 60 * 1000; // Include end date
        if (entry.timestamp > end) return false;
      }

      return true;
    });
  }, [entries, searchQuery, typeFilter, lotteryFilter, dateRange]);

  // Handle export
  const handleExport = () => {
    const csv = exportToCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_boloes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <AdminLayout title="Auditoria de Bolões" subtitle="Histórico de alterações e modificações">
      {/* Stats */}
      <AuditStats entries={entries} />

      {/* Filters */}
      <div className="mt-6 flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="text"
            placeholder="Buscar por código, nome ou administrador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
              isDark 
                ? "bg-[#111827] border-[#1C2432] text-white placeholder-gray-500"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
              isDark 
                ? "bg-[#111827] border-[#1C2432] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
          <span className={isDark ? "text-gray-500" : "text-gray-400"}>até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className={`px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
              isDark 
                ? "bg-[#111827] border-[#1C2432] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          />
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tipo:</span>
          {["todos", "create", "edit", "status_change", "bulk_edit", "delete"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                typeFilter === type
                  ? "bg-bolao-green text-bolao-dark"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {type === "todos" ? "Todos" : changeTypeConfig[type as keyof typeof changeTypeConfig]?.label || type}
            </button>
          ))}
        </div>

        {/* Lottery Filter */}
        <div className={`flex items-center gap-2 pl-4 border-l ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
          <Ticket className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loteria:</span>
          {["todos", "lotofacil", "megasena", "quina"].map((type) => (
            <button
              key={type}
              onClick={() => setLotteryFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                lotteryFilter === type
                  ? "bg-bolao-green text-bolao-dark"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {type === "todos" ? "Todos" : type === "lotofacil" ? "Lotofácil" : type === "megasena" ? "Mega-Sena" : "Quina"}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="mt-6 flex items-center justify-between">
        <div className={`flex items-center gap-1 p-1 rounded-lg border ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <TabButton active={activeTab === "list"} onClick={() => setActiveTab("list")}>
            <FileText className="w-4 h-4" />
            Lista
          </TabButton>
          <TabButton active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")}>
            <Activity className="w-4 h-4" />
            Timeline
          </TabButton>
        </div>

        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {filteredEntries.length} registro{filteredEntries.length !== 1 ? "s" : ""} encontrado{filteredEntries.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      <div className="mt-4">
        {filteredEntries.length === 0 ? (
          <Card className={`p-12 text-center ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
              <History className={`w-8 h-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Nenhum registro encontrado
            </p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {searchQuery || typeFilter !== "todos" || lotteryFilter !== "todos" || dateRange.start || dateRange.end
                ? "Tente ajustar os filtros de busca"
                : "O histórico de alterações aparecerá aqui quando bolões forem editados"}
            </p>
          </Card>
        ) : activeTab === "list" ? (
          <Card className={`overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            {filteredEntries.map((entry) => (
              <AuditEntryRow
                key={entry.id}
                entry={entry}
                isExpanded={expandedEntries.has(entry.id)}
                onToggle={() => toggleExpanded(entry.id)}
              />
            ))}
          </Card>
        ) : (
          <TimelineView entries={filteredEntries} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditoria;
