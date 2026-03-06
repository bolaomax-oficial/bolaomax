// Blog Service for BolãoMax
// Manages blog posts, categories, and search functionality

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  authorAvatar?: string;
  categories: string[];
  tags: string[];
  publishDate: string;
  lastModified: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  views: number;
  status: "draft" | "published" | "scheduled";
  readingTime: number;
  featured: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

// Blog Categories
export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "1", name: "Dicas de Loteria", slug: "dicas-loteria", description: "Dicas e truques para aumentar suas chances", postCount: 12 },
  { id: "2", name: "Estratégias", slug: "estrategias", description: "Estratégias avançadas para bolões", postCount: 8 },
  { id: "3", name: "Notícias", slug: "noticias", description: "Últimas notícias sobre loterias", postCount: 15 },
  { id: "4", name: "Histórias de Ganhadores", slug: "historias-ganhadores", description: "Histórias inspiradoras de quem ganhou", postCount: 6 },
  { id: "5", name: "Guias", slug: "guias", description: "Guias completos sobre loterias", postCount: 10 },
  { id: "6", name: "Análises", slug: "analises", description: "Análises estatísticas e de resultados", postCount: 7 },
];

// Mock Blog Posts Data
const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "como-aumentar-chances-lotofacil",
    title: "Como Aumentar Suas Chances na Lotofácil: Guia Completo",
    excerpt: "Descubra as melhores estratégias para aumentar suas probabilidades de ganhar na Lotofácil, desde análise de padrões até formação de bolões.",
    content: `
# Como Aumentar Suas Chances na Lotofácil

A Lotofácil é uma das loterias mais populares do Brasil, e com razão! Com probabilidades relativamente boas e sorteios diários, ela oferece oportunidades constantes para quem quer tentar a sorte.

## Entendendo a Lotofácil

A Lotofácil consiste em escolher 15 números de um total de 25. Para ganhar o prêmio principal, você precisa acertar todos os 15 números sorteados.

### Probabilidades

- **15 acertos**: 1 em 3.268.760
- **14 acertos**: 1 em 21.792
- **13 acertos**: 1 em 692
- **12 acertos**: 1 em 59
- **11 acertos**: 1 em 11

## Estratégias para Aumentar Suas Chances

### 1. Participe de Bolões

A forma mais efetiva de aumentar suas chances é participando de bolões. Com mais jogos, você multiplica suas possibilidades de ganhar.

### 2. Analise os Números Mais Sorteados

Alguns números aparecem com mais frequência nos sorteios. Embora cada sorteio seja independente, muitos apostadores preferem incluir os chamados "números quentes".

### 3. Equilibre Pares e Ímpares

Estatisticamente, combinações equilibradas entre números pares e ímpares tendem a sair mais frequentemente.

### 4. Distribua os Números no Volante

Evite concentrar todos os números em uma única região do volante. Distribua-os para cobrir diferentes áreas.

## Conclusão

Não existe fórmula mágica para ganhar na loteria, mas seguindo essas estratégias você maximiza suas chances. E lembre-se: com o BolãoMax, você pode participar de bolões maiores com pouco investimento!
    `,
    featuredImage: "/images/blog/lotofacil-dicas.jpg",
    author: "Equipe BolãoMax",
    authorAvatar: "/images/avatars/bolaomax.png",
    categories: ["Dicas de Loteria", "Estratégias"],
    tags: ["lotofácil", "dicas", "estratégias", "probabilidades"],
    publishDate: "2025-02-01T10:00:00Z",
    lastModified: "2025-02-05T15:30:00Z",
    metaTitle: "Como Aumentar Chances na Lotofácil | Guia Completo 2025",
    metaDescription: "Aprenda estratégias comprovadas para aumentar suas chances na Lotofácil. Dicas de especialistas, análise de padrões e mais.",
    keywords: ["lotofácil", "dicas lotofácil", "como ganhar lotofácil", "estratégias loteria"],
    views: 2847,
    status: "published",
    readingTime: 8,
    featured: true
  },
  {
    id: "2",
    slug: "mega-sena-historia-maiores-premios",
    title: "A História dos Maiores Prêmios da Mega-Sena",
    excerpt: "Conheça os maiores prêmios já pagos pela Mega-Sena e as histórias por trás dos sortudos ganhadores.",
    content: `
# A História dos Maiores Prêmios da Mega-Sena

A Mega-Sena é a loteria mais famosa do Brasil, conhecida por seus prêmios milionários que mudam a vida dos ganhadores.

## Os Maiores Prêmios da História

### 1. R$ 378,1 milhões (2024)
O maior prêmio da história foi dividido entre dois apostadores de São Paulo.

### 2. R$ 317,8 milhões (Virada 2023/2024)
A Mega da Virada sempre traz os maiores prêmios do ano.

### 3. R$ 289,4 milhões (2022)
Um apostador de Campinas levou sozinho este prêmio extraordinário.

## O que os Ganhadores Fizeram

A maioria dos ganhadores opta por manter discrição sobre seus ganhos. Muitos investem em imóveis, abrem negócios e ajudam familiares.

## Como Participar dos Grandes Prêmios

A melhor forma de participar dos sorteios com prêmios acumulados é através de bolões! No BolãoMax, você pode participar com cotas a partir de R$ 10.
    `,
    featuredImage: "/images/blog/mega-sena-premios.jpg",
    author: "Carlos Silva",
    categories: ["Notícias", "Histórias de Ganhadores"],
    tags: ["mega-sena", "prêmios", "ganhadores", "recordes"],
    publishDate: "2025-01-28T14:00:00Z",
    lastModified: "2025-01-28T14:00:00Z",
    views: 5234,
    status: "published",
    readingTime: 6,
    featured: true
  },
  {
    id: "3",
    slug: "o-que-e-bolao-como-funciona",
    title: "O Que é um Bolão de Loteria e Como Funciona",
    excerpt: "Entenda o conceito de bolão, como funcionam as cotas e por que é vantajoso participar de um.",
    content: `
# O Que é um Bolão de Loteria e Como Funciona

Um bolão é uma forma coletiva de apostar na loteria, onde várias pessoas se unem para aumentar as chances de ganhar.

## Como Funciona

1. **Formação do Bolão**: Um organizador cria um bolão com múltiplos jogos
2. **Venda de Cotas**: Os participantes compram cotas proporcionais
3. **Premiação**: Se houver prêmio, é dividido proporcionalmente

## Vantagens do Bolão

- Mais jogos, mais chances
- Custo acessível por pessoa
- Experiência compartilhada

## Por Que Escolher o BolãoMax

No BolãoMax, oferecemos:
- Transparência total
- Participação a partir de R$ 10
- Pagamento seguro via PIX
    `,
    featuredImage: "/images/blog/o-que-e-bolao.jpg",
    author: "Equipe BolãoMax",
    categories: ["Guias"],
    tags: ["bolão", "como funciona", "cotas", "participar"],
    publishDate: "2025-01-25T09:00:00Z",
    lastModified: "2025-02-01T10:00:00Z",
    views: 3891,
    status: "published",
    readingTime: 5,
    featured: false
  },
  {
    id: "4",
    slug: "quina-de-sao-joao-especial",
    title: "Quina de São João: O Que Torna Esse Sorteio Especial",
    excerpt: "Saiba tudo sobre a Quina de São João, o maior prêmio anual desta modalidade de loteria.",
    content: `
# Quina de São João: O Que Torna Esse Sorteio Especial

A Quina de São João é o sorteio especial mais aguardado pelos apostadores da Quina. Realizado anualmente em junho, ele oferece prêmios que não acumulam.

## Características Especiais

- Prêmio não acumula
- Sorteio único no ano
- Maior prêmio da Quina

## Como Participar

No BolãoMax, oferecemos bolões especiais para a Quina de São João com participações a partir de valores acessíveis.
    `,
    featuredImage: "/images/blog/quina-sao-joao.jpg",
    author: "Maria Santos",
    categories: ["Notícias", "Guias"],
    tags: ["quina", "são joão", "especial", "prêmio"],
    publishDate: "2025-01-20T11:00:00Z",
    lastModified: "2025-01-20T11:00:00Z",
    views: 2156,
    status: "published",
    readingTime: 4,
    featured: false
  },
  {
    id: "5",
    slug: "erros-comuns-apostadores-loteria",
    title: "5 Erros Comuns que Apostadores de Loteria Cometem",
    excerpt: "Evite esses erros frequentes e melhore sua experiência com apostas em loterias.",
    content: `
# 5 Erros Comuns que Apostadores de Loteria Cometem

Muitos apostadores cometem erros que podem prejudicar sua experiência e chances. Veja quais são e como evitá-los.

## 1. Não Conferir os Resultados

Muita gente deixa de conferir e perde prêmios menores.

## 2. Apostar Sempre nos Mesmos Números

Embora seja tradição, varia suas apostas pode ser interessante.

## 3. Não Participar de Bolões

Bolões multiplicam suas chances por um custo menor.

## 4. Gastar Mais do que Pode

Defina um orçamento e respeite-o.

## 5. Não Diversificar Loterias

Experimente diferentes modalidades.
    `,
    featuredImage: "/images/blog/erros-apostadores.jpg",
    author: "João Oliveira",
    categories: ["Dicas de Loteria"],
    tags: ["erros", "dicas", "apostas", "cuidados"],
    publishDate: "2025-01-15T08:00:00Z",
    lastModified: "2025-01-15T08:00:00Z",
    views: 1823,
    status: "published",
    readingTime: 5,
    featured: false
  },
  {
    id: "6",
    slug: "powerball-mega-millions-como-jogar-brasil",
    title: "Powerball e Mega Millions: Como Jogar do Brasil",
    excerpt: "Descubra como participar das maiores loterias internacionais sem sair do Brasil.",
    content: `
# Powerball e Mega Millions: Como Jogar do Brasil

As loterias americanas Powerball e Mega Millions oferecem os maiores prêmios do mundo, chegando a bilhões de dólares!

## Como Funciona

Através de plataformas autorizadas, brasileiros podem participar legalmente dessas loterias internacionais.

## Os Maiores Prêmios

- Powerball: US$ 2,04 bilhões (2022)
- Mega Millions: US$ 1,55 bilhão (2023)

## Participe pelo BolãoMax

Oferecemos acesso facilitado às principais loterias internacionais com suporte em português.
    `,
    featuredImage: "/images/blog/loterias-internacionais.jpg",
    author: "Equipe BolãoMax",
    categories: ["Guias", "Notícias"],
    tags: ["powerball", "mega millions", "internacional", "como jogar"],
    publishDate: "2025-01-10T12:00:00Z",
    lastModified: "2025-02-05T09:00:00Z",
    views: 4521,
    status: "published",
    readingTime: 6,
    featured: true
  }
];

