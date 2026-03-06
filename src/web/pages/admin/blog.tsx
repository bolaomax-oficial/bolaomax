import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAllPosts,
  getAllCategories,
  createPost,
  updatePost,
  deletePost,
  calculateReadingTime,
  formatDate,
  type BlogPost,
  BLOG_CATEGORIES
} from "@/services/blogService";
import { getSEOScore, type SEOScore } from "@/services/seoService";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Star,
  TrendingUp,
  BarChart3,
  Image as ImageIcon,
  Sparkles,
  GripVertical,
  FolderOpen,
  Wand2,
  FileEdit,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Timer,
  MousePointerClick,
  Layers,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";

// Content Templates
const CONTENT_TEMPLATES = [
  {
    id: "dicas",
    name: "Dicas de Loteria",
    icon: "💡",
    excerpt: "Descubra dicas valiosas para aumentar suas chances de ganhar na loteria...",
    content: `# Dicas para Ganhar na {LOTERIA}

## Introdução
Muitos apostadores buscam estratégias para aumentar suas chances de sucesso. Neste artigo, compartilhamos dicas valiosas.

## 1. Entenda as Probabilidades
A {LOTERIA} tem chances de 1 em X milhões. Conhecer as odds é fundamental.

## 2. Aposte em Grupo
Participar de bolões aumenta suas chances proporcionalmente ao número de jogos.

## 3. Seja Consistente
Apostar regularmente, mesmo valores menores, aumenta suas oportunidades.

## 4. Analise os Resultados
Estude os números mais e menos sorteados para fazer escolhas informadas.

## Conclusão
Lembre-se: a loteria é um jogo de sorte, mas estratégias inteligentes podem ajudar.

---
*Aposte com responsabilidade.*`,
    tags: ["dicas", "estratégias", "loteria"]
  },
  {
    id: "analise",
    name: "Análise de Resultados",
    icon: "📊",
    excerpt: "Análise completa dos últimos resultados da loteria com estatísticas e padrões...",
    content: `# Análise dos Resultados da {LOTERIA} - {DATA}

## Números Sorteados
Os números do concurso {CONCURSO} foram: **XX, XX, XX, XX, XX, XX**

## Estatísticas do Concurso

### Dezenas Pares vs Ímpares
- Pares: X dezenas
- Ímpares: X dezenas

### Distribuição por Faixa
- 01-20: X dezenas
- 21-40: X dezenas
- 41-60: X dezenas

## Números Quentes e Frios
Os números mais sorteados nos últimos 30 concursos foram: XX, XX, XX
Os menos sorteados foram: XX, XX, XX

## Próximo Concurso
O próximo sorteio acontece em {DATA_PROXIMO} com prêmio estimado de R$ XX milhões.

## Participe do BolãoMax
Aumente suas chances participando de nossos bolões!

[Ver Bolões Disponíveis](/lotofacil)`,
    tags: ["resultados", "análise", "estatísticas"]
  },
  {
    id: "ganhador",
    name: "História de Ganhador",
    icon: "🏆",
    excerpt: "Conheça a história inspiradora de quem realizou o sonho de ganhar na loteria...",
    content: `# {NOME}: A História de Quem Ganhou na {LOTERIA}

## O Sonho que se Tornou Realidade

{NOME}, de {CIDADE}, nunca imaginou que sua vida mudaria em {DATA}. Com um boleto simples de R$ {VALOR}, conquistou o prêmio de R$ {PREMIO} milhões.

## Como Tudo Começou

> "Eu sempre acreditei que um dia seria minha vez. Apostava toda semana, às vezes sozinho, às vezes em bolões." - {NOME}

## O Momento da Descoberta

Ao conferir os números na manhã seguinte, {NOME} não acreditou. Conferiu três vezes antes de ligar para a família.

## Planos para o Futuro

Com o prêmio, {NOME} planeja:
- Quitar dívidas
- Ajudar a família
- Investir em imóveis
- Realizar uma viagem dos sonhos

## Dica do Ganhador

"Minha dica é: nunca desista. Aposte com responsabilidade, participe de bolões para aumentar as chances, e mantenha a fé."

---

*Quer ser o próximo? [Participe dos nossos bolões!](/lotofacil)*`,
    tags: ["história", "ganhadores", "inspiração"]
  }
];

