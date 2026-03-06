import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Ticket, Clover, Star, ChevronRight, X } from "lucide-react";

interface LotterySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LotteryOption {
  id: string;
  name: string;
  path: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  glowClass: string;
  icon: typeof Ticket;
}

const lotteryOptions: LotteryOption[] = [
  {
    id: "lotofacil",
    name: "Lotofácil",
    path: "/lotofacil",
    description: "• Sorteios diários de Segunda a Sábado\nBolões Com 16 a 20 dezenas",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    hoverBg: "hover:bg-violet-500/20",
    glowClass: "group-hover:shadow-violet-500/30",
    icon: Ticket,
  },
  {
    id: "megasena",
    name: "Mega-Sena",
    path: "/megasena",
    description: "• Terças, Quintas e Sábados\nBolões de 7 a 20 dezenas",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    hoverBg: "hover:bg-emerald-500/20",
    glowClass: "group-hover:shadow-emerald-500/30",
    icon: Clover,
  },
  {
    id: "quina",
    name: "Quina",
    path: "/quina",
    description: "• Sorteios diários de Segunda a Sábado\nBolões de 6 a 15 dezenas",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    hoverBg: "hover:bg-sky-500/20",
    glowClass: "group-hover:shadow-sky-500/30",
    icon: Star,
  },
];

export const LotterySelectionModal = ({ isOpen, onClose }: LotterySelectionModalProps) => {
  const [, setLocation] = useLocation();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleSelectLottery = (path: string) => {
    onClose();
    setLocation(path);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="bg-bolao-dark border-bolao-card-border max-w-lg sm:max-w-xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Header with gradient */}
        <div className="relative px-6 pt-6 pb-4 border-b border-bolao-card-border bg-gradient-to-br from-bolao-card/80 to-bolao-dark">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-bolao-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-white text-center sm:text-left">
              Escolha sua Loteria
            </DialogTitle>
            <p className="text-muted-foreground text-sm mt-1 text-center sm:text-left">
              Selecione o tipo de bolão que deseja participar
            </p>
          </DialogHeader>
        </div>

        {/* Lottery Options */}
        <div className="p-4 sm:p-6 space-y-3">
          {lotteryOptions.map((lottery) => {
            const IconComponent = lottery.icon;
            const isHovered = hoveredOption === lottery.id;
            
            return (
              <button
                key={lottery.id}
                onClick={() => handleSelectLottery(lottery.path)}
                onMouseEnter={() => setHoveredOption(lottery.id)}
                onMouseLeave={() => setHoveredOption(null)}
                className={`
                  group w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all duration-300
                  ${lottery.bgColor} ${lottery.borderColor} ${lottery.hoverBg}
                  hover:scale-[1.02] hover:shadow-lg ${lottery.glowClass}
                `}
              >
                {/* Icon */}
                <div className={`
                  w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center
                  ${lottery.bgColor} border ${lottery.borderColor}
                  transition-all duration-300 group-hover:scale-110
                `}>
                  <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 ${lottery.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <h3 className={`text-lg sm:text-xl font-bold ${lottery.color} mb-1`}>
                    {lottery.name}
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {lottery.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${lottery.bgColor} border ${lottery.borderColor}
                  transition-all duration-300
                  ${isHovered ? 'translate-x-1' : ''}
                `}>
                  <ChevronRight className={`w-5 h-5 ${lottery.color}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 bg-bolao-green rounded-full animate-pulse" />
            <span>Bolões disponíveis em tempo real</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for easy modal management
export const useLotteryModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal,
  };
};

export default LotterySelectionModal;
