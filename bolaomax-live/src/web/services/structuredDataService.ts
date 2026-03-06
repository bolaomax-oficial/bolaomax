// Structured Data Service (JSON-LD) for BolãoMax
// Generates Schema.org compliant structured data for SEO

export const SITE_CONFIG = {
  name: "BolãoMax",
  url: "https://bolaomax.com.br",
  description: "Participe de bolões de loteria online com pouco investimento e aumente suas chances de ganhar.",
  logo: "https://bolaomax.com.br/logo.png",
  email: "contato@bolaomax.com.br",
  phone: "+55 11 99999-9999",
  address: {
    country: "BR",
    region: "São Paulo"
  },
  social: {
    instagram: "https://instagram.com/bolaomax",
    facebook: "https://facebook.com/bolaomax",
    twitter: "https://twitter.com/bolaomax"
  }
};

// Organization Schema
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE_CONFIG.name,
  "alternateName": "Bolão Max",
  "url": SITE_CONFIG.url,
  "logo": SITE_CONFIG.logo,
  "description": SITE_CONFIG.description,
  "email": SITE_CONFIG.email,
  "telephone": SITE_CONFIG.phone,
  "address": {
    "@type": "PostalAddress",
    "addressCountry": SITE_CONFIG.address.country,
    "addressRegion": SITE_CONFIG.address.region
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Portuguese",
    "email": SITE_CONFIG.email
  },
  "sameAs": [
    SITE_CONFIG.social.instagram,
    SITE_CONFIG.social.facebook,
    SITE_CONFIG.social.twitter
  ]
});

// Website Schema with SearchAction
export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE_CONFIG.name,
  "url": SITE_CONFIG.url,
  "description": SITE_CONFIG.description,
  "inLanguage": "pt-BR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_CONFIG.url}/busca?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "logo": {
      "@type": "ImageObject",
      "url": SITE_CONFIG.logo
    }
  }
});

// Product Schema for Lottery Pools
export interface LotteryProductData {
  id: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  estimatedPrize: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  lotteryType: "Lotofácil" | "Mega-Sena" | "Quina" | "Internacional";
}

export const generateProductSchema = (lottery: LotteryProductData) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `Bolão ${lottery.name}`,
  "description": lottery.description,
  "sku": lottery.id,
  "brand": {
    "@type": "Brand",
    "name": SITE_CONFIG.name
  },
  "category": `Bolões de ${lottery.lotteryType}`,
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": lottery.minPrice.toFixed(2),
    "highPrice": lottery.maxPrice.toFixed(2),
    "priceCurrency": "BRL",
    "availability": `https://schema.org/${lottery.availability || "InStock"}`,
    "seller": {
      "@type": "Organization",
      "name": SITE_CONFIG.name
    }
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Prêmio Estimado",
      "value": lottery.estimatedPrize
    },
    {
      "@type": "PropertyValue",
      "name": "Tipo de Loteria",
      "value": lottery.lotteryType
    }
  ]
});

// Breadcrumb Schema
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url.startsWith("http") ? item.url : `${SITE_CONFIG.url}${item.url}`
  }))
});

// FAQ Page Schema
export interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQSchema = (faqs: FAQItem[]) => ({
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
});

// Article Schema for Blog Posts
export interface ArticleData {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  articleBody?: string;
  wordCount?: number;
  articleSection?: string;
  keywords?: string[];
}

export const generateArticleSchema = (article: ArticleData) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.headline,
  "description": article.description,
  "image": article.image.startsWith("http") ? article.image : `${SITE_CONFIG.url}${article.image}`,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified || article.datePublished,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "logo": {
      "@type": "ImageObject",
      "url": SITE_CONFIG.logo
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": SITE_CONFIG.url
  },
  ...(article.articleBody && { "articleBody": article.articleBody }),
  ...(article.wordCount && { "wordCount": article.wordCount }),
  ...(article.articleSection && { "articleSection": article.articleSection }),
  ...(article.keywords && { "keywords": article.keywords.join(", ") }),
  "inLanguage": "pt-BR"
});

// Review Schema for Testimonials
export interface ReviewData {
  author: string;
  reviewBody: string;
  rating: number; // 1-5
  datePublished?: string;
}

export const generateReviewSchema = (review: ReviewData) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  "author": {
    "@type": "Person",
    "name": review.author
  },
  "reviewBody": review.reviewBody,
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": review.rating,
    "bestRating": 5,
    "worstRating": 1
  },
  "datePublished": review.datePublished || new Date().toISOString().split("T")[0],
  "itemReviewed": {
    "@type": "Organization",
    "name": SITE_CONFIG.name
  }
});

// Aggregate Rating Schema
export const generateAggregateRatingSchema = (
  ratingValue: number,
  reviewCount: number
) => ({
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": ratingValue.toFixed(1),
  "bestRating": 5,
  "worstRating": 1,
  "ratingCount": reviewCount,
  "reviewCount": reviewCount,
  "itemReviewed": {
    "@type": "Organization",
    "name": SITE_CONFIG.name
  }
});

// Local Business Schema (if applicable)
export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "OnlineBusiness",
  "name": SITE_CONFIG.name,
  "url": SITE_CONFIG.url,
  "logo": SITE_CONFIG.logo,
  "description": SITE_CONFIG.description,
  "email": SITE_CONFIG.email,
  "telephone": SITE_CONFIG.phone,
  "address": {
    "@type": "PostalAddress",
    "addressCountry": SITE_CONFIG.address.country,
    "addressRegion": SITE_CONFIG.address.region
  },
  "priceRange": "R$ 10 - R$ 5000",
  "openingHours": "Mo-Su 00:00-24:00",
  "paymentAccepted": "PIX, Cartão de Crédito"
});