// SEO Score Display Component
const SEOScoreDisplay = ({ score, onOptimize }: { score: SEOScore; onOptimize?: () => void }) => {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-400";
    if (value >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="bg-bolao-dark border-bolao-card-border p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-bolao-green" />
        SEO Score
      </h4>
      <div className="text-center mb-4">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-bolao-card-border"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * score.overall) / 100}
              className={getScoreColor(score.overall)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Título</span>
            <span className={getScoreColor(score.title.score)}>{score.title.score}/25</span>
          </div>
          <div className="h-1.5 bg-bolao-card rounded-full overflow-hidden">
            <div className={`h-full ${getScoreBg(score.title.score * 4)} transition-all`} style={{ width: `${score.title.score * 4}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{score.title.message}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Descrição</span>
            <span className={getScoreColor(score.description.score)}>{score.description.score}/25</span>
          </div>
          <div className="h-1.5 bg-bolao-card rounded-full overflow-hidden">
            <div className={`h-full ${getScoreBg(score.description.score * 4)} transition-all`} style={{ width: `${score.description.score * 4}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{score.description.message}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Keywords</span>
            <span className={getScoreColor(score.keywords.score)}>{score.keywords.score}/25</span>
          </div>
          <div className="h-1.5 bg-bolao-card rounded-full overflow-hidden">
            <div className={`h-full ${getScoreBg(score.keywords.score * 4)} transition-all`} style={{ width: `${score.keywords.score * 4}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{score.keywords.message}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Conteúdo</span>
            <span className={getScoreColor(score.content.score)}>{score.content.score}/25</span>
          </div>
          <div className="h-1.5 bg-bolao-card rounded-full overflow-hidden">
            <div className={`h-full ${getScoreBg(score.content.score * 4)} transition-all`} style={{ width: `${score.content.score * 4}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{score.content.message}</p>
        </div>
      </div>
      {onOptimize && score.overall < 80 && (
        <Button
          onClick={onOptimize}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Otimizar para SEO
        </Button>
      )}
    </Card>
  );
};

// Media Library Modal
const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock media items
  const mediaItems = [
    { id: "1", url: "/images/blog/lotofacil-dicas.jpg", name: "Lotofácil Dicas", size: "245 KB", date: "10/01/2025" },
    { id: "2", url: "/images/blog/megasena-banner.jpg", name: "Mega-Sena Banner", size: "312 KB", date: "08/01/2025" },
    { id: "3", url: "/images/blog/quina-resultado.jpg", name: "Quina Resultado", size: "189 KB", date: "05/01/2025" },
    { id: "4", url: "/images/blog/bolao-grupo.jpg", name: "Bolão em Grupo", size: "267 KB", date: "03/01/2025" },
    { id: "5", url: "/images/blog/ganhadores.jpg", name: "Ganhadores", size: "198 KB", date: "01/01/2025" },
    { id: "6", url: "/images/blog/estatisticas.jpg", name: "Estatísticas", size: "156 KB", date: "28/12/2024" },
  ];

  const filteredMedia = mediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-bolao-card border-bolao-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-bolao-green" />
            Biblioteca de Mídia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload and Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar mídia..."
                className="pl-9 bg-bolao-dark border-bolao-card-border"
              />
            </div>
            <Button className="bg-bolao-green hover:bg-bolao-green-dark">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-1">
            {filteredMedia.map(item => (
              <div
                key={item.id}
                onClick={() => { onSelect(item.url); onClose(); }}
                className="group relative aspect-square rounded-lg overflow-hidden border border-bolao-card-border cursor-pointer hover:border-bolao-green transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-bolao-dark to-bolao-card flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="sm" className="bg-bolao-green hover:bg-bolao-green-dark">
                    Selecionar
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.size}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma mídia encontrada</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Content Templates Modal
const ContentTemplatesModal = ({
  isOpen,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: typeof CONTENT_TEMPLATES[0]) => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-bolao-card border-bolao-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-bolao-green" />
            Templates de Conteúdo
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {CONTENT_TEMPLATES.map(template => (
            <Card
              key={template.id}
              onClick={() => { onSelect(template); onClose(); }}
              className="bg-bolao-dark border-bolao-card-border p-4 cursor-pointer hover:border-bolao-green transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{template.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{template.excerpt}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs border-bolao-card-border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Featured Posts Manager Modal
const FeaturedPostsModal = ({
  isOpen,
  onClose,
  posts,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  posts: BlogPost[];
  onSave: (featuredIds: string[]) => void;
}) => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>(
    posts.filter(p => p.featured).slice(0, 5)
  );

  const movePost = (index: number, direction: "up" | "down") => {
    const newPosts = [...featuredPosts];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newPosts.length) {
      [newPosts[index], newPosts[newIndex]] = [newPosts[newIndex], newPosts[index]];
      setFeaturedPosts(newPosts);
    }
  };

  const removeFromFeatured = (id: string) => {
    setFeaturedPosts(featuredPosts.filter(p => p.id !== id));
  };

  const addToFeatured = (post: BlogPost) => {
    if (featuredPosts.length < 5 && !featuredPosts.find(p => p.id === post.id)) {
      setFeaturedPosts([...featuredPosts, post]);
    }
  };

  const availablePosts = posts.filter(
    p => p.status === "published" && !featuredPosts.find(fp => fp.id === p.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-bolao-card border-bolao-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Gerenciar Destaques
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Artigos em Destaque ({featuredPosts.length}/5)</h4>
            <div className="space-y-2">
              {featuredPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 bg-bolao-dark rounded-lg border border-bolao-card-border"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <span className="w-6 h-6 flex items-center justify-center bg-amber-500/20 text-amber-400 rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate">{post.title}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => movePost(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => movePost(index, "down")}
                      disabled={index === featuredPosts.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromFeatured(post.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {featuredPosts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Nenhum artigo em destaque</p>
              )}
            </div>
          </div>

          {featuredPosts.length < 5 && availablePosts.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Adicionar ao Destaque</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {availablePosts.slice(0, 10).map(post => (
                  <div
                    key={post.id}
                    onClick={() => addToFeatured(post)}
                    className="flex items-center gap-3 p-2 bg-bolao-dark rounded-lg border border-bolao-card-border cursor-pointer hover:border-bolao-green"
                  >
                    <Plus className="w-4 h-4 text-bolao-green" />
                    <span className="flex-1 truncate text-sm">{post.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-bolao-card-border">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              className="bg-bolao-green hover:bg-bolao-green-dark"
              onClick={() => {
                onSave(featuredPosts.map(p => p.id));
                onClose();
              }}
            >
              Salvar Ordem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Categories Manager Modal
const CategoriesManagerModal = ({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [categories, setCategories] = useState(BLOG_CATEGORIES);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCategory = () => {
    if (newCategory.name) {
      const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, "-");
      setCategories([
        ...categories,
        { id: `cat-${Date.now()}`, name: newCategory.name, slug, description: newCategory.description, count: 0 }
      ]);
      setNewCategory({ name: "", slug: "", description: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-bolao-card border-bolao-card-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-bolao-green" />
            Gerenciar Categorias
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Category */}
          <Card className="bg-bolao-dark border-bolao-card-border p-4">
            <h4 className="font-medium mb-3">Nova Categoria</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nome"
                className="bg-bolao-card border-bolao-card-border"
              />
              <Input
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                placeholder="Slug (auto)"
                className="bg-bolao-card border-bolao-card-border"
              />
              <Button onClick={handleAddCategory} className="bg-bolao-green hover:bg-bolao-green-dark">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </Card>

          {/* Categories List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-bolao-dark rounded-lg border border-bolao-card-border"
              >
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug} • {cat.count} artigos</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Post Editor Modal
const PostEditorModal = ({
  isOpen,
  onClose,
  post,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
  onSave: (data: Partial<BlogPost>) => void;
}) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>(
    post || {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featuredImage: "",
      author: "Equipe BolãoMax",
      categories: [],
      tags: [],
      status: "draft",
      featured: false,
      metaTitle: "",
      metaDescription: "",
      keywords: []
    }
  );
  const [tagsInput, setTagsInput] = useState(post?.tags.join(", ") || "");
  const [keywordsInput, setKeywordsInput] = useState(post?.keywords?.join(", ") || "");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const seoScore = useMemo(() => 
    getSEOScore(
      formData.metaTitle || formData.title,
      formData.metaDescription || formData.excerpt,
      formData.keywords || formData.tags,
      formData.content?.length
    ),
    [formData]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSave({
      ...formData,
      tags: tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean),
      keywords: keywordsInput.split(",").map(k => k.trim().toLowerCase()).filter(Boolean),
      slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "",
      publishDate: formData.publishDate || now,
      lastModified: now
    });
  };

  const generateSlug = () => {
    if (formData.title) {
      setFormData({
        ...formData,
        slug: formData.title.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      });
    }
  };

  const handleTemplateSelect = (template: typeof CONTENT_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      content: template.content,
      excerpt: template.excerpt,
      tags: template.tags
    });
    setTagsInput(template.tags.join(", "));
  };

  const handleOptimizeSEO = () => {
    // Auto-improve title and description for SEO
    const title = formData.title || "";
    const content = formData.content || "";
    
    // Generate optimized meta title (add site name, ensure length)
    let metaTitle = title;
    if (metaTitle.length < 30) {
      metaTitle = `${title} | Dicas e Estratégias | BolãoMax`;
    } else if (metaTitle.length > 60) {
      metaTitle = title.substring(0, 57) + "...";
    } else if (!metaTitle.includes("BolãoMax")) {
      metaTitle = `${title} | BolãoMax`;
    }

    // Generate optimized meta description
    let metaDescription = formData.excerpt || "";
    if (metaDescription.length < 120) {
      metaDescription = `${metaDescription} Aprenda mais sobre loterias e bolões no BolãoMax.`;
    }
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + "...";
    }

    // Extract keywords from content
    const commonWords = ["de", "a", "o", "e", "que", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se"];
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.includes(w));
    
    const wordCount: Record<string, number> = {};
    words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
    
    const topKeywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    setFormData({
      ...formData,
      metaTitle: metaTitle.substring(0, 60),
      metaDescription: metaDescription.substring(0, 160)
    });
    setKeywordsInput(topKeywords.join(", "));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-bolao-card border-bolao-card-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{post ? "Editar Artigo" : "Novo Artigo"}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="col-span-2 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Título *</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do artigo"
                  className="bg-bolao-dark border-bolao-card-border"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">Slug (URL)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="slug-do-artigo"
                    className="bg-bolao-dark border-bolao-card-border"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug} className="shrink-0">
                    Gerar
                  </Button>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">Resumo *</label>
                <textarea
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Breve resumo do artigo..."
                  className="w-full h-20 px-3 py-2 rounded-md bg-bolao-dark border border-bolao-card-border text-white resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{(formData.excerpt?.length || 0)}/200 caracteres</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Conteúdo * (Markdown)</label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="# Título&#10;&#10;Conteúdo do artigo em Markdown..."
                  className="w-full h-64 px-3 py-2 rounded-md bg-bolao-dark border border-bolao-card-border text-white font-mono text-sm resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(formData.content?.split(/\s+/).length || 0)} palavras • 
                  {calculateReadingTime(formData.content || "")} min de leitura
                </p>
              </div>

              {/* SEO Fields */}
              <Card className="bg-bolao-dark border-bolao-card-border p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-bolao-green" />
                  SEO
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Meta Título</label>
                    <Input
                      value={formData.metaTitle || ""}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder={formData.title || "Título para SEO (max 60 chars)"}
                      className="bg-bolao-card border-bolao-card-border"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{(formData.metaTitle?.length || 0)}/60</p>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Meta Descrição</label>
                    <textarea
                      value={formData.metaDescription || ""}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder={formData.excerpt || "Descrição para SEO (max 160 chars)"}
                      className="w-full h-16 px-3 py-2 rounded-md bg-bolao-card border border-bolao-card-border text-white resize-none text-sm"
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{(formData.metaDescription?.length || 0)}/160</p>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Keywords (separadas por vírgula)</label>
                    <Input
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="lotofácil, dicas, estratégias"
                      className="bg-bolao-card border-bolao-card-border"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-4">
              {/* Status & Actions */}
              <Card className="bg-bolao-dark border-bolao-card-border p-4">
                <h4 className="font-semibold mb-3">Publicação</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      value={formData.status || "draft"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as BlogPost["status"] })}
                      className="w-full px-3 py-2 rounded-md bg-bolao-card border border-bolao-card-border text-white"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="scheduled">Agendado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Autor</label>
                    <Input
                      value={formData.author || ""}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="bg-bolao-card border-bolao-card-border"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-bolao-card-border"
                    />
                    <span className="text-sm">Artigo em destaque</span>
                  </label>
                </div>
              </Card>

              {/* Categories */}
              <Card className="bg-bolao-dark border-bolao-card-border p-4">
                <h4 className="font-semibold mb-3">Categorias</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {BLOG_CATEGORIES.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.categories?.includes(cat.name) || false}
                        onChange={(e) => {
                          const cats = formData.categories || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, categories: [...cats, cat.name] });
                          } else {
                            setFormData({ ...formData, categories: cats.filter(c => c !== cat.name) });
                          }
                        }}
                        className="w-4 h-4 rounded border-bolao-card-border"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Tags */}
              <Card className="bg-bolao-dark border-bolao-card-border p-4">
                <h4 className="font-semibold mb-3">Tags</h4>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="lotofácil, dicas, estratégias"
                  className="bg-bolao-card border-bolao-card-border"
                />
                <p className="text-xs text-muted-foreground mt-1">Separadas por vírgula</p>
              </Card>

              {/* Featured Image */}
              <Card className="bg-bolao-dark border-bolao-card-border p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-bolao-green" />
                  Imagem Destaque
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={formData.featuredImage || ""}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    placeholder="/images/blog/imagem.jpg"
                    className="bg-bolao-card border-bolao-card-border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaLibrary(true)}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              {/* SEO Score */}
              <SEOScoreDisplay score={seoScore} onOptimize={handleOptimizeSEO} />
            </div>

            {/* Action Buttons */}
            <div className="col-span-3 flex justify-end gap-3 border-t border-bolao-card-border pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-bolao-green hover:bg-bolao-green-dark">
                <Save className="w-4 h-4 mr-2" />
                {post ? "Atualizar" : "Criar Artigo"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(url) => setFormData({ ...formData, featuredImage: url })}
      />

      {/* Templates Modal */}
      <ContentTemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplateSelect}
      />
    </>
  );
};

export default function AdminBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>(() => getAllPosts());

  const categories = useMemo(() => getAllCategories(), []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (categoryFilter !== "all" && !post.categories.includes(categoryFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!post.title.toLowerCase().includes(query) && 
            !post.excerpt.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [posts, statusFilter, categoryFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter(p => p.status === "published").length,
    draft: posts.filter(p => p.status === "draft").length,
    featured: posts.filter(p => p.featured).length,
    totalViews: posts.reduce((acc, p) => acc + p.views, 0),
    avgReadTime: Math.round(posts.reduce((acc, p) => acc + p.readingTime, 0) / posts.length || 0)
  }), [posts]);

  const handleSavePost = (data: Partial<BlogPost>) => {
    if (selectedPost) {
      const updated = updatePost(selectedPost.id, data);
      if (updated) {
        setPosts(posts.map(p => p.id === selectedPost.id ? updated : p));
      }
    } else {
      const newPost = createPost(data as Omit<BlogPost, "id" | "views" | "readingTime">);
      setPosts([newPost, ...posts]);
    }
    setIsEditorOpen(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este artigo?")) {
      if (deletePost(id)) {
        setPosts(posts.filter(p => p.id !== id));
      }
    }
  };

  const handleDuplicatePost = (post: BlogPost) => {
    const duplicate = createPost({
      ...post,
      title: `${post.title} (Cópia)`,
      slug: `${post.slug}-copia`,
      status: "draft",
      publishDate: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
    setPosts([duplicate, ...posts]);
  };

  const handleBulkAction = (action: "publish" | "draft" | "delete") => {
    if (selectedPosts.length === 0) return;
    
    if (action === "delete") {
      if (!confirm(`Excluir ${selectedPosts.length} artigos?`)) return;
      selectedPosts.forEach(id => deletePost(id));
      setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
    } else {
      const newStatus = action === "publish" ? "published" : "draft";
      const updatedPosts = posts.map(p => {
        if (selectedPosts.includes(p.id)) {
          const updated = updatePost(p.id, { status: newStatus });
          return updated || p;
        }
        return p;
      });
      setPosts(updatedPosts);
    }
    setSelectedPosts([]);
  };

  const toggleSelectPost = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter(p => p !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p.id));
    }
  };

  const handleSaveFeatured = (featuredIds: string[]) => {
    const updatedPosts = posts.map(p => {
      const shouldBeFeatured = featuredIds.includes(p.id);
      if (p.featured !== shouldBeFeatured) {
        const updated = updatePost(p.id, { featured: shouldBeFeatured });
        return updated || p;
      }
      return p;
    });
    setPosts(updatedPosts);
  };

  const getStatusBadge = (status: BlogPost["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Publicado</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500/20 text-yellow-400"><AlertCircle className="w-3 h-3 mr-1" />Rascunho</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500/20 text-blue-400"><Clock className="w-3 h-3 mr-1" />Agendado</Badge>;
    }
  };

  return (
    <AdminLayout title="Blog CMS" subtitle="Gerencie os artigos e conteúdo do blog">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-bolao-green" />
            </div>
          </Card>
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-400">{stats.published}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.draft}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Destaques</p>
                <p className="text-2xl font-bold text-amber-400">{stats.featured}</p>
              </div>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
          </Card>
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-sky-400">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-sky-400" />
            </div>
          </Card>
          <Card className="bg-bolao-card border-bolao-card-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold text-purple-400">{stats.avgReadTime}min</p>
              </div>
              <Timer className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artigos..."
                className="pl-9 w-64 bg-bolao-card border-bolao-card-border"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 rounded-md bg-bolao-card border border-bolao-card-border text-white"
            >
              <option value="all">Todos os Status</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-bolao-card border border-bolao-card-border text-white"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-bolao-card-border">
                <span className="text-sm text-muted-foreground">{selectedPosts.length} selecionados</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("publish")}
                >
                  Publicar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("draft")}
                >
                  Rascunho
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCategoriesManager(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Categorias
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowFeaturedManager(true)}
            >
              <Star className="w-4 h-4 mr-2" />
              Destaques
            </Button>
            <Button 
              className="bg-bolao-green hover:bg-bolao-green-dark"
              onClick={() => { setSelectedPost(null); setIsEditorOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Button>
          </div>
        </div>

        {/* Posts Table */}
        <Card className="bg-bolao-card border-bolao-card-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-bolao-dark">
              <tr>
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-bolao-card-border"
                  />
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">Artigo</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Views</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post.id} className="border-t border-bolao-card-border hover:bg-bolao-dark/50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => toggleSelectPost(post.id)}
                      className="w-4 h-4 rounded border-bolao-card-border"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {post.featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      <div>
                        <p className="font-medium text-white line-clamp-1">{post.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {post.categories.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs border-bolao-card-border">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(post.status)}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p>{formatDate(post.publishDate)}</p>
                      <p className="text-muted-foreground">{post.readingTime} min</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      {post.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedPost(post); setIsEditorOpen(true); }}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicatePost(post)}
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground mb-4">Crie seu primeiro artigo para começar.</p>
              <Button onClick={() => { setSelectedPost(null); setIsEditorOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Artigo
              </Button>
            </div>
          )}
        </Card>

        {/* Post Editor Modal */}
        <PostEditorModal
          isOpen={isEditorOpen}
          onClose={() => { setIsEditorOpen(false); setSelectedPost(null); }}
          post={selectedPost}
          onSave={handleSavePost}
        />

        {/* Featured Posts Manager Modal */}
        <FeaturedPostsModal
          isOpen={showFeaturedManager}
          onClose={() => setShowFeaturedManager(false)}
          posts={posts}
          onSave={handleSaveFeatured}
        />

        {/* Categories Manager Modal */}
        <CategoriesManagerModal
          isOpen={showCategoriesManager}
          onClose={() => setShowCategoriesManager(false)}
        />
      </div>
    </AdminLayout>
  );
}
