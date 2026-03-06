import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  buscarCarrinho,
  removerItem,
  atualizarQuantidade,
  limparCarrinho,
  type CartItem,
  type CartResponse,
} from "@/services/carrinhoService";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Ticket,
  CreditCard,
  Wallet,
  Shield,
  ArrowRight,
  RefreshCw,
  Package,
  XCircle,
  LogIn,
  UserPlus,
  AlertTriangle,
  Info,
  ChevronRight,
  Sparkles,
  Lock,
  FileText,
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Cart Item Component
interface CartItemCardProps {
  item: CartItem;
  onRemove: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  isUpdating: boolean;
}

const CartItemCard = ({ item, onRemove, onUpdateQuantity, isUpdating }: CartItemCardProps) => {
  const config = getLotteryConfig(item.tipoLoteria);
  const isExpiringSoon = item.segundosRestantes < 300; // Less than 5 minutes
  
  return (
    <Card className={`relative p-4 sm:p-6 bg-bolao-card/60 border-bolao-card-border hover:border-bolao-card-border-hover transition-all ${isExpiringSoon ? "border-orange-500/50" : ""}`}>
      {/* Expiring Warning */}
      {isExpiringSoon && (
        <div className="absolute -top-2 right-4">
          <Badge className="bg-orange-500 text-white animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Expirando
          </Badge>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Lottery Icon & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-14 h-14 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl shrink-0`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${config.bgColor} ${config.color} border-0`}>
                {item.tipoLoteria}
              </Badge>
            </div>
            
            <h3 className="font-bold text-lg text-white truncate">{item.bolaoNome}</h3>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(item.expiraEm)}
              </span>
              <span className="flex items-center gap-1">
                <Ticket className="w-4 h-4" />
                {item.quantidadeCotas} {item.quantidadeCotas === 1 ? "cota" : "cotas"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quantity & Price */}
        <div className="flex flex-col sm:items-end gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Qtd:</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantidadeCotas - 1)}
              disabled={item.quantidadeCotas <= 1 || isUpdating}
              className="w-8 h-8 rounded-lg bg-bolao-dark border border-bolao-card-border flex items-center justify-center hover:bg-bolao-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold">{item.quantidadeCotas}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantidadeCotas + 1)}
              disabled={isUpdating}
              className="w-8 h-8 rounded-lg bg-bolao-dark border border-bolao-card-border flex items-center justify-center hover:bg-bolao-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Price Info */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(item.valorUnitario)} × {item.quantidadeCotas}
            </p>
            <p className="text-xl font-bold text-bolao-green">
              {formatCurrency(item.valorTotal)}
            </p>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Remover
          </button>
        </div>
      </div>
    </Card>
  );
};

// Empty Cart Component
const EmptyCart = () => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bolao-card/50 flex items-center justify-center">
      <ShoppingCart className="w-12 h-12 text-muted-foreground" />
    </div>
    <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
      Você ainda não adicionou nenhum bolão ao carrinho. Explore nossos bolões disponíveis e comece a jogar!
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link href="/mega-sena">
        <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Ver Bolões Mega-Sena
        </Button>
      </Link>
      <Link href="/lotofacil">
        <Button variant="outline" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
          Ver Bolões Lotofácil
        </Button>
      </Link>
    </div>
  </div>
);

// Error State Component
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
      <XCircle className="w-12 h-12 text-red-400" />
    </div>
    <h2 className="text-2xl font-bold mb-2">Erro ao carregar carrinho</h2>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
      Não foi possível carregar os itens do seu carrinho. Por favor, tente novamente.
    </p>
    <Button 
      onClick={onRetry}
      className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Tentar Novamente
    </Button>
  </div>
);

// Login Required Banner
const LoginRequiredBanner = () => (
  <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/30">
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
        <Lock className="w-7 h-7 text-orange-400" />
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="font-bold text-lg text-orange-400 mb-1">
          Para finalizar a compra, você precisa estar logado e cadastrado.
        </h3>
        <p className="text-sm text-muted-foreground">
          Faça login ou crie sua conta para concluir a compra dos seus bolões.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login?returnUrl=/carrinho">
          <Button className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-semibold px-5">
            <LogIn className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </Link>
        <Link href="/cadastro?returnUrl=/carrinho">
          <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold px-5">
            <UserPlus className="w-4 h-4 mr-2" />
            Criar Conta
          </Button>
        </Link>
      </div>
    </div>
  </Card>
);