// Get all published posts
export const getAllPosts = (): BlogPost[] => {
  return MOCK_POSTS.filter(post => post.status === "published")
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
};

// Get featured posts
export const getFeaturedPosts = (): BlogPost[] => {
  return MOCK_POSTS.filter(post => post.featured && post.status === "published")
    .slice(0, 3);
};

// Get post by slug
export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return MOCK_POSTS.find(post => post.slug === slug && post.status === "published");
};

// Get posts by category
export const getPostsByCategory = (categorySlug: string): BlogPost[] => {
  const category = BLOG_CATEGORIES.find(c => c.slug === categorySlug);
  if (!category) return [];
  
  return MOCK_POSTS.filter(
    post => post.categories.includes(category.name) && post.status === "published"
  );
};

// Get posts by tag
export const getPostsByTag = (tag: string): BlogPost[] => {
  return MOCK_POSTS.filter(
    post => post.tags.includes(tag.toLowerCase()) && post.status === "published"
  );
};

// Search posts
export const searchPosts = (query: string): BlogPost[] => {
  const lowercaseQuery = query.toLowerCase();
  return MOCK_POSTS.filter(post => 
    post.status === "published" && (
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.includes(lowercaseQuery))
    )
  );
};

// Get related posts
export const getRelatedPosts = (post: BlogPost, limit: number = 3): BlogPost[] => {
  return MOCK_POSTS.filter(p => 
    p.id !== post.id && 
    p.status === "published" &&
    (p.categories.some(c => post.categories.includes(c)) || 
     p.tags.some(t => post.tags.includes(t)))
  ).slice(0, limit);
};

