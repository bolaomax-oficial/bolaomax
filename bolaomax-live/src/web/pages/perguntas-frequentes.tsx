import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import {
  Sparkles,
  Shield,
  Wallet,
  HelpCircle,
  Search,
  Plus,
  Minus,
  Info,
  Users,
  CreditCard,
  Trophy,
  Banknote,
  ChevronRight,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  faqs: FAQItem[];
}

// FAQ Data
const faqCategories: FAQCategory[] = [
  {
    id: "sobre",
    title: "Sobre o BolãoMax",
    icon: Info,
    color: "text-bolao-green",
    bgColor: "bg-bolao-green/10",
    faqs: [
      {
        question: "O que é o BolãoMax?",
        answer: "O BolãoMax é uma plataforma digital que facilita a participação em bolões de loteria. Conectamos apostadores que desejam participar coletivamente de bolões maiores, permitindo que você invista valores acessíveis e aumente suas chances de ganhar. Não somos uma loteria ou casa de apostas, mas sim uma plataforma de organização de bolões.",
      },
      {
        question: "Como funciona o sistema de cotas?",
        answer: "Quando você participa de um bolão no BolãoMax, você adquire uma porcentagem (cota) do valor total do bolão. Por exemplo, se o bolão custa R$ 1.000 e você investe R$ 100, você possui 10% de participação. Se o bolão ganhar um prêmio de R$ 100.000, você receberá R$ 10.000 (10% do prêmio). O sistema de cotas permite participar de bolões maiores com investimentos menores.",
      },
      {
        question: "O BolãoMax é confiável?",
        answer: "Sim! O BolãoMax opera com total transparência. Todos os jogos são registrados oficialmente na Caixa Econômica Federal. Você pode visualizar as dezenas jogadas em cada bolão antes de participar. Os pagamentos são processados por gateways certificados e os prêmios são distribuídos automaticamente via PIX. Temos milhares de usuários satisfeitos e histórico comprovado de pagamentos.",
      },
      {
        question: "O BolãoMax é uma loteria?",
        answer: "Não. O BolãoMax não é uma loteria nem opera jogos de azar. Somos uma plataforma que facilita a organização de bolões. Os jogos são registrados exclusivamente na Caixa Econômica Federal, a única entidade autorizada a realizar loterias federais no Brasil. Atuamos como intermediários, organizando grupos de apostadores e garantindo a transparência e segurança do processo.",
      },
    ],
  },
  {
    id: "participacao",
    title: "Participação",
    icon: Users,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    faqs: [
      {
        question: "Como faço para participar de um bolão?",
        answer: "É muito simples: 1) Crie sua conta gratuita no BolãoMax; 2) Navegue pelos bolões disponíveis (Mega-Sena, Lotofácil ou Quina); 3) Escolha o bolão que deseja participar; 4) Defina sua porcentagem de participação; 5) Realize o pagamento via PIX ou cartão; 6) Pronto! Acompanhe o sorteio e torça pelo prêmio.",
      },
      {
        question: "Qual o valor mínimo para participar?",
        answer: "O valor mínimo para participar de qualquer bolão é R$ 20,00. Cada bolão exibe claramente o valor mínimo de participação no card de informações. Isso permite que qualquer pessoa possa participar de bolões maiores com investimentos acessíveis.",
      },
      {
        question: "Como escolho minha porcentagem de participação?",
        answer: "Ao clicar em 'Participar' em um bolão, você será direcionado para a página de checkout. Lá, você encontrará um slider que permite escolher sua porcentagem de participação (geralmente de 5% a 50%). O sistema calcula automaticamente o valor a pagar e seu prêmio proporcional caso o bolão ganhe. Você pode ajustar livremente dentro da disponibilidade do bolão.",
      },
      {
        question: "Posso cancelar minha participação?",
        answer: "Você pode solicitar cancelamento antes do encerramento das apostas e registro dos jogos na Caixa. Uma taxa de cancelamento de 20% é retida para cobrir custos de processamento já realizados (processamento do pagamento, registro da participação, alocação de cota). Você receberá 80% do valor pago via PIX em até 24 horas após aprovação. Após o registro dos jogos na Caixa, não é possível cancelar.",
      },
    ],
  },
  {
    id: "pagamentos",
    title: "Pagamentos",
    icon: CreditCard,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    faqs: [
      {
        question: "Quais são as formas de pagamento aceitas?",
        answer: "Aceitamos PIX (forma mais rápida e recomendada) e cartões de crédito das principais bandeiras (Visa, Mastercard, Elo, American Express). O PIX é processado instantaneamente, enquanto cartões podem levar alguns minutos para confirmação. Em breve, disponibilizaremos também boleto bancário.",
      },
      {
        question: "Quanto tempo leva para processar o pagamento?",
        answer: "PIX: processamento instantâneo (geralmente em segundos). Cartão de Crédito: até 5 minutos para confirmação. Após a confirmação, sua participação é automaticamente registrada no bolão e você recebe uma notificação por email confirmando sua cota.",
      },
      {
        question: "O pagamento é seguro?",
        answer: "Absolutamente. Utilizamos gateways de pagamento certificados com criptografia de ponta-a-ponta. Não armazenamos dados de cartão em nossos servidores. Todo o processo segue os padrões PCI-DSS de segurança. Além disso, todas as transações são registradas e auditáveis para sua segurança.",
      },
    ],
  },
  {
    id: "premios",
    title: "Prêmios",
    icon: Trophy,
    color: "text-bolao-gold",
    bgColor: "bg-bolao-gold/10",
    faqs: [
      {
        question: "Como recebo meu prêmio se o bolão ganhar?",
        answer: "Quando o bolão é premiado, o sistema calcula automaticamente sua parte proporcional. O valor é creditado em sua conta BolãoMax e você pode solicitar o saque via PIX. O processo é 100% automático e transparente. Você recebe notificações por email e pode acompanhar tudo pelo painel 'Minha Conta'.",
      },
      {
        question: "Quanto tempo demora para receber o prêmio?",
        answer: "Prazos de Distribuição pelo BolãoMax: Prêmios menores (até R$ 10.000): Após recebimento da Caixa, o BolãoMax distribui proporcionalmente aos participantes em até 3 dias úteis. Prêmios maiores (acima de R$ 10.000): Após recebimento da Caixa (mínimo 2 dias úteis), o BolãoMax distribui proporcionalmente aos participantes em até 5 dias úteis. O pagamento dos prêmios é realizado pela Caixa Econômica Federal conforme suas regras oficiais.",
      },
      {
        question: "Há cobrança de impostos sobre os prêmios?",
        answer: "O Imposto de Renda sobre prêmios de loteria é retido na fonte pela Caixa Econômica Federal no momento do resgate do bilhete premiado (alíquota de 13,8% para valores acima de R$ 2.112,00). O valor que você recebe no BolãoMax já é líquido. Recomendamos consultar um contador para declaração de IR.",
      },
    ],
  },
  {
    id: "saques",
    title: "Saques",
    icon: Banknote,
    color: "text-bolao-orange",
    bgColor: "bg-bolao-orange/10",
    faqs: [
      {
        question: "Como solicito um saque?",
        answer: "Acesse 'Minha Conta', clique em 'Solicitar Saque', informe o valor desejado e confirme sua chave PIX. O valor mínimo para saque é R$ 20,00. Antes do primeiro saque, você precisará cadastrar e validar seus dados bancários por segurança.",
      },
      {
        question: "Quanto tempo leva para o saque cair na minha conta?",
        answer: "Saques via PIX são processados em até 24 horas úteis após a aprovação. A maioria dos saques é processada em poucas horas durante dias úteis. Nos finais de semana e feriados, o processamento pode levar até o próximo dia útil.",
      },
      {
        question: "Saques via PIX são gratuitos?",
        answer: "Sim! Não cobramos para saques via PIX. O valor solicitado é exatamente o valor que você receberá em sua conta.",
      },
    ],
  },
  {
    id: "cancelamento",
    title: "Cancelamento",
    icon: CreditCard,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    faqs: [
      {
        question: "Posso solicitar reembolso?",
        answer: "Você pode solicitar reembolso antes do registro dos jogos na Caixa. Uma taxa de cancelamento de 20% é retida para cobrir custos de processamento já realizados. Você receberá 80% do valor pago via PIX em até 24 horas após aprovação. Exemplo: se você participou com R$ 100,00, receberá R$ 80,00 de volta.",
      },
      {
        question: "Por que existe uma taxa de cancelamento?",
        answer: "Quando você participa de um bolão, o BolãoMax já realizou: processamento do pagamento via gateway, registro da sua participação no sistema, alocação de cota no bolão, e custos administrativos. A taxa de 20% cobre esses processos já executados e garante a sustentabilidade do serviço.",
      },
    ],
  },
];

