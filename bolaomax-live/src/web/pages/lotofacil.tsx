import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import { JogosCounter } from "@/components/JogosCounter";
import { BoloesCounter } from "@/components/BoloesCounter";
import { ViewGamesButton } from "@/components/ViewGamesButton";
import { CUSTO_POR_JOGO, formatPrize, formatCurrency, calculateMinParticipation } from "@/utils/bolaoCalculations";
import { handleBolaoParticipation, PendingBolao, parseBolaoValue, parseMinParticipation, buildCheckoutUrl } from "@/utils/bolaoNavigation";
import { useAuthRequiredModal } from "@/components/AuthRequiredModal";
import { useLiveBolaoUpdates } from "@/hooks/useLiveBolaoUpdates";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { adicionarAoCarrinho } from "@/services/carrinhoService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trophy,
  Clock,
  ChevronDown,
  Clover,
  CircleDot,
  Flag,
  ArrowRight,
  Sparkles,
  Repeat,
  RefreshCw,
  ShoppingCart,
  Zap,
  Minus,
  Plus,
} from "lucide-react";

// Helper function to create a Date from date and time strings
const createEndDate = (dateStr: string, timeStr: string): Date => {
  const [day, month] = dateStr.split("/").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const year = new Date().getFullYear();
  // If the date is in the past for this year, use next year
  const date = new Date(year, month - 1, day, hours, minutes);
  if (date < new Date()) {
    date.setFullYear(year + 1);
  }
  return date;
};

// Independência Special Bolões - with realistic financial calculations
// Lotofácil: R$ 3.00 per game
const independenciaBoloes = [
  {
    id: "ind-1",
    codigoBolao: "BOL-0101",
    numeroConcurso: "3250",
    dezenas: 16,
    status: "Quase Completo",
    fillPercentage: 85,
    prizeValue: "R$ 8 Milhões",
    prizeValueFull: "R$ 8 Milhões",
    bolaoValue: "R$ 1.500", // 500 jogos × R$ 3.00 = R$ 1.500
    jogosGerados: 500,
    numeroBoloes: 2, // 2 jogos de loteria neste card
    minParticipation: "R$ 15", // ~1% do valor
    sorteioDate: "07/09",
    sorteioTime: "20:00",
    encerraDate: "07/09",
    encerraTime: "18:00",
    isSpecial: true,
  },
  {
    id: "ind-2",
    codigoBolao: "BOL-0102",
    numeroConcurso: "3250",
    dezenas: 18,
    status: "Aberto",
    fillPercentage: 45,
    prizeValue: "R$ 10 Milhões",
    prizeValueFull: "R$ 10 Milhões",
    bolaoValue: "R$ 2.400", // 800 jogos × R$ 3.00 = R$ 2.400
    jogosGerados: 800,
    numeroBoloes: 3, // 3 jogos de loteria neste card
    minParticipation: "R$ 25", // ~1% do valor
    sorteioDate: "07/09",
    sorteioTime: "20:00",
    encerraDate: "07/09",
    encerraTime: "17:00",
    isSpecial: true,
  },
  {
    id: "ind-3",
    codigoBolao: "BOL-0103",
    numeroConcurso: "3250",
    dezenas: 20,
    status: "Aberto",
    fillPercentage: 20,
    prizeValue: "R$ 12 Milhões",
    prizeValueFull: "R$ 12 Milhões",
    bolaoValue: "R$ 3.600", // 1200 jogos × R$ 3.00 = R$ 3.600
    jogosGerados: 1200,
    numeroBoloes: 3, // 3 jogos de loteria neste card
    minParticipation: "R$ 35", // ~1% do valor
    sorteioDate: "07/09",
    sorteioTime: "20:00",
    encerraDate: "07/09",
    encerraTime: "16:00",
    isSpecial: true,
  },
];

