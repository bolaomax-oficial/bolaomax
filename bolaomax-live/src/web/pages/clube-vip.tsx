import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Crown,
  Star,
  Sparkles,
  Zap,
  Trophy,
  Users,
  Gift,
  Shield,
  Headphones,
  BarChart3,
  Target,
  Gem,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Clock,
  Calendar,
  Wallet,
  TrendingUp,
  MessageCircle,
  Lock,
  Award,
  Repeat,
  CircleDollarSign,
  Timer,
  ArrowRight,
  Ticket,
  Percent,
  BadgeCheck,
} from "lucide-react";

// Plan data
const plans = [
  {
    id: "bronze",
    name: "Bronze",
    icon: Award,
    monthlyPrice: 29.90,
    annualPrice: 287.04,
    annualMonthly: 23.92,
    discount: 20,
    color: "from-amber-700 to-amber-900",
    borderColor: "border-amber-700/50",
    bgGlow: "bg-amber-700/20",
    textColor: "text-amber-500",
    badge: null,
    features: [
      { text: "1 bolão Lotofácil por semana", included: true },
      { text: "1 bolão Quina por semana", included: true },
      { text: "0 bolões Mega-Sena", included: false },
      { text: "Jogos especiais", included: false },
      { text: "Estratégias básicas", included: true },
      { text: "Suporte padrão", included: true },
      { text: "Grupo exclusivo", included: false },
      { text: "Análises básicas", included: true },
      { text: "Taxa cancelamento: 20%", included: true, highlight: false },
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
    icon: Gem,
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
    features: [
      { text: "2 bolões Lotofácil por semana", included: true },
      { text: "2 bolões Quina por semana", included: true },
      { text: "2 bolões Mega-Sena por semana", included: true },
      { text: "Jogos especiais", included: false },
      { text: "Estratégias avançadas", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Grupo exclusivo", included: false },
      { text: "Análises completas", included: true },
      { text: "Taxa cancelamento: 10%", included: true, highlight: true },
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
    icon: Crown,
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
    features: [
      { text: "12 bolões Lotofácil por semana", included: true },
      { text: "6 bolões Quina por semana", included: true },
      { text: "3 bolões Mega-Sena por semana", included: true },
      { text: "4 jogos especiais por mês", included: true },
      { text: "Estratégias premium exclusivas", included: true },
      { text: "Suporte VIP em até 2h", included: true },
      { text: "Grupo VIP Telegram/WhatsApp", included: true },
      { text: "Análises avançadas com IA", included: true },
      { text: "Taxa cancelamento: ISENTO", included: true, highlight: true },
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
    icon: Gem,
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
    features: [
      { text: "20 bolões Lotofácil por semana", included: true },
      { text: "10 bolões Quina por semana", included: true },
      { text: "5 bolões Mega-Sena por semana", included: true },
      { text: "6 jogos especiais por mês", included: true },
      { text: "IA avançada (modelos preditivos + filtros estatísticos)", included: true },
      { text: "Relatórios semanais detalhados", included: true },
      { text: "Grupo Diamante exclusivo (Telegram)", included: true },
      { text: "Suporte prioritário (até 1h)", included: true },
      { text: "Taxa cancelamento: ISENTO", included: true, highlight: true },
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
    icon: Gem,
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
    features: [
      { text: "30 bolões Lotofácil por semana", included: true },
      { text: "15 bolões Quina por semana", included: true },
      { text: "8 bolões Mega-Sena por semana", included: true },
      { text: "10 jogos especiais por mês", included: true },
      { text: "IA premium exclusiva", included: true },
      { text: "Análises probabilísticas + simulações", included: true },
      { text: "Conteúdos estratégicos semanais (PDF/vídeo)", included: true },
      { text: "Grupo Rubi VIP (Telegram + WhatsApp)", included: true },
      { text: "Taxa cancelamento: ISENTO", included: true, highlight: true },
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
    icon: Crown,
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
    features: [
      { text: "Bolões diários (Lotofácil, Quina e Mega-Sena)", included: true },
      { text: "Prioridade máxima nos melhores fechamentos", included: true },
      { text: "Jogos especiais ilimitados", included: true },
      { text: "IA dedicada (modelos exclusivos Ônix)", included: true },
      { text: "Dashboard exclusivo com histórico", included: true },
      { text: "Consultoria estratégica mensal", included: true },
      { text: "Grupo ultra exclusivo (máx. 30 membros)", included: true },
      { text: "Suporte imediato 24/7", included: true },
      { text: "Taxa cancelamento: ISENTO", included: true, highlight: true },
    ],
    boloes: {
      lotofacil: 0,
      megasena: 0,
      quina: 0,
      especiais: 0,
    }
  },
];

// Benefits data
const benefits = [
  {
    icon: Ticket,
    title: "Mais Bolões",
    description: "Receba até 12+ bolões por semana no plano Ouro, contra apenas 1-2 de usuários regulares.",
    highlight: "12+ bolões/semana",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Star,
    title: "Jogos Especiais Exclusivos",
    description: "Acesso a bolões de acumuladas, finais zero e eventos especiais como Mega da Virada.",
    highlight: "Jogos exclusivos",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Target,
    title: "Estratégias Matemáticas Avançadas",
    description: "Nossos especialistas usam análise estatística para selecionar os melhores jogos.",
    highlight: "Análise especializada",
    color: "from-emerald-500 to-green-600",
  },
  {
    icon: Percent,
    title: "Distribuição Ampliada",
    description: "Bolões VIP têm menos cotas disponíveis, aumentando seu percentual no prêmio.",
    highlight: "Maior % do prêmio",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Headphones,
    title: "Suporte Prioritário",
    description: "Resposta em até 2 horas para membros Ouro. Atendimento dedicado e personalizado.",
    highlight: "Resposta em <2h",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: MessageCircle,
    title: "Grupo VIP Exclusivo",
    description: "Participe do grupo Telegram/WhatsApp com outros membros VIP e receba dicas exclusivas.",
    highlight: "Comunidade VIP",
    color: "from-sky-500 to-indigo-600",
  },
  {
    icon: CircleDollarSign,
    title: "Sem Taxa de Cancelamento",
    description: "Membros Ouro não pagam taxa de cancelamento. Cancele quando quiser, sem custos.",
    highlight: "Isento de taxa",
    color: "from-teal-500 to-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Estatísticas e Análises",
    description: "Dashboard completo com suas estatísticas de participação, histórico e tendências.",
    highlight: "Dashboard exclusivo",
    color: "from-orange-500 to-red-600",
  },
];

// Steps data
const howItWorksSteps = [
  {
    number: "1",
    icon: Target,
    title: "Escolha seu Plano",
    description: "Compare os planos Bronze, Prata e Ouro e escolha o que melhor se adequa ao seu perfil de apostador.",
    color: "from-violet-600 to-violet-800",
  },
  {
    number: "2",
    icon: Calendar,
    title: "Assine Mensalmente ou Anualmente",
    description: "Pague via PIX ou cartão. Assinaturas anuais têm 20% de desconto. Renovação automática.",
    color: "from-emerald-600 to-emerald-800",
  },
  {
    number: "3",
    icon: Gift,
    title: "Receba Bolões Automaticamente",
    description: "Toda semana você recebe seus bolões diretamente na sua conta. Sem precisar escolher manualmente.",
    color: "from-sky-600 to-sky-800",
  },
  {
    number: "4",
    icon: Ticket,
    title: "Participe Automaticamente",
    description: "Sua participação é garantida automaticamente em todos os sorteios da semana.",
    color: "from-amber-600 to-orange-600",
  },
  {
    number: "5",
    icon: Trophy,
    title: "Acompanhe e Ganhe",
    description: "Receba notificações dos sorteios. Prêmios são creditados automaticamente na sua conta.",
    color: "from-pink-600 to-rose-600",
  },
];

// FAQ data
const faqs = [
  {
    question: "Como funciona a assinatura?",
    answer: "Ao assinar um plano VIP, você recebe automaticamente bolões toda semana de acordo com seu plano. Não precisa escolher ou comprar individualmente. Os bolões são creditados na sua conta e você participa automaticamente dos sorteios.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura quando quiser. Membros Bronze e Prata pagam uma taxa de cancelamento (20% e 10% respectivamente). Membros Ouro são isentos de qualquer taxa.",
  },
  {
    question: "Quando recebo os bolões?",
    answer: "Os bolões são distribuídos toda segunda-feira para a semana. Você receberá uma notificação quando seus bolões estiverem disponíveis na sua conta.",
  },
  {
    question: "Como funcionam os jogos especiais do Ouro?",
    answer: "Membros Ouro têm acesso a 4 jogos especiais por mês, incluindo bolões de acumuladas (prêmios acima de R$ 100 milhões), finais zero e eventos como Mega da Virada, Quina de São João e Lotofácil da Independência.",
  },
  {
    question: "Posso fazer upgrade do meu plano?",
    answer: "Sim! A qualquer momento você pode fazer upgrade para um plano superior. O valor é calculado proporcionalmente ao período restante da sua assinatura atual.",
  },
  {
    question: "O que acontece se eu cancelar?",
    answer: "Você mantém acesso aos benefícios até o final do período pago. Após o cancelamento, seus bolões pendentes continuam válidos até o sorteio. Prêmios ganhos são sempre seus, independente da situação da assinatura.",
  },
  {
    question: "Há reembolso?",
    answer: "Oferecemos garantia de 7 dias. Se não estiver satisfeito nos primeiros 7 dias, devolvemos 100% do valor. Após esse período, não há reembolso, mas você pode cancelar a renovação.",
  },
  {
    question: "Como é cobrada a assinatura?",
    answer: "A cobrança é feita via PIX ou cartão de crédito. Para assinaturas mensais, a cobrança ocorre todo dia 1. Para anuais, é uma cobrança única com 20% de desconto.",
  },
  {
    question: "Posso pausar minha assinatura?",
    answer: "No momento não oferecemos pausa, mas você pode cancelar e reassinar quando quiser. Membros Ouro podem solicitar uma pausa de até 30 dias uma vez por ano.",
  },
  {
    question: "Vale a pena assinar anualmente?",
    answer: "Com certeza! A assinatura anual oferece 20% de desconto, equivalente a mais de 2 meses grátis. É a opção mais econômica para quem quer participar regularmente.",
  },
  {
    question: "Quantos prêmios VIPs já ganharam?",
    answer: "Nossos membros VIP já ganharam mais de R$ 850.000 em prêmios! A média de acertos é 3x maior entre membros Ouro devido às estratégias exclusivas e maior volume de participações.",
  },
  {
    question: "Como funciona a distribuição de créditos no plano VIP?",
    answer: "Do valor pago mensalmente, 60% é disponibilizado em créditos para participação automática em bolões, e 40% é destinado a custos operacionais (gateway de pagamento, hospedagem, suporte VIP, desenvolvimento). Exemplo: no Bronze (R$ 29,90), você recebe R$ 17,94 em créditos semanais. Importante: isso é diferente da taxa de cancelamento de 20% que se aplica apenas a reembolsos de participações avulsas.",
  },
];

// Comparison table data - Apenas planos VIP (sem Gratuito e sem Crédito)
const comparisonFeatures = [
  { feature: "Valor Mensal", bronze: "R$ 29,90", prata: "R$ 59,90", ouro: "R$ 149,90", diamante: "R$ 249,90", rubi: "R$ 399,90", onix: "R$ 699,90" },
  { feature: "Bolões Lotofácil/semana", bronze: "1", prata: "2", ouro: "12", diamante: "20", rubi: "30", onix: "Diários" },
  { feature: "Bolões Mega-Sena/semana", bronze: "0", prata: "2", ouro: "3", diamante: "5", rubi: "8", onix: "Diários" },
  { feature: "Bolões Quina/semana", bronze: "1", prata: "2", ouro: "6", diamante: "10", rubi: "15", onix: "Diários" },
  { feature: "Jogos Especiais/mês", bronze: "0", prata: "0", ouro: "4", diamante: "6", rubi: "10", onix: "Ilimitado" },
  { feature: "IA e Análises", bronze: "Básico", prata: "Sim", ouro: "Avançado", diamante: "Avançada", rubi: "Premium", onix: "Dedicada" },
  { feature: "Suporte", bronze: "Padrão", prata: "Prioritário", ouro: "VIP <2h", diamante: "<1h", rubi: "<30min", onix: "24/7 Dedicado" },
  { feature: "Grupo Exclusivo", bronze: "Não", prata: "Não", ouro: "Sim", diamante: "Diamante", rubi: "Rubi VIP", onix: "Ultra Exclusivo" },
  { feature: "Relatórios", bronze: "Não", prata: "Não", ouro: "Mensal", diamante: "Semanal", rubi: "Semanal", onix: "Diário" },
  { feature: "Taxa Cancelamento", bronze: "20%", prata: "10%", ouro: "Isento", diamante: "Isento", rubi: "Isento", onix: "Isento" },
];

export default function ClubeVIP() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { isLoggedIn } = useAuth();

  // Get active plans to show in comparison (sem Gratuito)
  const activePlans = plans.filter(plan => plan.id !== "free");
  
  // Get plan columns for comparison table (apenas planos VIP)
  const planColumns = activePlans.map(plan => ({
    id: plan.id,
    name: plan.name,
    color: plan.textColor,
    bgColor: plan.bgGlow,
    badge: plan.badge,
    badgeColor: plan.badgeColor,
  }));

  const handleSubscribe = (planId: string) => {
    if (isLoggedIn) {
      window.location.href = `/minha-conta?tab=assinatura&plan=${planId}`;
    } else {
      window.location.href = `/login?returnUrl=/clube-vip`;
    }
  };

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Clube VIP"
        description="Seja membro VIP do BolãoMax e aproveite benefícios exclusivos: descontos, participação automática e prioridade nos bolões."
        keywords={["clube vip loteria", "assinatura bolão", "benefícios vip", "desconto bolão", "vip bolãomax"]}
        pageType="vip"
        canonicalUrl="https://bolaomax.com.br/clube-vip"
      />
      <Header activePage="clube-vip" />
      
      <main>
        {/* Hero Section - Task 201 */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Premium background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-bolao-dark to-amber-900/20" />
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          </div>
          
          {/* Floating sparkles */}
          <div className="absolute top-1/4 left-[10%] w-3 h-3 bg-amber-400 rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 right-[15%] w-2 h-2 bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-[20%] w-4 h-4 bg-amber-500 rounded-full animate-float opacity-30" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-[10%] w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-50" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-1/4 right-[25%] w-3 h-3 bg-yellow-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* VIP Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 mb-8 animate-slide-in-up">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-amber-400 tracking-wide">ACESSO EXCLUSIVO</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-slide-in-up stagger-1">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Clube VIP
              </span>
              <br />
              <span className="text-white">BolãoMax</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-in-up stagger-2">
              Maximize suas chances com acesso exclusivo a{" "}
              <span className="text-amber-400 font-semibold">mais bolões</span>,{" "}
              <span className="text-purple-400 font-semibold">estratégias premium</span> e{" "}
              <span className="text-cyan-400 font-semibold">jogos especiais</span>.
            </p>

            {/* Key stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 animate-slide-in-up stagger-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <Ticket className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-amber-400">12+</p>
                <p className="text-xs text-muted-foreground">bolões/semana</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-purple-400">6x</p>
                <p className="text-xs text-muted-foreground">mais chances</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
                <Star className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-cyan-400">4</p>
                <p className="text-xs text-muted-foreground">jogos especiais/mês</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <Trophy className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-extrabold text-emerald-400">R$ 850k+</p>
                <p className="text-xs text-muted-foreground">em prêmios VIP</p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-bolao-dark font-bold text-lg px-10 h-14 shadow-lg shadow-amber-500/25 animate-slide-in-up stagger-4"
            >
              <Crown className="w-5 h-5 mr-2" />
              Ver Planos VIP
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 animate-slide-in-up stagger-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Garantia de 7 dias</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat className="w-4 h-4 text-amber-400" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section - Task 202 */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm font-semibold mb-4">
                <Gem className="w-4 h-4" />
                Benefícios Exclusivos
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Por que ser{" "}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">VIP</span>?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Vantagens exclusivas que maximizam suas chances de ganhar na loteria
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="relative p-6 bg-bolao-card/40 border-bolao-card-border card-hover group overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl transition-opacity group-hover:opacity-20" 
                    style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                  />
                  
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.color} mb-4`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {benefit.description}
                  </p>
                  
                  <Badge className={`bg-gradient-to-r ${benefit.color} text-white border-0`}>
                    {benefit.highlight}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Section - Task 203 */}
        <section id="plans" className="relative py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm font-semibold mb-4">
                <Crown className="w-4 h-4" />
                Escolha seu Plano
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Planos{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">VIP</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Escolha o plano ideal para você e comece a receber bolões automaticamente
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-4 p-1.5 rounded-xl bg-bolao-card border border-bolao-card-border">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-bolao-green text-bolao-dark"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    billingPeriod === "annual"
                      ? "bg-bolao-green text-bolao-dark"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Anual
                  <Badge className="bg-amber-500 text-bolao-dark text-xs font-bold">-20%</Badge>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={plan.id}
                  className={`relative p-6 lg:p-8 bg-gradient-to-br transition-all hover:scale-[1.02] overflow-hidden group ${
                    plan.id === "ouro" 
                      ? "border-2 border-amber-500/50 from-amber-500/15 to-yellow-500/10" 
                      : plan.id === "prata"
                      ? "border-2 border-cyan-500/40 from-cyan-500/15 to-blue-600/10"
                      : plan.id === "diamante"
                      ? "border-2 border-violet-500/40 from-violet-500/15 to-purple-600/10"
                      : plan.id === "rubi"
                      ? "border-2 border-red-500/40 from-red-500/15 to-rose-600/10"
                      : plan.id === "onix"
                      ? "border-2 border-slate-600/40 from-slate-600/15 to-black/10"
                      : "border-2 border-amber-700/40 from-amber-700/15 to-amber-900/10"
                  }`}
                >
                  {/* Glow effect */}
                  {(plan.id === "ouro" || plan.id === "prata" || plan.id === "diamante" || plan.id === "rubi" || plan.id === "onix" || plan.id === "bronze") && (
                    <div 
                      className={`absolute -inset-px rounded-xl bg-gradient-to-r blur-md opacity-40 group-hover:opacity-60 transition-opacity ${
                        plan.id === "ouro"
                          ? "from-amber-500/30 via-yellow-500/30 to-amber-500/30"
                          : plan.id === "prata"
                          ? "from-cyan-500/30 via-blue-600/30 to-cyan-500/30"
                          : plan.id === "diamante"
                          ? "from-violet-500/30 via-purple-600/30 to-violet-500/30"
                          : plan.id === "rubi"
                          ? "from-red-500/30 via-rose-600/30 to-red-500/30"
                          : plan.id === "onix"
                          ? "from-slate-600/30 via-black/30 to-slate-600/30"
                          : "from-amber-700/30 via-amber-900/30 to-amber-700/30"
                      }`}
                    />
                  )}

                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className={`${plan.badgeColor} text-white font-bold px-4 py-1`}>
                        {plan.badge}
                      </Badge>
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Plan header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${plan.color} mb-4 shadow-lg`}>
                        <plan.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      
                      {/* Pricing */}
                      <div className="mb-2">
                        {billingPeriod === "monthly" ? (
                          <>
                            <span className="text-4xl font-extrabold">
                              R$ {plan.monthlyPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-muted-foreground">/mês</span>
                          </>
                        ) : (
                          <>
                            <span className="text-4xl font-extrabold text-bolao-green">
                              R$ {plan.annualMonthly.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-muted-foreground">/mês</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="line-through">R$ {(plan.monthlyPrice * 12).toFixed(2).replace(".", ",")}</span>
                              {" "}
                              <span className="text-bolao-green font-semibold">
                                R$ {plan.annualPrice.toFixed(2).replace(".", ",")} /ano
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bolões summary */}
                    <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-bolao-dark/50">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-400">{plan.boloes.lotofacil}</p>
                        <p className="text-xs text-muted-foreground">Lotofácil/sem</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-400">{plan.boloes.megasena}</p>
                        <p className="text-xs text-muted-foreground">Mega-Sena/sem</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-sky-400">{plan.boloes.quina}</p>
                        <p className="text-xs text-muted-foreground">Quina/sem</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-400">{plan.boloes.especiais}</p>
                        <p className="text-xs text-muted-foreground">Especiais/mês</p>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${feature.highlight ? plan.textColor : "text-bolao-green"}`} />
                          ) : (
                            <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${feature.included ? (feature.highlight ? `${plan.textColor} font-semibold` : "text-white") : "text-muted-foreground/50"}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      className={`w-full h-12 font-bold text-base transition-all hover:shadow-lg ${
                        plan.id === "ouro"
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-bolao-dark shadow-md shadow-amber-500/30"
                          : plan.id === "prata"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md shadow-cyan-500/30"
                          : plan.id === "diamante"
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md shadow-violet-500/30"
                          : plan.id === "rubi"
                          ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/30"
                          : plan.id === "onix"
                          ? "bg-gradient-to-r from-slate-600 to-black hover:from-slate-700 hover:to-slate-900 text-white shadow-md shadow-slate-600/30"
                          : "bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-black text-white shadow-md shadow-amber-700/30"
                      }`}
                    >
                      Assinar {plan.name}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table - Task 204 */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-semibold mb-4">
                <BarChart3 className="w-4 h-4" />
                Comparativo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Compare os{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Planos</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Veja todas as diferenças entre os planos em detalhe
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-bolao-card-border">
              <table className="w-full">
                <thead>
                  <tr className="bg-bolao-card">
                    <th className="p-4 text-left font-semibold text-muted-foreground">Recurso</th>
                    {planColumns.map((column) => (
                      <th
                        key={column.id}
                        className={`p-4 text-center font-semibold ${column.color} ${
                          column.id !== "free" ? column.bgColor : ""
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {column.badge && column.id !== "free" && (
                            <Badge
                              className={`${column.badgeColor} text-white mb-1`}
                            >
                              {column.badge}
                            </Badge>
                          )}
                          {column.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-bolao-card/30" : "bg-bolao-card/10"}>
                      <td className="p-4 font-medium">{row.feature}</td>
                      {planColumns.map((column) => (
                        <td
                          key={`${index}-${column.id}`}
                          className={`p-4 text-center ${
                            column.id !== "free" ? `${column.bgColor} ${column.color}` : "text-muted-foreground"
                          } ${column.id === "prata" ? "font-semibold" : ""} ${
                            column.id === "ouro" ? "font-bold" : ""
                          }`}
                        >
                          {(row as any)[column.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid grid-cols-1 gap-4">
              {comparisonFeatures.map((row, index) => (
                <Card key={index} className="p-4 bg-bolao-card/40 border-bolao-card-border">
                  <p className="font-semibold mb-3">{row.feature}</p>
                  <div className={`grid gap-2 text-sm`} style={{ gridTemplateColumns: `repeat(${planColumns.length}, 1fr)` }}>
                    {planColumns.map((column) => (
                      <div key={`${index}-${column.id}`} className="text-center">
                        <p className={`text-xs mb-1 ${column.id !== "free" ? column.color : "text-muted-foreground"}`}>
                          {column.name}
                        </p>
                        <p className={column.id !== "free" ? column.color : "text-muted-foreground"}>
                          {(row as any)[column.id]}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works - Task 205 */}
        <section className="relative py-20 lg:py-28">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/10 to-transparent" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-4">
                <Zap className="w-4 h-4" />
                Como Funciona
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Simples e{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Automático</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Assine uma vez e receba seus bolões automaticamente toda semana
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-bolao-card-border to-transparent" />
                  )}
                  
                  <Card className="relative p-6 bg-bolao-card/40 border-bolao-card-border h-full">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-bolao-dark border-2 border-bolao-card-border flex items-center justify-center">
                      <span className="text-sm font-bold text-bolao-green">{step.number}</span>
                    </div>
                    
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} mb-4`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>

            {/* Additional info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 bg-bolao-card/30 border-bolao-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <Repeat className="w-5 h-5 text-bolao-green" />
                  <h4 className="font-semibold">Renovação Automática</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura renova automaticamente. Cancele quando quiser, sem burocracia.
                </p>
              </Card>
              <Card className="p-5 bg-bolao-card/30 border-bolao-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold">Distribuição às Segundas</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bolões são distribuídos toda segunda-feira para os sorteios da semana.
                </p>
              </Card>
              <Card className="p-5 bg-bolao-card/30 border-bolao-card-border">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold">Upgrade a Qualquer Momento</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mude de plano quando quiser. O valor é calculado proporcionalmente.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section - Task 206 */}
        <section className="relative py-20 lg:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-sm font-semibold mb-4">
                <MessageCircle className="w-4 h-4" />
                Dúvidas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Perguntas{" "}
                <span className="bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">Frequentes</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Tudo que você precisa saber sobre o Clube VIP
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="bg-bolao-card/40 border-bolao-card-border overflow-hidden"
                >
                  <button
                    className="w-full p-5 text-left flex items-center justify-between"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <span className="font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-bolao-green flex-shrink-0 transition-transform ${
                        openFaqIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-5 pb-5">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Ainda tem dúvidas?</p>
              <Link href="/suporte">
                <Button variant="outline" className="border-bolao-card-border hover:bg-bolao-card">
                  <Headphones className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Task 207 */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-bolao-dark to-amber-900/20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-amber-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                  Pronto para{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Maximizar
                  </span>
                  {" "}suas Chances?
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Junte-se a mais de <span className="text-amber-400 font-semibold">500+ membros VIP</span> que já ganharam{" "}
                  <span className="text-bolao-green font-semibold">R$ 850.000+</span> em prêmios!
                </p>

                {/* Limited offer */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-bolao-green/10 border border-bolao-green/30 mb-8">
                  <Timer className="w-5 h-5 text-bolao-green" />
                  <span className="text-sm font-semibold text-bolao-green">
                    🔥 Primeiro mês com 10% de desconto usando código: VIP10
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <Button
                    size="lg"
                    onClick={() => handleSubscribe("ouro")}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-bolao-dark font-bold text-lg px-10 h-14 shadow-lg shadow-amber-500/25"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Assinar Plano Ouro
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleSubscribe("prata")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg px-10 h-14"
                  >
                    Assinar Plano Prata
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleSubscribe("bronze")}
                    variant="outline"
                    className="border-bolao-card-border hover:bg-bolao-card font-bold text-lg px-10 h-14"
                  >
                    Plano Bronze
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-bolao-green" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="w-4 h-4 text-bolao-green" />
                    <span>Garantia de 7 dias</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Repeat className="w-4 h-4 text-bolao-green" />
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer activePage="clube-vip" />
      <WhatsAppButton />
    </div>
  );
}