// FAQ Accordion Item
const FAQAccordionItem = ({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className="border-b border-bolao-card-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-5 px-1 flex items-center justify-between text-left hover:text-bolao-green transition-colors group"
      >
        <span className="font-semibold text-base pr-4 group-hover:text-bolao-green transition-colors">
          {question}
        </span>
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isOpen
              ? "bg-bolao-green text-bolao-dark"
              : "bg-bolao-card-border text-muted-foreground group-hover:bg-bolao-green/20 group-hover:text-bolao-green"
          }`}
        >
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-muted-foreground leading-relaxed px-1">
          {answer}
        </p>
      </div>
    </div>
  );
};

// FAQ Category Section
const FAQCategorySection = ({
  category,
  openItems,
  onToggle,
}: {
  category: FAQCategory;
  openItems: Set<string>;
  onToggle: (key: string) => void;
}) => {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${category.bgColor}`}>
          <category.icon className={`w-5 h-5 ${category.color}`} />
        </div>
        <h2 className={`text-xl font-bold ${category.color}`}>{category.title}</h2>
      </div>
      <Card className="bg-bolao-card/40 border-bolao-card-border overflow-hidden">
        <div className="px-6">
          {category.faqs.map((faq, idx) => {
            const key = `${category.id}-${idx}`;
            return (
              <FAQAccordionItem
                key={key}
                question={faq.question}
                answer={faq.answer}
                isOpen={openItems.has(key)}
                onToggle={() => onToggle(key)}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative py-16 lg:py-20 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 radial-gradient" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6 animate-slide-in-up">
          <HelpCircle className="w-4 h-4 text-bolao-green" />
          <span className="text-sm font-medium text-muted-foreground">Central de Ajuda</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-in-up stagger-1">
          Perguntas <span className="gradient-text">Frequentes</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-up stagger-2">
          Tire todas as suas dúvidas sobre o BolãoMax. Se não encontrar o que procura, 
          entre em contato com nosso suporte.
        </p>
      </div>
    </section>
  );
};

// Search Section
const SearchSection = ({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) => {
  return (
    <section className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar perguntas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-bolao-card border border-bolao-card-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
          />
        </div>
      </div>
    </section>
  );
};

// FAQ Content Section
const FAQContentSection = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(["sobre-0"]));
  const [searchTerm, setSearchTerm] = useState("");

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Filter FAQs based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return faqCategories;

    const lowerSearch = searchTerm.toLowerCase();
    
    return faqCategories
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(lowerSearch) ||
            faq.answer.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((category) => category.faqs.length > 0);
  }, [searchTerm]);

  // Open all items when searching
  const effectiveOpenItems = useMemo(() => {
    if (searchTerm.trim()) {
      const allKeys = new Set<string>();
      filteredCategories.forEach((category) => {
        category.faqs.forEach((_, idx) => {
          allKeys.add(`${category.id}-${idx}`);
        });
      });
      return allKeys;
    }
    return openItems;
  }, [searchTerm, filteredCategories, openItems]);

  return (
    <section className="py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchSection searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {filteredCategories.length === 0 ? (
          <Card className="p-12 bg-bolao-card/40 border-bolao-card-border text-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nenhuma pergunta encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Tente usar termos diferentes ou entre em contato com nosso suporte.
            </p>
            <Button
              variant="outline"
              className="border-bolao-card-border hover:bg-bolao-card"
              onClick={() => setSearchTerm("")}
            >
              Limpar Busca
            </Button>
          </Card>
        ) : (
          <div className="mt-8">
            {filteredCategories.map((category) => (
              <FAQCategorySection
                key={category.id}
                category={category}
                openItems={effectiveOpenItems}
                onToggle={toggleItem}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Still Have Questions Section
const StillHaveQuestionsSection = () => {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-12 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30 relative overflow-hidden text-center">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-bolao-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-bolao-green/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-2xl bg-bolao-green/20 mb-6">
              <HelpCircle className="w-8 h-8 text-bolao-green" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ainda tem dúvidas?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Nossa equipe de suporte está pronta para ajudar você. 
              Entre em contato e responderemos o mais rápido possível.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contato">
                <Button
                  size="lg"
                  className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold px-8"
                >
                  Falar com Suporte
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href="/como-funciona">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-bolao-card-border hover:bg-bolao-card"
                >
                  Ver Como Funciona
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="relative py-16 border-t border-bolao-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-bolao-dark" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Bolão<span className="text-bolao-green">Max</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A maior plataforma de bolões do Brasil. Participe, compartilhe e ganhe junto com milhares de apostadores.
            </p>
          </div>

          {/* Loterias */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Loterias</h4>
            <ul className="space-y-2">
              <li><Link href="/lotofacil" className="text-sm text-muted-foreground hover:text-white transition-colors">Lotofácil</Link></li>
              <li><Link href="/megasena" className="text-sm text-muted-foreground hover:text-white transition-colors">Mega-Sena</Link></li>
              <li><Link href="/quina" className="text-sm text-muted-foreground hover:text-white transition-colors">Quina</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Institucional</h4>
            <ul className="space-y-2">
              <li><Link href="/como-funciona" className="text-sm text-muted-foreground hover:text-white transition-colors">Como Funciona</Link></li>
              <li><Link href="/por-que-bolaomax" className="text-sm text-muted-foreground hover:text-white transition-colors">Por que BolãoMax</Link></li>
              <li><Link href="/perguntas-frequentes" className="text-sm text-bolao-green font-medium">Perguntas Frequentes</Link></li>
              <li><Link href="/contato" className="text-sm text-muted-foreground hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/termos" className="text-sm text-muted-foreground hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-sm text-muted-foreground hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/regulamento" className="text-sm text-muted-foreground hover:text-white transition-colors">Regulamento</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-bolao-card-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 BolãoMax. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-bolao-green" />
              <span>Site Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4 text-bolao-green" />
              <span>Pagamento Protegido</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Page Component
export default function PerguntasFrequentes() {
  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="home" />
      <main>
        <HeroSection />
        <FAQContentSection />
        <StillHaveQuestionsSection />
      </main>
      <Footer />
    </div>
  );
}
