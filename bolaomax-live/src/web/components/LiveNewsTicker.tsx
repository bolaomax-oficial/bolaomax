import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, TrendingUp, X, Trophy, Ticket, Eye, Crown, Gift } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  liveNotificationService,
  PurchaseNotification,
  NotificationType,
  LotteryType,
} from "@/services/liveNotificationService";

// Get lottery type display info
const getLotteryInfo = (type: LotteryType) => {
  switch (type) {
    case "lotofacil":
      return { label: "Lotofácil", color: "text-violet-400", bgColor: "bg-violet-500/20", borderColor: "border-violet-500/30" };
    case "megasena":
      return { label: "Mega-Sena", color: "text-emerald-400", bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500/30" };
    case "quina":
      return { label: "Quina", color: "text-sky-400", bgColor: "bg-sky-500/20", borderColor: "border-sky-500/30" };
  }
};

// Get notification type display info
const getNotificationTypeInfo = (type: NotificationType) => {
  switch (type) {
    case "purchase":
      return { 
        icon: Zap, 
        color: "text-bolao-green", 
        bgColor: "bg-bolao-green/20",
        label: "participou do"
      };
    case "win_small":
      return { 
        icon: Gift, 
        color: "text-yellow-400", 
        bgColor: "bg-yellow-500/20",
        label: "ganhou R$ 850 no"
      };
    case "win_big":
      return { 
        icon: Trophy, 
        color: "text-bolao-orange", 
        bgColor: "bg-bolao-orange/20",
        label: "ganhou R$ 12.500 no"
      };
    case "vip_signup":
      return { 
        icon: Crown, 
        color: "text-purple-400", 
        bgColor: "bg-purple-500/20",
        label: "assinou o"
      };
  }
};

interface LiveNewsTickerProps {
  className?: string;
  position?: "top" | "bottom";
  enabled?: boolean;
}

export const LiveNewsTicker = ({
  className = "",
  position = "bottom",
  enabled = true,
}: LiveNewsTickerProps) => {
  const [notifications, setNotifications] = useState<PurchaseNotification[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PurchaseNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Check localStorage for visibility preference
    const stored = localStorage.getItem("bolaomax_ticker_visible");
    if (stored !== null) {
      setIsVisible(JSON.parse(stored));
    }

    // Generate initial notifications
    const initial = liveNotificationService.generateInitialNotifications(15);
    setNotifications(initial);

    // Subscribe to new notifications
    const unsubscribe = liveNotificationService.subscribeToNewPurchases((notification) => {
      setNotifications(prev => {
        const updated = [notification, ...prev];
        return updated.slice(0, 50);
      });
    });

    // Start auto-generation
    const stopAutoGen = liveNotificationService.startAutoGeneration(8000, 20000);

    return () => {
      unsubscribe();
      stopAutoGen();
    };
  }, []);

  const handleNotificationClick = useCallback((notification: PurchaseNotification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  }, []);

  const toggleVisibility = useCallback(() => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem("bolaomax_ticker_visible", JSON.stringify(newValue));
  }, [isVisible]);

  // Don't render until mounted
  if (!isMounted) return null;

  if (!enabled || !isVisible) {
    // Show small toggle button when hidden
    if (!isVisible) {
      return (
        <button
          onClick={toggleVisibility}
          className={`fixed ${position === "bottom" ? "bottom-20" : "top-20"} left-4 z-40 p-2 rounded-full bg-bolao-card/90 border border-bolao-card-border backdrop-blur-sm hover:bg-bolao-green/20 transition-all group`}
          title="Mostrar feed de atividades"
        >
          <Zap className="w-4 h-4 text-bolao-green group-hover:scale-110 transition-transform" />
        </button>
      );
    }
    return null;
  }

  const positionClasses = position === "bottom" 
    ? "bottom-0 left-0 right-0" 
    : "top-16 lg:top-20 left-0 right-0";

  return (
    <>
      <div
        className={`fixed ${positionClasses} z-40 ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background with gradient edges */}
        <div className="relative bg-bolao-darker/95 backdrop-blur-md border-t border-bolao-card-border overflow-hidden">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-bolao-darker to-transparent z-10 pointer-events-none" />
          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-bolao-darker to-transparent z-10 pointer-events-none" />

          {/* Live indicator & close button */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-bolao-green/20 border border-bolao-green/30">
              <div className="w-1.5 h-1.5 rounded-full bg-bolao-green animate-live-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold text-bolao-green uppercase tracking-wider hidden sm:inline">Ao Vivo</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={toggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full hover:bg-white/10 transition-colors group"
            title="Ocultar feed"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
          </button>

          {/* Scrolling ticker */}
          <div
            ref={tickerRef}
            className="flex items-center py-2.5 sm:py-3 px-20 sm:px-32"
          >
            <div
              className={`flex items-center gap-6 sm:gap-8 ${isPaused ? "" : "animate-marquee"}`}
              style={{
                animationDuration: `${Math.max(notifications.length * 3, 30)}s`,
                animationPlayState: isPaused ? "paused" : "running",
              }}
            >
              {/* Duplicate for seamless loop */}
              {[...notifications, ...notifications].map((notification, index) => {
                const lotteryInfo = getLotteryInfo(notification.lotteryType);
                const typeInfo = getNotificationTypeInfo(notification.type);
                const IconComponent = typeInfo.icon;
                
                return (
                  <button
                    key={`${notification.id}-${index}`}
                    onClick={() => handleNotificationClick(notification)}
                    className="flex items-center gap-2 sm:gap-3 whitespace-nowrap group hover:opacity-100 transition-opacity shrink-0"
                  >
                    {/* Icon */}
                    <div className={`p-1 sm:p-1.5 rounded-full ${notification.isSpecial ? "bg-bolao-orange/20" : typeInfo.bgColor}`}>
                      <IconComponent className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${notification.isSpecial ? "text-bolao-orange" : typeInfo.color}`} />
                    </div>

                    {/* Content */}
                    <span className="text-xs sm:text-sm">
                      <span className="font-semibold text-white group-hover:text-bolao-green transition-colors">
                        {notification.userInitials}
                      </span>
                      <span className="text-muted-foreground mx-1.5">
                        {notification.type === "vip_signup" ? "assinou o" : typeInfo.label}
                      </span>
                      <span className={`font-semibold ${notification.type === "vip_signup" ? "text-purple-400" : lotteryInfo.color}`}>
                        {notification.type === "vip_signup" ? "Clube VIP" : notification.bolaoName}
                      </span>
                      {notification.type !== "vip_signup" && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] sm:text-xs rounded ${lotteryInfo.bgColor} ${lotteryInfo.color}`}>
                          {lotteryInfo.label}
                        </span>
                      )}
                      {notification.isSpecial && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] sm:text-xs rounded bg-bolao-orange/20 text-bolao-orange">
                          ESPECIAL
                        </span>
                      )}
                    </span>

                    {/* Separator */}
                    <span className="text-bolao-card-border mx-2 sm:mx-4">•</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bolão Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-bolao-card border-bolao-card-border max-w-md">
          {selectedNotification && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                {selectedNotification.type === "vip_signup" ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-400">Clube VIP</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Nova Assinatura VIP
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {selectedNotification.userInitials} acabou de se tornar membro VIP!
                    </p>
                  </>
                ) : (
                  <>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getLotteryInfo(selectedNotification.lotteryType).bgColor} ${getLotteryInfo(selectedNotification.lotteryType).borderColor} border`}>
                      <Ticket className={`w-4 h-4 ${getLotteryInfo(selectedNotification.lotteryType).color}`} />
                      <span className={`text-sm font-semibold ${getLotteryInfo(selectedNotification.lotteryType).color}`}>
                        {getLotteryInfo(selectedNotification.lotteryType).label}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedNotification.bolaoName}
                    </h3>
                    {selectedNotification.isSpecial && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-bolao-orange/20 border border-bolao-orange/30">
                        <Trophy className="w-3.5 h-3.5 text-bolao-orange" />
                        <span className="text-xs font-semibold text-bolao-orange">EVENTO ESPECIAL</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Details */}
              {selectedNotification.type !== "vip_signup" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark border border-bolao-card-border">
                    <span className="text-muted-foreground text-sm">Prêmio Estimado</span>
                    <span className="font-bold text-bolao-green text-lg">{selectedNotification.prize}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark border border-bolao-card-border">
                    <span className="text-muted-foreground text-sm">Dezenas</span>
                    <span className="font-semibold text-white">{selectedNotification.dezenas} dezenas</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark border border-bolao-card-border">
                    <span className="text-muted-foreground text-sm">Participação Recente</span>
                    <span className="font-semibold text-white">{selectedNotification.userInitials}</span>
                  </div>
                </div>
              )}

              {/* Privacy Note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-bolao-green/5 border border-bolao-green/20">
                <Eye className="w-4 h-4 text-bolao-green mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Identidades protegidas - Exibimos apenas iniciais para preservar a privacidade dos participantes.
                </p>
              </div>

              {/* CTA */}
              <Button
                className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold h-12"
                onClick={() => {
                  setIsModalOpen(false);
                  if (selectedNotification.type === "vip_signup") {
                    window.location.href = "/clube-vip";
                  } else {
                    window.location.href = `/${selectedNotification.lotteryType}`;
                  }
                }}
              >
                {selectedNotification.type === "vip_signup" ? "Conhecer Clube VIP" : "Ver Bolões Disponíveis"}
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </>
  );
};

export default LiveNewsTicker;
