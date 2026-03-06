import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Cookie, Shield, BarChart3, Target, Settings, FileText } from "lucide-react";

// Types of cookies
const cookieTypes = [
  {
    type: "essential",
    name: "Cookies Essenciais",
    icon: Shield,
    description: "Necessários para o funcionamento básico do site. Não podem ser desativados.",
    examples: ["Autenticação de sessão", "Preferências de idioma", "Segurança CSRF"],
    required: true
  },
  {
    type: "analytics",
    name: "Cookies de Análise",
    icon: BarChart3,
    description: "Ajudam a entender como você usa o site para melhorar a experiência.",
    examples: ["Google Analytics", "Páginas visitadas", "Tempo de permanência"],
    required: false
  },
  {
    type: "marketing",
    name: "Cookies de Marketing",
    icon: Target,
    description: "Usados para exibir anúncios relevantes com base em seus interesses.",
    examples: ["Facebook Pixel", "Google Ads", "Retargeting"],
    required: false
  },
  {
    type: "preferences",
    name: "Cookies de Preferências",
    icon: Settings,
    description: "Armazenam suas preferências para personalizar sua experiência.",
    examples: ["Tema escuro/claro", "Loteria favorita", "Notificações"],
    required: false
  }
];

// Specific cookies used
const specificCookies = [
  { name: "bolaomax_session", purpose: "Manter sessão de login ativa", duration: "Sessão", type: "Essencial" },
  { name: "bolaomax_auth", purpose: "Token de autenticação", duration: "7 dias", type: "Essencial" },
  { name: "bolaomax_csrf", purpose: "Proteção contra ataques CSRF", duration: "Sessão", type: "Essencial" },
  { name: "cookie_consent", purpose: "Armazenar preferências de cookies", duration: "1 ano", type: "Essencial" },
  { name: "_ga", purpose: "Google Analytics - identificador único", duration: "2 anos", type: "Análise" },
  { name: "_gid", purpose: "Google Analytics - identificador de sessão", duration: "24 horas", type: "Análise" },
  { name: "preferences", purpose: "Armazenar preferências do usuário", duration: "1 ano", type: "Preferências" },
];

// Table of Contents
const tocItems = [
  { id: "o-que-sao", number: "1", title: "O que são Cookies?" },
  { id: "tipos", number: "2", title: "Tipos de Cookies" },
  { id: "cookies-usados", number: "3", title: "Cookies que Usamos" },
  { id: "terceiros", number: "4", title: "Cookies de Terceiros" },
  { id: "gerenciar", number: "5", title: "Como Gerenciar Cookies" },
  { id: "lgpd", number: "6", title: "LGPD e Consentimento" },
  { id: "contato", number: "7", title: "Contato" },
];

