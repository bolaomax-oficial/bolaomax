import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { CountdownTimer } from "@/components/CountdownTimer";
import { JogosCounter } from "@/components/JogosCounter";
import { BoloesCounter } from "@/components/BoloesCounter";
import { ViewGamesButton } from "@/components/ViewGamesButton";
import { CUSTO_POR_JOGO, formatPrize, formatCurrency, calculateMinParticipation } from "@/utils/bolaoCalculations";
import { handleBolaoParticipation, PendingBolao, parseBolaoValue, parseMinParticipation, buildCheckoutUrl } from "@/utils/bolaoNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthRequiredModal } from "@/components/AuthRequiredModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Trophy,
  Clock,
  Menu,
  X,
  ChevronDown,
  CircleDot,
  Star,
  ArrowRight,
  Repeat,
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

// Header Component
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bolao-dark/95 backdrop-blur-xl border-b border-bolao-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bolao-dark" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Bolão<span className="text-bolao-green">Max</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/lotofacil" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Lotofácil
            </Link>
            <Link to="/dupla-sena" className="text-sm font-semibold text-purple-400">
              Dupla Sena
            </Link>
            <Link to="/quina" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Quina
            </Link>
            <Link to="/como-funciona" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Como Funciona
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold px-5">
                Criar Conta
              </Button>
            </Link>
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
              <Link to="/lotofacil" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Lotofácil
              </Link>
              <Link to="/dupla-sena" className="px-4 py-2 text-sm font-semibold text-purple-400 bg-purple-400/10 rounded-lg">
                Dupla Sena
              </Link>
              <Link to="/quina" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Quina
              </Link>
              <Link to="/como-funciona" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Como Funciona
              </Link>
              <div className="flex gap-2 mt-2 px-4">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Entrar</Button>
                </Link>
                <Link to="/cadastro" className="flex-1">
                  <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Generate mock bolão data for Dupla Sena with realistic financial calculations
// Dupla Sena: R$ 5.00 per game
const generateMegaSenaBoloes = () => {
  const boloes = [];
  const dezenaOptions = [50]; // Dupla Sena sempre 50 dezenas
  const prizeRanges = [45, 55, 72, 85, 95, 120, 150, 180, 210, 250, 300]; // Prêmios em milhões
  
  // Base concurso number for Dupla Sena (realistic)
  const baseConcurso = 2850;
  
  // Add 3 special Dupla Sena da Independência bolões
  for (let i = 1; i <= 3; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * dezenaOptions.length)];
    const fillPercentage = Math.floor(Math.random() * 30) + 60;
    const prizeValue = 550; // Dupla Sena da Independência sempre ~550M
    
    // Jogos: 800-1500 para Dupla Sena da Independência
    const jogosGerados = 800 + Math.floor(Math.random() * 700);
    
    // Valor do bolão = jogos * R$ 5.00
    const bolaoValue = jogosGerados * CUSTO_POR_JOGO.dupla-sena;
    
    // Participação mínima
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    // numeroBoloes: number of lottery tickets in this card
    const numeroBoloes = 3;
    
    // Dupla Sena da Independência has teimosinha by default (special)
    const teimosinha = {
      enabled: true,
      mode: "fixo" as const,
      concursos: 1
    };

    // Generate codigoBolao and numeroConcurso for special Virada
    const codigoBolao = `LTM-${String(200 + i).padStart(4, "0")}`;
    const numeroConcurso = "2650"; // Virada concurso

    boloes.push({
      id: i,
      codigoBolao,
      numeroConcurso,
      dezenas,
      status: "Quase Completo",
      fillPercentage,
      prizeValue: formatPrize(prizeValue),
      bolaoValue: formatCurrency(bolaoValue),
      jogosGerados,
      numeroBoloes,
      minParticipation: formatCurrency(minParticipation),
      sorteioDate: "31/12",
      sorteioTime: "20:00",
      encerraDate: "31/12",
      encerraTime: "14:00",
      isVirada: true,
      teimosinha,
    });
  }
  
  // Add regular bolões
  for (let i = 4; i <= 23; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * dezenaOptions.length)];
    const status = Math.random() > 0.6 ? "Quase Completo" : "Aberto";
    const fillPercentage = status === "Quase Completo" 
      ? Math.floor(Math.random() * 20) + 80 
      : Math.floor(Math.random() * 50) + 30;
    
    // Prêmio estimado
    const prizeValueNum = prizeRanges[Math.floor(Math.random() * prizeRanges.length)];
    
    // Jogos gerados: 100-500
    const jogosGerados = 100 + Math.floor(Math.random() * 400);
    
    // Valor do bolão = jogos * R$ 5.00
    const bolaoValue = jogosGerados * CUSTO_POR_JOGO.dupla-sena;
    
    // Participação mínima
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    // numeroBoloes: number of lottery tickets in this card (1-3)
    const numeroBoloes = jogosGerados > 400 ? 3 : jogosGerados > 250 ? 2 : 1;
    
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
    const codigoBolao = `LTM-${String(200 + i).padStart(4, "0")}`;
    const numeroConcurso = String(baseConcurso + Math.floor((i - 3) / 3));

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
      isVirada: false,
      teimosinha,
    });
  }
  
  return boloes;
};