// Calculate reading time
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Get all categories
export const getAllCategories = (): BlogCategory[] => {
  return BLOG_CATEGORIES;
};

// Get all tags
export const getAllTags = (): string[] => {
  const tags = new Set<string>();
  MOCK_POSTS.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

// Admin functions (for CMS)
export const createPost = (post: Omit<BlogPost, "id" | "views" | "readingTime">): BlogPost => {
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    views: 0,
    readingTime: calculateReadingTime(post.content)
  };
  MOCK_POSTS.push(newPost);
  return newPost;
};

export const updatePost = (id: string, updates: Partial<BlogPost>): BlogPost | null => {
  const index = MOCK_POSTS.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  MOCK_POSTS[index] = { ...MOCK_POSTS[index], ...updates };
  if (updates.content) {
    MOCK_POSTS[index].readingTime = calculateReadingTime(updates.content);
  }
  return MOCK_POSTS[index];
};

export const deletePost = (id: string): boolean => {
  const index = MOCK_POSTS.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  MOCK_POSTS.splice(index, 1);
  return true;
};

export default {
  getAllPosts,
  getFeaturedPosts,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  searchPosts,
  getRelatedPosts,
  calculateReadingTime,
  getAllCategories,
  getAllTags,
  formatDate,
  createPost,
  updatePost,
  deletePost,
  BLOG_CATEGORIES
};
