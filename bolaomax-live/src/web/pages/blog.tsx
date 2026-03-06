import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAllPosts,
  getFeaturedPosts,
  getAllCategories,
  getAllTags,
  searchPosts,
  getPostsByCategory,
  formatDate,
  type BlogPost
} from "@/services/blogService";
import {
  Search,
  Clock,
  Eye,
  Calendar,
  Tag,
  ChevronRight,
  Bookmark,
  TrendingUp,
  Sparkles
} from "lucide-react";

// Blog Post Card Component
const BlogPostCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={`group bg-bolao-card border-bolao-card-border hover:border-bolao-green/50 transition-all duration-300 overflow-hidden cursor-pointer ${featured ? "col-span-full md:col-span-2" : ""}`}>
        <div className={`${featured ? "md:flex" : ""}`}>
          {/* Image */}
          <div className={`relative overflow-hidden ${featured ? "md:w-1/2" : "h-48"}`}>
            <div className={`${featured ? "h-64 md:h-full" : "h-48"} bg-gradient-to-br from-bolao-green/20 to-emerald-900/20`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bookmark className="w-12 h-12 text-bolao-green/40" />
              </div>
            </div>
            {featured && (
              <Badge className="absolute top-4 left-4 bg-bolao-green text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>
          
          {/* Content */}
          <div className={`p-5 ${featured ? "md:w-1/2 md:p-6" : ""}`}>
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.slice(0, 2).map(cat => (
                <Badge key={cat} variant="outline" className="text-xs border-bolao-green/30 text-bolao-green">
                  {cat}
                </Badge>
              ))}
            </div>
            
            {/* Title */}
            <h3 className={`font-bold text-white group-hover:text-bolao-green transition-colors line-clamp-2 mb-2 ${featured ? "text-xl md:text-2xl" : "text-lg"}`}>
              {post.title}
            </h3>
            
            {/* Excerpt */}
            <p className={`text-muted-foreground line-clamp-2 mb-4 ${featured ? "text-base" : "text-sm"}`}>
              {post.excerpt}
            </p>
            
            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.publishDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime} min
                </span>
              </div>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Category Sidebar
const CategorySidebar = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: { 
  categories: ReturnType<typeof getAllCategories>; 
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}) => {
  return (
    <Card className="bg-bolao-card border-bolao-card-border p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <Tag className="w-4 h-4 text-bolao-green" />
        Categorias
      </h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            !selectedCategory 
              ? "bg-bolao-green/20 text-bolao-green" 
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          Todos os artigos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
              selectedCategory === cat.slug 
                ? "bg-bolao-green/20 text-bolao-green" 
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{cat.name}</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded">{cat.postCount}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

// Popular Tags
const PopularTags = ({ tags, onTagClick }: { tags: string[]; onTagClick: (tag: string) => void }) => {
  return (
    <Card className="bg-bolao-card border-bolao-card-border p-5">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-bolao-green" />
        Tags Populares
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 12).map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-muted-foreground hover:bg-bolao-green/20 hover:text-bolao-green transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const allPosts = useMemo(() => getAllPosts(), []);
  const featuredPosts = useMemo(() => getFeaturedPosts(), []);
  const categories = useMemo(() => getAllCategories(), []);
  const tags = useMemo(() => getAllTags(), []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    
    if (searchQuery) {
      posts = searchPosts(searchQuery);
    } else if (selectedCategory) {
      posts = getPostsByCategory(selectedCategory);
    }
    
    return posts;
  }, [allPosts, searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Blog | Dicas e Notícias sobre Loterias"
        description="Dicas, estratégias e notícias sobre loterias brasileiras. Aprenda a aumentar suas chances de ganhar com nossos artigos especializados."
        keywords={["blog loteria", "dicas loteria", "notícias loteria", "estratégias loteria", "como ganhar"]}
        pageType="blog"
        canonicalUrl="https://bolaomax.com.br/blog"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-bolao-green/10 text-bolao-green border-bolao-green/30 px-4 py-1">
            <Bookmark className="w-4 h-4 mr-2" />
            Central de Conteúdo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Blog <span className="gradient-text">BolãoMax</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dicas, estratégias e notícias sobre loterias. Aprenda com especialistas e aumente suas chances de ganhar.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar artigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 bg-bolao-card border-bolao-card-border text-white placeholder:text-muted-foreground focus:border-bolao-green"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Featured Posts (only show if no search/filter) */}
        {!searchQuery && !selectedCategory && featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-bolao-green" />
              Artigos em Destaque
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.slice(0, 2).map(post => (
                <BlogPostCard key={post.id} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Posts Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedCategory 
                  ? `Artigos: ${categories.find(c => c.slug === selectedCategory)?.name}`
                  : searchQuery 
                    ? `Resultados para "${searchQuery}"`
                    : "Todos os Artigos"
                }
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredPosts.length} artigo{filteredPosts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {paginatedPosts.length === 0 ? (
              <Card className="bg-bolao-card border-bolao-card-border p-12 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Tente buscar por outros termos ou navegue pelas categorias.
                </p>
                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                  Ver Todos os Artigos
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {paginatedPosts.map(post => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-bolao-card-border"
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-bolao-green" : "border-bolao-card-border"}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-bolao-card-border"
                    >
                      Próximo
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <CategorySidebar 
              categories={categories} 
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchQuery("");
                setCurrentPage(1);
              }}
            />
            <PopularTags tags={tags} onTagClick={handleTagClick} />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
