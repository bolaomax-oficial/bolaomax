import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CalendarDays,
  CreditCard,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

// When refund is possible
const whenPossible = [
  { icon: CalendarDays, title: "Antes do sorteio", description: "Se você solicitar cancelamento antes do encerramento das apostas e registro dos jogos. Taxa de cancelamento de 20% será aplicada." },
  { icon: XCircle, title: "Bolão cancelado", description: "Se o bolão for cancelado pela plataforma por qualquer motivo. Reembolso integral sem taxa." },
  { icon: AlertTriangle, title: "Erro da plataforma", description: "Em caso de erro técnico comprovado que prejudique sua participação. Reembolso integral sem taxa." },
  { icon: CreditCard, title: "Pagamento duplicado", description: "Se houver cobrança duplicada por erro do sistema ou gateway. Reembolso integral do valor duplicado." },
];

// When refund is NOT possible
const whenNotPossible = [
  { title: "Após registro dos jogos", description: "Depois que os jogos são registrados oficialmente na Caixa." },
  { title: "Após o sorteio", description: "Independentemente do resultado do sorteio." },
  { title: "Desistência após fechamento", description: "Após o encerramento das participações do bolão." },
  { title: "Alegação de não ter entendido", description: "As regras são claras e disponíveis antes da participação." },
];

// Steps to request refund
const refundSteps = [
  { step: "1", title: "Acesse sua conta", description: "Entre na sua conta e vá até 'Minhas Participações'." },
  { step: "2", title: "Selecione o bolão", description: "Encontre o bolão e clique em 'Solicitar Reembolso'." },
  { step: "3", title: "Preencha o formulário", description: "Informe o motivo da solicitação." },
  { step: "4", title: "Confira os valores", description: "Você receberá 80% do valor pago. Taxa de cancelamento: 20%." },
  { step: "5", title: "Aguarde análise", description: "Analisaremos em até 48 horas úteis." },
  { step: "6", title: "Receba o valor", description: "Se aprovado, o valor é devolvido via PIX em até 24 horas." },
];

export default function PoliticaReembolso() {
  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="politica-reembolso" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <RotateCcw className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Garantia e Segurança</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Política de <span className="gradient-text">Reembolso</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Entenda quando e como você pode solicitar o reembolso de suas participações no BolãoMax.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última atualização: 15 de Janeiro de 2025
            </p>
          </div>
        </section>

        {/* When Possible Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-xl bg-bolao-green/20">
                <CheckCircle2 className="w-8 h-8 text-bolao-green" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quando é possível solicitar reembolso</h2>
                <p className="text-muted-foreground">Situações em que garantimos a devolução</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whenPossible.map((item, index) => (
                <Card key={index} className="p-6 bg-bolao-card/40 border-bolao-card-border border-l-4 border-l-bolao-green">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-bolao-green/10 text-bolao-green">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* When NOT Possible Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-xl bg-red-500/20">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quando NÃO é possível solicitar reembolso</h2>
                <p className="text-muted-foreground">Situações em que não realizamos devolução</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whenNotPossible.map((item, index) => (
                <Card key={index} className="p-6 bg-bolao-card/40 border-bolao-card-border border-l-4 border-l-red-500/50">
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How to Request Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-xl bg-sky-500/20">
                <MessageSquare className="w-8 h-8 text-sky-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Como solicitar reembolso</h2>
                <p className="text-muted-foreground">Passo a passo para fazer sua solicitação</p>
              </div>
            </div>

            <div className="space-y-4">
              {refundSteps.map((item, index) => (
                <Card key={index} className="p-6 bg-bolao-card/40 border-bolao-card-border flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-bolao-green flex items-center justify-center text-bolao-dark font-bold text-xl flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-xl bg-bolao-orange/20">
                <Clock className="w-8 h-8 text-bolao-orange" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Prazos</h2>
                <p className="text-muted-foreground">Tempo estimado para cada etapa</p>
              </div>
            </div>

            <Card className="p-6 bg-bolao-card/40 border-bolao-card-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-bolao-dark/50">
                  <p className="text-3xl font-bold text-bolao-green mb-2">48h</p>
                  <p className="text-sm text-muted-foreground">Análise da solicitação</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-bolao-dark/50">
                  <p className="text-3xl font-bold text-bolao-orange mb-2">24h</p>
                  <p className="text-sm text-muted-foreground">Processamento (se aprovado)</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-bolao-dark/50">
                  <p className="text-3xl font-bold text-sky-400 mb-2">PIX</p>
                  <p className="text-sm text-muted-foreground">Método de devolução</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Cancellation Fee Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 bg-gradient-to-br from-bolao-orange/10 via-bolao-card/80 to-bolao-orange/5 border-bolao-orange/30">
              <h2 className="text-2xl font-bold mb-4">Taxa de Cancelamento: 20%</h2>
              <p className="text-muted-foreground mb-6">
                Quando você solicita reembolso, o BolãoMax já realizou diversos processos que geram custos:
              </p>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bolao-orange mt-2 flex-shrink-0" />
                  <span>Processamento do pagamento via gateway</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bolao-orange mt-2 flex-shrink-0" />
                  <span>Registro da sua participação no sistema</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bolao-orange mt-2 flex-shrink-0" />
                  <span>Alocação de cota no bolão</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-bolao-orange mt-2 flex-shrink-0" />
                  <span>Custos administrativos e operacionais</span>
                </li>
              </ul>
              <div className="p-4 rounded-xl bg-bolao-dark/50">
                <p className="text-center">
                  <span className="text-muted-foreground">Exemplo: Se você participou com </span>
                  <span className="font-bold text-white">R$ 100,00</span>
                  <span className="text-muted-foreground">, você receberá </span>
                  <span className="font-bold text-bolao-green">R$ 80,00</span>
                  <span className="text-muted-foreground"> (80%)</span>
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                A taxa de 20% garante a sustentabilidade do serviço para todos os participantes.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-green/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
                  Ainda tem dúvidas?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Nossa equipe está pronta para ajudar com qualquer questão sobre reembolsos
                </p>
                <Link href="/suporte">
                  <Button
                    size="lg"
                    className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-lg px-8 h-14"
                  >
                    Falar com Suporte
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer activePage="politica-reembolso" />
    </div>
  );
}
