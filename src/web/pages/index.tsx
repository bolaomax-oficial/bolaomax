import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEOHead } from "@/components/SEOHead";
import { useTestimonials } from "@/contexts/TestimonialContext";
import {
  TrendingUp,
  Users,
  Trophy,
  Sparkles,
  ChevronRight,
  Wallet,
  Clock,
  Shield,
  BarChart3,
  Star,
  Zap,
  Gift,
  Target,
  CreditCard,
  Search,
  ArrowRight,
  Crown,
  Calendar,
  Bell,
  MapPin,
} from "lucide-react";

interface HeroSectionProps {
  onOpenLotteryModal: () => void;
}

const HeroSection = ({ onOpenLotteryModal }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 radial-gradient" />
      
      <div className="absolute top-1/4 left-[10%] w-3 h-3 bg-bolao-green rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-[15%] w-2 h-2 bg-bolao-green-light rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/4 left-[20%] w-4 h-4 bg-bolao-gold rounded-full animate-float opacity-30" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-[10%] w-2 h-2 bg-bolao-orange rounded-full animate-float opacity-50" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-8 animate-slide-in-up">
          <div className="w-2 h-2 bg-bolao-green rounded-full animate-live-pulse" />
          <span className="text-sm font-medium text-muted-foreground">Mais de 700+ apostadores ativos</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 animate-slide-in-up stagger-1">
          Participe de bolões
          <br />
          <span className="gradient-text">maiores com pouco</span>
          <br />
          investimento
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-in-up stagger-2">
          Aumente suas chances de ganhar na loteria participando de bolões coletivos. 
          Invista pouco, concorra a muito e divida o sonho com milhares de apostadores.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up stagger-3">
          <Button
            size="lg"
            onClick={onOpenLotteryModal}
            className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold text-lg px-8 h-14 glow-orange hover:glow-orange-intense transition-all"
          >
            Ver Bolões Disponíveis
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <Link href="/como-funciona">
            <Button
              size="lg"
              className="bg-bolao-green-dark hover:bg-bolao-green text-white font-bold text-lg px-8 h-14 glow-green hover:glow-green-intense transition-all"
            >
              Conhecer as Cotas
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-slide-in-up stagger-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-bolao-green" />
            <span>100% Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-bolao-green" />
            <span>Pagamento Instantâneo</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-bolao-green" />
            <span>Milhões Distribuídos</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  const stats = [
    { icon: Gift, value: "R$ 1.328,14", label: "Distribuídos em Prêmios", color: "text-bolao-green" },
    { icon: Users, value: "739+", label: "Apostadores Ativos", color: "text-bolao-gold" },
    { icon: Target, value: "201+", label: "Bolões Realizados", color: "text-bolao-orange" },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bolao-card/30 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative p-8 bg-bolao-card/60 border-bolao-card-border backdrop-blur-sm card-hover overflow-hidden group" style={{ borderColor: "#00d166" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-bolao-dark/50 mb-4 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

interface Sorteio {
  id: string;
  tipo: string;
  numero: number;
  data: string;
  hora: string;
  dia_semana: string;
  cor: string;
  badge?: string;
  destaque?: boolean;
  descricao?: string;
}

const LOTERIAS_INFO: Record<string, { nome: string; icone: string; cor: string }> = {
  megasena: { nome: "Mega-Sena", icone: "🎰", cor: "#10B981" },
  lotofacil: { nome: "Lotofácil", icone: "✨", cor: "#8B5CF6" },
  quina: { nome: "Quina", icone: "⭐", cor: "#0EA5E9" },
  lotomania: { nome: "Lotomania", icone: "🎲", cor: "#F97316" },
  duplasena: { nome: "Dupla Sena", icone: "🔄", cor: "#A855F7" },
  timemania: { nome: "Timemania", icone: "⚽", cor: "#10B981" },
  diadesorte: { nome: "Dia de Sorte", icone: "☀️", cor: "#F59E0B" },
  supersete: { nome: "Super Sete", icone: "💎", cor: "#EC4899" },
  federal: { nome: "Federal", icone: "🏆", cor: "#3B82F6" },
};

const UpcomingDrawsSection = () => {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSorteios = async () => {
      try {
        const res = await fetch("/api/sorteios/proximos?dias=7");
        const data = await res.json();
        setSorteios(data.data?.slice(0, 6) || []);
      } catch (error) {
        console.error("Erro ao carregar sorteios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSorteios();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bolao-green/5 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
              <Calendar className="w-4 h-4" />
              Calendário de Sorteios
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
              Próximos <span className="gradient-text">Sorteios</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg">
              Acompanhe os sorteios da semana e não perca a chance de participar
            </p>
          </div>
          <Link href="/calendar">
            <Button
              size="lg"
              className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold gap-2"
            >
              <Calendar className="w-5 h-5" />
              Ver Calendário Completo
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-bolao-green"></div>
            </div>
            <p className="text-muted-foreground mt-4">Carregando sorteios...</p>
          </div>
        ) : sorteios.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum sorteio nos próximos dias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorteios.map((sorteio) => {
              const info = LOTERIAS_INFO[sorteio.tipo] || { nome: sorteio.tipo, icone: "🎯", cor: "#6B7280" };
              return (
                <Card
                  key={sorteio.id}
                  className="group relative overflow-hidden bg-bolao-card/60 border-bolao-card-border backdrop-blur-sm card-hover"
                >
                  {/* Colored top border */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: info.cor }}
                  />
                  
                  {/* Special badge */}
                  {sorteio.destaque && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        ⭐ {sorteio.descricao || "ESPECIAL"}
                      </span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: info.cor + "20" }}
                      >
                        {info.icone}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: info.cor }}>
                          {info.nome}
                        </h3>
                        <p className="text-sm text-muted-foreground">Concurso {sorteio.numero}</p>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-bolao-green" />
                        <span className="text-sm">
                          {new Date(sorteio.data + "T12:00:00").toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-bolao-green" />
                        <span className="text-sm">{sorteio.hora}</span>
                      </div>
                    </div>
                    
                    {/* Badge */}
                    {sorteio.badge && (
                      <div className="mb-4">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: info.cor + "20", color: info.cor }}
                        >
                          {sorteio.badge === "Hoje" && "🔴 "}{sorteio.badge}
                        </span>
                      </div>
                    )}
                    
                    {/* Action */}
                    <Button
                      className="w-full bg-bolao-dark/50 hover:bg-bolao-dark border border-bolao-card-border text-white font-medium gap-2 group-hover:border-bolao-green/50 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      Criar Alerta
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Extra CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Exporte o calendário para sua agenda e nunca perca um sorteio
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/api/sorteios/exportar?formato=ics&loterias=megasena,lotofacil,quina"
              download
            >
              <Button variant="outline" className="border-bolao-card-border gap-2">
                📥 Exportar para Agenda (.ics)
              </Button>
            </a>
            <Link href="/calendar">
              <Button variant="outline" className="border-bolao-card-border gap-2">
                <Calendar className="w-4 h-4" />
                Ver Todos os Sorteios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const steps = [
    { number: "01", icon: Search, title: "Escolha seu bolão", description: "Navegue pelos bolões disponíveis e escolha o que mais combina com você. Mega-Sena, Lotofácil ou Quina." },
    { number: "02", icon: BarChart3, title: "Defina sua participação", description: "Decida quanto quer investir. Você pode participar com valores a partir de R$ 20,00." },
    { number: "03", icon: CreditCard, title: "Pagamento seguro", description: "Pague com PIX, cartão de crédito ou boleto. Sua transação é 100% protegida." },
    { number: "04", icon: Trophy, title: "Acompanhe o resultado", description: "Receba notificações em tempo real. Se ganhar, o prêmio é depositado automaticamente." },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">Simples e Rápido</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">Como <span className="gradient-text">Funciona</span></h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Em apenas 4 passos você já está participando dos maiores bolões do Brasil</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative p-6 bg-bolao-card/40 border-bolao-card-border backdrop-blur-sm card-hover group" style={{ borderColor: "#00DB54" }}>
              <div className="absolute top-4 right-4 text-6xl font-extrabold text-bolao-card-border/50 select-none">{step.number}</div>
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-bolao-green/10 text-bolao-green mb-4 group-hover:bg-bolao-green group-hover:text-bolao-dark transition-colors">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-bolao-card-border" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const { getApprovedTestimonials } = useTestimonials();
  const [isPaused, setIsPaused] = useState(false);
  
  // Get approved testimonials from context
  const approvedTestimonials = getApprovedTestimonials();
  
  // Default testimonials if none are approved
  const defaultTestimonials = [
    { 
      id: "default_1",
      userName: "Carlos Silva", 
      userPhoto: "",
      showName: true,
      rating: 5, 
      title: "Experiência incrível!",
      message: "Nunca pensei que fosse tão fácil participar de bolões. Já ganhei duas vezes com a Lotofácil!"
    },
    { 
      id: "default_2",
      userName: "Maria Santos", 
      userPhoto: "",
      showName: true,
      rating: 5, 
      title: "Transparência total",
      message: "A transparência do BolãoMax é incrível. Consigo acompanhar tudo em tempo real pelo app."
    },
    { 
      id: "default_3",
      userName: "João Pereira", 
      userPhoto: "",
      showName: true,
      rating: 5, 
      title: "Pagamento rápido",
      message: "O pagamento via PIX é instantâneo. Assim que o resultado sai, já recebo minha parte."
    },
    { 
      id: "default_4",
      userName: "Ana Oliveira", 
      userPhoto: "",
      showName: true,
      rating: 5, 
      title: "Super recomendo!",
      message: "Participei do meu primeiro bolão e adorei. O processo é muito simples e seguro."
    },
    { 
      id: "default_5",
      userName: "Pedro Costa", 
      userPhoto: "",
      showName: true,
      rating: 5, 
      title: "Atendimento excelente",
      message: "Tive uma dúvida e o suporte me respondeu rapidamente. Muito satisfeito com o serviço."
    },
  ];
  
  // Use approved testimonials or defaults
  const testimonials = approvedTestimonials.length > 0 
    ? approvedTestimonials.map(t => ({
        id: t.id,
        userName: t.showName ? t.userName : "Usuário Anônimo",
        userPhoto: t.userPhoto,
        showName: t.showName,
        rating: t.rating,
        title: t.title,
        message: t.message.length > 150 ? t.message.substring(0, 147) + "..." : t.message,
      }))
    : defaultTestimonials;
  
  // Ensure we have enough items for seamless loop (minimum 5)
  const displayTestimonials = testimonials.length < 5 
    ? [...testimonials, ...testimonials, ...testimonials].slice(0, 15) 
    : testimonials;
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate animation duration based on number of items
  const animationDuration = Math.max(displayTestimonials.length * 6, 40);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bolao-card/20 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-gold/10 text-bolao-gold text-sm font-semibold mb-4">Depoimentos</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">O que nossos <span className="gradient-text">ganhadores</span> dizem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Milhares de pessoas já realizaram o sonho de ganhar na loteria com o BolãoMax</p>
        </div>
        
        {/* Horizontal Scrolling Ticker */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-r from-bolao-dark to-transparent z-10 pointer-events-none" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 lg:w-32 bg-gradient-to-l from-bolao-dark to-transparent z-10 pointer-events-none" />
          
          {/* Ticker Track */}
          <div className="overflow-hidden">
            <div 
              className={`flex gap-6 ${isPaused ? "" : "animate-testimonial-scroll"}`}
              style={{
                animationDuration: `${animationDuration}s`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {/* Duplicate testimonials for seamless loop */}
              {[...displayTestimonials, ...displayTestimonials].map((testimonial, index) => (
                <div 
                  key={`${testimonial.id}-${index}`}
                  className="flex-shrink-0 w-[320px] sm:w-[380px]"
                >
                  <Card className="relative p-5 sm:p-6 bg-bolao-card/40 border-bolao-card-border backdrop-blur-sm h-full transition-all hover:bg-bolao-card/60 hover:border-bolao-green/30">
                    {/* Header: Stars + Title */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Star Rating */}
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < testimonial.rating ? "fill-bolao-gold text-bolao-gold" : "text-muted-foreground/30"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Title */}
                    {testimonial.title && (
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-white line-clamp-1">
                        "{testimonial.title}"
                      </h3>
                    )}
                    
                    {/* Message */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                      {testimonial.message}
                    </p>
                    
                    {/* User Info */}
                    <div className="flex items-center gap-3 mt-auto pt-3 border-t border-bolao-card-border/50">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center text-xs font-bold text-bolao-dark">
                        {getInitials(testimonial.userName)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white">{testimonial.userName}</div>
                        <div className="text-xs text-muted-foreground">Participante BolãoMax</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="flex justify-center mt-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-bolao-gold animate-pulse" />
              Pausado - mova o mouse para continuar
            </span>
          </div>
        )}
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes testimonial-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-testimonial-scroll {
          animation: testimonial-scroll linear infinite;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

interface CTASectionProps {
  onOpenLotteryModal: () => void;
}

const CTASection = ({ onOpenLotteryModal }: CTASectionProps) => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 radial-gradient" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex p-4 rounded-2xl bg-bolao-green/10 mb-6">
          <Sparkles className="w-8 h-8 text-bolao-green" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">Pronto para mudar sua <span className="gradient-text">vida</span>?</h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Crie sua conta gratuitamente e comece a participar dos maiores bolões do Brasil. 
          Seu próximo grande prêmio pode estar a um clique de distância.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/cadastro">
            <Button size="lg" className="bg-bolao-green hover:bg-bolao-green-dark text-white font-bold text-lg px-10 h-14 glow-green hover:glow-green-intense transition-all">
              Criar Conta Grátis
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Button size="lg" onClick={onOpenLotteryModal} className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold text-lg px-10 h-14 glow-orange hover:glow-orange-intense transition-all">
            Ver Bolões
          </Button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-bolao-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-bolao-dark" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">Bolão<span className="text-bolao-green">Max</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">A maior plataforma de bolões do Brasil. Participe, compartilhe e ganhe junto com milhares de apostadores.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Loterias</h4>
            <ul className="space-y-2">
              <li><Link href="/lotofacil" className="text-sm text-muted-foreground hover:text-white transition-colors">Lotofácil</Link></li>
              <li><Link href="/megasena" className="text-sm text-muted-foreground hover:text-white transition-colors">Mega-Sena</Link></li>
              <li><Link href="/quina" className="text-sm text-muted-foreground hover:text-white transition-colors">Quina</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Institucional</h4>
            <ul className="space-y-2">
              <li><Link href="/como-funciona" className="text-sm text-muted-foreground hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link href="/sobre-nos" className="text-sm text-muted-foreground hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/perguntas-frequentes" className="text-sm text-muted-foreground hover:text-white transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/suporte" className="text-sm text-muted-foreground hover:text-white transition-colors">Contato</Link></li>
              <li>
                <Link href="/clube-vip" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent hover:from-amber-300 hover:to-yellow-400">
                  <Crown className="w-4 h-4 text-amber-400" />
                  Clube VIP
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/politica-privacidade" className="text-sm text-muted-foreground hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/politica-reembolso" className="text-sm text-muted-foreground hover:text-white transition-colors">Política de Reembolso</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-bolao-card-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 BolãoMax. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-bolao-green" />
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-bolao-green" />
              <span>Atendimento 24h</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LiveActivityWidget = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const liveStats = [
    { label: "Distribuído", value: "R$ 1.328,14", icon: Gift, color: "text-bolao-green" },
    { label: "Apostadores", value: "739+", icon: Users, color: "text-bolao-gold" },
    { label: "Bolões", value: "201+", icon: Target, color: "text-bolao-orange" },
    { label: "Ganhadores", value: "156+", icon: Trophy, color: "text-bolao-green-light" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % liveStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed bottom-6 left-6 z-50 live-widget rounded-2xl border border-bolao-card-border shadow-2xl transition-all duration-300 ${isExpanded ? "w-72" : "w-auto"}`}>
      <button className="w-full p-4 flex items-center gap-3" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="relative">
          <div className="w-3 h-3 bg-bolao-green rounded-full animate-live-pulse" />
          <div className="absolute inset-0 w-3 h-3 bg-bolao-green rounded-full animate-ping opacity-30" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ao Vivo</span>
          {!isExpanded && <span className={`font-bold ${liveStats[currentStat].color}`}>{liveStats[currentStat].value}</span>}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {liveStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <span className={`font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Index() {
  const { isOpen, openModal, closeModal } = useLotteryModal();

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <SEOHead 
        pageType="home"
        description="Participe de bolões de loteria online com pouco investimento. Lotofácil, Mega-Sena, Quina e loterias internacionais. Mais de 700 apostadores ativos!"
        keywords={["bolão loteria online", "bolão mega-sena", "bolão lotofácil", "cotas de bolão", "apostas online"]}
        canonicalUrl="https://bolaomax.com.br/"
      />
      <Header activePage="home" transparent />
      <main>
        <HeroSection onOpenLotteryModal={openModal} />
        <StatsSection />
        <UpcomingDrawsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection onOpenLotteryModal={openModal} />
      </main>
      <Footer />
      <LiveActivityWidget />
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
      <WhatsAppButton />
    </div>
  );
}
