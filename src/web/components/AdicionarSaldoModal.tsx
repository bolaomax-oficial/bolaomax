/**
 * AdicionarSaldoModal - Modal para adicionar saldo à carteira
 * 
 * Permite que usuários recarreguem sua carteira via:
 * - PIX (recomendado)
 * - Cartão de Crédito
 * - Boleto
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
import {
  Wallet,
  QrCode,
  CreditCard,
  FileText,
  Loader2,
  Check,
  Copy,
  Download,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Plus,
  AlertCircle,
} from "lucide-react";

interface AdicionarSaldoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (novoSaldo: number) => void;
}

type FormaPagamento = "pix" | "cartao" | "boleto";

interface DadosCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

interface PixResponse {
  qrCode: string;
  qrCodeBase64: string;
  copiaCola: string;
  transacaoId: string;
  expiraEm: string;
}

// Quick value presets
const valoresRapidos = [50, 100, 200, 500];

export const AdicionarSaldoModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AdicionarSaldoModalProps) => {
  const { user, updateSaldo } = useAuth();
  
  // State
  const [valor, setValor] = useState<number | "">("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("pix");
  const [etapa, setEtapa] = useState<"valor" | "pagamento" | "processando" | "sucesso" | "erro">("valor");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // PIX state
  const [pixData, setPixData] = useState<PixResponse | null>(null);
  const [copiado, setCopiado] = useState(false);
  
  // Cartão state
  const [dadosCartao, setDadosCartao] = useState<DadosCartao>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
  });
  
  // Boleto state
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null);
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setValor("");
      setFormaPagamento("pix");
      setEtapa("valor");
      setErro(null);
      setPixData(null);
      setCopiado(false);
      setDadosCartao({ numero: "", nome: "", validade: "", cvv: "" });
      setBoletoUrl(null);
      setCodigoBarras(null);
    }
  }, [isOpen]);

  // Format currency input
  const formatarValor = (v: number | "") => {
    if (v === "") return "";
    return v.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Handle quick value selection
  const handleValorRapido = (v: number) => {
    setValor(v);
    setErro(null);
  };

  // Handle custom value input
  const handleValorCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numValue = rawValue ? parseInt(rawValue) / 100 : "";
    setValor(numValue);
    setErro(null);
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

  // Validate form
  const validarFormulario = (): boolean => {
    if (!valor || valor < 10) {
      setErro("Valor mínimo: R$ 10,00");
      return false;
    }
    if (valor > 10000) {
      setErro("Valor máximo: R$ 10.000,00");
      return false;
    }
    
    if (formaPagamento === "cartao") {
      const { numero, nome, validade, cvv } = dadosCartao;
      if (!numero || numero.replace(/\s/g, "").length < 16) {
        setErro("Número do cartão inválido");
        return false;
      }
      if (!nome || nome.length < 3) {
        setErro("Nome no cartão inválido");
        return false;
      }
      if (!validade || validade.length < 5) {
        setErro("Validade inválida");
        return false;
      }
      if (!cvv || cvv.length < 3) {
        setErro("CVV inválido");
        return false;
      }
    }
    
    return true;
  };

  // Process payment
  const processarPagamento = async () => {
    if (!validarFormulario()) return;
    
    setIsLoading(true);
    setErro(null);
    setEtapa("processando");

    try {
      const token = localStorage.getItem("bolaomax_token");
      
      // Prepare payload based on payment method
      const payload: Record<string, unknown> = {
        valor,
        formaPagamento,
      };
      
      if (formaPagamento === "cartao") {
        payload.dadosPagamento = {
          numero: dadosCartao.numero.replace(/\s/g, ""),
          nome: dadosCartao.nome,
          validade: dadosCartao.validade,
          cvv: dadosCartao.cvv,
        };
      }

      const response = await fetch("/api/carteira/recarregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      // Handle different payment methods
      if (formaPagamento === "pix" && data.pix) {
        setPixData(data.pix);
        setEtapa("pagamento");
      } else if (formaPagamento === "boleto" && data.boleto) {
        setBoletoUrl(data.boleto.url);
        setCodigoBarras(data.boleto.codigoBarras);
        setEtapa("pagamento");
      } else if (formaPagamento === "cartao") {
        // Credit card is processed immediately
        if (data.novoSaldo !== undefined) {
          updateSaldo(data.novoSaldo);
          onSuccess?.(data.novoSaldo);
        }
        setEtapa("sucesso");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente.";
      setErro(errorMessage);
      setEtapa("erro");
    } finally {
      setIsLoading(false);
    }
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

  // Download boleto
  const baixarBoleto = () => {
    if (boletoUrl) {
      window.open(boletoUrl, "_blank");
    }
  };

  // Proceed to next step
  const avancarEtapa = () => {
    if (etapa === "valor") {
      if (!valor || valor < 10) {
        setErro("Selecione um valor mínimo de R$ 10,00");
        return;
      }
      setEtapa("pagamento");
    }
  };

  // Go back
  const voltarEtapa = () => {
    if (etapa === "pagamento") {
      setEtapa("valor");
    } else if (etapa === "erro") {
      setEtapa("valor");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-bolao-card border-bolao-card-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Plus className="w-5 h-5 text-bolao-dark" />
            </div>
            <span>Adicionar Saldo</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Recarregue sua carteira para participar dos bolões
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance Display */}
        <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-bolao-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo atual</p>
                <p className="text-xl font-bold text-white">
                  R$ {user?.saldo?.toFixed(2).replace(".", ",") || "0,00"}
                </p>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-bolao-gold" />
          </div>
        </div>

        {/* Error Message */}
        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        {/* Step: Select Value */}
        {etapa === "valor" && (
          <div className="space-y-4">
            {/* Quick Values */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Valores rápidos
              </label>
              <div className="grid grid-cols-4 gap-2">
                {valoresRapidos.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleValorRapido(v)}
                    className={`py-3 px-2 rounded-lg font-semibold text-sm transition-all ${
                      valor === v
                        ? "bg-bolao-green text-bolao-dark ring-2 ring-bolao-green/50"
                        : "bg-bolao-dark/50 text-white border border-bolao-card-border hover:border-bolao-green/50"
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Value */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Ou digite um valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  type="text"
                  placeholder="0,00"
                  value={formatarValor(valor)}
                  onChange={handleValorCustom}
                  className="pl-10 text-lg font-semibold bg-bolao-dark/50 border-bolao-card-border focus:border-bolao-green h-12"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo: R$ 10,00 • Máximo: R$ 10.000,00
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Como deseja pagar?
              </label>
              <div className="space-y-2">
                {/* PIX */}
                <button
                  onClick={() => setFormaPagamento("pix")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    formaPagamento === "pix"
                      ? "bg-bolao-green/10 border-bolao-green text-white"
                      : "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-bolao-green/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formaPagamento === "pix" ? "bg-bolao-green/20" : "bg-bolao-dark/50"
                  }`}>
                    <QrCode className={`w-6 h-6 ${formaPagamento === "pix" ? "text-bolao-green" : ""}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">PIX</p>
                      <span className="px-2 py-0.5 bg-bolao-green/20 text-bolao-green text-xs rounded-full font-medium">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Aprovação instantânea</p>
                  </div>
                  <Zap className="w-5 h-5 text-bolao-green" />
                </button>

                {/* Credit Card */}
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

                {/* Boleto */}
                <button
                  onClick={() => setFormaPagamento("boleto")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    formaPagamento === "boleto"
                      ? "bg-purple-500/10 border-purple-500 text-white"
                      : "bg-bolao-dark/30 border-bolao-card-border text-muted-foreground hover:border-purple-500/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formaPagamento === "boleto" ? "bg-purple-500/20" : "bg-bolao-dark/50"
                  }`}>
                    <FileText className={`w-6 h-6 ${formaPagamento === "boleto" ? "text-purple-400" : ""}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-white">Boleto Bancário</p>
                    <p className="text-sm text-muted-foreground">Compensação em 1-3 dias úteis</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={formaPagamento === "cartao" ? () => setEtapa("pagamento") : avancarEtapa}
              disabled={!valor || valor < 10}
              className="w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-base"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step: Payment Details (Credit Card Form) */}
        {etapa === "pagamento" && formaPagamento === "cartao" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={voltarEtapa}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                ← Voltar
              </button>
              <span className="text-sm font-semibold text-bolao-green">
                R$ {formatarValor(valor)}
              </span>
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Número do Cartão
              </label>
              <Input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={dadosCartao.numero}
                onChange={(e) => setDadosCartao(prev => ({ ...prev, numero: formatCardNumber(e.target.value) }))}
                maxLength={19}
                className="bg-bolao-dark/50 border-bolao-card-border h-12 text-lg tracking-wider"
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nome no Cartão
              </label>
              <Input
                type="text"
                placeholder="NOME COMO NO CARTÃO"
                value={dadosCartao.nome}
                onChange={(e) => setDadosCartao(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
                className="bg-bolao-dark/50 border-bolao-card-border h-12 uppercase"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Validade
                </label>
                <Input
                  type="text"
                  placeholder="MM/AA"
                  value={dadosCartao.validade}
                  onChange={(e) => setDadosCartao(prev => ({ ...prev, validade: formatCardExpiry(e.target.value) }))}
                  maxLength={5}
                  className="bg-bolao-dark/50 border-bolao-card-border h-12 text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  CVV
                </label>
                <Input
                  type="text"
                  placeholder="000"
                  value={dadosCartao.cvv}
                  onChange={(e) => setDadosCartao(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  maxLength={4}
                  className="bg-bolao-dark/50 border-bolao-card-border h-12 text-center"
                />
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-bolao-green" />
              <span>Seus dados são criptografados e protegidos</span>
            </div>

            {/* Process Button */}
            <Button
              onClick={processarPagamento}
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
                  <CreditCard className="w-5 h-5" />
                  Pagar R$ {formatarValor(valor)}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Step: PIX Payment */}
        {etapa === "pagamento" && formaPagamento === "pix" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={voltarEtapa}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                ← Voltar
              </button>
              <span className="text-sm font-semibold text-bolao-green">
                R$ {formatarValor(valor)}
              </span>
            </div>

            {/* QR Code Display */}
            {pixData ? (
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                  {pixData.qrCodeBase64 ? (
                    <img
                      src={pixData.qrCodeBase64}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                      <QrCode className="w-24 h-24" />
                    </div>
                  )}
                </div>

                {/* Copy-Paste Code */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Ou copie o código PIX
                  </label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={pixData.copiaCola || ""}
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
                </div>

                <p className="text-sm text-center text-muted-foreground">
                  Aguardando confirmação do pagamento...
                </p>
              </div>
            ) : (
              <Button
                onClick={processarPagamento}
                disabled={isLoading}
                className="w-full h-12 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando QR Code...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Gerar QR Code PIX
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Step: Boleto Payment */}
        {etapa === "pagamento" && formaPagamento === "boleto" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={voltarEtapa}
                className="text-sm text-muted-foreground hover:text-white transition-colors"
              >
                ← Voltar
              </button>
              <span className="text-sm font-semibold text-bolao-green">
                R$ {formatarValor(valor)}
              </span>
            </div>

            {boletoUrl ? (
              <div className="space-y-4">
                {/* Barcode Display */}
                {codigoBarras && (
                  <div className="bg-bolao-dark/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2">Código de Barras:</p>
                    <p className="font-mono text-sm text-white break-all">{codigoBarras}</p>
                  </div>
                )}

                {/* Download Button */}
                <Button
                  onClick={baixarBoleto}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  <Download className="w-5 h-5" />
                  Baixar Boleto PDF
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  O saldo será creditado em 1-3 dias úteis após o pagamento
                </p>
              </div>
            ) : (
              <Button
                onClick={processarPagamento}
                disabled={isLoading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando Boleto...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Gerar Boleto
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Step: Processing */}
        {etapa === "processando" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bolao-green/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-bolao-green animate-spin" />
            </div>
            <p className="text-lg font-semibold text-white">Processando pagamento...</p>
            <p className="text-sm text-muted-foreground">Aguarde um momento</p>
          </div>
        )}

        {/* Step: Success */}
        {etapa === "sucesso" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-bolao-green flex items-center justify-center animate-in zoom-in duration-300">
              <Check className="w-8 h-8 text-bolao-dark" />
            </div>
            <p className="text-lg font-semibold text-white">Pagamento confirmado!</p>
            <p className="text-sm text-muted-foreground text-center">
              R$ {formatarValor(valor)} foi adicionado à sua carteira
            </p>
            <Button
              onClick={onClose}
              className="mt-4 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold"
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {etapa === "erro" && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-white">Erro no pagamento</p>
            <p className="text-sm text-muted-foreground text-center">{erro}</p>
            <Button
              onClick={voltarEtapa}
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

export default AdicionarSaldoModal;
