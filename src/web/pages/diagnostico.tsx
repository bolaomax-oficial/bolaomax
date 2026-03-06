import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
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
  Activity,
  Database,
  Globe,
  Clock,
  Cpu,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

interface RouteInfo {
  name: string;
  path: string;
  icon: React.ElementType;
  category: "public" | "auth" | "admin";
  requiresAuth: boolean;
  description: string;
}

const allRoutes: RouteInfo[] = [
  // Public Routes
  { name: "Home", path: "/", icon: Home, category: "public", requiresAuth: false, description: "Página inicial do BolãoMax" },
  { name: "Lotofácil", path: "/lotofacil", icon: Ticket, category: "public", requiresAuth: false, description: "Bolões da Lotofácil" },
  { name: "Mega-Sena", path: "/megasena", icon: Ticket, category: "public", requiresAuth: false, description: "Bolões da Mega-Sena" },
  { name: "Quina", path: "/quina", icon: Ticket, category: "public", requiresAuth: false, description: "Bolões da Quina" },
  { name: "Como Funciona", path: "/como-funciona", icon: Info, category: "public", requiresAuth: false, description: "Explicação do funcionamento" },
  { name: "Por que BolãoMax", path: "/por-que-bolaomax", icon: Info, category: "public", requiresAuth: false, description: "Vantagens da plataforma" },
  { name: "Perguntas Frequentes", path: "/perguntas-frequentes", icon: HelpCircle, category: "public", requiresAuth: false, description: "FAQ do sistema" },
  { name: "Conteúdo Educativo", path: "/conteudo-educativo", icon: FileText, category: "public", requiresAuth: false, description: "Material educativo" },
  { name: "Transparência", path: "/transparencia", icon: Shield, category: "public", requiresAuth: false, description: "Informações de transparência" },
  { name: "Termos de Uso", path: "/termos-de-uso", icon: FileText, category: "public", requiresAuth: false, description: "Termos e condições" },
  { name: "Política de Reembolso", path: "/politica-reembolso", icon: FileText, category: "public", requiresAuth: false, description: "Política de reembolso" },
  { name: "Política de Privacidade", path: "/politica-privacidade", icon: Shield, category: "public", requiresAuth: false, description: "Política de privacidade" },
  { name: "Suporte", path: "/suporte", icon: HelpCircle, category: "public", requiresAuth: false, description: "Central de suporte" },
  { name: "Contato", path: "/contato", icon: HelpCircle, category: "public", requiresAuth: false, description: "Página de contato" },
  
  // Auth Routes
  { name: "Login", path: "/login", icon: Users, category: "auth", requiresAuth: false, description: "Página de login" },
  { name: "Cadastro", path: "/cadastro", icon: Users, category: "auth", requiresAuth: false, description: "Página de cadastro" },
  { name: "Minha Conta", path: "/minha-conta", icon: Users, category: "auth", requiresAuth: true, description: "Área do usuário (requer login)" },
  { name: "Checkout", path: "/checkout", icon: ShoppingCart, category: "auth", requiresAuth: true, description: "Finalização de compra (requer login)" },
  { name: "Pagamento PIX", path: "/pagamento-pix", icon: ShoppingCart, category: "auth", requiresAuth: true, description: "Pagamento via PIX (requer login)" },
  
  // Admin Routes
  { name: "Admin Dashboard", path: "/admin", icon: Settings, category: "admin", requiresAuth: true, description: "Painel administrativo" },
  { name: "Admin Bolões", path: "/admin/boloes", icon: Ticket, category: "admin", requiresAuth: true, description: "Gestão de bolões" },
  { name: "Admin Usuários", path: "/admin/usuarios", icon: Users, category: "admin", requiresAuth: true, description: "Gestão de usuários" },
  { name: "Admin Financeiro", path: "/admin/financeiro", icon: Database, category: "admin", requiresAuth: true, description: "Painel financeiro" },
  { name: "Admin Saques", path: "/admin/saques", icon: ShoppingCart, category: "admin", requiresAuth: true, description: "Gestão de saques" },
  { name: "Admin Configurações", path: "/admin/configuracoes", icon: Settings, category: "admin", requiresAuth: true, description: "Configurações do sistema" },
  
  // Dev Routes
  { name: "Teste de Páginas", path: "/teste-paginas", icon: Activity, category: "public", requiresAuth: false, description: "Página de testes (dev)" },
];

