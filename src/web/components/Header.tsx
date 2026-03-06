import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuOptional } from "@/contexts/MenuContext";
import { AdicionarSaldoModal } from "@/components/AdicionarSaldoModal";
import { CartDrawer } from "@/components/CartDrawer";
import { buscarCarrinho } from "@/services/carrinhoService";
import {
  Sparkles,
  Menu,
  X,
  User,
  Wallet,
  LogOut,
  ChevronDown,
  Bell,
  Plus,
  ShoppingCart,
} from "lucide-react";
import {
  getActiveLotteries,
  getComingSoonLotteries,
  getLotteryBySlug,
  getLotteryColorName,
  colorClasses,
  iconMap,
  isLotteryPage,
  type LotteryConfig,
} from "@/services/lotteryService";

// Default menu items (fallback when MenuContext is not available)
const defaultMenuItems = [
  { id: "por-que-bolaomax", name: "Por que BolãoMax", route: "/por-que-bolaomax", slug: "por-que-bolaomax", visible: true, order: 1 },
  { id: "sobre-nos", name: "Sobre Nós", route: "/sobre-nos", slug: "sobre-nos", visible: true, order: 2 },
  { id: "como-funciona", name: "Como Funciona", route: "/como-funciona", slug: "como-funciona", visible: true, order: 3 },
  { id: "resultados", name: "Resultados", route: "/resultados", slug: "resultados", visible: true, order: 4 },
  { id: "calendario", name: "Calendário", route: "/calendar", slug: "calendar", visible: true, order: 5 },
];

interface HeaderProps {
  activePage?: string;
  transparent?: boolean;
}

