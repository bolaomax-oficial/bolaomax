/**
 * ============================================================
 * PÁGINA TIMEMANIA - BOLÃOMAX
 * ============================================================
 * 
 * Página de listagem de bolões da Timemania com integração
 * completa às regras de MODALIDADE e COMERCIAIS.
 * ============================================================
 */

import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adicionarAoCarrinho } from "@/services/carrinhoService";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/Footer";
import { CountdownTimer } from "@/components/CountdownTimer";
import { JogosCounter } from "@/components/JogosCounter";
import { BoloesCounter } from "@/components/BoloesCounter";
import { ViewGamesButton } from "@/components/ViewGamesButton";
import { calcularNivelAgressividade } from "@/components/TermometroAgressividade";
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
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  Repeat,
  Shield,
  Users,
  Heart,
  Flame,
  Info,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

// ============================================================
// CONSTANTES - REGRAS DA MODALIDADE TIMEMANIA
// ============================================================

const REGRAS_MODALIDADE = {
  nomeModalidade: "Timemania",
  slugModalidade: "timemania",
  numerosPorAposta: 10,
  universoNumerosMin: 1,
  universoNumerosMax: 80,
  timeDoCoracaoObrigatorio: true,
  valorApostaBase: 3.50,
  apostasPorBolaoMax: 15,
  diasSorteio: ["terça", "quinta", "sábado"],
  horarioSorteioBRT: "21:00",
} as const;

// ============================================================
// CONSTANTES - REGRAS COMERCIAIS BOLÃOMAX
// ============================================================

const REGRAS_COMERCIAIS = {
  cotaMinimaComercial: 20.00,
  cotaMaximaComercial: 500.00,
  totalCotasMinimo: 10,
  totalCotasMaximo: 100,
  quantidadeMaximaJogosPorCard: 3,
  taxaPlataformaPercentual: 10,
  minutosAntesParaClosing: 60,
} as const;

// ============================================================
// LISTA DE TIMES DO CORAÇÃO (SELEÇÃO PARA EXIBIÇÃO)
// ============================================================

const TIMES_DO_CORACAO = [
  { id: 23, nome: "Flamengo", uf: "RJ", escudo: "🔴⚫" },
  { id: 15, nome: "Corinthians", uf: "SP", escudo: "⚫⚪" },
  { id: 36, nome: "Palmeiras", uf: "SP", escudo: "🟢⚪" },
  { id: 45, nome: "São Paulo", uf: "SP", escudo: "🔴⚪⚫" },
  { id: 47, nome: "Vasco", uf: "RJ", escudo: "⚫⚪" },
  { id: 27, nome: "Grêmio", uf: "RS", escudo: "🔵⚫⚪" },
  { id: 29, nome: "Internacional", uf: "RS", escudo: "🔴⚪" },
  { id: 19, nome: "Cruzeiro", uf: "MG", escudo: "🔵⚪" },
  { id: 6, nome: "Atlético-MG", uf: "MG", escudo: "⚫⚪" },
  { id: 44, nome: "Santos", uf: "SP", escudo: "⚫⚪" },
  { id: 9, nome: "Botafogo", uf: "RJ", escudo: "⚫⚪" },
  { id: 24, nome: "Fluminense", uf: "RJ", escudo: "🟢🔴⚪" },
  { id: 8, nome: "Bahia", uf: "BA", escudo: "🔵🔴⚪" },
  { id: 25, nome: "Fortaleza", uf: "CE", escudo: "🔵🔴⚪" },
  { id: 4, nome: "Athletico-PR", uf: "PR", escudo: "🔴⚫" },
];

const getTimeById = (id: number) => TIMES_DO_CORACAO.find(t => t.id === id) || { id, nome: "Time", uf: "BR", escudo: "⚽" };

// ============================================================
// HELPERS
// ============================================================

const createEndDate = (dateStr: string, timeStr: string): Date => {
  const [day, month] = dateStr.split("/").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, day, hours, minutes);
  if (date < new Date()) {
    date.setFullYear(year + 1);
  }
  return date;
};

