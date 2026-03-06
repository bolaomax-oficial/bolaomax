import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Bell,
  Download,
  Filter,
  Clock,
  MapPin,
  Search,
  Sparkles,
  CalendarDays,
  X,
} from "lucide-react";

// Lottery types with their specific colors and icons
const LOTERIAS = {
  megasena: { nome: "Mega-Sena", cor: "#10B981", icone: "🎰", bgGradient: "from-emerald-500/20 to-emerald-600/5" },
  lotofacil: { nome: "Lotofácil", cor: "#8B5CF6", icone: "✨", bgGradient: "from-violet-500/20 to-violet-600/5" },
  quina: { nome: "Quina", cor: "#0EA5E9", icone: "⭐", bgGradient: "from-sky-500/20 to-sky-600/5" },
  lotomania: { nome: "Lotomania", cor: "#F97316", icone: "🎲", bgGradient: "from-orange-500/20 to-orange-600/5" },
  duplasena: { nome: "Dupla Sena", cor: "#A855F7", icone: "🔄", bgGradient: "from-purple-500/20 to-purple-600/5" },
  timemania: { nome: "Timemania", cor: "#22C55E", icone: "⚽", bgGradient: "from-green-500/20 to-green-600/5" },
  diadesorte: { nome: "Dia de Sorte", cor: "#F59E0B", icone: "☀️", bgGradient: "from-amber-500/20 to-amber-600/5" },
  supersete: { nome: "Super Sete", cor: "#EC4899", icone: "💎", bgGradient: "from-pink-500/20 to-pink-600/5" },
  federal: { nome: "Federal", cor: "#3B82F6", icone: "🏆", bgGradient: "from-blue-500/20 to-blue-600/5" },
} as const;

type LotteryType = keyof typeof LOTERIAS;

interface Sorteio {
  id: string;
  tipo: LotteryType;
  numero: number;
  data: Date;
  hora: string;
  local: string;
  destaque?: boolean;
  descricao?: string;
}

// Generate mock data for 20+ draws
const generateMockSorteios = (): Sorteio[] => {
  const today = new Date();
  const sorteios: Sorteio[] = [];
  
  const schedules: { tipo: LotteryType; dias: number[]; hora: string }[] = [
    { tipo: "megasena", dias: [3, 6], hora: "20:00" },
    { tipo: "lotofacil", dias: [1, 2, 3, 4, 5, 6], hora: "20:00" },
    { tipo: "quina", dias: [1, 2, 3, 4, 5, 6], hora: "20:00" },
    { tipo: "lotomania", dias: [2, 5], hora: "20:00" },
    { tipo: "duplasena", dias: [2, 4, 6], hora: "20:00" },
    { tipo: "timemania", dias: [2, 4, 6], hora: "20:00" },
    { tipo: "diadesorte", dias: [2, 4, 6], hora: "20:00" },
    { tipo: "supersete", dias: [1, 3, 5], hora: "15:00" },
    { tipo: "federal", dias: [3, 6], hora: "19:00" },
  ];

  const concursoBase: Record<LotteryType, number> = {
    megasena: 2810,
    lotofacil: 3290,
    quina: 6620,
    lotomania: 2695,
    duplasena: 2750,
    timemania: 2190,
    diadesorte: 1020,
    supersete: 620,
    federal: 5950,
  };

  // Generate draws for the next 30 days
  for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dayOfWeek = date.getDay();

    schedules.forEach((schedule) => {
      if (schedule.dias.includes(dayOfWeek)) {
        const concursoCount = sorteios.filter(s => s.tipo === schedule.tipo).length;
        const isSpecial = schedule.tipo === "megasena" && concursoCount === 0;
        
        sorteios.push({
          id: `${schedule.tipo}-${concursoBase[schedule.tipo] + concursoCount}`,
          tipo: schedule.tipo,
          numero: concursoBase[schedule.tipo] + concursoCount,
          data: new Date(date),
          hora: schedule.hora,
          local: "Espaço da Sorte - São Paulo",
          destaque: isSpecial,
          descricao: isSpecial ? "MEGA DA VIRADA" : undefined,
        });
      }
    });
  }

  return sorteios.sort((a, b) => a.data.getTime() - b.data.getTime());
};

const MOCK_SORTEIOS = generateMockSorteios();

// Helper to determine badge type
const getBadge = (date: Date): { label: string; type: "hoje" | "amanha" | "semana" | null } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return { label: "Hoje", type: "hoje" };
  if (diffDays === 1) return { label: "Amanhã", type: "amanha" };
  if (diffDays <= 7) return { label: "Esta Semana", type: "semana" };
  return { label: "", type: null };
};

