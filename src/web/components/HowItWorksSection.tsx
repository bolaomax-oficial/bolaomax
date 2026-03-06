import { useState } from "react";
import { ChevronDown, CheckCircle, Zap, BarChart3, Gift, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HowItWorksSection = () => {
  const [expandedStep, setExpandedStep] = useState(0);

  const steps = [
    {
      number: "1",
      title: "Crie Sua Conta",
      description: "Cadastro simples em 60 segundos",
      details: "Preencha seu email, crie uma senha segura e confirme seu telefone. Você receberá um bônus de boas-vindas de R$ 10 para começar.",
      icon: Users,
      highlights: [
        "✓ Cadastro grátis e seguro",
        "✓ Sem necessidade de documentos inicialmente",
        "✓ Bônus de R$ 10 para primeiro acesso",
      ],
    },
    {
      number: "2",
      title: "Escolha Seu Bolão",
      description: "Selecione entre loterias e cotas",
      details: "Navegue pelos bolões disponíveis (Lotofácil, Mega-Sena, Quina, etc). Escolha quantas cotas deseja participar e quanto quer investir.",
      icon: BarChart3,
      highlights: [
        "✓ Múltiplas loterias disponíveis",
        "✓ Cotas a partir de R$ 10",
        "✓ Veja probabilidades de ganho em tempo real",
      ],
    },
    {
      number: "3",
      title: "Adicione ao Carrinho",
      description: "Revise e confirme sua compra",
      details: "Seu carrinho exibe todas as cotas selecionadas, o investimento total e o prêmio máximo que você pode ganhar.",
      icon: Gift,
      highlights: [
        "✓ Transparência total de valores",
        "✓ Possibilidade de adicionar mais cotas",
        "✓ Cupom de desconto disponível",
      ],
    },
    {
      number: "4",
      title: "Faça o Pagamento",
      description: "Múltiplas formas de pagamento",
      details: "Pague via Pix (instantâneo), cartão de crédito ou débito. Seus dados são protegidos por criptografia de banco.",
      icon: Zap,
      highlights: [
        "✓ Pix, Débito, Crédito ou Boleto",
        "✓ Criptografia 256-bit",
        "✓ Confirmação instantânea",
      ],
    },
    {
      number: "5",
      title: "Acompanhe os Resultados",
      description: "Receba notificações em tempo real",
      details: "Nosso sistema verifica automaticamente os resultados da Caixa. Se você ganhar, sua conta é creditada em minutos.",
      icon: BarChart3,
      highlights: [
        "✓ Verificação automática de resultados",
        "✓ Notificação instantânea por email/SMS",
        "✓ Histórico completo de apostas",
      ],
    },
    {
      number: "6",
      title: "Saque Seus Ganhos",
      description: "Saque instantâneo para sua conta",
      details: "Ganhou? Saque para qualquer conta bancária brasileira via Pix. Seu dinheiro chega em minutos.",
      icon: Gift,
      highlights: [
        "✓ Saque via Pix (instantâneo)",
        "✓ Sem taxas ocultas",
        "✓ Saque mínimo de R$ 50",
      ],
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bolao-darker via-bolao-dark to-bolao-darker" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,160,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,160,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-bolao-orange/10 text-bolao-orange text-sm font-semibold mb-4">
            PROCESSO SIMPLES
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Como funciona o BolãoMax em 6 passos
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Desde a criação da conta até sacar seus ganhos, o processo é simples, rápido e seguro
          </p>
        </div>

        {/* Steps Container */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedStep === index;

            return (
              <div key={index}>
                {/* Step Header */}
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? -1 : index)
                  }
                  className="w-full"
                >
                  <Card className="relative bg-gradient-to-r from-bolao-card/40 to-bolao-card/20 border-bolao-green/10 hover:border-bolao-green/30 transition-all duration-300 p-6 cursor-pointer group">
                    <div className="flex items-start gap-6">
                      {/* Step Number Circle */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center font-bold text-white text-lg">
                          {step.number}
                        </div>
                        {index < steps.length - 1 && (
                          <div className="absolute top-12 left-5 w-0.5 h-12 bg-gradient-to-b from-bolao-green/30 to-transparent" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {step.title}
                          </h3>
                          <Icon className="w-5 h-5 text-bolao-orange flex-shrink-0" />
                        </div>
                        <p className="text-gray-400">{step.description}</p>
                      </div>

                      {/* Expand Icon */}
                      <ChevronDown
                        className={`w-5 h-5 text-bolao-green flex-shrink-0 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </Card>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-2 bg-bolao-card/20 border border-bolao-green/10 rounded-lg p-6 space-y-4 ml-24">
                    <div>
                      <p className="text-gray-300 mb-4">{step.details}</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {step.highlights.map((highlight, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <span className="text-bolao-green font-bold">
                              ✓
                            </span>
                            {highlight.replace("✓ ", "")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Jogar Sozinho</h3>
            <div className="space-y-3">
              {[
                "Maior investimento inicial",
                "Chance de ganho menor",
                "Lucro isolado",
                "Risco total na sua mão",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border border-red-500 flex items-center justify-center">
                    <span className="text-red-500 text-xs">✕</span>
                  </div>
                  <span className="text-gray-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-bolao-green/10 to-bolao-orange/10 rounded-lg blur-xl" />
            <div className="relative bg-bolao-card/40 border border-bolao-green/30 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                Bolões BolãoMax
              </h3>
              <div className="space-y-3">
                {[
                  "Investimento a partir de R$ 10",
                  "Chance de ganho multiplicada",
                  "Lucro compartilhado (maior prêmio)",
                  "Segurança de plataforma regulada",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-bolao-green flex-shrink-0" />
                    <span className="text-white font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