// Order Summary Component
interface OrderSummaryProps {
  subtotal: number;
  taxa: number;
  total: number;
  itemCount: number;
  isLoggedIn: boolean;
  onCheckout: () => void;
  isProcessing: boolean;
}

const OrderSummary = ({ 
  subtotal, 
  taxa, 
  total, 
  itemCount, 
  isLoggedIn, 
  onCheckout, 
  isProcessing 
}: OrderSummaryProps) => (
  <Card className="p-6 bg-bolao-card/60 border-bolao-card-border sticky top-24">
    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
      <Package className="w-5 h-5 text-bolao-green" />
      Resumo do Pedido
    </h2>
    
    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      
      {taxa > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>Taxa de serviço</span>
          <span>{formatCurrency(taxa)}</span>
        </div>
      )}
      
      <div className="border-t border-bolao-card-border pt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-extrabold text-bolao-green">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
    
    {isLoggedIn ? (
      <Button
        onClick={onCheckout}
        disabled={isProcessing || itemCount === 0}
        className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold text-lg py-6 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Finalizar Compra
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    ) : (
      <div className="space-y-3">
        <Button
          disabled
          className="w-full bg-gray-600 text-gray-300 font-bold text-lg py-6 cursor-not-allowed"
        >
          <Lock className="w-5 h-5 mr-2" />
          Faça login para finalizar
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Você precisa estar logado para concluir a compra
        </p>
      </div>
    )}
    
    {/* Payment Methods */}
    <div className="mt-6 pt-4 border-t border-bolao-card-border">
      <p className="text-sm text-muted-foreground mb-3">Formas de pagamento aceitas:</p>
      <div className="flex gap-2 flex-wrap">
        <Badge className="bg-bolao-dark border border-bolao-card-border">
          <Wallet className="w-3 h-3 mr-1" />
          PIX
        </Badge>
        <Badge className="bg-bolao-dark border border-bolao-card-border">
          <CreditCard className="w-3 h-3 mr-1" />
          Cartão
        </Badge>
        <Badge className="bg-bolao-dark border border-bolao-card-border">
          <FileText className="w-3 h-3 mr-1" />
          Boleto
        </Badge>
      </div>
    </div>
    
    {/* Security Badge */}
    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="w-4 h-4 text-bolao-green" />
      <span>Pagamento 100% seguro</span>
    </div>
  </Card>
);

