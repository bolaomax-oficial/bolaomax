import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LotterySelectionModal, useLotteryModal } from "@/components/LotterySelectionModal";
import {
  BookOpen,
  ChevronRight,
  Target,
  Lightbulb,
  Users,
  PiggyBank,
  History,
  ChevronLeft,
  X,
  Star,
  TrendingUp,
  Shield,
} from "lucide-react";

// Article interface
interface ArticleContent {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  sections: { title: string; content: string }[];
  facts?: { label: string; value: string }[];
}

// Articles data
const articlesData: ArticleContent[] = [
  {
    id: "como-funcionam-loterias",
    icon: Target,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    title: "Como funcionam as Loterias",
    description: "Entenda as regras, probabilidades e prêmios de cada modalidade",
    sections: [
      { title: "Lotofácil", content: "A Lotofácil é uma das loterias mais populares do Brasil. Você escolhe 15 números de 1 a 25. Os sorteios acontecem diariamente de segunda a sábado. A probabilidade de acertar os 15 números com uma aposta simples é de aproximadamente 1 em 3,2 milhões. Valor mínimo da aposta: R$ 3,00." },
      { title: "Mega-Sena", content: "A Mega-Sena é a loteria mais famosa do Brasil. Você escolhe 6 números de 1 a 60. Sorteios às quartas e sábados. A probabilidade de acertar a sena com uma aposta simples é de 1 em 50 milhões. Valor mínimo da aposta: R$ 5,00." },
      { title: "Quina", content: "Na Quina, você escolhe 5 números de 1 a 80. Sorteios diários de segunda a sábado. A probabilidade de acertar os 5 números é de aproximadamente 1 em 24 milhões. Valor mínimo da aposta: R$ 2,50." },
      { title: "Timemania", content: "Escolha 10 números de 1 a 80 mais seu Time do Coração. Sorteios às terças, quintas e sábados. Probabilidade de acertar os 7 números: 1 em 26 milhões. Valor da aposta: R$ 3,50." },
      { title: "Dia de Sorte", content: "Escolha 7 números de 1 a 31 e seu Mês da Sorte. Sorteios às terças, quintas e sábados. Probabilidade de acertar os 7 números: 1 em 2,6 milhões. Valor da aposta: R$ 2,50." },
      { title: "Super Sete", content: "7 colunas com números de 0 a 9. Sorteios às segundas, quartas e sextas. Probabilidade de acertar todas as 7 colunas: 1 em 10 milhões. Valor da aposta: R$ 2,50." },
      { title: "Dupla Sena", content: "Dois sorteios por concurso! Escolha 6 números de 1 a 50. Sorteios às terças, quintas e sábados. Probabilidade de acertar 6 números em um sorteio: 1 em 15,8 milhões. Valor da aposta: R$ 2,50." },
      { title: "Lotomania", content: "Escolha 50 números de 1 a 100 ou deixe o sistema escolher. Sorteios às terças e sextas. Probabilidade de acertar 20 números: 1 em 11 milhões. Valor da aposta: R$ 3,00." },
      { title: "Federal", content: "Bilhetes com números de 5 dígitos pré-impressos. Sorteios aos sábados. Prêmios fixos, não acumulam. Valor do bilhete: R$ 10,00." },
      { title: "Por que jogar em bolões?", content: "Ao participar de bolões, você aumenta significativamente suas chances de ganhar. O custo é dividido entre os participantes, tornando acessível a participação em apostas maiores. Com apenas R$ 20,00 você pode participar de múltiplos bolões!" },
    ],
    facts: [
      { label: "Lotofácil", value: "1 em 3,2M" },
      { label: "Mega-Sena", value: "1 em 50M" },
      { label: "Dia de Sorte", value: "1 em 2,6M" },
    ],
  },
  {
    id: "estrategias-jogo",
    icon: Lightbulb,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    title: "Estratégias de Jogo",
    description: "Conheça diferentes abordagens para escolher seus números",
    sections: [
      { title: "Estratégia Balanceada", content: "Distribua os números de forma equilibrada: misture números baixos, médios e altos, pares e ímpares. Estatisticamente, os sorteios tendem a apresentar distribuição equilibrada." },
      { title: "Números Quentes", content: "Números 'quentes' são os que saíram mais vezes recentemente. Alguns apostadores acreditam que têm maior chance de sair novamente." },
      { title: "Números Frios", content: "Números 'frios' são os que não saem há muito tempo. A ideia é que estão 'devendo' aparecer." },
      { title: "Combinação de Estratégias", content: "Combine diferentes abordagens: escolha alguns números quentes, alguns frios, e complete com seleção balanceada." },
    ],
    facts: [
      { label: "Números pares ideal", value: "40-60%" },
      { label: "Distribuição", value: "Equilibrada" },
      { label: "Sequências", value: "Evitar" },
    ],
  },
  {
    id: "entendendo-boloes",
    icon: Users,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    title: "Entendendo Bolões",
    description: "Saiba tudo sobre bolões: como funcionam e suas vantagens",
    sections: [
      { title: "O que são bolões?", content: "Bolões são grupos de apostadores que se unem para comprar múltiplos jogos. Cada participante contribui com uma quantia e o prêmio é dividido proporcionalmente. No BolãoMax, você participa com investimento mínimo de apenas R$ 20,00!" },
      { title: "Vantagens dos bolões", content: "Participe de muitos jogos com pouco investimento, aumente suas chances significativamente, participe de datas especiais com custo acessível, e divida custos com outros apostadores inteligentes." },
      { title: "Divisão do prêmio", content: "Se você tem 10% de um bolão e ele ganha R$ 1.000.000, você recebe R$ 100.000. O cálculo é automático e transparente. Com R$ 20,00 você pode ter participação em múltiplos bolões!" },
      { title: "No BolãoMax", content: "Escolha o bolão que deseja, defina sua participação (mínimo R$ 20,00), pague de forma segura e pronto! Os jogos são registrados oficialmente na Caixa Econômica Federal. Você recebe comprovante e acompanha tudo em tempo real." },
    ],
    facts: [
      { label: "Aumento de chances", value: "Proporcional" },
      { label: "Divisão", value: "Automática" },
      { label: "Investimento mín.", value: "R$ 20" },
    ],
  },
  {
    id: "gestao-financeira",
    icon: PiggyBank,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    title: "Gestão Financeira",
    description: "Aprenda a jogar de forma responsável e sustentável",
    sections: [
      { title: "Quanto investir?", content: "Invista apenas o que você pode perder sem afetar suas finanças. Defina um orçamento mensal específico para apostas. No BolãoMax, você começa com apenas R$ 20,00, tornando o jogo acessível a todos." },
      { title: "Diversificação", content: "Em vez de colocar tudo em um único bolão, participe de vários bolões menores de diferentes loterias. Com R$ 20,00 você pode diversificar em 2-3 bolões diferentes, aumentando suas chances em múltiplas modalidades." },
      { title: "Expectativas realistas", content: "As chances de ganhar o prêmio principal são baixas, mas com bolões você multiplica suas oportunidades. Participe pela diversão e emoção, não como fonte de renda. Cada R$ 20,00 investido representa entretenimento e possibilidade." },
      { title: "Controle emocional", content: "Não tente recuperar perdas aumentando investimentos. O jogo deve ser entretenimento, não obsessão. Estabeleça limites claros: por exemplo, máximo R$ 100,00/mês para lazer em apostas." },
    ],
    facts: [
      { label: "Orçamento", value: "Máx. 5% renda" },
      { label: "Frequência", value: "Moderada" },
      { label: "Prioridade", value: "Diversão" },
    ],
  },
  {
    id: "historico-estatisticas",
    icon: History,
    color: "text-bolao-orange",
    bgColor: "bg-bolao-orange/10",
    title: "Histórico e Estatísticas",
    description: "Números mais sorteados, padrões e curiosidades",
    sections: [
      { title: "Números mais sorteados", content: "Mega-Sena: 10, 53, 42, 37 e 04. Lotofácil: 20, 10, 25, 11 e 05. Quina: 04, 65, 80, 39 e 03. Cada sorteio é independente." },
      { title: "Padrões observados", content: "A maioria dos resultados tem equilíbrio entre pares e ímpares, e raramente sequências consecutivas longas." },
      { title: "Curiosidades", content: "A Mega-Sena existe desde 1996. O maior prêmio foi R$ 289 milhões em 2017 (Mega da Virada)." },
      { title: "Análise crítica", content: "Cada sorteio é um evento independente. Use estatísticas como curiosidade, não como garantia." },
    ],
    facts: [
      { label: "Mega-Sena top", value: "10, 53, 42" },
      { label: "Lotofácil top", value: "20, 10, 25" },
      { label: "Quina top", value: "04, 65, 80" },
    ],
  },
  {
    id: "seguranca-transparencia",
    icon: Shield,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    title: "Segurança e Transparência",
    description: "Como garantimos a legitimidade e segurança dos bolões",
    sections: [
      { title: "Registro Oficial", content: "Todos os bolões do BolãoMax são registrados oficialmente na Caixa Econômica Federal. Você recebe o comprovante de cada aposta realizada, garantindo total transparência e legalidade." },
      { title: "Pagamento Seguro", content: "Utilizamos sistemas de pagamento certificados (PCI-DSS) com criptografia de ponta. Seus dados financeiros estão protegidos com a mesma segurança de bancos digitais. Aceitamos PIX, cartão de crédito e boleto." },
      { title: "Divisão Automática de Prêmios", content: "Em caso de premiação, o valor é dividido automaticamente de acordo com a porcentagem de participação de cada apostador. O sistema calcula e credita o valor na sua conta de forma instantânea e transparente." },
      { title: "Auditoria e Compliance", content: "Mantemos registros completos de todas as transações. Nossa plataforma segue rigorosamente a legislação brasileira de jogos. Você pode auditar suas apostas a qualquer momento no painel 'Minhas Participações'." },
      { title: "Proteção do Apostador", content: "Implementamos limites de gasto, alertas de jogo responsável e ferramentas de autocontrole. Seu bem-estar financeiro é nossa prioridade. Recomendamos investir apenas valores de lazer." },
      { title: "Suporte Dedicado", content: "Nossa equipe está disponível via WhatsApp, email e chat para tirar dúvidas sobre comprovantes, pagamentos e premiações. Resposta em até 2 horas em dias úteis." },
    ],
    facts: [
      { label: "Registro", value: "100% Oficial" },
      { label: "Criptografia", value: "256-bit SSL" },
      { label: "Conformidade", value: "CEF + LGPD" },
    ],
  },
];

