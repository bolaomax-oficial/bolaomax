import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Check,
  Star,
  Calendar,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Edit2,
  TrendingUp,
  User,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";

// Types
interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  avatarColor: string;
  rating: number;
  title: string;
  message: string;
  showName: boolean;
  status: "pendente" | "aprovado" | "rejeitado";
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  adminNote?: string;
}

// Mock data
const mockTestimonials: Testimonial[] = [
  {
    id: "DEP001",
    userId: "u1",
    userName: "João Silva",
    userEmail: "joao.silva@email.com",
    userInitials: "JS",
    avatarColor: "bg-blue-500",
    rating: 5,
    title: "Melhor plataforma de bolões!",
    message: "Já participei de vários bolões e a experiência sempre foi ótima. A equipe é muito transparente e o suporte é excelente. Recomendo a todos que querem aumentar suas chances de ganhar na loteria!",
    showName: true,
    status: "aprovado",
    createdAt: "10/01/2025",
    approvedAt: "12/01/2025",
  },
  {
    id: "DEP002",
    userId: "u2",
    userName: "Maria Santos",
    userEmail: "maria.santos@email.com",
    userInitials: "MS",
    avatarColor: "bg-pink-500",
    rating: 5,
    title: "Ganhei meu primeiro prêmio!",
    message: "Participei de um bolão da Mega-Sena e ganhamos! O processo de saque foi super rápido e sem complicações. A plataforma é muito confiável.",
    showName: true,
    status: "pendente",
    createdAt: "05/02/2025",
  },
  {
    id: "DEP003",
    userId: "u3",
    userName: "Carlos Oliveira",
    userEmail: "carlos.oliveira@email.com",
    userInitials: "CO",
    avatarColor: "bg-purple-500",
    rating: 4,
    title: "Muito satisfeito com o serviço",
    message: "A experiência tem sido muito boa. Os bolões são bem organizados e dá pra acompanhar tudo em tempo real. Só falta melhorar o app mobile.",
    showName: false,
    status: "pendente",
    createdAt: "06/02/2025",
  },
  {
    id: "DEP004",
    userId: "u4",
    userName: "Ana Paula Costa",
    userEmail: "ana.costa@email.com",
    userInitials: "AC",
    avatarColor: "bg-teal-500",
    rating: 5,
    title: "Excelente custo-benefício",
    message: "Participar de bolões aqui é muito mais barato do que jogar sozinho e as chances são muito maiores. Super recomendo!",
    showName: true,
    status: "aprovado",
    createdAt: "01/02/2025",
    approvedAt: "03/02/2025",
  },
  {
    id: "DEP005",
    userId: "u5",
    userName: "Roberto Ferreira",
    userEmail: "roberto.f@email.com",
    userInitials: "RF",
    avatarColor: "bg-orange-500",
    rating: 3,
    title: "Bom, mas pode melhorar",
    message: "A plataforma funciona bem, mas achei o suporte um pouco demorado quando tive uma dúvida.",
    showName: true,
    status: "pendente",
    createdAt: "07/02/2025",
  },
  {
    id: "DEP006",
    userId: "u6",
    userName: "Patricia Lima",
    userEmail: "patricia.lima@email.com",
    userInitials: "PL",
    avatarColor: "bg-indigo-500",
    rating: 2,
    title: "Experiência ruim",
    message: "Não gostei da plataforma. Tive problemas com o pagamento e ninguém me ajudou.",
    showName: false,
    status: "rejeitado",
    createdAt: "20/01/2025",
    rejectedAt: "22/01/2025",
    adminNote: "Feedback não construtivo e possível tentativa de difamação.",
  },
  {
    id: "DEP007",
    userId: "u7",
    userName: "Lucas Mendes",
    userEmail: "lucas.m@email.com",
    userInitials: "LM",
    avatarColor: "bg-emerald-500",
    rating: 5,
    title: "Incrível! Já indiquei para toda família",
    message: "Desde que comecei a usar o BolãoMax minha experiência com loterias mudou completamente. Muito mais fácil, seguro e com melhores chances!",
    showName: true,
    status: "aprovado",
    createdAt: "15/01/2025",
    approvedAt: "17/01/2025",
  },
  {
    id: "DEP008",
    userId: "u8",
    userName: "Fernanda Souza",
    userEmail: "fernanda.s@email.com",
    userInitials: "FS",
    avatarColor: "bg-rose-500",
    rating: 4,
    title: "Plataforma confiável",
    message: "Uso há 3 meses e até agora tudo certo. Os resultados são divulgados rapidamente e os prêmios pagos sem problemas.",
    showName: true,
    status: "pendente",
    createdAt: "08/02/2025",
  },
];

