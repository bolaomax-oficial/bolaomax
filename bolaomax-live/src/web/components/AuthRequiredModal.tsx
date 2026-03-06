import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Trophy, 
  Calendar, 
  Ticket, 
  Lock, 
  UserPlus, 
  LogIn,
  X,
  Sparkles,
} from "lucide-react";
import { storePendingBolao, buildCheckoutUrl, PendingBolao } from "@/utils/bolaoNavigation";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  bolao: PendingBolao | null;
  onCreateAccount: () => void;
  onLogin: () => void;
}

// Get lottery theme colors
const getLotteryTheme = (type: string) => {
  switch (type) {
    case "Mega-Sena":
      return {
        bg: "from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        button: "bg-emerald-600 hover:bg-emerald-500",
      };
    case "Lotofácil":
      return {
        bg: "from-violet-500/20 to-violet-600/10",
        border: "border-violet-500/50",
        text: "text-violet-400",
        badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        button: "bg-violet-600 hover:bg-violet-500",
      };
    case "Quina":
      return {
        bg: "from-sky-500/20 to-sky-600/10",
        border: "border-sky-500/50",
        text: "text-sky-400",
        badge: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        button: "bg-sky-600 hover:bg-sky-500",
      };
    default:
      return {
        bg: "from-bolao-green/20 to-bolao-green/10",
        border: "border-bolao-green/50",
        text: "text-bolao-green",
        badge: "bg-bolao-green/20 text-bolao-green border-bolao-green/30",
        button: "bg-bolao-green hover:bg-bolao-green-dark",
      };
  }
};

export const AuthRequiredModal = ({
  isOpen,
  onClose,
  bolao,
  onCreateAccount,
  onLogin,
}: AuthRequiredModalProps) => {
  if (!bolao) return null;

  const theme = getLotteryTheme(bolao.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-bolao-card border-bolao-card-border text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={`p-2 rounded-lg ${theme.bg} ${theme.border} border`}>
              <Lock className={`w-5 h-5 ${theme.text}`} />
            </div>
            <span>Participação requer conta</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message */}
          <p className="text-muted-foreground">
            Para participar deste bolão, você precisa criar uma conta ou fazer login.
          </p>

          {/* Bolão Preview Card */}
          <div className={`p-4 rounded-xl bg-gradient-to-br ${theme.bg} ${theme.border} border`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-bolao-dark/40 ${theme.border} border flex-shrink-0`}>
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
                
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className={`flex items-center gap-1 ${theme.text}`}>
                    <Trophy className="w-4 h-4" />
                    {bolao.prizeValue}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {bolao.sorteioDate}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">A partir de</span>
                  <span className="text-base font-bold text-orange-400">
                    R$ {bolao.minParticipation.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={onCreateAccount}
              className={`w-full h-12 ${theme.button} text-white font-bold gap-2`}
            >
              <UserPlus className="w-5 h-5" />
              Criar Conta Grátis
            </Button>
            
            <Button
              onClick={onLogin}
              variant="outline"
              className="w-full h-12 border-bolao-card-border hover:bg-bolao-dark/50 gap-2"
            >
              <LogIn className="w-5 h-5" />
              Já tenho conta
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-white"
            >
              Cancelar
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground pt-2">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Após criar sua conta, você será redirecionado para finalizar sua participação
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to use the auth modal in lottery pages
export const useAuthRequiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingBolao, setPendingBolao] = useState<PendingBolao | null>(null);
  const [, setLocation] = useLocation();

  const openModal = (bolao: PendingBolao) => {
    setPendingBolao(bolao);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setPendingBolao(null);
  };

  const handleCreateAccount = () => {
    if (pendingBolao) {
      storePendingBolao(pendingBolao);
      const checkoutUrl = buildCheckoutUrl(pendingBolao);
      setLocation(`/cadastro?returnUrl=${encodeURIComponent(checkoutUrl)}`);
    }
  };

  const handleLogin = () => {
    if (pendingBolao) {
      storePendingBolao(pendingBolao);
      const checkoutUrl = buildCheckoutUrl(pendingBolao);
      setLocation(`/login?returnUrl=${encodeURIComponent(checkoutUrl)}`);
    }
  };

  return {
    isOpen,
    pendingBolao,
    openModal,
    closeModal,
    handleCreateAccount,
    handleLogin,
    ModalComponent: (
      <AuthRequiredModal
        isOpen={isOpen}
        onClose={closeModal}
        bolao={pendingBolao}
        onCreateAccount={handleCreateAccount}
        onLogin={handleLogin}
      />
    ),
  };
};
