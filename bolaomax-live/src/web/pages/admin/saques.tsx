import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Upload,
  Check,
  TrendingUp,
  Calendar,
  CreditCard,
  Building,
  ArrowDownToLine,
} from "lucide-react";

// Types
interface Withdrawal {
  id: string;
  userName: string;
  userInitials: string;
  avatarColor: string;
  cpf: string;
  value: string;
  valueNum: number;
  dateRequested: string;
  status: "pendente" | "aprovado" | "recusado";
  method: "PIX" | "TED";
  pixKey?: string;
  bankData?: {
    bank: string;
    agency: string;
    account: string;
  };
}

// Mock data
const mockWithdrawals: Withdrawal[] = [
  { id: "SAQ001", userName: "Carlos Mendes", userInitials: "CM", avatarColor: "bg-blue-500", cpf: "***.***.789-12", value: "R$ 500,00", valueNum: 500, dateRequested: "19/12/2024 14:32", status: "pendente", method: "PIX", pixKey: "carlos@email.com" },
  { id: "SAQ002", userName: "Patricia Lima", userInitials: "PL", avatarColor: "bg-purple-500", cpf: "***.***.456-78", value: "R$ 200,00", valueNum: 200, dateRequested: "19/12/2024 13:45", status: "pendente", method: "PIX", pixKey: "11999999999" },
  { id: "SAQ003", userName: "Roberto Silva", userInitials: "RS", avatarColor: "bg-bolao-green", cpf: "***.***.123-45", value: "R$ 1.200,00", valueNum: 1200, dateRequested: "19/12/2024 12:20", status: "pendente", method: "TED", bankData: { bank: "Itaú", agency: "1234", account: "56789-0" } },
  { id: "SAQ004", userName: "Maria Silva", userInitials: "MS", avatarColor: "bg-pink-500", cpf: "***.***.987-65", value: "R$ 350,00", valueNum: 350, dateRequested: "18/12/2024 16:50", status: "aprovado", method: "PIX", pixKey: "maria@email.com" },
  { id: "SAQ005", userName: "João Pedro", userInitials: "JP", avatarColor: "bg-orange-500", cpf: "***.***.654-32", value: "R$ 750,00", valueNum: 750, dateRequested: "18/12/2024 15:30", status: "aprovado", method: "PIX", pixKey: "11988888888" },
  { id: "SAQ006", userName: "Ana Costa", userInitials: "AC", avatarColor: "bg-teal-500", cpf: "***.***.321-09", value: "R$ 5.000,00", valueNum: 5000, dateRequested: "18/12/2024 14:10", status: "recusado", method: "TED", bankData: { bank: "Bradesco", agency: "4321", account: "98765-0" } },
  { id: "SAQ007", userName: "Lucas Ferreira", userInitials: "LF", avatarColor: "bg-indigo-500", cpf: "***.***.111-22", value: "R$ 180,00", valueNum: 180, dateRequested: "17/12/2024 11:20", status: "aprovado", method: "PIX", pixKey: "lucas.ferreira@email.com" },
  { id: "SAQ008", userName: "Fernanda Souza", userInitials: "FS", avatarColor: "bg-rose-500", cpf: "***.***.333-44", value: "R$ 2.500,00", valueNum: 2500, dateRequested: "17/12/2024 09:45", status: "pendente", method: "PIX", pixKey: "11977777777" },
];

const statusConfig = {
  pendente: { label: "Pendente", bg: "bg-yellow-500/10", text: "text-yellow-500", icon: Clock },
  aprovado: { label: "Aprovado", bg: "bg-bolao-green/10", text: "text-bolao-green", icon: CheckCircle },
  recusado: { label: "Recusado", bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
};

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
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-bolao-green text-bolao-dark" : "bg-bolao-orange/20 text-bolao-orange"}`}>
        {badge}
      </span>
    )}
  </button>
);

// Stat Card Component
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label, sublabel }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  sublabel?: string;
}) => (
  <Card className="p-4 bg-[#111827] border-[#1C2432]">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sublabel && <p className="text-[10px] text-bolao-green">{sublabel}</p>}
      </div>
    </div>
  </Card>
);

