/**
 * CheckoutModal - Modal de checkout para finalização de compra
 * 
 * Permite que usuários finalizem a compra dos itens no carrinho
 * com opções de pagamento: Saldo da Carteira, PIX, Cartão de Crédito
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Wallet,
  QrCode,
  CreditCard,
  Check,
  Copy,
  Loader2,
  ShoppingCart,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
  Ticket,
  Plus,
  Minus,
} from "lucide-react";
import { CartItem, finalizarCarrinho, limparCarrinho } from "@/services/carrinhoService";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  itens: CartItem[];
  valorTotal: number;
  onSuccess?: () => void;
}

type FormaPagamento = "saldo" | "pix" | "cartao" | "combinado";

interface DadosCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

interface PixResponse {
  qrCodeBase64: string;
  copiaCola: string;
  transacaoId: string;
  expiraEm: string;
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  itens,
  valorTotal,
  onSuccess,
}: CheckoutModalProps) => {
  const { user, updateSaldo } = useAuth();
  const [, setLocation] = useLocation();
  
  // State
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("saldo");
  const [etapa, setEtapa] = useState<"pagamento" | "processando" | "sucesso" | "erro">("pagamento");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Combined payment
  const [valorSaldo, setValorSaldo] = useState(0);
  const [valorRestante, setValorRestante] = useState(0);
  
  // PIX state
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [copiado, setCopiado] = useState(false);
  
  // Card state
  const [dadosCartao, setDadosCartao] = useState<DadosCartao>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });

  const saldoDisponivel = user?.saldo || 0;
  const saldoSuficiente = saldoDisponivel >= valorTotal;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormaPagamento(saldoSuficiente ? "saldo" : "combinado");
      setEtapa("pagamento");
      setErro(null);
      setPixData(null);
      setCopiado(false);
      setDadosCartao({ numero: "", nome: "", validade: "", cvv: "" });
      
      // Calculate combined payment defaults
      if (!saldoSuficiente) {
        setValorSaldo(saldoDisponivel);
        setValorRestante(valorTotal - saldoDisponivel);
      } else {
        setValorSaldo(valorTotal);
        setValorRestante(0);
      }
    }
  }, [isOpen, saldoDisponivel, saldoSuficiente, valorTotal]);

  // Update combined payment values
  useEffect(() => {
    if (formaPagamento === "combinado") {
      const maxSaldo = Math.min(saldoDisponivel, valorTotal);
      if (valorSaldo > maxSaldo) {
        setValorSaldo(maxSaldo);
      }
      setValorRestante(Math.max(0, valorTotal - valorSaldo));
    } else if (formaPagamento === "saldo") {
      setValorSaldo(valorTotal);
      setValorRestante(0);
    } else {
      setValorSaldo(0);
      setValorRestante(valorTotal);
    }
  }, [formaPagamento, valorSaldo, valorTotal, saldoDisponivel]);

  // Format currency
  const formatarValor = (v: number) => {
    return v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  // Format card expiry
  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Copy PIX code
  const copiarCodigoPix = async () => {
    if (!pixData?.copiaCola) return;
    
    try {
      await navigator.clipboard.writeText(pixData.copiaCola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      setErro("Erro ao copiar código");
    }
  };

  // Validate payment data
  const validarPagamento = (): boolean => {
    if (formaPagamento === "saldo" && !saldoSuficiente) {
      setErro("Saldo insuficiente");
      return false;
    }

    if (formaPagamento === "combinado" && valorRestante > 0 && !dadosCartao.numero) {
      // PIX or card needed for remaining amount - PIX is default
      return true;
    }

    if ((formaPagamento === "cartao" || (formaPagamento === "combinado" && valorRestante > 0 && dadosCartao.numero))) {
      const { numero, nome, validade, cvv } = dadosCartao;
      if (numero.replace(/\s/g, "").length < 16) {
        setErro("Número do cartão inválido");
        return false;
      }
      if (nome.length < 3) {
        setErro("Nome no cartão inválido");
        return false;
      }
      if (validade.length < 5) {
        setErro("Validade inválida");
        return false;
      }
      if (cvv.length < 3) {
        setErro("CVV inválido");
        return false;
      }
    }

    return true;
  };

  // Process checkout
  const processarCheckout = async () => {
    if (!validarPagamento()) return;
    
    setIsLoading(true);
    setErro(null);
    setEtapa("processando");

    try {
      // Determine payment method for API
      let apiPaymentMethod: "pix" | "cartao" | "boleto" = "pix";
      
      if (formaPagamento === "saldo") {
        // Saldo only - immediate debit
        apiPaymentMethod = "pix"; // API will handle saldo deduction
      } else if (formaPagamento === "cartao") {
        apiPaymentMethod = "cartao";
      } else if (formaPagamento === "combinado") {
        // Combined - use card if provided, else PIX for remaining
        apiPaymentMethod = dadosCartao.numero ? "cartao" : "pix";
      }

      const response = await finalizarCarrinho(apiPaymentMethod);

      if (!response.success) {
        throw new Error(response.error || "Erro ao processar pagamento");
      }

      // Handle based on payment method
      if (formaPagamento === "saldo" || (formaPagamento === "cartao" && dadosCartao.numero)) {
        // Immediate approval for saldo/card
        if (user && valorSaldo > 0) {
          const novoSaldo = saldoDisponivel - valorSaldo;
          updateSaldo(novoSaldo);
        }
        
        // Clear cart and show success
        await limparCarrinho();
        setEtapa("sucesso");
      } else if (formaPagamento === "pix" || (formaPagamento === "combinado" && !dadosCartao.numero)) {
        // Generate PIX for payment
        // Deduct saldo portion if combined
        if (formaPagamento === "combinado" && valorSaldo > 0 && user) {
          const novoSaldo = saldoDisponivel - valorSaldo;
          updateSaldo(novoSaldo);
        }

        // Mock PIX data (in production, comes from API)
        const mockPixData: PixResponse = {
          qrCodeBase64: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              <rect fill="#fff" width="200" height="200"/>
              <text x="100" y="100" text-anchor="middle" font-size="12" fill="#333">PIX QR Code</text>
              <text x="100" y="120" text-anchor="middle" font-size="10" fill="#666">R$ ${formatarValor(valorRestante || valorTotal)}</text>
              <rect x="40" y="40" width="120" height="120" fill="none" stroke="#000" stroke-width="4"/>
              <rect x="50" y="50" width="20" height="20" fill="#000"/>
              <rect x="80" y="50" width="20" height="20" fill="#000"/>
              <rect x="130" y="50" width="20" height="20" fill="#000"/>
            </svg>
          `)}`,
          copiaCola: `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}5204000053039865802BR5925BOLAOMAX`,
          transacaoId: `pix_${Date.now()}`,
          expiraEm: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        };
        
        setPixData(mockPixData);
        setEtapa("pagamento");
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente.";
      setErro(errorMessage);
      setEtapa("erro");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle success close
  const handleSuccessClose = () => {
    onSuccess?.();
    onClose();
    setLocation("/meus-boloes");
  };

  // Adjust combined payment saldo amount
  const ajustarValorSaldo = (delta: number) => {
    const novoValor = Math.max(0, Math.min(valorSaldo + delta, Math.min(saldoDisponivel, valorTotal)));
    setValorSaldo(novoValor);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-bolao-card border-bolao-card-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-bolao-dark" />
            </div>
            <span>Finalizar Compra</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirme os itens e escolha a forma de pagamento
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-bolao-dark/50 rounded-xl border border-bolao-card-border overflow-hidden">
          <div className="p-4 border-b border-bolao-card-border">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-bolao-green" />
              Resumo do Pedido
            </h3>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {itens.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3 border-b border-bolao-card-border/50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.bolaoNome}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantidadeCotas} {item.quantidadeCotas === 1 ? "cota" : "cotas"} × R$ {formatarValor(item.valorUnitario)}
                  </p>
                </div>
                <p className="font-semibold text-white">R$ {formatarValor(item.valorTotal)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-bolao-green/10 border-t border-bolao-green/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-bolao-green">Total</span>
              <span className="text-xl font-bold text-bolao-green">R$ {formatarValor(valorTotal)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        {/* Payment Step */}
        {etapa === "pagamento" && !pixData && (
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Como deseja pagar?</h3>

            {/* Wallet Balance Option */}
            <button
              onClick={() => setFormaPagamento("saldo")}
              disabled={!saldoSuficiente}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                formaPagamento === "saldo"
                  ? "bg-bolao-green/10 border-bolao-green text-white"
                  : saldoSuficiente
                  ? "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-bolao-green/50"
                  : "bg-bolao-dark/20 border-bolao-card-border/50 text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                formaPagamento === "saldo" ? "bg-bolao-green/20" : "bg-bolao-dark/50"
              }`}>
                <Wallet className={`w-6 h-6 ${formaPagamento === "saldo" ? "text-bolao-green" : ""}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">Saldo da Carteira</p>
                  {saldoSuficiente && (
                    <span className="px-2 py-0.5 bg-bolao-green/20 text-bolao-green text-xs rounded-full font-medium">
                      Disponível
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Saldo: R$ {formatarValor(saldoDisponivel)}
                </p>
              </div>
              {saldoSuficiente && <Zap className="w-5 h-5 text-bolao-green" />}
            </button>

            {/* PIX Option */}
            <button
              onClick={() => setFormaPagamento("pix")}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                formaPagamento === "pix"
                  ? "bg-cyan-500/10 border-cyan-500 text-white"
                  : "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-cyan-500/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                formaPagamento === "pix" ? "bg-cyan-500/20" : "bg-bolao-dark/50"
              }`}>
                <QrCode className={`w-6 h-6 ${formaPagamento === "pix" ? "text-cyan-400" : ""}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-white">PIX</p>
                <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
              </div>
            </button>

            {/* Credit Card Option */}
            <button
              onClick={() => setFormaPagamento("cartao")}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                formaPagamento === "cartao"
                  ? "bg-bolao-orange/10 border-bolao-orange text-white"
                  : "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-bolao-orange/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                formaPagamento === "cartao" ? "bg-bolao-orange/20" : "bg-bolao-dark/50"
              }`}>
                <CreditCard className={`w-6 h-6 ${formaPagamento === "cartao" ? "text-bolao-orange" : ""}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-white">Cartão de Crédito</p>
                <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
              </div>
              <Shield className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Combined Payment (when saldo insuficiente) */}
            {!saldoSuficiente && saldoDisponivel > 0 && (
              <button
                onClick={() => setFormaPagamento("combinado")}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  formaPagamento === "combinado"
                    ? "bg-purple-500/10 border-purple-500 text-white"
                    : "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-purple-500/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  formaPagamento === "combinado" ? "bg-purple-500/20" : "bg-bolao-dark/50"
                }`}>
                  <Sparkles className={`w-6 h-6 ${formaPagamento === "combinado" ? "text-purple-400" : ""}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">Combinar Pagamento</p>
                  <p className="text-sm text-muted-foreground">
                    Usar saldo + PIX ou Cartão
                  </p>
                </div>
              </button>
            )}

            {/* Combined Payment Details */}
            {formaPagamento === "combinado" && (
              <div className="space-y-3 p-4 bg-bolao-dark/30 rounded-xl border border-bolao-card-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usar do saldo:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => ajustarValorSaldo(-10)}
                      className="w-7 h-7 rounded-md bg-bolao-dark flex items-center justify-center hover:bg-bolao-card transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold text-white min-w-[70px] text-center">
                      R$ {formatarValor(valorSaldo)}
                    </span>
                    <button
                      onClick={() => ajustarValorSaldo(10)}
                      className="w-7 h-7 rounded-md bg-bolao-dark flex items-center justify-center hover:bg-bolao-card transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-bolao-card-border">
                  <span className="text-sm text-muted-foreground">Pagar via PIX/Cartão:</span>
                  <span className="text-sm font-semibold text-bolao-orange">
                    R$ {formatarValor(valorRestante)}
                  </span>
                </div>
              </div>
            )}

            {/* Credit Card Form */}
            {(formaPagamento === "cartao" || (formaPagamento === "combinado" && valorRestante > 0)) && formaPagamento !== "saldo" && formaPagamento !== "pix" && (
              <div className="space-y-3 p-4 bg-bolao-dark/30 rounded-xl border border-bolao-card-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {formaPagamento === "combinado" ? `Pague R$ ${formatarValor(valorRestante)} com cartão (ou use PIX abaixo)` : "Dados do Cartão"}
                </p>
                
                <Input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={dadosCartao.numero}
                  onChange={(e) => setDadosCartao(prev => ({ ...prev, numero: formatCardNumber(e.target.value) }))}
                  maxLength={19}
                  className="bg-bolao-dark/50 border-bolao-card-border tracking-wider"
                />
                <Input
                  type="text"
                  placeholder="NOME NO CARTÃO"
                  value={dadosCartao.nome}
                  onChange={(e) => setDadosCartao(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
                  className="bg-bolao-dark/50 border-bolao-card-border uppercase"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    placeholder="MM/AA"
                    value={dadosCartao.validade}
                    onChange={(e) => setDadosCartao(prev => ({ ...prev, validade: formatCardExpiry(e.target.value) }))}
                    maxLength={5}
                    className="bg-bolao-dark/50 border-bolao-card-border text-center"
                  />
                  <Input
                    type="text"
                    placeholder="CVV"
                    value={dadosCartao.cvv}
                    onChange={(e) => setDadosCartao(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    maxLength={4}
                    className="bg-bolao-dark/50 border-bolao-card-border text-center"
                  />
                </div>
                
                {formaPagamento === "combinado" && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Ou deixe em branco para pagar via PIX
                  </p>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <Button
              onClick={processarCheckout}
              disabled={isLoading}
              className="w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar Pagamento
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* PIX Payment Display */}
        {etapa === "pagamento" && pixData && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {formaPagamento === "combinado" && valorSaldo > 0 
                  ? `R$ ${formatarValor(valorSaldo)} debitado do saldo. Pague o restante via PIX:`
                  : "Escaneie o QR Code ou copie o código PIX:"}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl p-4 flex items-center justify-center mx-auto w-fit">
              <img
                src={pixData.qrCodeBase64}
                alt="QR Code PIX"
                className="w-48 h-48"
              />
            </div>

            {/* Copy Code */}
            <div className="flex gap-2">
              <Input
                readOnly
                value={pixData.copiaCola}
                className="bg-bolao-dark/50 border-bolao-card-border text-sm font-mono"
              />
              <Button
                onClick={copiarCodigoPix}
                variant="outline"
                className={`shrink-0 ${copiado ? "bg-bolao-green/20 border-bolao-green text-bolao-green" : ""}`}
              >
                {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Aguardando confirmação do pagamento...
            </p>

            {/* Simulate payment confirmation button (for demo) */}
            <Button
              onClick={() => {
                limparCarrinho();
                setEtapa("sucesso");
              }}
              variant="outline"
              className="w-full border-bolao-green/50 text-bolao-green hover:bg-bolao-green/10"
            >
              Simular Confirmação (Demo)
            </Button>
          </div>
        )}

        {/* Processing Step */}
        {etapa === "processando" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bolao-green/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-bolao-green animate-spin" />
            </div>
            <p className="text-lg font-semibold text-white">Processando pagamento...</p>
            <p className="text-sm text-muted-foreground">Aguarde um momento</p>
          </div>
        )}

        {/* Success Step */}
        {etapa === "sucesso" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bolao-green flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-bolao-dark" />
            </div>
            <p className="text-lg font-semibold text-white">Compra realizada!</p>
            <p className="text-sm text-muted-foreground text-center">
              Suas cotas foram registradas com sucesso.<br />
              Boa sorte nos sorteios!
            </p>
            <Button
              onClick={handleSuccessClose}
              className="mt-4 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold"
            >
              Ver Meus Bolões
            </Button>
          </div>
        )}

        {/* Error Step */}
        {etapa === "erro" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-white">Erro no pagamento</p>
            <p className="text-sm text-muted-foreground text-center">{erro}</p>
            <Button
              onClick={() => setEtapa("pagamento")}
              variant="outline"
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
