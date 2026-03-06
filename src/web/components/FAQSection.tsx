import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const FAQSection = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Como Funciona",
      questions: [
        {
          q: "Como funciona um bolão de loteria?",
          a: "Um bolão permite que múltiplas pessoas participem de um mesmo concurso, dividindo o investimento e os prêmios proporcionalmente. No BolãoMax, você compra cotas (frações) de bolões, aumentando suas chances sem gastar muito.",
        },
        {
          q: "Posso ganhar jogando bolão?",
          a: "Sim! Você ganha exatamente o prêmio da Caixa proporcional ao número de cotas que possui. Se o bolão ganha R$ 100 e você tem 10% das cotas, você recebe R$ 10 (menos a taxa de administração).",
        },
        {
          q: "Qual é o investimento mínimo?",
          a: "O investimento mínimo por cota começa a partir de R$ 10, o que torna acessível para qualquer pessoa. Você pode participar de vários bolões com o valor que desejar.",
        },
        {
          q: "Como funciona o saque dos ganhos?",
          a: "Se você ganhar, o prêmio é creditado na sua conta BolãoMax em até 72 horas (conforme a caixa). Você pode sacar para qualquer conta bancária via Pix, que é instantâneo.",
        },
      ],
    },
    {
      category: "Segurança e Confiança",
      questions: [
        {
          q: "Meus dados estão seguros no BolãoMax?",
          a: "Sim! Utilizamos criptografia 256-bit (SSL), atendemos às normas PCI-DSS para pagamentos e LGPD para proteção de dados. Seus dados nunca são compartilhados com terceiros.",
        },
        {
          q: "O BolãoMax é regulamentado?",
          a: "Sim, operamos dentro da legalidade brasileira. Todos os bolões são realizados conforme as normas da Caixa Econômica Federal e regulamentações de jogos.",
        },
        {
          q: "E se eu não ganhar?",
          a: "Se o bolão não ganhar, você não perde nada além do valor investido. Cada bolão é independente, e você escolhe em quais participar.",
        },
        {
          q: "Como vocês verificam os resultados?",
          a: "Os resultados são obtidos automaticamente do sistema oficial da Caixa Econômica Federal. Nossa plataforma verifica em tempo real e credita os ganhos automaticamente.",
        },
      ],
    },
    {
      category: "Pagamentos",
      questions: [
        {
          q: "Quais são as formas de pagamento?",
          a: "Aceitamos Pix (instantâneo), cartão de crédito, débito e boleto. Todas as transações são processadas pela Pagar.me com segurança de nível bancário.",
        },
        {
          q: "Há taxas ocultas?",
          a: "Não! Nossos preços são transparentes. O único custo é a taxa de administração do bolão (geralmente 10%), que é descontada automaticamente do prêmio.",
        },
        {
          q: "Quando posso sacar meus ganhos?",
          a: "Você pode sacar seus ganhos a qualquer momento após o prêmio ser creditado. O prazo mínimo geralmente é 72 horas após o sorteio da Caixa.",
        },
        {
          q: "Há limite de saque?",
          a: "Não há limite de saque. Você pode sacar o valor que ganhar. O saque mínimo é de R$ 50 e máximo depende de sua conta (conforme políticas de compliance).",
        },
      ],
    },
    {
      category: "Conta e Cadastro",
      questions: [
        {
          q: "Preciso de documentos para me cadastrar?",
          a: "Para criar uma conta, você precisa apenas de email e telefone. Para saques acima de R$ 1.000, será necessário fazer a verificação de identidade (CPF/RG).",
        },
        {
          q: "Posso usar um apelido ou nome fantasia?",
          a: "Sua conta deve estar registrada com seu nome real. Isso é exigência da Caixa e de normas de compliance.",
        },
        {
          q: "Como faço para recuperar minha senha?",
          a: "Clique em 'Esqueci minha senha' na página de login. Você receberá um link por email para criar uma nova senha.",
        },
        {
          q: "Posso ter múltiplas contas?",
          a: "Não. Uma pessoa só pode ter uma conta ativa. Contas duplicadas serão suspensas.",
        },
      ],
    },
    {
      category: "Loterias",
      questions: [
        {
          q: "Quais loterias estão disponíveis?",
          a: "Oferecemos: Lotofácil, Mega-Sena, Quina, Timemania, Dia de Sorte, Super-Sete, Dupla-Sena, Lotomania, Federal e loterias internacionais.",
        },
        {
          q: "Como escolho qual loteria apostar?",
          a: "Cada loteria tem diferentes chances de ganho e prêmios. A Lotofácil tem chances maiores com prêmios menores, enquanto a Mega-Sena tem prêmios maiores. Escolha conforme seu perfil.",
        },
        {
          q: "Posso participar de vários bolões ao mesmo tempo?",
          a: "Sim! Você pode adicionar várias cotas de diferentes bolões ao carrinho e comprar todas de uma vez.",
        },
        {
          q: "Quando são os sorteios?",
          a: "Cada loteria tem seus dias e horários específicos. No BolãoMax, você pode acompanhar o cronograma completo na página de cada loteria.",
        },
      ],
    },
    {
      category: "Problemas e Suporte",
      questions: [
        {
          q: "Não recebi meu saque. O que devo fazer?",
          a: "Verifique se foi para a conta correta. Se não chegou em 72 horas, entre em contato com nosso suporte via chat, email ou WhatsApp.",
        },
        {
          q: "Como faço para cancelar uma aposta?",
          a: "Apostas podem ser canceladas até 1 hora antes do sorteio. Você recebe um reembolso automático para sua carteira BolãoMax.",
        },
        {
          q: "Como contacto o suporte?",
          a: "Disponibilizamos chat ao vivo, email (suporte@bolaomax.com) e WhatsApp. Respondemos em até 2 horas úteis.",
        },
        {
          q: "E se houver problema com meu pagamento?",
          a: "Entre em contato conosco imediatamente. Vamos investigar junto à Pagar.me e resolver rapidamente.",
        },
      ],
    },
  ];

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bolao-dark via-bolao-darker to-bolao-dark" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(2,207,81,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
            DÚVIDAS COMUNS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Encontre respostas rápidas para as perguntas mais comuns
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-12 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Pesquise sua dúvida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 bg-bolao-card border-bolao-green/20 hover:border-bolao-green/40 focus:border-bolao-green text-white placeholder-gray-500 h-12"
          />
        </div>

        {/* FAQs by Category */}
        <div className="space-y-12">
          {filteredFAQs.map((category) => (
            <div key={category.category}>
              <h3 className="text-2xl font-bold text-bolao-green mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-bolao-orange to-bolao-green rounded-full" />
                {category.category}
              </h3>

              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const globalIndex = faqs
                    .slice(0, faqs.indexOf(category))
                    .reduce((sum, c) => sum + c.questions.length, 0) + index;
                  const isExpanded = expandedFAQ === globalIndex;

                  return (
                    <button
                      key={globalIndex}
                      onClick={() =>
                        setExpandedFAQ(isExpanded ? -1 : globalIndex)
                      }
                      className="w-full text-left"
                    >
                      <Card className="relative bg-bolao-card/40 border-bolao-green/10 hover:border-bolao-green/30 transition-all duration-300 p-6 cursor-pointer group">
                        <div className="flex items-start gap-4 justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white group-hover:text-bolao-green transition-colors">
                              {faq.q}
                            </h4>
                            {isExpanded && (
                              <p className="text-gray-300 mt-4 leading-relaxed">
                                {faq.a}
                              </p>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-bolao-green flex-shrink-0 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                Nenhuma pergunta encontrada para "{searchTerm}". 
                <br />
                Entre em contato com nosso suporte para tirar dúvidas.
              </p>
            </div>
          )}
        </div>

        {/* Support CTA */}
        <div className="mt-16 bg-gradient-to-r from-bolao-green/10 to-bolao-orange/10 border border-bolao-green/20 rounded-2xl p-8 text-center">
          <p className="text-gray-300 mb-3">Ainda tem dúvidas?</p>
          <p className="text-xl font-bold text-white mb-4">
            Nossa equipe de suporte está sempre disponível
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="mailto:suporte@bolaomax.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-bolao-green/20 hover:bg-bolao-green/30 text-bolao-green rounded-lg transition-colors font-semibold"
            >
              Email: suporte@bolaomax.com
            </a>
            <a
              href="https://wa.me/558123456789"
              className="inline-flex items-center gap-2 px-6 py-3 bg-bolao-orange/20 hover:bg-bolao-orange/30 text-bolao-orange rounded-lg transition-colors font-semibold"
            >
              WhatsApp: (81) 98765-4321
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