// Format date in Portuguese
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

// Export to ICS format
const exportToICS = (sorteios: Sorteio[], selectedLottery: string) => {
  const filteredSorteios = selectedLottery 
    ? sorteios.filter(s => s.tipo === selectedLottery)
    : sorteios;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BolaoMax//Calendario de Sorteios//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...filteredSorteios.flatMap(sorteio => {
      const lotteryInfo = LOTERIAS[sorteio.tipo];
      const startDate = new Date(sorteio.data);
      const [hours, minutes] = sorteio.hora.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      
      const formatICSDate = (d: Date) => 
        d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      
      return [
        "BEGIN:VEVENT",
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${lotteryInfo.nome} - Concurso ${sorteio.numero}`,
        `DESCRIPTION:Sorteio ${lotteryInfo.nome} Concurso ${sorteio.numero}`,
        `LOCATION:${sorteio.local}`,
        `UID:${sorteio.id}@bolaomax.com.br`,
        "END:VEVENT",
      ];
    }),
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sorteios-bolaomax${selectedLottery ? `-${selectedLottery}` : ""}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Draw Card Component
const SorteioCard = ({ sorteio }: { sorteio: Sorteio }) => {
  const lotteryInfo = LOTERIAS[sorteio.tipo];
  const badge = getBadge(sorteio.data);
  
  return (
    <Card 
      className={`group relative overflow-hidden bg-gradient-to-br ${lotteryInfo.bgGradient} border-bolao-card-border hover:border-opacity-50 transition-all duration-300 card-hover`}
      style={{ borderColor: `${lotteryInfo.cor}30` }}
    >
      {/* Colored accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: lotteryInfo.cor }}
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${lotteryInfo.cor}15 0%, transparent 70%)` 
        }}
      />
      
      <div className="relative p-5">
        {/* Header with lottery info and badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${lotteryInfo.cor}25`, boxShadow: `0 4px 20px ${lotteryInfo.cor}20` }}
            >
              {lotteryInfo.icone}
            </div>
            <div>
              <h3 
                className="font-bold text-lg leading-tight"
                style={{ color: lotteryInfo.cor }}
              >
                {lotteryInfo.nome}
              </h3>
              <p className="text-sm text-muted-foreground">Concurso {sorteio.numero}</p>
            </div>
          </div>
          
          {badge.type && (
            <Badge 
              className={`text-xs font-semibold px-2.5 py-1 ${
                badge.type === "hoje" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" 
                  : badge.type === "amanha"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              }`}
            >
              {badge.type === "hoje" && <span className="mr-1">🔴</span>}
              {badge.label}
            </Badge>
          )}
        </div>
        
        {/* Special highlight */}
        {sorteio.destaque && (
          <div className="mb-4 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-300">{sorteio.descricao}</span>
          </div>
        )}
        
        {/* Draw details */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-bolao-card flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-bolao-green" />
            </div>
            <span className="text-sm capitalize">{formatDate(sorteio.data)}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-bolao-card flex items-center justify-center">
              <Clock className="w-4 h-4 text-bolao-green" />
            </div>
            <span className="text-sm">{sorteio.hora}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-bolao-card flex items-center justify-center">
              <MapPin className="w-4 h-4 text-bolao-green" />
            </div>
            <span className="text-sm">{sorteio.local}</span>
          </div>
        </div>
        
        {/* Action button */}
        <Button 
          className="w-full gap-2 font-semibold transition-all duration-300"
          style={{ 
            backgroundColor: `${lotteryInfo.cor}20`,
            color: lotteryInfo.cor,
            borderColor: `${lotteryInfo.cor}40`,
          }}
          variant="outline"
        >
          <Bell className="w-4 h-4" />
          Criar Alerta
        </Button>
      </div>
    </Card>
  );
};

// Filter Pills Component
const FilterPills = ({ 
  selectedLottery, 
  onSelect 
}: { 
  selectedLottery: string; 
  onSelect: (lottery: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedLottery === ""
            ? "bg-bolao-green text-bolao-dark"
            : "bg-bolao-card border border-bolao-card-border text-muted-foreground hover:border-bolao-green/50"
        }`}
      >
        Todas
      </button>
      {Object.entries(LOTERIAS).map(([key, info]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedLottery === key
              ? "text-white"
              : "bg-bolao-card border border-bolao-card-border text-muted-foreground hover:border-opacity-50"
          }`}
          style={selectedLottery === key ? { backgroundColor: info.cor } : { borderColor: `${info.cor}30` }}
        >
          <span>{info.icone}</span>
          <span className="hidden sm:inline">{info.nome}</span>
        </button>
      ))}
    </div>
  );
};

