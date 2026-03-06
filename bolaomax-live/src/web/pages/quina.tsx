import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
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
  Flame,
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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bolao-dark" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Bolão<span className="text-bolao-green">Max</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/lotofacil" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Lotofácil
            </Link>
            <Link href="/megasena" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Mega-Sena
            </Link>
            <Link href="/quina" className="text-sm font-semibold text-sky-400">
              Quina
            </Link>
            <Link href="/como-funciona" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Como Funciona
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
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
              <Link href="/lotofacil" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Lotofácil
              </Link>
              <Link href="/megasena" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Mega-Sena
              </Link>
              <Link href="/quina" className="px-4 py-2 text-sm font-semibold text-sky-400 bg-sky-500/10 rounded-lg">
                Quina
              </Link>
              <Link href="/como-funciona" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Como Funciona
              </Link>
              <div className="flex gap-2 mt-2 px-4">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Entrar</Button>
                </Link>
                <Link href="/cadastro" className="flex-1">
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

// São João Special Bolões - with realistic financial calculations
// Quina: R$ 2.50 per game
const saoJoaoBoloes = [
  {
    id: "sj-1",
    codigoBolao: "BOL-0301",
    numeroConcurso: "6530",
    dezenas: 8,
    status: "Quase Completo",
    fillPercentage: 90,
    prizeValue: "R$ 5 Milhões",
    prizeValueFull: "R$ 5 Milhões",
    bolaoValue: "R$ 1.250", // 500 jogos × R$ 2.50 = R$ 1.250
    jogosGerados: 500,
    numeroBoloes: 2, // 2 jogos de loteria neste card
    minParticipation: "R$ 12", // ~1% do valor
    sorteioDate: "24/06",
    sorteioTime: "20:00",
    encerraDate: "24/06",
    encerraTime: "18:00",
    isSpecial: true,
  },
  {
    id: "sj-2",
    codigoBolao: "BOL-0302",
    numeroConcurso: "6530",
    dezenas: 12,
    status: "Aberto",
    fillPercentage: 50,
    prizeValue: "R$ 7 Milhões",
    prizeValueFull: "R$ 7 Milhões",
    bolaoValue: "R$ 2.000", // 800 jogos × R$ 2.50 = R$ 2.000
    jogosGerados: 800,
    numeroBoloes: 2, // 2 jogos de loteria neste card
    minParticipation: "R$ 20", // ~1% do valor
    sorteioDate: "24/06",
    sorteioTime: "20:00",
    encerraDate: "24/06",
    encerraTime: "17:00",
    isSpecial: true,
  },
  {
    id: "sj-3",
    codigoBolao: "BOL-0303",
    numeroConcurso: "6530",
    dezenas: 15,
    status: "Aberto",
    fillPercentage: 25,
    prizeValue: "R$ 10 Milhões",
    prizeValueFull: "R$ 10 Milhões",
    bolaoValue: "R$ 3.000", // 1200 jogos × R$ 2.50 = R$ 3.000
    jogosGerados: 1200,
    numeroBoloes: 3, // 3 jogos de loteria neste card
    minParticipation: "R$ 30", // ~1% do valor
    sorteioDate: "24/06",
    sorteioTime: "20:00",
    encerraDate: "24/06",
    encerraTime: "16:00",
    isSpecial: true,
  },
];

