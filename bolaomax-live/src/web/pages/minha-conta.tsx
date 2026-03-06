import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  pagSeguroService,
  initializePagSeguro,
  generatePixQRCode,
  processCardPayment,
  getInstallmentOptions,
  type CardData,
  type InstallmentOption,
} from "@/services/pagSeguroService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wallet,
  Trophy,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Ticket,
  CircleDot,
  ChevronRight,
  ChevronDown,
  CreditCard,
  History,
  Settings,
  Bell,
  Shield,
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Filter,
  Download,
  BellRing,
  BellOff,
  Sparkles,
  Gift,
  Star,
  PartyPopper,
  Banknote,
  QrCode,
  Key,
  CheckCircle2,
  Crown,
  Zap,
  Users,
  Share2,
  Award,
  Gem,
  Repeat,
  BarChart3,
  Building,
  Split,
  Info,
  Loader2,
  AlertTriangle,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  MessageSquare,
  Edit2,
  Send,
} from "lucide-react";

// Mock participation data
const mockParticipations = [
  {
    id: "1",
    type: "Lotofácil",
    name: "Bolão #847",
    dezenas: 18,
    participacao: 15,
    valorInvestido: 450,
    premioEstimado: 525000,
    status: "Aguardando",
    sorteioDate: "15/02",
    sorteioTime: "20:00",
  },
  {
    id: "2",
    type: "Mega-Sena",
    name: "Bolão #312",
    dezenas: 12,
    participacao: 10,
    valorInvestido: 850,
    premioEstimado: 8500000,
    status: "Aguardando",
    sorteioDate: "17/02",
    sorteioTime: "20:00",
  },
  {
    id: "3",
    type: "Quina",
    name: "Bolão #1204",
    dezenas: 9,
    participacao: 20,
    valorInvestido: 280,
    premioEstimado: 520000,
    status: "Finalizado",
    sorteioDate: "10/02",
    sorteioTime: "20:00",
    resultado: "Não premiado",
  },
];

// Mock transactions - expanded for full history
const mockTransactions = [
  {
    id: "1",
    type: "deposito",
    description: "Depósito via PIX",
    valor: 500,
    data: "14/02/2025",
    hora: "10:32",
    status: "Confirmado",
  },
  {
    id: "2",
    type: "participacao",
    description: "Participação Bolão #847 - Lotofácil",
    valor: -450,
    data: "14/02/2025",
    hora: "10:45",
    status: "Confirmado",
  },
  {
    id: "3",
    type: "deposito",
    description: "Depósito via PIX",
    valor: 1000,
    data: "12/02/2025",
    hora: "15:20",
    status: "Confirmado",
  },
  {
    id: "4",
    type: "participacao",
    description: "Participação Bolão #312 - Mega-Sena",
    valor: -850,
    data: "12/02/2025",
    hora: "15:35",
    status: "Confirmado",
  },
  {
    id: "5",
    type: "premio",
    description: "Prêmio Bolão #201 - Quina",
    valor: 150,
    data: "08/02/2025",
    hora: "21:15",
    status: "Confirmado",
    // Task 159: Prize division info for user display
    isDivided: false,
    premioOriginal: 150,
    suaCota: 150,
    percentualCota: 10,
    totalWinners: 1,
  },
  {
    id: "6",
    type: "saque",
    description: "Saque via PIX",
    valor: -200,
    data: "05/02/2025",
    hora: "14:00",
    status: "Confirmado",
  },
  {
    id: "7",
    type: "deposito",
    description: "Depósito via PIX",
    valor: 300,
    data: "01/02/2025",
    hora: "09:10",
    status: "Confirmado",
  },
  {
    id: "8",
    type: "participacao",
    description: "Participação Bolão #201 - Quina",
    valor: -280,
    data: "01/02/2025",
    hora: "09:25",
    status: "Confirmado",
  },
  {
    id: "9",
    type: "saque",
    description: "Saque via PIX",
    valor: -100,
    data: "25/01/2025",
    hora: "16:30",
    status: "Pendente",
  },
  // Task 159: Add divided prize example transaction
  {
    id: "10",
    type: "premio",
    description: "Prêmio Bolão #180 - Mega-Sena (Dividido)",
    valor: 50000,
    data: "20/01/2025",
    hora: "22:05",
    status: "Confirmado",
    isDivided: true,
    premioOriginal: 500000,
    parteBolao: 200000,
    suaCota: 50000,
    percentualCota: 25,
    totalWinners: 5,
    nossoBilhetes: 2,
  },
];

// Mock notifications (including subscription-related)
const mockNotifications = [
  {
    id: "1",
    icon: "🎉",
    message: "Parabéns! Você ganhou R$ 150 no Bolão #201!",
    date: "08/02/2025",
    time: "21:15",
    read: false,
    type: "premio",
    // Task 159: Division info for notifications
    isDivided: false,
  },
  // Task 159: Divided prize notification
  {
    id: "0",
    icon: "🏆",
    message: "Seu bolão ganhou! Prêmio de R$ 500K dividido entre 5 ganhadores. Sua parte proporcional: R$ 50.000,00",
    date: "20/01/2025",
    time: "22:05",
    read: false,
    type: "premio",
    isDivided: true,
    premioOriginal: 500000,
    totalWinners: 5,
    parteBolao: 200000,
    suaCota: 50000,
  },
  {
    id: "2",
    icon: "💰",
    message: "Depósito de R$ 500 confirmado com sucesso!",
    date: "14/02/2025",
    time: "10:32",
    read: false,
    type: "deposito",
  },
  {
    id: "3",
    icon: "🎯",
    message: "Você está participando do Bolão #847 - Sorteio em 15/02!",
    date: "14/02/2025",
    time: "10:45",
    read: true,
    type: "participacao",
  },
  {
    id: "4",
    icon: "⭐",
    message: "Mega da Virada 2026 já está disponível! Garanta sua cota.",
    date: "10/02/2025",
    time: "08:00",
    read: true,
    type: "evento",
  },
  {
    id: "5",
    icon: "🔔",
    message: "Sorteio do Bolão #312 acontece amanhã às 20h!",
    date: "16/02/2025",
    time: "10:00",
    read: false,
    type: "lembrete",
  },
  {
    id: "6",
    icon: "🎊",
    message: "Quina de São João disponível! Prêmios de até R$ 10 milhões.",
    date: "05/02/2025",
    time: "12:00",
    read: true,
    type: "evento",
  },
  // Subscription-related notifications
  {
    id: "7",
    icon: "👑",
    message: "Bem-vindo ao Clube de Assinaturas! Seu plano Prata está ativo.",
    date: "01/01/2025",
    time: "14:30",
    read: true,
    type: "boasVindas",
  },
  {
    id: "8",
    icon: "🎫",
    message: "Novos concursos disponíveis! 4 bolões foram adicionados à sua assinatura.",
    date: "15/02/2025",
    time: "08:00",
    read: false,
    type: "novosConcursos",
  },
  {
    id: "9",
    icon: "✅",
    message: "Seus bolões estão prontos! Lotofácil #1205, Mega-Sena #415 e Quina #1850.",
    date: "14/02/2025",
    time: "12:00",
    read: true,
    type: "boloesProntos",
  },
  {
    id: "10",
    icon: "📊",
    message: "Resultado do sorteio: Lotofácil Concurso #3264 - Confira se você ganhou!",
    date: "15/02/2025",
    time: "21:30",
    read: false,
    type: "resultadoSorteio",
  },
  {
    id: "11",
    icon: "🔄",
    message: "Sua assinatura será renovada em 5 dias. Verifique seu saldo.",
    date: "25/02/2025",
    time: "09:00",
    read: false,
    type: "renovacao",
  },
  {
    id: "12",
    icon: "💳",
    message: "Pagamento confirmado! Assinatura Plano Prata - R$ 199,00",
    date: "01/02/2025",
    time: "10:15",
    read: true,
    type: "pagamento",
  },
];

// Mock subscription data - for simulating an active subscriber
const mockActiveSubscription = {
  plan: "prata" as "bronze" | "prata" | "ouro",
  planName: "Prata",
  status: "active" as "active" | "pending" | "cancelled" | "paused",
  startDate: "01/01/2025",
  nextPayment: "01/03/2025",
  monthlyPrice: 199,
  totalPaidAllTime: 398,
  totalWinnings: 1250,
  // Distribution eligibility fields
  isEligibleForDistribution: true,
  distributionStatus: "eligible" as "eligible" | "ineligible_status" | "ineligible_payment" | "pending_activation",
  eligibilityReason: null as string | null,
  paymentStatus: "paid" as "paid" | "pending" | "overdue" | "failed",
  daysUntilSuspension: null as number | null,
  nextDistributionDate: "10/02/2025",
  upcomingBoloes: [
    { id: "1", type: "Lotofácil", name: "Bolão #1205", date: "20/02/2025", dezenas: 17 },
    { id: "2", type: "Mega-Sena", name: "Bolão #415", date: "22/02/2025", dezenas: 9 },
    { id: "3", type: "Quina", name: "Bolão #1850", date: "21/02/2025", dezenas: 8 },
    { id: "4", type: "Lotofácil", name: "Bolão #1206", date: "24/02/2025", dezenas: 18 },
  ],
  participationHistory: [
    { id: "1", type: "Lotofácil", name: "Bolão #1190", date: "10/02/2025", result: "Não premiado", premio: 0, isDivided: false },
    { id: "2", type: "Mega-Sena", name: "Bolão #401", date: "08/02/2025", result: "Premiado", premio: 850, isDivided: false, totalWinners: 1 },
    { id: "3", type: "Quina", name: "Bolão #1820", date: "07/02/2025", result: "Não premiado", premio: 0, isDivided: false },
    // Task 159: Add divided prize example
    { 
      id: "4", 
      type: "Lotofácil", 
      name: "Bolão #1180", 
      date: "05/02/2025", 
      result: "Premiado", 
      premio: 400, 
      isDivided: true, 
      premioOriginal: 2000, 
      parteBolao: 1000, 
      suaCota: 400, 
      totalWinners: 2,
      percentualCota: 40,
    },
    { id: "5", type: "Mega-Sena", name: "Bolão #395", date: "01/02/2025", result: "Não premiado", premio: 0, isDivided: false },
    // Task 159: Another divided prize
    {
      id: "6",
      type: "Mega-Sena",
      name: "Bolão #380",
      date: "20/01/2025",
      result: "Premiado",
      premio: 50000,
      isDivided: true,
      premioOriginal: 500000,
      parteBolao: 200000,
      suaCota: 50000,
      totalWinners: 5,
      percentualCota: 25,
    },
  ],
};

// Status change notification types
type StatusNotificationType = "paused" | "cancelled" | "reactivated" | "payment_issue" | "payment_success";

interface StatusNotification {
  type: StatusNotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  severity: "info" | "warning" | "error" | "success";
}

// Generate status notifications based on subscription state
const getStatusNotifications = (subscription: typeof mockActiveSubscription | null): StatusNotification[] => {
  if (!subscription) return [];
  
  const notifications: StatusNotification[] = [];

  // Check subscription status
  if (subscription.status === "paused") {
    notifications.push({
      type: "paused",
      title: "Assinatura Pausada",
      message: "Sua assinatura foi pausada. Você não receberá novos bolões até reativar.",
      action: { label: "Reativar Agora", href: "#reativar" },
      severity: "warning",
    });
  }

  if (subscription.status === "cancelled") {
    notifications.push({
      type: "cancelled",
      title: "Assinatura Cancelada",
      message: "Sua assinatura foi cancelada. Você não receberá novos bolões.",
      action: { label: "Renovar Assinatura", href: "/clube-vip" },
      severity: "error",
    });
  }

  // Check payment status
  if (subscription.paymentStatus === "overdue" && subscription.daysUntilSuspension) {
    notifications.push({
      type: "payment_issue",
      title: "Pagamento Pendente",
      message: `Seu pagamento está em atraso. Regularize em ${subscription.daysUntilSuspension} dias para não perder seus bolões.`,
      action: { label: "Pagar Agora", href: "#deposito" },
      severity: "error",
    });
  }

  if (subscription.paymentStatus === "pending") {
    notifications.push({
      type: "payment_issue",
      title: "Pagamento em Processamento",
      message: "Seu pagamento está sendo processado. Você receberá bolões assim que confirmado.",
      severity: "info",
    });
  }

  if (subscription.paymentStatus === "failed") {
    notifications.push({
      type: "payment_issue",
      title: "Falha no Pagamento",
      message: "Houve um problema com seu pagamento. Atualize seus dados de pagamento.",
      action: { label: "Atualizar Pagamento", href: "#deposito" },
      severity: "error",
    });
  }

  // Check distribution eligibility
  if (!subscription.isEligibleForDistribution && subscription.eligibilityReason) {
    notifications.push({
      type: "payment_issue",
      title: "Não Elegível para Distribuição",
      message: subscription.eligibilityReason,
      action: { label: "Resolver", href: "#resolve" },
      severity: "warning",
    });
  }

  return notifications;
};

// Validation helpers
const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;
  return true;
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length === 11;
};

const formatCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "").slice(0, 11);
  if (cleanValue.length <= 3) return cleanValue;
  if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`;
  if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`;
  return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}-${cleanValue.slice(9)}`;
};

const formatPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "").slice(0, 11);
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 7) return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
  return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7)}`;
};

// PIN strength indicator
const getPinStrength = (pin: string): { level: number; label: string; color: string } => {
  if (pin.length < 4) return { level: 0, label: "Muito fraco", color: "bg-red-500" };
  if (pin.length === 4) return { level: 1, label: "Básico", color: "bg-amber-500" };
  if (pin.length === 5) return { level: 2, label: "Bom", color: "bg-yellow-500" };
  return { level: 3, label: "Forte", color: "bg-emerald-500" };
};

// Testimonial types and mock data
interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number;
  title: string;
  message: string;
  showName: boolean;
  status: "pendente" | "aprovado" | "rejeitado";
  createdAt: string;
  approvedAt?: string;
}

