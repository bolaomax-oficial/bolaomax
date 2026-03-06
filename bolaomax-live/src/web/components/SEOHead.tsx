import { useEffect } from "react";
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
  type BreadcrumbItem
} from "@/services/structuredDataService";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noindex?: boolean;
  pageType?: "home" | "lottery" | "blog" | "legal" | "account" | "checkout" | "vip" | "support";
  breadcrumbs?: BreadcrumbItem[];
  lotteryType?: string;
}

const SITE_NAME = "BolãoMax";
const DEFAULT_DESCRIPTION = "Participe de bolões de loteria online com pouco investimento e aumente suas chances de ganhar. Lotofácil, Mega-Sena, Quina e loterias internacionais.";
const DEFAULT_KEYWORDS = ["bolão", "loteria", "lotofácil", "mega-sena", "quina", "apostas", "bolão online", "loteria online", "cotas de bolão"];
const DEFAULT_OG_IMAGE = "/og-image.png";
const BASE_URL = "https://bolaomax.com.br";

export const generatePageTitle = (page?: string, custom?: string): string => {
  if (custom) {
    return `${custom} | ${SITE_NAME} - Bolões de Loteria Online`;
  }
  if (page) {
    return `${page} | ${SITE_NAME} - Bolões de Loteria Online`;
  }
  return `${SITE_NAME} - Bolões de Loteria Online | Participe com Pouco Investimento`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

const SEO_DEFAULTS: Record<string, { title: string; description: string; keywords: string[] }> = {
  home: {
    title: "Bolões de Loteria Online | Participe com Pouco Investimento",
    description: "Participe de bolões de loteria online. Lotofácil, Mega-Sena, Quina e internacionais. Aumente suas chances de ganhar com investimento acessível.",
    keywords: ["bolão loteria", "bolão online", "lotofácil", "mega-sena", "quina", "apostas online"]
  },
  lottery: {
    title: "Bolões Disponíveis",
    description: "Confira os bolões de loteria disponíveis. Escolha sua cota e participe agora.",
    keywords: ["bolão", "loteria", "cotas", "apostas", "prêmio"]
  },
  blog: {
    title: "Blog | Dicas e Notícias sobre Loterias",
    description: "Dicas, estratégias e notícias sobre loterias brasileiras. Aprenda a aumentar suas chances de ganhar.",
    keywords: ["dicas loteria", "estratégias loteria", "notícias loteria", "como ganhar na loteria"]
  },
  legal: {
    title: "Informações Legais",
    description: "Termos de uso, política de privacidade e outras informações legais do BolãoMax.",
    keywords: ["termos de uso", "política de privacidade", "LGPD"]
  },
  account: {
    title: "Minha Conta",
    description: "Acesse sua conta no BolãoMax. Gerencie suas participações e acompanhe seus bolões.",
    keywords: ["minha conta", "login", "participações", "bolões"]
  },
  checkout: {
    title: "Finalizar Participação",
    description: "Finalize sua participação no bolão. Pagamento seguro via PIX.",
    keywords: ["checkout", "pagamento", "participação", "pix"]
  },
  vip: {
    title: "Clube VIP | Benefícios Exclusivos",
    description: "Seja membro VIP do BolãoMax e aproveite benefícios exclusivos, descontos e participações automáticas.",
    keywords: ["clube vip", "benefícios", "desconto", "exclusivo"]
  },
  support: {
    title: "Suporte | Central de Ajuda",
    description: "Central de ajuda e suporte do BolãoMax. Tire suas dúvidas e entre em contato.",
    keywords: ["suporte", "ajuda", "contato", "dúvidas"]
  }
};

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  article,
  noindex = false,
  pageType = "home",
  breadcrumbs,
  lotteryType
}: SEOHeadProps) => {
  const defaults = SEO_DEFAULTS[pageType] || SEO_DEFAULTS.home;
  
  const finalTitle = title 
    ? generatePageTitle(undefined, truncateText(title, 50))
    : generatePageTitle(defaults.title);
  
  const finalDescription = truncateText(
    description || defaults.description,
    160
  );
  
  const finalKeywords = keywords?.length 
    ? [...keywords, ...DEFAULT_KEYWORDS].slice(0, 15).join(", ")
    : [...defaults.keywords, ...DEFAULT_KEYWORDS].slice(0, 15).join(", ");
  
  const finalCanonicalUrl = canonicalUrl || BASE_URL;
  const finalOgImage = ogImage || DEFAULT_OG_IMAGE;
  const fullOgImage = finalOgImage.startsWith("http") ? finalOgImage : `${BASE_URL}${finalOgImage}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper to set link tag
    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Basic Meta Tags
    setMeta("description", finalDescription);
    setMeta("keywords", finalKeywords);
    setMeta("author", SITE_NAME);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("language", "pt-BR");

    // Open Graph Tags
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDescription, true);
    setMeta("og:image", fullOgImage, true);
    setMeta("og:url", finalCanonicalUrl, true);
    setMeta("og:type", ogType, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("og:locale", "pt_BR", true);

    // Twitter Card Tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDescription);
    setMeta("twitter:image", fullOgImage);
    setMeta("twitter:site", "@bolaomax");

    // Article specific tags
    if (ogType === "article" && article) {
      if (article.publishedTime) {
        setMeta("article:published_time", article.publishedTime, true);
      }
      if (article.modifiedTime) {
        setMeta("article:modified_time", article.modifiedTime, true);
      }
      if (article.author) {
        setMeta("article:author", article.author, true);
      }
      if (article.section) {
        setMeta("article:section", article.section, true);
      }
      article.tags?.forEach((tag, index) => {
        setMeta(`article:tag:${index}`, tag, true);
      });
    }

    // Canonical Link
    setLink("canonical", finalCanonicalUrl);

    // Preconnect to important domains
    const preconnectUrls = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com"
    ];
    preconnectUrls.forEach(url => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = url;
        if (url.includes("gstatic")) {
          link.crossOrigin = "anonymous";
        }
        document.head.appendChild(link);
      }
    });

    // Helper function to inject schema
    const injectSchema = (schema: object, id: string) => {
      const existingScript = document.querySelector(`script[data-seo="${id}"]`);
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", id);
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Structured Data (JSON-LD) - Organization
    injectSchema(generateOrganizationSchema(), "organization");

    // Website Schema
    injectSchema(generateWebsiteSchema(), "website");

    // Breadcrumb Schema (if provided)
    if (breadcrumbs && breadcrumbs.length > 0) {
      injectSchema(generateBreadcrumbSchema(breadcrumbs), "breadcrumb");
    }

    // Lottery-specific Service Schema
    if (pageType === "lottery" && lotteryType) {
      injectSchema(
        generateServiceSchema(
          `Bolões de ${lotteryType}`,
          `Participe de bolões da ${lotteryType} com cotas acessíveis e aumente suas chances de ganhar.`
        ),
        "service"
      );
    }

    // Cleanup
    return () => {
      // Optional: cleanup if needed when component unmounts
    };
  }, [finalTitle, finalDescription, finalKeywords, finalCanonicalUrl, fullOgImage, ogType, article, noindex, breadcrumbs, pageType, lotteryType]);

  return null;
};

export const getPageSEOConfig = (pageName: string) => {
  const configs: Record<string, { title: string; description: string; keywords: string[]; pageType: string }> = {
    "/": {
      title: "",
      description: "Participe de bolões de loteria online com pouco investimento. Lotofácil, Mega-Sena, Quina e loterias internacionais. Mais de 700 apostadores ativos!",
      keywords: ["bolão loteria online", "bolão mega-sena", "bolão lotofácil", "cotas de bolão"],
      pageType: "home"
    },
    "/lotofacil": {
      title: "Bolões Lotofácil",
      description: "Participe dos melhores bolões da Lotofácil. Sorteios diários com prêmios milionários. Lotofácil da Independência disponível!",
      keywords: ["bolão lotofácil", "lotofácil online", "lotofácil da independência", "dezenas lotofácil"],
      pageType: "lottery"
    },
    "/megasena": {
      title: "Bolões Mega-Sena",
      description: "Bolões da Mega-Sena com os maiores prêmios do Brasil. Mega da Virada disponível! Participe com cotas acessíveis.",
      keywords: ["bolão mega-sena", "mega-sena online", "mega da virada", "apostas mega-sena"],
      pageType: "lottery"
    },
    "/quina": {
      title: "Bolões Quina",
      description: "Participe dos bolões da Quina com sorteios diários. Quina de São João com prêmios especiais disponível!",
      keywords: ["bolão quina", "quina online", "quina de são joão", "apostas quina"],
      pageType: "lottery"
    },
    "/internacional": {
      title: "Bolões Internacionais",
      description: "Bolões das maiores loterias internacionais: Powerball, Mega Millions, EuroMillions. Prêmios em bilhões de dólares!",
      keywords: ["powerball brasil", "mega millions", "euromillions", "loteria internacional"],
      pageType: "lottery"
    },
    "/como-funciona": {
      title: "Como Funciona",
      description: "Entenda como funcionam os bolões do BolãoMax. Processo transparente em 4 passos simples. Calculadora de participação disponível.",
      keywords: ["como funciona bolão", "participar bolão", "cotas bolão", "regras bolão"],
      pageType: "support"
    },
    "/clube-vip": {
      title: "Clube VIP",
      description: "Seja membro VIP do BolãoMax e aproveite benefícios exclusivos: descontos, participação automática e prioridade nos bolões.",
      keywords: ["clube vip loteria", "assinatura bolão", "benefícios vip", "desconto bolão"],
      pageType: "vip"
    },
    "/resultados": {
      title: "Resultados das Loterias",
      description: "Confira os últimos resultados das loterias brasileiras: Lotofácil, Mega-Sena, Quina e mais. Atualização em tempo real.",
      keywords: ["resultado loteria", "resultado lotofácil", "resultado mega-sena", "resultado quina"],
      pageType: "lottery"
    },
    "/termos-de-uso": {
      title: "Termos de Uso",
      description: "Leia os termos de uso do BolãoMax. Regras de participação, responsabilidades e direitos dos usuários.",
      keywords: ["termos de uso", "regras bolão", "política bolão"],
      pageType: "legal"
    },
    "/politica-privacidade": {
      title: "Política de Privacidade",
      description: "Política de privacidade do BolãoMax conforme LGPD. Saiba como seus dados são coletados, usados e protegidos.",
      keywords: ["política privacidade", "LGPD", "proteção dados", "privacidade"],
      pageType: "legal"
    },
    "/politica-reembolso": {
      title: "Política de Reembolso",
      description: "Política de reembolso do BolãoMax. Saiba como solicitar reembolso e os prazos de processamento.",
      keywords: ["reembolso bolão", "cancelamento", "devolução", "estorno"],
      pageType: "legal"
    },
    "/suporte": {
      title: "Suporte e Contato",
      description: "Central de ajuda do BolãoMax. Entre em contato pelo WhatsApp ou email. FAQ e dúvidas frequentes.",
      keywords: ["suporte bolão", "contato", "ajuda", "atendimento"],
      pageType: "support"
    },
    "/login": {
      title: "Entrar",
      description: "Acesse sua conta no BolãoMax. Entre com email e senha ou crie sua conta gratuitamente.",
      keywords: ["login bolão", "entrar", "acessar conta"],
      pageType: "account"
    },
    "/cadastro": {
      title: "Criar Conta",
      description: "Crie sua conta gratuita no BolãoMax e comece a participar de bolões de loteria hoje mesmo.",
      keywords: ["cadastro bolão", "criar conta", "registro"],
      pageType: "account"
    },
    "/minha-conta": {
      title: "Minha Conta",
      description: "Gerencie sua conta no BolãoMax. Veja suas participações, saldo e histórico de transações.",
      keywords: ["minha conta", "minhas participações", "saldo", "histórico"],
      pageType: "account"
    },
    "/checkout": {
      title: "Finalizar Participação",
      description: "Finalize sua participação no bolão. Pagamento seguro via PIX com confirmação instantânea.",
      keywords: ["checkout", "pagamento bolão", "pix", "participar"],
      pageType: "checkout"
    }
  };

  return configs[pageName] || configs["/"];
};

export default SEOHead;