// Section Component
const Section = ({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mb-10 scroll-mt-24">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-bolao-green/20 text-bolao-green font-bold text-sm flex items-center justify-center flex-shrink-0">
        {number}
      </span>
      {title}
    </h2>
    <div className="text-muted-foreground leading-relaxed space-y-4 pl-11">
      {children}
    </div>
  </section>
);

export default function PoliticaCookies() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="politica-cookies" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Cookie className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Transparência</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Política de <span className="gradient-text">Cookies</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Saiba quais cookies utilizamos, por que os usamos e como você pode controlá-los.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última atualização: 15 de Janeiro de 2025
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 lg:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Table of Contents */}
            <Card className="p-6 bg-bolao-card/40 border-bolao-card-border mb-10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-bolao-green" />
                Índice
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-sm text-muted-foreground hover:text-bolao-green transition-colors flex items-center gap-2 py-1"
                  >
                    <span className="text-bolao-green font-medium">{item.number}.</span>
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <Section id="o-que-sao" number="1" title="O que são Cookies?">
                <p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.</p>
                <p>Os cookies permitem que um site "lembre" de suas ações e preferências (como login, idioma, tamanho de fonte e outras preferências de exibição) por um período de tempo, para que você não precise refazer essas configurações toda vez que visitar o site ou navegar entre páginas.</p>
              </Section>

              <Section id="tipos" number="2" title="Tipos de Cookies">
                <div className="grid gap-4 not-prose">
                  {cookieTypes.map((cookie) => (
                    <Card key={cookie.type} className="p-5 bg-bolao-card/60 border-bolao-card-border">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-bolao-green/10">
                          <cookie.icon className="w-6 h-6 text-bolao-green" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-white">{cookie.name}</h4>
                            {cookie.required && (
                              <Badge className="bg-bolao-green/20 text-bolao-green text-xs">Obrigatório</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{cookie.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {cookie.examples.map((example) => (
                              <Badge key={example} variant="outline" className="text-xs border-bolao-card-border">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Section>

              <Section id="cookies-usados" number="3" title="Cookies que Usamos">
                <p>Abaixo está a lista detalhada dos cookies que utilizamos em nosso site:</p>
                <div className="not-prose overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-bolao-card-border">
                        <th className="text-left py-3 px-4 font-semibold text-white">Nome</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Finalidade</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Duração</th>
                        <th className="text-left py-3 px-4 font-semibold text-white">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specificCookies.map((cookie) => (
                        <tr key={cookie.name} className="border-b border-bolao-card-border/50 hover:bg-bolao-card/30">
                          <td className="py-3 px-4 font-mono text-xs text-bolao-green">{cookie.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{cookie.purpose}</td>
                          <td className="py-3 px-4 text-muted-foreground">{cookie.duration}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs border-bolao-card-border">{cookie.type}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section id="terceiros" number="4" title="Cookies de Terceiros">
                <p>Além dos cookies que definimos, também utilizamos cookies de terceiros em nosso site:</p>
                <ul className="list-disc pl-4 space-y-2 not-prose">
                  <li><strong className="text-white">Google Analytics:</strong> Para análise de tráfego e comportamento dos usuários. <a href="https://policies.google.com/privacy" target="_blank" className="text-bolao-green hover:underline">Política de Privacidade do Google</a></li>
                  <li><strong className="text-white">PagSeguro/MercadoPago:</strong> Para processamento seguro de pagamentos. Os cookies são definidos durante o checkout.</li>
                  <li><strong className="text-white">Cloudflare:</strong> Para segurança e performance do site.</li>
                </ul>
              </Section>

              <Section id="gerenciar" number="5" title="Como Gerenciar Cookies">
                <p>Você pode controlar e gerenciar cookies de várias maneiras:</p>
                <div className="not-prose space-y-4">
                  <Card className="p-4 bg-bolao-card/60 border-bolao-card-border">
                    <h4 className="font-bold text-white mb-2">Configurações do Navegador</h4>
                    <p className="text-sm text-muted-foreground">A maioria dos navegadores permite que você recuse todos os cookies ou aceite apenas alguns. Veja as instruções para seu navegador:</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a href="https://support.google.com/chrome/answer/95647" target="_blank" className="text-xs text-bolao-green hover:underline">Chrome</a>
                      <a href="https://support.mozilla.org/pt-BR/kb/gerencie-configuracoes-de-armazenamento-local-de-s" target="_blank" className="text-xs text-bolao-green hover:underline">Firefox</a>
                      <a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" className="text-xs text-bolao-green hover:underline">Safari</a>
                      <a href="https://support.microsoft.com/pt-br/windows/excluir-e-gerenciar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" className="text-xs text-bolao-green hover:underline">Edge</a>
                    </div>
                  </Card>
                  <Card className="p-4 bg-bolao-card/60 border-bolao-card-border">
                    <h4 className="font-bold text-white mb-2">Banner de Cookies</h4>
                    <p className="text-sm text-muted-foreground">Você pode ajustar suas preferências a qualquer momento através do banner de cookies que aparece na primeira visita ao site, ou acessando as configurações de privacidade no rodapé.</p>
                  </Card>
                </div>
                <p className="mt-4">⚠️ <strong className="text-white">Atenção:</strong> Desativar cookies essenciais pode afetar o funcionamento do site, incluindo login e checkout.</p>
              </Section>

              <Section id="lgpd" number="6" title="LGPD e Consentimento">
                <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), utilizamos o modelo de <strong className="text-white">opt-in</strong> para cookies não essenciais. Isso significa que:</p>
                <ul className="list-disc pl-4 space-y-2 not-prose">
                  <li>Cookies essenciais são carregados automaticamente pois são necessários para o funcionamento do site</li>
                  <li>Cookies de análise, marketing e preferências só são ativados após seu consentimento explícito</li>
                  <li>Você pode retirar seu consentimento a qualquer momento</li>
                  <li>Suas preferências são armazenadas por 1 ano ou até você alterá-las</li>
                </ul>
                <p className="mt-4">Para mais informações sobre como tratamos seus dados, consulte nossa <a href="/politica-privacidade" className="text-bolao-green hover:underline">Política de Privacidade</a>.</p>
              </Section>

              <Section id="contato" number="7" title="Contato">
                <p>Se você tiver dúvidas sobre nossa política de cookies, entre em contato:</p>
                <p><strong className="text-white">Email:</strong> privacidade@bolaomax.com</p>
                <p><strong className="text-white">DPO:</strong> dpo@bolaomax.com</p>
              </Section>
            </div>
          </div>
        </section>
      </main>
      
      <Footer activePage="politica-cookies" />
    </div>
  );
}
