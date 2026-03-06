import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  TrendingUp,
  FileText,
  Image,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Shield,
  Clock,
  FileSearch,
  Target,
  BarChart3,
  Download,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Zap,
  Eye,
  Tag
} from "lucide-react";

// Types
interface PageSEOData {
  url: string;
  title: string;
  titleLength: number;
  hasMetaDescription: boolean;
  descriptionLength: number;
  hasCanonical: boolean;
  hasSchema: boolean;
  h1Count: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinks: number;
  wordCount: number;
  issues: string[];
  score: number;
}

interface SEOCheck {
  name: string;
  status: "pass" | "warning" | "fail";
  message: string;
  value?: string | number;
}

// Mock page data for audit
const mockPages: PageSEOData[] = [
  { url: "/", title: "BolãoMax - Bolões de Loteria Online", titleLength: 37, hasMetaDescription: true, descriptionLength: 145, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 3, imagesWithAlt: 3, internalLinks: 12, wordCount: 850, issues: [], score: 95 },
  { url: "/lotofacil", title: "Bolões Lotofácil - BolãoMax", titleLength: 28, hasMetaDescription: true, descriptionLength: 138, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 8, wordCount: 420, issues: ["Adicionar mais conteúdo (mín. 500 palavras)"], score: 82 },
  { url: "/megasena", title: "Bolões Mega-Sena - BolãoMax", titleLength: 28, hasMetaDescription: true, descriptionLength: 142, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 7, wordCount: 380, issues: ["Adicionar mais conteúdo (mín. 500 palavras)"], score: 78 },
  { url: "/quina", title: "Bolões Quina - BolãoMax", titleLength: 24, hasMetaDescription: true, descriptionLength: 135, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 6, wordCount: 350, issues: ["Adicionar mais conteúdo (mín. 500 palavras)"], score: 75 },
  { url: "/como-funciona", title: "Como Funciona - BolãoMax", titleLength: 25, hasMetaDescription: true, descriptionLength: 155, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 4, imagesWithAlt: 4, internalLinks: 10, wordCount: 1200, issues: [], score: 98 },
  { url: "/blog", title: "Blog - BolãoMax", titleLength: 16, hasMetaDescription: true, descriptionLength: 120, hasCanonical: true, hasSchema: false, h1Count: 1, imageCount: 6, imagesWithAlt: 5, internalLinks: 15, wordCount: 300, issues: ["Adicionar Schema.org ArticleList", "1 imagem sem alt text"], score: 72 },
  { url: "/sobre-nos", title: "Sobre Nós", titleLength: 9, hasMetaDescription: false, descriptionLength: 0, hasCanonical: true, hasSchema: false, h1Count: 1, imageCount: 2, imagesWithAlt: 1, internalLinks: 4, wordCount: 600, issues: ["Título muito curto", "Adicionar meta description", "Adicionar Schema.org Organization", "1 imagem sem alt text"], score: 45 },
  { url: "/contato", title: "Contato - BolãoMax", titleLength: 18, hasMetaDescription: true, descriptionLength: 130, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 3, wordCount: 200, issues: ["Adicionar mais links internos"], score: 85 },
  { url: "/termos-de-uso", title: "Termos de Uso - BolãoMax", titleLength: 25, hasMetaDescription: true, descriptionLength: 140, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 5, wordCount: 2500, issues: [], score: 92 },
  { url: "/politica-privacidade", title: "Política de Privacidade - BolãoMax", titleLength: 35, hasMetaDescription: true, descriptionLength: 148, hasCanonical: true, hasSchema: true, h1Count: 1, imageCount: 0, imagesWithAlt: 0, internalLinks: 4, wordCount: 3000, issues: [], score: 94 },
];

// Technical SEO Checks
const technicalChecks: SEOCheck[] = [
  { name: "SSL/HTTPS", status: "pass", message: "Site usa HTTPS", value: "Ativo" },
  { name: "Robots.txt", status: "pass", message: "Arquivo robots.txt válido", value: "/robots.txt" },
  { name: "Sitemap.xml", status: "pass", message: "Sitemap acessível e válido", value: "/sitemap.xml" },
  { name: "Mobile-Friendly", status: "pass", message: "Site responsivo", value: "100%" },
  { name: "Page Speed (Desktop)", status: "pass", message: "Score acima de 90", value: "94" },
  { name: "Page Speed (Mobile)", status: "warning", message: "Score pode melhorar", value: "78" },
  { name: "Core Web Vitals - LCP", status: "pass", message: "Largest Contentful Paint OK", value: "2.1s" },
  { name: "Core Web Vitals - FID", status: "pass", message: "First Input Delay OK", value: "45ms" },
  { name: "Core Web Vitals - CLS", status: "pass", message: "Cumulative Layout Shift OK", value: "0.05" },
  { name: "Canonical Tags", status: "pass", message: "9/10 páginas têm canonical", value: "90%" },
  { name: "Meta Descriptions", status: "warning", message: "1 página sem meta description", value: "9/10" },
  { name: "Structured Data", status: "warning", message: "2 páginas sem Schema.org", value: "8/10" },
];

