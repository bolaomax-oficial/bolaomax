import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  Home,
  FileText,
  Users,
  ShoppingCart,
  Settings,
  Info,
  Ticket,
  Shield,
  HelpCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

interface PageInfo {
  name: string;
  path: string;
  icon: React.ElementType;
  category: "home" | "informacoes" | "legal" | "loterias" | "usuario" | "admin";
}

const allPages: PageInfo[] = [
  // Home
  { name: "Página Inicial", path: "/", icon: Home, category: "home" },
  
  // Informações
  { name: "Como Funciona", path: "/como-funciona", icon: Info, category: "informacoes" },
  { name: "Por que BolãoMax", path: "/por-que-bolaomax", icon: Info, category: "informacoes" },
  { name: "Conteúdo Educativo", path: "/conteudo-educativo", icon: Info, category: "informacoes" },
  { name: "Transparência", path: "/transparencia", icon: Info, category: "informacoes" },
  { name: "Perguntas Frequentes", path: "/perguntas-frequentes", icon: HelpCircle, category: "informacoes" },
  { name: "Suporte / Contato", path: "/suporte", icon: HelpCircle, category: "informacoes" },
  
  // Legal
  { name: "Termos de Uso", path: "/termos-de-uso", icon: FileText, category: "legal" },
  { name: "Política de Privacidade", path: "/politica-privacidade", icon: Shield, category: "legal" },
  { name: "Política de Reembolso", path: "/politica-reembolso", icon: FileText, category: "legal" },
  
  // Loterias
  { name: "Lotofácil", path: "/lotofacil", icon: Ticket, category: "loterias" },
  { name: "Mega-Sena", path: "/megasena", icon: Ticket, category: "loterias" },
  { name: "Quina", path: "/quina", icon: Ticket, category: "loterias" },
  
  // Usuário
  { name: "Login", path: "/login", icon: Users, category: "usuario" },
  { name: "Cadastro", path: "/cadastro", icon: Users, category: "usuario" },
  { name: "Minha Conta", path: "/minha-conta", icon: Users, category: "usuario" },
  { name: "Checkout", path: "/checkout", icon: ShoppingCart, category: "usuario" },
  { name: "Pagamento PIX", path: "/pagamento-pix", icon: ShoppingCart, category: "usuario" },
  
  // Admin
  { name: "Admin - Dashboard", path: "/admin", icon: Settings, category: "admin" },
  { name: "Admin - Bolões", path: "/admin/boloes", icon: Settings, category: "admin" },
  { name: "Admin - Usuários", path: "/admin/usuarios", icon: Settings, category: "admin" },
  { name: "Admin - Financeiro", path: "/admin/financeiro", icon: Settings, category: "admin" },
  { name: "Admin - Saques", path: "/admin/saques", icon: Settings, category: "admin" },
  { name: "Admin - Configurações", path: "/admin/configuracoes", icon: Settings, category: "admin" },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  home: { label: "Home", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  informacoes: { label: "Informações", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  legal: { label: "Legal", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  loterias: { label: "Loterias", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  usuario: { label: "Usuário", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  admin: { label: "Admin", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const PageCard = ({ page }: { page: PageInfo }) => {
  const Icon = page.icon;
  const category = categoryLabels[page.category];
  
  return (
    <Card className="p-4 bg-bolao-card/40 border-bolao-card-border hover:bg-bolao-card/60 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bolao-card flex items-center justify-center">
            <Icon className="w-5 h-5 text-bolao-green" />
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-bolao-green transition-colors">
              {page.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">{page.path}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-xs ${category.color}`}>
            {category.label}
          </Badge>
          <Link href={page.path}>
            <Button variant="ghost" size="sm" className="gap-1">
              Visitar
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

const CategorySection = ({ 
  category, 
  pages 
}: { 
  category: string; 
  pages: PageInfo[];
}) => {
  const categoryInfo = categoryLabels[category];
  
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="outline" className={`${categoryInfo.color}`}>
          {categoryInfo.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {pages.length} {pages.length === 1 ? "página" : "páginas"}
        </span>
      </div>
      <div className="space-y-3">
        {pages.map((page) => (
          <PageCard key={page.path} page={page} />
        ))}
      </div>
    </div>
  );
};

export default function TestePaginas() {
  const categories = ["home", "informacoes", "legal", "loterias", "usuario", "admin"];
  
  const pagesByCategory = categories.reduce((acc, cat) => {
    acc[cat] = allPages.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, PageInfo[]>);
  
  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <Header activePage="teste" />
      
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              🛠️ Página de Desenvolvimento
            </Badge>
            <h1 className="text-4xl font-extrabold mb-4">
              Teste de <span className="gradient-text">Páginas</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Esta página lista todas as rotas do sistema para facilitar navegação e debug durante o desenvolvimento.
            </p>
          </div>
          
          {/* Stats */}
          <Card className="p-6 bg-bolao-card/40 border-bolao-card-border mb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-bolao-green">{allPages.length}</p>
                <p className="text-sm text-muted-foreground">Total de Páginas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{pagesByCategory.informacoes.length}</p>
                <p className="text-sm text-muted-foreground">Informações</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{pagesByCategory.legal.length}</p>
                <p className="text-sm text-muted-foreground">Legal</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{pagesByCategory.admin.length}</p>
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
            </div>
          </Card>
          
          {/* All Pages by Category */}
          {categories.map((category) => (
            <CategorySection 
              key={category} 
              category={category} 
              pages={pagesByCategory[category]} 
            />
          ))}
          
          {/* Quick Navigation */}
          <Card className="p-6 bg-gradient-to-br from-bolao-green/20 to-transparent border-bolao-green/30 mt-10">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-bolao-green" />
              Navegação Rápida
            </h3>
            <div className="flex flex-wrap gap-2">
              {allPages.map((page) => (
                <Link key={page.path} href={page.path}>
                  <Button variant="outline" size="sm" className="text-xs">
                    {page.name}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