const mockUserTestimonials: Testimonial[] = [
  {
    id: "1",
    userId: "user1",
    userName: "João Silva",
    userPhoto: "",
    rating: 5,
    title: "Melhor plataforma de bolões!",
    message: "Já participei de vários bolões e a experiência sempre foi ótima. A equipe é muito transparente e o suporte é excelente. Recomendo a todos!",
    showName: true,
    status: "aprovado",
    createdAt: "10/01/2025",
    approvedAt: "12/01/2025",
  },
  {
    id: "2",
    userId: "user1",
    userName: "João Silva",
    userPhoto: "",
    rating: 4,
    title: "Muito satisfeito com o serviço",
    message: "Ganhei meu primeiro prêmio participando de um bolão da Mega-Sena. O processo de saque foi rápido e sem complicações.",
    showName: false,
    status: "pendente",
    createdAt: "05/02/2025",
  },
];

const MinhaConta = () => {
  const { isLoggedIn, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Main tabs
  const [activeMainTab, setActiveMainTab] = useState<"resumo" | "configuracoes" | "assinatura" | "deposito" | "depoimentos">("resumo");
  
  // Configurações sub-sections
  const [activeConfigSection, setActiveConfigSection] = useState<string>("dados-pessoais");
  
  // Form states - Dados Pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [dadosPessoaisSaved, setDadosPessoaisSaved] = useState(false);
  
  // Form states - Dados Financeiros (PIX)
  const [pixKeyType, setPixKeyType] = useState<"cpf" | "email" | "telefone" | "aleatoria">("cpf");
  const [pixKey, setPixKey] = useState("");
  const [savedPixKey, setSavedPixKey] = useState<{ type: string; value: string } | null>(null);
  const [pixSaved, setPixSaved] = useState(false);
  
  // Form states - Segurança (PIN)
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  
  // Withdrawal modal state
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"pix" | "transfer">("pix");
  
  // Transaction history filters
  const [transactionPeriod, setTransactionPeriod] = useState("30");
  const [transactionType, setTransactionType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Notification preferences (including subscription-related)
  const [notifPrefs, setNotifPrefs] = useState({
    sistema: true,
    sorteioEmBreve: true,
    resultadoBoloes: true,
    premiosGanhos: true,
    depositosConfirmados: true,
    novosBoloes: true,
    eventosEspeciais: true,
    // Subscription-specific notifications
    novosConcursos: true,
    boloesProntos: true,
    resultadoSorteio: true,
    renovacaoAssinatura: true,
    pagamentoConfirmado: true,
    jogosEspeciaisOuro: true,
    boasVindasClube: true,
    // Privacy & Feed settings
    showInLiveFeed: false, // Default OFF for privacy
    receiveWinNotifications: true,
    vipAutomationNotifications: true,
    emailNotifications: true,
  });
  const [notifications, setNotifications] = useState(mockNotifications);
  
  // Subscription state - toggle to simulate having a subscription
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const subscription = hasActiveSubscription ? mockActiveSubscription : null;
  
  // Annual vs Monthly billing toggle
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  
  // Cancel subscription modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);
  
  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"prata" | "ouro" | null>(null);

  // Deposit state (Tasks 193-198)
  const [selectedDepositAmount, setSelectedDepositAmount] = useState<number | null>(null);
  const [customDepositAmount, setCustomDepositAmount] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [showDepositPaymentModal, setShowDepositPaymentModal] = useState(false);
  const [depositPaymentStatus, setDepositPaymentStatus] = useState<"pending" | "processing" | "confirmed" | "cancelled">("pending");
  const [depositPIXCode, setDepositPIXCode] = useState("");
  const [depositPIXExpiry, setDepositPIXExpiry] = useState(900); // 15 minutes in seconds
  const [depositSuccessAnimation, setDepositSuccessAnimation] = useState(false);
  
  // PagSeguro deposit states
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<"pix" | "card">("pix");
  const [depositCardNumber, setDepositCardNumber] = useState("");
  const [depositCardHolder, setDepositCardHolder] = useState("");
  const [depositCardExpiry, setDepositCardExpiry] = useState("");
  const [depositCardCVV, setDepositCardCVV] = useState("");
  const [depositCardCPF, setDepositCardCPF] = useState("");
  const [depositInstallments, setDepositInstallments] = useState(1);
  const [depositInstallmentOptions, setDepositInstallmentOptions] = useState<InstallmentOption[]>([]);
  const [depositProcessing, setDepositProcessing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [pagSeguroReady, setPagSeguroReady] = useState(false);

  // Mock deposit history
  const [depositHistory] = useState([
    { id: "d1", valor: 500, metodo: "PIX", data: "14/02/2025", hora: "10:32", status: "Confirmado" as const },
    { id: "d2", valor: 1000, metodo: "PIX", data: "12/02/2025", hora: "15:20", status: "Confirmado" as const },
    { id: "d3", valor: 300, metodo: "PIX", data: "01/02/2025", hora: "09:10", status: "Confirmado" as const },
    { id: "d4", valor: 200, metodo: "Cartão", data: "20/01/2025", hora: "14:45", status: "Confirmado" as const },
    { id: "d5", valor: 150, metodo: "PIX", data: "15/01/2025", hora: "11:00", status: "Pendente" as const },
  ]);

  // Deposit period filter
  const [depositPeriodFilter, setDepositPeriodFilter] = useState("30");
  const [depositStatusFilter, setDepositStatusFilter] = useState("all");
  const [depositMethodFilter, setDepositMethodFilter] = useState("all");

  // Testimonial state (Task 254)
  const [userTestimonials, setUserTestimonials] = useState<Testimonial[]>(mockUserTestimonials);
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [testimonialTitle, setTestimonialTitle] = useState("");
  const [testimonialMessage, setTestimonialMessage] = useState("");
  const [testimonialShowName, setTestimonialShowName] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [showTestimonialSuccessModal, setShowTestimonialSuccessModal] = useState(false);

  // Computed testimonial stats
  const approvedTestimonialCount = userTestimonials.filter(t => t.status === "aprovado").length;
  const pendingTestimonialCount = userTestimonials.filter(t => t.status === "pendente").length;

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setNome(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login?returnUrl=/minha-conta");
    }
  }, [isLoggedIn, setLocation]);

  // Initialize PagSeguro on mount
  useEffect(() => {
    const init = async () => {
      const success = await initializePagSeguro();
      setPagSeguroReady(success);
    };
    init();
  }, []);

  // Load installment options when amount changes
  useEffect(() => {
    const amount = isCustomAmount ? parseInt(customDepositAmount) : selectedDepositAmount;
    if (amount && amount >= 20 && depositPaymentMethod === "card") {
      getInstallmentOptions(amount, 12).then(options => {
        setDepositInstallmentOptions(options);
      });
    }
  }, [selectedDepositAmount, customDepositAmount, isCustomAmount, depositPaymentMethod]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Lotofácil":
        return "text-violet-400 bg-violet-500/20 border-violet-500/30";
      case "Mega-Sena":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "Quina":
        return "text-sky-400 bg-sky-500/20 border-sky-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  // Handle form submissions
  const handleSaveDadosPessoais = () => {
    setDadosPessoaisSaved(true);
    setTimeout(() => setDadosPessoaisSaved(false), 3000);
  };

  const handleSavePix = () => {
    setSavedPixKey({ type: pixKeyType, value: pixKey });
    setPixSaved(true);
    setTimeout(() => setPixSaved(false), 3000);
  };

  const handleSavePin = () => {
    setPinSaved(true);
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => setPinSaved(false), 3000);
  };

  const handleMarkAsRead = (notifId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(t => {
    if (transactionType !== "all" && t.type !== transactionType) return false;
    return true;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Transaction type icons and colors
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposito":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "saque":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "participacao":
        return <Ticket className="w-4 h-4 text-sky-400" />;
      case "premio":
        return <Trophy className="w-4 h-4 text-amber-400" />;
      default:
        return <CircleDot className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string, valor: number) => {
    if (valor > 0) return "text-emerald-400";
    switch (type) {
      case "saque":
        return "text-red-400";
      case "participacao":
        return "text-sky-400";
      default:
        return "text-amber-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmado":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Confirmado</Badge>;
      case "Pendente":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Pendente</Badge>;
      case "Cancelado":
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Cancelado</Badge>;
      default:
        return null;
    }
  };

  // Validation checks
  const isDadosPessoaisValid = nome.length >= 3 && validateEmail(email) && validateCPF(cpf) && validatePhone(telefone);
  const isPixValid = pixKey.length > 0;
  const isPinValid = newPin.length >= 4 && newPin.length <= 6 && newPin === confirmPin;

  // Configuration sections
  const configSections = [
    { id: "dados-pessoais", label: "Dados Pessoais", icon: User },
    { id: "dados-financeiros", label: "Dados Financeiros", icon: Banknote },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "historico", label: "Histórico de Transações", icon: History },
    { id: "notificacoes", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bolao-green/30 to-bolao-green-dark/20 border border-bolao-green/30 flex items-center justify-center text-3xl font-bold text-bolao-green">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-bolao-card-border pb-4">
          <Button
            variant={activeMainTab === "resumo" ? "default" : "ghost"}
            onClick={() => setActiveMainTab("resumo")}
            className={activeMainTab === "resumo" ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : ""}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Minha Conta
          </Button>
          <Button
            variant={activeMainTab === "deposito" ? "default" : "ghost"}
            onClick={() => setActiveMainTab("deposito")}
            className={activeMainTab === "deposito" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600" : ""}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Depósito
          </Button>
          <Button
            variant={activeMainTab === "assinatura" ? "default" : "ghost"}
            onClick={() => setActiveMainTab("assinatura")}
            className={activeMainTab === "assinatura" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600" : ""}
          >
            <Crown className="w-4 h-4 mr-2" />
            Minha Assinatura
          </Button>
          <Button
            variant={activeMainTab === "configuracoes" ? "default" : "ghost"}
            onClick={() => setActiveMainTab("configuracoes")}
            className={activeMainTab === "configuracoes" ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button
            variant={activeMainTab === "depoimentos" ? "default" : "ghost"}
            onClick={() => setActiveMainTab("depoimentos")}
            className={activeMainTab === "depoimentos" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600" : ""}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Depoimentos
          </Button>
        </div>

        {/* RESUMO TAB */}
        {activeMainTab === "resumo" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Card */}
              <Card className="p-6 bg-gradient-to-br from-bolao-green/20 to-emerald-900/10 border-bolao-green/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-bolao-green/20 border border-bolao-green/30">
                      <Wallet className="w-6 h-6 text-bolao-green" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                      <p className="text-3xl font-extrabold text-bolao-green">
                        {formatCurrency(user.saldo)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveMainTab("deposito")}
                    className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Depositar
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Solicitar Saque
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-bolao-card-border"
                    onClick={() => {
                      setActiveMainTab("configuracoes");
                      setActiveConfigSection("historico");
                    }}
                  >
                    <History className="w-4 h-4 mr-1" />
                    Ver Extrato
                  </Button>
                </div>
              </Card>

              {/* Active Participations */}
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-bolao-green" />
                    Minhas Participações
                  </h2>
                  <Link href="/lotofacil">
                    <Button variant="ghost" size="sm" className="text-bolao-green">
                      Ver todos os bolões
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {mockParticipations.map((participation) => (
                    <div
                      key={participation.id}
                      className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border hover:border-bolao-green/30 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-bolao-card border border-bolao-card-border">
                            <Trophy className="w-5 h-5 text-bolao-green" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getTypeColor(participation.type)}>
                                {participation.type}
                              </Badge>
                              <span className="font-semibold">{participation.name}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <span>{participation.dezenas} dezenas</span>
                              <span className="text-bolao-green font-semibold">
                                {participation.participacao}% participação
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Investido</p>
                            <p className="font-semibold">{formatCurrency(participation.valorInvestido)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Prêmio se ganhar</p>
                            <p className="font-bold text-bolao-green">
                              {participation.premioEstimado >= 1000000
                                ? `R$ ${(participation.premioEstimado / 1000000).toFixed(1)}M`
                                : formatCurrency(participation.premioEstimado)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-bolao-card-border flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {participation.sorteioDate} às {participation.sorteioTime}
                          </span>
                          {participation.status === "Aguardando" ? (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                              <Clock className="w-3 h-3 mr-1" />
                              Aguardando Sorteio
                            </Badge>
                          ) : (
                            <Badge className={participation.resultado === "Não premiado" ? "bg-gray-500/20 text-gray-300 border-gray-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}>
                              {participation.resultado}
                            </Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Ver detalhes
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4">Resumo</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Participações Ativas</span>
                    <span className="font-bold text-bolao-green">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Investido</span>
                    <span className="font-bold">{formatCurrency(1580)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prêmios Ganhos</span>
                    <span className="font-bold text-bolao-green">{formatCurrency(150)}</span>
                  </div>
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Transações Recentes
                </h3>
                <div className="space-y-3">
                  {mockTransactions.slice(0, 4).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-bolao-card-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transaction.valor > 0 ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                          {transaction.valor > 0 ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.data}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${transaction.valor > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                        {transaction.valor > 0 ? "+" : ""}{formatCurrency(transaction.valor)}
                      </span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-xs"
                  onClick={() => {
                    setActiveMainTab("configuracoes");
                    setActiveConfigSection("historico");
                  }}
                >
                  Ver todas as transações
                </Button>
              </Card>

              {/* Testimonials Stats (Task 259) */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    Meus Depoimentos
                  </h3>
                  {approvedTestimonialCount > 0 && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {approvedTestimonialCount} aprovado{approvedTestimonialCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Enviados</span>
                    <span className="font-bold">{userTestimonials.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aprovados</span>
                    <span className="font-bold text-emerald-400">{approvedTestimonialCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Em Revisão</span>
                    <span className="font-bold text-amber-400">{pendingTestimonialCount}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => setActiveMainTab("depoimentos")}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Deixar um depoimento
                </Button>
              </Card>

              {/* Quick Actions */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Link href="/lotofacil" className="block">
                    <Button variant="outline" className="w-full justify-start border-bolao-card-border hover:border-violet-500/30 hover:bg-violet-500/10">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center mr-3">
                        <CircleDot className="w-4 h-4 text-violet-400" />
                      </div>
                      Ver Bolões Lotofácil
                    </Button>
                  </Link>
                  <Link href="/megasena" className="block">
                    <Button variant="outline" className="w-full justify-start border-bolao-card-border hover:border-emerald-500/30 hover:bg-emerald-500/10">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mr-3">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      Ver Bolões Mega-Sena
                    </Button>
                  </Link>
                  <Link href="/quina" className="block">
                    <Button variant="outline" className="w-full justify-start border-bolao-card-border hover:border-sky-500/30 hover:bg-sky-500/10">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center mr-3">
                        <Trophy className="w-4 h-4 text-sky-400" />
                      </div>
                      Ver Bolões Quina
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* DEPÓSITO TAB */}
        {activeMainTab === "deposito" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Balance Card */}
              <Card className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-900/10 border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Atual</p>
                    <p className={`text-3xl font-extrabold text-emerald-400 ${depositSuccessAnimation ? "animate-pulse" : ""}`}>
                      {formatCurrency(user.saldo)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Add Balance Section */}
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Adicionar Saldo</h2>
                    <p className="text-sm text-muted-foreground">Escolha um valor ou digite um valor personalizado</p>
                  </div>
                </div>

                {/* Quick Select Amounts */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedDepositAmount(amount);
                        setIsCustomAmount(false);
                        setCustomDepositAmount("");
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 group ${
                        selectedDepositAmount === amount && !isCustomAmount
                          ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "bg-bolao-dark/50 border-bolao-card-border hover:border-emerald-500/50 hover:bg-emerald-500/10"
                      }`}
                    >
                      <div className="text-center">
                        <span className={`block text-3xl font-bold mb-1 ${
                          selectedDepositAmount === amount && !isCustomAmount
                            ? "text-emerald-400"
                            : "text-white group-hover:text-emerald-400"
                        }`}>
                          R$ {amount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {amount === 20 ? "Mínimo" : amount === 50 ? "Popular" : "Recomendado"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setIsCustomAmount(true);
                      setSelectedDepositAmount(null);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      isCustomAmount
                        ? "bg-emerald-500/20 border-emerald-500"
                        : "bg-bolao-dark/50 border-bolao-card-border hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Banknote className={`w-5 h-5 ${isCustomAmount ? "text-emerald-400" : "text-muted-foreground"}`} />
                      <span className={`font-semibold ${isCustomAmount ? "text-emerald-400" : "text-white"}`}>
                        Outro Valor
                      </span>
                    </div>
                    
                    {isCustomAmount && (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                        <input
                          type="text"
                          value={customDepositAmount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setCustomDepositAmount(value);
                          }}
                          placeholder="0,00"
                          className="w-full bg-bolao-dark border border-bolao-card-border rounded-lg px-12 py-3 text-2xl font-bold text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                          autoFocus
                        />
                      </div>
                    )}
                  </button>
                  
                  {/* Validation Messages */}
                  {isCustomAmount && customDepositAmount && parseInt(customDepositAmount) < 20 && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      O valor mínimo para depósito é R$ 20,00
                    </p>
                  )}
                  {isCustomAmount && customDepositAmount && parseInt(customDepositAmount) > 10000 && (
                    <p className="mt-2 text-sm text-amber-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      O valor máximo para depósito é R$ 10.000,00
                    </p>
                  )}
                </div>

                {/* Summary and Continue Button */}
                {((selectedDepositAmount && !isCustomAmount) || (isCustomAmount && customDepositAmount && parseInt(customDepositAmount) >= 20 && parseInt(customDepositAmount) <= 10000)) && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-muted-foreground">Valor do depósito</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {formatCurrency(isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Novo saldo após depósito</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(user.saldo + (isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0)))}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    const amount = isCustomAmount ? parseInt(customDepositAmount) : selectedDepositAmount;
                    if (amount && amount >= 20 && amount <= 10000) {
                      // Generate mock PIX code
                      setDepositPIXCode(`00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 38)}520400005303986540${amount}.005802BR5925BOLAOMAX LTDA6009SAO PAULO62140510${Date.now()}6304`);
                      setDepositPIXExpiry(900);
                      setDepositPaymentStatus("pending");
                      setShowDepositPaymentModal(true);
                    }
                  }}
                  disabled={!((selectedDepositAmount && !isCustomAmount) || (isCustomAmount && customDepositAmount && parseInt(customDepositAmount) >= 20 && parseInt(customDepositAmount) <= 10000))}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Continuar para Pagamento
                </Button>
              </Card>

              {/* Deposit History */}
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/30">
                      <History className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Histórico de Depósitos</h2>
                      <p className="text-sm text-muted-foreground">Seus depósitos recentes</p>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={depositPeriodFilter}
                    onChange={(e) => setDepositPeriodFilter(e.target.value)}
                    className="bg-bolao-dark border border-bolao-card-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="7">Últimos 7 dias</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="all">Todos</option>
                  </select>
                  <select
                    value={depositStatusFilter}
                    onChange={(e) => setDepositStatusFilter(e.target.value)}
                    className="bg-bolao-dark border border-bolao-card-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos os status</option>
                    <option value="Confirmado">Confirmados</option>
                    <option value="Pendente">Pendentes</option>
                    <option value="Cancelado">Cancelados</option>
                  </select>
                  <select
                    value={depositMethodFilter}
                    onChange={(e) => setDepositMethodFilter(e.target.value)}
                    className="bg-bolao-dark border border-bolao-card-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">Todos os métodos</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                {/* Deposit History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-bolao-card-border">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Data/Hora</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Valor</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Método</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-muted-foreground">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositHistory
                        .filter((d) => depositStatusFilter === "all" || d.status === depositStatusFilter)
                        .filter((d) => depositMethodFilter === "all" || d.metodo === depositMethodFilter)
                        .map((deposit) => (
                          <tr key={deposit.id} className="border-b border-bolao-card-border/50 hover:bg-bolao-dark/30 transition-colors">
                            <td className="py-4 px-2">
                              <div>
                                <p className="font-medium">{deposit.data}</p>
                                <p className="text-xs text-muted-foreground">{deposit.hora}</p>
                              </div>
                            </td>
                            <td className="py-4 px-2">
                              <span className="font-bold text-emerald-400">{formatCurrency(deposit.valor)}</span>
                            </td>
                            <td className="py-4 px-2">
                              <Badge className={`${
                                deposit.metodo === "PIX" 
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : deposit.metodo === "Cartão"
                                  ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              }`}>
                                {deposit.metodo === "PIX" && <Zap className="w-3 h-3 mr-1" />}
                                {deposit.metodo === "Cartão" && <CreditCard className="w-3 h-3 mr-1" />}
                                {deposit.metodo}
                              </Badge>
                            </td>
                            <td className="py-4 px-2">
                              <Badge className={`${
                                deposit.status === "Confirmado"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : deposit.status === "Pendente"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : "bg-red-500/20 text-red-300 border-red-500/30"
                              }`}>
                                {deposit.status === "Confirmado" && <Check className="w-3 h-3 mr-1" />}
                                {deposit.status === "Pendente" && <Clock className="w-3 h-3 mr-1" />}
                                {deposit.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-2 text-right">
                              {deposit.status === "Confirmado" && (
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <Download className="w-3 h-3 mr-1" />
                                  Comprovante
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Cards */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Resumo de Depósitos
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm text-muted-foreground">Total Depositado (Mês)</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(1500)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Último Depósito</span>
                    <span className="font-semibold">{formatCurrency(500)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Depósitos Pendentes</span>
                    <span className="font-semibold text-amber-400">1</span>
                  </div>
                </div>
              </Card>

              {/* Payment Methods Info */}
              <Card className="p-5 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-bolao-green" />
                  Métodos de Pagamento
                  {pagSeguroReady && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs ml-auto">PagSeguro</Badge>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-400">PIX</p>
                      <p className="text-xs text-muted-foreground">Instantâneo • Recomendado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30">
                    <div className="p-2 rounded-lg bg-sky-500/20">
                      <CreditCard className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sky-400">Cartão de Crédito</p>
                      <p className="text-xs text-muted-foreground">Parcele em até 12x</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Help Card */}
              <Card className="p-5 bg-gradient-to-br from-bolao-green/10 to-emerald-900/5 border-bolao-green/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-bolao-green" />
                  Precisa de Ajuda?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Dúvidas sobre depósitos? Entre em contato com nosso suporte.
                </p>
                <Link href="/suporte">
                  <Button variant="outline" size="sm" className="w-full border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10">
                    Falar com Suporte
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}

        {/* Deposit Payment Modal - Enhanced with PagSeguro */}
        <Dialog open={showDepositPaymentModal} onOpenChange={(open) => {
          setShowDepositPaymentModal(open);
          if (!open) {
            setDepositPaymentMethod("pix");
            setDepositCardNumber("");
            setDepositCardHolder("");
            setDepositCardExpiry("");
            setDepositCardCVV("");
            setDepositCardCPF("");
            setDepositInstallments(1);
            setDepositError(null);
          }
        }}>
          <DialogContent className="bg-bolao-card border-bolao-card-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {depositPaymentStatus === "confirmed" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Depósito Confirmado!
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Método de Pagamento
                  </>
                )}
                {pagSeguroReady && depositPaymentStatus !== "confirmed" && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs ml-auto">
                    <Shield className="w-3 h-3 mr-1" />
                    PagSeguro
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {depositPaymentStatus === "confirmed" 
                  ? "Seu depósito foi confirmado e já está disponível em sua conta."
                  : "Escolha como deseja realizar seu depósito"
                }
              </DialogDescription>
            </DialogHeader>

            {depositPaymentStatus === "confirmed" ? (
              <div className="py-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400 mb-2">
                  {formatCurrency(isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0))}
                </p>
                <p className="text-muted-foreground">creditados em sua conta</p>
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-muted-foreground">Novo saldo disponível</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(user.saldo + (isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0)))}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowDepositPaymentModal(false);
                    setSelectedDepositAmount(null);
                    setCustomDepositAmount("");
                    setIsCustomAmount(false);
                    setDepositSuccessAnimation(true);
                    setTimeout(() => setDepositSuccessAnimation(false), 2000);
                  }}
                  className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Amount Display */}
                <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-muted-foreground mb-1">Valor do depósito</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {formatCurrency(isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0))}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  {/* PIX Option */}
                  <button
                    onClick={() => setDepositPaymentMethod("pix")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      depositPaymentMethod === "pix"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-bolao-card-border hover:border-emerald-500/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${depositPaymentMethod === "pix" ? "bg-emerald-500/20" : "bg-bolao-dark/50"}`}>
                      <QrCode className={`w-6 h-6 ${depositPaymentMethod === "pix" ? "text-emerald-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">PIX</p>
                      <p className="text-sm text-muted-foreground">Pagamento instantâneo • Sem taxas</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Recomendado</Badge>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      depositPaymentMethod === "pix" ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground"
                    }`}>
                      {depositPaymentMethod === "pix" && <Check className="w-3 h-3 text-bolao-dark" />}
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setDepositPaymentMethod("card")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      depositPaymentMethod === "card"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-bolao-card-border hover:border-emerald-500/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${depositPaymentMethod === "card" ? "bg-emerald-500/20" : "bg-bolao-dark/50"}`}>
                      <CreditCard className={`w-6 h-6 ${depositPaymentMethod === "card" ? "text-emerald-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Cartão de Crédito</p>
                      <p className="text-sm text-muted-foreground">Parcele em até 12x</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      depositPaymentMethod === "card" ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground"
                    }`}>
                      {depositPaymentMethod === "card" && <Check className="w-3 h-3 text-bolao-dark" />}
                    </div>
                  </button>
                </div>

                {/* PIX Section */}
                {depositPaymentMethod === "pix" && (
                  <div className="space-y-4">
                    {/* QR Code Placeholder */}
                    <div className="flex justify-center">
                      <div className="w-40 h-40 bg-white rounded-xl p-2 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
                          <QrCode className="w-20 h-20 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">PIX expira em</p>
                      <p className="text-xl font-mono font-bold text-amber-400">
                        {Math.floor(depositPIXExpiry / 60).toString().padStart(2, '0')}:{(depositPIXExpiry % 60).toString().padStart(2, '0')}
                      </p>
                    </div>

                    {/* PIX Code */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Código PIX Copia e Cola</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={depositPIXCode.substring(0, 40) + "..."}
                          readOnly
                          className="w-full bg-bolao-dark border border-bolao-card-border rounded-lg px-4 py-3 pr-20 text-sm font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(depositPIXCode)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-sm">Aguardando pagamento...</span>
                    </div>

                    {/* Simulate Payment Button (for demo) */}
                    <Button
                      onClick={() => {
                        setDepositPaymentStatus("processing");
                        setTimeout(() => {
                          setDepositPaymentStatus("confirmed");
                        }, 1500);
                      }}
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Simular Pagamento Confirmado
                    </Button>
                  </div>
                )}

                {/* Card Form Section */}
                {depositPaymentMethod === "card" && (
                  <div className="space-y-4 p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-muted-foreground">Seus dados estão protegidos</span>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Número do Cartão</label>
                      <input
                        type="text"
                        value={depositCardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          setDepositCardNumber(formatted);
                        }}
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                        maxLength={19}
                      />
                    </div>

                    {/* Card Holder */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Nome no Cartão</label>
                      <input
                        type="text"
                        value={depositCardHolder}
                        onChange={(e) => setDepositCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                      />
                    </div>

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Validade</label>
                        <input
                          type="text"
                          value={depositCardExpiry}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            const formatted = value.length > 2 ? `${value.slice(0,2)}/${value.slice(2)}` : value;
                            setDepositCardExpiry(formatted);
                          }}
                          placeholder="MM/AA"
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">CVV</label>
                        <input
                          type="password"
                          value={depositCardCVV}
                          onChange={(e) => setDepositCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">CPF do Titular</label>
                      <input
                        type="text"
                        value={depositCardCPF}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                          let formatted = value;
                          if (value.length > 9) formatted = `${value.slice(0,3)}.${value.slice(3,6)}.${value.slice(6,9)}-${value.slice(9)}`;
                          else if (value.length > 6) formatted = `${value.slice(0,3)}.${value.slice(3,6)}.${value.slice(6)}`;
                          else if (value.length > 3) formatted = `${value.slice(0,3)}.${value.slice(3)}`;
                          setDepositCardCPF(formatted);
                        }}
                        placeholder="000.000.000-00"
                        className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                        maxLength={14}
                      />
                    </div>

                    {/* Installments */}
                    {depositInstallmentOptions.length > 0 && (
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Parcelas</label>
                        <select
                          value={depositInstallments}
                          onChange={(e) => setDepositInstallments(parseInt(e.target.value))}
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        >
                          {depositInstallmentOptions.map((option) => (
                            <option key={option.quantity} value={option.quantity}>
                              {option.quantity}x de R$ {option.installmentAmount.toFixed(2).replace(".", ",")}
                              {option.interestFree ? " (sem juros)" : ` (total R$ ${option.totalAmount.toFixed(2).replace(".", ",")})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Process Card Payment Button */}
                    <Button
                      onClick={async () => {
                        setDepositProcessing(true);
                        setDepositError(null);
                        try {
                          const amount = isCustomAmount ? parseInt(customDepositAmount) : (selectedDepositAmount || 0);
                          const cardData: CardData = {
                            number: depositCardNumber.replace(/\D/g, ''),
                            holderName: depositCardHolder,
                            expirationMonth: depositCardExpiry.split('/')[0],
                            expirationYear: '20' + depositCardExpiry.split('/')[1],
                            cvv: depositCardCVV,
                            cpf: depositCardCPF.replace(/\D/g, ''),
                          };
                          
                          const response = await processCardPayment(cardData, { value: amount }, depositInstallments);
                          
                          if (response.status === 'PAID') {
                            setDepositPaymentStatus("confirmed");
                          } else {
                            throw new Error('Pagamento não aprovado');
                          }
                        } catch (error) {
                          setDepositError(error instanceof Error ? error.message : 'Erro no pagamento');
                        } finally {
                          setDepositProcessing(false);
                        }
                      }}
                      disabled={depositProcessing || !depositCardNumber || !depositCardHolder || !depositCardExpiry || !depositCardCVV || !depositCardCPF}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold disabled:opacity-50"
                    >
                      {depositProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pagar com Cartão
                        </>
                      )}
                    </Button>

                    {/* Error Message */}
                    {depositError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">{depositError}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setShowDepositPaymentModal(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MINHA ASSINATURA TAB */}
        {activeMainTab === "assinatura" && (
          <div className="space-y-8">
            {/* Status Notifications - Shows warnings and alerts */}
            {subscription && getStatusNotifications(subscription).length > 0 && (
              <div className="space-y-3">
                {getStatusNotifications(subscription).map((notification, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border-l-4 ${
                      notification.severity === "error" 
                        ? "bg-red-500/10 border-red-500" 
                        : notification.severity === "warning"
                        ? "bg-yellow-500/10 border-yellow-500"
                        : notification.severity === "success"
                        ? "bg-emerald-500/10 border-emerald-500"
                        : "bg-blue-500/10 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notification.severity === "error" && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
                      {notification.severity === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />}
                      {notification.severity === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                      {notification.severity === "info" && <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          notification.severity === "error" ? "text-red-300" 
                          : notification.severity === "warning" ? "text-yellow-300"
                          : notification.severity === "success" ? "text-emerald-300"
                          : "text-blue-300"
                        }`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                        {notification.action && (
                          <Button 
                            size="sm" 
                            className={`mt-3 ${
                              notification.severity === "error" 
                                ? "bg-red-500 hover:bg-red-600" 
                                : notification.severity === "warning"
                                ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                                : "bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
                            }`}
                          >
                            {notification.action.label}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Distribution Status Widget - Shows eligibility status */}
            {subscription && (
              <Card className="p-6 bg-gradient-to-br from-[#0A0F1A] to-[#111827] border-[#1C2432]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      subscription.isEligibleForDistribution 
                        ? "bg-emerald-500/20 border border-emerald-500/30" 
                        : "bg-yellow-500/20 border border-yellow-500/30"
                    }`}>
                      {subscription.isEligibleForDistribution 
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        : <AlertTriangle className="w-6 h-6 text-yellow-400" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Status de Distribuição</h3>
                      <p className="text-sm text-slate-400">Elegibilidade para receber bolões</p>
                    </div>
                  </div>
                  <Badge className={`${
                    subscription.isEligibleForDistribution 
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  }`}>
                    {subscription.isEligibleForDistribution ? "Elegível" : "Não Elegível"}
                  </Badge>
                </div>

                <div className={`p-4 rounded-xl ${
                  subscription.isEligibleForDistribution 
                    ? "bg-emerald-500/10 border border-emerald-500/20" 
                    : "bg-yellow-500/10 border border-yellow-500/20"
                }`}>
                  {subscription.isEligibleForDistribution ? (
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-emerald-300 font-medium">
                          Você está elegível para a próxima distribuição!
                        </p>
                        <p className="text-sm text-emerald-400/70 mt-1">
                          Próxima distribuição: <span className="font-semibold">{subscription.nextDistributionDate}</span> (Segunda-feira às 06:00)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Pause className="w-5 h-5 text-yellow-400" />
                        <p className="text-yellow-300 font-medium">
                          Você não receberá bolões na próxima distribuição
                        </p>
                      </div>
                      {subscription.eligibilityReason && (
                        <p className="text-sm text-yellow-400/70 mb-3">
                          Motivo: {subscription.eligibilityReason}
                        </p>
                      )}
                      {subscription.paymentStatus !== "paid" && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300">
                            {subscription.daysUntilSuspension 
                              ? `Regularize em ${subscription.daysUntilSuspension} dias para não perder bolões`
                              : "Resolva o problema de pagamento para voltar a receber bolões"
                            }
                          </span>
                        </div>
                      )}
                      <Button 
                        size="sm" 
                        className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resolver Agora
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{subscription.upcomingBoloes?.length || 0}</p>
                    <p className="text-xs text-slate-400">Bolões Esta Semana</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      R$ {(subscription.totalWinnings || 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-400">Total Ganhos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{subscription.participationHistory?.length || 0}</p>
                    <p className="text-xs text-slate-400">Participações</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Subscriber Dashboard - Only shown when user has active subscription */}
            {subscription && subscription.status === "active" && (
              <>
                {/* Plano Atual - Prominent Section */}
                <div className={`relative overflow-hidden rounded-2xl p-8 border ${
                  subscription.plan === "bronze" 
                    ? "bg-gradient-to-br from-amber-700/30 via-amber-800/20 to-amber-900/10 border-amber-600/40" 
                    : subscription.plan === "prata" 
                    ? "bg-gradient-to-br from-slate-500/30 via-slate-600/20 to-slate-700/10 border-slate-400/40"
                    : "bg-gradient-to-br from-amber-500/30 via-yellow-600/20 to-orange-700/10 border-amber-500/40"
                }`}>
                  {/* Decorative elements */}
                  <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 ${
                    subscription.plan === "bronze" ? "bg-amber-700/20" 
                    : subscription.plan === "prata" ? "bg-slate-400/20" 
                    : "bg-amber-500/20"
                  }`} />
                  <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2 ${
                    subscription.plan === "bronze" ? "bg-amber-800/15" 
                    : subscription.plan === "prata" ? "bg-slate-500/15" 
                    : "bg-yellow-500/15"
                  }`} />
                  
                  <div className="relative z-10">
                    {/* Top Row - Plan Name & Actions */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl shadow-lg ${
                          subscription.plan === "bronze" 
                            ? "bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-600/40" 
                            : subscription.plan === "prata" 
                            ? "bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/40"
                            : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40"
                        }`}>
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white">Plano {subscription.planName}</h2>
                            <Badge className={`${
                              subscription.status === "active" 
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" 
                                : subscription.status === "pending" 
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"
                            }`}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {subscription.status === "active" ? "Ativo" : subscription.status === "pending" ? "Pendente" : "Cancelado"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-slate-300">Assinante desde {subscription.startDate}</p>
                            <Badge className="bg-white/10 text-white/80 text-xs border-0">
                              Mensal
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCancelModal(true)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar Plano
                        </Button>
                        {subscription.plan !== "ouro" && (
                          <Button 
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Fazer Upgrade
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Benefits Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-black/20 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Ticket className={`w-4 h-4 ${
                          subscription.plan === "bronze" ? "text-amber-400" 
                          : subscription.plan === "prata" ? "text-slate-300"
                          : "text-amber-300"
                        }`} />
                        <span className="text-sm text-white">
                          {subscription.plan === "bronze" ? "2" : subscription.plan === "prata" ? "6" : "21"} bolões/semana
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-white">
                          {subscription.plan === "bronze" ? "1 Lotofácil" : subscription.plan === "prata" ? "2 Lotofácil" : "12 Lotofácil"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-white">
                          {subscription.plan === "bronze" ? "—" : subscription.plan === "prata" ? "2 Mega-Sena" : "3 Mega-Sena"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-sky-400" />
                        <span className="text-sm text-white">
                          {subscription.plan === "bronze" ? "1 Quina" : subscription.plan === "prata" ? "2 Quina" : "6 Quina"}
                        </span>
                      </div>
                    </div>

                    {/* Key Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-muted-foreground">Próxima Cobrança</p>
                        </div>
                        <p className="font-bold text-white">{subscription.nextPayment}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Banknote className="w-4 h-4 text-sky-400" />
                          <p className="text-xs text-muted-foreground">Valor Mensal</p>
                        </div>
                        <p className="font-bold text-white">R$ {subscription.monthlyPrice}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4 text-amber-400" />
                          <p className="text-xs text-muted-foreground">Total Investido</p>
                        </div>
                        <p className="font-bold text-white">R$ {subscription.totalPaidAllTime}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-emerald-400" />
                          <p className="text-xs text-muted-foreground">Total Ganho</p>
                        </div>
                        <p className="font-bold text-emerald-400">R$ {subscription.totalWinnings.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Next Payment */}
                  <Card className="p-5 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Pago</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Próximo Pagamento</p>
                    <p className="text-xl font-bold text-white">{subscription.nextPayment}</p>
                    <p className="text-xs text-muted-foreground mt-1">R$ {subscription.monthlyPrice}/mês</p>
                  </Card>

                  {/* Total Winnings */}
                  <Card className="p-5 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Ganho</p>
                    <p className="text-xl font-bold text-amber-400">R$ {subscription.totalWinnings.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-emerald-400 mt-1">+R$ 850 este mês</p>
                  </Card>

                  {/* Bolões This Month */}
                  <Card className="p-5 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <Ticket className="w-5 h-5 text-violet-400" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Bolões Este Mês</p>
                    <p className="text-xl font-bold text-white">18/24</p>
                    <p className="text-xs text-muted-foreground mt-1">6 restantes</p>
                  </Card>

                  {/* Total Paid */}
                  <Card className="p-5 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-sky-500/20">
                        <Banknote className="w-5 h-5 text-sky-400" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Investido</p>
                    <p className="text-xl font-bold text-white">R$ {subscription.totalPaidAllTime.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-muted-foreground mt-1">2 meses</p>
                  </Card>
                </div>

                {/* Upcoming Bolões and History */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Next Scheduled Bolões */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-bolao-green" />
                      Próximos Bolões
                    </h3>
                    <div className="space-y-3">
                      {subscription.upcomingBoloes.map((bolao) => (
                        <div 
                          key={bolao.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border hover:border-bolao-green/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              bolao.type === "Lotofácil" ? "bg-violet-500/20" :
                              bolao.type === "Mega-Sena" ? "bg-emerald-500/20" :
                              "bg-sky-500/20"
                            }`}>
                              {bolao.type === "Lotofácil" ? <CircleDot className="w-4 h-4 text-violet-400" /> :
                               bolao.type === "Mega-Sena" ? <TrendingUp className="w-4 h-4 text-emerald-400" /> :
                               <Star className="w-4 h-4 text-sky-400" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{bolao.name}</p>
                              <p className="text-xs text-muted-foreground">{bolao.type} • {bolao.dezenas} dezenas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-bolao-green">{bolao.date}</p>
                            <p className="text-xs text-muted-foreground">Sorteio</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Participation History */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-400" />
                      Histórico de Participações
                    </h3>
                    <div className="space-y-3">
                      {subscription.participationHistory.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.isDivided 
                              ? "bg-blue-500/10 border-blue-500/30" 
                              : "bg-bolao-dark/50 border-bolao-card-border"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              item.result === "Premiado" 
                                ? (item.isDivided ? "bg-blue-500/20" : "bg-emerald-500/20") 
                                : "bg-gray-500/20"
                            }`}>
                              {item.result === "Premiado" ? 
                                (item.isDivided 
                                  ? <Split className="w-4 h-4 text-blue-400" />
                                  : <Trophy className="w-4 h-4 text-emerald-400" />
                                ) :
                                <X className="w-4 h-4 text-gray-400" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-sm flex items-center gap-2">
                                {item.name}
                                {/* Task 159: Division badge */}
                                {item.isDivided && (
                                  <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px] px-1.5 py-0">
                                    <Split className="w-2.5 h-2.5 mr-0.5" />
                                    {item.totalWinners}x
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.type} • {item.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.result === "Premiado" ? (
                              <div>
                                {/* Task 159: Show division breakdown for divided prizes */}
                                {item.isDivided ? (
                                  <div className="relative group">
                                    <p className="text-sm font-bold text-blue-400">+{formatCurrency(item.premio)}</p>
                                    <p className="text-[10px] text-muted-foreground line-through">{formatCurrency(item.premioOriginal || 0)}</p>
                                    {/* Tooltip with breakdown */}
                                    <div className="absolute right-0 bottom-full mb-2 w-56 p-3 bg-[#1C2432] rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-lg text-left">
                                      <p className="font-semibold text-white mb-2 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        Divisão do Prêmio
                                      </p>
                                      <div className="space-y-1 text-muted-foreground">
                                        <p>Prêmio Original: <span className="text-white">{formatCurrency(item.premioOriginal || 0)}</span></p>
                                        <p>Divisão ({item.totalWinners} ganhadores)</p>
                                        <p>Parte do Bolão: <span className="text-yellow-500">{formatCurrency(item.parteBolao || 0)}</span></p>
                                        <p>Sua Cota ({item.percentualCota}%): <span className="text-blue-400 font-semibold">{formatCurrency(item.suaCota || 0)}</span></p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm font-bold text-emerald-400">+{formatCurrency(item.premio)}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">—</p>
                            )}
                            <Badge className={`text-xs ${
                              item.result === "Premiado" 
                                ? (item.isDivided 
                                    ? "bg-blue-500/20 text-blue-300" 
                                    : "bg-emerald-500/20 text-emerald-300")
                                : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {item.result}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground">
                      Ver histórico completo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Card>
                </div>

                {/* Progress and Summary */}
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-bolao-green" />
                    Resumo do Mês
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Lotofácil</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-bolao-dark rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: '75%' }} />
                        </div>
                        <span className="text-sm font-medium text-violet-400">6/8</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Mega-Sena</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-bolao-dark rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '50%' }} />
                        </div>
                        <span className="text-sm font-medium text-emerald-400">4/8</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Quina</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-bolao-dark rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full" style={{ width: '100%' }} />
                        </div>
                        <span className="text-sm font-medium text-sky-400">8/8</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Gamification Section - Ranking de Vencedores */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Leaderboard - Ranking */}
                  <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-bolao-card to-orange-500/5 border-amber-500/30">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Ranking de Vencedores</h3>
                          <p className="text-sm text-muted-foreground">Top assinantes do mês</p>
                        </div>
                      </div>
                      <select className="px-3 py-1.5 rounded-lg bg-bolao-card border border-bolao-card-border text-sm focus:border-amber-500 outline-none">
                        <option value="month">Este mês</option>
                        <option value="all">Todo período</option>
                      </select>
                    </div>

                    {/* Top 3 with special treatment */}
                    <div className="space-y-3 mb-4">
                      {/* 1st Place */}
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40">
                        <span className="text-3xl">🥇</span>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/40">
                          L
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">Lucas M.</p>
                          <p className="text-xs text-amber-300">12 prêmios ganhos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-400">R$ 8.540</p>
                          <p className="text-xs text-muted-foreground">Total ganho</p>
                        </div>
                      </div>

                      {/* 2nd Place */}
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-500/10 border border-slate-500/30">
                        <span className="text-2xl">🥈</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-slate-700 font-bold">
                          A
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">Ana P.</p>
                          <p className="text-xs text-slate-400">9 prêmios ganhos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-300">R$ 5.820</p>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-orange-700/10 border border-orange-700/30">
                        <span className="text-2xl">🥉</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-white font-bold">
                          R
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">Ricardo S.</p>
                          <p className="text-xs text-orange-400">7 prêmios ganhos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-400">R$ 4.150</p>
                        </div>
                      </div>
                    </div>

                    {/* Rest of ranking */}
                    <div className="space-y-2">
                      {[
                        { pos: 4, name: "Fernanda L.", prizes: 5, total: 2890 },
                        { pos: 5, name: "Pedro H.", prizes: 4, total: 2340 },
                        { pos: 6, name: "Juliana C.", prizes: 4, total: 1980 },
                        { pos: 7, name: "Carlos E.", prizes: 3, total: 1650 },
                      ].map((player) => (
                        <div key={player.pos} className="flex items-center gap-3 p-2.5 rounded-lg bg-bolao-dark/30 border border-bolao-card-border/50 hover:border-bolao-card-border transition-colors">
                          <span className="w-6 text-center text-sm font-bold text-muted-foreground">{player.pos}</span>
                          <div className="w-7 h-7 rounded-full bg-bolao-card flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {player.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{player.name}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{player.prizes} prêmios</span>
                          <span className="font-semibold text-emerald-400 text-sm">R$ {player.total.toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Your Position */}
                    <div className="mt-4 p-4 rounded-xl bg-bolao-green/10 border border-bolao-green/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bolao-green flex items-center justify-center text-bolao-dark font-bold">
                          {user?.name?.charAt(0) || 'V'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-bolao-green">Sua posição: #12</p>
                          <p className="text-xs text-muted-foreground">Você está entre os top 15%!</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">R$ {subscription?.totalWinnings.toLocaleString('pt-BR') || '1.250'}</p>
                          <p className="text-xs text-muted-foreground">Total ganho</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Achievements / Conquistas */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Conquistas</h3>
                        <p className="text-sm text-muted-foreground">Suas medalhas e conquistas</p>
                      </div>
                    </div>

                    {/* Achievement Badges */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {/* Earned badges */}
                      <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="text-xs font-semibold text-emerald-400 text-center">Primeiro Prêmio</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Conquistado!</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="text-xs font-semibold text-amber-400 text-center">10 Prêmios</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Conquistado!</p>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30">
                        <div className="text-4xl mb-2">⭐</div>
                        <p className="text-xs font-semibold text-violet-400 text-center">Sortudo do Mês</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Jan 2025</p>
                      </div>
                      
                      {/* In progress badges */}
                      <div className="flex flex-col items-center p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border relative overflow-hidden">
                        <div className="text-4xl mb-2 grayscale opacity-50">🎖️</div>
                        <p className="text-xs font-semibold text-muted-foreground text-center">Veterano 6 Meses</p>
                        <p className="text-[10px] text-amber-400 mt-1">4/6 meses</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bolao-card-border">
                          <div className="h-full bg-amber-500" style={{ width: '66%' }} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border relative overflow-hidden">
                        <div className="text-4xl mb-2 grayscale opacity-50">👑</div>
                        <p className="text-xs font-semibold text-muted-foreground text-center">VIP 1 Ano</p>
                        <p className="text-[10px] text-amber-400 mt-1">4/12 meses</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bolao-card-border">
                          <div className="h-full bg-amber-500" style={{ width: '33%' }} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border relative overflow-hidden">
                        <div className="text-4xl mb-2 grayscale opacity-50">💎</div>
                        <p className="text-xs font-semibold text-muted-foreground text-center">50 Prêmios</p>
                        <p className="text-[10px] text-amber-400 mt-1">10/50</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bolao-card-border">
                          <div className="h-full bg-amber-500" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Meus Ganhos Summary */}
                    <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-bolao-green" />
                        Meus Ganhos
                      </h4>
                      
                      {/* Win Rate */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Taxa de acerto</span>
                          <span className="text-sm font-bold text-emerald-400">18.5%</span>
                        </div>
                        <div className="h-2.5 bg-bolao-card rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '18.5%' }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Acima da média dos assinantes (15.2%)</p>
                      </div>

                      {/* Prize History Chart (Simplified visual) */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-3">Prêmios nos últimos 6 meses</p>
                        <div className="flex items-end gap-1 h-20">
                          {[
                            { month: 'Set', value: 150, max: 850 },
                            { month: 'Out', value: 0, max: 850 },
                            { month: 'Nov', value: 320, max: 850 },
                            { month: 'Dez', value: 0, max: 850 },
                            { month: 'Jan', value: 850, max: 850 },
                            { month: 'Fev', value: 400, max: 850 },
                          ].map((item) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className={`w-full rounded-t transition-all ${item.value > 0 ? 'bg-gradient-to-t from-bolao-green/80 to-bolao-green' : 'bg-bolao-card-border'}`}
                                style={{ height: `${Math.max((item.value / item.max) * 100, 5)}%` }}
                              />
                              <span className="text-[10px] text-muted-foreground">{item.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats comparison */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-bolao-card border border-bolao-card-border">
                          <p className="text-xs text-muted-foreground">Total de prêmios</p>
                          <p className="text-lg font-bold text-white">10</p>
                          <p className="text-xs text-emerald-400">+3 este mês</p>
                        </div>
                        <div className="p-3 rounded-lg bg-bolao-card border border-bolao-card-border">
                          <p className="text-xs text-muted-foreground">Maior prêmio</p>
                          <p className="text-lg font-bold text-amber-400">R$ 850</p>
                          <p className="text-xs text-muted-foreground">Jan 2025</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Historical Results - Public */}
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-sky-500/20">
                        <History className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Histórico de Resultados</h3>
                        <p className="text-sm text-muted-foreground">Últimos sorteios dos assinantes</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-bolao-card-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Loteria</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Concurso</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ganhador</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Prêmio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { date: '15/02/2025', lottery: 'Lotofácil', concurso: 3264, winner: 'Lucas M. 🥇', prize: 2150 },
                          { date: '14/02/2025', lottery: 'Mega-Sena', concurso: 2856, winner: 'Ana P.', prize: 1890 },
                          { date: '13/02/2025', lottery: 'Quina', concurso: 6523, winner: 'Você! 🎉', prize: 850, isYou: true },
                          { date: '12/02/2025', lottery: 'Lotofácil', concurso: 3263, winner: 'Ricardo S.', prize: 720 },
                          { date: '11/02/2025', lottery: 'Quina', concurso: 6522, winner: 'Assinante ***', prize: 450, anonymous: true },
                        ].map((result, idx) => (
                          <tr key={idx} className={`border-b border-bolao-card-border/50 ${result.isYou ? 'bg-bolao-green/5' : 'hover:bg-bolao-dark/30'}`}>
                            <td className="py-3 px-4 text-sm">{result.date}</td>
                            <td className="py-3 px-4">
                              <Badge className={`text-xs ${
                                result.lottery === 'Lotofácil' ? 'bg-violet-500/20 text-violet-300' :
                                result.lottery === 'Mega-Sena' ? 'bg-emerald-500/20 text-emerald-300' :
                                'bg-sky-500/20 text-sky-300'
                              }`}>
                                {result.lottery}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">#{result.concurso}</td>
                            <td className="py-3 px-4">
                              <span className={`text-sm font-medium ${result.isYou ? 'text-bolao-green' : result.anonymous ? 'text-muted-foreground' : 'text-white'}`}>
                                {result.winner}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-semibold ${result.isYou ? 'text-bolao-green' : 'text-emerald-400'}`}>
                                +R$ {result.prize.toLocaleString('pt-BR')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground">
                    Ver histórico completo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Card>
              </>
            )}

            {/* Non-Subscriber View - Show plans when no active subscription */}
            {!subscription && (
              <>
                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/5 border border-amber-500/30 p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Clube Bolão Max</h2>
                        <p className="text-amber-300/80">Sua assinatura mensal de bolões</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 max-w-2xl mb-6">
                      Participe automaticamente de bolões selecionados todos os meses. 
                      Escolha seu plano e deixe a sorte trabalhar por você!
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white">Participação Automática</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white">Benefícios Exclusivos</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white">Jogos Especiais</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Plan Cards Section - only show for non-subscribers */}
            {!subscription && (
              <>
                {/* Billing Toggle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex items-center gap-4 p-2 rounded-xl bg-bolao-card border border-bolao-card-border">
                    <button
                      onClick={() => setIsAnnualBilling(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        !isAnnualBilling 
                          ? "bg-bolao-green text-bolao-dark" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      Mensal
                    </button>
                    <button
                      onClick={() => setIsAnnualBilling(true)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        isAnnualBilling 
                          ? "bg-bolao-green text-bolao-dark" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      Anual
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-0">
                        2 MESES GRÁTIS
                      </Badge>
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                {/* Bronze Plan */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-bolao-card to-bolao-dark border-amber-700/30 hover:border-amber-600/50 transition-all duration-300 group hover:scale-[1.02]">
                  {isAnnualBilling && (
                    <div className="absolute -top-1 right-4 z-20">
                      <Badge className="bg-emerald-500 text-white text-xs px-2 py-1">
                        ECONOMIZE R$ 158
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
                  <div className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-700/30 to-amber-800/20 border border-amber-700/40 group-hover:shadow-lg group-hover:shadow-amber-700/20 transition-all">
                        <span className="text-2xl">🟢</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-amber-500">Bronze</h3>
                        <p className="text-xs text-muted-foreground">Plano Inicial</p>
                      </div>
                    </div>
                    
                    <div className="mb-5 pb-4 border-b border-bolao-card-border">
                      {isAnnualBilling ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">R$ 790</span>
                            <span className="text-muted-foreground text-sm">/ano</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="line-through">R$ 948</span>
                            <span className="text-emerald-400 ml-2">≈ R$ 65,83/mês (14 meses)</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-black text-white">R$ 79</span>
                          <span className="text-muted-foreground text-sm">/mês</span>
                          <p className="text-xs text-muted-foreground mt-1">≈ R$ 19,75/semana</p>
                        </>
                      )}
                    </div>
                    
                    <div className="mb-5">
                      <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-3">Bolões por Semana</p>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                          <span className="flex items-center gap-2">
                            <CircleDot className="w-4 h-4 text-violet-400" />
                            Lotofácil
                          </span>
                          <Badge className="bg-violet-500/20 text-violet-300 text-xs">1x</Badge>
                        </li>
                        <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-sky-400" />
                            Quina
                          </span>
                          <Badge className="bg-sky-500/20 text-sky-300 text-xs">1x</Badge>
                        </li>
                        <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-500/10 border border-gray-500/20 opacity-50">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            Mega-Sena
                          </span>
                          <Badge className="bg-gray-500/20 text-gray-400 text-xs">—</Badge>
                        </li>
                      </ul>
                    </div>
                    
                    <ul className="space-y-2 mb-6 text-sm">
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-amber-500" />
                        <span>{isAnnualBilling ? "112 bolões (14 meses)" : "8 bolões por mês (4 semanas)"}</span>
                      </li>
                      <li className="flex items-center gap-2 text-muted-foreground">
                        <Check className="w-4 h-4 text-amber-500" />
                        <span>Participação automática</span>
                      </li>
                    </ul>
                    
                    <Button 
                      onClick={() => setLocation(`/checkout?subscription=bronze${isAnnualBilling ? "&period=annual" : ""}`)}
                      className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white font-semibold group-hover:shadow-lg group-hover:shadow-amber-700/30 transition-all"
                    >
                      Assinar Agora
                    </Button>
                  </div>
                </Card>

              {/* Silver/Prata Plan - MAIN PLAN */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-bolao-dark border-slate-400/40 hover:border-slate-300/60 transition-all duration-300 ring-2 ring-slate-400/30 group hover:scale-[1.02]">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-slate-300 to-slate-400 text-bolao-dark font-bold px-4 py-1 shadow-lg">
                    {isAnnualBilling ? "💰 MAIS ECONÔMICO" : "⭐ MAIS VENDIDO"}
                  </Badge>
                </div>
                {isAnnualBilling && (
                  <div className="absolute -top-1 right-4 z-20">
                    <Badge className="bg-emerald-500 text-white text-xs px-2 py-1">
                      ECONOMIZE R$ 398
                    </Badge>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-400/15 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="p-6 pt-10 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-400/30 to-slate-500/20 border border-slate-400/40 group-hover:shadow-lg group-hover:shadow-slate-400/20 transition-all">
                      <span className="text-2xl">🔵</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-200">Prata</h3>
                      <p className="text-xs text-slate-400">Melhor Custo-Benefício</p>
                    </div>
                  </div>
                  
                  <div className="mb-5 pb-4 border-b border-slate-600/40">
                    {isAnnualBilling ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white">R$ 1.990</span>
                          <span className="text-slate-400 text-sm">/ano</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          <span className="line-through">R$ 2.388</span>
                          <span className="text-emerald-400 ml-2">≈ R$ 165,83/mês (14 meses)</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white">R$ 199</span>
                        <span className="text-slate-400 text-sm">/mês</span>
                        <p className="text-xs text-slate-400 mt-1">≈ R$ 49,75/semana</p>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-5">
                    <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider mb-3">Bolões por Semana</p>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-violet-500/15 border border-violet-500/30">
                        <span className="flex items-center gap-2">
                          <CircleDot className="w-4 h-4 text-violet-400" />
                          Lotofácil
                        </span>
                        <Badge className="bg-violet-500/30 text-violet-200 text-xs font-bold">2x</Badge>
                      </li>
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Mega-Sena
                        </span>
                        <Badge className="bg-emerald-500/30 text-emerald-200 text-xs font-bold">2x</Badge>
                      </li>
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-sky-500/15 border border-sky-500/30">
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-sky-400" />
                          Quina
                        </span>
                        <Badge className="bg-sky-500/30 text-sky-200 text-xs font-bold">2x</Badge>
                      </li>
                    </ul>
                  </div>
                  
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-300" />
                      <span>{isAnnualBilling ? "336 bolões (14 meses)" : "24 bolões por mês"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-300" />
                      <span>Estratégias combinadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-slate-300" />
                      <span>Prioridade em eventos especiais</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => setLocation(`/checkout?subscription=prata${isAnnualBilling ? "&period=annual" : ""}`)}
                    className="w-full bg-gradient-to-r from-slate-300 to-slate-400 hover:from-slate-200 hover:to-slate-300 text-bolao-dark font-bold shadow-lg shadow-slate-400/30 group-hover:shadow-xl transition-all"
                  >
                    Assinar Agora
                  </Button>
                </div>
              </Card>

              {/* Gold/Ouro Plan - CLUBE VIP */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/25 via-yellow-500/15 to-orange-500/10 border-amber-400/50 hover:border-amber-300/70 transition-all duration-300 ring-2 ring-amber-500/40 group hover:scale-[1.02]">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-bolao-dark font-bold px-4 py-1 shadow-lg shadow-amber-500/40">
                    <Crown className="w-3 h-3 mr-1 inline" />
                    CLUBE VIP
                  </Badge>
                </div>
                {isAnnualBilling && (
                  <div className="absolute -top-1 right-4 z-20">
                    <Badge className="bg-emerald-500 text-white text-xs px-2 py-1">
                      ECONOMIZE R$ 998
                    </Badge>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/25 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/15 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
                <div className="p-6 pt-10 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/40 to-yellow-500/30 border border-amber-400/50 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all">
                      <span className="text-2xl">🟣</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-amber-300">Ouro</h3>
                      <p className="text-xs text-amber-400/70">Experiência Premium Completa</p>
                    </div>
                  </div>
                  
                  <div className="mb-5 pb-4 border-b border-amber-500/30">
                    {isAnnualBilling ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white">R$ 4.990</span>
                          <span className="text-amber-300/70 text-sm">/ano</span>
                        </div>
                        <p className="text-xs text-amber-300/60 mt-1">
                          <span className="line-through">R$ 5.988</span>
                          <span className="text-emerald-400 ml-2">≈ R$ 415,83/mês (14 meses)</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white">R$ 499</span>
                        <span className="text-amber-300/70 text-sm">/mês</span>
                        <p className="text-xs text-amber-300/60 mt-1">≈ R$ 124,75/semana</p>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-5">
                    <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-3">Bolões por Semana</p>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-violet-500/20 border border-violet-500/40">
                        <span className="flex items-center gap-2">
                          <CircleDot className="w-4 h-4 text-violet-400" />
                          Lotofácil
                        </span>
                        <Badge className="bg-violet-500/40 text-violet-100 text-xs font-bold">12x</Badge>
                      </li>
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Mega-Sena
                        </span>
                        <Badge className="bg-emerald-500/40 text-emerald-100 text-xs font-bold">3x</Badge>
                      </li>
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-sky-500/20 border border-sky-500/40">
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-sky-400" />
                          Quina
                        </span>
                        <Badge className="bg-sky-500/40 text-sky-100 text-xs font-bold">6x</Badge>
                      </li>
                      <li className="flex items-center justify-between text-sm p-2 rounded-lg bg-amber-500/20 border border-amber-500/40">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Jogos Especiais
                        </span>
                        <Badge className="bg-amber-500/40 text-amber-100 text-xs font-bold">4x</Badge>
                      </li>
                    </ul>
                  </div>
                  
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span className="font-medium">{isAnnualBilling ? "1.400+ bolões (14 meses)" : "100+ bolões por mês"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>Loterias acumuladas/Final Zero</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>Estratégias matemáticas avançadas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>Participação amplificada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400" />
                      <span>Suporte VIP prioritário 24/7</span>
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => setLocation(`/checkout?subscription=ouro${isAnnualBilling ? "&period=annual" : ""}`)}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-bolao-dark font-bold shadow-lg shadow-amber-500/40 group-hover:shadow-xl group-hover:shadow-amber-500/50 transition-all"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar VIP
                  </Button>
                </div>
              </Card>
            </div>
            </>
            )}

            {/* Benefits Section - shown for both subscribers and non-subscribers */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Por que assinar o Clube?
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <div className="p-2 rounded-lg bg-bolao-green/20 w-fit mb-3">
                    <Repeat className="w-5 h-5 text-bolao-green" />
                  </div>
                  <h4 className="font-semibold mb-1">Automático</h4>
                  <p className="text-sm text-muted-foreground">Sem precisar escolher bolões manualmente todo mês</p>
                </div>
                
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <div className="p-2 rounded-lg bg-amber-500/20 w-fit mb-3">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Economia</h4>
                  <p className="text-sm text-muted-foreground">Até 20% de desconto comparado a compras avulsas</p>
                </div>
                
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <div className="p-2 rounded-lg bg-violet-500/20 w-fit mb-3">
                    <Star className="w-5 h-5 text-violet-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Exclusivo</h4>
                  <p className="text-sm text-muted-foreground">Acesso a jogos especiais só para assinantes</p>
                </div>
                
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <div className="p-2 rounded-lg bg-sky-500/20 w-fit mb-3">
                    <Users className="w-5 h-5 text-sky-400" />
                  </div>
                  <h4 className="font-semibold mb-1">Comunidade</h4>
                  <p className="text-sm text-muted-foreground">Faça parte do grupo de apostadores premium</p>
                </div>
              </div>
            </Card>

            {/* FAQ Section */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-bolao-green" />
                Perguntas Frequentes
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <h4 className="font-semibold mb-2">Como funciona a assinatura?</h4>
                  <p className="text-sm text-muted-foreground">
                    Ao assinar, você é automaticamente incluído nos bolões selecionados a cada mês. 
                    O valor é cobrado mensalmente e você participa sem precisar fazer nada.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
                  <p className="text-sm text-muted-foreground">
                    Sim! Você pode cancelar sua assinatura a qualquer momento. 
                    Você continua participando até o final do período já pago.
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <h4 className="font-semibold mb-2">Como recebo meus prêmios?</h4>
                  <p className="text-sm text-muted-foreground">
                    Os prêmios são creditados automaticamente no seu saldo. 
                    Assinantes Ouro recebem ainda um bônus de 5% sobre os prêmios!
                  </p>
                </div>
              </div>
            </Card>

            {/* Referral Section - Indique Amigos */}
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 via-bolao-card to-pink-500/5 border-violet-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Indique Amigos</h3>
                  <p className="text-sm text-muted-foreground">Convide amigos e ganhe cotas bônus!</p>
                </div>
              </div>

              {/* Referral Code & Link */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <p className="text-xs text-muted-foreground mb-2">Seu código de indicação</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-2 bg-bolao-card rounded-lg text-violet-400 font-mono text-lg font-bold tracking-wider">
                      BOLAO-{user?.name?.split(' ')[0]?.toUpperCase().slice(0, 4) || 'USER'}2025
                    </code>
                    <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                      Copiar
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                  <p className="text-xs text-muted-foreground mb-2">Link de indicação</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`bolaomax.com/r/${user?.name?.split(' ')[0]?.toLowerCase() || 'user'}2025`}
                      className="flex-1 px-3 py-2 bg-bolao-card rounded-lg text-sm text-muted-foreground"
                    />
                    <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border text-center">
                  <p className="text-2xl font-bold text-violet-400">3</p>
                  <p className="text-xs text-muted-foreground">Amigos indicados</p>
                </div>
                <div className="p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border text-center">
                  <p className="text-2xl font-bold text-pink-400">2</p>
                  <p className="text-xs text-muted-foreground">Assinaram</p>
                </div>
                <div className="p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border text-center">
                  <p className="text-2xl font-bold text-emerald-400">R$ 40</p>
                  <p className="text-xs text-muted-foreground">Cotas bônus</p>
                </div>
                <div className="p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border text-center">
                  <p className="text-2xl font-bold text-amber-400">1</p>
                  <p className="text-xs text-muted-foreground">Mês extra</p>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </Button>
                <Button variant="outline" className="border-bolao-card-border">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>

              {/* Referral Rules */}
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-violet-400" />
                  Como funciona
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Amigo se cadastra com seu link → <strong className="text-violet-400">+10% cotas bônus</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Amigo assina qualquer plano → <strong className="text-pink-400">+1 mês de cotas extras</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Sem limite de indicações! Quanto mais amigos, mais bônus.</span>
                  </li>
                </ul>
              </div>

              {/* Referred Friends List */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Amigos Indicados</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">M</div>
                      <div>
                        <p className="font-medium text-sm">Marcos</p>
                        <p className="text-xs text-muted-foreground">Entrou em 15/02/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300">Assinante</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm">A</div>
                      <div>
                        <p className="font-medium text-sm">Amanda</p>
                        <p className="text-xs text-muted-foreground">Entrou em 10/02/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300">Assinante</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">R</div>
                      <div>
                        <p className="font-medium text-sm">Rafael</p>
                        <p className="text-xs text-muted-foreground">Entrou em 01/02/2025</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-300">Cadastrado</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* CONFIGURAÇÕES TAB */}
        {activeMainTab === "configuracoes" && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4 bg-bolao-card border-bolao-card-border sticky top-4">
                <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Seções</h3>
                <nav className="space-y-1">
                  {configSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveConfigSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          activeConfigSection === section.id
                            ? "bg-bolao-green/20 text-bolao-green border border-bolao-green/30"
                            : "hover:bg-bolao-dark/50 text-muted-foreground hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* DADOS PESSOAIS */}
              {activeConfigSection === "dados-pessoais" && (
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                      <User className="w-5 h-5 text-bolao-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Dados Pessoais</h2>
                      <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
                    </div>
                  </div>

                  {dadosPessoaisSaved && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300">Dados salvos com sucesso!</span>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Nome Completo */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                      />
                      {nome.length > 0 && nome.length < 3 && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Nome deve ter pelo menos 3 caracteres
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                      />
                      {email.length > 0 && !validateEmail(email) && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          E-mail inválido
                        </p>
                      )}
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        CPF
                      </label>
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                      />
                      {cpf.length > 0 && !validateCPF(cpf) && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          CPF inválido
                        </p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={telefone}
                        onChange={(e) => setTelefone(formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                      />
                      {telefone.length > 0 && !validatePhone(telefone) && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Telefone inválido
                        </p>
                      )}
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                      />
                    </div>

                    <Button
                      onClick={handleSaveDadosPessoais}
                      disabled={!isDadosPessoaisValid}
                      className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </Card>
              )}

              {/* DADOS FINANCEIROS */}
              {activeConfigSection === "dados-financeiros" && (
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                      <Banknote className="w-5 h-5 text-bolao-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Dados Financeiros</h2>
                      <p className="text-sm text-muted-foreground">Configure sua chave PIX para receber prêmios e saques</p>
                    </div>
                  </div>

                  {pixSaved && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300">Chave PIX salva com sucesso!</span>
                    </div>
                  )}

                  {savedPixKey && (
                    <div className="mb-6 p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <QrCode className="w-4 h-4" />
                        Chave PIX Cadastrada
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground uppercase">{savedPixKey.type}</span>
                          <p className="font-mono text-bolao-green">{savedPixKey.value}</p>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Ativa
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* PIX Key Type */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        Tipo de Chave PIX
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "cpf", label: "CPF" },
                          { id: "email", label: "E-mail" },
                          { id: "telefone", label: "Telefone" },
                          { id: "aleatoria", label: "Aleatória" },
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setPixKeyType(type.id as typeof pixKeyType);
                              setPixKey("");
                            }}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                              pixKeyType === type.id
                                ? "bg-bolao-green/20 border-bolao-green/50 text-bolao-green"
                                : "border-bolao-card-border hover:border-bolao-green/30"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PIX Key Input */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                        {pixKeyType === "cpf" && "CPF"}
                        {pixKeyType === "email" && "E-mail"}
                        {pixKeyType === "telefone" && "Telefone"}
                        {pixKeyType === "aleatoria" && "Chave Aleatória"}
                      </label>
                      {pixKeyType === "cpf" && (
                        <input
                          type="text"
                          value={pixKey}
                          onChange={(e) => setPixKey(formatCPF(e.target.value))}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                        />
                      )}
                      {pixKeyType === "email" && (
                        <input
                          type="email"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                        />
                      )}
                      {pixKeyType === "telefone" && (
                        <input
                          type="text"
                          value={pixKey}
                          onChange={(e) => setPixKey(formatPhone(e.target.value))}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                        />
                      )}
                      {pixKeyType === "aleatoria" && (
                        <input
                          type="text"
                          value={pixKey}
                          onChange={(e) => setPixKey(e.target.value)}
                          placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                          className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all font-mono text-sm"
                        />
                      )}
                    </div>

                    <Button
                      onClick={handleSavePix}
                      disabled={!isPixValid}
                      className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Salvar Chave PIX
                    </Button>
                  </div>
                </Card>
              )}

              {/* SEGURANÇA */}
              {activeConfigSection === "seguranca" && (
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                      <Shield className="w-5 h-5 text-bolao-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Segurança</h2>
                      <p className="text-sm text-muted-foreground">Configure seu PIN de segurança</p>
                    </div>
                  </div>

                  {pinSaved && (
                    <div className="mb-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300">PIN salvo com sucesso!</span>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-6">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-300">PIN de Segurança</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          O PIN será usado para confirmar transações e saques. Escolha um código de 4 a 6 dígitos que você consiga lembrar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Novo PIN */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        Novo PIN
                      </label>
                      <div className="relative">
                        <input
                          type={showPin ? "text" : "password"}
                          value={newPin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setNewPin(val);
                          }}
                          placeholder="••••••"
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all font-mono text-lg tracking-widest"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                        >
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {newPin.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Força:</span>
                            <span className={`text-xs font-medium ${getPinStrength(newPin).color.replace("bg-", "text-")}`}>
                              {getPinStrength(newPin).label}
                            </span>
                          </div>
                          <div className="h-1.5 bg-bolao-dark rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPinStrength(newPin).color} transition-all`}
                              style={{ width: `${(getPinStrength(newPin).level + 1) * 25}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirmar PIN */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        Confirmar PIN
                      </label>
                      <input
                        type={showPin ? "text" : "password"}
                        value={confirmPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setConfirmPin(val);
                        }}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all font-mono text-lg tracking-widest"
                      />
                      {confirmPin.length > 0 && newPin !== confirmPin && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <X className="w-3 h-3" />
                          Os PINs não coincidem
                        </p>
                      )}
                      {confirmPin.length > 0 && newPin === confirmPin && newPin.length >= 4 && (
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          PINs coincidem
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleSavePin}
                      disabled={!isPinValid}
                      className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Salvar PIN
                    </Button>
                  </div>
                </Card>
              )}

              {/* HISTÓRICO DE TRANSAÇÕES */}
              {activeConfigSection === "historico" && (
                <Card className="p-6 bg-bolao-card border-bolao-card-border">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                        <History className="w-5 h-5 text-bolao-green" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Histórico de Transações</h2>
                        <p className="text-sm text-muted-foreground">Acompanhe todas as suas movimentações</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-bolao-card-border">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>

                  {/* Enhanced Balance Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {/* Main Balance Card */}
                    <div className="col-span-2 lg:col-span-1 p-5 rounded-xl bg-gradient-to-br from-bolao-green/20 to-emerald-900/10 border border-bolao-green/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                          <Wallet className="w-5 h-5 text-bolao-green" />
                        </div>
                        <p className="text-sm text-muted-foreground">Saldo Atual</p>
                      </div>
                      <p className="text-3xl font-bold text-bolao-green mb-1">{formatCurrency(user.saldo)}</p>
                      <p className="text-xs text-muted-foreground">Atualizado em {new Date().toLocaleString('pt-BR')}</p>
                    </div>
                    
                    {/* Blocked Balance */}
                    <div className="p-5 rounded-xl bg-bolao-dark border border-bolao-card-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                          <Lock className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">Saldo Bloqueado</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-500">{formatCurrency(320)}</p>
                      <p className="text-xs text-muted-foreground">Em bolões ativos</p>
                    </div>
                    
                    {/* Available for Withdrawal */}
                    <div className="p-5 rounded-xl bg-bolao-dark border border-bolao-card-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                          <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">Disponível para Saque</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">{formatCurrency(user.saldo - 320)}</p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                        onClick={() => setShowWithdrawalModal(true)}
                      >
                        Solicitar Saque
                      </Button>
                    </div>
                  </div>

                  {/* Financial Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                      <p className="text-xs text-muted-foreground mb-1">Total Depositado</p>
                      <p className="text-lg font-bold text-emerald-400">{formatCurrency(1800)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                      <p className="text-xs text-muted-foreground mb-1">Total Apostado</p>
                      <p className="text-lg font-bold text-sky-400">{formatCurrency(1580)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                      <p className="text-xs text-muted-foreground mb-1">Prêmios Ganhos</p>
                      <p className="text-lg font-bold text-amber-400">{formatCurrency(150)}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                      <p className="text-xs text-muted-foreground mb-1">Total Sacado</p>
                      <p className="text-lg font-bold text-red-400">{formatCurrency(500)}</p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Filtros:</span>
                    </div>
                    <select
                      value={transactionPeriod}
                      onChange={(e) => setTransactionPeriod(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-bolao-card border border-bolao-card-border text-sm focus:border-bolao-green outline-none"
                    >
                      <option value="7">Últimos 7 dias</option>
                      <option value="30">Últimos 30 dias</option>
                      <option value="365">Último ano</option>
                      <option value="all">Todos</option>
                    </select>
                    <select
                      value={transactionType}
                      onChange={(e) => {
                        setTransactionType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-bolao-card border border-bolao-card-border text-sm focus:border-bolao-green outline-none"
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="deposito">Depósitos</option>
                      <option value="saque">Saques</option>
                      <option value="participacao">Participações</option>
                      <option value="premio">Prêmios</option>
                    </select>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-bolao-card-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data/Hora</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Valor</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-bolao-card-border/50 hover:bg-bolao-dark/30">
                            <td className="py-4 px-4">
                              <p className="text-sm">{transaction.data}</p>
                              <p className="text-xs text-muted-foreground">{transaction.hora}</p>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${
                                  transaction.type === "deposito" ? "bg-emerald-500/20" :
                                  transaction.type === "saque" ? "bg-red-500/20" :
                                  transaction.type === "participacao" ? "bg-sky-500/20" :
                                  "bg-amber-500/20"
                                }`}>
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <span className="text-sm capitalize">{transaction.type}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">{transaction.description}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className={`font-semibold ${getTransactionColor(transaction.type, transaction.valor)}`}>
                                {transaction.valor > 0 ? "+" : ""}{formatCurrency(transaction.valor)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(transaction.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-bolao-card-border">
                      <p className="text-sm text-muted-foreground">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="border-bolao-card-border"
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="border-bolao-card-border"
                        >
                          Próximo
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* NOTIFICAÇÕES */}
              {activeConfigSection === "notificacoes" && (
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                        <BellRing className="w-5 h-5 text-bolao-green" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Preferências de Notificações</h2>
                        <p className="text-sm text-muted-foreground">Escolha quais notificações deseja receber</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: "sistema", label: "Avisos e atualizações do sistema", icon: Settings },
                        { key: "sorteioEmBreve", label: "Sorteio em breve", icon: Clock },
                        { key: "resultadoBoloes", label: "Resultado de bolões", icon: Trophy },
                        { key: "premiosGanhos", label: "Prêmios ganhos", icon: Gift },
                        { key: "depositosConfirmados", label: "Depósitos confirmados", icon: Banknote },
                        { key: "novosBoloes", label: "Novos bolões disponíveis", icon: Sparkles },
                        { key: "eventosEspeciais", label: "Eventos especiais (Mega da Virada, São João, Independência)", icon: Star },
                      ].map((pref) => {
                        const Icon = pref.icon;
                        const isEnabled = notifPrefs[pref.key as keyof typeof notifPrefs];
                        return (
                          <div
                            key={pref.key}
                            className="flex items-center justify-between p-4 rounded-lg bg-bolao-dark border border-bolao-card-border"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm font-medium">{pref.label}</span>
                            </div>
                            <button
                              onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof notifPrefs] }))}
                              className={`relative w-12 h-6 rounded-full transition-colors ${
                                isEnabled ? "bg-bolao-green" : "bg-bolao-card-border"
                              }`}
                            >
                              <span
                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                  isEnabled ? "translate-x-6" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Subscription Notifications Section */}
                    {subscription && (
                      <div className="mt-6 pt-6 border-t border-bolao-card-border">
                        <div className="flex items-center gap-2 mb-4">
                          <Crown className="w-5 h-5 text-amber-400" />
                          <h3 className="font-semibold">Notificações do Clube</h3>
                          <Badge className="bg-amber-500/20 text-amber-300 text-xs">Assinante</Badge>
                        </div>
                        <div className="space-y-4">
                          {[
                            { key: "novosConcursos", label: "Novos concursos disponíveis", icon: Ticket, desc: "Quando novos bolões da assinatura são criados" },
                            { key: "boloesProntos", label: "Seus bolões estão prontos", icon: CheckCircle2, desc: "Quando seus jogos são gerados e confirmados" },
                            { key: "resultadoSorteio", label: "Resultado do sorteio", icon: Trophy, desc: "Quando os números são sorteados" },
                            { key: "renovacaoAssinatura", label: "Renovação da assinatura", icon: Repeat, desc: "Lembretes sobre renovação e vencimento" },
                            { key: "pagamentoConfirmado", label: "Pagamento confirmado", icon: Banknote, desc: "Confirmação de pagamentos da assinatura" },
                            { key: "jogosEspeciaisOuro", label: "Jogos especiais Ouro liberados", icon: Gem, desc: "Quando novos jogos exclusivos estão disponíveis" },
                          ].map((pref) => {
                            const Icon = pref.icon;
                            const isEnabled = notifPrefs[pref.key as keyof typeof notifPrefs];
                            return (
                              <div
                                key={pref.key}
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Icon className="w-4 h-4 text-amber-400" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">{pref.label}</span>
                                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: !prev[pref.key as keyof typeof notifPrefs] }))}
                                  className={`relative w-12 h-6 rounded-full transition-colors ${
                                    isEnabled ? "bg-amber-500" : "bg-bolao-card-border"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                      isEnabled ? "translate-x-6" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Privacy & Live Feed Settings */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <Eye className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Privacidade e Feed Público</h2>
                        <p className="text-sm text-muted-foreground">Controle como suas informações aparecem no site</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Show purchases in live feed */}
                      <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-bolao-green" />
                            <div>
                              <span className="text-sm font-medium">Exibir participações no feed ao vivo</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Quando ativo, suas participações aparecem no ticker do site
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifPrefs(prev => ({ ...prev, showInLiveFeed: !prev.showInLiveFeed }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifPrefs.showInLiveFeed ? "bg-bolao-green" : "bg-bolao-card-border"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                notifPrefs.showInLiveFeed ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-bolao-green/5 border border-bolao-green/20">
                          <Info className="w-4 h-4 text-bolao-green mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-white">Privacidade garantida:</span> Apenas suas iniciais são exibidas 
                            (ex: "{user?.name ? user.name.split(" ")[0] + " " + (user.name.split(" ")[1]?.charAt(0) || "").toUpperCase() + "." : "João S."}"). 
                            Nenhum dado pessoal é compartilhado.
                          </p>
                        </div>
                      </div>

                      {/* Receive win notifications */}
                      <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <div>
                              <span className="text-sm font-medium">Notificações de ganhos</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Receba alertas quando seus bolões ganharem prêmios
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifPrefs(prev => ({ ...prev, receiveWinNotifications: !prev.receiveWinNotifications }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifPrefs.receiveWinNotifications ? "bg-yellow-500" : "bg-bolao-card-border"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                notifPrefs.receiveWinNotifications ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* VIP automation notifications */}
                      <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <div>
                              <span className="text-sm font-medium">Notificações de automação VIP</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Alertas sobre ações automáticas da sua assinatura
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifPrefs(prev => ({ ...prev, vipAutomationNotifications: !prev.vipAutomationNotifications }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifPrefs.vipAutomationNotifications ? "bg-amber-500" : "bg-bolao-card-border"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                notifPrefs.vipAutomationNotifications ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Email notifications */}
                      <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-card-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <div>
                              <span className="text-sm font-medium">Notificações por e-mail</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Receba atualizações importantes no seu e-mail
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setNotifPrefs(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              notifPrefs.emailNotifications ? "bg-blue-500" : "bg-bolao-card-border"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                notifPrefs.emailNotifications ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Push notifications (future) */}
                      <div className="p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border/50 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BellRing className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Notificações push</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Em breve - Receba notificações no navegador
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-bolao-card-border text-muted-foreground text-xs">Em breve</Badge>
                        </div>
                      </div>
                    </div>

                    {/* LGPD Compliance Note */}
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm text-white mb-1">Conformidade com LGPD</h4>
                          <p className="text-xs text-muted-foreground">
                            Suas preferências de privacidade são respeitadas de acordo com a Lei Geral de Proteção de Dados. 
                            Você pode alterar suas configurações a qualquer momento. Seus dados pessoais nunca são 
                            compartilhados publicamente sem sua autorização explícita.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Notifications */}
                  <Card className="p-6 bg-bolao-card border-bolao-card-border">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                          <Bell className="w-5 h-5 text-bolao-green" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Notificações Recentes</h2>
                          <p className="text-sm text-muted-foreground">
                            {notifications.filter(n => !n.read).length} não lidas
                          </p>
                        </div>
                      </div>
                      {notifications.some(n => !n.read) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="border-bolao-card-border"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar todas como lidas
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-lg border transition-all ${
                            notif.read
                              ? "bg-bolao-dark/30 border-bolao-card-border/50"
                              : "bg-bolao-dark border-bolao-green/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{notif.icon}</span>
                              <div>
                                <p className={`text-sm ${notif.read ? "text-muted-foreground" : "text-white font-medium"}`}>
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notif.date} às {notif.time}
                                </p>
                              </div>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => handleMarkAsRead(notif.id)}
                                className="p-1 rounded hover:bg-bolao-card-border/50 text-muted-foreground hover:text-white transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEPOIMENTOS TAB */}
        {activeMainTab === "depoimentos" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-4">
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Compartilhe Sua Experiência</h2>
              <p className="text-muted-foreground">
                Sua opinião é muito importante para nós e ajuda outros apostadores.
              </p>
            </div>

            {/* Testimonial Submission Form */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Edit2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {editingTestimonial 
                      ? "Edite seu depoimento pendente abaixo" 
                      : "Conte como tem sido sua experiência no BolãoMax"}
                  </p>
                </div>
              </div>

              {/* User Info Display */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bolao-green/30 to-bolao-green-dark/20 border border-bolao-green/30 flex items-center justify-center text-xl font-bold text-bolao-green">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Rating Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">
                  Avaliação <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialRating(star)}
                      className={`p-2 rounded-lg transition-all ${
                        testimonialRating >= star
                          ? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                          : "bg-bolao-dark border border-bolao-card-border text-muted-foreground hover:text-amber-400"
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${testimonialRating >= star ? "fill-amber-400" : ""}`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-muted-foreground">
                    {testimonialRating} estrela{testimonialRating !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Title Field */}
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Título do Depoimento <span className="text-muted-foreground text-xs">(máx. 80 caracteres)</span>
                </label>
                <input
                  type="text"
                  value={testimonialTitle}
                  onChange={(e) => setTestimonialTitle(e.target.value.slice(0, 80))}
                  placeholder="Ex: Melhor plataforma de bolões"
                  className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {testimonialTitle.length}/80
                </p>
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  Sua Mensagem <span className="text-red-400">*</span> <span className="text-muted-foreground text-xs">(máx. 500 caracteres)</span>
                </label>
                <textarea
                  value={testimonialMessage}
                  onChange={(e) => setTestimonialMessage(e.target.value.slice(0, 500))}
                  placeholder="Conte sua experiência com o BolãoMax..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all resize-none"
                />
                <p className={`text-xs mt-1 text-right ${testimonialMessage.length > 450 ? "text-amber-400" : "text-muted-foreground"}`}>
                  {testimonialMessage.length}/500
                </p>
              </div>

              {/* Show Name Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Exibir meu nome publicamente</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonialShowName 
                        ? `Seu nome "${user.name}" será exibido` 
                        : "Seu depoimento será anônimo"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestimonialShowName(!testimonialShowName)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    testimonialShowName ? "bg-bolao-green" : "bg-bolao-card-border"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      testimonialShowName ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => {
                  if (testimonialMessage.length > 0) {
                    const newTestimonial: Testimonial = {
                      id: editingTestimonial?.id || Date.now().toString(),
                      userId: user.email,
                      userName: user.name,
                      userPhoto: "",
                      rating: testimonialRating,
                      title: testimonialTitle,
                      message: testimonialMessage,
                      showName: testimonialShowName,
                      status: "pendente",
                      createdAt: new Date().toLocaleDateString("pt-BR"),
                    };
                    
                    if (editingTestimonial) {
                      setUserTestimonials(prev => 
                        prev.map(t => t.id === editingTestimonial.id ? newTestimonial : t)
                      );
                    } else {
                      setUserTestimonials(prev => [newTestimonial, ...prev]);
                    }
                    
                    // Reset form
                    setTestimonialRating(5);
                    setTestimonialTitle("");
                    setTestimonialMessage("");
                    setTestimonialShowName(true);
                    setEditingTestimonial(null);
                    
                    // Show success modal instead of toast
                    setShowTestimonialSuccessModal(true);
                  }
                }}
                disabled={testimonialMessage.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6"
              >
                <Send className="w-5 h-5 mr-2" />
                {editingTestimonial ? "Salvar Alterações" : "Enviar Depoimento"}
              </Button>

              {editingTestimonial && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingTestimonial(null);
                    setTestimonialRating(5);
                    setTestimonialTitle("");
                    setTestimonialMessage("");
                    setTestimonialShowName(true);
                  }}
                  className="w-full mt-2"
                >
                  Cancelar Edição
                </Button>
              )}
            </Card>

            {/* User's Testimonials List */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <History className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Seus Depoimentos</h3>
                    <p className="text-sm text-muted-foreground">
                      {userTestimonials.length} depoimento{userTestimonials.length !== 1 ? "s" : ""} enviado{userTestimonials.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {userTestimonials.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bolao-dark/50 border border-bolao-card-border flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Você ainda não enviou nenhum depoimento.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compartilhe sua experiência!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTestimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          {/* Rating */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  testimonial.rating >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          {/* Status Badge */}
                          <Badge
                            className={
                              testimonial.status === "aprovado"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : testimonial.status === "pendente"
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }
                          >
                            {testimonial.status === "aprovado" && <Check className="w-3 h-3 mr-1" />}
                            {testimonial.status === "pendente" && <Clock className="w-3 h-3 mr-1" />}
                            {testimonial.status === "rejeitado" && <X className="w-3 h-3 mr-1" />}
                            {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                          </Badge>
                        </div>
                        {/* Edit Button (only for pending) */}
                        {testimonial.status === "pendente" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTestimonial(testimonial);
                              setTestimonialRating(testimonial.rating);
                              setTestimonialTitle(testimonial.title);
                              setTestimonialMessage(testimonial.message);
                              setTestimonialShowName(testimonial.showName);
                              // Scroll to form
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-muted-foreground hover:text-white"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>

                      {/* Title */}
                      {testimonial.title && (
                        <h4 className="font-semibold mb-2">{testimonial.title}</h4>
                      )}

                      {/* Message */}
                      <p className="text-muted-foreground text-sm mb-3">
                        {testimonial.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-bolao-card-border">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Enviado: {testimonial.createdAt}
                          </span>
                          {testimonial.approvedAt && (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Check className="w-3 h-3" />
                              Aprovado: {testimonial.approvedAt}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          {testimonial.showName ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Nome visível
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Anônimo
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Cancel Subscription Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="bg-bolao-card border-bolao-card-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar sua assinatura do Plano {subscription?.planName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Box */}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                O que você vai perder:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  Participação automática em bolões semanais
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  Acesso aos jogos exclusivos do clube
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  Benefícios e bônus de assinante
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  Ranking e gamificação
                </li>
              </ul>
            </div>

            {/* Cancellation Reason */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo do cancelamento <span className="text-red-400">*</span>
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
              >
                <option value="">Selecione um motivo</option>
                <option value="muito-caro">Muito caro para mim</option>
                <option value="nao-ganhando">Não estou ganhando</option>
                <option value="poucos-boloes">Poucos bolões para meu gosto</option>
                <option value="prefiro-manual">Prefiro escolher manualmente</option>
                <option value="problemas-tecnicos">Problemas técnicos</option>
                <option value="outro">Outro motivo</option>
              </select>
            </div>

            {/* Optional Feedback */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback adicional <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <textarea
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                placeholder="Conte-nos mais sobre sua experiência..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border focus:border-bolao-green focus:ring-1 focus:ring-bolao-green outline-none transition-all resize-none"
              />
            </div>

            {/* Info about cancellation */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-300">
                <strong>Importante:</strong> Seu plano será cancelado no fim do período atual ({subscription?.nextPayment}). Você continuará participando dos bolões até essa data.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
                setCancelFeedback("");
              }}
              className="border-bolao-card-border flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Manter Plano
            </Button>
            <Button
              onClick={() => {
                setSubscriptionCancelled(true);
                setHasActiveSubscription(false);
                setShowCancelModal(false);
                setCancelReason("");
                setCancelFeedback("");
              }}
              disabled={!cancelReason}
              className="bg-red-600 hover:bg-red-700 text-white flex-1 disabled:opacity-50"
            >
              <X className="w-4 h-4 mr-2" />
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="bg-bolao-card border-bolao-card-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Fazer Upgrade
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Escolha um plano superior e aproveite mais benefícios!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {/* Pro-rated billing note */}
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-300">
                <strong>💡 Cobrança proporcional:</strong> Você pagará apenas a diferença proporcional ao tempo restante do seu período atual.
              </p>
            </div>

            {/* Available upgrade plans */}
            <div className={`grid gap-4 ${subscription?.plan === "bronze" ? "md:grid-cols-2" : ""}`}>
              {/* Prata Plan - only show if user has Bronze */}
              {subscription?.plan === "bronze" && (
                <div 
                  className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all cursor-pointer ${
                    selectedUpgradePlan === "prata" 
                      ? "border-slate-400 bg-slate-500/20" 
                      : "border-slate-500/30 hover:border-slate-400/50 bg-slate-500/10"
                  }`}
                  onClick={() => setSelectedUpgradePlan("prata")}
                >
                  {selectedUpgradePlan === "prata" && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-slate-400/10 rounded-full blur-2xl" />
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg">
                      <span className="text-xl">🔵</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-300">Prata</h3>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-0">
                        MAIS VENDIDO
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">R$ 199</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    <p className="text-xs text-emerald-400">+R$ 120/mês vs Bronze</p>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" /> 6 bolões/semana
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" /> 2 Lotofácil + 2 Mega-Sena + 2 Quina
                    </li>
                    <li className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" /> Estratégias combinadas
                    </li>
                  </ul>
                </div>
              )}

              {/* Ouro Plan - show for Bronze and Prata */}
              <div 
                className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all cursor-pointer ${
                  selectedUpgradePlan === "ouro" 
                    ? "border-amber-500 bg-amber-500/20" 
                    : "border-amber-500/30 hover:border-amber-500/50 bg-amber-500/10"
                }`}
                onClick={() => setSelectedUpgradePlan("ouro")}
              >
                {selectedUpgradePlan === "ouro" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                    <span className="text-xl">🟣</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">Ouro</h3>
                    <Badge className="bg-amber-500/20 text-amber-300 text-xs border-0">
                      CLUBE VIP
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">R$ 499</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <p className="text-xs text-emerald-400">
                    +R$ {subscription?.plan === "bronze" ? "420" : "300"}/mês vs {subscription?.plan === "bronze" ? "Bronze" : "Prata"}
                  </p>
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-amber-300">
                    <Check className="w-4 h-4 text-emerald-400" /> 21 bolões/semana
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <Check className="w-4 h-4 text-emerald-400" /> 12 Lotofácil + 3 Mega-Sena + 6 Quina
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <Check className="w-4 h-4 text-emerald-400" /> 4 jogos em loterias especiais
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Estratégias matemáticas avançadas
                  </li>
                  <li className="flex items-center gap-2 text-amber-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Participação amplificada
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpgradeModal(false);
                setSelectedUpgradePlan(null);
              }}
              className="border-bolao-card-border flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Navigate to checkout with upgrade details
                setShowUpgradeModal(false);
                setLocation(`/checkout?upgrade=${selectedUpgradePlan}`);
              }}
              disabled={!selectedUpgradePlan}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 flex-1 disabled:opacity-50"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade para {selectedUpgradePlan === "prata" ? "Prata" : "Ouro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-bolao-card border-bolao-card-border m-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-bolao-green/20 border border-bolao-green/30">
                  <ArrowUpRight className="w-5 h-5 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Solicitar Saque</h3>
                  <p className="text-xs text-muted-foreground">Transfira para sua conta</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowWithdrawalModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Available Balance */}
              <div className="p-4 rounded-lg bg-bolao-dark border border-bolao-green/30">
                <p className="text-xs text-muted-foreground mb-1">Disponível para Saque</p>
                <p className="text-2xl font-bold text-bolao-green">{formatCurrency(user.saldo - 320)}</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Valor do Saque</label>
                <input
                  type="text"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="R$ 0,00"
                  className="w-full px-4 py-3 rounded-lg bg-bolao-dark border border-bolao-card-border text-lg font-semibold focus:outline-none focus:border-bolao-green"
                />
                <p className="text-xs text-muted-foreground mt-1">Valor mínimo: R$ 20,00</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Método de Saque</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setWithdrawalMethod("pix")}
                    className={`p-3 rounded-lg text-center border-2 transition-colors ${
                      withdrawalMethod === "pix" 
                        ? "bg-bolao-dark border-bolao-green" 
                        : "bg-bolao-dark border-bolao-card-border hover:border-bolao-card-border/50"
                    }`}
                  >
                    <Zap className={`w-5 h-5 mx-auto mb-1 ${withdrawalMethod === "pix" ? "text-bolao-green" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">PIX</span>
                    <span className="text-xs text-muted-foreground block">Imediato</span>
                  </button>
                  <button 
                    onClick={() => setWithdrawalMethod("transfer")}
                    className={`p-3 rounded-lg text-center border-2 transition-colors ${
                      withdrawalMethod === "transfer" 
                        ? "bg-bolao-dark border-bolao-green" 
                        : "bg-bolao-dark border-bolao-card-border hover:border-bolao-card-border/50"
                    }`}
                  >
                    <Building className={`w-5 h-5 mx-auto mb-1 ${withdrawalMethod === "transfer" ? "text-bolao-green" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">TED</span>
                    <span className="text-xs text-muted-foreground block">Até 24h</span>
                  </button>
                </div>
              </div>

              {/* PIX Key Info */}
              {savedPixKey && withdrawalMethod === "pix" && (
                <div className="p-3 rounded-lg bg-bolao-dark border border-bolao-card-border">
                  <p className="text-xs text-muted-foreground mb-1">Chave PIX cadastrada</p>
                  <p className="text-sm font-mono">{savedPixKey.value}</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-bolao-green p-0 h-auto mt-1"
                    onClick={() => {
                      setShowWithdrawalModal(false);
                      setActiveMainTab("configuracoes");
                      setActiveConfigSection("dados-financeiros");
                    }}
                  >
                    Alterar chave PIX
                  </Button>
                </div>
              )}

              {!savedPixKey && withdrawalMethod === "pix" && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-500">
                    Você precisa cadastrar uma chave PIX para solicitar saques.
                  </p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-amber-500 p-0 h-auto mt-1"
                    onClick={() => {
                      setShowWithdrawalModal(false);
                      setActiveMainTab("configuracoes");
                      setActiveConfigSection("dados-financeiros");
                    }}
                  >
                    Cadastrar chave PIX →
                  </Button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-bolao-card-border"
                  onClick={() => setShowWithdrawalModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
                  disabled={!savedPixKey && withdrawalMethod === "pix"}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Saque
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Testimonial Success Modal (Task 259) */}
      {showTestimonialSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTestimonialSuccessModal(false)} />
          <Card className="relative z-10 w-full max-w-md bg-bolao-card border-bolao-card-border text-center p-8">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-purple-400" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-3">Obrigado pelo seu depoimento!</h2>
            
            {/* Description */}
            <p className="text-muted-foreground mb-6">
              Sua avaliação está sendo revisada e será publicada em breve na nossa página inicial.
            </p>
            
            {/* Review Time Info */}
            <div className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border mb-6">
              <div className="flex items-center justify-center gap-3 text-sm">
                <Clock className="w-5 h-5 text-bolao-green" />
                <span>Tempo estimado de revisão: <strong className="text-bolao-green">24-48 horas</strong></span>
              </div>
            </div>
            
            {/* Notification Info */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-6">
              <div className="flex items-start gap-3 text-left">
                <Bell className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Você receberá uma notificação assim que seu depoimento for aprovado ou se precisarmos de mais informações.
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-400">{approvedTestimonialCount}</div>
                <div className="text-xs text-muted-foreground">Aprovados</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-2xl font-bold text-amber-400">{pendingTestimonialCount}</div>
                <div className="text-xs text-muted-foreground">Em revisão</div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowTestimonialSuccessModal(false)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
              >
                <Check className="w-4 h-4 mr-2" />
                Entendi
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTestimonialSuccessModal(false);
                  // Scroll back to form
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full text-muted-foreground"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar outro depoimento
              </Button>
            </div>
          </Card>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};

export default MinhaConta;
