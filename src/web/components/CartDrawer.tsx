/**
 * CartDrawer Component
 * Drawer lateral/modal para exibir o carrinho de compras
 * Abre por cima da página atual sem navegação
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  buscarCarrinho,
  removerItem,
  atualizarQuantidade,
  type CartItem,
  type CartResponse,
} from "@/services/carrinhoService";
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  Clock,
  Calendar,
  Ticket,
  CreditCard,
  Wallet,
  Shield,
  ArrowRight,
  RefreshCw,
  Package,
  LogIn,
  UserPlus,
  Lock,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// Lottery icons and colors mapping
const lotteryConfig: Record<string, { color: string; bgColor: string; icon: string }> = {
  "mega-sena": { color: "text-bolao-green", bgColor: "bg-bolao-green/10", icon: "🍀" },
  "lotofacil": { color: "text-violet-400", bgColor: "bg-violet-500/10", icon: "🎯" },
  "quina": { color: "text-blue-400", bgColor: "bg-blue-500/10", icon: "⭐" },
  "lotomania": { color: "text-orange-400", bgColor: "bg-orange-500/10", icon: "🔥" },
  "dia-de-sorte": { color: "text-yellow-400", bgColor: "bg-yellow-500/10", icon: "☀️" },
  "dupla-sena": { color: "text-red-400", bgColor: "bg-red-500/10", icon: "🎲" },
  "timemania": { color: "text-pink-400", bgColor: "bg-pink-500/10", icon: "⚽" },
  default: { color: "text-bolao-green", bgColor: "bg-bolao-green/10", icon: "🎰" },
};

const getLotteryConfig = (tipoLoteria: string) => {
  const key = tipoLoteria.toLowerCase().replace(/\s+/g, "-");
  return lotteryConfig[key] || lotteryConfig.default;
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format time from seconds
const formatTime = (seconds: number): string => {
  if (seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { isLoggedIn } = useAuth();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await buscarCarrinho();
      
      if (response.success) {
        // Filter out expired items
        response.itens = response.itens.filter(item => item.segundosRestantes > 0);
        response.totalItens = response.itens.length;
        response.valorTotal = response.itens.reduce((acc, item) => acc + item.valorTotal, 0);
        setCartData(response);
      } else {
        setError(response.error || "Erro ao carregar carrinho");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen, fetchCart]);

  // Periodic refresh when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(fetchCart, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchCart]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(true);
    
    try {
      const response = await removerItem(itemId);
      
      if (response.success) {
        setNotification({ type: "success", message: "Item removido" });
        await fetchCart();
      } else {
        setNotification({ type: "error", message: response.error || "Erro ao remover" });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erro de conexão" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle update quantity
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    
    try {
      const response = await atualizarQuantidade(itemId, newQuantity);
      
      if (response.success) {
        await fetchCart();
      } else {
        setNotification({ type: "error", message: response.error || "Erro ao atualizar" });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erro de conexão" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const itemCount = cartData?.totalItens || 0;
  const totalValue = cartData?.valorTotal || 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer - Desktop (right side) / Mobile (bottom sheet) */}
      <div
        className={`
          fixed z-50 bg-bolao-dark border-bolao-card-border
          
          /* Mobile: bottom sheet */
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl border-t
          
          /* Desktop: right drawer */
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:max-h-full sm:rounded-none sm:rounded-l-2xl sm:border-l sm:border-t-0
          
          transform transition-all duration-300 ease-out
          animate-in slide-in-from-bottom sm:slide-in-from-right
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bolao-card-border bg-bolao-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bolao-green/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Seu Carrinho</h2>
              {itemCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "itens"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bolao-card transition-colors"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-white" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`mx-4 mt-3 p-3 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top duration-200 ${
              notification.type === "success" 
                ? "bg-bolao-green/10 border border-bolao-green/30 text-bolao-green"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 200px)", minHeight: "200px" }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <RefreshCw className="w-8 h-8 text-bolao-green animate-spin" />
              <p className="text-muted-foreground text-sm">Carregando carrinho...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <p className="text-red-400 text-sm text-center">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCart}
                className="border-bolao-card-border"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-20 h-20 rounded-full bg-bolao-card/50 flex items-center justify-center">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white mb-1">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground">
                  Adicione bolões para começar
                </p>
              </div>
              <Link href="/mega-sena" onClick={onClose}>
                <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver Bolões
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cartData?.itens.map((item) => {
                const config = getLotteryConfig(item.tipoLoteria);
                const isExpiringSoon = item.segundosRestantes < 300;
                
                return (
                  <Card
                    key={item.id}
                    className={`p-3 bg-bolao-card/60 border-bolao-card-border hover:border-bolao-card-border-hover transition-all ${
                      isUpdating ? "opacity-60" : ""
                    } ${isExpiringSoon ? "border-orange-500/50" : ""}`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center text-lg shrink-0`}>
                        {config.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Badge className={`${config.bgColor} ${config.color} border-0 text-xs mb-1`}>
                              {item.tipoLoteria}
                            </Badge>
                            <h4 className="font-semibold text-white text-sm truncate">
                              {item.bolaoNome}
                            </h4>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Date & Timer */}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.expiraEm)}
                          </span>
                          {isExpiringSoon && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <Clock className="w-3 h-3 animate-pulse" />
                              {formatTime(item.segundosRestantes)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-bolao-card-border">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantidadeCotas - 1)}
                          disabled={item.quantidadeCotas <= 1 || isUpdating}
                          className="w-7 h-7 rounded-md bg-bolao-dark border border-bolao-card-border flex items-center justify-center hover:bg-bolao-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm">
                          {item.quantidadeCotas}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantidadeCotas + 1)}
                          disabled={isUpdating}
                          className="w-7 h-7 rounded-md bg-bolao-dark border border-bolao-card-border flex items-center justify-center hover:bg-bolao-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-muted-foreground ml-1">
                          × {formatCurrency(item.valorUnitario)}
                        </span>
                      </div>
                      
                      {/* Subtotal */}
                      <span className="font-bold text-bolao-green">
                        {formatCurrency(item.valorTotal)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-bolao-card-border bg-bolao-card/80 backdrop-blur-sm p-4">
          {/* Summary */}
          {itemCount > 0 && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-bolao-green">
                {formatCurrency(totalValue)}
              </span>
            </div>
          )}
          
          {/* CTA Buttons */}
          {isLoggedIn ? (
            <div className="space-y-2">
              <Link href="/checkout" onClick={onClose}>
                <Button
                  disabled={itemCount === 0}
                  className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold h-12 text-base disabled:opacity-50"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Finalizar Compra
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              {/* Link to full cart page */}
              <Link 
                href="/carrinho" 
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver carrinho completo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Login Required Message */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Faça login para finalizar a compra</span>
              </div>
              
              {/* Auth Buttons */}
              <div className="flex gap-2">
                <Link href="/login?returnUrl=/carrinho" onClick={onClose} className="flex-1">
                  <Button className="w-full bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-semibold h-11">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro?returnUrl=/carrinho" onClick={onClose} className="flex-1">
                  <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold h-11">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta
                  </Button>
                </Link>
              </div>
              
              {/* Link to full cart page */}
              <Link 
                href="/carrinho" 
                onClick={onClose}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors py-2"
              >
                <ExternalLink className="w-4 h-4" />
                Ver carrinho completo
              </Link>
            </div>
          )}
          
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-bolao-card-border text-xs text-muted-foreground">
            <Shield className="w-3 h-3 text-bolao-green" />
            <span>Pagamento 100% seguro</span>
            <span className="mx-1">•</span>
            <Wallet className="w-3 h-3" />
            <span>PIX, Cartão, Boleto</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
