import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import {
  Sparkles,
  Trophy,
  ChevronRight,
  Shield,
  Wallet,
  TrendingUp,
  Percent,
  CalendarDays,
  Scale,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Heart,
  Building2,
  GraduationCap,
  Home,
  UserCheck,
  Briefcase,
  PartyPopper,
  AlertCircle,
  Zap,
  Lock,
  Smartphone,
  BadgeCheck,
} from "lucide-react";

// Innovation cards data
const innovationCards = [
  {
    icon: Percent,
    title: "Participe com Baixos Valores",
    description: "Adquira apenas uma fração do bolão. Você decide quanto investir, a partir de valores mínimos muito acessíveis.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Acesso a Bolões de Alto Valor",
    description: "Participe de bolões maiores que normalmente seriam inacessíveis. Quanto maior o bolão, maiores as chances.",
    color: "from-sky-500 to-cyan-600",
  },
  {
    icon: CalendarDays,
    title: "Cotas de Datas Especiais",
    description: "Mega da Virada, Quina de São João, Lotofácil da Independência. Garanta sua cota nos maiores sorteios do ano.",
    color: "from-violet-500 to-purple-600",
  },
];

// Core features data
const coreFeatures = [
  {
    icon: Scale,
    title: "Participação Proporcional",
    description: "Seu prêmio é calculado proporcionalmente à sua participação. Se você tem 10% de um bolão, receberá 10% do prêmio.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Ideal para todos",
    description: "Seja você um apostador casual ou frequente, o BolãoMax se adapta ao seu perfil. Invista pouco ou muito.",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: Eye,
    title: "Transparência Total",
    description: "Visualize os jogos de cada bolão antes de participar. Acompanhe os resultados em tempo real.",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
];

// Benefits data
const benefits = [
  { icon: Zap, title: "Processo Rápido", description: "Cadastre-se em minutos e comece a participar imediatamente." },
  { icon: Lock, title: "Segurança Total", description: "Dados criptografados, pagamentos seguros e prêmios garantidos." },
  { icon: Smartphone, title: "100% Digital", description: "Acesse de qualquer lugar, a qualquer hora." },
  { icon: BadgeCheck, title: "Garantia de Pagamento", description: "Prêmios distribuídos em até 3-5 dias úteis após recebimento da Caixa." },
];

// Comparison data
const comparisonItems = [
  { feature: "Compra de cotas fracionadas", bolaomax: true, tradicional: false },
  { feature: "Participação com valores baixos", bolaomax: true, tradicional: false },
  { feature: "Visualização dos jogos", bolaomax: true, tradicional: false },
  { feature: "Distribuição automática de prêmios", bolaomax: true, tradicional: false },
  { feature: "Acompanhamento online", bolaomax: true, tradicional: false },
  { feature: "Necessidade de organizar pessoalmente", bolaomax: false, tradicional: true },
  { feature: "Risco de perder bilhete físico", bolaomax: false, tradicional: true },
];

// Groups data
const groups = [
  { icon: Building2, title: "Empresas", description: "Organize bolões corporativos para engajar sua equipe.", color: "from-blue-500 to-blue-600" },
  { icon: GraduationCap, title: "Faculdades", description: "Turmas e grêmios podem participar juntos.", color: "from-purple-500 to-purple-600" },
  { icon: Home, title: "Famílias", description: "Reúna a família toda em um único bolão.", color: "from-pink-500 to-pink-600" },
  { icon: Users, title: "Amigos", description: "Grupos de amigos de todas as idades.", color: "from-green-500 to-green-600" },
  { icon: Briefcase, title: "Colegas de Trabalho", description: "Participe com seus colegas de escritório.", color: "from-amber-500 to-amber-600" },
  { icon: PartyPopper, title: "Comunidades", description: "Igrejas, clubes, associações.", color: "from-red-500 to-red-600" },
];

export default function PorQueBolaoMax() {
  const { isOpen, openModal, closeModal } = useLotteryModal();

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="por-que-bolaomax" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Lightbulb className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Entenda nosso diferencial</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Por que usar o{" "}
              <span className="gradient-text">BolãoMax?</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Desenvolvemos o BolãoMax pensando em resolver os principais problemas de quem organiza bolões.
            </p>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-10">
              Uma forma simples de adquirir cotas e participações em bolões maiores, com valores acessíveis.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={openModal}
                className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold text-lg px-8 h-14 glow-orange hover:glow-orange-intense transition-all"
              >
                Ver Bolões Disponíveis
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              <Link href="/como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-bolao-card-border hover:bg-bolao-card text-white font-semibold text-lg px-8 h-14"
                >
                  Como Funciona
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Innovation Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Nossa Inovação
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                O que torna o BolãoMax <span className="gradient-text">único</span>
              </h2>
            </div>

            {/* Featured Card */}
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30 relative overflow-hidden mb-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-bolao-green/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center glow-green">
                    <Percent className="w-12 h-12 text-bolao-dark" />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    Participação acessível para todos
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                    Não é necessário comprar um bolão inteiro. Com o BolãoMax, você adquire apenas uma fração (cota) 
                    do bolão que desejar. Isso permite que você participe de bolões maiores com investimentos menores.
                  </p>
                </div>
              </div>
            </Card>

            {/* Innovation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {innovationCards.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/60 border-bolao-card-border card-hover group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.color} mb-5`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl bg-bolao-card/30 border border-bolao-card-border hover:border-bolao-green/30 transition-colors"
                >
                  <div className={`inline-flex p-5 rounded-2xl ${feature.bgColor} mb-6`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Vantagens
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Benefícios da <span className="gradient-text">plataforma</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border text-center card-hover"
                >
                  <div className="inline-flex p-4 rounded-xl bg-bolao-green/10 text-bolao-green mb-4">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Comparativo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                BolãoMax vs <span className="gradient-text">Bolão Tradicional</span>
              </h2>
            </div>

            <Card className="overflow-hidden bg-bolao-card/40 border-bolao-card-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-bolao-card-border">
                      <th className="text-left p-4 font-semibold">Característica</th>
                      <th className="text-center p-4 font-semibold text-bolao-green">BolãoMax</th>
                      <th className="text-center p-4 font-semibold text-muted-foreground">Tradicional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonItems.map((item, index) => (
                      <tr key={index} className="border-b border-bolao-card-border/50 last:border-b-0">
                        <td className="p-4 text-sm">{item.feature}</td>
                        <td className="p-4 text-center">
                          {item.bolaomax ? (
                            <CheckCircle2 className="w-5 h-5 text-bolao-green mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {item.tradicional ? (
                            <CheckCircle2 className="w-5 h-5 text-red-400 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* Groups Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Para Todos
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Para todos os <span className="gradient-text">grupos</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                O BolãoMax é perfeito para qualquer tipo de grupo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border card-hover group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${group.color}`}>
                      <group.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{group.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {group.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notice Section */}
        <section className="relative py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 sm:p-10 bg-gradient-to-br from-bolao-orange/10 via-bolao-card/80 to-bolao-orange/5 border-bolao-orange/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-orange/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-bolao-orange/20">
                    <AlertCircle className="w-6 h-6 text-bolao-orange" />
                  </div>
                  <h2 className="text-2xl font-bold">Importante entender</h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    O BolãoMax é uma <strong className="text-white">plataforma de organização de bolões</strong>, 
                    não uma operadora de jogos de loteria. Atuamos como facilitadores, conectando apostadores 
                    que desejam participar coletivamente de bolões.
                  </p>
                  <p>
                    Todos os jogos são registrados oficialmente na <strong className="text-white">Caixa Econômica Federal</strong>, 
                    a única entidade autorizada a realizar loterias federais no Brasil.
                  </p>
                  <p>
                    Não prometemos resultados nem garantimos prêmios. Participar de bolões é uma forma de 
                    <strong className="text-white"> aumentar suas chances estatísticas</strong>, mas a loteria 
                    continua sendo um jogo de sorte.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-bolao-orange/20">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-bolao-orange" />
                      <span className="text-muted-foreground">Jogos Registrados na Caixa</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4 text-bolao-orange" />
                      <span className="text-muted-foreground">Bilhetes Guardados com Segurança</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-bolao-orange" />
                      <span className="text-muted-foreground">Plataforma Confiável</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer activePage="por-que-bolaomax" />
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}
