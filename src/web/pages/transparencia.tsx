import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import {
  Shield,
  Wallet,
  Eye,
  ChevronRight,
  Lock,
  Server,
  FileCheck,
  BadgeCheck,
  Building2,
  Trophy,
  CreditCard,
  FileText,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Download,
} from "lucide-react";

// Operation steps data
const operationSteps = [
  {
    step: "1",
    icon: Wallet,
    title: "Você investe",
    description: "Seu pagamento é processado por gateways certificados e creditado em nossa conta operacional.",
  },
  {
    step: "2",
    icon: CreditCard,
    title: "Compramos os jogos",
    description: "Utilizamos os valores para registrar os jogos oficialmente nas casas lotéricas da Caixa.",
  },
  {
    step: "3",
    icon: FileText,
    title: "Guardamos os bilhetes",
    description: "Os bilhetes físicos são armazenados em local seguro, com registro fotográfico e digital.",
  },
  {
    step: "4",
    icon: Trophy,
    title: "Prêmios são distribuídos",
    description: "Em caso de premiação, o valor é dividido proporcionalmente e creditado automaticamente.",
  },
];

// Security guarantees data
const securityGuarantees = [
  { label: "100% dos jogos registrados na Caixa", icon: "✓", description: "Todos os jogos são oficialmente registrados nas casas lotéricas da Caixa Econômica Federal" },
  { label: "Prêmios distribuídos proporcionalmente", icon: "✓", description: "Cada participante recebe sua parte proporcional do prêmio de forma automática e transparente" },
];

// Security features data
const securityFeatures = [
  { icon: Lock, title: "Criptografia SSL", description: "Todas as comunicações são criptografadas com protocolo TLS 1.3." },
  { icon: Server, title: "Infraestrutura Segura", description: "Servidores em data centers certificados ISO 27001." },
  { icon: ShieldCheck, title: "Gateways Certificados", description: "Pagamentos processados por provedores PCI-DSS compliant." },
  { icon: BadgeCheck, title: "Verificação de Identidade", description: "CPF verificado e documentos validados para saques." },
];

// Compliance items data
const complianceItems = [
  { icon: FileCheck, title: "LGPD Compliant", description: "Estamos em conformidade com a Lei Geral de Proteção de Dados." },
  { icon: Building2, title: "CNPJ Ativo", description: "Empresa regularmente constituída com todas as licenças necessárias." },
  { icon: BarChart3, title: "Auditoria Contínua", description: "Processos auditados periodicamente por empresa independente." },
  { icon: Eye, title: "Política Clara", description: "Termos de uso, política de privacidade e regulamento acessíveis." },
];

export default function Transparencia() {
  const { isOpen, openModal, closeModal } = useLotteryModal();

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="transparencia" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Eye className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Compromisso Total</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="gradient-text">Transparência</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              No BolãoMax, acreditamos que a confiança se constrói com clareza. 
              Aqui você encontra todas as informações sobre como operamos, 
              para onde vai seu dinheiro e como garantimos sua segurança.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Auditável</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Dados Protegidos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-medium">
                <Eye className="w-4 h-4" />
                <span>Operação Transparente</span>
              </div>
            </div>
          </div>
        </section>

        {/* Our Operation Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Como Operamos
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Nossa <span className="gradient-text">Operação</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Entenda exatamente o que acontece com seu dinheiro desde o momento do pagamento até o sorteio
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {operationSteps.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/60 border-bolao-card-border relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 text-6xl font-extrabold text-bolao-card-border/30 select-none">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex p-3 rounded-xl bg-bolao-green/10 text-bolao-green mb-4">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <Card className="mt-10 p-8 bg-bolao-card/40 border-bolao-card-border">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="p-6 rounded-2xl bg-bolao-green/10">
                    <Building2 className="w-12 h-12 text-bolao-green" />
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-xl font-bold mb-3">Onde fica o dinheiro?</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Os valores recebidos ficam em conta corrente empresarial em instituição financeira regulamentada 
                    pelo Banco Central. Os jogos são registrados imediatamente após o fechamento do bolão, 
                    garantindo total segurança e transparência em todo o processo.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-gold/10 text-bolao-gold text-sm font-semibold mb-4">
                Nossas Garantias
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Compromisso com <span className="gradient-text">Você</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                O que garantimos em cada participação
              </p>
            </div>

            <Card className="p-8 sm:p-10 bg-bolao-card/40 border-bolao-card-border">
              {/* Guarantees List */}
              <div className="space-y-6">
                {securityGuarantees.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center text-bolao-green font-bold">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/20">
                <p className="text-sm text-center">
                  <strong className="text-bolao-green">Todos os prêmios são distribuídos</strong> proporcionalmente aos participantes de forma automática
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Sua Proteção
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                <span className="gradient-text">Segurança</span> em primeiro lugar
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Investimos continuamente em tecnologia para proteger seus dados e seu dinheiro
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border text-center card-hover"
                >
                  <div className="inline-flex p-4 rounded-xl bg-bolao-green/10 text-bolao-green mb-4">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-sm font-semibold mb-4">
                Conformidade
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Compliance e <span className="gradient-text">Regulamentação</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {complianceItems.map((item, index) => (
                <Card
                  key={index}
                  className="p-6 bg-bolao-card/40 border-bolao-card-border flex items-start gap-4"
                >
                  <div className="flex-shrink-0 p-3 rounded-xl bg-sky-500/10 text-sky-400">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-sm font-semibold mb-4">
                Prestação de Contas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Relatórios <span className="gradient-text">Públicos</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Acesse nossos relatórios e estatísticas de operação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-bolao-card/40 border-bolao-card-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Relatório Mensal</h3>
                    <p className="text-sm text-muted-foreground">Estatísticas gerais de operação</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Em breve
                </Button>
              </Card>

              <Card className="p-6 bg-bolao-card/40 border-bolao-card-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Histórico de Prêmios</h3>
                    <p className="text-sm text-muted-foreground">Prêmios distribuídos na plataforma</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Em breve
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-green/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                  Confiança que você pode ver
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Participe de bolões com total transparência e segurança
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
            </Card>
          </div>
        </section>
      </main>
      
      <Footer activePage="transparencia" />
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}
