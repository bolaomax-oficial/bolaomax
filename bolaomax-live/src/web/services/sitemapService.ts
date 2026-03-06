// Sitemap Service for BolãoMax
// Generates XML sitemap and robots.txt for SEO

export const SITE_URL = "https://bolaomax.com.br";

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  images?: { loc: string; title?: string; caption?: string }[];
}

// Static pages with their SEO configuration
const staticPages: SitemapEntry[] = [
  // Main pages (highest priority)
  { loc: "/", changefreq: "daily", priority: 1.0 },
  
  // Lottery pages (high priority)
  { loc: "/lotofacil", changefreq: "weekly", priority: 0.9 },
  { loc: "/megasena", changefreq: "weekly", priority: 0.9 },
  { loc: "/quina", changefreq: "weekly", priority: 0.9 },
  { loc: "/internacional", changefreq: "weekly", priority: 0.8 },
  { loc: "/resultados", changefreq: "daily", priority: 0.8 },
  
  // VIP and special pages
  { loc: "/clube-vip", changefreq: "weekly", priority: 0.8 },
  
  // Information pages
  { loc: "/como-funciona", changefreq: "monthly", priority: 0.7 },
  { loc: "/por-que-bolaomax", changefreq: "monthly", priority: 0.6 },
  { loc: "/perguntas-frequentes", changefreq: "monthly", priority: 0.6 },
  { loc: "/conteudo-educativo", changefreq: "weekly", priority: 0.7 },
  { loc: "/transparencia", changefreq: "weekly", priority: 0.6 },
  { loc: "/sobre-nos", changefreq: "monthly", priority: 0.5 },
  
  // Support pages
  { loc: "/suporte", changefreq: "monthly", priority: 0.6 },
  { loc: "/contato", changefreq: "monthly", priority: 0.6 },
  
  // Auth pages (public, indexable)
  { loc: "/cadastro", changefreq: "monthly", priority: 0.5 },
  
  // Legal pages (lower priority but important for compliance)
  { loc: "/termos-de-uso", changefreq: "yearly", priority: 0.4 },
  { loc: "/politica-privacidade", changefreq: "yearly", priority: 0.4 },
  { loc: "/politica-reembolso", changefreq: "yearly", priority: 0.4 },
];

// Pages that should NOT be in sitemap (private/utility pages)
const excludedPages = [
  "/login",
  "/minha-conta", 
  "/checkout",
  "/pagamento-pix",
  "/admin",
  "/admin/*",
  "/teste-paginas",
  "/diagnostico",
  "/nav"
];

export const getAllSitemapEntries = (): SitemapEntry[] => {
  const today = new Date().toISOString().split("T")[0];
  
  return staticPages.map(page => ({
    ...page,
    lastmod: page.lastmod || today
  }));
};

export const generateSitemapXML = (): string => {
  const entries = getAllSitemapEntries();
  
  const urlEntries = entries.map(entry => {
    const imageXml = entry.images?.map(img => `
      <image:image>
        <image:loc>${img.loc.startsWith("http") ? img.loc : `${SITE_URL}${img.loc}`}</image:loc>
        ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
        ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
      </image:image>`).join("") || "";

    return `  <url>
    <loc>${SITE_URL}${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>${imageXml}
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
};

export const generateRobotsTxt = (): string => {
  return `# BolãoMax - Robots.txt
# https://bolaomax.com.br

User-agent: *
Allow: /

# Disallow private/admin pages
Disallow: /admin/
Disallow: /minha-conta
Disallow: /checkout
Disallow: /pagamento-pix
Disallow: /teste-paginas
Disallow: /diagnostico
Disallow: /nav

# Disallow login (not useful for search)
Disallow: /login

# Allow important pages
Allow: /lotofacil
Allow: /megasena
Allow: /quina
Allow: /internacional
Allow: /resultados
Allow: /clube-vip
Allow: /como-funciona
Allow: /cadastro

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (be respectful to bots)
Crawl-delay: 1

# Google-specific
User-agent: Googlebot
Allow: /

# Bing-specific
User-agent: Bingbot
Allow: /
`;
};

// Helper to escape XML special characters
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

// Add blog post to sitemap (for dynamic content)
export const addBlogPostToSitemap = (
  slug: string,
  lastmod: string,
  images?: { loc: string; title?: string }[]
): SitemapEntry => {
  return {
    loc: `/blog/${slug}`,
    lastmod,
    changefreq: "weekly",
    priority: 0.7,
    images
  };
};

// Validate sitemap entry
export const validateSitemapEntry = (entry: SitemapEntry): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!entry.loc) {
    errors.push("Missing loc (URL)");
  }
  
  if (entry.priority < 0 || entry.priority > 1) {
    errors.push("Priority must be between 0 and 1");
  }
  
  const validChangefreq = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
  if (!validChangefreq.includes(entry.changefreq)) {
    errors.push(`Invalid changefreq: ${entry.changefreq}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get sitemap stats
export const getSitemapStats = () => {
  const entries = getAllSitemapEntries();
  
  const byPriority = {
    high: entries.filter(e => e.priority >= 0.8).length,
    medium: entries.filter(e => e.priority >= 0.5 && e.priority < 0.8).length,
    low: entries.filter(e => e.priority < 0.5).length
  };
  
  const byChangefreq = entries.reduce((acc, e) => {
    acc[e.changefreq] = (acc[e.changefreq] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalPages: entries.length,
    byPriority,
    byChangefreq,
    lastGenerated: new Date().toISOString()
  };
};

export default {
  SITE_URL,
  getAllSitemapEntries,
  generateSitemapXML,
  generateRobotsTxt,
  addBlogPostToSitemap,
  validateSitemapEntry,
  getSitemapStats
};