// Keyword tracking
const trackedKeywords = [
  { keyword: "bolão lotofácil", position: 12, change: 3, volume: 8100, difficulty: 45 },
  { keyword: "bolão mega-sena", position: 18, change: -2, volume: 12000, difficulty: 52 },
  { keyword: "bolão online", position: 25, change: 5, volume: 4400, difficulty: 38 },
  { keyword: "loteria em grupo", position: 8, change: 2, volume: 2900, difficulty: 32 },
  { keyword: "como participar de bolão", position: 15, change: 0, volume: 1900, difficulty: 28 },
  { keyword: "bolão quina", position: 22, change: 1, volume: 3200, difficulty: 35 },
];

// SEO Suggestions
const seoSuggestions = [
  { page: "/sobre-nos", suggestion: "Adicionar meta description", priority: "high", type: "meta" },
  { page: "/sobre-nos", suggestion: "Expandir título para incluir palavras-chave", priority: "high", type: "title" },
  { page: "/blog", suggestion: "Adicionar Schema.org ArticleList", priority: "medium", type: "schema" },
  { page: "/blog", suggestion: "Adicionar alt text em 1 imagem", priority: "medium", type: "image" },
  { page: "/lotofacil", suggestion: "Aumentar conteúdo para 500+ palavras", priority: "medium", type: "content" },
  { page: "/megasena", suggestion: "Aumentar conteúdo para 500+ palavras", priority: "medium", type: "content" },
  { page: "/quina", suggestion: "Aumentar conteúdo para 500+ palavras", priority: "medium", type: "content" },
  { page: "/contato", suggestion: "Adicionar mais links internos", priority: "low", type: "links" },
];

// Score color helper
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-green-500/20 border-green-500/30";
  if (score >= 50) return "bg-yellow-500/20 border-yellow-500/30";
  return "bg-red-500/20 border-red-500/30";
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pass": return <CheckCircle className="w-4 h-4 text-green-400" />;
    case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "fail": return <XCircle className="w-4 h-4 text-red-400" />;
    default: return null;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high": return <Badge className="bg-red-500/20 text-red-400">Alta</Badge>;
    case "medium": return <Badge className="bg-yellow-500/20 text-yellow-400">Média</Badge>;
    case "low": return <Badge className="bg-blue-500/20 text-blue-400">Baixa</Badge>;
    default: return null;
  }
};