// Generate random game numbers for Dupla Sena (60 numbers, select 6-20 dezenas)
const generateMegaSenaGameNumbers = (dezenas: number) => {
  const numbers: number[] = [];
  while (numbers.length < dezenas) {
    const num = Math.floor(Math.random() * 60) + 1;
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
    generateMegaSenaGameNumbers(bolao.dezenas)
  );
  
  const totalNumbers = 60; // Dupla Sena has 60 numbers
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-bolao-card border-bolao-card-border text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-purple-400/20">
              <Star className="w-5 h-5 text-purple-400" />
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
        <div className="bg-gradient-to-r from-purple-400/15 via-green-500/10 to-purple-400/15 border border-purple-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-400/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pink-200 mb-1">
                📊 Estrutura deste Card
              </p>
              <p className="text-sm text-pink-100/80">
                Este card contém <strong className="text-pink-300">{numGames} {numGames === 1 ? "jogo" : "jogos"} de loteria</strong> diferentes, 
                cada um com <strong className="text-pink-300">{bolao.dezenas} dezenas</strong> selecionadas.
              </p>
              <p className="text-xs text-pink-200/60 mt-2">
                💡 Cada jogo utiliza estratégias diferentes para maximizar as chances de ganho.
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-pink-200">
            <strong>Prêmio Estimado:</strong> {bolao.prizeValue} • <strong>Estratégia:</strong> Balanceada
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {games.map((_, index) => (
            <Button
              key={index}
              variant={activeTab === index ? "default" : "outline"}
              onClick={() => setActiveTab(index)}
              className={`flex-1 ${
                activeTab === index 
                  ? "bg-purple-600 hover:bg-purple-500 text-white" 
                  : "border-bolao-card-border hover:border-purple-400/50"
              }`}
            >
              Jogo {index + 1}
            </Button>
          ))}
        </div>
        
        {/* Number Grid */}
        <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
              const isSelected = games[activeTab].includes(num);
              return (
                <div
                  key={num}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    isSelected 
                      ? "bg-purple-400 text-white shadow-lg shadow-purple-400/30 scale-105" 
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
              <span key={num} className="px-3 py-1 bg-purple-400/20 text-pink-300 rounded-full text-sm font-bold border border-purple-400/30">
                {String(num).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-500 text-white">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Bolão Card Component - Simplified and cleaned
interface BolaoCardProps {
  bolao: ReturnType<typeof generateMegaSenaBoloes>[0];
  onViewGames: (bolao: ReturnType<typeof generateMegaSenaBoloes>[0]) => void;
  onParticipate: (bolao: ReturnType<typeof generateMegaSenaBoloes>[0]) => void;
}

const BolaoCard = ({ bolao, onViewGames, onParticipate }: BolaoCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  return (
    <Card className={`relative p-5 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-bolao-card-border transition-all duration-300 card-hover group overflow-hidden ${
      bolao.isVirada ? "border-2 border-purple-500/70 hover:border-purple-400" : "hover:border-purple-400/50"
    }`}>
      {/* Virada special badge */}
      {bolao.isVirada && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            DUPLA SENA DA INDEPENDÊNCIA
          </div>
        </div>
      )}
      
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
        bolao.isVirada ? "from-purple-500/10 to-transparent" : "from-purple-400/5 to-transparent"
      }`} />
      
      <div className="relative z-10">
        {/* Código & Concurso - Discrete display (Task 108) */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono ${bolao.isVirada ? "text-orange-300/60" : "text-muted-foreground/70"}`}>
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`font-semibold ${
              bolao.isVirada 
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                : "bg-purple-400/20 text-pink-300 border-purple-400/30"
            }`}>
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
                : "bg-purple-400/20 text-pink-300 border-purple-400/30"
            }`}
          >
            {bolao.status}
          </Badge>
        </div>

        {/* IMPROVED: View Games Button - More Prominent (Task 102) */}
        <div className="mb-3">
          <ViewGamesButton 
            onClick={() => onViewGames(bolao)} 
            colorScheme={bolao.isVirada ? "orange" : "pink"}
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
            colorScheme={bolao.isVirada ? "orange" : "pink"}
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme={bolao.isVirada ? "orange" : "pink"}
            variant="compact"
          />
        </div>

        {/* FIXED: Clear summary text (Tasks 104 & 105) */}
        <div className={`mb-4 px-3 py-2 rounded-lg text-center text-sm ${
          bolao.isVirada 
            ? "bg-orange-500/5 border border-orange-500/20" 
            : "bg-purple-400/5 border border-purple-400/20"
        }`}>
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className={`font-bold ${bolao.isVirada ? "text-orange-300" : "text-pink-300"}`}>
              {bolao.numeroBoloes} {bolao.numeroBoloes === 1 ? "jogo" : "jogos"} de loteria
            </span>
            {" "}com{" "}
            <span className={`font-bold ${bolao.isVirada ? "text-orange-300" : "text-pink-300"}`}>
              {bolao.dezenas} dezenas
            </span>
            {" "}cada
          </span>
        </div>

        {/* Prize Value - Primary Visual Hierarchy */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl border ${bolao.isVirada ? "bg-gradient-to-br from-orange-500/30 to-amber-600/20 border-orange-500/30" : "bg-gradient-to-br from-purple-400/30 to-pink-600/20 border-purple-400/30"}`}>
            <Trophy className={`w-6 h-6 ${bolao.isVirada ? "text-orange-300" : "text-pink-300"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Prêmio Estimado</p>
            <p className={`text-2xl sm:text-3xl font-extrabold leading-tight flex items-center gap-2 ${bolao.isVirada ? "text-orange-300" : "text-pink-300"}`}>
              <span className="text-lg">🏆</span>
              {bolao.prizeValue}
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
            <span className={`font-semibold ${bolao.isVirada ? "text-orange-300" : "text-pink-300"}`}>
              {bolao.fillPercentage}%
            </span>
          </div>
          <div className="h-2 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                bolao.isVirada 
                  ? "bg-gradient-to-r from-orange-600 to-amber-400" 
                  : "bg-gradient-to-r from-pink-600 to-purple-400"
              }`}
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-bolao-dark/50">
              <CircleDot className="w-3 h-3 text-purple-400" />
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

        {/* CTA Button */}
        <Button 
          onClick={() => onParticipate(bolao)}
          className={`w-full mt-4 font-semibold gap-2 ${
          bolao.isVirada 
            ? "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white" 
            : "bg-purple-600 hover:bg-purple-500 text-white"
        }`}>
          Participar Agora
          <ArrowRight className="w-4 h-4" />
        </Button>
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
        className="flex items-center gap-2 px-4 py-2.5 bg-bolao-card border border-bolao-card-border rounded-lg text-sm font-medium hover:border-purple-400/50 transition-colors min-w-[160px] justify-between"
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
                className={`w-full px-4 py-2 text-sm text-left hover:bg-purple-400/20 transition-colors ${
                  value === option ? "text-purple-400 bg-purple-400/10" : "text-muted-foreground"
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

// Virada Banner Component
const ViradaBanner = () => {
  const scrollToVirada = () => {
    const viradaCards = document.querySelectorAll('[data-virada="true"]');
    if (viradaCards.length > 0) {
      viradaCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-500/20 to-orange-600/20 border border-orange-500/30 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-amber-500/10 animate-pulse" />
      
      {/* Sparkles */}
      <div className="absolute top-2 right-[10%] w-2 h-2 bg-amber-400 rounded-full animate-float opacity-60" />
      <div className="absolute bottom-4 right-[20%] w-1.5 h-1.5 bg-orange-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
      <div className="absolute top-4 right-[30%] w-1 h-1 bg-amber-300 rounded-full animate-float opacity-50" style={{ animationDelay: "0.5s" }} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 animate-pulse-glow">
            <Star className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Dupla Sena da Independência 2026</h2>
              <Badge className="bg-orange-500 text-white border-0 text-xs">
                ESPECIAL
              </Badge>
            </div>
            <p className="text-orange-200/80 text-sm md:text-base">
              Os maiores prêmios do ano! <span className="font-semibold text-orange-200">3 bolões disponíveis</span>
            </p>
          </div>
        </div>
        
        <Button 
          onClick={scrollToVirada}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold px-6 whitespace-nowrap"
        >
          Ver bolões da Virada
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default function DuplaSena() {
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
  
  const boloes = generateMegaSenaBoloes();
  
  const dezenasOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const valueOptions = ["Todos os valores", "Até R$ 5.000", "R$ 5.000 - R$ 10.000", "Acima de R$ 10.000"];
  const availabilityOptions = ["Toda disponibilidade", "Aberto", "Quase Completo"];
  const sortOptions = ["Menos disponível", "Mais disponível", "Maior prêmio", "Menor participação"];

  const handleViewGames = (bolao: { dezenas: number; jogosGerados: number; prizeValue: string; numeroBoloes?: number }) => {
    setSelectedBolao(bolao);
    setModalOpen(true);
  };

  const handleParticipate = (bolao: {
    id: number;
    codigoBolao?: string;
    numeroConcurso?: string;
    dezenas: number;
    prizeValue: string;
    bolaoValue: string;
    sorteioDate: string;
    minParticipation: string;
    isVirada?: boolean;
  }) => {
    // Create pending bolão data for navigation
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao || `Dupla Sena ${bolao.dezenas}d`,
      type: "Dupla Sena",
      dezenas: bolao.dezenas,
      prizeValue: bolao.prizeValue,
      bolaoValue: parseBolaoValue(bolao.bolaoValue),
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseMinParticipation(bolao.minParticipation),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isVirada,
    };
    
    if (isLoggedIn) {
      // User is authenticated, go directly to checkout
      setLocation(buildCheckoutUrl(pendingBolao));
    } else {
      // Show auth modal for unauthenticated users
      authModal.openModal(pendingBolao);
    }
  };

  // Filter bolões
  const filteredBoloes = boloes.filter((bolao) => {
    if (selectedDezenas && bolao.dezenas !== selectedDezenas) return false;
    if (availabilityFilter !== "Toda disponibilidade" && bolao.status !== availabilityFilter) return false;
    return true;
  });

  // Separate virada and regular bolões
  const viradaBoloes = filteredBoloes.filter(b => b.isVirada);
  const regularBoloes = filteredBoloes.filter(b => !b.isVirada);

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Bolões Dupla Sena"
        description="Bolões da Dupla Sena com os maiores prêmios do Brasil. Dupla Sena da Independência disponível! Participe com cotas acessíveis."
        keywords={["bolão dupla-sena", "dupla sena online", "dupla sena independência", "apostas dupla sena", "sorteio dupla"]}
        pageType="lottery"
        lotteryType="Dupla Sena"
        canonicalUrl="https://bolaomax.com.br/dupla-sena"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bolões Dupla Sena", url: "/dupla-sena" }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Virada Banner */}
        <ViradaBanner />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Bolões Dupla Sena</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[60px]">
            Sorteios às terças, quintas e sábados • 50 números, 6 dezenas • Dupla chance de ganhar!
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
                    ? "bg-purple-600 hover:bg-purple-500 text-white" 
                    : "border-bolao-card-border hover:border-purple-400/50"
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
                      ? "bg-purple-600 hover:bg-purple-500 text-white" 
                      : "border-bolao-card-border hover:border-purple-400/50"
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
            <span className="font-semibold text-white">{filteredBoloes.length}</span> bolões encontrados
          </p>
        </div>

        {/* Virada Bolões Section */}
        {viradaBoloes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              Dupla Sena da Independência
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viradaBoloes.map((bolao) => (
                <div key={bolao.id} data-virada="true">
                  <BolaoCard 
                    bolao={bolao} 
                    onViewGames={handleViewGames}
                    onParticipate={handleParticipate}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Bolões Grid */}
        {regularBoloes.length > 0 && (
          <>
            {viradaBoloes.length > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-bolao-card-border to-transparent" />
                <span className="text-sm text-muted-foreground font-medium">Bolões Regulares</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-bolao-card-border to-transparent" />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBoloes.map((bolao) => (
                <BolaoCard 
                  key={bolao.id} 
                  bolao={bolao} 
                  onViewGames={handleViewGames}
                  onParticipate={handleParticipate}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Games Modal */}
      <GamesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bolao={selectedBolao}
        lotteryType="Dupla Sena"
      />

      {/* Auth Required Modal */}
      {authModal.ModalComponent}

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer activePage="dupla-sena" />
    </div>
  );
}
