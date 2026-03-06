// SEO Service for BolãoMax
// Provides SEO utilities, page configurations, and sitemap generation

export const SITE_CONFIG = {
  name: "BolãoMax",
  url: "https://bolaomax.com.br",
  description: "Participe de bolões de loteria online com pouco investimento e aumente suas chances de ganhar.",
  logo: "/logo.png",
  ogImage: "/og-image.png",
  language: "pt-BR",
  locale: "pt_BR",
  twitter: "@bolaomax",
  email: "contato@bolaomax.com.br"
};

export interface PageSEO {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastmod?: string;
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
}

// All site pages with SEO data
export const SITE_PAGES: PageSEO[] = [
  // Main pages
  {
    path: "/",
    title: "Bolões de Loteria Online | Participe com Pouco Investimento",
    description: "Participe de bolões de loteria online. Lotofácil, Mega-Sena, Quina e internacionais. Mais de 700 apostadores ativos!",
    keywords: ["bolão loteria", "bolão online", "lotofácil", "mega-sena", "quina"],
    priority: 1.0,
    changefreq: "daily"
  },
  // Lottery pages
  {
    path: "/lotofacil",
    title: "Bolões Lotofácil | Sorteios Diários",
    description: "Participe dos melhores bolões da Lotofácil. Sorteios diários com prêmios milionários. Lotofácil da Independência!",
    keywords: ["bolão lotofácil", "lotofácil online", "dezenas lotofácil", "lotofácil da independência"],
    priority: 0.9,
    changefreq: "weekly"
  },
  {
    path: "/megasena",
    title: "Bolões Mega-Sena | Maiores Prêmios",
    description: "Bolões da Mega-Sena com os maiores prêmios do Brasil. Mega da Virada disponível!",
    keywords: ["bolão mega-sena", "mega-sena online", "mega da virada", "apostas mega-sena"],
    priority: 0.9,
    changefreq: "weekly"
  },
  {
    path: "/quina",
    title: "Bolões Quina | Sorteios Diários",
    description: "Participe dos bolões da Quina. Sorteios diários e Quina de São João com prêmios especiais!",
    keywords: ["bolão quina", "quina online", "quina de são joão"],
    priority: 0.9,
    changefreq: "weekly"
  },
  {
    path: "/internacional",
    title: "Bolões Internacionais | Powerball, Mega Millions",
    description: "Bolões das maiores loterias internacionais: Powerball, Mega Millions, EuroMillions. Prêmios bilionários!",
    keywords: ["powerball", "mega millions", "euromillions", "loteria internacional"],
    priority: 0.8,
    changefreq: "weekly"
  },
  // Information pages
  {
    path: "/como-funciona",
    title: "Como Funciona | Entenda o Processo",
    description: "Entenda como funcionam os bolões do BolãoMax. Processo transparente em 4 passos simples.",
    keywords: ["como funciona bolão", "participar bolão", "cotas bolão"],
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    path: "/por-que-bolaomax",
    title: "Por Que BolãoMax | Vantagens e Diferenciais",
    description: "Descubra por que o BolãoMax é a melhor escolha para participar de bolões de loteria online.",
    keywords: ["vantagens bolão", "melhor bolão", "bolão confiável"],
    priority: 0.6,
    changefreq: "monthly"
  },
  {
    path: "/perguntas-frequentes",
    title: "FAQ | Perguntas Frequentes",
    description: "Respostas para as dúvidas mais comuns sobre bolões de loteria no BolãoMax.",
    keywords: ["FAQ bolão", "dúvidas loteria", "perguntas frequentes"],
    priority: 0.6,
    changefreq: "monthly"
  },
  {
    path: "/resultados",
    title: "Resultados das Loterias | Atualizados",
    description: "Confira os últimos resultados das loterias brasileiras. Atualização em tempo real.",
    keywords: ["resultado loteria", "resultado lotofácil", "resultado mega-sena"],
    priority: 0.8,
    changefreq: "daily"
  },
  {
    path: "/clube-vip",
    title: "Clube VIP | Benefícios Exclusivos",
    description: "Seja membro VIP e aproveite benefícios exclusivos: descontos, participação automática e mais.",
    keywords: ["clube vip", "assinatura bolão", "benefícios exclusivos"],
    priority: 0.8,
    changefreq: "weekly"
  },
  // Account pages (noindex)
  {
    path: "/login",
    title: "Entrar | Acesse sua Conta",
    description: "Acesse sua conta no BolãoMax. Entre com email e senha.",
    keywords: ["login", "entrar", "acessar conta"],
    priority: 0.4,
    changefreq: "monthly",
    noindex: true
  },
  {
    path: "/cadastro",
    title: "Criar Conta | Cadastre-se Grátis",
    description: "Crie sua conta gratuita no BolãoMax e participe de bolões hoje.",
    keywords: ["cadastro", "criar conta", "registro"],
    priority: 0.5,
    changefreq: "monthly"
  },
  {
    path: "/minha-conta",
    title: "Minha Conta | Dashboard",
    description: "Gerencie sua conta no BolãoMax.",
    keywords: ["minha conta", "dashboard"],
    priority: 0.3,
    changefreq: "never",
    noindex: true
  },
  {
    path: "/checkout",
    title: "Finalizar Participação",
    description: "Finalize sua participação no bolão.",
    keywords: ["checkout", "pagamento"],
    priority: 0.3,
    changefreq: "never",
    noindex: true
  },
  // Legal pages
  {
    path: "/termos-de-uso",
    title: "Termos de Uso",
    description: "Leia os termos de uso do BolãoMax. Regras de participação e responsabilidades.",
    keywords: ["termos de uso", "regras", "condições"],
    priority: 0.4,
    changefreq: "yearly"
  },
  {
    path: "/politica-privacidade",
    title: "Política de Privacidade | LGPD",
    description: "Política de privacidade do BolãoMax conforme LGPD.",
    keywords: ["política privacidade", "LGPD", "dados pessoais"],
    priority: 0.4,
    changefreq: "yearly"
  },
  {
    path: "/politica-reembolso",
    title: "Política de Reembolso",
    description: "Política de reembolso do BolãoMax. Saiba como solicitar.",
    keywords: ["reembolso", "cancelamento", "devolução"],
    priority: 0.4,
    changefreq: "yearly"
  },
  // Support
  {
    path: "/suporte",
    title: "Suporte e Contato",
    description: "Central de ajuda do BolãoMax. Entre em contato pelo WhatsApp ou email.",
    keywords: ["suporte", "contato", "ajuda", "atendimento"],
    priority: 0.6,
    changefreq: "monthly"
  },
  {
    path: "/sobre-nos",
    title: "Sobre Nós | Conheça o BolãoMax",
    description: "Conheça a história e a equipe por trás do BolãoMax.",
    keywords: ["sobre nós", "quem somos", "história"],
    priority: 0.5,
    changefreq: "monthly"
  },
  {
    path: "/transparencia",
    title: "Transparência | Resultados e Dados",
    description: "Veja os dados de transparência do BolãoMax. Resultados públicos e verificáveis.",
    keywords: ["transparência", "resultados", "dados públicos"],
    priority: 0.6,
    changefreq: "weekly"
  },
  {
    path: "/conteudo-educativo",
    title: "Conteúdo Educativo | Dicas de Loteria",
    description: "Aprenda sobre loterias com nosso conteúdo educativo. Dicas e estratégias.",
    keywords: ["dicas loteria", "estratégias", "educativo"],
    priority: 0.7,
    changefreq: "weekly"
  }
];