export const Header = ({ activePage = "home", transparent = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLotteriesMenuOpen, setIsLotteriesMenuOpen] = useState(false);
  const [isMobileLotteriesOpen, setIsMobileLotteriesOpen] = useState(false);
  const [isAdicionarSaldoModalOpen, setIsAdicionarSaldoModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const lotteriesMenuRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch cart count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const cart = await buscarCarrinho();
        if (cart.success) {
          setCartItemCount(cart.totalItens);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    
    fetchCartCount();
    // Refresh cart count every 30 seconds
    const interval = setInterval(fetchCartCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh cart count when drawer closes
  const handleCartDrawerClose = () => {
    setIsCartDrawerOpen(false);
    // Refresh cart count
    buscarCarrinho().then(cart => {
      if (cart.success) {
        setCartItemCount(cart.totalItens);
      }
    });
  };
  
  // Get menu items from context (with fallback to default)
  const menuContext = useMenuOptional();
  const menuItems = menuContext?.visibleMenuItems?.filter(
    item => item.id !== "loterias" && item.category !== "lottery"
  ).sort((a, b) => a.order - b.order) || defaultMenuItems;

  // Get lotteries from service
  const activeLotteries = getActiveLotteries();
  const comingSoonLotteries = getComingSoonLotteries();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isUserMenuOpen && !(e.target as Element).closest(".user-menu-container")) {
        setIsUserMenuOpen(false);
      }
      if (isLotteriesMenuOpen && lotteriesMenuRef.current && !lotteriesMenuRef.current.contains(e.target as Node)) {
        setIsLotteriesMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen, isLotteriesMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setLocation("/");
  };

  // Check if current page is a lottery page
  const isCurrentPageLottery = isLotteryPage(activePage);
  const currentLottery = getLotteryBySlug(activePage);
  
  /**
   * Get the style for the "Loterias" button based on active lottery
   */
  const getLotteriesButtonStyle = () => {
    if (isCurrentPageLottery && currentLottery) {
      const colors = colorClasses[currentLottery.colorName];
      return `${colors.text} font-semibold`;
    }
    return "text-muted-foreground hover:text-white";
  };

  /**
   * Dynamic nav link styling based on page type
   */
  const getNavLinkStyle = (page: string) => {
    const isActive = activePage === page;
    const baseStyle = "text-sm font-medium transition-colors";
    
    // Check if it's a lottery page
    if (isLotteryPage(page)) {
      const lottery = getLotteryBySlug(page);
      if (lottery && isActive) {
        const colors = colorClasses[lottery.colorName];
        return `${baseStyle} ${colors.text} font-semibold`;
      }
    }
    
    // Default active and inactive styles
    if (isActive) {
      return `${baseStyle} text-bolao-green font-semibold`;
    }
    return `${baseStyle} text-[#FFFFFF] hover:text-white`;
  };

  /**
   * Get color classes for a lottery
   */
  const getLotteryStyles = (lottery: LotteryConfig, isActive: boolean) => {
    const colors = colorClasses[lottery.colorName];
    return {
      text: colors.text,
      bg: colors.activeBg,
      iconBg: colors.iconBg,
      indicator: colors.bg,
    };
  };

  /**
   * Render a lottery item in the dropdown
   */
  const renderLotteryItem = (lottery: LotteryConfig, onClick: () => void) => {
    const isActive = activePage === lottery.slug;
    const styles = getLotteryStyles(lottery, isActive);
    const Icon = iconMap[lottery.icon];
    
    return (
      <Link
        key={lottery.id}
        href={lottery.route}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          isActive 
            ? `${styles.bg} ${styles.text}` 
            : "hover:bg-bolao-dark/50 text-muted-foreground hover:text-white"
        }`}
      >
        <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${styles.text}`} />
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isActive ? styles.text : ""}`}>{lottery.name}</p>
          <p className="text-xs text-muted-foreground">{lottery.description}</p>
        </div>
        {isActive && (
          <div className={`w-2 h-2 rounded-full ${styles.indicator}`} />
        )}
      </Link>
    );
  };

  /**
   * Render a "coming soon" lottery item
   */
  const renderComingSoonItem = (lottery: LotteryConfig) => {
    const Icon = iconMap[lottery.icon];
    
    return (
      <div 
        key={lottery.id}
        className="flex items-center gap-3 px-3 py-1.5 text-muted-foreground/50 cursor-not-allowed"
      >
        <div className="w-8 h-8 rounded-lg bg-bolao-dark/30 flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <span className="text-sm">{lottery.name}</span>
      </div>
    );
  };

  /**
   * Render mobile lottery item
   */
  const renderMobileLotteryItem = (lottery: LotteryConfig, onClick: () => void) => {
    const isActive = activePage === lottery.slug;
    const styles = getLotteryStyles(lottery, isActive);
    const Icon = iconMap[lottery.icon];
    
    return (
      <Link
        key={lottery.id}
        href={lottery.route}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? `${styles.text} ${styles.bg}` 
            : "text-muted-foreground hover:text-white hover:bg-bolao-card"
        }`}
      >
        <div className={`w-7 h-7 rounded-md ${styles.iconBg} flex items-center justify-center`}>
          <Icon className={`w-3.5 h-3.5 ${styles.text}`} />
        </div>
        <span>{lottery.name}</span>
      </Link>
    );
  };

  return (
    <header
      className={`${transparent ? "fixed" : "sticky"} top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !transparent
          ? "bg-bolao-dark/95 backdrop-blur-xl border-b border-bolao-card-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bolao-dark" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Bolão<span className="text-bolao-green">Max</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {/* Lotteries Dropdown */}
            <div className="relative" ref={lotteriesMenuRef}>
              <button
                onClick={() => {
                  console.log("[Header] Lotteries dropdown toggled:", !isLotteriesMenuOpen);
                  setIsLotteriesMenuOpen(!isLotteriesMenuOpen);
                }}
                className={`flex items-center gap-1.5 text-sm font-semibold leading-5 transition-colors ${getLotteriesButtonStyle()}`}
              >
                Loterias
                <ChevronDown 
                  className={`w-4 h-4 transition-transform duration-200 ${isLotteriesMenuOpen ? "rotate-180" : ""}`} 
                />
              </button>
              
              {/* Dropdown Menu */}
              {isLotteriesMenuOpen && (
                <div className="absolute left-0 top-full mt-3 w-64 bg-bolao-card border border-bolao-card-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Active Lotteries */}
                  <div className="p-2">
                    {activeLotteries.map((lottery) => 
                      renderLotteryItem(lottery, () => {
                        console.log("[Header] Lottery clicked:", lottery.name, "-> Route:", lottery.route);
                        setIsLotteriesMenuOpen(false);
                      })
                    )}
                  </div>
                  
                  {/* Coming Soon Section */}
                  {comingSoonLotteries.length > 0 && (
                    <div className="border-t border-bolao-card-border px-2 py-2">
                      <div className="px-3 py-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                          Em breve
                        </p>
                        {comingSoonLotteries.map(renderComingSoonItem)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Menu Items from Context */}
            {menuItems.filter(item => item.visible).map((item) => (
              <Link 
                key={item.id}
                href={item.route} 
                className={getNavLinkStyle(item.slug)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                {/* Notification Bell */}
                <Link 
                  href="/minha-conta" 
                  className="relative p-2 rounded-lg hover:bg-bolao-card/50 transition-colors"
                  title="Notificações"
                >
                  <Bell className="w-5 h-5 text-muted-foreground hover:text-white" />
                  <span className="absolute top-1 right-1 w-4 h-4 bg-bolao-orange-bright rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                    5
                  </span>
                </Link>

                <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bolao-card/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-bolao-green/20 border border-bolao-green/30 flex items-center justify-center text-bolao-green font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      R$ {user.saldo.toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-bolao-card border border-bolao-card-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-bolao-card-border">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-bolao-green">
                          <Wallet className="w-4 h-4" />
                          <span className="font-bold">R$ {user.saldo.toFixed(2).replace(".", ",")}</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsAdicionarSaldoModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-bolao-green/20 text-bolao-green text-xs font-semibold hover:bg-bolao-green/30 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsAdicionarSaldoModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bolao-green/10 text-bolao-green transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Adicionar Saldo</span>
                      </button>
                      <Link
                        href="/minha-conta"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-bolao-dark/50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Minha Conta</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Cart Button - Logged in */}
              <button 
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2.5 rounded-xl bg-bolao-card/50 hover:bg-bolao-card border-2 border-bolao-green/50 hover:border-bolao-green transition-all group"
                title="Carrinho de Compras"
              >
                <ShoppingCart className="w-5 h-5 text-bolao-green group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-bolao-dark shadow-lg shadow-red-500/50 animate-pulse">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>
              </>
            ) : (
              <>
                {/* Cart Button - Not logged in */}
                <button 
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="relative p-2.5 rounded-xl bg-bolao-card/50 hover:bg-bolao-card border-2 border-bolao-green/50 hover:border-bolao-green transition-all group"
                  title="Carrinho de Compras"
                >
                  <ShoppingCart className="w-5 h-5 text-bolao-green group-hover:scale-110 transition-transform" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-bolao-dark shadow-lg shadow-red-500/50 animate-pulse">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </button>
                
                <Link href="/login">
                  <Button className="bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-semibold px-5 glow-orange hover:glow-orange-intense transition-all">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold px-5">
                    Criar Conta
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-bolao-card-border">
            <nav className="flex flex-col gap-2">
              {/* Mobile Lotteries Section */}
              <div className="px-2">
                <button
                  onClick={() => setIsMobileLotteriesOpen(!isMobileLotteriesOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isCurrentPageLottery 
                      ? getLotteriesButtonStyle() + " bg-bolao-card/50" 
                      : "text-muted-foreground hover:text-white hover:bg-bolao-card"
                  }`}
                >
                  <span>Loterias</span>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileLotteriesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                
                {isMobileLotteriesOpen && (
                  <div className="mt-1 ml-4 border-l-2 border-bolao-card-border pl-4 space-y-1">
                    {/* Active Lotteries */}
                    {activeLotteries.map((lottery) => 
                      renderMobileLotteryItem(lottery, () => setIsMobileMenuOpen(false))
                    )}
                    
                    {/* Coming Soon */}
                    {comingSoonLotteries.length > 0 && (
                      <div className="pt-2 pb-1">
                        <p className="text-xs text-muted-foreground/60 px-3">Em breve</p>
                        {comingSoonLotteries.map((lottery) => {
                          const Icon = iconMap[lottery.icon];
                          return (
                            <div 
                              key={lottery.id}
                              className="flex items-center gap-3 px-3 py-1.5 text-muted-foreground/40 text-sm"
                            >
                              <div className="w-7 h-7 rounded-md bg-bolao-dark/30 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{lottery.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Mobile Menu Items from Context */}
              {menuItems.filter(item => item.visible).map((item) => (
                <Link 
                  key={item.id}
                  href={item.route} 
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activePage === item.slug 
                      ? "text-bolao-green bg-bolao-green/10" 
                      : "text-muted-foreground hover:text-white hover:bg-bolao-card"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isLoggedIn && user ? (
                <>
                  {/* Mobile Cart Button - Logged in */}
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCartDrawerOpen(true);
                    }}
                    className="mx-4 mt-2 flex items-center justify-between px-4 py-3 rounded-lg bg-bolao-card/50 border border-bolao-green/30 hover:border-bolao-green transition-all w-[calc(100%-2rem)]"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-bolao-green" />
                      <span className="font-medium">Carrinho</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold text-white">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="mt-2 px-4 py-3 bg-bolao-card/50 rounded-lg border border-bolao-card-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bolao-green/20 border border-bolao-green/30 flex items-center justify-center text-bolao-green font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-bolao-green flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          R$ {user.saldo.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 px-4">
                    <Link href="/minha-conta" className="flex-1">
                      <Button variant="outline" className="w-full border-bolao-card-border">
                        <User className="w-4 h-4 mr-2" />
                        Minha Conta
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Mobile Cart Button - Not logged in */}
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCartDrawerOpen(true);
                    }}
                    className="mx-4 mt-2 flex items-center justify-between px-4 py-3 rounded-lg bg-bolao-card/50 border border-bolao-green/30 hover:border-bolao-green transition-all w-[calc(100%-2rem)]"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-bolao-green" />
                      <span className="font-medium">Carrinho</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold text-white">
                        {cartItemCount > 99 ? "99+" : cartItemCount}
                      </span>
                    )}
                  </button>
                  
                  <div className="flex gap-2 mt-2 px-4">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-semibold glow-orange">Entrar</Button>
                    </Link>
                    <Link href="/cadastro" className="flex-1">
                      <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                        Criar Conta
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Modal Adicionar Saldo */}
      <AdicionarSaldoModal
        isOpen={isAdicionarSaldoModalOpen}
        onClose={() => setIsAdicionarSaldoModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={handleCartDrawerClose}
      />
    </header>
  );
};