// Approval Modal
const ApprovalModal = ({ isOpen, onClose, withdrawal }: { isOpen: boolean; onClose: () => void; withdrawal: Withdrawal | null }) => {
  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-md mx-4 bg-[#111827] border-[#1C2432]">
        <div className="p-5 border-b border-[#1C2432]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bolao-green/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-bolao-green" />
              </div>
              <div>
                <h2 className="font-bold">Aprovar Saque</h2>
                <p className="text-xs text-muted-foreground">Confirme os dados do saque</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0E14]">
            <div className={`w-10 h-10 rounded-full ${withdrawal.avatarColor} flex items-center justify-center text-sm font-bold text-white`}>
              {withdrawal.userInitials}
            </div>
            <div>
              <p className="font-medium">{withdrawal.userName}</p>
              <p className="text-xs text-muted-foreground">CPF: {withdrawal.cpf}</p>
            </div>
          </div>

          {/* Value */}
          <div className="p-4 rounded-lg bg-bolao-green/5 border border-bolao-green/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Valor do Saque</p>
            <p className="text-3xl font-bold text-bolao-green">{withdrawal.value}</p>
          </div>

          {/* Payment Method */}
          <div className="p-3 rounded-lg bg-[#0A0E14]">
            <p className="text-xs text-muted-foreground mb-2">Método de Pagamento</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-0">{withdrawal.method}</Badge>
              {withdrawal.method === "PIX" && (
                <span className="text-sm">{withdrawal.pixKey}</span>
              )}
              {withdrawal.method === "TED" && withdrawal.bankData && (
                <span className="text-sm">{withdrawal.bankData.bank} - Ag: {withdrawal.bankData.agency} / CC: {withdrawal.bankData.account}</span>
              )}
            </div>
          </div>

          {/* Comprovante Upload */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Comprovante (opcional)</label>
            <div className="border-2 border-dashed border-[#1C2432] rounded-lg p-6 text-center hover:border-bolao-green/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou PDF até 5MB</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[#1C2432] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
            <Check className="w-4 h-4 mr-2" />
            Confirmar Aprovação
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Rejection Modal
const RejectionModal = ({ isOpen, onClose, withdrawal }: { isOpen: boolean; onClose: () => void; withdrawal: Withdrawal | null }) => {
  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-md mx-4 bg-[#111827] border-[#1C2432]">
        <div className="p-5 border-b border-[#1C2432]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-bold">Recusar Saque</h2>
                <p className="text-xs text-muted-foreground">Informe o motivo da recusa</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* User Info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E14]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${withdrawal.avatarColor} flex items-center justify-center text-sm font-bold text-white`}>
                {withdrawal.userInitials}
              </div>
              <p className="font-medium">{withdrawal.userName}</p>
            </div>
            <p className="font-semibold text-bolao-orange">{withdrawal.value}</p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Motivo da Recusa *</label>
            <textarea
              rows={4}
              placeholder="Descreva o motivo da recusa do saque..."
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:outline-none focus:border-red-400 resize-none"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              O usuário será notificado sobre a recusa e poderá contestar a decisão.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-[#1C2432] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold">
            <XCircle className="w-4 h-4 mr-2" />
            Confirmar Recusa
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Suspicious Alert
const SuspiciousAlert = ({ withdrawals }: { withdrawals: Withdrawal[] }) => {
  const highValue = withdrawals.filter(w => w.valueNum >= 2000 && w.status === "pendente");
  
  if (highValue.length === 0) return null;

  return (
    <Card className="p-4 bg-red-500/5 border-red-500/20 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-red-400">Atenção: Saques de Alto Valor</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {highValue.length} saque(s) pendente(s) com valor acima de R$ 2.000. Recomenda-se verificação adicional.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {highValue.map(w => (
              <Badge key={w.id} className="bg-red-500/10 text-red-400 border-0">
                {w.userName}: {w.value}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Component
const AdminSaques = () => {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedForBatch, setSelectedForBatch] = useState<string[]>([]);

  const pendingCount = mockWithdrawals.filter(w => w.status === "pendente").length;
  const pendingValue = mockWithdrawals.filter(w => w.status === "pendente").reduce((sum, w) => sum + w.valueNum, 0);
  const approvedToday = mockWithdrawals.filter(w => w.status === "aprovado" && w.dateRequested.includes("19/12")).length;
  const approvalRate = Math.round((mockWithdrawals.filter(w => w.status === "aprovado").length / mockWithdrawals.length) * 100);

  const filteredWithdrawals = mockWithdrawals.filter((w) => {
    if (activeTab !== "todos" && w.status !== activeTab) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return w.userName.toLowerCase().includes(query) || w.id.toLowerCase().includes(query);
    }
    return true;
  });

  const openApprovalModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsApprovalModalOpen(true);
  };

  const openRejectionModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsRejectionModalOpen(true);
  };

  const toggleBatchSelection = (id: string) => {
    setSelectedForBatch(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout title="Saques" subtitle="Gerencie solicitações de saque">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={ArrowDownToLine} iconBg="bg-blue-500/10" iconColor="text-blue-500" value={mockWithdrawals.length.toString()} label="Total de Saques" />
        <StatCard icon={DollarSign} iconBg="bg-bolao-green/10" iconColor="text-bolao-green" value="R$ 10.680" label="Valor Total" />
        <StatCard icon={Clock} iconBg="bg-yellow-500/10" iconColor="text-yellow-500" value={pendingCount.toString()} label="Pendentes" sublabel={`R$ ${pendingValue.toLocaleString('pt-BR')}`} />
        <StatCard icon={CheckCircle} iconBg="bg-teal-500/10" iconColor="text-teal-400" value={approvedToday.toString()} label="Aprovados Hoje" />
        <StatCard icon={TrendingUp} iconBg="bg-purple-500/10" iconColor="text-purple-400" value={`${approvalRate}%`} label="Taxa de Aprovação" />
      </div>

      {/* Suspicious Alerts */}
      <SuspiciousAlert withdrawals={mockWithdrawals} />

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#1C2432] mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton active={activeTab === "todos"} onClick={() => setActiveTab("todos")}>
            Todos
          </TabButton>
          <TabButton active={activeTab === "pendente"} onClick={() => setActiveTab("pendente")} badge={pendingCount}>
            Pendentes
          </TabButton>
          <TabButton active={activeTab === "aprovado"} onClick={() => setActiveTab("aprovado")}>
            Aprovados
          </TabButton>
          <TabButton active={activeTab === "recusado"} onClick={() => setActiveTab("recusado")}>
            Recusados
          </TabButton>
        </div>
        {selectedForBatch.length > 0 && (
          <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
            <Check className="w-4 h-4 mr-2" />
            Aprovar Selecionados ({selectedForBatch.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por usuário ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
          <input
            type="number"
            placeholder="Min R$"
            className="w-24 px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
          <input
            type="number"
            placeholder="Max R$"
            className="w-24 px-3 py-2 rounded-lg bg-[#111827] border border-[#1C2432] text-sm focus:outline-none focus:border-bolao-green"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#111827] border-[#1C2432] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C2432]">
                {activeTab === "pendente" && (
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#1C2432] bg-[#0A0E14]"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForBatch(filteredWithdrawals.filter(w => w.status === "pendente").map(w => w.id));
                        } else {
                          setSelectedForBatch([]);
                        }
                      }}
                    />
                  </th>
                )}
                <th className="text-left text-xs font-medium text-muted-foreground p-4">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Usuário</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">CPF</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Solicitação</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Método</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((w) => {
                const StatusIcon = statusConfig[w.status].icon;
                return (
                  <tr key={w.id} className="border-b border-[#1C2432] last:border-0 hover:bg-[#1C2432]/30 transition-colors">
                    {activeTab === "pendente" && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedForBatch.includes(w.id)}
                          onChange={() => toggleBatchSelection(w.id)}
                          className="w-4 h-4 rounded border-[#1C2432] bg-[#0A0E14]"
                        />
                      </td>
                    )}
                    <td className="p-4 text-sm text-muted-foreground font-mono">{w.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${w.avatarColor} flex items-center justify-center text-sm font-semibold text-white`}>
                          {w.userInitials}
                        </div>
                        <p className="text-sm font-medium">{w.userName}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground font-mono">{w.cpf}</td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${w.status === "pendente" ? "text-bolao-orange" : ""}`}>
                        {w.value}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{w.dateRequested}</td>
                    <td className="p-4">
                      <Badge className={`${statusConfig[w.status].bg} ${statusConfig[w.status].text} border-0 gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[w.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-blue-500/10 text-blue-400 border-0">{w.method}</Badge>
                    </td>
                    <td className="p-4">
                      {w.status === "pendente" ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            className="h-8 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-medium"
                            onClick={() => openApprovalModal(w)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500/30 hover:bg-red-500/10 text-red-400"
                            onClick={() => openRejectionModal(w)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        withdrawal={selectedWithdrawal}
      />
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        withdrawal={selectedWithdrawal}
      />
    </AdminLayout>
  );
};

export default AdminSaques;
