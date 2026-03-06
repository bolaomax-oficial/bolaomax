import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { clearPendingBolao } from "@/utils/bolaoNavigation";
import {
  pagSeguroService,
  initializePagSeguro,
  createPaymentSession,
  processCardPayment,
  generatePixQRCode,
  getInstallmentOptions,
  type CardData,
  type InstallmentOption,
} from "@/services/pagSeguroService";
import {
  Sparkles,
  ArrowLeft,
  Trophy,
  Calendar,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Shield,
  Lock,
  ChevronRight,
  Wallet,
  Crown,
  Ticket,
  Star,
  Zap,
  AlertCircle,
  Home,
  Loader2,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Bolão type for data passed via query params
interface BolaoData {
  id: string;
  name?: string;
  type: string;
  dezenas: number;
  prizeValue: string;
  bolaoValue: number;
  sorteioDate: string;
  minParticipation: number;
  concurso?: string;
  isSpecial?: boolean;
}

// Subscription plan data
interface SubscriptionData {
  plan: "bronze" | "prata" | "ouro";
  isUpgrade?: boolean;
  currentPlan?: string;
}

// Subscription plan details
const subscriptionPlans = {
  bronze: {
    name: "Bronze",
    price: 79,
    annualPrice: 790,
    boloes: "2 bolões/semana",
    details: ["1 Lotofácil/semana", "1 Quina/semana"],
    color: "amber-700",
    icon: "🟢",
  },
  prata: {
    name: "Prata",
    price: 199,
    annualPrice: 1990,
    boloes: "6 bolões/semana",
    details: ["2 Lotofácil/semana", "2 Mega-Sena/semana", "2 Quina/semana", "Estratégias combinadas"],
    color: "slate-400",
    icon: "🔵",
    badge: "MAIS VENDIDO",
  },
  ouro: {
    name: "Ouro",
    price: 499,
    annualPrice: 4990,
    boloes: "21 bolões/semana",
    details: ["12 Lotofácil/semana", "3 Mega-Sena/semana", "6 Quina/semana", "4 jogos especiais", "Estratégias avançadas"],
    color: "amber-500",
    icon: "🟣",
    badge: "CLUBE VIP",
  },
};

// Get lottery theme colors
const getLotteryTheme = (type: string) => {
  switch (type) {
    case "Mega-Sena":
      return {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      };
    case "Lotofácil":
      return {
        bg: "bg-violet-500/20",
        border: "border-violet-500/30",
        text: "text-violet-400",
        badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
      };
    case "Quina":
      return {
        bg: "bg-sky-500/20",
        border: "border-sky-500/30",
        text: "text-sky-400",
        badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      };
    default:
      return {
        bg: "bg-bolao-green/20",
        border: "border-bolao-green/30",
        text: "text-bolao-green",
        badge: "bg-bolao-green/20 text-bolao-green border-bolao-green/30",
      };
  }
};

// Parse query string to get bolão data or subscription data
const parseQueryParams = (search: string): { bolao?: BolaoData; subscription?: SubscriptionData } => {
  const params = new URLSearchParams(search);
  
  // Check for subscription/upgrade
  const subscriptionPlan = params.get("subscription") as "bronze" | "prata" | "ouro" | null;
  const upgradePlan = params.get("upgrade") as "bronze" | "prata" | "ouro" | null;
  
  if (subscriptionPlan) {
    return { subscription: { plan: subscriptionPlan } };
  }
  
  if (upgradePlan) {
    return { subscription: { plan: upgradePlan, isUpgrade: true, currentPlan: params.get("from") || "bronze" } };
  }
  
  // Check for bolão data in new format (individual params from bolaoNavigation.ts)
  const bolaoId = params.get("bolaoId");
  if (bolaoId) {
    return {
      bolao: {
        id: bolaoId,
        name: params.get("name") || undefined,
        type: params.get("type") || "Lotofácil",
        dezenas: parseInt(params.get("dezenas") || "16"),
        prizeValue: params.get("prizeValue") || "R$ 1 Milhão",
        bolaoValue: parseFloat(params.get("bolaoValue") || "1000"),
        sorteioDate: params.get("sorteioDate") || "01/01",
        minParticipation: parseFloat(params.get("minParticipation") || "10"),
        concurso: params.get("concurso") || undefined,
        isSpecial: params.get("isSpecial") === "true",
      }
    };
  }
  
  // Check for bolão data in old format (JSON encoded)
  const data = params.get("data");
  if (data) {
    try {
      return { bolao: JSON.parse(decodeURIComponent(data)) };
    } catch (e) {
      return {};
    }
  }
  
  // No data - return empty
  return {};
};

// Card brand detection helper
const detectCardBrand = (cardNumber: string): string => {
  const num = cardNumber.replace(/\D/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  if (/^(?:2131|1800|35\d{3})/.test(num)) return 'jcb';
  if (/^(36|38|30[0-5])/.test(num)) return 'diners';
  if (/^(50|6767)/.test(num)) return 'elo';
  if (/^606282/.test(num)) return 'hipercard';
  return '';
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const num = value.replace(/\D/g, '').slice(0, 16);
  const parts = num.match(/.{1,4}/g) || [];
  return parts.join(' ');
};

// Format CPF with mask
const formatCPF = (value: string): string => {
  const num = value.replace(/\D/g, '').slice(0, 11);
  if (num.length <= 3) return num;
  if (num.length <= 6) return `${num.slice(0, 3)}.${num.slice(3)}`;
  if (num.length <= 9) return `${num.slice(0, 3)}.${num.slice(3, 6)}.${num.slice(6)}`;
  return `${num.slice(0, 3)}.${num.slice(3, 6)}.${num.slice(6, 9)}-${num.slice(9)}`;
};

// Format expiration date
const formatExpiration = (value: string): string => {
  const num = value.replace(/\D/g, '').slice(0, 4);
  if (num.length <= 2) return num;
  return `${num.slice(0, 2)}/${num.slice(2)}`;
};

const Checkout = () => {
  const { isLoggedIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  
  const [participation, setParticipation] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [copied, setCopied] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  
  // Card payment states
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiration, setCardExpiration] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardCPF, setCardCPF] = useState("");
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([]);
  const [showCVV, setShowCVV] = useState(false);
  const [cardBrand, setCardBrand] = useState("");
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; copyPasteCode: string } | null>(null);
  
  // PagSeguro initialization
  const [pagSeguroReady, setPagSeguroReady] = useState(false);
  
  const { bolao: bolaoData, subscription: subscriptionData } = parseQueryParams(search);
  const isSubscription = !!subscriptionData;
  const planDetails = subscriptionData ? subscriptionPlans[subscriptionData.plan] : null;
  const lotteryTheme = bolaoData ? getLotteryTheme(bolaoData.type) : null;

  // Initialize PagSeguro on mount
  useEffect(() => {
    const init = async () => {
      const success = await initializePagSeguro();
      setPagSeguroReady(success);
      if (success) {
        await createPaymentSession();
      }
    };
    init();
  }, []);

  // Clear pending bolão from localStorage on mount (user has arrived at checkout)
  useEffect(() => {
    if (bolaoData) {
      clearPendingBolao();
    }
  }, [bolaoData]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      const returnUrl = encodeURIComponent(`/checkout${search ? `?${search}` : ""}`);
      setLocation(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoggedIn, search, setLocation]);

  // Detect card brand and load installment options
  useEffect(() => {
    const num = cardNumber.replace(/\D/g, '');
    if (num.length >= 6) {
      const brand = detectCardBrand(num);
      setCardBrand(brand);
      
      // Load installment options when we have a valid card number
      if (brand && finalValue > 0) {
        getInstallmentOptions(finalValue, 12).then(options => {
          setInstallmentOptions(options);
        });
      }
    } else {
      setCardBrand("");
      setInstallmentOptions([]);
    }
  }, [cardNumber]);

  // If not logged in, return null
  if (!isLoggedIn) {
    return null;
  }

  // Show error state if no bolão or subscription selected
  if (!bolaoData && !subscriptionData) {
    return (
      <div className="min-h-screen bg-bolao-dark text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-bolao-card border-bolao-card-border text-center">
          <div className="p-4 rounded-full bg-orange-500/20 w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nenhum bolão selecionado</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa selecionar um bolão para participar antes de acessar o checkout.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/lotofacil">
              <Button className="w-full bg-violet-600 hover:bg-violet-500">
                <Ticket className="w-4 h-4 mr-2" />
                Ver Bolões Lotofácil
              </Button>
            </Link>
            <Link href="/megasena">
              <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                <Trophy className="w-4 h-4 mr-2" />
                Ver Bolões Mega-Sena
              </Button>
            </Link>
            <Link href="/quina">
              <Button variant="outline" className="w-full border-sky-500/50 text-sky-400 hover:bg-sky-500/10">
                <Star className="w-4 h-4 mr-2" />
                Ver Bolões Quina
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full text-muted-foreground">
                <Home className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate values for bolão
  const valorParticipacao = bolaoData ? (bolaoData.bolaoValue * participation) / 100 : 0;
  const premioEstimado = bolaoData && bolaoData.prizeValue.includes("Milhões") 
    ? parseFloat(bolaoData.prizeValue.replace("R$ ", "").replace(",", ".").replace(" Milhões", "")) * 1000000
    : bolaoData ? parseFloat(bolaoData.prizeValue.replace("R$ ", "").replace(",", ".")) : 0;
  const seuPremio = (premioEstimado * participation) / 100;
  
  // Calculate values for subscription
  const subscriptionPrice = planDetails 
    ? (billingPeriod === "annual" ? planDetails.annualPrice : planDetails.price)
    : 0;
  
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(2).replace(".", ",")} Milhões`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1).replace(".", ",")} Mil`;
    }
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  const finalValue = isSubscription ? subscriptionPrice : valorParticipacao;
  
  // Get total with installment interest
  const getTotalWithInstallments = (): number => {
    if (selectedInstallments === 1) return finalValue;
    const option = installmentOptions.find(o => o.quantity === selectedInstallments);
    return option?.totalAmount || finalValue;
  };

  // Handle card payment
  const handleCardPayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    setProcessingStep("Validando dados do cartão...");
    
    try {
      // Validate card data
      const cardData: CardData = {
        number: cardNumber.replace(/\D/g, ''),
        holderName: cardHolder,
        expirationMonth: cardExpiration.split('/')[0],
        expirationYear: '20' + cardExpiration.split('/')[1],
        cvv: cardCVV,
        cpf: cardCPF.replace(/\D/g, ''),
      };

      // Basic validation
      if (cardData.number.length < 13) throw new Error('Número do cartão inválido');
      if (!cardData.holderName || cardData.holderName.split(' ').length < 2) throw new Error('Nome completo do titular é obrigatório');
      if (!cardExpiration || cardExpiration.length < 5) throw new Error('Data de validade inválida');
      if (cardData.cvv.length < 3) throw new Error('CVV inválido');
      if (cardData.cpf.length !== 11) throw new Error('CPF inválido');

      setProcessingStep("Processando pagamento...");
      
      // Process payment through PagSeguro
      const response = await processCardPayment(
        cardData,
        { value: getTotalWithInstallments() },
        selectedInstallments
      );

      if (response.status === 'PAID') {
        setPaymentSuccess(true);
        setProcessingStep("Pagamento aprovado!");
        
        // Navigate to success page after delay
        setTimeout(() => {
          if (isSubscription) {
            setLocation('/minha-conta?tab=assinatura&payment=success');
          } else {
            setLocation('/minha-conta?tab=participacoes&payment=success');
          }
        }, 2000);
      } else {
        throw new Error('Pagamento não aprovado. Tente novamente.');
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Erro ao processar pagamento');
      setIsProcessing(false);
    }
  };

  // Handle PIX payment
  const handlePixPayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    setProcessingStep("Gerando código PIX...");
    
    try {
      const description = isSubscription 
        ? `Assinatura Plano ${planDetails?.name} - BolãoMax`
        : `Participação Bolão ${bolaoData?.type} - BolãoMax`;
      
      const response = await generatePixQRCode(
        { value: finalValue },
        description
      );

      setPixData({
        qrCode: response.qrCodeBase64,
        copyPasteCode: response.copyPasteCode,
      });
      
      setIsProcessing(false);
      setProcessingStep("");
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Erro ao gerar PIX');
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.copyPasteCode) {
      navigator.clipboard.writeText(pixData.copyPasteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleConfirm = () => {
    if (paymentMethod === "card") {
      handleCardPayment();
    } else {
      handlePixPayment();
    }
  };

  // Navigate to old PIX page (kept for compatibility)
  const handleConfirmOld = () => {
    if (isSubscription) {
      const paymentData = {
        type: "subscription",
        plan: subscriptionData?.plan,
        isUpgrade: subscriptionData?.isUpgrade,
        billingPeriod,
        valor: subscriptionPrice,
      };
      setLocation(`/pagamento-pix?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
    } else {
      const paymentData = {
        type: "bolao",
        bolao: bolaoData,
        participation,
        valor: valorParticipacao,
        premioEstimado: seuPremio,
      };
      setLocation(`/pagamento-pix?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
    }
  };

  // Payment success state
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-bolao-dark text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-bolao-card border-bolao-card-border text-center">
          <div className="p-4 rounded-full bg-emerald-500/20 w-fit mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-emerald-400">Pagamento Aprovado!</h2>
          <p className="text-muted-foreground mb-6">
            Seu pagamento foi processado com sucesso. Redirecionando para sua conta...
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-bolao-green" />
            <span className="text-sm text-muted-foreground">Aguarde...</span>
          </div>
        </Card>
      </div>
    );
  }

  // PIX generated state
  if (pixData) {
    return (
      <div className="min-h-screen bg-bolao-dark text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-bolao-dark/95 backdrop-blur-xl border-b border-bolao-card-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-bolao-dark" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  Bolão<span className="text-bolao-green">Max</span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 py-12">
          <Card className="p-8 bg-bolao-card border-bolao-card-border text-center">
            <div className="p-3 rounded-full bg-bolao-green/20 w-fit mx-auto mb-4">
              <QrCode className="w-8 h-8 text-bolao-green" />
            </div>
            <h2 className="text-2xl font-bold mb-2">PIX Gerado com Sucesso!</h2>
            <p className="text-muted-foreground mb-6">
              Escaneie o QR Code abaixo ou copie o código PIX
            </p>

            {/* QR Code Display */}
            <div className="p-4 bg-white rounded-xl mb-6 mx-auto w-fit">
              <img 
                src={pixData.qrCode} 
                alt="QR Code PIX" 
                className="w-48 h-48 object-contain"
              />
            </div>

            {/* Value */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-3xl font-bold text-bolao-green">
                R$ {finalValue.toFixed(2).replace(".", ",")}
              </p>
            </div>

            {/* Copy PIX Code */}
            <div className="p-4 bg-bolao-dark rounded-lg mb-6">
              <p className="text-xs text-muted-foreground mb-2">Código PIX Copia e Cola</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-left bg-bolao-card p-3 rounded border border-bolao-card-border overflow-hidden text-ellipsis">
                  {pixData.copyPasteCode.slice(0, 50)}...
                </code>
                <Button
                  onClick={copyPixCode}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-bolao-green text-bolao-green hover:bg-bolao-green/10"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6 text-left">
              <p className="text-sm text-amber-300 font-medium mb-2">⏰ Pague em até 30 minutos</p>
              <p className="text-xs text-muted-foreground">
                O código PIX expira em 30 minutos. Após o pagamento, sua participação será confirmada automaticamente.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link href="/minha-conta">
                <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Já paguei - Ver minha conta
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setPixData(null)}
                className="border-bolao-card-border"
              >
                Escolher outro método
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bolao-dark/95 backdrop-blur-xl border-b border-bolao-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-bolao-dark" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Bolão<span className="text-bolao-green">Max</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-bolao-card/50 rounded-lg border border-bolao-card-border">
                <Shield className="w-4 h-4 text-bolao-green" />
                <span className="text-sm text-muted-foreground">Pagamento Seguro</span>
              </div>
              <Link href={isSubscription ? "/minha-conta" : bolaoData?.type === "Lotofácil" ? "/lotofacil" : bolaoData?.type === "Mega-Sena" ? "/megasena" : "/quina"}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        {bolaoData && !isSubscription && (
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-muted-foreground hover:text-white transition-colors">
              Início
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link 
              href={bolaoData.type === "Lotofácil" ? "/lotofacil" : bolaoData.type === "Mega-Sena" ? "/megasena" : "/quina"} 
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {bolaoData.type}
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className={`${lotteryTheme?.text || "text-bolao-green"} font-medium`}>Checkout</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            <span className="text-muted-foreground/50">Pagamento</span>
          </nav>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isSubscription 
                  ? (subscriptionData?.isUpgrade ? "Fazer Upgrade" : "Assinar Plano")
                  : "Finalizar Participação"
                }
              </h1>
              <p className="text-muted-foreground">
                {isSubscription 
                  ? (subscriptionData?.isUpgrade 
                      ? `Upgrade para o Plano ${planDetails?.name}` 
                      : `Assine o Plano ${planDetails?.name} e participe automaticamente`)
                  : "Complete sua participação no bolão selecionado"
                }
              </p>
            </div>

            {/* Subscription Plan Summary (for subscription checkout) */}
            {isSubscription && planDetails && (
              <Card className={`p-6 bg-gradient-to-br from-${planDetails.color}/20 to-bolao-card border-${planDetails.color}/30`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${planDetails.color}/40 to-${planDetails.color}/20 border border-${planDetails.color}/30`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{planDetails.icon}</span>
                      <h3 className="text-xl font-bold">Plano {planDetails.name}</h3>
                      {planDetails.badge && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-0">
                          {planDetails.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{planDetails.boloes}</p>
                    <div className="flex flex-wrap gap-2">
                      {planDetails.details.map((detail, idx) => (
                        <Badge key={idx} className="bg-white/10 text-white/80 text-xs border-0">
                          <Check className="w-3 h-3 mr-1" />
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Bolão Summary Card (for bolão checkout) */}
            {bolaoData && !isSubscription && (
              <Card className={`p-6 bg-gradient-to-br from-bolao-card to-bolao-card/80 ${lotteryTheme?.border || "border-bolao-card-border"} border-2`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${lotteryTheme?.bg || "bg-bolao-green/20"} ${lotteryTheme?.border || "border-bolao-green/30"} border`}>
                    <Trophy className={`w-6 h-6 ${lotteryTheme?.text || "text-bolao-green"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={lotteryTheme?.badge || "bg-bolao-green/20 text-bolao-green border-bolao-green/30"}>
                        {bolaoData.type}
                      </Badge>
                      <Badge className={lotteryTheme?.badge || "bg-bolao-green/20 text-bolao-green border-bolao-green/30"}>
                        {bolaoData.dezenas} dezenas
                      </Badge>
                      {bolaoData.isSpecial && (
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                          🏆 ESPECIAL
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-1">
                      {bolaoData.name || `Bolão #${bolaoData.id}`}
                    </h3>
                    {bolaoData.concurso && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Concurso {bolaoData.concurso}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Sorteio: {bolaoData.sorteioDate}
                      </span>
                      <span className={`${lotteryTheme?.text || "text-bolao-green"} font-semibold`}>
                        🏆 {bolaoData.prizeValue}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Billing Period Toggle (for subscription) */}
            {isSubscription && planDetails && (
              <Card className="p-6 bg-bolao-card border-bolao-card-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-bolao-green" />
                  Período de Cobrança
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      billingPeriod === "monthly" 
                        ? "border-bolao-green bg-bolao-green/10" 
                        : "border-bolao-card-border hover:border-bolao-green/30"
                    }`}
                  >
                    <p className="font-bold text-lg">Mensal</p>
                    <p className="text-2xl font-black text-bolao-green">R$ {planDetails.price}</p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                  </button>
                  
                  <button
                    onClick={() => setBillingPeriod("annual")}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      billingPeriod === "annual" 
                        ? "border-bolao-green bg-bolao-green/10" 
                        : "border-bolao-card-border hover:border-bolao-green/30"
                    }`}
                  >
                    <div className="absolute -top-2 right-2">
                      <Badge className="bg-emerald-500 text-white text-xs">2 MESES GRÁTIS</Badge>
                    </div>
                    <p className="font-bold text-lg">Anual</p>
                    <p className="text-2xl font-black text-bolao-green">R$ {planDetails.annualPrice}</p>
                    <p className="text-xs text-muted-foreground">/ano (≈ R$ {(planDetails.annualPrice / 12).toFixed(0)}/mês)</p>
                  </button>
                </div>
              </Card>
            )}

            {/* Participation Slider (for bolão checkout) */}
            {bolaoData && !isSubscription && (
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-bolao-green" />
                Defina sua Participação
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-muted-foreground">Porcentagem do bolão</span>
                    <span className="text-2xl font-bold text-bolao-green">{participation}%</span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={participation}
                    onChange={(e) => setParticipation(parseInt(e.target.value))}
                    className="w-full h-3 bg-bolao-dark/60 rounded-full appearance-none cursor-pointer accent-bolao-green"
                    style={{
                      background: `linear-gradient(to right, #00C853 0%, #00C853 ${((participation - 5) / 45) * 100}%, #1a1f2e ${((participation - 5) / 45) * 100}%, #1a1f2e 100%)`,
                    }}
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>5%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20, 25, 30, 50].map((value) => (
                    <Button
                      key={value}
                      variant={participation === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setParticipation(value)}
                      className={participation === value ? "bg-bolao-green text-bolao-dark hover:bg-bolao-green-dark" : "border-bolao-card-border hover:border-bolao-green/50"}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>

                {/* Calculation Summary */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-bolao-card-border">
                  <div className="p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
                    <p className="text-xs text-muted-foreground mb-1">Valor do Bolão</p>
                    <p className="text-lg font-bold">R$ {bolaoData.bolaoValue.toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bolao-dark/50 border border-bolao-card-border">
                    <p className="text-xs text-muted-foreground mb-1">Sua Participação ({participation}%)</p>
                    <p className="text-lg font-bold text-bolao-green">R$ {valorParticipacao.toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>

                {/* Prize calculation */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-bolao-green/20 to-emerald-500/10 border border-bolao-green/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-bolao-green" />
                    <span className="font-semibold text-bolao-green">Se o bolão ganhar</span>
                  </div>
                  <p className="text-3xl font-extrabold text-white mb-1">
                    🏆 {formatCurrency(seuPremio)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Proporcional à sua participação de {participation}%
                  </p>
                </div>
              </div>
            </Card>
            )}

            {/* Payment Method */}
            <Card className="p-6 bg-bolao-card border-bolao-card-border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-bolao-green" />
                Método de Pagamento
                {pagSeguroReady && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-0 ml-auto">
                    <Shield className="w-3 h-3 mr-1" />
                    PagSeguro
                  </Badge>
                )}
              </h3>
              
              <div className="space-y-4">
                {/* PIX Option */}
                <button
                  onClick={() => setPaymentMethod("pix")}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === "pix"
                      ? "border-bolao-green bg-bolao-green/10"
                      : "border-bolao-card-border hover:border-bolao-green/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${paymentMethod === "pix" ? "bg-bolao-green/20" : "bg-bolao-dark/50"}`}>
                    <QrCode className={`w-6 h-6 ${paymentMethod === "pix" ? "text-bolao-green" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">PIX</p>
                    <p className="text-sm text-muted-foreground">Pagamento instantâneo • Sem taxas</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 text-xs border-0">Recomendado</Badge>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "pix" ? "border-bolao-green bg-bolao-green" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "pix" && <Check className="w-3 h-3 text-bolao-dark" />}
                  </div>
                </button>

                {/* Card Option */}
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === "card"
                      ? "border-bolao-green bg-bolao-green/10"
                      : "border-bolao-card-border hover:border-bolao-green/50"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${paymentMethod === "card" ? "bg-bolao-green/20" : "bg-bolao-dark/50"}`}>
                    <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-bolao-green" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Cartão de Crédito</p>
                    <p className="text-sm text-muted-foreground">Parcele em até 12x</p>
                  </div>
                  <div className="flex gap-1">
                    <img src="https://www.svgrepo.com/show/328144/visa.svg" alt="Visa" className="h-6 w-auto" />
                    <img src="https://www.svgrepo.com/show/328109/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "card" ? "border-bolao-green bg-bolao-green" : "border-muted-foreground"
                  }`}>
                    {paymentMethod === "card" && <Check className="w-3 h-3 text-bolao-dark" />}
                  </div>
                </button>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="mt-6 p-6 rounded-xl bg-bolao-dark/50 border border-bolao-card-border space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-bolao-green" />
                      <span className="text-sm text-muted-foreground">Seus dados estão protegidos</span>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Número do Cartão</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green transition-colors"
                          maxLength={19}
                        />
                        {cardBrand && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Badge className="bg-white/10 text-white text-xs uppercase">{cardBrand}</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Holder Name */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Nome no Cartão</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green transition-colors uppercase"
                      />
                    </div>

                    {/* Expiration and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Validade</label>
                        <input
                          type="text"
                          value={cardExpiration}
                          onChange={(e) => setCardExpiration(formatExpiration(e.target.value))}
                          placeholder="MM/AA"
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green transition-colors"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">CVV</label>
                        <div className="relative">
                          <input
                            type={showCVV ? "text" : "password"}
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green transition-colors"
                            maxLength={4}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCVV(!showCVV)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                          >
                            {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CPF */}
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">CPF do Titular</label>
                      <input
                        type="text"
                        value={cardCPF}
                        onChange={(e) => setCardCPF(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-bolao-green transition-colors"
                        maxLength={14}
                      />
                    </div>

                    {/* Installments */}
                    {installmentOptions.length > 0 && (
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Parcelas</label>
                        <select
                          value={selectedInstallments}
                          onChange={(e) => setSelectedInstallments(parseInt(e.target.value))}
                          className="w-full bg-bolao-card border border-bolao-card-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-bolao-green transition-colors"
                        >
                          {installmentOptions.map((option) => (
                            <option key={option.quantity} value={option.quantity}>
                              {option.quantity}x de R$ {option.installmentAmount.toFixed(2).replace(".", ",")}
                              {option.interestFree ? " (sem juros)" : ` (total R$ ${option.totalAmount.toFixed(2).replace(".", ",")})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Installment Info */}
                    {selectedInstallments > 1 && installmentOptions.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-amber-300">
                            Total: R$ {getTotalWithInstallments().toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedInstallments}x de R$ {(getTotalWithInstallments() / selectedInstallments).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PIX Preview */}
                {paymentMethod === "pix" && (
                  <div className="mt-4 p-4 rounded-xl bg-bolao-dark/50 border border-bolao-card-border">
                    <p className="text-sm text-muted-foreground mb-3">
                      Ao confirmar, você receberá o código PIX para pagamento
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-bolao-dark rounded-lg border border-bolao-card-border">
                      <Lock className="w-4 h-4 text-bolao-green" />
                      <span className="text-xs text-muted-foreground">
                        Pagamento protegido por criptografia
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Error */}
                {paymentError && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-400 font-medium">Erro no pagamento</p>
                      <p className="text-xs text-red-300/70">{paymentError}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Confirm Button - Mobile */}
            <div className="lg:hidden">
              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full h-14 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-lg gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {processingStep}
                  </>
                ) : (
                  <>
                    {paymentMethod === "card" ? "Pagar com Cartão" : "Gerar PIX e Pagar"}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6 bg-gradient-to-br from-bolao-card to-bolao-card/80 border-bolao-card-border">
                <h3 className="text-lg font-bold mb-4">Resumo</h3>
                
                <div className="space-y-4">
                  {isSubscription && planDetails ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Plano</span>
                        <span className="font-semibold">{planDetails.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Período</span>
                        <span className="font-semibold">{billingPeriod === "annual" ? "Anual" : "Mensal"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bolões/semana</span>
                        <span className="font-semibold">{planDetails.boloes.split(" ")[0]}</span>
                      </div>
                      {subscriptionData?.isUpgrade && (
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>Tipo</span>
                          <Badge className="bg-emerald-500/20 text-emerald-300">UPGRADE</Badge>
                        </div>
                      )}
                    </>
                  ) : bolaoData ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bolão</span>
                        <span className="font-semibold">{bolaoData.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Dezenas</span>
                        <span className="font-semibold">{bolaoData.dezenas}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sorteio</span>
                        <span className="font-semibold">{bolaoData.sorteioDate}</span>
                      </div>
                      
                      <div className="border-t border-bolao-card-border pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Valor do Bolão</span>
                          <span className="font-semibold">R$ {bolaoData.bolaoValue.toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Participação</span>
                        <span className="font-semibold text-bolao-green">{participation}%</span>
                      </div>
                    </>
                  ) : null}
                  
                  <div className="border-t border-bolao-card-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Valor a Pagar</span>
                      <span className="text-2xl font-extrabold text-bolao-green">
                        R$ {(paymentMethod === "card" && selectedInstallments > 1 
                          ? getTotalWithInstallments() 
                          : finalValue
                        ).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    {paymentMethod === "card" && selectedInstallments > 1 && (
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        ou {selectedInstallments}x de R$ {(getTotalWithInstallments() / selectedInstallments).toFixed(2).replace(".", ",")}
                      </p>
                    )}
                  </div>

                  {!isSubscription && bolaoData && (
                    <div className="p-4 rounded-lg bg-bolao-green/10 border border-bolao-green/30">
                      <p className="text-sm text-muted-foreground mb-1">Seu prêmio se ganhar</p>
                      <p className="text-xl font-bold text-bolao-green">
                        🏆 {formatCurrency(seuPremio)}
                      </p>
                    </div>
                  )}

                  {isSubscription && (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-sm text-muted-foreground mb-1">Renovação automática</p>
                      <p className="text-sm text-amber-300">
                        {billingPeriod === "annual" ? "Anual" : "Mensal"} - você pode cancelar a qualquer momento
                      </p>
                    </div>
                  )}

                  {/* User Info */}
                  {user && (
                    <div className="pt-4 border-t border-bolao-card-border">
                      <p className="text-xs text-muted-foreground mb-2">{isSubscription ? "Assinando como" : "Participando como"}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center text-bolao-green font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Button - Desktop */}
                  <Button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="hidden lg:flex w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {processingStep || "Processando..."}
                      </>
                    ) : (
                      <>
                        {paymentMethod === "card" ? "Pagar com Cartão" : "Gerar PIX"}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>

                  {/* Cancellation policy disclaimer */}
                  {!isSubscription && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Cancelamentos antes do registro dos jogos: taxa de 20%. 
                      Você receberá 80% do valor pago.
                    </p>
                  )}

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>SSL</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-bolao-green" />
                      <span>PagSeguro</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