// ============================================================
// HEADER COMPONENT
// ============================================================

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bolao-dark/95 backdrop-blur-xl border-b border-bolao-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bolao-green to-bolao-green-dark flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bolao-dark" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              Bolão<span className="text-bolao-green">Max</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/megasena" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Mega-Sena
            </Link>
            <Link to="/lotofacil" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Lotofácil
            </Link>
            <Link to="/timemania" className="text-sm font-semibold text-yellow-400">
              Timemania
            </Link>
            <Link to="/quina" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Quina
            </Link>
            <Link to="/como-funciona" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
              Como Funciona
            </Link>
          </nav>

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

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-bolao-card-border">
            <nav className="flex flex-col gap-2">
              <Link to="/megasena" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Mega-Sena
              </Link>
              <Link to="/lotofacil" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bolao-card rounded-lg transition-colors">
                Lotofácil
              </Link>
              <Link to="/timemania" className="px-4 py-2 text-sm font-semibold text-yellow-400 bg-yellow-400/10 rounded-lg">
                Timemania
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

// ============================================================
// GERADOR DE BOLÕES TIMEMANIA
// ============================================================

interface BolaoTimemania {
  id: number;
  codigoBolao: string;
  numeroConcurso: string;
  status: "Ativo" | "Encerrando" | "Quase Completo";
  statusInterno: "active" | "closing" | "closed";
  fillPercentage: number;
  prizeValue: string;
  bolaoValue: string;
  jogosGerados: number;
  numeroBoloes: number;
  minParticipation: string;
  sorteioDate: string;
  sorteioTime: string;
  encerraDate: string;
  encerraTime: string;
  isEspecial: boolean;
  teimosinha?: {
    enabled: boolean;
    mode: "fixo" | "ate_ganhar";
    concursos: number;
  };
  // Campos específicos Timemania
  apostas: {
    numeros: number[];
    timeDoCoracaoId: number;
  }[];
  politica: "garantido" | "condicionado" | "hibrido";
  estrategia: string;
  termometroAgressividade: "baixa" | "media" | "alta";
  // Transparência financeira
  valorApostaBase: number;
  valorTotalJogos: number;
  taxaPlataforma: number;
  totalCotas: number;
  cotasVendidas: number;
  cotasDisponiveis: number;
}