// Main Cart Page
export default function CarrinhoPage() {
  const { isLoggedIn } = useAuth();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);
  const [expiredItemsRemoved, setExpiredItemsRemoved] = useState(false);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await buscarCarrinho();
      
      if (response.success) {
        // Check for expired items
        const expiredItems = response.itens.filter(item => item.segundosRestantes <= 0);
        
        if (expiredItems.length > 0 && !expiredItemsRemoved) {
          setNotification({
            type: "warning",
            message: `${expiredItems.length} ${expiredItems.length === 1 ? "item foi removido" : "itens foram removidos"} do carrinho por ter expirado.`,
          });
          setExpiredItemsRemoved(true);
          
          // Filter out expired items locally
          response.itens = response.itens.filter(item => item.segundosRestantes > 0);
          response.totalItens = response.itens.length;
          response.valorTotal = response.itens.reduce((acc, item) => acc + item.valorTotal, 0);
        }
        
        setCartData(response);
      } else {
        setError(response.error || "Erro ao carregar carrinho");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [expiredItemsRemoved]);

  useEffect(() => {
    fetchCart();
    
    // Refresh cart every 30 seconds
    const interval = setInterval(fetchCart, 30000);
    return () => clearInterval(interval);
  }, [fetchCart]);

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(true);
    
    try {
      const response = await removerItem(itemId);
      
      if (response.success) {
        setNotification({ type: "success", message: "Item removido do carrinho" });
        await fetchCart();
      } else {
        setNotification({ type: "error", message: response.error || "Erro ao remover item" });
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
        setNotification({ type: "error", message: response.error || "Erro ao atualizar quantidade" });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erro de conexão" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (!confirm("Tem certeza que deseja limpar todo o carrinho?")) return;
    
    setIsUpdating(true);
    
    try {
      const response = await limparCarrinho();
      
      if (response.success) {
        setNotification({ type: "success", message: "Carrinho limpo com sucesso" });
        await fetchCart();
      } else {
        setNotification({ type: "error", message: response.error || "Erro ao limpar carrinho" });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erro de conexão" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isLoggedIn) {
      setNotification({ type: "warning", message: "Faça login para finalizar a compra" });
      return;
    }
    
    setIsProcessing(true);
    // Redirect to checkout page
    window.location.href = "/checkout";
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead
        title="Carrinho de Compras"
        description="Finalize a compra das suas cotas de bolão. Participe dos melhores bolões da Mega-Sena, Lotofácil e muito mais."
        keywords={["carrinho", "comprar bolão", "cotas loteria", "checkout bolão"]}
        pageType="checkout"
        canonicalUrl="https://bolaomax.com.br/carrinho"
      />
      <Header activePage="carrinho" />

      <main className="min-h-[80vh]">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-bolao-green/10 via-bolao-dark to-violet-900/10" />
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-bolao-green/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-bolao-green font-medium">Carrinho</span>
            </nav>

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-bolao-green/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-bolao-green" />
                  </div>
                  Carrinho de Compras
                </h1>
                {cartData && cartData.itens.length > 0 && (
                  <p className="text-muted-foreground mt-2">
                    Você tem {cartData.totalItens} {cartData.totalItens === 1 ? "item" : "itens"} no carrinho
                  </p>
                )}
              </div>
              
              {cartData && cartData.itens.length > 0 && (
                <div className="flex gap-3">
                  <Link href="/mega-sena">
                    <Button variant="outline" className="border-bolao-green/50 text-bolao-green hover:bg-bolao-green/10">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Mais
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={handleClearCart}
                    disabled={isUpdating}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              )}
            </div>

            {/* Notification */}
            {notification && (
              <div 
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-in-up ${
                  notification.type === "success" 
                    ? "bg-bolao-green/10 border border-bolao-green/30 text-bolao-green"
                    : notification.type === "warning"
                    ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : notification.type === "warning" ? (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* Login Required Banner (if not logged in and has items) */}
            {!isLoggedIn && cartData && cartData.itens.length > 0 && (
              <div className="mb-6">
                <LoginRequiredBanner />
              </div>
            )}

            {/* Main Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-bolao-green animate-spin" />
              </div>
            ) : error ? (
              <ErrorState onRetry={fetchCart} />
            ) : !cartData || cartData.itens.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartData.itens.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onUpdateQuantity={handleUpdateQuantity}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <OrderSummary
                    subtotal={cartData.valorTotal}
                    taxa={0}
                    total={cartData.valorTotal}
                    itemCount={cartData.totalItens}
                    isLoggedIn={isLoggedIn}
                    onCheckout={handleCheckout}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info Footer Section */}
        {cartData && cartData.itens.length > 0 && (
          <section className="py-8 bg-bolao-card/30 border-t border-bolao-card-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-bolao-green/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-bolao-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Horário de Encerramento</p>
                    <p className="text-xs text-muted-foreground">
                      O encerramento das compras segue o horário oficial da loteria.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Suas Cotas</p>
                    <p className="text-xs text-muted-foreground">
                      Após o pagamento, as cotas aparecem em Minha Conta {">"} Minhas Cotas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Documentos</p>
                    <div className="flex gap-3 mt-1">
                      <Link href="/termos" className="text-xs text-bolao-green hover:underline">
                        Termos de Uso
                      </Link>
                      <Link href="/privacidade" className="text-xs text-bolao-green hover:underline">
                        Política de Privacidade
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
