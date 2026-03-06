import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

// Table of Contents data
const tocItems = [
  { id: "aceitacao", number: "1", title: "Aceitação dos Termos" },
  { id: "descricao", number: "2", title: "Descrição do Serviço" },
  { id: "cadastro", number: "3", title: "Cadastro e Conta" },
  { id: "uso", number: "4", title: "Uso da Plataforma" },
  { id: "participacao", number: "5", title: "Participação em Bolões" },
  { id: "pagamentos", number: "6", title: "Pagamentos e Reembolsos" },
  { id: "premios", number: "7", title: "Prêmios e Saques" },
  { id: "responsabilidades-usuario", number: "8", title: "Responsabilidades do Usuário" },
  { id: "responsabilidades-plataforma", number: "9", title: "Responsabilidades da Plataforma" },
  { id: "propriedade", number: "10", title: "Propriedade Intelectual" },
  { id: "privacidade", number: "11", title: "Privacidade" },
  { id: "limitacao", number: "12", title: "Limitação de Responsabilidade" },
  { id: "modificacoes", number: "13", title: "Modificações" },
  { id: "lei", number: "14", title: "Lei Aplicável" },
  { id: "contato", number: "15", title: "Contato" },
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

export default function TermosDeUso() {
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
      <Header activePage="termos-de-uso" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <FileText className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Documento Legal</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Termos de <span className="gradient-text">Uso</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Leia atentamente os termos abaixo antes de utilizar a plataforma BolãoMax.
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
              <Section id="aceitacao" number="1" title="Aceitação dos Termos">
                <p>Ao acessar ou utilizar a plataforma BolãoMax ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concordar com qualquer parte destes Termos, não deverá acessar ou utilizar a Plataforma.</p>
                <p>O uso continuado da Plataforma após quaisquer modificações destes Termos constitui aceitação dessas alterações.</p>
                <p>Você declara ter pelo menos 18 (dezoito) anos de idade e capacidade legal para celebrar este acordo.</p>
              </Section>

              <Section id="descricao" number="2" title="Descrição do Serviço">
                <p>O BolãoMax é uma plataforma digital que facilita a organização e participação em bolões de loterias federais brasileiras.</p>
                <p><strong>Importante:</strong> O BolãoMax NÃO é uma loteria, casa de apostas ou operador de jogos de azar. Todos os jogos são registrados exclusivamente na Caixa Econômica Federal.</p>
              </Section>

              <Section id="cadastro" number="3" title="Cadastro e Conta">
                <p>Para utilizar os serviços da Plataforma, você deve criar uma conta fornecendo informações verdadeiras, precisas, atuais e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
              </Section>

              <Section id="uso" number="4" title="Uso da Plataforma">
                <p>Você concorda em utilizar a Plataforma apenas para fins lícitos e de acordo com estes Termos. É proibido utilizar a Plataforma para propósitos ilegais, fraudulentos ou que interfiram no funcionamento do serviço.</p>
              </Section>

              <Section id="participacao" number="5" title="Participação em Bolões">
                <p>Ao participar de um bolão, você adquire uma cota percentual do valor total do bolão. Seu direito ao prêmio é proporcional à sua participação. A participação é confirmada apenas após a compensação do pagamento.</p>
              </Section>

              <Section id="pagamentos" number="6" title="Pagamentos e Reembolsos">
                <p>Os pagamentos são processados por gateways de pagamento certificados. Reembolsos são possíveis apenas antes do registro dos jogos na Caixa ou em caso de cancelamento do bolão pela plataforma. Para cancelamentos solicitados pelo usuário, aplica-se uma taxa de 20% do valor da participação. O usuário receberá 80% do valor pago via PIX em até 24 horas após aprovação. Esta taxa cobre os custos de processamento já realizados: processamento do pagamento, registro da participação, alocação de cota e custos administrativos.</p>
              </Section>

              <Section id="premios" number="7" title="Prêmios e Saques">
                <p>Em caso de premiação, o valor é dividido proporcionalmente entre os participantes e creditado na conta do usuário. Prêmios menores (até R$ 10.000) são distribuídos em até 3 dias úteis após recebimento da Caixa. Prêmios maiores são distribuídos em até 5 dias úteis. Saques são processados via PIX em até 24 horas úteis após solicitação.</p>
              </Section>

              <Section id="responsabilidades-usuario" number="8" title="Responsabilidades do Usuário">
                <p>O usuário é responsável por: manter suas credenciais seguras, fornecer informações verdadeiras, manter dados atualizados, e jogar de forma responsável dentro de suas possibilidades financeiras.</p>
              </Section>

              <Section id="responsabilidades-plataforma" number="9" title="Responsabilidades da Plataforma">
                <p>O BolãoMax se compromete a: registrar os jogos oficialmente na Caixa, manter os bilhetes em segurança, distribuir prêmios de forma transparente e proporcional, e manter a plataforma funcionando adequadamente.</p>
              </Section>

              <Section id="propriedade" number="10" title="Propriedade Intelectual">
                <p>Todo o conteúdo, marca, design e tecnologia da Plataforma são de propriedade exclusiva do BolãoMax. É proibida a reprodução, distribuição ou modificação sem autorização prévia.</p>
              </Section>

              <Section id="privacidade" number="11" title="Privacidade">
                <p>O tratamento de dados pessoais está detalhado em nossa Política de Privacidade, que faz parte integrante destes Termos. Ao usar a Plataforma, você também concorda com nossa Política de Privacidade.</p>
              </Section>

              <Section id="limitacao" number="12" title="Limitação de Responsabilidade">
                <p>O BolãoMax não se responsabiliza por: resultados dos sorteios (realizados exclusivamente pela Caixa), perdas decorrentes de apostas, problemas técnicos fora de nosso controle, ou ações de terceiros.</p>
              </Section>

              <Section id="modificacoes" number="13" title="Modificações">
                <p>O BolãoMax reserva-se o direito de modificar estes Termos a qualquer momento. Alterações serão comunicadas através da Plataforma e entrarão em vigor imediatamente após publicação.</p>
              </Section>

              <Section id="lei" number="14" title="Lei Aplicável">
                <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.</p>
              </Section>

              <Section id="contato" number="15" title="Contato">
                <p>Para dúvidas sobre estes Termos ou sobre a Plataforma, entre em contato através do email suporte@bolaomax.com ou através de nossa Central de Ajuda.</p>
              </Section>
            </div>
          </div>
        </section>
      </main>
      
      <Footer activePage="termos-de-uso" />
    </div>
  );
}