export const getPageSEO = (path: string): PageSEO | undefined => {
  return SITE_PAGES.find(page => page.path === path);
};

export const updatePageSEO = (path: string, data: Partial<PageSEO>): PageSEO | null => {
  const index = SITE_PAGES.findIndex(page => page.path === path);
  if (index === -1) return null;
  
  SITE_PAGES[index] = { ...SITE_PAGES[index], ...data };
  return SITE_PAGES[index];
};

export const generateSitemapXML = (): string => {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = SITE_PAGES
    .filter(page => !page.noindex)
    .map(page => `
    <url>
      <loc>${SITE_CONFIG.url}${page.path}</loc>
      <lastmod>${page.lastmod || today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority.toFixed(1)}</priority>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
};

export const generateRobotsTxt = (): string => {
  return `# BolãoMax robots.txt
User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin/
Disallow: /minha-conta
Disallow: /checkout
Disallow: /pagamento-pix

# Sitemap
Sitemap: ${SITE_CONFIG.url}/sitemap.xml

# Crawl-delay (optional, be respectful to bots)
Crawl-delay: 1
`;
};

export interface SEOScore {
  overall: number;
  title: { score: number; message: string };
  description: { score: number; message: string };
  keywords: { score: number; message: string };
  content: { score: number; message: string };
}

export const getSEOScore = (
  title?: string,
  description?: string,
  keywords?: string[],
  contentLength?: number
): SEOScore => {
  const scores: SEOScore = {
    overall: 0,
    title: { score: 0, message: "" },
    description: { score: 0, message: "" },
    keywords: { score: 0, message: "" },
    content: { score: 0, message: "" }
  };

  // Title score (max 25 points)
  if (title) {
    const titleLength = title.length;
    if (titleLength >= 30 && titleLength <= 60) {
      scores.title = { score: 25, message: "Título com tamanho ideal ✓" };
    } else if (titleLength > 60) {
      scores.title = { score: 15, message: `Título muito longo (${titleLength}/60 chars)` };
    } else if (titleLength > 0) {
      scores.title = { score: 10, message: `Título muito curto (${titleLength}/30 chars mín)` };
    }
  } else {
    scores.title = { score: 0, message: "Título ausente" };
  }

  // Description score (max 25 points)
  if (description) {
    const descLength = description.length;
    if (descLength >= 120 && descLength <= 160) {
      scores.description = { score: 25, message: "Descrição com tamanho ideal ✓" };
    } else if (descLength > 160) {
      scores.description = { score: 15, message: `Descrição muito longa (${descLength}/160 chars)` };
    } else if (descLength > 0) {
      scores.description = { score: 10, message: `Descrição muito curta (${descLength}/120 chars mín)` };
    }
  } else {
    scores.description = { score: 0, message: "Descrição ausente" };
  }

  // Keywords score (max 25 points)
  if (keywords && keywords.length > 0) {
    if (keywords.length >= 5 && keywords.length <= 10) {
      scores.keywords = { score: 25, message: `${keywords.length} keywords (ideal) ✓` };
    } else if (keywords.length > 10) {
      scores.keywords = { score: 15, message: `Muitas keywords (${keywords.length})` };
    } else {
      scores.keywords = { score: 15, message: `Poucas keywords (${keywords.length}/5 mín)` };
    }
  } else {
    scores.keywords = { score: 0, message: "Keywords ausentes" };
  }

  // Content score (max 25 points)
  if (contentLength !== undefined) {
    if (contentLength >= 1000) {
      scores.content = { score: 25, message: "Conteúdo extenso ✓" };
    } else if (contentLength >= 500) {
      scores.content = { score: 20, message: "Conteúdo adequado" };
    } else if (contentLength >= 300) {
      scores.content = { score: 15, message: "Conteúdo mínimo" };
    } else {
      scores.content = { score: 10, message: "Conteúdo muito curto" };
    }
  } else {
    scores.content = { score: 15, message: "Tamanho não calculado" };
  }

  scores.overall = scores.title.score + scores.description.score + scores.keywords.score + scores.content.score;
  
  return scores;
};

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_CONFIG.url}${item.url}`
    }))
  };
};

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateProductSchema = (lottery: {
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Bolão ${lottery.name}`,
    "description": lottery.description,
    "brand": {
      "@type": "Brand",
      "name": SITE_CONFIG.name
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": lottery.minPrice,
      "highPrice": lottery.maxPrice,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    }
  };
};

export default {
  SITE_CONFIG,
  SITE_PAGES,
  getPageSEO,
  updatePageSEO,
  generateSitemapXML,
  generateRobotsTxt,
  getSEOScore,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateProductSchema
};
