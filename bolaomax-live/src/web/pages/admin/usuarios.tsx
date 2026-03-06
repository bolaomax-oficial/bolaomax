import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  MoreVertical,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  X,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  dataCadastro: string;
  saldo: string;
  status: "ativo" | "bloqueado" | "verificado";
  initials: string;
  avatarColor: string;
}

// Mock data
const mockUsers: User[] = [
  { id: "USR001", name: "Maria Silva Santos", email: "maria.silva@email.com", cpf: "***.***.789-12", dataCadastro: "15/12/2024", saldo: "R$ 1.250,00", status: "verificado", initials: "MS", avatarColor: "bg-purple-500" },
  { id: "USR002", name: "João Pedro Oliveira", email: "joao.pedro@email.com", cpf: "***.***.456-78", dataCadastro: "14/12/2024", saldo: "R$ 450,00", status: "ativo", initials: "JP", avatarColor: "bg-blue-500" },
  { id: "USR003", name: "Ana Carolina Costa", email: "ana.costa@email.com", cpf: "***.***.123-45", dataCadastro: "13/12/2024", saldo: "R$ 2.800,00", status: "verificado", initials: "AC", avatarColor: "bg-bolao-green" },
  { id: "USR004", name: "Carlos Eduardo Lima", email: "carlos.lima@email.com", cpf: "***.***.987-65", dataCadastro: "12/12/2024", saldo: "R$ 0,00", status: "bloqueado", initials: "CL", avatarColor: "bg-red-500" },
  { id: "USR005", name: "Patricia Mendes", email: "patricia.mendes@email.com", cpf: "***.***.654-32", dataCadastro: "11/12/2024", saldo: "R$ 890,00", status: "ativo", initials: "PM", avatarColor: "bg-bolao-orange" },
  { id: "USR006", name: "Roberto Almeida", email: "roberto.almeida@email.com", cpf: "***.***.321-09", dataCadastro: "10/12/2024", saldo: "R$ 3.500,00", status: "verificado", initials: "RA", avatarColor: "bg-teal-500" },
];

const statusConfig = {
  ativo: { label: "Ativo", bg: "bg-bolao-green/10", text: "text-bolao-green" },
  bloqueado: { label: "Bloqueado", bg: "bg-red-500/10", text: "text-red-400" },
  verificado: { label: "Verificado", bg: "bg-blue-500/10", text: "text-blue-400" },
};

