import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, FileText } from "lucide-react";

// Table of Contents data
const tocItems = [
  { id: "introducao", number: "1", title: "Introdução" },
  { id: "dados-coletados", number: "2", title: "Dados Coletados" },
  { id: "uso-dados", number: "3", title: "Como Usamos Seus Dados" },
  { id: "compartilhamento", number: "4", title: "Compartilhamento de Dados" },
  { id: "seguranca", number: "5", title: "Segurança dos Dados" },
  { id: "direitos-lgpd", number: "6", title: "Seus Direitos (LGPD)" },
  { id: "cookies", number: "7", title: "Cookies e Tecnologias" },
  { id: "retencao", number: "8", title: "Retenção de Dados" },
  { id: "menores", number: "9", title: "Menores de Idade" },
  { id: "alteracoes", number: "10", title: "Alterações nesta Política" },
  { id: "contato-dpo", number: "11", title: "Contato e DPO" },
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

export default function PoliticaPrivacidade() {
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
      <Header activePage="politica-privacidade" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Shield className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Proteção de Dados</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Política de <span className="gradient-text">Privacidade</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Saiba como coletamos, utilizamos e protegemos suas informações pessoais em conformidade com a LGPD.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Última atualização: 15 de Janeiro de 2025
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 lg:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Section id="introducao" number="1" title="Introdução">
                <p>Esta Política de Privacidade descreve como o BolãoMax coleta, utiliza, armazena e protege suas informações pessoais. Estamos comprometidos com a proteção da sua privacidade e com o cumprimento da Lei Geral de Proteção de Dados (LGPD).</p>
                <p>Ao utilizar nossa plataforma, você consente com as práticas descritas nesta política.</p>
              </Section>

              <Section id="dados-coletados" number="2" title="Dados Coletados">
                <p><strong>Dados de cadastro:</strong> Nome completo, CPF, email, telefone, data de nascimento.</p>
                <p><strong>Dados financeiros:</strong> Informações de pagamento, histórico de transações, dados bancários para saques.</p>
                <p><strong>Dados de uso:</strong> Endereço IP, tipo de dispositivo, navegador, páginas visitadas, interações com a plataforma.</p>
                <p><strong>Dados de cookies:</strong> Preferências, sessões, análise de comportamento.</p>
              </Section>

              <Section id="uso-dados" number="3" title="Como Usamos Seus Dados">
                <p>Utilizamos seus dados para: processar participações em bolões, realizar pagamentos e saques, enviar comunicações sobre seus bolões, melhorar nossos serviços, cumprir obrigações legais, e prevenir fraudes.</p>
              </Section>

              <Section id="compartilhamento" number="4" title="Compartilhamento de Dados">
                <p>Podemos compartilhar seus dados com: processadores de pagamento (para transações), prestadores de serviços (infraestrutura, email), autoridades (quando legalmente exigido), e auditorias (para verificações de compliance).</p>
                <p>Nunca vendemos seus dados pessoais a terceiros.</p>
              </Section>

              <Section id="seguranca" number="5" title="Segurança dos Dados">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados: criptografia TLS em todas as comunicações, servidores em data centers certificados, controle de acesso restrito, monitoramento contínuo de segurança, e backups regulares.</p>
              </Section>

              <Section id="direitos-lgpd" number="6" title="Seus Direitos (LGPD)">
                <p>Conforme a LGPD, você tem direito a: confirmação e acesso aos seus dados, correção de dados incompletos ou incorretos, anonimização ou bloqueio de dados desnecessários, portabilidade dos dados, eliminação dos dados, informação sobre compartilhamento, e revogação do consentimento.</p>
                <p>Para exercer seus direitos, entre em contato com nosso DPO.</p>
              </Section>

              <Section id="cookies" number="7" title="Cookies e Tecnologias">
                <p>Utilizamos cookies para: manter sua sessão ativa, lembrar suas preferências, análise de uso da plataforma, e segurança. Você pode gerenciar cookies nas configurações do seu navegador.</p>
              </Section>

              <Section id="retencao" number="8" title="Retenção de Dados">
                <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Dados de transações financeiras são mantidos por no mínimo 5 anos conforme legislação fiscal.</p>
              </Section>

              <Section id="menores" number="9" title="Menores de Idade">
                <p>Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente dados de menores. Se identificarmos que coletamos dados de um menor, eles serão deletados imediatamente.</p>
              </Section>

              <Section id="alteracoes" number="10" title="Alterações nesta Política">
                <p>Podemos atualizar esta política periodicamente. Alterações significativas serão comunicadas por email ou através da plataforma. A data de última atualização será sempre indicada no topo deste documento.</p>
              </Section>

              <Section id="contato-dpo" number="11" title="Contato e DPO">
                <p><strong>Email:</strong> privacidade@bolaomax.com</p>
                <p><strong>DPO (Encarregado de Proteção de Dados):</strong> dpo@bolaomax.com</p>
                <p>Você pode entrar em contato conosco para exercer seus direitos ou esclarecer dúvidas sobre esta política.</p>
              </Section>
            </div>
          </div>
        </section>
      </main>
      
      <Footer activePage="politica-privacidade" />
    </div>
  );
}