// Generate mock bolão data for Quina with realistic financial calculations
// Quina: R$ 2.50 per game
const generateQuinaBoloes = () => {
  const boloes = [];
  const dezenaOptions = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const prizeRanges = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0]; // Prêmios em milhões
  
  // Base concurso number for Quina (realistic)
  const baseConcurso = 6520;
  
  for (let i = 1; i <= 24; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * dezenaOptions.length)];
    const status = Math.random() > 0.6 ? "Quase Completo" : "Aberto";
    const fillPercentage = status === "Quase Completo" 
      ? Math.floor(Math.random() * 20) + 80 
      : Math.floor(Math.random() * 50) + 30;
    
    // Prêmio estimado
    const prizeValueNum = prizeRanges[Math.floor(Math.random() * prizeRanges.length)];
    
    // Jogos: mais dezenas = mais jogos (40-150 jogos)
    const baseJogos = 40 + (dezenas - 6) * 10;
    const jogosGerados = baseJogos + Math.floor(Math.random() * 40);
    
    // Valor do bolão = jogos * R$ 2.50
    const bolaoValue = jogosGerados * CUSTO_POR_JOGO.quina;
    
    // Participação mínima
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    // numeroBoloes: number of lottery tickets in this card (1-3)
    const numeroBoloes = jogosGerados > 100 ? 3 : jogosGerados > 60 ? 2 : 1;
    
    // Generate random dates
    const today = new Date();
    const sorteioDate = new Date(today);
    sorteioDate.setDate(today.getDate() + Math.floor(Math.random() * 5) + 1);
    const encerraDate = new Date(sorteioDate);
    encerraDate.setHours(sorteioDate.getHours() - Math.floor(Math.random() * 12 + 2));

    // Randomly assign teimosinha to some bolões (about 30% chance)
    const hasTeimosinha = Math.random() > 0.7;
    const teimosinha = hasTeimosinha ? {
      enabled: true,
      mode: Math.random() > 0.5 ? "fixo" as const : "ate_ganhar" as const,
      concursos: Math.random() > 0.5 ? 2 : Math.random() > 0.5 ? 4 : 6
    } : undefined;

    // Generate codigoBolao and numeroConcurso
    const codigoBolao = `BOL-${String(300 + i).padStart(4, "0")}`;
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
      sorteioTime: "20:00",
      encerraDate: encerraDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      encerraTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${Math.random() > 0.5 ? "00" : "30"}`,
      isSpecial: false,
      teimosinha,
    });
  }
  
  return boloes;
};

// Generate random game numbers for Quina (80 numbers, select 5-15 dezenas)
const generateQuinaGameNumbers = (dezenas: number) => {
  const numbers: number[] = [];
  while (numbers.length < dezenas) {
    const num = Math.floor(Math.random() * 80) + 1;
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
    generateQuinaGameNumbers(bolao.dezenas)
  );
  
  const totalNumbers = 80; // Quina has 80 numbers
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-bolao-card border-bolao-card-border text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-sky-500/20">
              <Star className="w-5 h-5 text-sky-400 fill-sky-400" />
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
        <div className="bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-sky-500/15 border border-sky-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-200 mb-1">
                📊 Estrutura deste Card
              </p>
              <p className="text-sm text-sky-100/80">
                Este card contém <strong className="text-sky-300">{numGames} {numGames === 1 ? "jogo" : "jogos"} de loteria</strong> diferentes, 
                cada um com <strong className="text-sky-300">{bolao.dezenas} dezenas</strong> selecionadas.
              </p>
              <p className="text-xs text-sky-200/60 mt-2">
                💡 Cada jogo utiliza estratégias diferentes para maximizar as chances de ganho.
              </p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-sky-200">
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
                  ? "bg-sky-600 hover:bg-sky-500 text-white" 
                  : "border-bolao-card-border hover:border-sky-500/50"
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
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105" 
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
              <span key={num} className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded-full text-sm font-bold border border-sky-500/30">
                {String(num).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="bg-sky-600 hover:bg-sky-500 text-white">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Bolão Card Component - Simplified and cleaned
interface BolaoCardProps {
  bolao: ReturnType<typeof generateQuinaBoloes>[0];
  onViewGames: (bolao: ReturnType<typeof generateQuinaBoloes>[0]) => void;
  onParticipate: (bolao: ReturnType<typeof generateQuinaBoloes>[0]) => void;
}

const BolaoCard = ({ bolao, onViewGames, onParticipate }: BolaoCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  return (
    <Card className="relative p-5 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-bolao-card-border hover:border-sky-500/50 transition-all duration-300 card-hover group overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {/* Código & Concurso - Discrete display (Task 108) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-muted-foreground/70">
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 font-semibold">
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
            colorScheme="sky"
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
            colorScheme="sky"
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme="sky"
            variant="compact"
          />
        </div>

        {/* FIXED: Clear summary text (Tasks 104 & 105) */}
        <div className="mb-4 px-3 py-2 rounded-lg text-center text-sm bg-sky-500/5 border border-sky-500/20">
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className="font-bold text-sky-300">
              {bolao.numeroBoloes} {bolao.numeroBoloes === 1 ? "jogo" : "jogos"} de loteria
            </span>
            {" "}com{" "}
            <span className="font-bold text-sky-300">
              {bolao.dezenas} dezenas
            </span>
            {" "}cada
          </span>
        </div>

        {/* Prize Value - Primary Visual Hierarchy */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/30 to-sky-600/20 border border-sky-500/30">
            <Trophy className="w-6 h-6 text-sky-300" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Prêmio Estimado</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-sky-300 leading-tight flex items-center gap-2">
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
            <span className="font-semibold text-sky-300">{bolao.fillPercentage}%</span>
          </div>
          <div className="h-2 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-500"
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

        {/* CTA Button */}
        <Button 
          onClick={() => onParticipate(bolao)}
          className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold gap-2"
        >
          Participar Agora
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

// São João Special Card Component - Simplified
interface SaoJoaoCardProps {
  bolao: typeof saoJoaoBoloes[0];
  onViewGames: (bolao: typeof saoJoaoBoloes[0]) => void;
  onParticipate: (bolao: typeof saoJoaoBoloes[0]) => void;
}

const SaoJoaoCard = ({ bolao, onViewGames, onParticipate }: SaoJoaoCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-bolao-card/90 to-bolao-card/60 border-2 border-orange-500/60 hover:border-orange-400 transition-all duration-300 card-hover group">
      {/* Special Banner */}
      <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-2.5 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 animate-pulse" />
        <div className="relative flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce" style={{ animationDuration: '1s' }} />
          <span className="font-extrabold text-white text-sm tracking-wide">QUINA DE SÃO JOÃO 🔥</span>
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 p-5">
        {/* Código & Concurso - Discrete display (Task 108) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-orange-300/60">
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold">
            {bolao.dezenas} dezenas
          </Badge>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-red-500/30 to-orange-500/30 text-orange-200 border-orange-500/50 font-bold animate-pulse">
              ✨ ESPECIAL
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
            colorScheme="orange"
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
            colorScheme="orange"
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme="orange"
            variant="compact"
          />
        </div>

        {/* FIXED: Clear summary text (Tasks 104 & 105) */}
        <div className="mb-4 px-3 py-2 rounded-lg text-center text-sm bg-orange-500/5 border border-orange-500/20">
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className="font-bold text-orange-300">
              {bolao.numeroBoloes} jogos de loteria
            </span>
            {" "}com{" "}
            <span className="font-bold text-orange-300">
              {bolao.dezenas} dezenas
            </span>
            {" "}cada
          </span>
        </div>

        {/* Prize Value - Primary Visual Hierarchy */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 border border-orange-500/30">
            <Trophy className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-orange-200/70 mb-0.5">Prêmio Estimado</p>
            <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent leading-tight flex items-center gap-2">
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
            <span className="font-semibold text-orange-300">{bolao.fillPercentage}%</span>
          </div>
          <div className="h-2.5 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-red-500/20 border border-red-500/30">
              <CircleDot className="w-3 h-3 text-orange-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Sorteio</p>
              <p className="font-semibold text-orange-200">{bolao.sorteioDate} às {bolao.sorteioTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/30">
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Encerra</p>
              <p className="font-medium">{bolao.encerraDate} às {bolao.encerraTime}</p>
            </div>
          </div>
        </div>

        {/* Min Participation - Highlighted in Orange */}
        <div className="pt-4 border-t border-orange-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <span className="text-xl font-extrabold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/30">
              {bolao.minParticipation}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => onParticipate(bolao)}
          className="w-full mt-4 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 hover:from-red-500 hover:via-orange-400 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all gap-2"
        >
          🔥 Participar do São João
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
        className="flex items-center gap-2 px-4 py-2.5 bg-bolao-card border border-bolao-card-border rounded-lg text-sm font-medium hover:border-sky-500/50 transition-colors min-w-[160px] justify-between"
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
                className={`w-full px-4 py-2 text-sm text-left hover:bg-sky-500/20 transition-colors ${
                  value === option ? "text-sky-400 bg-sky-500/10" : "text-muted-foreground"
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

export default function Quina() {
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
  
  const boloes = generateQuinaBoloes();
  
  const dezenasOptions = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const valueOptions = ["Todos os valores", "Até R$ 200", "R$ 200 - R$ 400", "Acima de R$ 400"];
  const availabilityOptions = ["Toda disponibilidade", "Aberto", "Quase Completo"];
  const sortOptions = ["Menos disponível", "Mais disponível", "Maior prêmio", "Menor participação"];

  const handleViewGames = (bolao: { dezenas: number; jogosGerados: number; prizeValue: string; numeroBoloes?: number }) => {
    setSelectedBolao(bolao);
    setModalOpen(true);
  };

  const handleParticipate = (bolao: {
    id: number | string;
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
      name: bolao.codigoBolao || `Quina ${bolao.dezenas}d`,
      type: "Quina",
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

  // Filter bolões
  const filteredBoloes = boloes.filter((bolao) => {
    if (selectedDezenas && bolao.dezenas !== selectedDezenas) return false;
    if (availabilityFilter !== "Toda disponibilidade" && bolao.status !== availabilityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Bolões Quina"
        description="Participe dos bolões da Quina com sorteios diários. Quina de São João com prêmios especiais disponível!"
        keywords={["bolão quina", "quina online", "quina de são joão", "apostas quina", "sorteio quina"]}
        pageType="lottery"
        lotteryType="Quina"
        canonicalUrl="https://bolaomax.com.br/quina"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bolões Quina", url: "/quina" }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-600 to-sky-800">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Bolões Quina</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[60px]">
            Sorteios diários • 80 números, 5 dezenas
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
                    ? "bg-sky-600 hover:bg-sky-500 text-white" 
                    : "border-bolao-card-border hover:border-sky-500/50"
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
                      ? "bg-sky-600 hover:bg-sky-500 text-white" 
                      : "border-bolao-card-border hover:border-sky-500/50"
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

        {/* São João Special Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-orange-500">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-300">Quina de São João 2025</h2>
              <p className="text-sm text-orange-200/60">O maior prêmio da Quina do ano! 🔥</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saoJoaoBoloes.map((bolao) => (
              <SaoJoaoCard 
                key={bolao.id} 
                bolao={bolao} 
                onViewGames={handleViewGames}
                onParticipate={handleParticipate}
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

        {/* Bolões Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBoloes.map((bolao) => (
            <BolaoCard 
              key={bolao.id} 
              bolao={bolao} 
              onViewGames={handleViewGames}
              onParticipate={handleParticipate}
            />
          ))}
        </div>
      </main>

      {/* Games Modal */}
      <GamesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bolao={selectedBolao}
        lotteryType="Quina"
      />

      {/* Auth Required Modal */}
      {authModal.ModalComponent}

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}
