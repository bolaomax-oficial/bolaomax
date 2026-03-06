import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Sparkles,
  Trophy,
  ChevronRight,
  Shield,
  Target,
  Eye,
  Users,
  TrendingUp,
  Heart,
  Lightbulb,
  Rocket,
  CheckCircle2,
  FileText,
  Lock,
  Headphones,
  Building2,
  Award,
  Zap,
  Globe,
  Calendar,
  Star,
  PartyPopper,
  Gift,
  BadgeCheck,
  Code2,
  Wallet,
  BarChart3,
} from "lucide-react";

// Mission, Vision, Values data
const missionVisionValues = [
  {
    icon: Target,
    title: "Missão",
    description: "Democratizar o acesso a bolões de loteria com tecnologia e transparência, permitindo que qualquer pessoa participe de apostas coletivas de forma segura e acessível.",
    color: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: Eye,
    title: "Visão",
    description: "Ser a maior e mais confiável plataforma de bolões do Brasil, transformando a forma como milhões de brasileiros participam de loterias.",
    color: "from-sky-500 to-cyan-600",
    bgGlow: "bg-sky-500/20",
  },
  {
    icon: Heart,
    title: "Valores",
    description: "Transparência, Inovação, Confiança, Acessibilidade e Comunidade. Estes pilares guiam cada decisão e funcionalidade que desenvolvemos.",
    color: "from-violet-500 to-purple-600",
    bgGlow: "bg-violet-500/20",
  },
];

// Problems data
const problems = [
  {
    icon: FileText,
    title: "Planilhas Confusas",
    description: "Controlar participantes, valores e números em planilhas complexas é difícil e propenso a erros.",
  },
  {
    icon: Eye,
    title: "Falta de Transparência",
    description: "Participantes nunca sabem exatamente quais números foram jogados ou como os prêmios serão divididos.",
  },
  {
    icon: Wallet,
    title: "Valores Altos",
    description: "Bolões tradicionais exigem investimentos mínimos altos, excluindo muitas pessoas.",
  },
  {
    icon: BarChart3,
    title: "Cálculos Manuais",
    description: "Dividir prêmios proporcionalmente entre dezenas de participantes é um processo trabalhoso e sujeito a erros.",
  },
];