// Generate mock bolão data for Lotofácil with realistic financial calculations
const generateLotofacilBoloes = () => {
  const boloes = [];
  const dezenaOptions = [16, 17, 18, 19, 20];
  const prizeRanges = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]; // Prêmios em milhões
  
  // Base concurso number for Lotofácil (realistic)
  const baseConcurso = 3240;
  
  for (let i = 1; i <= 21; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * dezenaOptions.length)];
    const status = Math.random() > 0.6 ? "Quase Completo" : "Aberto";
    const fillPercentage = status === "Quase Completo" 
      ? Math.floor(Math.random() * 20) + 80 
      : Math.floor(Math.random() * 50) + 30;
    
    // Prêmio estimado
    const prizeValueNum = prizeRanges[Math.floor(Math.random() * prizeRanges.length)];
    
    // Jogos gerados: mais dezenas = mais jogos (60-200 jogos)
    const baseJogos = 60 + (dezenas - 16) * 15;
    const jogosGerados = baseJogos + Math.floor(Math.random() * 50);
    
    // Valor do bolão = jogos * custo por jogo (R$ 3,00 para Lotofácil)
    const bolaoValue = jogosGerados * CUSTO_POR_JOGO.lotofacil;
    
    // Participação mínima = 1-3% do valor do bolão, mínimo R$ 20
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    // numeroBoloes: número de jogos/bilhetes de loteria diferentes neste card (1-3)
    const numeroBoloes = jogosGerados > 150 ? 3 : jogosGerados > 100 ? 2 : 1;
    
    // Generate random dates
    const today = new Date();
    const sorteioDate = new Date(today);
    sorteioDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
    const encerraDate = new Date(sorteioDate);
    encerraDate.setHours(sorteioDate.getHours() - Math.floor(Math.random() * 24 + 2));

    // Randomly assign teimosinha to some bolões (about 30% chance)
    const hasTeimosinha = Math.random() > 0.7;
    const teimosinha = hasTeimosinha ? {
      enabled: true,
      mode: Math.random() > 0.4 ? "fixo" as const : "ate_ganhar" as const,
      concursos: Math.random() > 0.5 ? 3 : Math.random() > 0.5 ? 5 : 8
    } : undefined;

    // Generate codigoBolao and numeroConcurso
    const codigoBolao = `BOL-${String(i).padStart(4, "0")}`;
    const numeroConcurso = String(baseConcurso + Math.floor(i / 3));

    boloes.push({
      id: i,
      codigoBolao,
      numeroConcurso,
      dezenas,
      status,
      fillPercentage,
      prizeValue: formatPrize(prizeValueNum),
      bolaoValue: formatCurrency(bolaoValue),
      jogosGerados,
      numeroBoloes,
      minParticipation: formatCurrency(minParticipation),
      sorteioDate: sorteioDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      sorteioTime: `${Math.floor(Math.random() * 4 + 18)}:00`,
      encerraDate: encerraDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      encerraTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${Math.random() > 0.5 ? "00" : "30"}`,
      teimosinha,
    });
  }
  
  return boloes;
};

// Generate random game numbers for Lotofácil (25 numbers, select 15-20 dezenas)
const generateLotofacilGameNumbers = (dezenas: number) => {
  const numbers: number[] = [];
  while (numbers.length < dezenas) {
    const num = Math.floor(Math.random() * 25) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

// Games Modal Component
interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bolao: {
    dezenas: number;
    jogosGerados: number;
    prizeValue: string;
    numeroBoloes?: number;
  } | null;
  lotteryType: string;
}

const GamesModal = ({ isOpen, onClose, bolao, lotteryType }: GamesModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!bolao) return null;
  
  // Generate sample games based on numeroBoloes (number of lottery tickets)
  const numGames = bolao.numeroBoloes || 1;
  const games = Array.from({ length: Math.min(numGames, 3) }, () => 
    generateLotofacilGameNumbers(bolao.dezenas)
  );
  
  const totalNumbers = 25; // Lotofácil has 25 numbers
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-bolao-card border-bolao-card-border text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Clover className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <span className="text-white">Jogos do Bolão - {lotteryType}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {bolao.dezenas} dezenas • {numGames} {numGames === 1 ? "jogo" : "jogos"} de loteria
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Card Summary - Fixed wording */}
        <div className="bg-gradient-to-r from-violet-500/15 via-purple-500/10 to-violet-500/15 border border-violet-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-200 mb-1">
                📊 Estrutura deste Card
              </p>
              <p className="text-sm text-violet-100/80">
                Este card contém <strong className="text-violet-300">{numGames} {numGames === 1 ? "jogo" : "jogos"} de loteria</strong> diferentes, 
                cada um com <strong className="text-violet-300">{bolao.dezenas} dezenas</strong> selecionadas.
              </p>
              <p className="text-xs text-violet-200/60 mt-2">
                💡 Cada jogo utiliza estratégias diferentes para maximizar as chances de ganho.
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-violet-200">
            <strong>Prêmio Estimado:</strong> {bolao.prizeValue} • <strong>Estratégia:</strong> Balanceada
          </p>
        </div>
        
        {/* Tabs - only show tabs for games that exist */}
        <div className="flex gap-2 mb-4">
          {games.map((_, index) => (
            <Button
              key={index}
              variant={activeTab === index ? "default" : "outline"}
              onClick={() => setActiveTab(index)}
              className={`flex-1 ${
                activeTab === index 
                  ? "bg-violet-600 hover:bg-violet-500 text-white" 
                  : "border-bolao-card-border hover:border-violet-500/50"
              }`}
            >
              Jogo {index + 1}
            </Button>
          ))}
        </div>
        
        {/* Number Grid */}
        <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
              const isSelected = games[activeTab].includes(num);
              return (
                <div
                  key={num}
                  className={`aspect-square flex items-center justify-center rounded-lg text-base font-bold transition-all ${
                    isSelected 
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30 scale-105" 
                      : "bg-bolao-card/50 text-muted-foreground hover:bg-bolao-card"
                  }`}
                >
                  {String(num).padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Selected Numbers Summary */}
        <div className="mt-4 p-3 bg-bolao-dark/30 rounded-lg border border-bolao-card-border">
          <p className="text-sm text-muted-foreground mb-2">Dezenas selecionadas no Jogo {activeTab + 1}:</p>
          <div className="flex flex-wrap gap-2">
            {games[activeTab].map((num) => (
              <span key={num} className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm font-bold border border-violet-500/30">
                {String(num).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="bg-violet-600 hover:bg-violet-500 text-white">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Bolão Card Component - Simplified and cleaned with live updates
interface BolaoCardProps {
  bolao: ReturnType<typeof generateLotofacilBoloes>[0];
  onViewGames: (bolao: ReturnType<typeof generateLotofacilBoloes>[0]) => void;
  onParticipate: (bolao: ReturnType<typeof generateLotofacilBoloes>[0]) => void;
  onAddToCart?: (bolao: ReturnType<typeof generateLotofacilBoloes>[0], quantidade: number) => void;
  onBuyNow?: (bolao: ReturnType<typeof generateLotofacilBoloes>[0], quantidade: number) => void;
  isRecentlyUpdated?: boolean;
  liveData?: { premioEstimado?: string; dataSorteio?: string } | null;
}

const BolaoCard = ({ bolao, onViewGames, onParticipate, onAddToCart, onBuyNow, isRecentlyUpdated, liveData }: BolaoCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  // Quantity state for cart
  const [quantidade, setQuantidade] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Check if bolão is available (not closed and has cotas)
  const isBolaoAvailable = bolao.status !== "Encerrado" && bolao.fillPercentage < 100;
  
  // Use live data if available
  const displayPrize = liveData?.premioEstimado || bolao.prizeValue;
  const [animatePrize, setAnimatePrize] = useState(false);
  
  // Animate when prize changes
  useEffect(() => {
    if (liveData?.premioEstimado && liveData.premioEstimado !== bolao.prizeValue) {
      setAnimatePrize(true);
      const timer = setTimeout(() => setAnimatePrize(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [liveData?.premioEstimado, bolao.prizeValue]);
  
  const handleAddToCart = async () => {
    if (!onAddToCart || !isBolaoAvailable) return;
    setIsAddingToCart(true);
    try {
      await onAddToCart(bolao, quantidade);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleBuyNow = () => {
    if (!onBuyNow || !isBolaoAvailable) return;
    onBuyNow(bolao, quantidade);
  };
  
  return (
    <Card className={`relative p-5 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-bolao-card-border hover:border-violet-500/50 transition-all duration-300 card-hover group overflow-hidden`}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {/* Código & Concurso - Discrete display (Task 108) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-muted-foreground/70">
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Row: Badges + View Games Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 font-semibold">
              {bolao.dezenas} dezenas
            </Badge>
            {/* Teimosinha Badge */}
            {bolao.teimosinha?.enabled && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-semibold flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                {bolao.teimosinha.mode === "ate_ganhar" 
                  ? "Até Ganhar" 
                  : `${bolao.teimosinha.concursos}x`}
              </Badge>
            )}
          </div>
          <Badge 
            className={`font-semibold ${
              bolao.status === "Quase Completo" 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {bolao.status}
          </Badge>
        </div>

        {/* IMPROVED: View Games Button - More Prominent (Task 102) */}
        <div className="mb-3">
          <ViewGamesButton 
            onClick={() => onViewGames(bolao)} 
            colorScheme="violet"
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-4">
          <CountdownTimer endDate={endDate} />
        </div>

        {/* SIMPLIFIED: Only show essential counters (Task 103) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <JogosCounter 
            jogosGerados={bolao.jogosGerados} 
            colorScheme="violet"
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme="violet"
            variant="compact"
          />
        </div>

        {/* FIXED: Clear summary text (Tasks 104 & 105) */}
        <div className="mb-4 px-3 py-2 rounded-lg text-center text-sm bg-violet-500/5 border border-violet-500/20">
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className="font-bold text-violet-300">
              {bolao.numeroBoloes} {bolao.numeroBoloes === 1 ? "jogo" : "jogos"} de loteria
            </span>
            {" "}com{" "}
            <span className="font-bold text-violet-300">
              {bolao.dezenas} dezenas
            </span>
            {" "}cada
          </span>
        </div>

        {/* Prize Value - Primary Visual Hierarchy with animation */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-600/20 border border-violet-500/30">
            <Trophy className="w-6 h-6 text-violet-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Prêmio Estimado</p>
            <p className={`text-2xl sm:text-3xl font-extrabold text-violet-300 leading-tight flex items-center gap-2 transition-all duration-500 ${animatePrize ? "scale-110 text-bolao-green" : ""}`}>
              <span className="text-lg">🏆</span>
              {displayPrize}
            </p>
          </div>
        </div>

        {/* Bolão Value */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Valor do Bolão:</span>
          <span className="text-lg font-bold text-white">{bolao.bolaoValue}</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Preenchimento</span>
            <span className="font-semibold text-violet-300">{bolao.fillPercentage}%</span>
          </div>
          <div className="h-2 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-bolao-dark/50">
              <CircleDot className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Sorteio</p>
              <p className="font-medium">{bolao.sorteioDate} às {bolao.sorteioTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-bolao-dark/50">
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Encerra</p>
              <p className="font-medium">{bolao.encerraDate} às {bolao.encerraTime}</p>
            </div>
          </div>
        </div>

        {/* Min Participation - Highlighted in Orange */}
        <div className="pt-4 border-t border-bolao-card-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30">
                {bolao.minParticipation}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Qtd. Cotas:</span>
          <div className="flex items-center gap-1 bg-bolao-dark/50 rounded-lg border border-bolao-card-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              disabled={!isBolaoAvailable || quantidade <= 1}
              className="h-8 w-8 p-0 hover:bg-violet-500/20 rounded-l-lg"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-bold text-white">{quantidade}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(quantidade + 1)}
              disabled={!isBolaoAvailable}
              className="h-8 w-8 p-0 hover:bg-violet-500/20 rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cart & Buy Buttons */}
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={handleAddToCart}
            disabled={!isBolaoAvailable || isAddingToCart}
            variant="outline"
            className="flex-1 border-violet-500/50 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adicionando..." : "Carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow}
            disabled={!isBolaoAvailable}
            className="flex-1 bg-bolao-green hover:bg-bolao-green-dark text-white font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Comprar
          </Button>
        </div>
        
        {/* Disabled state message */}
        {!isBolaoAvailable && (
          <p className="text-xs text-center text-red-400 mt-2">
            {bolao.fillPercentage >= 100 ? "Bolão esgotado" : "Bolão encerrado"}
          </p>
        )}
      </div>
    </Card>
  );
};

// Independência Special Card Component - Simplified
interface IndependenciaCardProps {
  bolao: typeof independenciaBoloes[0];
  onViewGames: (bolao: typeof independenciaBoloes[0]) => void;
  onParticipate: (bolao: typeof independenciaBoloes[0]) => void;
  onAddToCart?: (bolao: typeof independenciaBoloes[0], quantidade: number) => void;
  onBuyNow?: (bolao: typeof independenciaBoloes[0], quantidade: number) => void;
}

const IndependenciaCard = ({ bolao, onViewGames, onParticipate, onAddToCart, onBuyNow }: IndependenciaCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  // Quantity state for cart
  const [quantidade, setQuantidade] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Check if bolão is available (not closed and has cotas)
  const isBolaoAvailable = bolao.status !== "Encerrado" && bolao.fillPercentage < 100;
  
  const handleAddToCart = async () => {
    if (!onAddToCart || !isBolaoAvailable) return;
    setIsAddingToCart(true);
    try {
      await onAddToCart(bolao, quantidade);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleBuyNow = () => {
    if (!onBuyNow || !isBolaoAvailable) return;
    onBuyNow(bolao, quantidade);
  };
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-bolao-card/90 to-bolao-card/60 border-2 border-emerald-500/60 hover:border-emerald-400 transition-all duration-300 card-hover group">
      {/* Special Banner - Green and Yellow for Brazil */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-yellow-500 to-emerald-600 py-2.5 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-yellow-400/20 to-emerald-500/30 animate-pulse" />
        <div className="relative flex items-center justify-center gap-2">
          <Flag className="w-4 h-4 text-white animate-bounce" style={{ animationDuration: '1.2s' }} />
          <span className="font-extrabold text-white text-sm tracking-wide drop-shadow-md">LOTOFÁCIL DA INDEPENDÊNCIA 🇧🇷</span>
          <Flag className="w-4 h-4 text-white animate-bounce" style={{ animationDuration: '1.2s', animationDelay: '0.3s' }} />
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 p-5">
        {/* Código & Concurso - Discrete display (Task 108) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-emerald-300/60">
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold">
            {bolao.dezenas} dezenas
          </Badge>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-emerald-500/30 to-yellow-500/30 text-yellow-200 border-yellow-500/50 font-bold animate-pulse">
              🏆 ESPECIAL
            </Badge>
            <Badge 
              className={`font-semibold ${
                bolao.status === "Quase Completo" 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {bolao.status}
            </Badge>
          </div>
        </div>

        {/* IMPROVED: View Games Button - More Prominent (Task 102) */}
        <div className="mb-3">
          <ViewGamesButton 
            onClick={() => onViewGames(bolao)} 
            colorScheme="emerald"
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-4">
          <CountdownTimer endDate={endDate} />
        </div>

        {/* SIMPLIFIED: Only show essential counters (Task 103) */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <JogosCounter
            jogosGerados={bolao.jogosGerados} 
            colorScheme="emerald"
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme="emerald"
            variant="compact"
          />
        </div>

        {/* FIXED: Clear summary text (Tasks 104 & 105) */}
        <div className="mb-4 px-3 py-2 rounded-lg text-center text-sm bg-emerald-500/5 border border-emerald-500/20">
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className="font-bold text-emerald-300">
              {bolao.numeroBoloes} jogos de loteria
            </span>
            {" "}com{" "}
            <span className="font-bold text-emerald-300">
              {bolao.dezenas} dezenas
            </span>
            {" "}cada
          </span>
        </div>

        {/* Prize Value - Primary Visual Hierarchy */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-yellow-500/20 border border-emerald-500/30">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-200/70 mb-0.5">Prêmio Estimado</p>
            <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-300 via-yellow-300 to-emerald-300 bg-clip-text text-transparent leading-tight flex items-center gap-2">
              <span className="text-lg">🏆</span>
              {bolao.prizeValueFull}
            </p>
          </div>
        </div>

        {/* Bolão Value */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Valor do Bolão:</span>
          <span className="text-lg font-bold text-white">{bolao.bolaoValue}</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Preenchimento</span>
            <span className="font-semibold text-emerald-300">{bolao.fillPercentage}%</span>
          </div>
          <div className="h-2.5 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-yellow-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-emerald-500/20 border border-emerald-500/30">
              <CircleDot className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Sorteio</p>
              <p className="font-semibold text-emerald-200">{bolao.sorteioDate} às {bolao.sorteioTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-yellow-500/20 border border-yellow-500/30">
              <Clock className="w-3 h-3 text-yellow-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Encerra</p>
              <p className="font-medium">{bolao.encerraDate} às {bolao.encerraTime}</p>
            </div>
          </div>
        </div>

        {/* Min Participation - Highlighted in Orange */}
        <div className="pt-4 border-t border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <span className="text-xl font-extrabold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30">
              {bolao.minParticipation}
            </span>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Qtd. Cotas:</span>
          <div className="flex items-center gap-1 bg-bolao-dark/50 rounded-lg border border-emerald-500/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              disabled={!isBolaoAvailable || quantidade <= 1}
              className="h-8 w-8 p-0 hover:bg-emerald-500/20 rounded-l-lg"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-bold text-white">{quantidade}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(quantidade + 1)}
              disabled={!isBolaoAvailable}
              className="h-8 w-8 p-0 hover:bg-emerald-500/20 rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cart & Buy Buttons */}
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={handleAddToCart}
            disabled={!isBolaoAvailable || isAddingToCart}
            variant="outline"
            className="flex-1 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adicionando..." : "Carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow}
            disabled={!isBolaoAvailable}
            className="flex-1 bg-gradient-to-r from-emerald-600 via-yellow-500 to-emerald-600 hover:from-emerald-500 hover:via-yellow-400 hover:to-emerald-500 text-bolao-dark font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            🇧🇷 Comprar
          </Button>
        </div>
        
        {/* Disabled state message */}
        {!isBolaoAvailable && (
          <p className="text-xs text-center text-red-400 mt-2">
            {bolao.fillPercentage >= 100 ? "Bolão esgotado" : "Bolão encerrado"}
          </p>
        )}
      </div>
    </Card>
  );
};

// Custom Dropdown Component
interface DropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const Dropdown = ({ label, options, value, onChange }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-bolao-card border border-bolao-card-border rounded-lg text-sm font-medium hover:border-violet-500/50 transition-colors min-w-[160px] justify-between"
      >
        <span className="truncate">{value || label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full bg-bolao-card border border-bolao-card-border rounded-lg shadow-xl z-20 py-1 max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-violet-500/20 transition-colors ${
                  value === option ? "text-violet-400 bg-violet-500/10" : "text-muted-foreground"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function Lotofacil() {
  const [selectedDezenas, setSelectedDezenas] = useState<number | null>(null);
  const [valueFilter, setValueFilter] = useState("Todos os valores");
  const [availabilityFilter, setAvailabilityFilter] = useState("Toda disponibilidade");
  const [sortBy, setSortBy] = useState("Menos disponível");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBolao, setSelectedBolao] = useState<{
    dezenas: number;
    jogosGerados: number;
    prizeValue: string;
    numeroBoloes?: number;
  } | null>(null);
  
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  
  // Auth modal hook for unauthenticated users
  const authModal = useAuthRequiredModal();
  
  // Live updates hook
  const { 
    getLiveData, 
    wasRecentlyUpdated, 
    lastPolled 
  } = useLiveBolaoUpdates({ pollingInterval: 30000 });
  
  const boloes = useMemo(() => generateLotofacilBoloes(), []);
  
  const dezenasOptions = [16, 17, 18, 19, 20];
  const valueOptions = ["Todos os valores", "Até R$ 3.000", "R$ 3.000 - R$ 5.000", "Acima de R$ 5.000"];
  const availabilityOptions = ["Toda disponibilidade", "Aberto", "Quase Completo"];
  const sortOptions = ["Menos disponível", "Mais disponível", "Maior prêmio", "Menor participação"];

  // Filter bolões
  const filteredBoloes = boloes.filter((bolao) => {
    if (selectedDezenas && bolao.dezenas !== selectedDezenas) return false;
    if (availabilityFilter !== "Toda disponibilidade" && bolao.status !== availabilityFilter) return false;
    return true;
  });

  const handleViewGames = (bolao: { dezenas: number; jogosGerados: number; prizeValue: string; numeroBoloes?: number }) => {
    setSelectedBolao(bolao);
    setModalOpen(true);
  };

  const handleParticipate = (bolao: {
    id: string | number;
    codigoBolao?: string;
    numeroConcurso?: string;
    dezenas: number;
    prizeValue: string;
    bolaoValue: string;
    sorteioDate: string;
    minParticipation: string;
    isSpecial?: boolean;
  }) => {
    // Create pending bolão data for navigation
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao || `Lotofácil ${bolao.dezenas}d`,
      type: "Lotofácil",
      dezenas: bolao.dezenas,
      prizeValue: bolao.prizeValue,
      bolaoValue: parseBolaoValue(bolao.bolaoValue),
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseMinParticipation(bolao.minParticipation),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isSpecial,
    };
    
    if (isLoggedIn) {
      // User is authenticated, go directly to checkout
      setLocation(buildCheckoutUrl(pendingBolao));
    } else {
      // Show auth modal for unauthenticated users
      authModal.openModal(pendingBolao);
    }
  };

  // Handler for adding to cart
  const handleAddToCart = async (bolao: {
    id: string | number;
    codigoBolao?: string;
    dezenas: number;
  }, quantidade: number) => {
    if (!isLoggedIn) {
      // Show auth modal for unauthenticated users
      authModal.openModal({
        id: bolao.id.toString(),
        name: bolao.codigoBolao || `Lotofácil ${bolao.dezenas}d`,
        type: "Lotofácil",
        dezenas: bolao.dezenas,
        prizeValue: "",
        bolaoValue: 0,
        sorteioDate: "",
        minParticipation: 0,
      });
      return;
    }

    try {
      const data = await adicionarAoCarrinho(bolao.id.toString(), quantidade);
      
      if (data.success) {
        // Show success feedback (could use a toast library)
        alert(`✅ ${quantidade} cota(s) adicionada(s) ao carrinho!`);
      } else {
        alert(`❌ ${data.error || "Erro ao adicionar ao carrinho"}`);
      }
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("❌ Erro de conexão. Tente novamente.");
    }
  };

  // Handler for buy now (go directly to checkout)
  const handleBuyNow = (bolao: {
    id: string | number;
    codigoBolao?: string;
    numeroConcurso?: string;
    dezenas: number;
    prizeValue: string;
    bolaoValue: string;
    sorteioDate: string;
    minParticipation: string;
    isSpecial?: boolean;
  }, quantidade: number) => {
    // Create pending bolão data for navigation
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao || `Lotofácil ${bolao.dezenas}d`,
      type: "Lotofácil",
      dezenas: bolao.dezenas,
      prizeValue: bolao.prizeValue,
      bolaoValue: parseBolaoValue(bolao.bolaoValue),
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseMinParticipation(bolao.minParticipation),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isSpecial,
      quantidade, // Pass the quantity to checkout
    };
    
    if (isLoggedIn) {
      // User is authenticated, go directly to checkout with quantity
      setLocation(buildCheckoutUrl(pendingBolao) + `&quantidade=${quantidade}`);
    } else {
      // Show auth modal for unauthenticated users
      authModal.openModal(pendingBolao);
    }
  };

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Bolões Lotofácil"
        description="Participe dos melhores bolões da Lotofácil. Sorteios diários com prêmios milionários. Lotofácil da Independência disponível!"
        keywords={["bolão lotofácil", "lotofácil online", "lotofácil da independência", "dezenas lotofácil", "apostas lotofácil"]}
        pageType="lottery"
        lotteryType="Lotofácil"
        canonicalUrl="https://bolaomax.com.br/lotofacil"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bolões Lotofácil", url: "/lotofacil" }
        ]}
      />
      <Header activePage="lotofacil" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800">
              <Clover className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Bolões Lotofácil</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[60px]">
            Sorteios diários • 25 números, 15 dezenas
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Dezenas Filter */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Filtrar por dezenas:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDezenas === null ? "default" : "outline"}
                onClick={() => setSelectedDezenas(null)}
                className={`${
                  selectedDezenas === null 
                    ? "bg-violet-600 hover:bg-violet-500 text-white" 
                    : "border-bolao-card-border hover:border-violet-500/50"
                }`}
              >
                Todas
              </Button>
              {dezenasOptions.map((dezena) => (
                <Button
                  key={dezena}
                  variant={selectedDezenas === dezena ? "default" : "outline"}
                  onClick={() => setSelectedDezenas(dezena)}
                  className={`${
                    selectedDezenas === dezena 
                      ? "bg-violet-600 hover:bg-violet-500 text-white" 
                      : "border-bolao-card-border hover:border-violet-500/50"
                  }`}
                >
                  {dezena}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-3">
            <Dropdown
              label="Todos os valores"
              options={valueOptions}
              value={valueFilter}
              onChange={setValueFilter}
            />
            <Dropdown
              label="Toda disponibilidade"
              options={availabilityOptions}
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
            />
            <Dropdown
              label="Ordenar por"
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-white">{filteredBoloes.length + 3}</span> bolões encontrados
          </p>
        </div>

        {/* Independência Special Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-600 to-yellow-500">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-300">Lotofácil da Independência 2025</h2>
              <p className="text-sm text-emerald-200/60">O maior prêmio da Lotofácil do ano! 🇧🇷</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {independenciaBoloes.map((bolao) => (
              <IndependenciaCard 
                key={bolao.id} 
                bolao={bolao} 
                onViewGames={handleViewGames} 
                onParticipate={handleParticipate}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-bolao-card-border to-transparent" />
          <span className="text-sm text-muted-foreground font-medium">Bolões Regulares</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-bolao-card-border to-transparent" />
        </div>

        {/* Bolões Grid with live updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoloes.map((bolao) => (
            <BolaoCard 
              key={bolao.id} 
              bolao={bolao} 
              onViewGames={handleViewGames} 
              onParticipate={handleParticipate}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isRecentlyUpdated={wasRecentlyUpdated(bolao.id.toString())}
              liveData={getLiveData(bolao.id.toString())}
            />
          ))}
        </div>
        
        {/* Last polled indicator */}
        {lastPolled && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-bolao-card/80 backdrop-blur-sm px-3 py-2 rounded-full border border-bolao-card-border">
            <RefreshCw className="w-3 h-3" />
            Última atualização: {new Date(lastPolled).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </main>

      {/* Games Modal */}
      <GamesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bolao={selectedBolao}
        lotteryType="Lotofácil"
      />

      {/* Auth Required Modal */}
      {authModal.ModalComponent}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}
