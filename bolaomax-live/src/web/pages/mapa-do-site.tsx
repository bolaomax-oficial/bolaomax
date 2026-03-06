import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Map,
  Home,
  Gamepad2,
  HelpCircle,
  FileText,
  Users,
  DollarSign,
  ChevronRight,
  Globe
} from "lucide-react";

// Sitemap sections
const sitemapSections = [
  {
    title: "Páginas Principais",
    icon: Home,
    links: [
      { name: "Início", href: "/", description: "Página inicial do BolãoMax" },
      { name: "Como Funciona", href: "/como-funciona", description: "Entenda o funcionamento dos bolões" },
      { name: "Por Que BolãoMax", href: "/por-que-bolaomax", description: "Vantagens de participar conosco" },
      { name: "Resultados", href: "/resultados", description: "Confira os últimos resultados das loterias" },
      { name: "Clube VIP", href: "/clube-vip", description: "Benefícios exclusivos para assinantes" },
    ]
  },
  {
    title: "Bolões de Loterias",
    icon: Gamepad2,
    links: [
      { name: "Lotofácil", href: "/lotofacil", description: "Bolões de Lotofácil" },
      { name: "Mega-Sena", href: "/megasena", description: "Bolões de Mega-Sena" },
      { name: "Quina", href: "/quina", description: "Bolões de Quina" },
      { name: "Internacional", href: "/internacional", description: "Loterias internacionais via TheLotter" },
    ]
  },
  {
    title: "Suporte e Ajuda",
    icon: HelpCircle,
    links: [
      { name: "Suporte", href: "/suporte", description: "Central de atendimento" },
      { name: "Perguntas Frequentes", href: "/perguntas-frequentes", description: "Dúvidas comuns respondidas" },
      { name: "Conteúdo Educativo", href: "/conteudo-educativo", description: "Aprenda sobre loterias" },
      { name: "Transparência", href: "/transparencia", description: "Nossa política de transparência" },
    ]
  },
  {
    title: "Documentos Legais",
    icon: FileText,
    links: [
      { name: "Termos de Uso", href: "/termos-de-uso", description: "Condições de uso da plataforma" },
      { name: "Política de Privacidade", href: "/politica-privacidade", description: "Como tratamos seus dados" },
      { name: "Política de Cookies", href: "/politica-cookies", description: "Sobre uso de cookies" },
      { name: "Política de Reembolso", href: "/politica-reembolso", description: "Regras para reembolso" },
      { name: "Compliance", href: "/compliance", description: "Todos os documentos legais" },
    ]
  },
  {
    title: "Institucional",
    icon: Users,
    links: [
      { name: "Sobre Nós", href: "/sobre-nos", description: "Conheça o BolãoMax" },
      { name: "Blog", href: "/blog", description: "Artigos e novidades" },
      { name: "Contato", href: "/contato", description: "Entre em contato conosco" },
    ]
  },
  {
    title: "Área do Usuário",
    icon: DollarSign,
    links: [
      { name: "Login", href: "/login", description: "Acesse sua conta" },
      { name: "Criar Conta", href: "/cadastro", description: "Cadastre-se gratuitamente" },
      { name: "Minha Conta", href: "/minha-conta", description: "Gerencie sua conta" },
      { name: "Checkout", href: "/checkout", description: "Finalizar participação" },
    ]
  },
];

export default function MapaDoSite() {
  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="mapa-do-site" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Map className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Navegação</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Mapa do <span className="gradient-text">Site</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre rapidamente todas as páginas e seções do BolãoMax organizadas por categoria.
            </p>
          </div>
        </section>

        {/* Sitemap Content */}
        <section className="py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {sitemapSections.map((section) => (
                <Card key={section.title} className="p-6 bg-bolao-card/40 border-bolao-card-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-bolao-green/10">
                      <section.icon className="w-5 h-5 text-bolao-green" />
                    </div>
                    <h2 className="font-bold text-lg">{section.title}</h2>
                  </div>
                  
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>
                          <a className="group flex items-start gap-2 text-muted-foreground hover:text-bolao-green transition-colors">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-bolao-green/50 group-hover:text-bolao-green transition-colors" />
                            <div>
                              <span className="font-medium text-white group-hover:text-bolao-green transition-colors">
                                {link.name}
                              </span>
                              <p className="text-xs text-muted-foreground">{link.description}</p>
                            </div>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* XML Sitemap Link */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Card className="p-8 bg-bolao-card/40 border-bolao-card-border">
              <Globe className="w-12 h-12 text-bolao-green mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Sitemap XML</h2>
              <p className="text-muted-foreground mb-4">
                Para motores de busca, também disponibilizamos um sitemap em formato XML.
              </p>
              <a
                href="/sitemap.xml"
                target="_blank"
                className="inline-flex items-center gap-2 text-bolao-green hover:underline"
              >
                Ver sitemap.xml
                <ChevronRight className="w-4 h-4" />
              </a>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer activePage="mapa-do-site" />
    </div>
  );
}
