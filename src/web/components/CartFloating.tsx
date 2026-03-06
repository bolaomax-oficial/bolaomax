/**
 * CartFloating Component
 * A floating cart widget that shows cart items, timer, and checkout functionality
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  buscarCarrinho,
  removerItem,
  CartItem,
  CartResponse,
} from "@/services/carrinhoService";
import { CheckoutModal } from "@/components/CheckoutModal";
import {
  ShoppingCart,
  X,
  Trash2,
  Clock,
  AlertTriangle,
  CreditCard,
  Package,
  Minus,
  Plus,
} from "lucide-react";

// Lottery type colors
const LOTTERY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  lotofacil: { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" },
  megasena: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  quina: { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/30" },
  lotomania: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
  duplasena: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  timemania: { bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30" },
  diadesorte: { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  supersete: { bg: "bg-pink-500/20", text: "text-pink-300", border: "border-pink-500/30" },
};

// Format time from seconds
const formatTime = (seconds: number): string => {
  if (seconds <= 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const CartFloating = () => {
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalTimer, setGlobalTimer] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Fetch cart data using service
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await buscarCarrinho();

      if (data.success) {
        setCart(data);
        
        // Calculate global timer from earliest expiration
        if (data.itens.length > 0) {
          const minSeconds = Math.min(...data.itens.map((item: CartItem) => item.segundosRestantes));
          setGlobalTimer(Math.max(0, minSeconds));
          setIsExpired(minSeconds <= 0);
        } else {
          setGlobalTimer(0);
          setIsExpired(false);
        }
      } else {
        setError(data.error || "Erro ao carregar carrinho");
      }
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Remove item from cart using service
  const handleRemoveItem = async (itemId: string) => {
    try {
      setRemovingId(itemId);
      
      const data = await removerItem(itemId);

      if (data.success) {
        // Refresh cart
        await fetchCart();
      } else {
        alert(`❌ ${data.error || "Erro ao remover item"}`);
      }
    } catch (err) {
      console.error("Erro ao remover item:", err);
      alert("❌ Erro de conexão");
    } finally {
      setRemovingId(null);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!cart || cart.totalItens === 0) return;
    setIsOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Handle checkout success
  const handleCheckoutSuccess = () => {
    setCart(null);
    setGlobalTimer(0);
    fetchCart();
  };

  // Fetch cart on mount and when sidebar opens
  useEffect(() => {
    if (isLoggedIn && isOpen) {
      fetchCart();
    }
  }, [isLoggedIn, isOpen, fetchCart]);

  // Periodic refresh when sidebar is open
  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;
    
    const interval = setInterval(() => {
      fetchCart();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen, isLoggedIn, fetchCart]);

  // Global timer countdown
  useEffect(() => {
    if (globalTimer <= 0 || !isOpen) return;

    const interval = setInterval(() => {
      setGlobalTimer((prev) => {
        const newVal = prev - 1;
        if (newVal <= 0) {
          setIsExpired(true);
          // Refresh cart when expired
          fetchCart();
        }
        return Math.max(0, newVal);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [globalTimer, isOpen, fetchCart]);

  // Don't render if not logged in
  if (!isLoggedIn) return null;

  const itemCount = cart?.totalItens || 0;
  const totalValue = cart?.valorTotal || 0;

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-4 z-40 p-3 bg-bolao-card border border-bolao-card-border rounded-full shadow-lg hover:border-bolao-green/50 transition-all group"
        aria-label="Abrir carrinho"
      >
        <ShoppingCart className="w-6 h-6 text-white group-hover:text-bolao-green transition-colors" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-bolao-green text-bolao-dark text-xs font-bold rounded-full border-2 border-bolao-dark animate-pulse">
            {itemCount}
          </Badge>
        )}
      </button>

      {/* Cart Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 z-50 bg-bolao-dark border-l border-bolao-card-border transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bolao-card-border bg-bolao-card/50">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-bolao-green" />
            <h2 className="text-lg font-bold text-white">Carrinho</h2>
            {itemCount > 0 && (
              <Badge className="bg-bolao-green/20 text-bolao-green border-bolao-green/30">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-bolao-card transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Global Timer */}
        {itemCount > 0 && !isExpired && (
          <div className="px-4 py-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Reserva expira em:</span>
              <span className="text-lg font-bold font-mono">
                ⏱️ {formatTime(globalTimer)}
              </span>
            </div>
            {globalTimer < 60 && (
              <p className="text-xs text-amber-300/70 mt-1">
                Finalize a compra para garantir suas cotas!
              </p>
            )}
          </div>
        )}

        {/* Expired Warning */}
        {isExpired && itemCount > 0 && (
          <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/30">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Reserva expirada! Recarregando carrinho...
              </span>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ height: "calc(100% - 200px)" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bolao-green" />
              <p className="text-muted-foreground text-sm">Carregando carrinho...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCart}
                className="border-bolao-card-border"
              >
                Tentar novamente
              </Button>
            </div>
          ) : itemCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <Package className="w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Seu carrinho está vazio
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-bolao-card-border"
              >
                Explorar Bolões
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart?.itens.map((item) => {
                const colors = LOTTERY_COLORS[item.tipoLoteria] || LOTTERY_COLORS.lotofacil;
                return (
                  <Card
                    key={item.id}
                    className={`p-3 bg-bolao-card/60 border-bolao-card-border hover:border-bolao-green/30 transition-all ${
                      removingId === item.id ? "opacity-50" : ""
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm line-clamp-1">
                          {item.bolaoNome}
                        </h4>
                        <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-xs mt-1`}>
                          {item.tipoLoteria}
                        </Badge>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingId === item.id}
                        className="p-1.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{item.quantidadeCotas}x</span>
                        <span className="text-xs">cotas</span>
                      </div>
                      <span className="font-bold text-bolao-green">
                        {formatCurrency(item.valorTotal)}
                      </span>
                    </div>

                    {/* Item Timer */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Expira em {formatTime(item.segundosRestantes)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-bolao-card-border bg-bolao-card/80 backdrop-blur-sm">
          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold text-bolao-green">
              {formatCurrency(totalValue)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={itemCount === 0 || isExpired}
            className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold gap-2 h-12 text-base disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5" />
            Finalizar Compra
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        itens={cart?.itens || []}
        valorTotal={cart?.valorTotal || 0}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
};

export default CartFloating;