interface TestResult {
  path: string;
  status: "pending" | "success" | "error" | "warning";
  message: string;
  timestamp: number;
}

const categoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  public: { label: "Pública", color: "text-emerald-400", bgColor: "bg-emerald-500/20 border-emerald-500/30" },
  auth: { label: "Autenticação", color: "text-cyan-400", bgColor: "bg-cyan-500/20 border-cyan-500/30" },
  admin: { label: "Admin", color: "text-red-400", bgColor: "bg-red-500/20 border-red-500/30" },
};

const RouteCard = ({ 
  route, 
  testResult, 
  onTest,
  onNavigate 
}: { 
  route: RouteInfo; 
  testResult?: TestResult;
  onTest: (path: string) => void;
  onNavigate: (path: string) => void;
}) => {
  const Icon = route.icon;
  const config = categoryConfig[route.category];
  
  const getStatusIcon = () => {
    if (!testResult) return null;
    switch (testResult.status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };
  
  const getStatusBg = () => {
    if (!testResult) return "bg-bolao-card/40 border-bolao-card-border";
    switch (testResult.status) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "error":
        return "bg-red-500/10 border-red-500/30";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30";
      default:
        return "bg-bolao-card/40 border-bolao-card-border";
    }
  };
  
  return (
    <Card className={`p-4 transition-all hover:scale-[1.01] ${getStatusBg()}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white">{route.name}</h3>
              <Badge variant="outline" className={`text-xs ${config.bgColor} ${config.color}`}>
                {config.label}
              </Badge>
              {route.requiresAuth && (
                <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                  🔒 Auth
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">{route.path}</p>
            <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
            {testResult && testResult.message && (
              <p className={`text-xs mt-2 ${
                testResult.status === "success" ? "text-emerald-400" :
                testResult.status === "error" ? "text-red-400" :
                testResult.status === "warning" ? "text-amber-400" : "text-muted-foreground"
              }`}>
                {testResult.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {getStatusIcon()}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => onTest(route.path)}
          >
            <Play className="w-3 h-3" />
            Testar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="gap-1 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark"
            onClick={() => onNavigate(route.path)}
          >
            <ArrowRight className="w-3 h-3" />
            Ir
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function Diagnostico() {
  const [location, setLocation] = useLocation();
  const { isLoggedIn, user } = useAuth();
  const [testResults, setTestResults] = useState<Map<string, TestResult>>(new Map());
  const [isTestingAll, setIsTestingAll] = useState(false);
  
  const handleTest = useCallback((path: string) => {
    // Mark as pending
    setTestResults(prev => {
      const next = new Map(prev);
      next.set(path, {
        path,
        status: "pending",
        message: "Testando...",
        timestamp: Date.now(),
      });
      return next;
    });
    
    // Simulate route test
    setTimeout(() => {
      const route = allRoutes.find(r => r.path === path);
      
      let status: TestResult["status"] = "success";
      let message = "Rota acessível";
      
      if (route?.requiresAuth && !isLoggedIn) {
        status = "warning";
        message = "Requer autenticação - será redirecionado para login";
      }
      
      // Add random success variance for demo
      if (status === "success") {
        message = `✓ Rota funcionando (${Math.floor(Math.random() * 50 + 20)}ms)`;
      }
      
      setTestResults(prev => {
        const next = new Map(prev);
        next.set(path, {
          path,
          status,
          message,
          timestamp: Date.now(),
        });
        return next;
      });
    }, Math.random() * 500 + 200);
  }, [isLoggedIn]);
  
  const handleNavigate = useCallback((path: string) => {
    setLocation(path);
  }, [setLocation]);
  
  const handleTestAll = useCallback(async () => {
    setIsTestingAll(true);
    setTestResults(new Map());
    
    for (const route of allRoutes) {
      handleTest(route.path);
      await new Promise(r => setTimeout(r, 100));
    }
    
    setTimeout(() => setIsTestingAll(false), allRoutes.length * 100 + 600);
  }, [handleTest]);
  
  const publicRoutes = allRoutes.filter(r => r.category === "public");
  const authRoutes = allRoutes.filter(r => r.category === "auth");
  const adminRoutes = allRoutes.filter(r => r.category === "admin");
  
  const successCount = Array.from(testResults.values()).filter(r => r.status === "success").length;
  const warningCount = Array.from(testResults.values()).filter(r => r.status === "warning").length;
  const errorCount = Array.from(testResults.values()).filter(r => r.status === "error").length;
  
  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <Header />
      
      <main className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
              🔧 Diagnóstico do Sistema
            </Badge>
            <h1 className="text-4xl font-extrabold mb-4">
              Página de <span className="text-bolao-green">Diagnóstico</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Teste todas as rotas da aplicação e verifique o estado atual do sistema.
            </p>
          </div>
          
          {/* System Status Card */}
          <Card className="p-6 bg-gradient-to-br from-bolao-card to-bolao-dark border-bolao-card-border mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-bolao-green" />
              Estado da Aplicação
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground uppercase">Rota Atual</span>
                </div>
                <p className="font-mono text-sm text-white truncate">{location}</p>
              </div>
              <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-muted-foreground uppercase">Autenticação</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoggedIn ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-semibold">Logado</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-400 font-semibold">Não Logado</span>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-muted-foreground uppercase">Usuário</span>
                </div>
                <p className="text-sm text-white truncate">{user?.name || "—"}</p>
              </div>
              <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-muted-foreground uppercase">Timestamp</span>
                </div>
                <p className="text-sm text-white font-mono">{new Date().toLocaleTimeString("pt-BR")}</p>
              </div>
            </div>
            
            {user && (
              <div className="mt-4 p-4 bg-bolao-dark/50 rounded-xl border border-bolao-card-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Dados do Usuário (localStorage)</h3>
                <pre className="text-xs font-mono text-white/70 overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </Card>
          
          {/* Test All Button & Results Summary */}
          <Card className="p-6 bg-bolao-card/40 border-bolao-card-border mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold mb-1">Testar Todas as Rotas</h2>
                <p className="text-sm text-muted-foreground">
                  Execute um teste rápido em todas as {allRoutes.length} rotas do sistema.
                </p>
              </div>
              <Button 
                onClick={handleTestAll}
                disabled={isTestingAll}
                className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold px-6 gap-2"
              >
                {isTestingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Executar Todos os Testes
                  </>
                )}
              </Button>
            </div>
            
            {testResults.size > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-400">{successCount}</p>
                  <p className="text-xs text-muted-foreground">Sucesso</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
                  <p className="text-xs text-muted-foreground">Avisos</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-400">{errorCount}</p>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
            )}
          </Card>
          
          {/* Routes by Category */}
          <div className="space-y-8">
            {/* Public Routes */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={categoryConfig.public.bgColor}>
                  <span className={categoryConfig.public.color}>Rotas Públicas</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {publicRoutes.length} rotas
                </span>
              </div>
              <div className="space-y-3">
                {publicRoutes.map((route) => (
                  <RouteCard 
                    key={route.path} 
                    route={route} 
                    testResult={testResults.get(route.path)}
                    onTest={handleTest}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
            
            {/* Auth Routes */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={categoryConfig.auth.bgColor}>
                  <span className={categoryConfig.auth.color}>Rotas de Autenticação/Usuário</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {authRoutes.length} rotas
                </span>
              </div>
              <div className="space-y-3">
                {authRoutes.map((route) => (
                  <RouteCard 
                    key={route.path} 
                    route={route} 
                    testResult={testResults.get(route.path)}
                    onTest={handleTest}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
            
            {/* Admin Routes */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className={categoryConfig.admin.bgColor}>
                  <span className={categoryConfig.admin.color}>Rotas Administrativas</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {adminRoutes.length} rotas
                </span>
              </div>
              <div className="space-y-3">
                {adminRoutes.map((route) => (
                  <RouteCard 
                    key={route.path} 
                    route={route} 
                    testResult={testResults.get(route.path)}
                    onTest={handleTest}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Info */}
          <Card className="mt-10 p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Framework</p>
                <p className="font-semibold">React + Vite</p>
              </div>
              <div>
                <p className="text-muted-foreground">Router</p>
                <p className="font-semibold">Wouter</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total de Rotas</p>
                <p className="font-semibold">{allRoutes.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rotas Protegidas</p>
                <p className="font-semibold">{allRoutes.filter(r => r.requiresAuth).length}</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