export default function AdminSEOAudit() {
  const [activeTab, setActiveTab] = useState<"overview" | "pages" | "keywords" | "suggestions">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate overall health score
  const overallScore = useMemo(() => {
    const avg = mockPages.reduce((acc, p) => acc + p.score, 0) / mockPages.length;
    return Math.round(avg);
  }, []);

  // Filter pages
  const filteredPages = useMemo(() => {
    if (!searchQuery) return mockPages;
    return mockPages.filter(p => 
      p.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    totalPages: mockPages.length,
    pagesWithIssues: mockPages.filter(p => p.issues.length > 0).length,
    avgScore: overallScore,
    totalIssues: mockPages.reduce((acc, p) => acc + p.issues.length, 0),
    passedChecks: technicalChecks.filter(c => c.status === "pass").length,
    totalChecks: technicalChecks.length,
  }), [overallScore]);

  return (
    <AdminLayout title="Auditoria SEO" subtitle="Análise completa do SEO do site">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-bolao-card-border pb-4">
          {[
            { id: "overview", label: "Visão Geral", icon: BarChart3 },
            { id: "pages", label: "Páginas", icon: FileText },
            { id: "keywords", label: "Keywords", icon: Target },
            { id: "suggestions", label: "Sugestões", icon: Zap },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={activeTab === tab.id ? "bg-bolao-green text-bolao-dark" : ""}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
          <div className="flex-1" />
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark">
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-analisar
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Overall Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={`p-6 border ${getScoreBg(overallScore)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Health Score</h3>
                  <TrendingUp className="w-5 h-5 text-bolao-green" />
                </div>
                <div className="flex items-end gap-4">
                  <span className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </span>
                  <span className="text-2xl text-muted-foreground mb-2">/100</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {overallScore >= 80 ? "Excelente! SEO bem otimizado." : 
                   overallScore >= 50 ? "Bom, mas pode melhorar." : 
                   "Precisa de atenção urgente."}
                </p>
              </Card>

              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4">Resumo Técnico</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verificações Técnicas</span>
                    <span className="font-medium">{stats.passedChecks}/{stats.totalChecks}</span>
                  </div>
                  <div className="h-2 bg-bolao-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-bolao-green transition-all"
                      style={{ width: `${(stats.passedChecks / stats.totalChecks) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 rounded bg-green-500/10">
                      <p className="text-lg font-bold text-green-400">{technicalChecks.filter(c => c.status === "pass").length}</p>
                      <p className="text-xs text-muted-foreground">Passou</p>
                    </div>
                    <div className="text-center p-2 rounded bg-yellow-500/10">
                      <p className="text-lg font-bold text-yellow-400">{technicalChecks.filter(c => c.status === "warning").length}</p>
                      <p className="text-xs text-muted-foreground">Aviso</p>
                    </div>
                    <div className="text-center p-2 rounded bg-red-500/10">
                      <p className="text-lg font-bold text-red-400">{technicalChecks.filter(c => c.status === "fail").length}</p>
                      <p className="text-xs text-muted-foreground">Falhou</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <h3 className="font-semibold mb-4">Estatísticas</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Páginas Analisadas</span>
                    </div>
                    <span className="font-bold">{stats.totalPages}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Com Problemas</span>
                    </div>
                    <span className="font-bold">{stats.pagesWithIssues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm">Total de Issues</span>
                    </div>
                    <span className="font-bold">{stats.totalIssues}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-bolao-green" />
                      <span className="text-sm">Keywords Rastreadas</span>
                    </div>
                    <span className="font-bold">{trackedKeywords.length}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Technical SEO Checks */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-bolao-green" />
                Verificações Técnicas de SEO
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technicalChecks.map((check) => (
                  <div 
                    key={check.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark border border-bolao-card-border"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-medium text-sm">{check.name}</p>
                        <p className="text-xs text-muted-foreground">{check.message}</p>
                      </div>
                    </div>
                    {check.value && (
                      <Badge variant="outline" className="text-xs">
                        {check.value}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === "pages" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar páginas..."
                  className="pl-9 bg-bolao-card border-bolao-card-border"
                />
              </div>
            </div>

            {/* Pages Table */}
            <Card className="bg-bolao-card border-bolao-card-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-bolao-dark">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Página</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Score</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Título</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Meta</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Conteúdo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Issues</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <tr key={page.url} className="border-t border-bolao-card-border hover:bg-bolao-dark/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{page.url}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-lg font-bold ${getScoreColor(page.score)}`}>
                          {page.score}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="truncate max-w-[200px]">{page.title}</p>
                          <p className="text-xs text-muted-foreground">{page.titleLength} chars</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {page.hasMetaDescription ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle className="w-3 h-3" />
                            {page.descriptionLength} chars
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <XCircle className="w-3 h-3" />
                            Faltando
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <p><span className="text-muted-foreground">Palavras:</span> {page.wordCount}</p>
                          <p><span className="text-muted-foreground">Links:</span> {page.internalLinks}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        {page.issues.length > 0 ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            {page.issues.length} issues
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400">OK</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === "keywords" && (
          <div className="space-y-4">
            <Card className="bg-bolao-card border-bolao-card-border overflow-hidden">
              <div className="p-4 border-b border-bolao-card-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-bolao-green" />
                  Keywords Rastreadas
                </h3>
                <p className="text-sm text-muted-foreground">Posições estimadas no Google Brasil</p>
              </div>
              <table className="w-full">
                <thead className="bg-bolao-dark">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Keyword</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Posição</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Mudança</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Volume</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Dificuldade</th>
                  </tr>
                </thead>
                <tbody>
                  {trackedKeywords.map((kw) => (
                    <tr key={kw.keyword} className="border-t border-bolao-card-border hover:bg-bolao-dark/50">
                      <td className="p-4 font-medium">{kw.keyword}</td>
                      <td className="p-4">
                        <span className={`text-lg font-bold ${kw.position <= 10 ? "text-green-400" : kw.position <= 20 ? "text-yellow-400" : "text-muted-foreground"}`}>
                          #{kw.position}
                        </span>
                      </td>
                      <td className="p-4">
                        {kw.change > 0 ? (
                          <span className="text-green-400">▲ {kw.change}</span>
                        ) : kw.change < 0 ? (
                          <span className="text-red-400">▼ {Math.abs(kw.change)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {kw.volume.toLocaleString()}/mês
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-bolao-dark rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${kw.difficulty <= 30 ? "bg-green-500" : kw.difficulty <= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{kw.difficulty}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === "suggestions" && (
          <div className="space-y-4">
            <Card className="bg-bolao-card border-bolao-card-border">
              <div className="p-4 border-b border-bolao-card-border">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-bolao-green" />
                  Sugestões de Otimização
                </h3>
                <p className="text-sm text-muted-foreground">
                  {seoSuggestions.length} melhorias identificadas
                </p>
              </div>
              <div className="divide-y divide-bolao-card-border">
                {seoSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-bolao-dark/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-bolao-dark">
                        {suggestion.type === "meta" && <Tag className="w-4 h-4 text-blue-400" />}
                        {suggestion.type === "title" && <FileText className="w-4 h-4 text-purple-400" />}
                        {suggestion.type === "schema" && <FileSearch className="w-4 h-4 text-cyan-400" />}
                        {suggestion.type === "image" && <Image className="w-4 h-4 text-pink-400" />}
                        {suggestion.type === "content" && <FileText className="w-4 h-4 text-green-400" />}
                        {suggestion.type === "links" && <LinkIcon className="w-4 h-4 text-orange-400" />}
                      </div>
                      <div>
                        <p className="font-medium">{suggestion.suggestion}</p>
                        <p className="text-sm text-muted-foreground font-mono">{suggestion.page}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(suggestion.priority)}
                      <Button variant="outline" size="sm">
                        Corrigir
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
