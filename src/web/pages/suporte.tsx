import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import {
  Sparkles,
  Shield,
  Wallet,
  Headphones,
  ChevronRight,
  Search,
  Mail,
  Clock,
  Send,
  Paperclip,
  User,
  CreditCard,
  Trophy,
  Wrench,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";

// Categories data
const helpCategories = [
  {
    icon: User,
    title: "Minha Conta",
    description: "Cadastro, login, dados pessoais, senha",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: CreditCard,
    title: "Pagamentos",
    description: "PIX, cartão, comprovantes, problemas",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Trophy,
    title: "Bolões",
    description: "Participação, regras, resultados",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Wallet,
    title: "Prêmios e Saques",
    description: "Recebimento, prazos, taxas",
    color: "text-bolao-gold",
    bgColor: "bg-bolao-gold/10",
  },
  {
    icon: Wrench,
    title: "Técnico",
    description: "Erros, bugs, app, navegação",
    color: "text-bolao-orange",
    bgColor: "bg-bolao-orange/10",
  },
];

// Popular questions
const popularQuestions = [
  {
    question: "Como faço para participar de um bolão?",
    answer: "Basta criar sua conta, escolher um bolão disponível, definir sua participação e realizar o pagamento via PIX ou cartão.",
  },
  {
    question: "Quanto tempo demora para receber um prêmio?",
    answer: "Prazos de Distribuição: Prêmios menores (até R$ 10.000): até 3 dias úteis após recebimento da Caixa. Prêmios maiores (acima de R$ 10.000): até 5 dias úteis após recebimento da Caixa. O BolãoMax distribui proporcionalmente aos participantes assim que recebe o valor da Caixa Econômica Federal.",
  },
  {
    question: "Posso cancelar minha participação?",
    answer: "Você pode solicitar cancelamento antes do encerramento das apostas e registro dos jogos na Caixa. Uma taxa de cancelamento de 20% é retida (você recebe 80% do valor via PIX em até 24 horas após aprovação). Após o registro dos jogos, a participação é definitiva.",
  },
  {
    question: "O BolãoMax é seguro?",
    answer: "Sim! Utilizamos criptografia SSL, pagamentos processados por gateways certificados, e todos os jogos são registrados oficialmente na Caixa.",
  },
  {
    question: "Qual o valor mínimo para participar?",
    answer: "O valor mínimo para participar de qualquer bolão é R$ 20,00. O valor é exibido no card do bolão junto com todas as informações de participação.",
  },
];

// Hero Section
const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 radial-gradient" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
          <Headphones className="w-4 h-4 text-bolao-green" />
          <span className="text-sm font-medium text-muted-foreground">Estamos aqui para ajudar</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
          Central de <span className="gradient-text">Ajuda</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Encontre respostas, tire dúvidas e entre em contato com nossa equipe de suporte.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar ajuda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-bolao-card border border-bolao-card-border text-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
          />
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = () => {
  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Como podemos <span className="text-bolao-green">ajudar?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {helpCategories.map((category, index) => (
            <Card
              key={index}
              className="p-5 bg-bolao-card/40 border-bolao-card-border card-hover cursor-pointer group text-center"
            >
              <div className={`inline-flex p-4 rounded-xl ${category.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <h3 className="font-bold mb-1 group-hover:text-bolao-green transition-colors">
                {category.title}
              </h3>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Form Section
const ContactFormSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Fale <span className="gradient-text">Conosco</span>
            </h2>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-bolao-green/10">
                  <Mail className="w-6 h-6 text-bolao-green" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <a
                    href="mailto:suporte@bolaomax.com"
                    className="text-bolao-green hover:underline"
                  >
                    suporte@bolaomax.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-500/10">
                  <Clock className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Horário de Atendimento</h3>
                  <p className="text-muted-foreground">Segunda a Sexta</p>
                  <p className="text-lg font-bold text-sky-400">9h às 18h</p>
                </div>
              </div>

              <Card className="p-5 bg-bolao-green/5 border-bolao-green/20">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-bolao-green" />
                  <span className="font-semibold">Tempo médio de resposta</span>
                </div>
                <p className="text-2xl font-extrabold text-bolao-green">Até 24 horas</p>
                <p className="text-sm text-muted-foreground">Em dias úteis</p>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Links Rápidos
              </h3>
              <div className="space-y-2">
                <Link
                  href="/perguntas-frequentes"
                  className="flex items-center gap-3 p-3 rounded-lg bg-bolao-card/30 hover:bg-bolao-card/50 transition-colors group"
                >
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-bolao-green" />
                  <span className="text-sm">FAQ - Perguntas Frequentes</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </Link>
                <Link
                  href="/transparencia"
                  className="flex items-center gap-3 p-3 rounded-lg bg-bolao-card/30 hover:bg-bolao-card/50 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-bolao-green" />
                  <span className="text-sm">Status do Sistema</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bolao-green/20 text-bolao-green font-medium ml-auto">
                    Online
                  </span>
                </Link>
                <button
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-bolao-card/30 hover:bg-bolao-card/50 transition-colors group"
                >
                  <AlertTriangle className="w-5 h-5 text-muted-foreground group-hover:text-bolao-orange" />
                  <span className="text-sm">Reportar Problema</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 bg-bolao-card/60 border-bolao-card-border">
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-bolao-green/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-bolao-green" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Mensagem Enviada!</h3>
                <p className="text-muted-foreground mb-6">
                  Recebemos sua mensagem e responderemos em até 24 horas úteis.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                >
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assunto</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-white focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="duvida">Dúvida geral</option>
                    <option value="pagamento">Problema com pagamento</option>
                    <option value="saque">Dúvida sobre saque</option>
                    <option value="bolao">Dúvida sobre bolão</option>
                    <option value="conta">Problema com conta</option>
                    <option value="reembolso">Solicitar reembolso</option>
                    <option value="bug">Reportar bug/erro</option>
                    <option value="sugestao">Sugestão</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-bolao-dark/50 border border-bolao-card-border text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green resize-none"
                    placeholder="Descreva sua dúvida ou problema em detalhes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Anexo (opcional)</label>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-bolao-card-border hover:border-bolao-green/50 transition-colors cursor-pointer">
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique para anexar um arquivo (máx. 5MB)
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

// Popular Questions Section
const PopularQuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Perguntas <span className="gradient-text">Populares</span>
        </h2>

        <Card className="bg-bolao-card/40 border-bolao-card-border overflow-hidden">
          <div className="px-6">
            {popularQuestions.map((item, index) => (
              <div key={index} className="border-b border-bolao-card-border last:border-b-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-5 flex items-center justify-between text-left hover:text-bolao-green transition-colors group"
                >
                  <span className="font-semibold text-base pr-4 group-hover:text-bolao-green">
                    {item.question}
                  </span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      openIndex === index
                        ? "bg-bolao-green text-bolao-dark"
                        : "bg-bolao-card-border text-muted-foreground"
                    }`}
                  >
                    {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-48 opacity-100 pb-5" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center mt-8">
          <Link href="/perguntas-frequentes">
            <Button variant="outline" className="border-bolao-card-border">
              Ver todas as perguntas
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Chat Widget Placeholder
const ChatWidgetPlaceholder = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        <button
          className="w-14 h-14 rounded-full bg-bolao-green flex items-center justify-center shadow-lg glow-green hover:glow-green-intense transition-all"
          onClick={() => alert("Chat em breve! Por enquanto, use o formulário de contato.")}
        >
          <MessageCircle className="w-6 h-6 text-bolao-dark" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-bolao-card border border-bolao-card-border rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Chat em breve!
        </div>
      </div>
    </div>
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
              <li><Link href="/perguntas-frequentes" className="text-sm text-muted-foreground hover:text-white transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/suporte" className="text-sm text-bolao-green font-medium">Suporte</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-sm text-muted-foreground hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/politica-reembolso" className="text-sm text-muted-foreground hover:text-white transition-colors">Política de Reembolso</Link></li>
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
export default function Suporte() {
  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="home" />
      <main>
        <HeroSection />
        <CategoriesSection />
        <ContactFormSection />
        <PopularQuestionsSection />
      </main>
      <Footer />
      <ChatWidgetPlaceholder />
    </div>
  );
}