// Service Schema
export const generateServiceSchema = (serviceName: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": serviceName,
  "provider": {
    "@type": "Organization",
    "name": SITE_CONFIG.name
  },
  "description": description,
  "areaServed": {
    "@type": "Country",
    "name": "Brazil"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": SITE_CONFIG.url,
    "serviceLocation": {
      "@type": "VirtualLocation"
    }
  }
});

// How-To Schema for "Como Funciona" page
export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export const generateHowToSchema = (
  name: string,
  description: string,
  steps: HowToStep[],
  totalTime?: string
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  ...(totalTime && { "totalTime": totalTime }),
  "step": steps.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "name": step.name,
    "text": step.text,
    ...(step.image && {
      "image": {
        "@type": "ImageObject",
        "url": step.image.startsWith("http") ? step.image : `${SITE_CONFIG.url}${step.image}`
      }
    })
  }))
});

// Event Schema for Special Lotteries (e.g., Mega da Virada)
export interface LotteryEventData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  estimatedPrize: string;
}

export const generateEventSchema = (event: LotteryEventData) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.name,
  "description": event.description,
  "startDate": event.startDate,
  ...(event.endDate && { "endDate": event.endDate }),
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": SITE_CONFIG.url
  },
  "organizer": {
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": SITE_CONFIG.url
  },
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "BRL",
    "price": "10",
    "url": SITE_CONFIG.url
  }
});

// Validate Schema (basic validation)
export const checkSchemaValidity = (schema: object): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!("@context" in schema)) {
    errors.push("Missing @context property");
  }
  
  if (!("@type" in schema)) {
    errors.push("Missing @type property");
  }
  
  // Check for required properties based on type
  const schemaType = (schema as Record<string, unknown>)["@type"];
  
  if (schemaType === "Organization") {
    if (!("name" in schema)) errors.push("Organization: Missing name");
    if (!("url" in schema)) errors.push("Organization: Missing url");
  }
  
  if (schemaType === "Article") {
    if (!("headline" in schema)) errors.push("Article: Missing headline");
    if (!("datePublished" in schema)) errors.push("Article: Missing datePublished");
    if (!("author" in schema)) errors.push("Article: Missing author");
  }
  
  if (schemaType === "Product") {
    if (!("name" in schema)) errors.push("Product: Missing name");
    if (!("offers" in schema)) errors.push("Product: Missing offers");
  }
  
  if (schemaType === "FAQPage") {
    if (!("mainEntity" in schema)) errors.push("FAQPage: Missing mainEntity");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Inject schema into document head
export const injectSchema = (schema: object, id: string): void => {
  // Remove existing schema with same id
  const existing = document.querySelector(`script[data-schema="${id}"]`);
  if (existing) {
    existing.remove();
  }
  
  // Create and inject new schema
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.setAttribute("data-schema", id);
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// Remove schema from document head
export const removeSchema = (id: string): void => {
  const existing = document.querySelector(`script[data-schema="${id}"]`);
  if (existing) {
    existing.remove();
  }
};

// Inject multiple schemas
export const injectSchemas = (schemas: { schema: object; id: string }[]): void => {
  schemas.forEach(({ schema, id }) => injectSchema(schema, id));
};

// Pre-built schemas for common pages
export const getPageSchemas = {
  home: () => [
    { schema: generateOrganizationSchema(), id: "organization" },
    { schema: generateWebsiteSchema(), id: "website" },
    { schema: generateAggregateRatingSchema(4.8, 739), id: "rating" }
  ],
  
  lottery: (lotteryType: string) => [
    { schema: generateOrganizationSchema(), id: "organization" },
    { 
      schema: generateServiceSchema(
        `Bolões de ${lotteryType}`,
        `Participe de bolões da ${lotteryType} com cotas acessíveis e aumente suas chances de ganhar.`
      ), 
      id: "service" 
    }
  ],
  
  comoFunciona: () => [
    { schema: generateOrganizationSchema(), id: "organization" },
    {
      schema: generateHowToSchema(
        "Como participar de bolões no BolãoMax",
        "Guia passo a passo para participar de bolões de loteria online",
        [
          { name: "Escolha seu bolão", text: "Navegue pelos bolões disponíveis e escolha o que mais combina com você" },
          { name: "Defina sua participação", text: "Selecione a porcentagem que deseja participar no bolão" },
          { name: "Pagamento seguro", text: "Faça o pagamento via PIX de forma rápida e segura" },
          { name: "Acompanhe o resultado", text: "Acompanhe os sorteios e comemore suas vitórias" }
        ],
        "PT5M"
      ),
      id: "howto"
    }
  ],
  
  faq: (faqs: FAQItem[]) => [
    { schema: generateOrganizationSchema(), id: "organization" },
    { schema: generateFAQSchema(faqs), id: "faq" }
  ],
  
  blog: (article: ArticleData) => [
    { schema: generateOrganizationSchema(), id: "organization" },
    { schema: generateArticleSchema(article), id: "article" }
  ]
};

export default {
  SITE_CONFIG,
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateArticleSchema,
  generateReviewSchema,
  generateAggregateRatingSchema,
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateHowToSchema,
  generateEventSchema,
  checkSchemaValidity,
  injectSchema,
  removeSchema,
  injectSchemas,
  getPageSchemas
};