// Quick tips data
const quickTips = [
  { icon: Star, title: "Diversifique", description: "Participe de diferentes loterias e bolões" },
  { icon: TrendingUp, title: "Seja consistente", description: "Mantenha frequência regular de participação" },
  { icon: Users, title: "Prefira bolões", description: "Mais jogos = mais chances de premiação" },
  { icon: Shield, title: "Jogue responsável", description: "Defina um orçamento e respeite-o" },
];

// Article View Modal
const ArticleView = ({ article, onClose, onOpenLotteryModal }: { article: ArticleContent; onClose: () => void; onOpenLotteryModal: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-bolao-dark/95 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-4xl bg-bolao-card border border-bolao-card-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-bolao-card/95 backdrop-blur-sm border-b border-bolao-card-border px-6 py-4 flex items-center justify-between z-10">
          <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bolao-card-border transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-4 rounded-xl ${article.bgColor}`}>
              <article.icon className={`w-8 h-8 ${article.color}`} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{article.title}</h1>
              <p className="text-muted-foreground">{article.description}</p>
            </div>
          </div>

          {/* Facts */}
          {article.facts && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {article.facts.map((fact, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">{fact.label}</p>
                  <p className="text-lg font-bold text-bolao-green">{fact.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-8">
            {article.sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-bolao-green/20 text-bolao-green font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed pl-10">{section.content}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 pt-6 border-t border-bolao-card-border text-center">
            <p className="text-muted-foreground mb-4">Pronto para colocar em prática?</p>
            <Button 
              onClick={onOpenLotteryModal}
              className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold glow-orange hover:glow-orange-intense transition-all"
            >
              Ver Bolões Disponíveis
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ConteudoEducativo() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleContent | null>(null);
  const { isOpen, openModal, closeModal } = useLotteryModal();

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="conteudo-educativo" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <BookOpen className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Aprenda com a gente</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Conteúdo <span className="gradient-text">Educativo</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Aprenda sobre loterias, estratégias e como maximizar suas chances de forma responsável. 
              Conhecimento é poder!
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-green/10 text-bolao-green text-sm font-semibold mb-4">
                Artigos
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Explore nossos <span className="gradient-text">conteúdos</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articlesData.map((article) => (
                <Card
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="p-6 bg-bolao-card/60 border-bolao-card-border card-hover cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className={`inline-flex p-4 rounded-xl ${article.bgColor} mb-5`}>
                      <article.icon className={`w-7 h-7 ${article.color}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-bolao-green transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center text-bolao-green font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Ler mais <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bolao-gold/10 text-bolao-gold text-sm font-semibold mb-4">
                Dicas Rápidas
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Para lembrar <span className="gradient-text">sempre</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickTips.map((tip, index) => (
                <Card key={index} className="p-6 bg-bolao-card/40 border-bolao-card-border text-center">
                  <div className="inline-flex p-4 rounded-xl bg-bolao-gold/10 text-bolao-gold mb-4">
                    <tip.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </Card>
              ))}
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
                  Pronto para começar?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Agora que você conhece mais sobre loterias, que tal colocar em prática?
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
      
      <Footer activePage="conteudo-educativo" />

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleView
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenLotteryModal={openModal}
        />
      )}
      
      <LotterySelectionModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}
