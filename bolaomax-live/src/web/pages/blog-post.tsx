import { useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPostBySlug,
  getRelatedPosts,
  formatDate,
  type BlogPost
} from "@/services/blogService";
import {
  generateArticleSchema,
  injectSchema
} from "@/services/structuredDataService";
import {
  Clock,
  Eye,
  Calendar,
  User,
  ChevronRight,
  ArrowLeft,
  Share2,
  Bookmark,
  MessageCircle,
  Tag
} from "lucide-react";
import { useEffect } from "react";

// Share buttons component
const ShareButtons = ({ post }: { post: BlogPost }) => {
  const shareUrl = `https://bolaomax.com.br/blog/${post.slug}`;
  const shareText = `${post.title} - BolãoMax`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copiado!");
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Compartilhar:</span>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors">
        <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-colors">
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center hover:bg-sky-500/30 transition-colors">
        <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center hover:bg-blue-600/30 transition-colors">
        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
      <button onClick={copyToClipboard} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

// Related Posts Component
const RelatedPosts = ({ posts }: { posts: BlogPost[] }) => {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h3 className="text-2xl font-bold mb-6">Artigos Relacionados</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="bg-bolao-card border-bolao-card-border hover:border-bolao-green/50 transition-all p-5 cursor-pointer h-full">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.slice(0, 1).map(cat => (
                  <Badge key={cat} variant="outline" className="text-xs border-bolao-green/30 text-bolao-green">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h4 className="font-bold text-white hover:text-bolao-green transition-colors line-clamp-2 mb-2">
                {post.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views.toLocaleString()}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

// Table of Contents Component
const TableOfContents = ({ content }: { content: string }) => {
  const headings = content.match(/^##\s+(.+)$/gm)?.map(h => h.replace(/^##\s+/, "")) || [];
  
  if (headings.length === 0) return null;

  return (
    <Card className="bg-bolao-card border-bolao-card-border p-5 sticky top-24">
      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-bolao-green" />
        Índice
      </h4>
      <nav className="space-y-2">
        {headings.map((heading, index) => (
          <a
            key={index}
            href={`#${heading.toLowerCase().replace(/\s+/g, "-")}`}
            className="block text-sm text-muted-foreground hover:text-bolao-green transition-colors"
          >
            {heading}
          </a>
        ))}
      </nav>
    </Card>
  );
};

// Markdown-like content renderer
const ContentRenderer = ({ content }: { content: string }) => {
  const processContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // Headers
        if (line.startsWith("# ")) {
          const text = line.replace("# ", "");
          return <h1 key={i} className="text-3xl font-bold mt-8 mb-4" id={text.toLowerCase().replace(/\s+/g, "-")}>{text}</h1>;
        }
        if (line.startsWith("## ")) {
          const text = line.replace("## ", "");
          return <h2 key={i} className="text-2xl font-bold mt-8 mb-4" id={text.toLowerCase().replace(/\s+/g, "-")}>{text}</h2>;
        }
        if (line.startsWith("### ")) {
          const text = line.replace("### ", "");
          return <h3 key={i} className="text-xl font-semibold mt-6 mb-3">{text}</h3>;
        }
        
        // Lists
        if (line.startsWith("- ")) {
          return <li key={i} className="ml-4 text-muted-foreground">{line.replace("- ", "")}</li>;
        }
        
        // Bold text
        if (line.includes("**")) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="text-muted-foreground mb-4">
              {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
            </p>
          );
        }
        
        // Empty line
        if (line.trim() === "") {
          return <br key={i} />;
        }
        
        // Regular paragraph
        return <p key={i} className="text-muted-foreground mb-4 leading-relaxed">{line}</p>;
      });
  };

  return <div className="prose prose-invert max-w-none">{processContent(content)}</div>;
};

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  
  const post = useMemo(() => {
    if (!params.slug) return null;
    return getPostBySlug(params.slug);
  }, [params.slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return getRelatedPosts(post, 3);
  }, [post]);

  // Inject article schema
  useEffect(() => {
    if (post) {
      const articleSchema = generateArticleSchema({
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishDate,
        dateModified: post.lastModified,
        author: post.author,
        articleSection: post.categories[0],
        keywords: post.tags
      });
      injectSchema(articleSchema, "article");
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-bolao-dark text-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">O artigo que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => setLocation("/blog")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.keywords || post.tags}
        pageType="blog"
        ogType="article"
        article={{
          publishedTime: post.publishDate,
          modifiedTime: post.lastModified,
          author: post.author,
          section: post.categories[0],
          tags: post.tags
        }}
        canonicalUrl={`https://bolaomax.com.br/blog/${post.slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white truncate">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Post Header */}
            <header className="mb-8">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map(cat => (
                  <Link key={cat} href={`/blog?category=${cat.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Badge className="bg-bolao-green/20 text-bolao-green border-bolao-green/30 hover:bg-bolao-green/30 cursor-pointer">
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-bolao-green" />
                  </div>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min de leitura</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views.toLocaleString()} visualizações</span>
                </div>
              </div>

              {/* Share Buttons */}
              <ShareButtons post={post} />
            </header>

            {/* Featured Image Placeholder */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-bolao-green/20 to-emerald-900/20 rounded-xl mb-8 flex items-center justify-center">
              <Bookmark className="w-20 h-20 text-bolao-green/30" />
            </div>

            {/* Content */}
            <div className="bg-bolao-card border border-bolao-card-border rounded-xl p-6 md:p-10">
              <ContentRenderer content={post.content} />
            </div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              {post.tags.map(tag => (
                <Link key={tag} href={`/blog?tag=${tag}`}>
                  <Badge variant="outline" className="border-bolao-card-border hover:border-bolao-green/50 cursor-pointer">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>

            {/* CTA Box */}
            <Card className="mt-12 bg-gradient-to-br from-bolao-green/20 to-emerald-900/20 border-bolao-green/30 p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Quer participar de bolões?</h3>
              <p className="text-muted-foreground mb-6">
                Aplique o que você aprendeu neste artigo! Participe de bolões com cotas a partir de R$ 10.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/lotofacil">
                  <Button className="bg-bolao-green hover:bg-bolao-green-dark">
                    Ver Bolões Lotofácil
                  </Button>
                </Link>
                <Link href="/megasena">
                  <Button variant="outline" className="border-bolao-green/50 hover:bg-bolao-green/10">
                    Ver Bolões Mega-Sena
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <TableOfContents content={post.content} />
            
            {/* Newsletter Signup */}
            <Card className="bg-bolao-card border-bolao-card-border p-5">
              <MessageCircle className="w-8 h-8 text-bolao-green mb-3" />
              <h4 className="font-bold text-white mb-2">Fique por dentro</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Receba dicas e novidades sobre loterias no seu email.
              </p>
              <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark">
                Inscrever-se
              </Button>
            </Card>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
