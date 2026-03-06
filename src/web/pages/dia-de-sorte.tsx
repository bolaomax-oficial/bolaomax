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
import { TermometroAgressividade, calcularNivelAgressividade } from "@/components/TermometroAgressividade";
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
  ShoppingCart,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import { adicionarAoCarrinho } from "@/services/carrinhoService";

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
            <Link to="/dia-de-sorte" className="text-sm font-semibold text-yellow-400">
              Dia de Sorte
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
              <Link to="/dia-de-sorte" className="px-4 py-2 text-sm font-semibold text-yellow-400 bg-yellow-400/10 rounded-lg">
                Dia de Sorte
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

// Meses da Sorte
const MESES_DA_SORTE = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Valores de aposta por quantidade de dezenas (oficial Caixa)
const VALORES_APOSTA_DIA_DE_SORTE: Record<number, number> = {
  7: 2.50,
  8: 20.00,
  9: 60.00,
  10: 150.00,
  11: 330.00,
  12: 660.00,
  13: 1215.00,
  14: 2100.00,
  15: 3432.50,
};

// Gera números aleatórios para Dia de Sorte (1-31)
const generateDiaDeSorteNumbers = (quantidade: number): number[] => {
  const numbers: number[] = [];
  while (numbers.length < quantidade) {
    const num = Math.floor(Math.random() * 31) + 1; // 1 a 31
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

// Gera mês da sorte aleatório
const generateMesDaSorte = (): { id: number; nome: string } => {
  const id = Math.floor(Math.random() * 12);
  return { id, nome: MESES_DA_SORTE[id] };
};

// Generate mock bolão data for Dia de Sorte com regras corretas
const generateDiaDeSorteBoloes = () => {
  const boloes = [];
  const dezenaOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15]; // 7 a 15 dezenas
  const prizeRanges = [800000, 1200000, 1500000, 2000000, 2500000, 3000000]; // Prêmios em reais
  
  // Base concurso number
  const baseConcurso = 980;
  
  // Add 2 special bolões (Dia de Sorte de São João)
  for (let i = 1; i <= 2; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * 3) + 3]; // 10-12 dezenas para especiais
    const fillPercentage = Math.floor(Math.random() * 25) + 70;
    const prizeValue = 15000000; // R$ 15 milhões para especial
    
    // 1-3 jogos por card
    const numeroBoloes = Math.floor(Math.random() * 3) + 1;
    
    // Valor do bolão baseado na quantidade de dezenas
    const valorPorJogo = VALORES_APOSTA_DIA_DE_SORTE[dezenas] || 2.50;
    const bolaoValue = numeroBoloes * valorPorJogo;
    
    // Mês da sorte
    const mesDaSorte = generateMesDaSorte();
    
    // Gerar jogos
    const jogos = Array.from({ length: numeroBoloes }, () => ({
      numeros: generateDiaDeSorteNumbers(dezenas),
      mesDaSorte: mesDaSorte
    }));
    
    // Participação mínima
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    const teimosinha = {
      enabled: true,
      mode: "fixo" as const,
      concursos: 2
    };

    const codigoBolao = `DS-${String(100 + i).padStart(4, "0")}`;
    const numeroConcurso = "1000"; // Concurso especial

    boloes.push({
      id: i,
      codigoBolao,
      numeroConcurso,
      dezenas,
      status: "Quase Completo",
      fillPercentage,
      prizeValue: formatPrize(prizeValue / 1000000),
      bolaoValue: formatCurrency(bolaoValue),
      jogosGerados: numeroBoloes,
      numeroBoloes,
      jogos,
      mesDaSorte,
      minParticipation: formatCurrency(minParticipation),
      sorteioDate: "24/06",
      sorteioTime: "20:00",
      encerraDate: "24/06",
      encerraTime: "14:00",
      isEspecial: true,
      teimosinha,
    });
  }
  
  // Add regular bolões
  for (let i = 3; i <= 18; i++) {
    const dezenas = dezenaOptions[Math.floor(Math.random() * dezenaOptions.length)];
    const status = Math.random() > 0.6 ? "Quase Completo" : "Aberto";
    const fillPercentage = status === "Quase Completo" 
      ? Math.floor(Math.random() * 20) + 75 
      : Math.floor(Math.random() * 45) + 25;
    
    // Prêmio estimado
    const prizeValueNum = prizeRanges[Math.floor(Math.random() * prizeRanges.length)];
    
    // 1-3 jogos por card
    const numeroBoloes = Math.floor(Math.random() * 3) + 1;
    
    // Valor do bolão baseado na quantidade de dezenas
    const valorPorJogo = VALORES_APOSTA_DIA_DE_SORTE[dezenas] || 2.50;
    const bolaoValue = numeroBoloes * valorPorJogo;
    
    // Mês da sorte (mesmo para todos os jogos do card)
    const mesDaSorte = generateMesDaSorte();
    
    // Gerar jogos
    const jogos = Array.from({ length: numeroBoloes }, () => ({
      numeros: generateDiaDeSorteNumbers(dezenas),
      mesDaSorte: mesDaSorte
    }));
    
    // Participação mínima
    const minParticipation = calculateMinParticipation(bolaoValue);
    
    // Generate random dates
    const today = new Date();
    const sorteioDate = new Date(today);
    sorteioDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
    const encerraDate = new Date(sorteioDate);
    encerraDate.setHours(sorteioDate.getHours() - Math.floor(Math.random() * 6 + 2));

    // Teimosinha (30% chance)
    const hasTeimosinha = Math.random() > 0.7;
    const teimosinha = hasTeimosinha ? {
      enabled: true,
      mode: Math.random() > 0.5 ? "fixo" as const : "ate_ganhar" as const,
      concursos: Math.random() > 0.5 ? 3 : 5
    } : undefined;

    const codigoBolao = `DS-${String(100 + i).padStart(4, "0")}`;
    const numeroConcurso = String(baseConcurso + Math.floor((i - 2) / 2));

    boloes.push({
      id: i,
      codigoBolao,
      numeroConcurso,
      dezenas,
      status,
      fillPercentage,
      prizeValue: formatPrize(prizeValueNum / 1000000),
      bolaoValue: formatCurrency(bolaoValue),
      jogosGerados: numeroBoloes,
      numeroBoloes,
      jogos,
      mesDaSorte,
      minParticipation: formatCurrency(minParticipation),
      sorteioDate: sorteioDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      sorteioTime: "20:00",
      encerraDate: encerraDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      encerraTime: `${String(Math.floor(Math.random() * 12 + 8)).padStart(2, "0")}:00`,
      isEspecial: false,
      teimosinha,
    });
  }
  
  return boloes;
};