const statusConfig = {
  pendente: { label: "Pendente", bg: "bg-amber-500/10", text: "text-amber-500", icon: Clock },
  aprovado: { label: "Aprovado", bg: "bg-bolao-green/10", text: "text-bolao-green", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", bg: "bg-red-500/10", text: "text-red-400", icon: XCircle },
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-bolao-green text-bolao-dark" : "bg-amber-500/20 text-amber-500"}`}>
        {badge}
      </span>
    )}
  </button>
);

// Stat Card Component
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label, sublabel, highlight }: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  sublabel?: string;
  highlight?: boolean;
}) => (
  <Card className={`p-4 ${highlight ? "bg-amber-500/5 border-amber-500/30" : "bg-[#111827] border-[#1C2432]"}`}>
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

// Star Rating Display
const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} ${
          rating >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

// Preview Modal
const PreviewModal = ({ isOpen, onClose, testimonial }: { isOpen: boolean; onClose: () => void; testimonial: Testimonial | null }) => {
  if (!isOpen || !testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-lg mx-4 bg-[#111827] border-[#1C2432]">
        <div className="p-5 border-b border-[#1C2432]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="font-bold">Preview do Depoimento</h2>
                <p className="text-xs text-muted-foreground">Como aparecerá na página inicial</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-5">
          {/* Preview Card */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#0A0E14] to-[#111827] border border-[#1C2432]">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-lg font-bold text-white`}>
                {testimonial.showName ? testimonial.userInitials : "?"}
              </div>
              <div>
                <p className="font-semibold">{testimonial.showName ? testimonial.userName : "Anônimo"}</p>
                <StarRating rating={testimonial.rating} size="md" />
              </div>
            </div>
            {testimonial.title && (
              <h3 className="font-semibold text-lg mb-2">"{testimonial.title}"</h3>
            )}
            <p className="text-muted-foreground">
              {testimonial.message}
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-[#1C2432]">
          <Button onClick={onClose} className="w-full">
            Fechar Preview
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Approval Modal
const ApprovalModal = ({ isOpen, onClose, testimonial, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  testimonial: Testimonial | null;
  onConfirm: (adminNote: string) => void;
}) => {
  const [adminNote, setAdminNote] = useState("");
  
  if (!isOpen || !testimonial) return null;

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
                <h2 className="font-bold">Aprovar Depoimento</h2>
                <p className="text-xs text-muted-foreground">Confirme a aprovação</p>
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
            <div className={`w-10 h-10 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-sm font-bold text-white`}>
              {testimonial.userInitials}
            </div>
            <div>
              <p className="font-medium">{testimonial.userName}</p>
              <p className="text-xs text-muted-foreground">{testimonial.userEmail}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E14]">
            <span className="text-sm text-muted-foreground">Avaliação</span>
            <StarRating rating={testimonial.rating} />
          </div>

          {/* Message Preview */}
          <div className="p-3 rounded-lg bg-[#0A0E14]">
            <p className="text-xs text-muted-foreground mb-2">Mensagem</p>
            <p className="text-sm line-clamp-3">{testimonial.message}</p>
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Nota do admin (opcional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Adicione uma nota interna..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-[#1C2432] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
            onClick={() => {
              onConfirm(adminNote);
              onClose();
              setAdminNote("");
            }}
          >
            <Check className="w-4 h-4 mr-2" />
            Aprovar
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Rejection Modal
const RejectionModal = ({ isOpen, onClose, testimonial, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  testimonial: Testimonial | null;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");
  
  if (!isOpen || !testimonial) return null;

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
                <h2 className="font-bold">Rejeitar Depoimento</h2>
                <p className="text-xs text-muted-foreground">Informe o motivo</p>
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
            <div className={`w-10 h-10 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-sm font-bold text-white`}>
              {testimonial.userInitials}
            </div>
            <div>
              <p className="font-medium">{testimonial.userName}</p>
              <p className="text-xs text-muted-foreground">{testimonial.userEmail}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Motivo da rejeição <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique o motivo da rejeição..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              O usuário será notificado sobre a rejeição, mas não verá o motivo informado.
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-[#1C2432] flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
            disabled={!reason.trim()}
            onClick={() => {
              onConfirm(reason);
              onClose();
              setReason("");
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Rejeitar
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, testimonial, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  testimonial: Testimonial | null;
  onConfirm: () => void;
}) => {
  if (!isOpen || !testimonial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-sm mx-4 bg-[#111827] border-[#1C2432]">
        <div className="p-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="font-bold text-lg mb-2">Excluir Depoimento?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Esta ação não pode ser desfeita. O depoimento de <strong>{testimonial.userName}</strong> será permanentemente removido.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default function AdminDepoimentos() {
  // State
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
  const [activeTab, setActiveTab] = useState<"todos" | "pendente" | "aprovado" | "rejeitado">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedTestimonials, setSelectedTestimonials] = useState<string[]>([]);
  
  // Modal states
  const [previewTestimonial, setPreviewTestimonial] = useState<Testimonial | null>(null);
  const [approvalTestimonial, setApprovalTestimonial] = useState<Testimonial | null>(null);
  const [rejectionTestimonial, setRejectionTestimonial] = useState<Testimonial | null>(null);
  const [deleteTestimonial, setDeleteTestimonial] = useState<Testimonial | null>(null);

  // Calculate stats
  const totalTestimonials = testimonials.length;
  const pendingCount = testimonials.filter(t => t.status === "pendente").length;
  const approvedCount = testimonials.filter(t => t.status === "aprovado").length;
  const rejectedCount = testimonials.filter(t => t.status === "rejeitado").length;
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : "0.0";

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(t => {
    const matchesTab = activeTab === "todos" || t.status === activeTab;
    const matchesSearch = !searchQuery || 
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = !ratingFilter || t.rating === ratingFilter;
    return matchesTab && matchesSearch && matchesRating;
  });

  // Handlers
  const handleApprove = (id: string, adminNote: string) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: "aprovado" as const, approvedAt: new Date().toLocaleDateString("pt-BR"), adminNote }
        : t
    ));
  };

  const handleReject = (id: string, reason: string) => {
    setTestimonials(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: "rejeitado" as const, rejectedAt: new Date().toLocaleDateString("pt-BR"), adminNote: reason }
        : t
    ));
  };

  const handleDelete = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    setSelectedTestimonials(prev => prev.filter(selId => selId !== id));
  };

  const handleBulkApprove = () => {
    setTestimonials(prev => prev.map(t => 
      selectedTestimonials.includes(t.id) && t.status === "pendente"
        ? { ...t, status: "aprovado" as const, approvedAt: new Date().toLocaleDateString("pt-BR") }
        : t
    ));
    setSelectedTestimonials([]);
  };

  const handleBulkReject = () => {
    setTestimonials(prev => prev.map(t => 
      selectedTestimonials.includes(t.id) && t.status === "pendente"
        ? { ...t, status: "rejeitado" as const, rejectedAt: new Date().toLocaleDateString("pt-BR") }
        : t
    ));
    setSelectedTestimonials([]);
  };

  const handleBulkDelete = () => {
    setTestimonials(prev => prev.filter(t => !selectedTestimonials.includes(t.id)));
    setSelectedTestimonials([]);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Usuário", "Email", "Avaliação", "Título", "Mensagem", "Status", "Data Envio", "Data Aprovação"];
    const rows = testimonials.map(t => [
      t.id,
      t.userName,
      t.userEmail,
      t.rating.toString(),
      t.title,
      t.message.replace(/"/g, '""'),
      t.status,
      t.createdAt,
      t.approvedAt || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `depoimentos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const toggleSelect = (id: string) => {
    setSelectedTestimonials(prev => 
      prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTestimonials.length === filteredTestimonials.length) {
      setSelectedTestimonials([]);
    } else {
      setSelectedTestimonials(filteredTestimonials.map(t => t.id));
    }
  };

  return (
    <AdminLayout title="Depoimentos" subtitle="Gerencie os depoimentos dos usuários">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={MessageSquare}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          value={totalTestimonials}
          label="Total de Depoimentos"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          value={pendingCount}
          label="Pendentes"
          highlight={pendingCount > 0}
        />
        <StatCard
          icon={CheckCircle}
          iconBg="bg-bolao-green/10"
          iconColor="text-bolao-green"
          value={approvedCount}
          label="Aprovados"
        />
        <StatCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          value={rejectedCount}
          label="Rejeitados"
        />
        <StatCard
          icon={Star}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
          value={averageRating}
          label="Avaliação Média"
        />
      </div>

      {/* Main Card */}
      <Card className="bg-[#111827] border-[#1C2432]">
        {/* Tabs & Actions Header */}
        <div className="p-4 border-b border-[#1C2432]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#1C2432]">
              <TabButton active={activeTab === "todos"} onClick={() => setActiveTab("todos")}>
                Todos
              </TabButton>
              <TabButton active={activeTab === "pendente"} onClick={() => setActiveTab("pendente")} badge={pendingCount}>
                Pendentes
              </TabButton>
              <TabButton active={activeTab === "aprovado"} onClick={() => setActiveTab("aprovado")}>
                Aprovados
              </TabButton>
              <TabButton active={activeTab === "rejeitado"} onClick={() => setActiveTab("rejeitado")}>
                Rejeitados
              </TabButton>
            </div>

            {/* Export Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              className="border-[#1C2432] hover:bg-[#1C2432]"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[#1C2432] flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou conteúdo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={ratingFilter ?? ""}
              onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2.5 rounded-lg bg-[#0A0E14] border border-[#1C2432] text-sm focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none"
            >
              <option value="">Todas avaliações</option>
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
              <option value="2">2 estrelas</option>
              <option value="1">1 estrela</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTestimonials.length > 0 && (
          <div className="p-4 border-b border-[#1C2432] bg-purple-500/5 flex items-center justify-between">
            <span className="text-sm">
              <strong>{selectedTestimonials.length}</strong> depoimento{selectedTestimonials.length !== 1 ? "s" : ""} selecionado{selectedTestimonials.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
                onClick={handleBulkApprove}
              >
                <Check className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={handleBulkReject}
              >
                <X className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        )}

        {/* Testimonials List */}
        <div className="divide-y divide-[#1C2432]">
          {/* Select All Row */}
          {filteredTestimonials.length > 0 && (
            <div className="px-4 py-3 bg-[#0A0E14] flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-[#1C2432] text-bolao-green focus:ring-bolao-green bg-[#111827]"
              />
              <span className="text-xs text-muted-foreground">
                Selecionar todos ({filteredTestimonials.length})
              </span>
            </div>
          )}

          {filteredTestimonials.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0A0E14] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhum depoimento encontrado</p>
            </div>
          ) : (
            filteredTestimonials.map((testimonial) => {
              const config = statusConfig[testimonial.status];
              const StatusIcon = config.icon;

              return (
                <div key={testimonial.id} className="p-4 hover:bg-[#0A0E14] transition-colors">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(testimonial.id)}
                        onChange={() => toggleSelect(testimonial.id)}
                        className="w-4 h-4 rounded border-[#1C2432] text-bolao-green focus:ring-bolao-green bg-[#111827]"
                      />
                    </div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-lg font-bold text-white flex-shrink-0`}>
                      {testimonial.userInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{testimonial.userName}</span>
                            <Badge className={`${config.bg} ${config.text} border-0 text-xs`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                            {!testimonial.showName && (
                              <Badge className="bg-gray-500/10 text-gray-400 border-0 text-xs">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Anônimo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{testimonial.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={testimonial.rating} />
                        </div>
                      </div>

                      {/* Title & Message */}
                      {testimonial.title && (
                        <h4 className="font-medium mb-1">"{testimonial.title}"</h4>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {testimonial.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Enviado: {testimonial.createdAt}
                          </span>
                          {testimonial.approvedAt && (
                            <span className="flex items-center gap-1 text-bolao-green">
                              <Check className="w-3 h-3" />
                              Aprovado: {testimonial.approvedAt}
                            </span>
                          )}
                          {testimonial.rejectedAt && (
                            <span className="flex items-center gap-1 text-red-400">
                              <X className="w-3 h-3" />
                              Rejeitado: {testimonial.rejectedAt}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewTestimonial(testimonial)}
                            className="text-muted-foreground hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {testimonial.status === "pendente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setApprovalTestimonial(testimonial)}
                                className="text-bolao-green hover:bg-bolao-green/10"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectionTestimonial(testimonial)}
                                className="text-red-400 hover:bg-red-500/10"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTestimonial(testimonial)}
                            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Admin Note (if exists) */}
                      {testimonial.adminNote && (
                        <div className="mt-3 p-3 rounded-lg bg-[#0A0E14] border border-[#1C2432]">
                          <p className="text-xs text-muted-foreground mb-1">Nota do admin:</p>
                          <p className="text-sm">{testimonial.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Modals */}
      <PreviewModal
        isOpen={!!previewTestimonial}
        onClose={() => setPreviewTestimonial(null)}
        testimonial={previewTestimonial}
      />
      <ApprovalModal
        isOpen={!!approvalTestimonial}
        onClose={() => setApprovalTestimonial(null)}
        testimonial={approvalTestimonial}
        onConfirm={(note) => {
          if (approvalTestimonial) {
            handleApprove(approvalTestimonial.id, note);
          }
        }}
      />
      <RejectionModal
        isOpen={!!rejectionTestimonial}
        onClose={() => setRejectionTestimonial(null)}
        testimonial={rejectionTestimonial}
        onConfirm={(reason) => {
          if (rejectionTestimonial) {
            handleReject(rejectionTestimonial.id, reason);
          }
        }}
      />
      <DeleteModal
        isOpen={!!deleteTestimonial}
        onClose={() => setDeleteTestimonial(null)}
        testimonial={deleteTestimonial}
        onConfirm={() => {
          if (deleteTestimonial) {
            handleDelete(deleteTestimonial.id);
          }
        }}
      />
    </AdminLayout>
  );
}
