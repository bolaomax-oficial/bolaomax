import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getPendingBolao, clearPendingBolao, buildCheckoutUrl, PendingBolao } from "@/utils/bolaoNavigation";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Chrome,
  Loader2,
  Trophy,
  Calendar,
  Ticket,
  Clock,
  ArrowRight,
} from "lucide-react";

// Get lottery color theme
const getLotteryTheme = (type: string) => {
  switch (type) {
    case "Mega-Sena":
      return {
        bg: "from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };
    case "Lotofácil":
      return {
        bg: "from-violet-500/20 to-violet-600/10",
        border: "border-violet-500/50",
        text: "text-violet-400",
        badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
      };
    case "Quina":
      return {
        bg: "from-sky-500/20 to-sky-600/10",
        border: "border-sky-500/50",
        text: "text-sky-400",
        badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      };
    default:
      return {
        bg: "from-bolao-green/20 to-bolao-green/10",
        border: "border-bolao-green/50",
        text: "text-bolao-green",
        badge: "bg-bolao-green/20 text-bolao-green border-bolao-green/30",
      };
  }
};

// Bolão Preview Card Component
const BolaoPreviewCard = ({ bolao }: { bolao: PendingBolao }) => {
  const theme = getLotteryTheme(bolao.type);
  
  return (
    <Card className={`p-4 bg-gradient-to-br ${theme.bg} ${theme.border} border-2 mb-6`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-bolao-dark/40 ${theme.border} border`}>
          <Ticket className={`w-5 h-5 ${theme.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge className={theme.badge}>
              {bolao.type}
            </Badge>
            <Badge className={theme.badge}>
              {bolao.dezenas} dezenas
            </Badge>
            {bolao.isSpecial && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                🏆 ESPECIAL
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-white truncate">{bolao.name}</h3>
          {bolao.concurso && (
            <p className="text-xs text-muted-foreground">Concurso {bolao.concurso}</p>
          )}
          
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${theme.text}`} />
              <div>
                <p className="text-xs text-muted-foreground">Prêmio</p>
                <p className={`text-sm font-bold ${theme.text}`}>{bolao.prizeValue}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${theme.text}`} />
              <div>
                <p className="text-xs text-muted-foreground">Sorteio</p>
                <p className="text-sm font-medium">{bolao.sorteioDate}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Participação mínima</span>
            <span className="text-lg font-bold text-orange-400">
              R$ {bolao.minParticipation.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingBolao, setPendingBolao] = useState<PendingBolao | null>(null);
  
  const { login, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  
  // Get return URL from query params
  const params = new URLSearchParams(search);
  const returnUrl = params.get("returnUrl");

  // Check for pending bolão on mount
  useEffect(() => {
    const stored = getPendingBolao();
    if (stored) {
      setPendingBolao(stored);
    }
  }, []);

  // If already logged in and has pending bolão, redirect to checkout
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      if (pendingBolao) {
        const checkoutUrl = buildCheckoutUrl(pendingBolao);
        clearPendingBolao();
        setLocation(checkoutUrl);
      } else if (returnUrl) {
        setLocation(decodeURIComponent(returnUrl));
      } else {
        setLocation("/minha-conta");
      }
    }
  }, [isLoggedIn, isAuthLoading, pendingBolao, returnUrl, setLocation]);
  
  // Local loading state combines auth loading and form submission
  const isLoading = isSubmitting || isAuthLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Redirect based on pending bolão or return URL
        if (pendingBolao) {
          const checkoutUrl = buildCheckoutUrl(pendingBolao);
          clearPendingBolao();
          setLocation(checkoutUrl);
        } else if (returnUrl) {
          setLocation(decodeURIComponent(returnUrl));
        } else {
          setLocation("/minha-conta");
        }
      } else {
        setError("Email ou senha inválidos");
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build signup URL that preserves bolão context
  const getSignupUrl = () => {
    if (pendingBolao) {
      return `/cadastro?returnUrl=${encodeURIComponent(buildCheckoutUrl(pendingBolao))}`;
    }
    return "/cadastro";
  };

  return (
    <div className="min-h-screen bg-bolao-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 radial-gradient" />
      
      {/* Floating Elements */}
      <div className="absolute top-1/4 left-[10%] w-3 h-3 bg-bolao-green rounded-full animate-float opacity-40" />
      <div className="absolute bottom-1/4 right-[15%] w-2 h-2 bg-bolao-green-light rounded-full animate-float opacity-30" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-[10%] w-4 h-4 bg-bolao-gold rounded-full animate-float opacity-20" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        {/* Pending Bolão Banner */}
        {pendingBolao && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-bolao-green/20 via-bolao-green/10 to-bolao-green/20 border border-bolao-green/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-bolao-green" />
              <h2 className="font-bold text-bolao-green">Entre para participar!</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Faça login para finalizar sua participação no bolão <span className="font-semibold text-white">{pendingBolao.name}</span>
            </p>
          </div>
        )}

        {/* Card */}
        <Card className="p-8 bg-bolao-card/80 border-bolao-card-border backdrop-blur-xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center glow-green">
                <Sparkles className="w-6 h-6 text-bolao-dark" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">
                Bolão<span className="text-bolao-green">Max</span>
              </span>
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {pendingBolao ? "Entre na sua conta para participar" : "Bem-vindo de volta!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pendingBolao 
                ? "Faça login e finalize sua participação no bolão"
                : "Entre para acessar seus bolões e acompanhar seus resultados"
              }
            </p>
          </div>

          {/* Bolão Preview Card - only show if there's a pending bolão */}
          {pendingBolao && <BolaoPreviewCard bolao={pendingBolao} />}

          {/* Participation Flow Indicator */}
          {pendingBolao && (
            <div className="mb-6 p-3 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-bolao-green" />
                Após fazer login, você será redirecionado para o checkout para finalizar sua participação.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-bolao-card-border bg-bolao-dark/50 text-bolao-green focus:ring-bolao-green focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">Lembrar-me</span>
              </label>
              <Link href="/esqueci-senha" className="text-sm text-bolao-green hover:text-bolao-green-light transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-base glow-green hover:glow-green-intense transition-all disabled:opacity-50 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : pendingBolao ? (
                <>
                  Entrar e Participar
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bolao-card-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-bolao-card text-sm text-muted-foreground">
                ou continue com
              </span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-bolao-card-border hover:bg-bolao-dark/50 font-medium"
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continuar com Google
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <Link href={getSignupUrl()} className="text-bolao-green hover:text-bolao-green-light font-medium transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
