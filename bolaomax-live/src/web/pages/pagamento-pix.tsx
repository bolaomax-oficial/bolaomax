import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  ArrowLeft,
  Trophy,
  Calendar,
  Copy,
  Check,
  Shield,
  Clock,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface PaymentData {
  bolao: {
    id: string;
    type: string;
    dezenas: number;
    prizeValue: string;
    bolaoValue: number;
    sorteioDate: string;
    minParticipation: number;
  };
  participation: number;
  valor: number;
  premioEstimado: number;
}

const parsePaymentData = (search: string): PaymentData | null => {
  const params = new URLSearchParams(search);
  const data = params.get("data");
  if (data) {
    try {
      return JSON.parse(decodeURIComponent(data));
    } catch (e) {
      return null;
    }
  }
  return null;
};

const PagamentoPix = () => {
  const { isLoggedIn, user } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed">("pending");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  
  const paymentData = parsePaymentData(search);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login?returnUrl=/pagamento-pix");
    }
  }, [isLoggedIn, setLocation]);

  // Countdown timer
  useEffect(() => {
    if (paymentStatus !== "completed" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStatus, timeLeft]);

  // Simulate payment processing
  useEffect(() => {
    if (paymentStatus === "processing") {
      const timeout = setTimeout(() => {
        setPaymentStatus("completed");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [paymentStatus]);

  if (!isLoggedIn || !paymentData) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Generate a mock PIX code
  const pixCode = `00020126580014br.gov.bcb.pix0136${Date.now().toString(36)}520400005303986540${paymentData.valor.toFixed(2)}5802BR5925BOLAOMAX PLATAFORMA LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const simulatePayment = () => {
    setPaymentStatus("processing");
  };

  if (paymentStatus === "completed") {
    return (
      <div className="min-h-screen bg-bolao-dark text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-bolao-card border-bolao-card-border text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bolao-green/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-bolao-green" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pagamento Confirmado!</h1>
          <p className="text-muted-foreground mb-6">
            Sua participação no bolão foi registrada com sucesso.
          </p>
          
          <Card className="p-4 bg-bolao-dark/50 border-bolao-card-border mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Bolão</span>
              <span className="font-semibold">{paymentData.bolao.type} #{paymentData.bolao.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Participação</span>
              <span className="font-semibold text-bolao-green">{paymentData.participation}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Pago</span>
              <span className="font-bold text-bolao-green">{formatCurrency(paymentData.valor)}</span>
            </div>
          </Card>
          
          <div className="p-4 bg-bolao-green/10 border border-bolao-green/30 rounded-xl mb-6">
            <p className="text-sm text-bolao-green font-medium mb-1">Seu prêmio se ganhar</p>
            <p className="text-2xl font-extrabold text-bolao-green">
              🏆 {formatCurrency(paymentData.premioEstimado)}
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/minha-conta" className="flex-1">
              <Button variant="outline" className="w-full border-bolao-card-border">
                Ver Minhas Participações
              </Button>
            </Link>
            <Link href="/lotofacil" className="flex-1">
              <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                Ver Mais Bolões
              </Button>
            </Link>
          </div>
        </Card>
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
            
            <Link href="/checkout">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Pagamento via PIX</h1>
          <p className="text-muted-foreground">Escaneie o QR Code ou copie o código PIX</p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            timeLeft < 300 ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            <span className="text-sm">restantes</span>
          </div>
        </div>

        {/* QR Code Card */}
        <Card className="p-6 bg-bolao-card border-bolao-card-border mb-6">
          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="w-56 h-56 bg-white rounded-xl p-4 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
            <p className="text-4xl font-extrabold text-bolao-green">
              {formatCurrency(paymentData.valor)}
            </p>
          </div>

          {/* PIX Code */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Código PIX Copia e Cola</p>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={pixCode}
                className="w-full h-12 px-4 pr-12 bg-bolao-dark/50 border border-bolao-card-border rounded-lg text-sm font-mono truncate"
              />
              <button
                onClick={copyPixCode}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-bolao-card transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-bolao-green" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
            
            <Button
              onClick={copyPixCode}
              variant="outline"
              className="w-full border-bolao-green/30 text-bolao-green hover:bg-bolao-green/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Código Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código PIX
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-5 bg-bolao-card border-bolao-card-border mb-6">
          <h3 className="font-semibold mb-4">Resumo da Participação</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bolão</span>
              <span className="font-semibold">{paymentData.bolao.type} #{paymentData.bolao.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dezenas</span>
              <span className="font-semibold">{paymentData.bolao.dezenas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sorteio</span>
              <span className="font-semibold">{paymentData.bolao.sorteioDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participação</span>
              <span className="font-semibold text-bolao-green">{paymentData.participation}%</span>
            </div>
            <div className="pt-3 border-t border-bolao-card-border flex justify-between">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-bolao-green">{formatCurrency(paymentData.valor)}</span>
            </div>
          </div>
        </Card>

        {/* Simulate Payment Button (for demo) */}
        <Button
          onClick={simulatePayment}
          disabled={paymentStatus === "processing"}
          className="w-full h-14 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-lg"
        >
          {paymentStatus === "processing" ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Verificando Pagamento...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Já Realizei o Pagamento
            </>
          )}
        </Button>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-bolao-card/50 rounded-xl border border-bolao-card-border">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Como pagar
          </h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-bolao-green font-bold">1.</span>
              Abra o app do seu banco ou carteira digital
            </li>
            <li className="flex gap-2">
              <span className="text-bolao-green font-bold">2.</span>
              Escolha pagar via PIX com QR Code ou código copia e cola
            </li>
            <li className="flex gap-2">
              <span className="text-bolao-green font-bold">3.</span>
              Escaneie o QR Code ou cole o código copiado
            </li>
            <li className="flex gap-2">
              <span className="text-bolao-green font-bold">4.</span>
              Confira os dados e confirme o pagamento
            </li>
          </ol>
        </div>

        {/* Security Info */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Pagamento 100% Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmação Instantânea</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PagamentoPix;
