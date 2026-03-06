import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Trophy,
  Search,
  BarChart3,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Wallet,
  Calculator,
  HelpCircle,
} from "lucide-react";

// Steps data
const steps = [
  {
    number: "1",
    icon: Search,
    title: "Escolha seu bolão",
    description: "Navegue pelos bolões disponíveis de Mega-Sena, Lotofácil ou Quina. Compare valores, probabilidades e prazos.",
    color: "from-violet-600 to-violet-800",
  },
  {
    number: "2",
    icon: BarChart3,
    title: "Defina sua participação",
    description: "Escolha quanto deseja investir. Você pode participar com valores a partir de R$ 20,00.",
    color: "from-emerald-600 to-emerald-800",
  },
  {
    number: "3",
    icon: CreditCard,
    title: "Pagamento seguro",
    description: "Pague com PIX, cartão de crédito ou boleto. Todas as transações são criptografadas.",
    color: "from-sky-600 to-sky-800",
  },
  {
    number: "4",
    icon: Trophy,
    title: "Acompanhe o resultado",
    description: "Receba notificações em tempo real do sorteio. Em caso de prêmio, o valor é distribuído proporcionalmente após o recebimento da Caixa.",
    color: "from-bolao-orange to-amber-600",
  },
];

// FAQs data
const faqs = [
  {
    question: "O que é o BolãoMax?",
    answer: "O BolãoMax é uma plataforma que permite você participar de bolões de loteria de forma simples e segura. Reunimos apostadores para aumentar as chances de ganhar, dividindo custos e prêmios proporcionalmente.",
  },
  {
    question: "Como funciona a divisão dos prêmios?",
    answer: "A divisão é proporcional à sua participação. Se você investiu 10% do valor total do bolão, receberá 10% do prêmio. Simples assim.",
  },
  {
    question: "Os jogos são registrados oficialmente?",
    answer: "Sim! Todos os jogos são registrados oficialmente nas casas lotéricas da Caixa Econômica Federal. Os bilhetes físicos são armazenados com segurança e você pode verificar os números a qualquer momento.",
  },
  {
    question: "Qual o valor mínimo para participar?",
    answer: "O valor mínimo para participar de qualquer bolão é R$ 20,00. Cada bolão exibe claramente o valor mínimo de participação no card de informações.",
  },
  {
    question: "Como recebo meu prêmio se ganhar?",
    answer: "Prazos de Distribuição pelo BolãoMax: Prêmios menores (até R$ 10.000): Após recebimento da Caixa, o BolãoMax distribui proporcionalmente aos participantes em até 3 dias úteis. Prêmios maiores (acima de R$ 10.000): Após recebimento da Caixa (mínimo 2 dias úteis), o BolãoMax distribui proporcionalmente aos participantes em até 5 dias úteis. O BolãoMax é responsável pela organização do bolão e distribuição proporcional dos prêmios entre os participantes.",
  },
  {
    question: "É seguro usar o BolãoMax?",
    answer: "Totalmente! Utilizamos criptografia de ponta, gateways de pagamento certificados e todos os jogos são registrados oficialmente. Sua segurança é nossa prioridade.",
  },
];

export default function ComoFunciona() {
  const [percentage, setPercentage] = useState(10);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const { isOpen, openModal, closeModal } = useLotteryModal();
  
  const bolaoValue = 5000;
  const prizeExample = 1000000;
  const investment = (bolaoValue * percentage) / 100;
  const potentialPrize = (prizeExample * percentage) / 100;

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Como Funciona"
        description="Entenda como funcionam os bolões do BolãoMax. Processo transparente em 4 passos simples. Calculadora de participação disponível."
        keywords={["como funciona bolão", "participar bolão", "cotas bolão", "regras bolão", "calculadora bolão"]}
        pageType="support"
        canonicalUrl="https://bolaomax.com.br/como-funciona"
      />
      <Header activePage="como-funciona" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <HelpCircle className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Central de Ajuda</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Entenda como funciona o{" "}
              <span className="gradient-text">BolãoMax</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Transparência e clareza em cada etapa. Saiba exatamente como participar, 
              investir e receber seus prêmios.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="relative py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-6 sm:p-10 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-bolao-card-border overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-green/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-bolao-orange/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-bolao-green/20">
                    <Calculator className="w-6 h-6 text-bolao-green" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Calcule Sua Participação</h2>
                    <p className="text-sm text-muted-foreground">Simule seu investimento e potencial retorno</p>
                  </div>
                </div>

                {/* Slider */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Sua participação no bolão</span>
                    <span className="text-2xl font-extrabold text-bolao-green">{percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #00C853 0%, #00C853 ${percentage}%, #1F2937 ${percentage}%, #1F2937 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>1%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-5 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                    <p className="text-sm text-muted-foreground mb-1">Valor do Bolão</p>
                    <p className="text-3xl font-extrabold">R$ {bolaoValue.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                    <p className="text-sm text-muted-foreground mb-1">Seu Investimento</p>
                    <p className="text-3xl font-extrabold text-bolao-green">R$ {investment.toLocaleString("pt-BR")}</p>
                  </div>
                </div>

                {/* Potential Returns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border border-bolao-green/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-5 h-5 text-bolao-green" />
                      <span className="text-sm font-medium text-bolao-green">Se o bolão ganhar</span>
                    </div>
                    <p className="text-3xl font-extrabold">R$ {prizeExample.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-bolao-orange/20 to-bolao-orange/5 border border-bolao-orange/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-5 h-5 text-bolao-orange" />
                      <span className="text-sm font-medium text-bolao-orange">Você Receberia</span>
                    </div>
                    <p className="text-3xl font-extrabold text-bolao-orange">R$ {potentialPrize.toLocaleString("pt-BR")}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-6 text-center">
                  * Valores ilustrativos. O prêmio real depende do resultado do sorteio oficial da Caixa Econômica Federal.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Steps Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Passo a Passo
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Como participar em <span className="gradient-text">4 passos</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Processo simples, transparente e 100% online
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <Card
                  key={index}
                  className="relative p-8 bg-bolao-card/40 border-bolao-card-border card-hover group overflow-hidden"
                >
                  <div className="absolute -top-4 -right-4 text-[120px] font-extrabold text-bolao-card-border/30 select-none leading-none">
                    {step.number}
                  </div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${step.color} mb-6`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-16 lg:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Dúvidas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Perguntas <span className="gradient-text">Frequentes</span>
              </h2>
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-green/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Escolha seu bolão agora e aumente suas chances de ganhar na loteria!
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
                  <Link href="/cadastro">
                    <Button
                      size="lg"
                      className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold text-lg px-8 h-14"
                    >
                      Criar Conta Grátis
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer activePage="como-funciona" />
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
      <WhatsAppButton />
    </div>
  );
}