// Filter Button Component
const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
      active
        ? "bg-[#1C2432] text-white border border-[#2D3748]"
        : "text-muted-foreground hover:text-white hover:bg-[#1C2432]/50"
    }`}
  >
    {children}
  </button>
);

// Stat Card Component
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}) => (
  <Card className="p-4 bg-[#111827] border-[#1C2432]">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </Card>
);

// User Detail Modal
const UserDetailModal = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User | null }) => {
  if (!isOpen || !user) return null;

  const participations = [
    { name: "Lotofácil 18 dez", value: "R$ 50,00", status: "Ativo" },
    { name: "Mega-Sena Virada", value: "R$ 150,00", status: "Aguardando" },
    { name: "Quina Premium", value: "R$ 30,00", status: "Finalizado" },
  ];

  const transactions = [
    { type: "Depósito", value: "+R$ 500,00", date: "19/12/2024", color: "text-bolao-green" },
    { type: "Aposta", value: "-R$ 50,00", date: "18/12/2024", color: "text-red-400" },
    { type: "Prêmio", value: "+R$ 125,00", date: "17/12/2024", color: "text-bolao-green" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto bg-[#111827] border-[#1C2432]">
        {/* Header */}
        <div className="sticky top-0 bg-[#111827] border-b border-[#1C2432] p-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full ${user.avatarColor} flex items-center justify-center text-xl font-bold text-white`}>
              {user.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`mt-1 ${statusConfig[user.status].bg} ${statusConfig[user.status].text} border-0`}>
                {statusConfig[user.status].label}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-5 space-y-6">
          {/* Personal Data */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-xs text-muted-foreground mb-1">CPF</p>
                <p className="text-sm font-medium">{user.cpf}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-xs text-muted-foreground mb-1">Data de Cadastro</p>
                <p className="text-sm font-medium">{user.dataCadastro}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                <p className="text-sm font-medium">(11) 99999-9999</p>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-bolao-green/10 to-transparent border border-bolao-green/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Saldo Disponível</p>
                <p className="text-2xl font-bold text-bolao-green">{user.saldo}</p>
              </div>
              <Button variant="outline" size="sm" className="border-bolao-green/30 hover:bg-bolao-green/10 text-bolao-green">
                <DollarSign className="w-4 h-4 mr-1" />
                Ajustar Saldo
              </Button>
            </div>
          </div>

          {/* Participations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Histórico de Participações
              </h3>
              <Button variant="ghost" size="sm" className="text-xs text-bolao-green">
                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {participations.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.status}</p>
                  </div>
                  <p className="text-sm font-semibold">{p.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                Transações Recentes
              </h3>
              <Button variant="ghost" size="sm" className="text-xs text-bolao-green">
                Ver todos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                  <div>
                    <p className="text-sm font-medium">{t.type}</p>
                    <p className="text-xs text-muted-foreground">{t.date}</p>
                  </div>
                  <p className={`text-sm font-semibold ${t.color}`}>{t.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Graph Placeholder */}
          <div className="p-4 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
            <h3 className="text-sm font-semibold mb-4">Gráfico de Atividade</h3>
            <div className="h-24 flex items-end justify-between gap-1">
              {[40, 65, 30, 80, 55, 90, 45, 70, 35, 85, 50, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-bolao-green/30 rounded-t transition-all hover:bg-bolao-green/50"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-muted-foreground">Jan</span>
              <span className="text-[10px] text-muted-foreground">Dez</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-[#111827] border-t border-[#1C2432] p-5 flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none border-red-500/30 hover:bg-red-500/10 text-red-400">
            <Lock className="w-4 h-4 mr-2" />
            Bloquear Usuário
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar Senha
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Eye className="w-4 h-4 mr-2" />
            Histórico Completo
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none border-bolao-orange/30 hover:bg-bolao-orange/10 text-bolao-orange">
            <DollarSign className="w-4 h-4 mr-2" />
            Reembolso Manual
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main Component
const AdminUsuarios = () => {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredUsers = mockUsers.filter((user) => {
    if (activeFilter !== "todos" && user.status !== activeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.cpf.includes(query)
      );
    }
    return true;
  });

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  return (
    <AdminLayout title="Usuários" subtitle="Gerencie todos os usuários do sistema">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-500" value="15.847" label="Total de Usuários" />
        <StatCard icon={UserCheck} iconBg="bg-bolao-green/10" iconColor="text-bolao-green" value="12.432" label="Ativos (30 dias)" />
        <StatCard icon={UserPlus} iconBg="bg-purple-500/10" iconColor="text-purple-400" value="234" label="Novos (7 dias)" />
        <StatCard icon={UserX} iconBg="bg-red-500/10" iconColor="text-red-400" value="89" label="Bloqueados" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <FilterButton active={activeFilter === "todos"} onClick={() => setActiveFilter("todos")}>
            Todos
          </FilterButton>
          <FilterButton active={activeFilter === "ativo"} onClick={() => setActiveFilter("ativo")}>
            Ativos
          </FilterButton>
          <FilterButton active={activeFilter === "bloqueado"} onClick={() => setActiveFilter("bloqueado")}>
            Bloqueados
          </FilterButton>
          <FilterButton active={activeFilter === "verificado"} onClick={() => setActiveFilter("verificado")}>
            Verificados
          </FilterButton>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Email</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">CPF</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Cadastro</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Saldo</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${user.avatarColor} flex items-center justify-center text-sm font-semibold text-white`}>
                        {user.initials}
                      </div>
                      <p className="text-sm font-medium">{user.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-sm text-muted-foreground font-mono">{user.cpf}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.dataCadastro}</td>
                  <td className="p-4 text-sm font-medium">{user.saldo}</td>
                  <td className="p-4">
                    <Badge className={`${statusConfig[user.status].bg} ${statusConfig[user.status].text} border-0`}>
                      {statusConfig[user.status].label}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-[#1C2432]"
                        onClick={() => openUserDetail(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.status === "bloqueado" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1C2432] hover:text-bolao-green">
                          <Unlock className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1C2432] hover:text-red-400">
                          <Lock className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#1C2432]">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
      />
    </AdminLayout>
  );
};

export default AdminUsuarios;