// Games Modal Component for Dia de Sorte
interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bolao: ReturnType<typeof generateDiaDeSorteBoloes>[0] | null;
  lotteryType: string;
}

const GamesModal = ({ isOpen, onClose, bolao, lotteryType }: GamesModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!bolao) return null;
  
  const numGames = bolao.numeroBoloes || 1;
  const jogos = bolao.jogos || [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-bolao-card border-yellow-500/30 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <span className="text-white">Jogos do Bolão - {lotteryType}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {bolao.dezenas} dezenas • {numGames} {numGames === 1 ? "jogo" : "jogos"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Card Summary */}
        <div className="bg-gradient-to-r from-yellow-500/15 via-amber-500/10 to-yellow-500/15 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-yellow-200 mb-1">
                🎯 Estrutura deste Card
              </p>
              <p className="text-sm text-yellow-100/80">
                Este card contém <strong className="text-yellow-300">{numGames} {numGames === 1 ? "jogo" : "jogos"}</strong> com{" "}
                <strong className="text-yellow-300">{bolao.dezenas} dezenas</strong> cada (números de 1 a 31).
              </p>
              <p className="text-xs text-yellow-200/60 mt-2">
                🗓️ Mês da Sorte: <strong className="text-yellow-300">{bolao.mesDaSorte?.nome}</strong>
              </p>
            </div>
          </div>
        </div>
        
        {/* Mês da Sorte Badge */}
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 mb-4 flex items-center justify-center gap-3">
          <span className="text-2xl">📅</span>
          <div className="text-center">
            <p className="text-xs text-amber-200/80 uppercase tracking-wide">Mês da Sorte</p>
            <p className="text-xl font-bold text-amber-300">{bolao.mesDaSorte?.nome}</p>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-200">
            <strong>Prêmio Estimado:</strong> {bolao.prizeValue} • <strong>Estratégia:</strong> Cobertura Otimizada
          </p>
        </div>
        
        {/* Tabs for multiple games */}
        {numGames > 1 && (
          <div className="flex gap-2 mb-4">
            {jogos.map((_, index) => (
              <Button
                key={index}
                variant={activeTab === index ? "default" : "outline"}
                onClick={() => setActiveTab(index)}
                className={`flex-1 ${
                  activeTab === index 
                    ? "bg-yellow-500 hover:bg-yellow-400 text-bolao-dark font-bold" 
                    : "border-yellow-500/30 text-yellow-300 hover:border-yellow-400/50 hover:bg-yellow-500/10"
                }`}
              >
                Jogo {index + 1}
              </Button>
            ))}
          </div>
        )}
        
        {/* Number Grid - 1 a 31 (Dia de Sorte) */}
        <div className="bg-bolao-dark/50 rounded-xl p-4 border border-yellow-500/20">
          <p className="text-xs text-muted-foreground mb-3 text-center">Números de 1 a 31 (dias do mês)</p>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
              const isSelected = jogos[activeTab]?.numeros?.includes(num);
              return (
                <div
                  key={num}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    isSelected 
                      ? "bg-yellow-400 text-bolao-dark shadow-lg shadow-yellow-400/40 scale-110 ring-2 ring-yellow-300" 
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
        <div className="mt-4 p-3 bg-bolao-dark/30 rounded-lg border border-yellow-500/20">
          <p className="text-sm text-muted-foreground mb-2">
            Dezenas selecionadas {numGames > 1 ? `no Jogo ${activeTab + 1}` : ""}:
          </p>
          <div className="flex flex-wrap gap-2">
            {jogos[activeTab]?.numeros?.map((num: number) => (
              <span key={num} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-500/30">
                {String(num).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="bg-yellow-500 hover:bg-yellow-400 text-bolao-dark font-bold">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Bolão Card Component - Dia de Sorte (Amarelo)
interface BolaoCardProps {
  bolao: ReturnType<typeof generateDiaDeSorteBoloes>[0];
  onViewGames: (bolao: ReturnType<typeof generateDiaDeSorteBoloes>[0]) => void;
  onParticipate: (bolao: ReturnType<typeof generateDiaDeSorteBoloes>[0]) => void;
}

const BolaoCard = ({ bolao, onViewGames, onParticipate }: BolaoCardProps) => {
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  const [quantidade, setQuantidade] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [, setLocation] = useLocation();
  
  const isBolaoAvailable = bolao.fillPercentage < 100 && new Date() < endDate;
  
  const handleAddToCart = async () => {
    if (!isBolaoAvailable) return;
    setIsAddingToCart(true);
    try {
      await adicionarAoCarrinho(bolao.id.toString(), quantidade);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleBuyNow = () => {
    if (!isBolaoAvailable) return;
    adicionarAoCarrinho(bolao.id.toString(), quantidade);
    setLocation("/checkout");
  };
  
  return (
    <Card className={`relative p-5 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 transition-all duration-300 card-hover group overflow-hidden ${
      bolao.isEspecial 
        ? "border-2 border-amber-500/70 hover:border-amber-400 shadow-lg shadow-amber-500/20" 
        : "border-2 border-yellow-500/50 hover:border-yellow-400/80 shadow-md shadow-yellow-500/15"
    }`}>
      {/* Especial badge */}
      {bolao.isEspecial && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-bolao-dark text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg">
            <Star className="w-3 h-3 fill-current" />
            DIA DE SORTE ESPECIAL
          </div>
        </div>
      )}
      
      {/* Glow effect on hover - apenas nas bordas */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
        <div className={`absolute inset-0 rounded-lg ${
          bolao.isEspecial 
            ? "shadow-[inset_0_0_20px_rgba(251,191,36,0.3)]" 
            : "shadow-[inset_0_0_15px_rgba(234,179,8,0.25)]"
        }`}></div>
      </div>
      
      <div className="relative z-10">
        {/* Código & Concurso */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono ${bolao.isEspecial ? "text-amber-300/60" : "text-yellow-300/60"}`}>
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 font-semibold">
              {bolao.dezenas} dezenas
            </Badge>
            {/* Mês da Sorte Badge */}
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold flex items-center gap-1">
              📅 {bolao.mesDaSorte?.nome}
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
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30" 
                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
            }`}
          >
            {bolao.status}
          </Badge>
        </div>

        {/* View Games Button */}
        <div className="mb-3">
          <ViewGamesButton 
            onClick={() => onViewGames(bolao)} 
            colorScheme="yellow"
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-4">
          <CountdownTimer endDate={endDate} />
        </div>

        {/* Jogos Counter */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <JogosCounter 
            jogosGerados={bolao.numeroBoloes} 
            colorScheme="yellow"
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme="yellow"
            variant="compact"
          />
        </div>

        {/* Termômetro de Agressividade */}
        <div className="mb-3">
          <TermometroAgressividade 
            nivel={calcularNivelAgressividade(bolao.numeroBoloes, bolao.dezenas, "dia-de-sorte")}
            colorScheme="yellow"
          />
        </div>

        {/* Card Summary */}
        <div className={`mb-4 px-3 py-2 rounded-lg text-center text-sm ${
          bolao.isEspecial 
            ? "bg-amber-500/10 border border-amber-500/30" 
            : "bg-yellow-500/10 border border-yellow-500/20"
        }`}>
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className="font-bold text-yellow-300">
              {bolao.numeroBoloes} {bolao.numeroBoloes === 1 ? "jogo" : "jogos"}
            </span>
            {" "}com{" "}
            <span className="font-bold text-yellow-300">
              {bolao.dezenas} dezenas
            </span>
            {" "}(1-31)
          </span>
        </div>

        {/* Prize Value */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl border bg-gradient-to-br from-yellow-500/30 to-amber-600/20 border-yellow-500/30">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Prêmio Estimado</p>
            <p className="text-2xl sm:text-3xl font-extrabold leading-tight flex items-center gap-2 text-yellow-400">
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
            <span className="font-semibold text-yellow-400">
              {bolao.fillPercentage}%
            </span>
          </div>
          <div className="h-2 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-yellow-400"
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-yellow-500/20">
              <CircleDot className="w-3 h-3 text-yellow-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Sorteio</p>
              <p className="font-medium text-yellow-200">{bolao.sorteioDate} às {bolao.sorteioTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-amber-500/20">
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div>
              <p className="text-muted-foreground">Encerra</p>
              <p className="font-medium text-amber-200">{bolao.encerraDate} às {bolao.encerraTime}</p>
            </div>
          </div>
        </div>

        {/* Min Participation */}
        <div className="pt-4 border-t border-yellow-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">A partir de</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-yellow-400 bg-yellow-500/15 px-3 py-1 rounded-lg border border-yellow-500/30">
                {bolao.minParticipation}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground">Qtd. Cotas:</span>
          <div className="flex items-center gap-1 bg-bolao-dark/50 rounded-lg border border-yellow-500/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              disabled={!isBolaoAvailable || quantidade <= 1}
              className="h-8 w-8 p-0 rounded-l-lg hover:bg-yellow-500/20"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-bold text-white">{quantidade}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(quantidade + 1)}
              disabled={!isBolaoAvailable}
              className="h-8 w-8 p-0 rounded-r-lg hover:bg-yellow-500/20"
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
            className="flex-1 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adicionando..." : "Carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow}
            disabled={!isBolaoAvailable}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-bolao-dark font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="flex items-center gap-2 px-4 py-2.5 bg-bolao-card border border-bolao-card-border rounded-lg text-sm font-medium hover:border-yellow-400/50 transition-colors min-w-[160px] justify-between"
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
                className={`w-full px-4 py-2 text-sm text-left hover:bg-yellow-400/20 transition-colors ${
                  value === option ? "text-yellow-400 bg-yellow-400/10" : "text-muted-foreground"
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
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-amber-500/10 animate-pulse" />
      
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
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Dia de Sorte da Independência 2026</h2>
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
          Ver bolões especiais
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default function DiaDeSorte() {
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
  
  const boloes = generateDiaDeSorteBoloes();
  
  const dezenasOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15];
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
    isEspecial?: boolean;
  }) => {
    // Create pending bolão data for navigation
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao || `Dia de Sorte ${bolao.dezenas}d`,
      type: "Dia de Sorte",
      dezenas: bolao.dezenas,
      prizeValue: bolao.prizeValue,
      bolaoValue: parseBolaoValue(bolao.bolaoValue),
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseMinParticipation(bolao.minParticipation),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isEspecial,
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

  // Separate especial and regular bolões
  const especialBoloes = filteredBoloes.filter(b => b.isEspecial);
  const regularBoloes = filteredBoloes.filter(b => !b.isEspecial);

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Bolões Dia de Sorte"
        description="Bolões da Dia de Sorte com os maiores prêmios do Brasil. Dia de Sorte da Independência disponível! Participe com cotas acessíveis."
        keywords={["bolão dia de sorte", "dia de sorte online", "mês da sorte", "apostas dia de sorte", "sorteio dia"]}
        pageType="lottery"
        lotteryType="Dia de Sorte"
        canonicalUrl="https://bolaomax.com.br/dia-de-sorte"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bolões Dia de Sorte", url: "/dia-de-sorte" }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Virada Banner */}
        <ViradaBanner />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Bolões Dia de Sorte</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[60px]">
            Sorteios às terças, quintas e sábados • 31 números, 7 dezenas • Escolha seu Mês da Sorte!
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
                    ? "bg-yellow-500 hover:bg-yellow-400 text-bolao-dark" 
                    : "border-bolao-card-border hover:border-yellow-400/50"
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
                      ? "bg-yellow-500 hover:bg-yellow-400 text-bolao-dark" 
                      : "border-bolao-card-border hover:border-yellow-400/50"
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

        {/* Especial Bolões Section */}
        {especialBoloes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              Dia de Sorte da Independência
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {especialBoloes.map((bolao) => (
                <div key={bolao.id} data-especial="true">
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
            {especialBoloes.length > 0 && (
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
        lotteryType="Dia de Sorte"
      />

      {/* Auth Required Modal */}
      {authModal.ModalComponent}

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer activePage="dia-de-sorte" />
    </div>
  );
}