export default function CalendarioPage() {
  const [selectedLottery, setSelectedLottery] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Filter sorteios based on selected lottery and search
  const filteredSorteios = useMemo(() => {
    return MOCK_SORTEIOS.filter(sorteio => {
      const matchesLottery = !selectedLottery || sorteio.tipo === selectedLottery;
      const matchesSearch = !searchQuery || 
        LOTERIAS[sorteio.tipo].nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sorteio.numero.toString().includes(searchQuery);
      return matchesLottery && matchesSearch;
    });
  }, [selectedLottery, searchQuery]);

  return (
    <>
      <SEOHead
        title="Calendário de Sorteios - Todos os Sorteios das 9 Loterias | BolãoMax"
        description="Acompanhe o calendário completo de sorteios das 9 loterias da Caixa. Veja datas, horários e crie alertas para não perder nenhum sorteio."
      />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative pt-28 pb-12 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute inset-0 radial-gradient" />
          
          {/* Floating decorative elements */}
          <div className="absolute top-32 left-[5%] w-3 h-3 bg-emerald-500 rounded-full animate-float opacity-40" style={{ animationDelay: "0s" }} />
          <div className="absolute top-40 right-[10%] w-2 h-2 bg-violet-500 rounded-full animate-float opacity-30" style={{ animationDelay: "1s" }} />
          <div className="absolute top-56 left-[15%] w-4 h-4 bg-amber-500 rounded-full animate-float opacity-20" style={{ animationDelay: "2s" }} />
          <div className="absolute top-48 right-[20%] w-2 h-2 bg-pink-500 rounded-full animate-float opacity-35" style={{ animationDelay: "0.5s" }} />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-slide-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bolao-card border border-bolao-card-border mb-6">
                <Calendar className="w-5 h-5 text-bolao-green" />
                <span className="text-sm font-medium text-muted-foreground">Atualizado em tempo real</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                Calendário de{" "}
                <span className="gradient-text">Sorteios</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Todos os sorteios das 9 loterias em um só lugar. 
                Nunca mais perca a chance de participar.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Controls Section */}
          <div className="mb-10 space-y-6 animate-slide-in-up stagger-1">
            {/* Search and Export Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar loteria ou concurso..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-10 h-12 bg-bolao-card border-bolao-card-border focus:border-bolao-green text-base"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Export Button */}
              <Button 
                onClick={() => exportToICS(filteredSorteios, selectedLottery)}
                className="h-12 px-6 bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-bold gap-2 glow-green hover:glow-green-intense transition-all"
              >
                <Download className="w-5 h-5" />
                Exportar .ics
              </Button>
            </div>
            
            {/* Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filtrar por loteria:</span>
              </div>
              <FilterPills selectedLottery={selectedLottery} onSelect={setSelectedLottery} />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 animate-slide-in-up stagger-2">
            <p className="text-muted-foreground">
              Mostrando{" "}
              <span className="text-foreground font-semibold">{filteredSorteios.length}</span>{" "}
              sorteios
              {selectedLottery && (
                <span> de <span className="font-semibold" style={{ color: LOTERIAS[selectedLottery as LotteryType].cor }}>{LOTERIAS[selectedLottery as LotteryType].nome}</span></span>
              )}
            </p>
          </div>

          {/* Cards Grid */}
          {filteredSorteios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in-up stagger-3">
              {filteredSorteios.map((sorteio) => (
                <SorteioCard key={sorteio.id} sorteio={sorteio} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-bolao-card flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum sorteio encontrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
              <Button 
                onClick={() => { setSelectedLottery(""); setSearchQuery(""); }}
                variant="outline" 
                className="mt-6"
              >
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-bolao-card via-bolao-green/5 to-bolao-card border border-bolao-card-border">
            <h3 className="text-2xl font-bold mb-3">Nunca perca um sorteio!</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Exporte o calendário para seu aplicativo de agenda favorito e receba lembretes automáticos.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => exportToICS(MOCK_SORTEIOS, "")}
                className="gap-2 bg-bolao-orange-bright hover:bg-bolao-orange-dark text-white font-bold"
              >
                📥 Google Calendar
              </Button>
              <Button 
                onClick={() => exportToICS(MOCK_SORTEIOS, "")}
                variant="outline"
                className="gap-2 border-bolao-card-border"
              >
                📅 Apple Calendar
              </Button>
              <Button 
                onClick={() => exportToICS(MOCK_SORTEIOS, "")}
                variant="outline"
                className="gap-2 border-bolao-card-border"
              >
                📆 Outlook
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