const generateTimemaniBoloes = (): BolaoTimemania[] => {
  const boloes: BolaoTimemania[] = [];
  const prizeRanges = [8, 12, 18, 25, 35, 45, 60, 80]; // Prêmios em milhões
  const baseConcurso = 2150;
  
  // Bolão especial - Copa do Mundo de Clubes
  for (let i = 1; i <= 3; i++) {
    const quantidadeApostas = Math.min(i + 2, REGRAS_MODALIDADE.apostasPorBolaoMax);
    const valorTotalJogos = quantidadeApostas * REGRAS_MODALIDADE.valorApostaBase;
    const taxaPlataforma = valorTotalJogos * (REGRAS_COMERCIAIS.taxaPlataformaPercentual / 100);
    const valorTotalBolao = valorTotalJogos + taxaPlataforma;
    const totalCotas = 20 + (i * 10);
    const valorPorCota = valorTotalBolao / totalCotas;
    const cotasVendidas = Math.floor(totalCotas * (0.6 + Math.random() * 0.35));
    
    // Gerar apostas
    const apostas = Array.from({ length: quantidadeApostas }, () => ({
      numeros: generateRandomNumbers(10, 1, 80),
      timeDoCoracaoId: TIMES_DO_CORACAO[Math.floor(Math.random() * TIMES_DO_CORACAO.length)].id,
    }));
    
    boloes.push({
      id: i,
      codigoBolao: `TM-ESP-${String(i).padStart(3, "0")}`,
      numeroConcurso: String(baseConcurso + i),
      status: cotasVendidas / totalCotas > 0.8 ? "Quase Completo" : "Ativo",
      statusInterno: "active",
      fillPercentage: Math.round((cotasVendidas / totalCotas) * 100),
      prizeValue: formatPrize(prizeRanges[Math.floor(Math.random() * prizeRanges.length)] * 1000000),
      bolaoValue: formatCurrency(valorTotalBolao),
      jogosGerados: quantidadeApostas,
      numeroBoloes: Math.min(quantidadeApostas, 3),
      minParticipation: formatCurrency(valorPorCota),
      sorteioDate: "31/12",
      sorteioTime: "21:00",
      encerraDate: "31/12",
      encerraTime: "18:00",
      isEspecial: true,
      apostas,
      politica: "garantido",
      estrategia: "Estratégia especial Copa do Mundo de Clubes - Times brasileiros",
      termometroAgressividade: calcularNivelAgressividade(quantidadeApostas, 10, "timemania"),
      valorApostaBase: REGRAS_MODALIDADE.valorApostaBase,
      valorTotalJogos,
      taxaPlataforma,
      totalCotas,
      cotasVendidas,
      cotasDisponiveis: totalCotas - cotasVendidas,
    });
  }
  
  // Bolões regulares
  for (let i = 4; i <= 20; i++) {
    const quantidadeApostas = 1 + Math.floor(Math.random() * REGRAS_MODALIDADE.apostasPorBolaoMax);
    const valorTotalJogos = quantidadeApostas * REGRAS_MODALIDADE.valorApostaBase;
    const taxaPlataforma = valorTotalJogos * (REGRAS_COMERCIAIS.taxaPlataformaPercentual / 100);
    const valorTotalBolao = valorTotalJogos + taxaPlataforma;
    const totalCotas = REGRAS_COMERCIAIS.totalCotasMinimo + Math.floor(Math.random() * (REGRAS_COMERCIAIS.totalCotasMaximo - REGRAS_COMERCIAIS.totalCotasMinimo));
    const valorPorCota = Math.max(valorTotalBolao / totalCotas, REGRAS_COMERCIAIS.cotaMinimaComercial);
    const cotasVendidas = Math.floor(totalCotas * (0.2 + Math.random() * 0.7));
    const statusRandom = Math.random();
    
    // Gerar apostas
    const apostas = Array.from({ length: quantidadeApostas }, () => ({
      numeros: generateRandomNumbers(10, 1, 80),
      timeDoCoracaoId: TIMES_DO_CORACAO[Math.floor(Math.random() * TIMES_DO_CORACAO.length)].id,
    }));
    
    // Gerar datas
    const today = new Date();
    const sorteioDate = new Date(today);
    sorteioDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
    const encerraDate = new Date(sorteioDate);
    encerraDate.setHours(sorteioDate.getHours() - Math.floor(Math.random() * 12 + 2));
    
    // Teimosinha aleatória
    const hasTeimosinha = Math.random() > 0.7;
    const teimosinha = hasTeimosinha ? {
      enabled: true,
      mode: Math.random() > 0.4 ? "fixo" as const : "ate_ganhar" as const,
      concursos: Math.random() > 0.5 ? 3 : Math.random() > 0.5 ? 5 : 8
    } : undefined;
    
    boloes.push({
      id: i,
      codigoBolao: `TM-${String(100 + i).padStart(4, "0")}`,
      numeroConcurso: String(baseConcurso + Math.floor((i - 3) / 3)),
      status: statusRandom > 0.7 ? "Quase Completo" : statusRandom > 0.3 ? "Ativo" : "Encerrando",
      statusInterno: statusRandom > 0.3 ? "active" : "closing",
      fillPercentage: Math.round((cotasVendidas / totalCotas) * 100),
      prizeValue: formatPrize(prizeRanges[Math.floor(Math.random() * prizeRanges.length)] * 1000000),
      bolaoValue: formatCurrency(valorTotalBolao),
      jogosGerados: quantidadeApostas,
      numeroBoloes: Math.min(quantidadeApostas, 3),
      minParticipation: formatCurrency(valorPorCota),
      sorteioDate: sorteioDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      sorteioTime: "21:00",
      encerraDate: encerraDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      encerraTime: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${Math.random() > 0.5 ? "00" : "30"}`,
      isEspecial: false,
      teimosinha,
      apostas,
      politica: ["garantido", "condicionado", "hibrido"][Math.floor(Math.random() * 3)] as any,
      estrategia: [
        "Números frequentes dos últimos 50 concursos",
        "Estratégia balanceada - pares e ímpares",
        "Dezenas atrasadas + times tradicionais",
        "Análise estatística avançada",
      ][Math.floor(Math.random() * 4)],
      termometroAgressividade: calcularNivelAgressividade(quantidadeApostas, 10, "timemania"),
      valorApostaBase: REGRAS_MODALIDADE.valorApostaBase,
      valorTotalJogos,
      taxaPlataforma,
      totalCotas,
      cotasVendidas,
      cotasDisponiveis: totalCotas - cotasVendidas,
    });
  }
  
  return boloes;
};

function generateRandomNumbers(count: number, min: number, max: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

// ============================================================
// TERMÔMETRO DE AGRESSIVIDADE COMPONENT
// ============================================================

interface TermometroAgressividadeProps {
  nivel: "baixa" | "media" | "alta";
}

const TermometroAgressividade = ({ nivel }: TermometroAgressividadeProps) => {
  const config = {
    baixa: { label: "Baixa", cor: "bg-green-500", textCor: "text-green-400", width: "w-1/3" },
    media: { label: "Média", cor: "bg-yellow-500", textCor: "text-yellow-400", width: "w-2/3" },
    alta: { label: "Alta", cor: "bg-red-500", textCor: "text-red-400", width: "w-full" },
  };
  
  const c = config[nivel];
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Flame className={`w-3.5 h-3.5 ${c.textCor}`} />
        <span className={`text-xs font-medium ${c.textCor}`}>Agressividade: {c.label}</span>
      </div>
      <div className="flex-1 h-1.5 bg-bolao-dark/60 rounded-full overflow-hidden">
        <div className={`h-full ${c.cor} ${c.width} rounded-full transition-all`} />
      </div>
    </div>
  );
};

// ============================================================
// POLÍTICA BADGE COMPONENT
// ============================================================

interface PoliticaBadgeProps {
  politica: "garantido" | "condicionado" | "hibrido";
}

const PoliticaBadge = ({ politica }: PoliticaBadgeProps) => {
  const config = {
    garantido: { label: "Garantido", icon: Shield, cor: "bg-green-500/20 text-green-300 border-green-500/30" },
    condicionado: { label: "Condicionado", icon: AlertTriangle, cor: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    hibrido: { label: "Híbrido", icon: TrendingUp, cor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  };
  
  const c = config[politica];
  const Icon = c.icon;
  
  return (
    <Badge className={`${c.cor} font-medium flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
};

// ============================================================
// GAMES MODAL COMPONENT
// ============================================================

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bolao: BolaoTimemania | null;
}

const GamesModal = ({ isOpen, onClose, bolao }: GamesModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!bolao) return null;
  
  const totalNumbers = REGRAS_MODALIDADE.universoNumerosMax;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-bolao-card border-bolao-card-border text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <span className="text-white">Detalhes do Bolão - Timemania</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {bolao.apostas.length} apostas • {REGRAS_MODALIDADE.numerosPorAposta} dezenas cada
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Transparência Financeira */}
        <div className="bg-gradient-to-r from-yellow-500/10 via-green-500/5 to-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-yellow-200 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Transparência Financeira
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Valor aposta (modalidade)</p>
              <p className="font-bold text-white">{formatCurrency(bolao.valorApostaBase)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total jogos</p>
              <p className="font-bold text-white">{formatCurrency(bolao.valorTotalJogos)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Taxa BolãoMax</p>
              <p className="font-bold text-orange-300">{formatCurrency(bolao.taxaPlataforma)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Valor por cota</p>
              <p className="font-bold text-yellow-300">{bolao.minParticipation}</p>
            </div>
          </div>
        </div>
        
        {/* Info Banner */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-yellow-200">
              <strong>Prêmio Estimado:</strong> {bolao.prizeValue}
            </p>
            <PoliticaBadge politica={bolao.politica} />
          </div>
          <p className="text-xs text-yellow-200/70 mt-2">
            <strong>Estratégia:</strong> {bolao.estrategia}
          </p>
        </div>
        
        {/* Tabs para apostas */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {bolao.apostas.slice(0, 3).map((_, index) => (
            <Button
              key={index}
              variant={activeTab === index ? "default" : "outline"}
              onClick={() => setActiveTab(index)}
              className={`flex-1 min-w-[100px] ${
                activeTab === index 
                  ? "bg-yellow-600 hover:bg-yellow-500 text-white" 
                  : "border-bolao-card-border hover:border-yellow-500/50"
              }`}
            >
              Jogo {index + 1}
            </Button>
          ))}
        </div>
        
        {/* Aposta atual */}
        {bolao.apostas[activeTab] && (
          <div className="bg-bolao-dark/50 rounded-xl p-4 border border-bolao-card-border">
            {/* Time do Coração */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-xs text-muted-foreground">Time do Coração</p>
                <p className="font-bold text-white">
                  {getTimeById(bolao.apostas[activeTab].timeDoCoracaoId).escudo}{" "}
                  {getTimeById(bolao.apostas[activeTab].timeDoCoracaoId).nome} - {getTimeById(bolao.apostas[activeTab].timeDoCoracaoId).uf}
                </p>
              </div>
            </div>
            
            {/* Grid de números */}
            <p className="text-sm text-muted-foreground mb-2">Dezenas selecionadas:</p>
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
                const isSelected = bolao.apostas[activeTab].numeros.includes(num);
                return (
                  <div
                    key={num}
                    className={`aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-105" 
                        : "bg-bolao-card/50 text-muted-foreground hover:bg-bolao-card"
                    }`}
                  >
                    {String(num).padStart(2, "0")}
                  </div>
                );
              })}
            </div>
            
            {/* Resumo dos números selecionados */}
            <div className="mt-4 p-3 bg-bolao-dark/30 rounded-lg border border-bolao-card-border">
              <p className="text-sm text-muted-foreground mb-2">Dezenas do Jogo {activeTab + 1}:</p>
              <div className="flex flex-wrap gap-2">
                {bolao.apostas[activeTab].numeros.map((num) => (
                  <span key={num} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-500/30">
                    {String(num).padStart(2, "0")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Regras da divisão */}
        <div className="mt-4 p-3 bg-bolao-dark/30 rounded-lg border border-bolao-card-border">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-400" />
            Regra de Divisão do Prêmio
          </h4>
          <p className="text-xs text-muted-foreground">
            O prêmio será dividido proporcionalmente entre os participantes de acordo com a quantidade de cotas adquiridas.
            {bolao.politica === "garantido" && " Este bolão é GARANTIDO - será realizado independente do número de cotas vendidas."}
            {bolao.politica === "condicionado" && " Este bolão é CONDICIONADO - só será realizado se atingir o mínimo de cotas."}
            {bolao.politica === "hibrido" && " Este bolão é HÍBRIDO - cotas não vendidas serão assumidas pela plataforma."}
          </p>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} className="bg-yellow-600 hover:bg-yellow-500 text-white">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================
// BOLÃO CARD COMPONENT
// ============================================================

interface BolaoCardProps {
  bolao: BolaoTimemania;
  onViewGames: (bolao: BolaoTimemania) => void;
  onParticipate: (bolao: BolaoTimemania) => void;
}

const BolaoCard = ({ bolao, onViewGames, onParticipate }: BolaoCardProps) => {
  const [quantidade, setQuantidade] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const endDate = useMemo(() => createEndDate(bolao.encerraDate, bolao.encerraTime), [bolao.encerraDate, bolao.encerraTime]);
  
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const authModal = useAuthRequiredModal();
  
  // Verificar se o bolão está disponível para compra
  const isBolaoAvailable = bolao.status !== "Encerrando" && bolao.fillPercentage < 100 && bolao.cotasDisponiveis > 0;
  
  // Handler para adicionar ao carrinho
  const handleAddToCart = async () => {
    if (!isBolaoAvailable) return;
    
    setIsAddingToCart(true);
    try {
      const data = await adicionarAoCarrinho(bolao.id.toString(), quantidade);
      
      if (data.success) {
        // Show success feedback
        alert(`✅ ${quantidade} cota(s) adicionada(s) ao carrinho!`);
      } else {
        alert(`❌ ${data.error || "Erro ao adicionar ao carrinho"}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert("❌ Erro de conexão. Tente novamente.");
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handler para comprar direto
  const handleBuyNow = () => {
    if (!isBolaoAvailable) return;
    
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao,
      type: "Timemania",
      dezenas: REGRAS_MODALIDADE.numerosPorAposta,
      prizeValue: bolao.prizeValue,
      bolaoValue: bolao.valorTotalJogos + bolao.taxaPlataforma,
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseFloat(bolao.minParticipation.replace(/[^\d,]/g, '').replace(',', '.')),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isEspecial,
    };
    
    if (isLoggedIn) {
      setLocation(buildCheckoutUrl(pendingBolao));
    } else {
      authModal.openModal(pendingBolao);
    }
  };
  
  return (
    <Card className={`relative p-5 bg-gradient-to-br from-bolao-card/80 to-bolao-card/40 border-bolao-card-border transition-all duration-300 card-hover group overflow-hidden ${
      bolao.isEspecial ? "border-2 border-yellow-500/70 hover:border-yellow-400" : "hover:border-yellow-500/50"
    }`}>
      {/* Badge especial */}
      {bolao.isEspecial && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-yellow-600 to-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            COPA DO MUNDO DE CLUBES
          </div>
        </div>
      )}
      
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
        bolao.isEspecial ? "from-yellow-500/10 to-transparent" : "from-yellow-500/5 to-transparent"
      }`} />
      
      <div className="relative z-10">
        {/* Código & Concurso */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono ${bolao.isEspecial ? "text-yellow-300/60" : "text-muted-foreground/70"}`}>
            {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
          </span>
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`font-semibold ${
              bolao.isEspecial 
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
            }`}>
              {REGRAS_MODALIDADE.numerosPorAposta} dezenas
            </Badge>
            <PoliticaBadge politica={bolao.politica} />
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
                : bolao.status === "Encerrando"
                ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                : "bg-green-500/20 text-green-300 border-green-500/30"
            }`}
          >
            {bolao.status}
          </Badge>
        </div>

        {/* View Games Button */}
        <div className="mb-3">
          <ViewGamesButton 
            onClick={() => onViewGames(bolao)} 
            colorScheme={bolao.isEspecial ? "orange" : "orange"}
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-4">
          <CountdownTimer endDate={endDate} />
        </div>

        {/* Counters */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <JogosCounter 
            jogosGerados={bolao.jogosGerados} 
            colorScheme={bolao.isEspecial ? "orange" : "orange"}
            variant="compact"
          />
          <BoloesCounter 
            quantidadeBoloes={bolao.numeroBoloes} 
            colorScheme={bolao.isEspecial ? "orange" : "orange"}
            variant="compact"
          />
        </div>

        {/* Termômetro de Agressividade */}
        <div className="mb-3">
          <TermometroAgressividade nivel={bolao.termometroAgressividade} />
        </div>

        {/* Summary */}
        <div className={`mb-4 px-3 py-2 rounded-lg text-center text-sm ${
          bolao.isEspecial 
            ? "bg-yellow-500/5 border border-yellow-500/20" 
            : "bg-yellow-500/5 border border-yellow-500/20"
        }`}>
          <span className="text-muted-foreground">
            🎫 Este card inclui{" "}
            <span className={`font-bold ${bolao.isEspecial ? "text-yellow-300" : "text-yellow-300"}`}>
              {bolao.numeroBoloes} {bolao.numeroBoloes === 1 ? "jogo" : "jogos"} de loteria
            </span>
            {" "}com{" "}
            <span className={`font-bold ${bolao.isEspecial ? "text-yellow-300" : "text-yellow-300"}`}>
              {REGRAS_MODALIDADE.numerosPorAposta} dezenas
            </span>
            {" "}cada + Time do ❤️
          </span>
        </div>

        {/* Prize Value */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl border ${bolao.isEspecial ? "bg-gradient-to-br from-yellow-500/30 to-green-600/20 border-yellow-500/30" : "bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 border-yellow-500/30"}`}>
            <Trophy className={`w-6 h-6 ${bolao.isEspecial ? "text-yellow-300" : "text-yellow-300"}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">Prêmio Estimado</p>
            <p className={`text-2xl sm:text-3xl font-extrabold leading-tight flex items-center gap-2 ${bolao.isEspecial ? "text-yellow-300" : "text-yellow-300"}`}>
              <span className="text-lg">🏆</span>
              {bolao.prizeValue}
            </p>
          </div>
        </div>

        {/* Cotas info */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-bolao-dark/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Cotas vendidas</p>
            <p className="font-bold text-white">{bolao.cotasVendidas}/{bolao.totalCotas}</p>
          </div>
          <div className="bg-bolao-dark/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Disponíveis</p>
            <p className="font-bold text-green-400">{bolao.cotasDisponiveis}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Preenchimento</span>
            <span className={`font-semibold ${bolao.isEspecial ? "text-yellow-300" : "text-yellow-300"}`}>
              {bolao.fillPercentage}%
            </span>
          </div>
          <div className="h-2 bg-bolao-dark/60 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                bolao.isEspecial 
                  ? "bg-gradient-to-r from-yellow-600 to-green-400" 
                  : "bg-gradient-to-r from-yellow-600 to-yellow-400"
              }`}
              style={{ width: `${bolao.fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="p-1.5 rounded bg-bolao-dark/50">
              <CircleDot className="w-3 h-3 text-yellow-400" />
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

        {/* Min Participation */}
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
          <div className={`flex items-center gap-1 bg-bolao-dark/50 rounded-lg border ${bolao.isEspecial ? "border-yellow-500/30" : "border-yellow-500/30"}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
              disabled={!isBolaoAvailable || quantidade <= 1}
              className="h-8 w-8 p-0 hover:bg-yellow-500/20 rounded-l-lg"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-10 text-center font-bold text-white">{quantidade}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantidade(quantidade + 1)}
              disabled={!isBolaoAvailable || quantidade >= bolao.cotasDisponiveis}
              className="h-8 w-8 p-0 hover:bg-yellow-500/20 rounded-r-lg"
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
            className={`flex-1 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              bolao.isEspecial
                ? "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400"
                : "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10 hover:border-yellow-400"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAddingToCart ? "Adicionando..." : "Carrinho"}
          </Button>
          <Button 
            onClick={handleBuyNow}
            disabled={!isBolaoAvailable}
            className={`flex-1 font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              bolao.isEspecial 
                ? "bg-gradient-to-r from-yellow-600 to-green-500 hover:from-yellow-500 hover:to-green-400 text-white" 
                : "bg-bolao-green hover:bg-bolao-green-dark text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            Comprar
          </Button>
        </div>
        
        {/* Disabled state message */}
        {!isBolaoAvailable && (
          <p className="text-xs text-center text-red-400 mt-2">
            {bolao.fillPercentage >= 100 ? "Bolão esgotado" : bolao.cotasDisponiveis <= 0 ? "Sem cotas disponíveis" : "Bolão encerrado"}
          </p>
        )}

        {/* Auth Modal */}
        {authModal.ModalComponent}
      </div>
    </Card>
  );
};

// ============================================================
// DROPDOWN COMPONENT
// ============================================================

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
        className="flex items-center gap-2 px-4 py-2.5 bg-bolao-card border border-bolao-card-border rounded-lg text-sm font-medium hover:border-yellow-500/50 transition-colors min-w-[160px] justify-between"
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
                className={`w-full px-4 py-2 text-sm text-left hover:bg-yellow-500/20 transition-colors ${
                  value === option ? "text-yellow-400 bg-yellow-500/10" : "text-muted-foreground"
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

// ============================================================
// BANNER ESPECIAL COMPONENT
// ============================================================

const BannerEspecial = () => {
  const scrollToEspecial = () => {
    const especialCards = document.querySelectorAll('[data-especial="true"]');
    if (especialCards.length > 0) {
      especialCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-600/20 via-green-500/20 to-yellow-600/20 border border-yellow-500/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-green-500/10 animate-pulse" />
      
      <div className="absolute top-2 right-[10%] w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-60" />
      <div className="absolute bottom-4 right-[20%] w-1.5 h-1.5 bg-green-400 rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
      <div className="absolute top-4 right-[30%] w-1 h-1 bg-yellow-300 rounded-full animate-float opacity-50" style={{ animationDelay: "0.5s" }} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-green-500 animate-pulse-glow">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">Copa do Mundo de Clubes 2026</h2>
              <Badge className="bg-yellow-500 text-white border-0 text-xs">
                ESPECIAL
              </Badge>
            </div>
            <p className="text-yellow-200/80 text-sm md:text-base">
              Bolões especiais com times brasileiros! <span className="font-semibold text-yellow-200">3 bolões disponíveis</span>
            </p>
          </div>
        </div>
        
        <Button 
          onClick={scrollToEspecial}
          className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-400 hover:to-green-400 text-white font-bold px-6 whitespace-nowrap"
        >
          Ver bolões especiais
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

// ============================================================
// INFO REGRAS COMPONENT
// ============================================================

const InfoRegrasTimemania = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
      >
        <Info className="w-4 h-4" />
        <span>Ver regras da Timemania</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="mt-4 p-4 bg-bolao-card/50 rounded-xl border border-yellow-500/20">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Regras da Modalidade (Caixa)
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {REGRAS_MODALIDADE.numerosPorAposta} números por aposta (fixo)</li>
                <li>• Números de {REGRAS_MODALIDADE.universoNumerosMin} a {REGRAS_MODALIDADE.universoNumerosMax}</li>
                <li>• Time do Coração obrigatório</li>
                <li>• Valor base: {formatCurrency(REGRAS_MODALIDADE.valorApostaBase)}</li>
                <li>• Até {REGRAS_MODALIDADE.apostasPorBolaoMax} apostas por bolão</li>
                <li>• Sorteios: {REGRAS_MODALIDADE.diasSorteio.join(", ")}</li>
                <li>• Horário: {REGRAS_MODALIDADE.horarioSorteioBRT} (Brasília)</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Regras Comerciais (BolãoMax)
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Cota mínima: {formatCurrency(REGRAS_COMERCIAIS.cotaMinimaComercial)}</li>
                <li>• Até {REGRAS_COMERCIAIS.quantidadeMaximaJogosPorCard} jogos por card</li>
                <li>• Taxa da plataforma: {REGRAS_COMERCIAIS.taxaPlataformaPercentual}%</li>
                <li>• {REGRAS_COMERCIAIS.totalCotasMinimo} a {REGRAS_COMERCIAIS.totalCotasMaximo} cotas por bolão</li>
                <li>• Status "Encerrando" {REGRAS_COMERCIAIS.minutosAntesParaClosing}min antes</li>
                <li>• Políticas: Garantido, Condicionado ou Híbrido</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function Timemania() {
  const [valueFilter, setValueFilter] = useState("Todos os valores");
  const [availabilityFilter, setAvailabilityFilter] = useState("Toda disponibilidade");
  const [sortBy, setSortBy] = useState("Menos disponível");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBolao, setSelectedBolao] = useState<BolaoTimemania | null>(null);
  
  const { isLoggedIn } = useAuth();
  const [, setLocation] = useLocation();
  const authModal = useAuthRequiredModal();
  
  const boloes = useMemo(() => generateTimemaniBoloes(), []);
  
  const valueOptions = ["Todos os valores", "Até R$ 30", "R$ 30 - R$ 50", "Acima de R$ 50"];
  const availabilityOptions = ["Toda disponibilidade", "Ativo", "Encerrando", "Quase Completo"];
  const sortOptions = ["Menos disponível", "Mais disponível", "Maior prêmio", "Menor participação"];

  const handleViewGames = (bolao: BolaoTimemania) => {
    setSelectedBolao(bolao);
    setModalOpen(true);
  };

  const handleParticipate = (bolao: BolaoTimemania) => {
    const pendingBolao: PendingBolao = {
      id: bolao.id.toString(),
      name: bolao.codigoBolao,
      type: "Timemania",
      dezenas: REGRAS_MODALIDADE.numerosPorAposta,
      prizeValue: bolao.prizeValue,
      bolaoValue: bolao.valorTotalJogos + bolao.taxaPlataforma,
      sorteioDate: bolao.sorteioDate,
      minParticipation: parseFloat(bolao.minParticipation.replace(/[^\d,]/g, '').replace(',', '.')),
      concurso: bolao.numeroConcurso,
      isSpecial: bolao.isEspecial,
    };
    
    if (isLoggedIn) {
      setLocation(buildCheckoutUrl(pendingBolao));
    } else {
      authModal.openModal(pendingBolao);
    }
  };

  // Filtrar bolões
  const filteredBoloes = boloes.filter((bolao) => {
    if (availabilityFilter !== "Toda disponibilidade" && bolao.status !== availabilityFilter) return false;
    return true;
  });

  // Separar especiais e regulares
  const especialBoloes = filteredBoloes.filter(b => b.isEspecial);
  const regularBoloes = filteredBoloes.filter(b => !b.isEspecial);

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead 
        title="Bolões Timemania"
        description="Bolões da Timemania com Time do Coração. Participe dos bolões mais completos do Brasil com transparência total e cotas a partir de R$ 20."
        keywords={["bolão timemania", "timemania online", "time do coração", "apostas timemania", "loteria timemania"]}
        pageType="lottery"
        lotteryType="Timemania"
        canonicalUrl="https://bolaomax.com.br/timemania"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Bolões Timemania", url: "/timemania" }
        ]}
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Especial */}
        <BannerEspecial />

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-600 to-green-600">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">Bolões Timemania</h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-[60px]">
            Sorteios às terças, quintas e sábados • 10 números + Time do ❤️
          </p>
        </div>

        {/* Info Regras */}
        <InfoRegrasTimemania />

        {/* Filters */}
        <div className="mb-8 space-y-4">
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
            <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-current" />
              Copa do Mundo de Clubes
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
      />

      {/* Auth Required Modal */}
      {authModal.ModalComponent}

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer activePage="timemania" />
    </div>
  );
}