// Solution pillars data
const solutionPillars = [
  {
    icon: Code2,
    title: "Tecnologia",
    description: "Plataforma moderna com automação completa de cálculos, divisões e notificações em tempo real.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    icon: Eye,
    title: "Transparência",
    description: "Visualize todos os jogos antes de participar. Acompanhe resultados e divisões em tempo real.",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
  },
  {
    icon: Users,
    title: "Acessibilidade",
    description: "Participe com valores a partir de R$ 20. Bolões de todos os tamanhos ao alcance de todos.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Dados criptografados, pagamentos seguros via PIX e garantia total de recebimento de prêmios.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
];

// Stats data
const stats = [
  { value: "15.847+", label: "Usuários Ativos", icon: Users, color: "text-emerald-400" },
  { value: "201+", label: "Bolões Realizados", icon: Trophy, color: "text-sky-400" },
  { value: "R$ 287.456", label: "Distribuídos em Prêmios", icon: Gift, color: "text-violet-400" },
  { value: "98%", label: "Taxa de Satisfação", icon: Star, color: "text-amber-400" },
];

// Commitment cards data
const commitments = [
  {
    icon: BadgeCheck,
    title: "Conformidade Legal",
    description: "Operamos em total conformidade com a legislação brasileira de loterias.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Lock,
    title: "LGPD",
    description: "Seus dados são tratados com máxima segurança, seguindo a Lei Geral de Proteção de Dados.",
    color: "from-blue-500 to-sky-600",
  },
  {
    icon: Shield,
    title: "Segurança de Dados",
    description: "Criptografia de ponta a ponta e infraestrutura robusta para proteger suas informações.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Headphones,
    title: "Suporte Dedicado",
    description: "Equipe pronta para ajudar via chat, email e WhatsApp de segunda a sexta.",
    color: "from-orange-500 to-amber-600",
  },
];

// Timeline data
const timelineMilestones = [
  {
    year: "2023",
    month: "Janeiro",
    title: "A Ideia Nasce",
    description: "Identificamos os problemas dos bolões tradicionais e começamos a desenvolver a solução.",
    icon: Lightbulb,
    color: "bg-emerald-500",
  },
  {
    year: "2023",
    month: "Junho",
    title: "Desenvolvimento Iniciado",
    description: "Equipe de desenvolvedores e designers começaram a construir a plataforma.",
    icon: Code2,
    color: "bg-sky-500",
  },
  {
    year: "2024",
    month: "Janeiro",
    title: "Lançamento Beta",
    description: "Primeiros usuários começaram a testar a plataforma com bolões reais.",
    icon: Rocket,
    color: "bg-violet-500",
  },
  {
    year: "2024",
    month: "Março",
    title: "Primeiro Grande Prêmio",
    description: "Um de nossos bolões acertou a quina da Mega-Sena, distribuindo mais de R$ 50.000.",
    icon: Trophy,
    color: "bg-amber-500",
  },
  {
    year: "2024",
    month: "Agosto",
    title: "10.000 Usuários",
    description: "Alcançamos a marca de 10.000 usuários cadastrados na plataforma.",
    icon: Users,
    color: "bg-pink-500",
  },
  {
    year: "2025",
    month: "Atual",
    title: "Crescimento Acelerado",
    description: "Mais de 15.000 usuários ativos e centenas de bolões realizados todo mês.",
    icon: TrendingUp,
    color: "bg-bolao-green",
  },
];

// Team highlights
const teamHighlights = [
  { icon: Building2, label: "Experiência em Fintech" },
  { icon: Code2, label: "Desenvolvedores Sênior" },
  { icon: Shield, label: "Especialistas em Segurança" },
  { icon: Heart, label: "Apaixonados por Inovação" },
];

export default function SobreNos() {
  const { isOpen, openModal, closeModal } = useLotteryModal();

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="sobre-nos" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          {/* Floating elements */}
          <div className="absolute top-1/4 left-[10%] w-3 h-3 bg-bolao-green rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 right-[15%] w-2 h-2 bg-sky-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/3 left-[20%] w-4 h-4 bg-violet-400 rounded-full animate-float opacity-30" style={{ animationDelay: "2s" }} />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Building2 className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Nossa Empresa</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Sobre <span className="gradient-text">Nós</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Conheça a história e missão do BolãoMax
            </p>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              Somos uma equipe apaixonada por tecnologia e inovação, comprometida em transformar 
              a forma como os brasileiros participam de bolões de loteria.
            </p>

            {/* Hero illustration - Team icon grid */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center glow-green">
                <Sparkles className="w-10 h-10 text-bolao-dark" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30 flex items-center justify-center">
                <Heart className="w-8 h-8 text-sky-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Nossa História Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                  Nossa História
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                  De uma ideia simples a uma <span className="gradient-text">revolução</span>
                </h2>
                
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    O BolãoMax nasceu em 2023 de uma frustração comum: organizar bolões de loteria 
                    entre amigos e família era sempre uma tarefa complicada. Planilhas confusas, 
                    dificuldade em coletar dinheiro, falta de transparência sobre os números jogados.
                  </p>
                  <p>
                    Percebemos que milhões de brasileiros enfrentavam o mesmo problema. Muitos 
                    queriam participar de bolões maiores, com mais chances de ganhar, mas não 
                    tinham como organizar ou encontrar grupos confiáveis.
                  </p>
                  <p>
                    Foi então que decidimos criar uma plataforma que resolvesse todos esses 
                    problemas de uma vez. Uma solução 100% digital, transparente e acessível, 
                    onde qualquer pessoa pudesse participar de bolões de qualquer tamanho, 
                    com valores que cabem no bolso.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <Card className="p-8 bg-gradient-to-br from-bolao-card to-bolao-card/50 border-bolao-card-border overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-bolao-green/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                        <Lightbulb className="w-7 h-7 text-bolao-dark" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">O Problema</h3>
                        <p className="text-sm text-muted-foreground">Que identificamos</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-bolao-green mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Falta de confiança em organizadores de bolões</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-bolao-green mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Dificuldade em participar de bolões grandes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-bolao-green mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Controle manual e propenso a erros</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-bolao-green mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Distribuição de prêmios trabalhosa</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Missão, Visão e Valores Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Nossos Pilares
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Missão, Visão e <span className="gradient-text">Valores</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missionVisionValues.map((item, index) => (
                <Card
                  key={index}
                  className="p-8 bg-bolao-card/60 border-bolao-card-border card-hover group overflow-hidden relative"
                >
                  <div className={`absolute -top-12 -right-12 w-32 h-32 ${item.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-5 shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Values pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {["Transparência", "Inovação", "Confiança", "Acessibilidade", "Comunidade"].map((value, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border text-sm font-medium text-muted-foreground hover:text-white hover:border-bolao-green/50 transition-colors"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* O Problema que Resolvemos Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-semibold mb-4">
                O Desafio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                O Problema que <span className="text-red-400">Resolvemos</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Organizadores e participantes de bolões tradicionais enfrentam dificuldades que atrapalham a experiência
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {problems.map((problem, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border border-l-4 border-l-red-500/50"
                >
                  <div className="inline-flex p-3 rounded-xl bg-red-500/10 text-red-400 mb-4">
                    <problem.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Nossa Solução Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Nossa Solução
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                4 Pilares que fazem a <span className="gradient-text">diferença</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutionPillars.map((pillar, index) => (
                <Card
                  key={index}
                  className={`p-6 bg-bolao-card/40 ${pillar.borderColor} border card-hover text-center`}
                >
                  <div className={`inline-flex p-4 rounded-xl ${pillar.bgColor} ${pillar.color} mb-4`}>
                    <pillar.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Por Trás do BolãoMax Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <Card className="p-8 bg-gradient-to-br from-bolao-card to-bolao-dark/50 border-bolao-card-border">
                  <div className="grid grid-cols-2 gap-4">
                    {teamHighlights.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-center"
                      >
                        <item.icon className="w-8 h-8 text-bolao-green mx-auto mb-2" />
                        <p className="text-sm font-medium">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Team avatars placeholder */}
                  <div className="flex justify-center items-center gap-3 mt-6 pt-6 border-t border-bolao-card-border">
                    <div className="flex -space-x-3">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-bolao-green/30 to-bolao-green-dark/30 border-2 border-bolao-dark flex items-center justify-center text-bolao-green text-sm font-bold"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">+12 membros</span>
                  </div>
                </Card>
              </div>
              
              <div className="order-1 lg:order-2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                  Nossa Equipe
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                  Por Trás do <span className="gradient-text">BolãoMax</span>
                </h2>
                
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Somos uma equipe multidisciplinar de desenvolvedores, designers e especialistas 
                    em fintech com anos de experiência no mercado de tecnologia.
                  </p>
                  <p>
                    Nosso time combina expertise técnica com paixão por inovação, sempre buscando 
                    criar as melhores soluções para nossos usuários.
                  </p>
                  <p>
                    Acreditamos que a tecnologia deve servir para democratizar oportunidades, e é 
                    isso que fazemos todos os dias no BolãoMax.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Números que Contam Nossa História Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-bolao-card/30 via-transparent to-bolao-card/30" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Em Números
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Números que Contam Nossa <span className="gradient-text">História</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/60 border-bolao-card-border text-center card-hover"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-bolao-dark/50 ${stat.color} mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Nosso Compromisso Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Compromisso
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Nosso <span className="gradient-text">Compromisso</span> com Você
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Trabalhamos todos os dias para garantir a melhor experiência possível
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {commitments.map((commitment, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border card-hover group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${commitment.color} mb-4 shadow-lg`}>
                      <commitment.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{commitment.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {commitment.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-20" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Nossa Jornada
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Marcos <span className="gradient-text">Importantes</span>
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-bolao-green via-bolao-card-border to-bolao-card-border" />
              
              <div className="space-y-8">
                {timelineMilestones.map((milestone, index) => (
                  <div key={index} className="relative pl-20">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 top-2 w-5 h-5 rounded-full ${milestone.color} border-4 border-bolao-dark`} />
                    
                    <Card className="p-6 bg-bolao-card/40 border-bolao-card-border hover:border-bolao-green/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${milestone.color}/20`}>
                          <milestone.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-bolao-green">{milestone.year}</span>
                            <span className="text-xs text-muted-foreground">• {milestone.month}</span>
                          </div>
                          <h3 className="text-lg font-bold mb-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-bolao-green/10 mb-6">
              <PartyPopper className="w-10 h-10 text-bolao-green" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
              Faça Parte Dessa <span className="gradient-text">História</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Junte-se a milhares de brasileiros que já descobriram uma nova forma de participar de bolões. 
              Sua sorte pode estar a um clique de distância.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="bg-bolao-green hover:bg-bolao-green-dark text-white font-bold text-lg px-8 h-14 glow-green"
                >
                  Criar Minha Conta
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Button
                size="lg"
                onClick={openModal}
                className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold text-lg px-8 h-14 glow-orange hover:glow-orange-intense transition-all"
              >
                Ver Bolões Disponíveis
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-bolao-green" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-bolao-green" />
                <span>Cadastro Gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 text-bolao-green" />
                <span>+15.000 Usuários</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer activePage="sobre-nos" />
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
      <WhatsAppButton />
    </div>
  );
}
