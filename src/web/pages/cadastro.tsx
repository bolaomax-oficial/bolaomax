import { useState, useMemo, useEffect } from "react";
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
  User,
  Phone,
  CreditCard,
  Check,
  X,
  Trophy,
  Clock,
  Calendar,
  Ticket,
  ArrowRight,
} from "lucide-react";

// CPF Mask function
const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// Phone Mask function
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// Password strength calculator
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  return { score, checks };
};

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

export default function Cadastro() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingBolao, setPendingBolao] = useState<PendingBolao | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const { register, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  // Check for pending bolão on mount
  useEffect(() => {
    const stored = getPendingBolao();
    if (stored) {
      setPendingBolao(stored);
    }
  }, []);

  // If already logged in and has pending bolão, redirect to checkout
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn && pendingBolao) {
      const checkoutUrl = buildCheckoutUrl(pendingBolao);
      clearPendingBolao();
      setLocation(checkoutUrl);
    } else if (!isAuthLoading && isLoggedIn) {
      // No pending bolão, redirect to home or minha-conta
      setLocation("/minha-conta");
    }
  }, [isLoggedIn, isAuthLoading, pendingBolao, setLocation]);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { label: "Muito fraca", color: "bg-red-500" };
    if (score === 2) return { label: "Fraca", color: "bg-orange-500" };
    if (score === 3) return { label: "Média", color: "bg-yellow-500" };
    if (score === 4) return { label: "Forte", color: "bg-bolao-green" };
    return { label: "Muito forte", color: "bg-bolao-green" };
  };

  const strengthInfo = getStrengthLabel(passwordStrength.score);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "cpf") {
      setFormData({ ...formData, cpf: formatCPF(value) });
    } else if (name === "phone") {
      setFormData({ ...formData, phone: formatPhone(value) });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register(formData.name, formData.email, formData.password);
      
      if (success) {
        // If there's a pending bolão, redirect to checkout
        if (pendingBolao) {
          const checkoutUrl = buildCheckoutUrl(pendingBolao);
          clearPendingBolao();
          setLocation(checkoutUrl);
        } else {
          // Check if there's a returnUrl in query params
          const params = new URLSearchParams(searchString);
          const returnUrl = params.get("returnUrl");
          if (returnUrl) {
            setLocation(decodeURIComponent(returnUrl));
          } else {
            setLocation("/minha-conta");
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bolao-dark flex items-center justify-center p-4 py-12 relative overflow-hidden">
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
              <h2 className="font-bold text-bolao-green">Crie sua conta para participar!</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Você está a um passo de participar do bolão <span className="font-semibold text-white">{pendingBolao.name}</span>
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
              {pendingBolao ? "Crie sua conta para participar" : "Crie sua conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pendingBolao 
                ? "Preencha seus dados e finalize sua participação no bolão"
                : "Junte-se a milhares de apostadores e comece a ganhar"
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
                Após criar sua conta, você poderá finalizar sua participação no checkout.
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                />
              </div>
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <label htmlFor="cpf" className="text-sm font-medium">
                CPF
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-4 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Crie uma senha forte"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-12 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength.score ? strengthInfo.color : "bg-bolao-card-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.score >= 4 ? "text-bolao-green" : "text-muted-foreground"}`}>
                    Força da senha: {strengthInfo.label}
                  </p>
                  
                  {/* Password Requirements */}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      {passwordStrength.checks.length ? (
                        <Check className="w-3 h-3 text-bolao-green" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.checks.length ? "text-bolao-green" : "text-muted-foreground"}>
                        8+ caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.checks.uppercase ? (
                        <Check className="w-3 h-3 text-bolao-green" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.checks.uppercase ? "text-bolao-green" : "text-muted-foreground"}>
                        Maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.checks.number ? (
                        <Check className="w-3 h-3 text-bolao-green" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.checks.number ? "text-bolao-green" : "text-muted-foreground"}>
                        Número
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.checks.special ? (
                        <Check className="w-3 h-3 text-bolao-green" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.checks.special ? "text-bolao-green" : "text-muted-foreground"}>
                        Especial
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-11 pr-12 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-bolao-green/50 focus:border-bolao-green transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">As senhas não coincidem</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer mt-4">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 rounded border-bolao-card-border bg-bolao-dark/50 text-bolao-green focus:ring-bolao-green focus:ring-offset-0 cursor-pointer"
                required
              />
              <span className="text-sm text-muted-foreground leading-tight">
                Eu li e aceito os{" "}
                <Link href="/termos-de-uso" className="text-bolao-green hover:text-bolao-green-light">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/politica-privacidade" className="text-bolao-green hover:text-bolao-green-light">
                  Política de Privacidade
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-base glow-green hover:glow-green-intense transition-all mt-4 gap-2"
              disabled={!formData.acceptTerms || formData.password !== formData.confirmPassword || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Criando conta...
                </>
              ) : pendingBolao ? (
                <>
                  Criar Conta e Participar
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                "Criar Minha Conta"
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
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continuar com Google
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link 
              href={pendingBolao ? `/login?returnUrl=${encodeURIComponent(buildCheckoutUrl(pendingBolao))}` : "/login"} 
              className="text-bolao-green hover:text-bolao-green-light font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
