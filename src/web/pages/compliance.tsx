import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Shield,
  FileText,
  Cookie,
  RotateCcw,
  Scale,
  Lock,
  ChevronRight,
  Download,
  Calendar,
  CheckCircle,
  ExternalLink
} from "lucide-react";

// Legal documents
const legalDocuments = [
  {
    title: "Termos de Uso",
    description: "Regras e condições para utilização da plataforma BolãoMax, incluindo participação em bolões, responsabilidades e limitações.",
    href: "/termos-de-uso",
    icon: FileText,
    lastUpdated: "15/01/2025",
    version: "2.1",
    highlights: [
      "Elegibilidade (18+ anos)",
      "Regras de participação",
      "Política de prêmios",
      "Lei brasileira aplicável"
    ]
  },
  {
    title: "Política de Privacidade",
    description: "Como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais em conformidade com a LGPD.",
    href: "/politica-privacidade",
    icon: Shield,
    lastUpdated: "15/01/2025",
    version: "2.0",
    highlights: [
      "Dados coletados",
      "Direitos do titular (LGPD)",
      "Retenção de dados",
      "Contato do DPO"
    ]
  },
  {
    title: "Política de Cookies",
    description: "Informações sobre os cookies utilizados em nosso site, suas finalidades e como gerenciá-los.",
    href: "/politica-cookies",
    icon: Cookie,
    lastUpdated: "15/01/2025",
    version: "1.0",
    highlights: [
      "Tipos de cookies",
      "Cookies de terceiros",
      "Como desativar",
      "Consentimento LGPD"
    ]
  },
  {
    title: "Política de Reembolso",
    description: "Condições e procedimentos para solicitação de reembolso de participações em bolões.",
    href: "/politica-reembolso",
    icon: RotateCcw,
    lastUpdated: "15/01/2025",
    version: "1.5",
    highlights: [
      "Quando é possível",
      "Taxa de 20%",
      "Prazo de 24h (PIX)",
      "Como solicitar"
    ]
  }
];

// Compliance certifications/badges
const complianceBadges = [
  { name: "LGPD", description: "Lei Geral de Proteção de Dados", icon: Shield },
  { name: "SSL/TLS", description: "Conexão criptografada", icon: Lock },
  { name: "PCI DSS", description: "Padrão de segurança de pagamentos", icon: Scale },
];

// Version history
const versionHistory = [
  { date: "15/01/2025", document: "Termos de Uso", version: "2.1", changes: "Atualização das regras de participação" },
  { date: "15/01/2025", document: "Política de Privacidade", version: "2.0", changes: "Maior detalhamento sobre direitos LGPD" },
  { date: "15/01/2025", document: "Política de Cookies", version: "1.0", changes: "Documento criado" },
  { date: "10/12/2024", document: "Política de Reembolso", version: "1.5", changes: "Esclarecimento sobre taxa de cancelamento" },
  { date: "01/11/2024", document: "Termos de Uso", version: "2.0", changes: "Revisão geral dos termos" },
];

export default function Compliance() {
  return (
    <div className="min-h-screen bg-bolao-dark text-white overflow-hidden">
      <Header activePage="compliance" />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="absolute inset-0 radial-gradient" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
              <Scale className="w-4 h-4 text-bolao-green" />
              <span className="text-sm font-medium text-muted-foreground">Transparência Legal</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Conformidade e <span className="gradient-text">Documentos Legais</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparência é um dos nossos valores fundamentais. Aqui você encontra todos os documentos legais que regem nossa relação.
            </p>
          </div>
        </section>

        {/* Compliance Badges */}
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              {complianceBadges.map((badge) => (
                <div
                  key={badge.name}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-bolao-card/60 border border-bolao-card-border"
                >
                  <badge.icon className="w-5 h-5 text-bolao-green" />
                  <div>
                    <p className="font-bold text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-bolao-green" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal Documents */}
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Documentos Legais</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {legalDocuments.map((doc) => (
                <Card key={doc.title} className="p-6 bg-bolao-card/40 border-bolao-card-border hover:border-bolao-green/50 transition-colors">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-bolao-green/10">
                      <doc.icon className="w-6 h-6 text-bolao-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{doc.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {doc.lastUpdated}
                        </span>
                        <span>v{doc.version}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Principais pontos:</p>
                    <ul className="grid grid-cols-2 gap-1">
                      {doc.highlights.map((highlight) => (
                        <li key={highlight} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-bolao-green flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link href={doc.href}>
                    <Button variant="outline" className="w-full">
                      Ler documento completo
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Version History */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Histórico de Versões</h2>
            
            <Card className="p-6 bg-bolao-card/40 border-bolao-card-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-bolao-card-border">
                    <th className="text-left py-3 px-4 font-semibold">Data</th>
                    <th className="text-left py-3 px-4 font-semibold">Documento</th>
                    <th className="text-left py-3 px-4 font-semibold">Versão</th>
                    <th className="text-left py-3 px-4 font-semibold">Alterações</th>
                  </tr>
                </thead>
                <tbody>
                  {versionHistory.map((entry, index) => (
                    <tr key={index} className="border-b border-bolao-card-border/50 hover:bg-bolao-dark/30">
                      <td className="py-3 px-4 text-muted-foreground">{entry.date}</td>
                      <td className="py-3 px-4 font-medium">{entry.document}</td>
                      <td className="py-3 px-4 text-bolao-green">v{entry.version}</td>
                      <td className="py-3 px-4 text-muted-foreground">{entry.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* LGPD Rights */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 bg-gradient-to-br from-bolao-green/10 via-bolao-card/80 to-bolao-green/5 border-bolao-green/30">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 rounded-xl bg-bolao-green/20">
                  <Shield className="w-8 h-8 text-bolao-green" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Seus Direitos (LGPD)</h2>
                  <p className="text-muted-foreground">Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  "Confirmação e acesso aos seus dados",
                  "Correção de dados incompletos ou incorretos",
                  "Anonimização ou bloqueio de dados desnecessários",
                  "Portabilidade dos dados para outro fornecedor",
                  "Eliminação dos dados pessoais",
                  "Informação sobre compartilhamento com terceiros",
                  "Revogação do consentimento a qualquer momento",
                  "Revisão de decisões automatizadas"
                ].map((right) => (
                  <div key={right} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-bolao-green flex-shrink-0" />
                    <span>{right}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/suporte">
                  <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark">
                    Exercer meus direitos
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="mailto:dpo@bolaomax.com">
                  <Button variant="outline">
                    Contatar DPO
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Dúvidas sobre Compliance?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Se você tiver qualquer dúvida sobre nossos documentos legais, políticas de privacidade ou seus direitos, entre em contato conosco.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Card className="p-4 bg-bolao-card/40 border-bolao-card-border text-left">
                <p className="text-sm font-medium mb-1">Encarregado de Proteção de Dados (DPO)</p>
                <a href="mailto:dpo@bolaomax.com" className="text-bolao-green hover:underline">dpo@bolaomax.com</a>
              </Card>
              <Card className="p-4 bg-bolao-card/40 border-bolao-card-border text-left">
                <p className="text-sm font-medium mb-1">Suporte Geral</p>
                <a href="mailto:suporte@bolaomax.com" className="text-bolao-green hover:underline">suporte@bolaomax.com</a>
              </Card>
              <Card className="p-4 bg-bolao-card/40 border-bolao-card-border text-left">
                <p className="text-sm font-medium mb-1">Jurídico</p>
                <a href="mailto:juridico@bolaomax.com" className="text-bolao-green hover:underline">juridico@bolaomax.com</a>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer activePage="compliance" />
    </div>
  );
}
