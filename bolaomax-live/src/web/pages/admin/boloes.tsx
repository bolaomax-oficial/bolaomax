import { useState, useMemo, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useBolaoUpdates } from "@/contexts/BolaoUpdateContext";
import { useAuditLog, fieldLabels, statusLabels, AuditLogEntry, FieldChange } from "@/contexts/AuditLogContext";
import { useNotifications, formatChangesForNotification, NotificationMethod } from "@/contexts/NotificationContext";
import {
  listarBoloes,
  criarBolao,
  atualizarBolao,
  excluirBolao,
  BolaoFromAPI,
} from "@/services/adminBolaoService";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Zap,
  Brain,
  Flame,
  Repeat,
  Layers,
  Trophy,
  Hash,
  Ticket,
  Clock,
  AlertCircle,
  Check,
  Save,
  Star,
  Bell,
  Eye,
  AlertTriangle,
  Users,
  CheckSquare,
  Square,
  ListChecks,
  History,
  ArrowRight,
  FileText,
  MessageSquare,
  Mail,
  MessageCircle,
  Send,
  CalendarClock,
  Loader2,
  RefreshCw,
  Database,
  Crown,
} from "lucide-react";

// Types
type LotteryType = "lotofacil" | "megasena" | "quina" | "timemania" | "dia-de-sorte" | "super-sete" | "dupla-sena" | "lotomania" | "federal";

interface Bolao {
  id: string;
  codigoBolao: string; // Auto-generated sequential code like BOL-0001
  numeroConcurso: string; // Lottery draw number like 3145
  name: string;
  type: LotteryType;
  dezenas: number;
  valorTotal: string;
  disponivel: number;
  dataSorteio: string;
  horarioSorteio: string;
  dataEncerramento: string;
  horarioEncerramento: string;
  premioEstimado: string;
  status: "aberto" | "fechado" | "em_andamento" | "pausado" | "cancelado";
  jogosPerCard?: number;
  isSpecialEvent?: boolean;
  specialEventName?: string;
  teimosinha?: {
    enabled: boolean;
    mode: "fixo" | "ate_ganhar";
    concursos?: number;
  };
}

// Helper to detect if bolão is a special event by name
const isSpecialEventBolao = (bolao: Bolao): boolean => {
  if (bolao.isSpecialEvent) return true;
  const specialKeywords = ["virada", "independência", "são joão", "especial", "mega da virada", "lotofácil da independência", "quina de são joão"];
  const nameLower = bolao.name.toLowerCase();
  return specialKeywords.some(keyword => nameLower.includes(keyword));
};

// Get special event info
const getSpecialEventInfo = (bolao: Bolao): { name: string; color: string; emoji: string } | null => {
  if (bolao.specialEventName) {
    return { 
      name: bolao.specialEventName, 
      color: bolao.type === "megasena" ? "orange" : bolao.type === "lotofacil" ? "green" : "red",
      emoji: bolao.type === "megasena" ? "🎆" : bolao.type === "lotofacil" ? "🇧🇷" : "🔥"
    };
  }
  const nameLower = bolao.name.toLowerCase();
  if (nameLower.includes("virada") || nameLower.includes("mega da virada")) {
    return { name: "Mega da Virada", color: "orange", emoji: "🎆" };
  }
  if (nameLower.includes("independência") || nameLower.includes("independencia")) {
    return { name: "Lotofácil da Independência", color: "green", emoji: "🇧🇷" };
  }
  if (nameLower.includes("são joão") || nameLower.includes("sao joao")) {
    return { name: "Quina de São João", color: "red", emoji: "🔥" };
  }
  return null;
};

// Notification options interface
interface NotificationOptions {
  enabled: boolean;
  customMessage?: string;
  methods: NotificationMethod[];
  sendReminder: boolean;
  reminderDate?: string;
}

// Helper to generate next bolão code
const generateNextBolaoCode = (existingBolaos: Bolao[]): string => {
  const maxCode = existingBolaos.reduce((max, b) => {
    const num = parseInt(b.codigoBolao.replace("BOL-", ""), 10);
    return num > max ? num : max;
  }, 0);
  return `BOL-${String(maxCode + 1).padStart(4, "0")}`;
};

// Mock data with codigoBolao and numeroConcurso
const mockBolaos: Bolao[] = [
  // Original lotteries
  { id: "BOL001", codigoBolao: "BOL-0001", numeroConcurso: "3245", name: "Lotofácil Especial", type: "lotofacil", dezenas: 18, valorTotal: "R$ 5.000", disponivel: 28, dataSorteio: "20/12/2024", horarioSorteio: "20:00", dataEncerramento: "20/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 3.500.000", status: "aberto", jogosPerCard: 5 },
  { id: "BOL002", codigoBolao: "BOL-0002", numeroConcurso: "2856", name: "Mega da Virada 2024", type: "megasena", dezenas: 9, valorTotal: "R$ 15.000", disponivel: 65, dataSorteio: "31/12/2024", horarioSorteio: "20:00", dataEncerramento: "31/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 550.000.000", status: "aberto", jogosPerCard: 8, isSpecialEvent: true, specialEventName: "Mega da Virada", teimosinha: { enabled: true, mode: "fixo", concursos: 3 } },
  { id: "BOL003", codigoBolao: "BOL-0003", numeroConcurso: "6523", name: "Quina de São João", type: "quina", dezenas: 10, valorTotal: "R$ 3.000", disponivel: 12, dataSorteio: "24/06/2025", horarioSorteio: "20:00", dataEncerramento: "24/06/2025", horarioEncerramento: "18:00", premioEstimado: "R$ 10.000.000", status: "aberto", jogosPerCard: 3, isSpecialEvent: true, specialEventName: "Quina de São João", teimosinha: { enabled: true, mode: "ate_ganhar" } },
  { id: "BOL004", codigoBolao: "BOL-0004", numeroConcurso: "3244", name: "Lotofácil da Independência", type: "lotofacil", dezenas: 16, valorTotal: "R$ 8.000", disponivel: 45, dataSorteio: "07/09/2025", horarioSorteio: "20:00", dataEncerramento: "07/09/2025", horarioEncerramento: "18:00", premioEstimado: "R$ 12.000.000", status: "aberto", jogosPerCard: 4, isSpecialEvent: true, specialEventName: "Lotofácil da Independência" },
  { id: "BOL005", codigoBolao: "BOL-0005", numeroConcurso: "2855", name: "Mega Milhões", type: "megasena", dezenas: 12, valorTotal: "R$ 25.000", disponivel: 45, dataSorteio: "22/12/2024", horarioSorteio: "20:00", dataEncerramento: "22/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 45.000.000", status: "em_andamento", jogosPerCard: 10 },
  { id: "BOL006", codigoBolao: "BOL-0006", numeroConcurso: "6522", name: "Quina Express", type: "quina", dezenas: 8, valorTotal: "R$ 1.500", disponivel: 88, dataSorteio: "23/12/2024", horarioSorteio: "20:00", dataEncerramento: "23/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 1.500.000", status: "aberto", jogosPerCard: 2 },
  
  // New lotteries - Timemania
  { id: "BOL007", codigoBolao: "BOL-0007", numeroConcurso: "2150", name: "Timemania Especial", type: "timemania", dezenas: 10, valorTotal: "R$ 2.100", disponivel: 35, dataSorteio: "21/12/2024", horarioSorteio: "20:00", dataEncerramento: "21/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 15.000.000", status: "aberto", jogosPerCard: 3 },
  { id: "BOL008", codigoBolao: "BOL-0008", numeroConcurso: "2151", name: "Timemania Super", type: "timemania", dezenas: 10, valorTotal: "R$ 3.500", disponivel: 55, dataSorteio: "22/12/2024", horarioSorteio: "20:00", dataEncerramento: "22/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 20.000.000", status: "aberto", jogosPerCard: 5 },
  
  // Dia de Sorte
  { id: "BOL009", codigoBolao: "BOL-0009", numeroConcurso: "950", name: "Dia de Sorte Premium", type: "dia-de-sorte", dezenas: 10, valorTotal: "R$ 1.500", disponivel: 42, dataSorteio: "20/12/2024", horarioSorteio: "20:00", dataEncerramento: "20/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 3.000.000", status: "aberto", jogosPerCard: 3 },
  { id: "BOL010", codigoBolao: "BOL-0010", numeroConcurso: "951", name: "Dia de Sorte Mega", type: "dia-de-sorte", dezenas: 12, valorTotal: "R$ 2.250", disponivel: 68, dataSorteio: "21/12/2024", horarioSorteio: "20:00", dataEncerramento: "21/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 4.500.000", status: "aberto", jogosPerCard: 4 },
  
  // Super Sete
  { id: "BOL011", codigoBolao: "BOL-0011", numeroConcurso: "620", name: "Super Sete Express", type: "super-sete", dezenas: 7, valorTotal: "R$ 750", disponivel: 30, dataSorteio: "20/12/2024", horarioSorteio: "15:00", dataEncerramento: "20/12/2024", horarioEncerramento: "14:00", premioEstimado: "R$ 1.500.000", status: "aberto", jogosPerCard: 2 },
  { id: "BOL012", codigoBolao: "BOL-0012", numeroConcurso: "621", name: "Super Sete Plus", type: "super-sete", dezenas: 7, valorTotal: "R$ 1.250", disponivel: 48, dataSorteio: "22/12/2024", horarioSorteio: "15:00", dataEncerramento: "22/12/2024", horarioEncerramento: "13:00", premioEstimado: "R$ 2.500.000", status: "aberto", jogosPerCard: 3 },
  
  // Dupla Sena
  { id: "BOL013", codigoBolao: "BOL-0013", numeroConcurso: "2650", name: "Dupla Sena Especial", type: "dupla-sena", dezenas: 8, valorTotal: "R$ 1.000", disponivel: 52, dataSorteio: "20/12/2024", horarioSorteio: "20:00", dataEncerramento: "20/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 5.000.000", status: "aberto", jogosPerCard: 3 },
  { id: "BOL014", codigoBolao: "BOL-0014", numeroConcurso: "2651", name: "Dupla Sena Premium", type: "dupla-sena", dezenas: 10, valorTotal: "R$ 1.750", disponivel: 38, dataSorteio: "21/12/2024", horarioSorteio: "20:00", dataEncerramento: "21/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 7.000.000", status: "em_andamento", jogosPerCard: 4 },
  
  // Lotomania
  { id: "BOL015", codigoBolao: "BOL-0015", numeroConcurso: "2640", name: "Lotomania Mega", type: "lotomania", dezenas: 50, valorTotal: "R$ 2.400", disponivel: 60, dataSorteio: "20/12/2024", horarioSorteio: "20:00", dataEncerramento: "20/12/2024", horarioEncerramento: "18:00", premioEstimado: "R$ 6.000.000", status: "aberto", jogosPerCard: 4 },
  { id: "BOL016", codigoBolao: "BOL-0016", numeroConcurso: "2641", name: "Lotomania Super", type: "lotomania", dezenas: 50, valorTotal: "R$ 3.600", disponivel: 25, dataSorteio: "22/12/2024", horarioSorteio: "20:00", dataEncerramento: "22/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 8.000.000", status: "aberto", jogosPerCard: 5 },
  
  // Federal
  { id: "BOL017", codigoBolao: "BOL-0017", numeroConcurso: "5920", name: "Federal Especial", type: "federal", dezenas: 1, valorTotal: "R$ 1.000", disponivel: 70, dataSorteio: "21/12/2024", horarioSorteio: "19:00", dataEncerramento: "21/12/2024", horarioEncerramento: "17:00", premioEstimado: "R$ 1.000.000", status: "aberto", jogosPerCard: 5 },
  { id: "BOL018", codigoBolao: "BOL-0018", numeroConcurso: "5921", name: "Federal Premium", type: "federal", dezenas: 1, valorTotal: "R$ 2.000", disponivel: 45, dataSorteio: "25/12/2024", horarioSorteio: "19:00", dataEncerramento: "25/12/2024", horarioEncerramento: "16:00", premioEstimado: "R$ 1.500.000", status: "aberto", jogosPerCard: 10 },
];

const typeColors: Record<LotteryType, { bg: string; text: string; border: string }> = {
  lotofacil: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/30" },
  megasena: { bg: "bg-bolao-green/10", text: "text-bolao-green", border: "border-bolao-green/30" },
  quina: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  timemania: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  "dia-de-sorte": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  "super-sete": { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  "dupla-sena": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
  lotomania: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  federal: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
};

const statusConfig = {
  aberto: { label: "Ativo", bg: "bg-bolao-green/10", text: "text-bolao-green" },
  fechado: { label: "Fechado", bg: "bg-red-500/10", text: "text-red-400" },
  em_andamento: { label: "Em andamento", bg: "bg-bolao-orange/10", text: "text-bolao-orange" },
  pausado: { label: "Pausado", bg: "bg-yellow-500/10", text: "text-yellow-400" },
  cancelado: { label: "Cancelado", bg: "bg-gray-500/10", text: "text-gray-400" },
};

const lotteryTypeLabels: Record<LotteryType, string> = {
  lotofacil: "Lotofácil",
  megasena: "Mega-Sena",
  quina: "Quina",
  timemania: "Timemania",
  "dia-de-sorte": "Dia de Sorte",
  "super-sete": "Super Sete",
  "dupla-sena": "Dupla Sena",
  lotomania: "Lotomania",
  federal: "Federal",
};

// Tab Button Component
const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
        active
          ? "bg-bolao-green text-bolao-dark"
          : isDark 
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
};

// Filter Button Component
const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => {
  const { isDark } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
        active
          ? isDark 
            ? "bg-[#1C2432] text-white border border-[#2D3748]"
            : "bg-gray-200 text-gray-900 border border-gray-300"
          : isDark
            ? "text-gray-400 hover:text-white hover:bg-[#1C2432]/50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
};

// Dezenas options by lottery type
const dezenasOptionsByType: Record<LotteryType, number[]> = {
  lotofacil: [16, 17, 18, 19, 20],
  megasena: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  quina: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  timemania: [10], // Timemania always 10 dezenas
  "dia-de-sorte": [7, 8, 9, 10, 11, 12, 13, 14, 15],
  "super-sete": [7], // Super Sete always 7 columns
  "dupla-sena": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  lotomania: [50], // Lotomania always 50 numbers
  federal: [1], // Federal uses ticket numbers, not dezenas
};

// Create Bolao Modal
const CreateBolaoModal = ({ isOpen, onClose, onCreateBolao }: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreateBolao: (bolaoData: any) => Promise<void>;
}) => {
  const { isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<LotteryType>("lotofacil");
  const [selectedDezenas, setSelectedDezenas] = useState<number | null>(null);
  const [jogosPerCard, setJogosPerCard] = useState<number>(5);
  const [teimosinhaEnabled, setTeimosinhaEnabled] = useState(false);
  const [teimosinhaMode, setTeimosinhaMode] = useState<"fixo" | "ate_ganhar">("fixo");
  const [teimosinhaConcursos, setTeimosinhaConcursos] = useState<number>(3);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [numeroConcurso, setNumeroConcurso] = useState<string>("");
  const [nomeBolao, setNomeBolao] = useState<string>("");
  const [valorCota, setValorCota] = useState<string>("");
  const [quantidadeCotas, setQuantidadeCotas] = useState<string>("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generated bolão code (read-only, generated on save)
  const nextBolaoCode = useMemo(() => generateNextBolaoCode(mockBolaos), []);

  // Reset dezenas when type changes
  const handleTypeChange = (type: LotteryType) => {
    setSelectedType(type);
    setSelectedDezenas(null);
  };

  const currentDezenasOptions = dezenasOptionsByType[selectedType];

  const handleSubmit = async () => {
    if (!nomeBolao || !valorCota || !quantidadeCotas) {
      alert('Preencha os campos obrigatórios: nome, valor da cota e quantidade de cotas');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onCreateBolao({
        nome: nomeBolao,
        tipo: selectedType,
        concurso: numeroConcurso ? parseInt(numeroConcurso) : undefined,
        numerosDezenas: selectedDezenas ? Array.from({ length: selectedDezenas }, (_, i) => i + 1) : [],
        quantidadeCotas: parseInt(quantidadeCotas),
        valorCota: parseFloat(valorCota.replace(',', '.')),
        dataAbertura: new Date().toISOString(),
        dataFechamento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        dataSorteio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      // Reset form
      setNomeBolao('');
      setValorCota('');
      setQuantidadeCotas('100');
      setNumeroConcurso('');
      setSelectedDezenas(null);
      
      onClose();
    } catch (err) {
      console.error('Erro ao criar bolão:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className={`relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className={`sticky top-0 border-b p-5 flex items-center justify-between ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Criar Novo Bolão</h2>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Configure os detalhes do bolão</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Nome do Bolão - Required field */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Nome do Bolão <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Mega da Virada 2024"
              value={nomeBolao}
              onChange={(e) => setNomeBolao(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                isDark 
                  ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                  : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
          
          {/* Valor e Quantidade de Cotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Valor da Cota (R$) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 25.00"
                value={valorCota}
                onChange={(e) => setValorCota(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Quantidade de Cotas <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={quantidadeCotas}
                onChange={(e) => setQuantidadeCotas(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>
        
          {/* Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Tipo de Loteria</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "lotofacil", label: "Lotofácil" },
                { key: "megasena", label: "Mega-Sena" },
                { key: "quina", label: "Quina" },
                { key: "timemania", label: "Timemania" },
                { key: "dia-de-sorte", label: "Dia de Sorte" },
                { key: "super-sete", label: "Super Sete" },
                { key: "dupla-sena", label: "Dupla Sena" },
                { key: "lotomania", label: "Lotomania" },
                { key: "federal", label: "Federal" },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => handleTypeChange(type.key as LotteryType)}
                  className={`p-3 rounded-lg border transition-colors text-center ${
                    selectedType === type.key
                      ? "border-bolao-green bg-bolao-green/10 text-bolao-green"
                      : isDark 
                        ? "border-[#1C2432] hover:border-bolao-green/50"
                        : "border-gray-200 hover:border-bolao-green/50"
                  }`}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Código do Bolão & Número do Concurso - NEW FIELDS (Tasks 106 & 107) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Auto-generated Código do Bolão */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-bolao-green" />
                  Código do Bolão
                </div>
              </label>
              <div className={`w-full px-3 py-2.5 rounded-lg border text-sm flex items-center gap-2 ${
                isDark 
                  ? "bg-[#0A0E14]/60 border-[#1C2432] text-gray-400"
                  : "bg-gray-100 border-gray-200 text-gray-500"
              }`}>
                <span className="font-mono font-semibold text-bolao-green">{nextBolaoCode}</span>
                <span className="text-xs">(gerado automaticamente)</span>
              </div>
            </div>

            {/* Número do Concurso - Editable */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  Número do Concurso
                </div>
              </label>
              <input
                type="text"
                placeholder={selectedType === "lotofacil" ? "Ex: 3245" : selectedType === "megasena" ? "Ex: 2856" : "Ex: 6523"}
                value={numeroConcurso}
                onChange={(e) => setNumeroConcurso(e.target.value.replace(/\D/g, ""))}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-purple-500 font-mono ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Número do sorteio da {selectedType === "lotofacil" ? "Lotofácil" : selectedType === "megasena" ? "Mega-Sena" : "Quina"}
              </p>
            </div>
          </div>

          {/* Número de Jogos por Card - NEW FIELD (Task 98) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-bolao-green" />
                Número de Jogos por Card
              </div>
            </label>
            <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Quantos jogos serão incluídos em cada card do bolão
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setJogosPerCard(num)}
                  className={`w-12 h-10 rounded-lg border transition-colors text-sm font-medium ${
                    jogosPerCard === num
                      ? "border-bolao-green bg-bolao-green/10 text-bolao-green"
                      : isDark
                        ? "border-[#1C2432] hover:border-bolao-green/50"
                        : "border-gray-200 hover:border-bolao-green/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Selecionado: <span className="font-semibold text-bolao-green">{jogosPerCard} {jogosPerCard === 1 ? 'jogo' : 'jogos'}</span>
            </p>
          </div>

          {/* Dezenas */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Quantidade de Dezenas</label>
            <div className="flex flex-wrap gap-2">
              {currentDezenasOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedDezenas(num)}
                  className={`w-12 h-10 rounded-lg border transition-colors text-sm font-medium ${
                    selectedDezenas === num
                      ? "border-bolao-green bg-bolao-green/10 text-bolao-green"
                      : isDark
                        ? "border-[#1C2432] hover:border-bolao-green/50"
                        : "border-gray-200 hover:border-bolao-green/50"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Estratégia</label>
            <div className="space-y-2">
              {[
                { name: "Balanceada", desc: "Mix equilibrado de números" },
                { name: "Alta Recorrência", desc: "Números mais sorteados" },
                { name: "Baixa Recorrência", desc: "Números menos sorteados" },
              ].map((strategy) => (
                <button
                  key={strategy.name}
                  onClick={() => setSelectedStrategy(strategy.name)}
                  className={`w-full p-3 rounded-lg border transition-colors text-left ${
                    selectedStrategy === strategy.name
                      ? "border-bolao-green bg-bolao-green/10"
                      : isDark 
                        ? "border-[#1C2432] hover:border-bolao-green/50"
                        : "border-gray-200 hover:border-bolao-green/50"
                  }`}
                >
                  <p className={`font-medium text-sm ${selectedStrategy === strategy.name ? "text-bolao-green" : isDark ? "text-white" : "text-gray-900"}`}>{strategy.name}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{strategy.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Teimosinha Section - NEW FIELD (Task 99) */}
          <div className={`p-4 rounded-xl border ${teimosinhaEnabled ? "border-purple-500/50 bg-purple-500/5" : isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={teimosinhaEnabled}
                onChange={(e) => setTeimosinhaEnabled(e.target.checked)}
                className={`w-5 h-5 mt-0.5 rounded text-purple-500 focus:ring-purple-500 ${
                  isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-300 bg-white"
                }`} 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-purple-500" />
                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Teimosinha</p>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                    Persistência
                  </Badge>
                </div>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Repete automaticamente os mesmos jogos em concursos consecutivos
                </p>
              </div>
            </label>

            {teimosinhaEnabled && (
              <div className="mt-4 ml-8 space-y-4">
                {/* Teimosinha Mode Selection */}
                <div>
                  <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Modo da Teimosinha</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTeimosinhaMode("fixo")}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        teimosinhaMode === "fixo"
                          ? "border-purple-500 bg-purple-500/10"
                          : isDark 
                            ? "border-[#1C2432] hover:border-purple-500/50"
                            : "border-gray-200 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className={`text-sm font-medium ${teimosinhaMode === "fixo" ? "text-purple-400" : isDark ? "text-white" : "text-gray-900"}`}>
                          Número Fixo
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Definir quantidade de concursos
                      </p>
                    </button>
                    <button
                      onClick={() => setTeimosinhaMode("ate_ganhar")}
                      className={`p-3 rounded-lg border transition-colors text-left ${
                        teimosinhaMode === "ate_ganhar"
                          ? "border-purple-500 bg-purple-500/10"
                          : isDark 
                            ? "border-[#1C2432] hover:border-purple-500/50"
                            : "border-gray-200 hover:border-purple-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-purple-400" />
                        <span className={`text-sm font-medium ${teimosinhaMode === "ate_ganhar" ? "text-purple-400" : isDark ? "text-white" : "text-gray-900"}`}>
                          Até Ganhar
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Repete até acertar o prêmio
                      </p>
                    </button>
                  </div>
                </div>

                {/* Number of Concursos (only for "fixo" mode) */}
                {teimosinhaMode === "fixo" && (
                  <div>
                    <label className={`block text-xs font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Número de Concursos
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[2, 3, 4, 5, 6, 8, 10, 12, 15].map((num) => (
                        <button
                          key={num}
                          onClick={() => setTeimosinhaConcursos(num)}
                          className={`w-12 h-10 rounded-lg border transition-colors text-sm font-medium ${
                            teimosinhaConcursos === num
                              ? "border-purple-500 bg-purple-500/10 text-purple-400"
                              : isDark
                                ? "border-[#1C2432] hover:border-purple-500/50 text-gray-300"
                                : "border-gray-200 hover:border-purple-500/50 text-gray-700"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Os mesmos jogos serão repetidos por <span className="font-semibold text-purple-400">{teimosinhaConcursos} concursos</span> consecutivos
                    </p>
                  </div>
                )}

                {/* Visual Indicator */}
                <div className={`p-3 rounded-lg ${isDark ? "bg-purple-500/5" : "bg-purple-50"} border border-purple-500/20`}>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: "3s" }} />
                    <span className={`text-xs font-medium ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                      {teimosinhaMode === "ate_ganhar" 
                        ? "🔄 Teimosinha Ativa - Até Ganhar" 
                        : `🔄 Teimosinha Ativa - ${teimosinhaConcursos} concursos`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Data do Sorteio</label>
              <input
                type="date"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Valor Total</label>
              <input
                type="text"
                placeholder="R$ 5.000"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Valor Mínimo Participação</label>
              <input
                type="text"
                placeholder="R$ 20"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Prêmio Estimado</label>
              <input
                type="text"
                placeholder="R$ 100.000.000"
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Event Checkbox */}
          <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            isDark 
              ? "border-[#1C2432] hover:border-bolao-green/50"
              : "border-gray-200 hover:border-bolao-green/50"
          }`}>
            <input type="checkbox" className={`w-4 h-4 rounded text-bolao-green focus:ring-bolao-green ${
              isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-300 bg-white"
            }`} />
            <div>
              <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Evento Comemorativo</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Marcar como bolão especial (ex: Mega da Virada)</p>
            </div>
          </label>
        </div>

        <div className={`sticky bottom-0 border-t p-5 flex justify-end gap-3 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            className="bg-bolao-green hover:bg-bolao-green-dark text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Bolão
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Helper to convert DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
const parseDate = (dateStr: string): string => {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
};

// Helper to convert YYYY-MM-DD to DD/MM/YYYY for display
const formatDateDisplay = (dateStr: string): string => {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Edit Bolao Modal
const EditBolaoModal = ({ 
  isOpen, 
  onClose, 
  bolao,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  bolao: Bolao | null;
  onSave: (updatedBolao: Bolao, changes: FieldChange[], reason?: string, notificationOptions?: NotificationOptions) => void;
}) => {
  const { isDark } = useTheme();
  const { getEntriesByBolao } = useAuditLog();
  
  // Form state
  const [dataSorteio, setDataSorteio] = useState("");
  const [horarioSorteio, setHorarioSorteio] = useState("");
  const [premioEstimado, setPremioEstimado] = useState("");
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [horarioEncerramento, setHorarioEncerramento] = useState("");
  const [status, setStatus] = useState<Bolao["status"]>("aberto");
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [notifyParticipants, setNotifyParticipants] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // New state for audit
  const [activeTab, setActiveTab] = useState<"edit" | "history">("edit");
  const [changeReason, setChangeReason] = useState("");
  
  // Notification options state
  const [customNotificationMessage, setCustomNotificationMessage] = useState("");
  const [notificationMethods, setNotificationMethods] = useState<NotificationMethod[]>(["in_app"]);
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [showNotificationOptions, setShowNotificationOptions] = useState(false);

  // Check if this is a special event
  const isSpecial = bolao ? isSpecialEventBolao(bolao) : false;
  const specialEventInfo = bolao ? getSpecialEventInfo(bolao) : null;
  
  // Get audit history for this bolão
  const auditHistory = bolao ? getEntriesByBolao(bolao.id) : [];
  
  // Calculate participants count (mock - in real app would come from backend)
  const participantsCount = bolao ? Math.floor(100 - bolao.disponivel) : 0;

  // Initialize form when bolao changes
  useState(() => {
    if (bolao) {
      setDataSorteio(parseDate(bolao.dataSorteio));
      setHorarioSorteio(bolao.horarioSorteio);
      setPremioEstimado(bolao.premioEstimado);
      setDataEncerramento(parseDate(bolao.dataEncerramento));
      setHorarioEncerramento(bolao.horarioEncerramento);
      setStatus(bolao.status);
      // Default notify for special events
      setNotifyParticipants(isSpecialEventBolao(bolao));
    }
  });

  // Re-initialize when bolao changes
  useMemo(() => {
    if (bolao) {
      setDataSorteio(parseDate(bolao.dataSorteio));
      setHorarioSorteio(bolao.horarioSorteio);
      setPremioEstimado(bolao.premioEstimado);
      setDataEncerramento(parseDate(bolao.dataEncerramento));
      setHorarioEncerramento(bolao.horarioEncerramento);
      setStatus(bolao.status);
      setShowSuccess(false);
      setValidationErrors([]);
      setShowPreview(false);
      setActiveTab("edit");
      setChangeReason("");
      // Reset notification options
      setCustomNotificationMessage("");
      setNotificationMethods(["in_app"]);
      setSendReminder(false);
      setReminderDate("");
      setShowNotificationOptions(false);
      // Default notify for special events
      setNotifyParticipants(isSpecialEventBolao(bolao));
    }
  }, [bolao]);

  // Calculate changes for audit
  const calculateChanges = (): FieldChange[] => {
    if (!bolao) return [];
    const changes: FieldChange[] = [];
    
    const newDateSorteio = formatDateDisplay(dataSorteio);
    if (newDateSorteio !== bolao.dataSorteio) {
      changes.push({
        field: "dataSorteio",
        fieldLabel: fieldLabels.dataSorteio || "Data do Sorteio",
        oldValue: bolao.dataSorteio,
        newValue: newDateSorteio,
      });
    }
    
    if (horarioSorteio !== bolao.horarioSorteio) {
      changes.push({
        field: "horarioSorteio",
        fieldLabel: fieldLabels.horarioSorteio || "Horário do Sorteio",
        oldValue: bolao.horarioSorteio,
        newValue: horarioSorteio,
      });
    }
    
    const newDateEncerramento = formatDateDisplay(dataEncerramento);
    if (newDateEncerramento !== bolao.dataEncerramento) {
      changes.push({
        field: "dataEncerramento",
        fieldLabel: fieldLabels.dataEncerramento || "Data de Encerramento",
        oldValue: bolao.dataEncerramento,
        newValue: newDateEncerramento,
      });
    }
    
    if (horarioEncerramento !== bolao.horarioEncerramento) {
      changes.push({
        field: "horarioEncerramento",
        fieldLabel: fieldLabels.horarioEncerramento || "Horário de Encerramento",
        oldValue: bolao.horarioEncerramento,
        newValue: horarioEncerramento,
      });
    }
    
    if (premioEstimado !== bolao.premioEstimado) {
      changes.push({
        field: "premioEstimado",
        fieldLabel: fieldLabels.premioEstimado || "Prêmio Estimado",
        oldValue: bolao.premioEstimado,
        newValue: premioEstimado,
      });
    }
    
    if (status !== bolao.status) {
      changes.push({
        field: "status",
        fieldLabel: fieldLabels.status || "Status",
        oldValue: statusLabels[bolao.status] || bolao.status,
        newValue: statusLabels[status] || status,
      });
    }
    
    return changes;
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if sorteio date is in future
    const sorteioDate = new Date(dataSorteio);
    if (sorteioDate < today) {
      errors.push("A data do sorteio deve ser uma data futura");
    }

    // Check if encerramento is before sorteio
    const encerramentoDate = new Date(dataEncerramento);
    if (encerramentoDate > sorteioDate) {
      errors.push("O encerramento das apostas deve ser antes do sorteio");
    }

    // If same day, check time
    if (dataEncerramento === dataSorteio) {
      const [encerramentoH, encerramentoM] = horarioEncerramento.split(":").map(Number);
      const [sorteioH, sorteioM] = horarioSorteio.split(":").map(Number);
      const encerramentoMinutes = encerramentoH * 60 + encerramentoM;
      const sorteioMinutes = sorteioH * 60 + sorteioM;
      
      if (encerramentoMinutes >= sorteioMinutes) {
        errors.push("O horário de encerramento deve ser antes do horário do sorteio");
      }
    }

    // Check if prêmio is valid
    if (!premioEstimado.trim()) {
      errors.push("O prêmio estimado é obrigatório");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!bolao) return;
    
    if (!validateForm()) return;

    const changes = calculateChanges();
    
    // Don't save if no changes
    if (changes.length === 0) {
      setValidationErrors(["Nenhuma alteração foi feita"]);
      return;
    }

    const updatedBolao: Bolao = {
      ...bolao,
      dataSorteio: formatDateDisplay(dataSorteio),
      horarioSorteio,
      premioEstimado,
      dataEncerramento: formatDateDisplay(dataEncerramento),
      horarioEncerramento,
      status,
    };

    // Build notification options
    const notificationOpts: NotificationOptions | undefined = notifyParticipants ? {
      enabled: true,
      customMessage: customNotificationMessage || undefined,
      methods: notificationMethods,
      sendReminder,
      reminderDate: reminderDate || undefined,
    } : undefined;

    onSave(updatedBolao, changes, changeReason || undefined, notificationOpts);
    setShowSuccess(true);
    
    // Auto close after success
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen || !bolao) return null;

  const typeLabels = {
    lotofacil: "Lotofácil",
    megasena: "Mega-Sena",
    quina: "Quina",
  };

  // Get special event colors
  const getSpecialBorderColor = () => {
    if (!specialEventInfo) return "";
    if (specialEventInfo.color === "orange") return "border-orange-500";
    if (specialEventInfo.color === "green") return "border-green-500";
    if (specialEventInfo.color === "red") return "border-red-500";
    return "";
  };

  const getSpecialBgColor = () => {
    if (!specialEventInfo) return "";
    if (specialEventInfo.color === "orange") return "bg-orange-500/5";
    if (specialEventInfo.color === "green") return "bg-green-500/5";
    if (specialEventInfo.color === "red") return "bg-red-500/5";
    return "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <Card className={`relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${
        isSpecial 
          ? `border-2 ${getSpecialBorderColor()} ${getSpecialBgColor()}` 
          : ""
      } ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        
        {/* Special Event Banner */}
        {isSpecial && specialEventInfo && (
          <div className={`px-5 py-3 flex items-center justify-between ${
            specialEventInfo.color === "orange" 
              ? "bg-gradient-to-r from-orange-600 to-orange-500" 
              : specialEventInfo.color === "green"
              ? "bg-gradient-to-r from-green-600 to-green-500"
              : "bg-gradient-to-r from-red-600 to-red-500"
          }`}>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">
                {specialEventInfo.emoji} BOLÃO ESPECIAL • {specialEventInfo.name.toUpperCase()}
              </span>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-xs">
              EDIÇÃO CRÍTICA
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className={`sticky top-0 border-b p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSpecial && specialEventInfo
                  ? specialEventInfo.color === "orange" 
                    ? "bg-orange-500/20" 
                    : specialEventInfo.color === "green"
                    ? "bg-green-500/20"
                    : "bg-red-500/20"
                  : typeColors[bolao.type].bg
              }`}>
                {isSpecial ? (
                  <Star className={`w-5 h-5 ${
                    specialEventInfo?.color === "orange" 
                      ? "text-orange-500" 
                      : specialEventInfo?.color === "green"
                      ? "text-green-500"
                      : "text-red-500"
                  }`} />
                ) : (
                  <Edit className={`w-5 h-5 ${typeColors[bolao.type].text}`} />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Editar Bolão {isSpecial && "Especial"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge className={`text-[10px] ${typeColors[bolao.type].bg} ${typeColors[bolao.type].text} border ${typeColors[bolao.type].border}`}>
                    {typeLabels[bolao.type]}
                  </Badge>
                  {isSpecial && (
                    <Badge className={`text-[10px] ${
                      specialEventInfo?.color === "orange" 
                        ? "bg-orange-500/10 text-orange-500 border-orange-500/30" 
                        : specialEventInfo?.color === "green"
                        ? "bg-green-500/10 text-green-500 border-green-500/30"
                        : "bg-red-500/10 text-red-500 border-red-500/30"
                    }`}>
                      ESPECIAL
                    </Badge>
                  )}
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {bolao.codigoBolao} • Concurso {bolao.numeroConcurso}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Special Event Warning */}
        {isSpecial && (
          <div className={`mx-5 mt-5 p-4 rounded-xl flex items-start gap-3 ${
            specialEventInfo?.color === "orange" 
              ? "bg-orange-500/10 border border-orange-500/30" 
              : specialEventInfo?.color === "green"
              ? "bg-green-500/10 border border-green-500/30"
              : "bg-red-500/10 border border-red-500/30"
          }`}>
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              specialEventInfo?.color === "orange" 
                ? "text-orange-500" 
                : specialEventInfo?.color === "green"
                ? "text-green-500"
                : "text-red-500"
            }`} />
            <div>
              <p className={`text-sm font-semibold ${
                specialEventInfo?.color === "orange" 
                  ? "text-orange-500" 
                  : specialEventInfo?.color === "green"
                  ? "text-green-500"
                  : "text-red-500"
              }`}>
                Este é um bolão ESPECIAL
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Alterações afetarão todos os participantes. Verifique cuidadosamente as informações antes de salvar.
              </p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-5 mt-5 p-4 rounded-xl bg-bolao-green/10 border border-bolao-green/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bolao-green">Alterações salvas com sucesso!</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                O bolão foi atualizado {notifyParticipants && "e os participantes serão notificados"}
              </p>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mx-5 mt-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400">Corrija os seguintes erros:</p>
                <ul className="mt-2 space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={`mx-5 mt-5 flex items-center gap-1 p-1 rounded-lg border ${isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "edit"
                ? "bg-bolao-green text-bolao-dark"
                : isDark 
                  ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "history"
                ? "bg-bolao-green text-bolao-dark"
                : isDark 
                  ? "text-gray-400 hover:text-white hover:bg-[#1C2432]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Alterações
            {auditHistory.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                activeTab === "history" ? "bg-bolao-dark/20" : isDark ? "bg-[#1C2432]" : "bg-gray-200"
              }`}>
                {auditHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Edit Tab Content */}
        {activeTab === "edit" && (
        <div className="p-5 space-y-5">
          {/* Bolão Info (Read-only) */}
          <div className={`p-4 rounded-xl ${isDark ? "bg-[#0A0E14]/60" : "bg-gray-50"}`}>
            <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>INFORMAÇÕES DO BOLÃO</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Nome</p>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{bolao.name}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Dezenas</p>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{bolao.dezenas}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Valor Total</p>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{bolao.valorTotal}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Disponibilidade</p>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{bolao.disponivel}%</p>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            {/* Data e Horário do Sorteio - Highlighted for special events */}
            <div className={isSpecial ? `p-4 rounded-xl border ${
              specialEventInfo?.color === "orange" 
                ? "border-orange-500/30 bg-orange-500/5" 
                : specialEventInfo?.color === "green"
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            }` : ""}>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Calendar className={`w-4 h-4 ${isSpecial 
                  ? specialEventInfo?.color === "orange" 
                    ? "text-orange-500" 
                    : specialEventInfo?.color === "green"
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-bolao-green"}`} />
                Data e Horário do Sorteio
                {isSpecial && (
                  <Badge className={`text-[10px] ml-2 ${
                    specialEventInfo?.color === "orange" 
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/30" 
                      : specialEventInfo?.color === "green"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}>
                    CRÍTICO
                  </Badge>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dataSorteio}
                  onChange={(e) => setDataSorteio(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                    isSpecial 
                      ? specialEventInfo?.color === "orange" 
                        ? "focus:border-orange-500" 
                        : specialEventInfo?.color === "green"
                        ? "focus:border-green-500"
                        : "focus:border-red-500"
                      : "focus:border-bolao-green"
                  } ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
                <input
                  type="time"
                  value={horarioSorteio}
                  onChange={(e) => setHorarioSorteio(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                    isSpecial 
                      ? specialEventInfo?.color === "orange" 
                        ? "focus:border-orange-500" 
                        : specialEventInfo?.color === "green"
                        ? "focus:border-green-500"
                        : "focus:border-red-500"
                      : "focus:border-bolao-green"
                  } ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
            </div>

            {/* Data e Horário de Encerramento */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Clock className="w-4 h-4 text-bolao-orange" />
                Encerramento das Apostas
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dataEncerramento}
                  onChange={(e) => setDataEncerramento(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-orange ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
                <input
                  type="time"
                  value={horarioEncerramento}
                  onChange={(e) => setHorarioEncerramento(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-orange ${
                    isDark 
                      ? "bg-[#0A0E14] border-[#1C2432] text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
              </div>
              <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                As apostas encerram antes do horário do sorteio
              </p>
            </div>

            {/* Prêmio Estimado - Highlighted for special events */}
            <div className={isSpecial ? `p-4 rounded-xl border ${
              specialEventInfo?.color === "orange" 
                ? "border-orange-500/30 bg-orange-500/5" 
                : specialEventInfo?.color === "green"
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            }` : ""}>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Trophy className={`w-4 h-4 ${isSpecial 
                  ? specialEventInfo?.color === "orange" 
                    ? "text-orange-500" 
                    : specialEventInfo?.color === "green"
                    ? "text-green-500"
                    : "text-red-500"
                  : "text-yellow-500"}`} />
                Prêmio Estimado
                {isSpecial && (
                  <Badge className={`text-[10px] ml-2 ${
                    specialEventInfo?.color === "orange" 
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/30" 
                      : specialEventInfo?.color === "green"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}>
                    CRÍTICO
                  </Badge>
                )}
              </label>
              <input
                type="text"
                value={premioEstimado}
                onChange={(e) => setPremioEstimado(e.target.value)}
                placeholder="R$ 100.000.000"
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none ${
                  isSpecial 
                    ? specialEventInfo?.color === "orange" 
                      ? "focus:border-orange-500" 
                      : specialEventInfo?.color === "green"
                      ? "focus:border-green-500"
                      : "focus:border-red-500"
                    : "focus:border-yellow-500"
                } ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Valor estimado do prêmio principal da loteria
              </p>
            </div>

            {/* Status */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <Target className="w-4 h-4 text-purple-400" />
                Status do Bolão
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: "aberto", label: "Ativo", color: "green" },
                  { key: "pausado", label: "Pausado", color: "yellow" },
                  { key: "cancelado", label: "Cancelado", color: "gray" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStatus(s.key as Bolao["status"])}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      status === s.key
                        ? s.color === "green" 
                          ? "border-bolao-green bg-bolao-green/10 text-bolao-green"
                          : s.color === "yellow"
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                          : "border-gray-500 bg-gray-500/10 text-gray-400"
                        : isDark 
                          ? "border-[#1C2432] hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-sm">{s.label}</p>
                  </button>
                ))}
              </div>
              <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                {status === "aberto" && "O bolão está aberto para novas participações"}
                {status === "pausado" && "O bolão está temporariamente pausado"}
                {status === "cancelado" && "O bolão foi cancelado e não aceita mais apostas"}
              </p>
            </div>

            {/* Enhanced Notify Participants Option */}
            <div className={`rounded-xl border overflow-hidden ${
              notifyParticipants 
                ? "border-blue-500/30 bg-blue-500/5" 
                : isDark ? "border-[#1C2432]" : "border-gray-200"
            }`}>
              {/* Main toggle */}
              <label className="flex items-start gap-3 p-4 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifyParticipants}
                  onChange={(e) => {
                    setNotifyParticipants(e.target.checked);
                    if (e.target.checked) {
                      setShowNotificationOptions(true);
                    }
                  }}
                  className={`w-5 h-5 mt-0.5 rounded text-blue-500 focus:ring-blue-500 ${
                    isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-300 bg-white"
                  }`} 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Notificar Participantes
                    </p>
                    {isSpecial && (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Enviar notificação para todos os participantes sobre as alterações
                  </p>
                  {notifyParticipants && participantsCount > 0 && (
                    <div className={`mt-2 p-2 rounded-lg flex items-center justify-between ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                      <p className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                        <Users className="w-3 h-3 inline mr-1" />
                        {participantsCount} participante{participantsCount !== 1 ? "s" : ""} será{participantsCount !== 1 ? "ão" : ""} notificado{participantsCount !== 1 ? "s" : ""}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowNotificationOptions(!showNotificationOptions);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        {showNotificationOptions ? "Ocultar opções" : "Personalizar"}
                      </button>
                    </div>
                  )}
                </div>
              </label>

              {/* Expanded notification options */}
              {notifyParticipants && showNotificationOptions && (
                <div className={`border-t p-4 space-y-4 ${isDark ? "border-[#1C2432] bg-[#0A0E14]/30" : "border-gray-200 bg-gray-50"}`}>
                  {/* Custom message */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      Mensagem Personalizada
                      <span className={`text-xs font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}>(opcional)</span>
                    </label>
                    <textarea
                      value={customNotificationMessage}
                      onChange={(e) => setCustomNotificationMessage(e.target.value)}
                      placeholder={`Ex: Atenção! O bolão ${bolao.name} teve alterações importantes. Confira os novos detalhes.`}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 resize-none ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Se não preenchido, uma mensagem automática será gerada com base nas alterações
                    </p>
                  </div>

                  {/* Notification methods */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                      <Send className="w-4 h-4 text-blue-400" />
                      Métodos de Envio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "in_app", label: "No App", icon: Bell, description: "Notificação no site" },
                        { key: "email", label: "E-mail", icon: Mail, description: "Para todos com email" },
                        { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, description: "Grupo VIP" },
                        { key: "telegram", label: "Telegram", icon: MessageCircle, description: "Canal VIP" },
                      ].map((method) => {
                        const isSelected = notificationMethods.includes(method.key as NotificationMethod);
                        return (
                          <button
                            key={method.key}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                // Don't allow removing all methods
                                if (notificationMethods.length > 1) {
                                  setNotificationMethods(prev => prev.filter(m => m !== method.key));
                                }
                              } else {
                                setNotificationMethods(prev => [...prev, method.key as NotificationMethod]);
                              }
                            }}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-500/10"
                                : isDark 
                                  ? "border-[#1C2432] hover:border-gray-600"
                                  : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <method.icon className={`w-4 h-4 ${isSelected ? "text-blue-500" : isDark ? "text-gray-400" : "text-gray-500"}`} />
                              <span className={`text-sm font-medium ${isSelected ? "text-blue-500" : isDark ? "text-gray-300" : "text-gray-700"}`}>
                                {method.label}
                              </span>
                              {isSelected && <Check className="w-3 h-3 text-blue-500 ml-auto" />}
                            </div>
                            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              {method.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Send reminder option */}
                  <div className={`p-3 rounded-lg border ${
                    sendReminder 
                      ? "border-purple-500/30 bg-purple-500/5" 
                      : isDark ? "border-[#1C2432]" : "border-gray-200"
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sendReminder}
                        onChange={(e) => setSendReminder(e.target.checked)}
                        className={`w-4 h-4 mt-0.5 rounded text-purple-500 focus:ring-purple-500 ${
                          isDark ? "border-[#1C2432] bg-[#0A0E14]" : "border-gray-300 bg-white"
                        }`} 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-purple-400" />
                          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                            Enviar Lembrete
                          </p>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Notificar novamente próximo à data do sorteio
                        </p>
                        {sendReminder && (
                          <div className="mt-2">
                            <input
                              type="date"
                              value={reminderDate}
                              onChange={(e) => setReminderDate(e.target.value)}
                              min={new Date().toISOString().split("T")[0]}
                              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-purple-500 ${
                                isDark 
                                  ? "bg-[#0A0E14] border-[#1C2432] text-white"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Preview notification */}
                  <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]" : "bg-white"}`}>
                    <p className={`text-xs font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      PRÉVIA DA NOTIFICAÇÃO
                    </p>
                    <div className={`p-3 rounded-lg border ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            {bolao.name} Atualizado
                          </p>
                          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            {customNotificationMessage || `O bolão ${bolao.codigoBolao} foi atualizado. Verifique as novas informações.`}
                          </p>
                          <p className={`text-[10px] mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Agora • {notificationMethods.map(m => m === "in_app" ? "App" : m === "email" ? "Email" : m === "whatsapp" ? "WhatsApp" : "Telegram").join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className={`border rounded-xl overflow-hidden ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`w-full p-4 flex items-center justify-between ${isDark ? "hover:bg-[#1C2432]/30" : "hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-2">
                  <Eye className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    Prévia das Alterações
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPreview ? "rotate-180" : ""} ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              </button>
              
              {showPreview && (
                <div className={`p-4 border-t ${isDark ? "bg-[#0A0E14]/50 border-[#1C2432]" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    COMO OS USUÁRIOS VERÃO O BOLÃO
                  </p>
                  <div className={`p-4 rounded-xl ${isDark ? "bg-[#111827] border border-[#1C2432]" : "bg-white border border-gray-200"}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {isSpecial && (
                        <Badge className={`text-[10px] ${
                          specialEventInfo?.color === "orange" 
                            ? "bg-orange-500 text-white border-0" 
                            : specialEventInfo?.color === "green"
                            ? "bg-green-500 text-white border-0"
                            : "bg-red-500 text-white border-0"
                        }`}>
                          {specialEventInfo?.emoji} ESPECIAL
                        </Badge>
                      )}
                      <Badge className={`text-[10px] ${typeColors[bolao.type].bg} ${typeColors[bolao.type].text} border ${typeColors[bolao.type].border}`}>
                        {bolao.dezenas} dezenas
                      </Badge>
                    </div>
                    <h4 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                      {bolao.name}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${isSpecial 
                          ? specialEventInfo?.color === "orange" 
                            ? "text-orange-500" 
                            : specialEventInfo?.color === "green"
                            ? "text-green-500"
                            : "text-red-500"
                          : "text-yellow-500"}`} />
                        <span className={`text-xl font-bold ${isSpecial 
                          ? specialEventInfo?.color === "orange" 
                            ? "text-orange-500" 
                            : specialEventInfo?.color === "green"
                            ? "text-green-500"
                            : "text-red-500"
                          : "text-bolao-green"}`}>
                          {premioEstimado || bolao.premioEstimado}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Sorteio: {dataSorteio ? formatDateDisplay(dataSorteio) : bolao.dataSorteio} às {horarioSorteio || bolao.horarioSorteio}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Change Reason Field */}
            <div className={`p-4 rounded-xl border ${isDark ? "border-[#1C2432] bg-[#0A0E14]/40" : "border-gray-200 bg-gray-50"}`}>
              <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Motivo da Alteração
                <span className={`text-xs font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`}>(opcional)</span>
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ex: Atualização do prêmio conforme informação da Caixa"
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 resize-none ${
                  isDark 
                    ? "bg-[#0A0E14] border-[#1C2432] text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              <p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Este motivo será registrado no histórico de alterações para auditoria
              </p>
            </div>
          </div>
        </div>
        )}

        {/* History Tab Content */}
        {activeTab === "history" && (
          <div className="p-5">
            {auditHistory.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8" />
                </div>
                <p className="text-lg font-semibold mb-1">Nenhum histórico encontrado</p>
                <p className="text-sm">As alterações neste bolão aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  HISTÓRICO DE ALTERAÇÕES ({auditHistory.length} registros)
                </p>
                {auditHistory.map((entry) => {
                  const date = new Date(entry.timestamp);
                  const dateStr = date.toLocaleDateString("pt-BR");
                  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  
                  return (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-xl border ${isDark ? "border-[#1C2432] bg-[#0A0E14]/40" : "border-gray-200 bg-gray-50"}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Edit className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {entry.adminUser}
                            </p>
                            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              {dateStr} às {timeStr}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-[10px] ${
                          entry.changeType === "edit" 
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : entry.changeType === "create"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : entry.changeType === "status_change"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                        }`}>
                          {entry.changeType === "edit" ? "Edição" : 
                           entry.changeType === "create" ? "Criação" :
                           entry.changeType === "status_change" ? "Status" :
                           entry.changeType === "bulk_edit" ? "Lote" : "Outro"}
                        </Badge>
                      </div>
                      
                      {/* Changes */}
                      <div className="space-y-2">
                        {entry.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isDark ? "bg-[#111827]" : "bg-white"}`}
                          >
                            <span className={`min-w-[120px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                              {change.fieldLabel}:
                            </span>
                            <span className={`px-2 py-0.5 rounded ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}`}>
                              {change.oldValue || "(vazio)"}
                            </span>
                            <ArrowRight className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                            <span className={`px-2 py-0.5 rounded ${isDark ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}>
                              {change.newValue || "(vazio)"}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Reason */}
                      {entry.reason && (
                        <div className={`mt-3 pt-3 border-t ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            Motivo: {entry.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className={`sticky bottom-0 border-t p-5 flex justify-between items-center ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <Button variant="outline" onClick={onClose} className={isDark ? "border-[#1C2432]" : ""}>
            {activeTab === "history" ? "Fechar" : "Cancelar"}
          </Button>
          {activeTab === "edit" && (
          <Button 
            onClick={handleSave}
            disabled={showSuccess}
            className={`font-semibold ${
              isSpecial && specialEventInfo
                ? specialEventInfo.color === "orange" 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : specialEventInfo.color === "green"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
                : "bg-bolao-green hover:bg-bolao-green-dark text-white"
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

// Bulk Edit Modal for editing multiple bolões at once
// Bulk Edit Modal for editing multiple bolões at once
const BulkEditModal = ({ 
  isOpen, 
  onClose, 
  selectedBolaos,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  selectedBolaos: Bolao[];
  onSave: (updates: { dataSorteio?: string; horarioSorteio?: string; dataEncerramento?: string; horarioEncerramento?: string; premioAdjustment?: number; premioAdjustmentType?: 'percentage' | 'absolute'; status?: Bolao['status'] }) => void;
}) => {
  const { isDark } = useTheme();
  
  const [updateSorteioDate, setUpdateSorteioDate] = useState(false);
  const [dataSorteio, setDataSorteio] = useState("");
  const [horarioSorteio, setHorarioSorteio] = useState("20:00");
  const [updateEncerramento, setUpdateEncerramento] = useState(false);
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [horarioEncerramento, setHorarioEncerramento] = useState("18:00");
  const [updatePremio, setUpdatePremio] = useState(false);
  const [premioAdjustment, setPremioAdjustment] = useState<number>(0);
  const [premioAdjustmentType, setPremioAdjustmentType] = useState<'percentage' | 'absolute'>('percentage');
  const [updateStatus, setUpdateStatus] = useState(false);
  const [status, setStatus] = useState<Bolao['status']>("aberto");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useMemo(() => {
    if (isOpen) {
      setUpdateSorteioDate(false);
      setDataSorteio("");
      setHorarioSorteio("20:00");
      setUpdateEncerramento(false);
      setDataEncerramento("");
      setHorarioEncerramento("18:00");
      setUpdatePremio(false);
      setPremioAdjustment(0);
      setPremioAdjustmentType('percentage');
      setUpdateStatus(false);
      setStatus("aberto");
      setShowConfirmation(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const hasChanges = updateSorteioDate || updateEncerramento || updatePremio || updateStatus;

  const handleApply = () => {
    if (!hasChanges) return;
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    const updates: Record<string, unknown> = {};
    if (updateSorteioDate && dataSorteio) {
      updates.dataSorteio = dataSorteio;
      updates.horarioSorteio = horarioSorteio;
    }
    if (updateEncerramento && dataEncerramento) {
      updates.dataEncerramento = dataEncerramento;
      updates.horarioEncerramento = horarioEncerramento;
    }
    if (updatePremio) {
      updates.premioAdjustment = premioAdjustment;
      updates.premioAdjustmentType = premioAdjustmentType;
    }
    if (updateStatus) {
      updates.status = status;
    }
    onSave(updates as Parameters<typeof onSave>[0]);
    setShowSuccess(true);
    setShowConfirmation(false);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  const specialCount = selectedBolaos.filter(b => isSpecialEventBolao(b)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !showConfirmation && onClose()} />
      <Card className={`relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
        <div className={`sticky top-0 border-b p-5 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Edição em Massa</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                    {selectedBolaos.length} bolões selecionados
                  </Badge>
                  {specialCount > 0 && (
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-xs">
                      {specialCount} especiais
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {showSuccess && (
          <div className="mx-5 mt-5 p-4 rounded-xl bg-bolao-green/10 border border-bolao-green/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bolao-green/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-bolao-green" />
            </div>
            <div>
              <p className="text-sm font-semibold text-bolao-green">Alterações aplicadas com sucesso!</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{selectedBolaos.length} bolões foram atualizados</p>
            </div>
          </div>
        )}

        {showConfirmation && (
          <div className="mx-5 mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-500">Confirmar alterações em massa?</p>
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Você está prestes a alterar {selectedBolaos.length} bolões.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" onClick={handleConfirm} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Check className="w-4 h-4 mr-1" />Confirmar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowConfirmation(false)} className={isDark ? "border-[#1C2432]" : ""}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-5 space-y-5">
          <div className={`p-4 rounded-xl ${isDark ? "bg-[#0A0E14]/60" : "bg-gray-50"}`}>
            <p className={`text-xs font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>BOLÕES SELECIONADOS</p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedBolaos.map((bolao) => (
                <Badge key={bolao.id} className={`text-xs ${typeColors[bolao.type].bg} ${typeColors[bolao.type].text} border ${typeColors[bolao.type].border}`}>
                  {bolao.codigoBolao}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Sorteio Date */}
            <div className={`p-4 rounded-xl border ${updateSorteioDate ? "border-bolao-green/30 bg-bolao-green/5" : isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={updateSorteioDate} onChange={(e) => setUpdateSorteioDate(e.target.checked)} className={`w-5 h-5 mt-0.5 rounded ${isDark ? "border-[#1C2432] bg-[#0A0E14]" : ""}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-bolao-green" />
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Alterar Data do Sorteio</p>
                  </div>
                  {updateSorteioDate && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <input type="date" value={dataSorteio} onChange={(e) => setDataSorteio(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-200"}`} />
                      <input type="time" value={horarioSorteio} onChange={(e) => setHorarioSorteio(e.target.value)} className={`px-3 py-2 rounded-lg border text-sm ${isDark ? "bg-[#0A0E14] border-[#1C2432] text-white" : "bg-white border-gray-200"}`} />
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Status */}
            <div className={`p-4 rounded-xl border ${updateStatus ? "border-purple-500/30 bg-purple-500/5" : isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={updateStatus} onChange={(e) => setUpdateStatus(e.target.checked)} className={`w-5 h-5 mt-0.5 rounded ${isDark ? "border-[#1C2432] bg-[#0A0E14]" : ""}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Alterar Status em Massa</p>
                  </div>
                  {updateStatus && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[{key:"aberto",label:"Ativo",color:"green"},{key:"pausado",label:"Pausado",color:"yellow"},{key:"cancelado",label:"Cancelado",color:"gray"}].map((s) => (
                        <button key={s.key} onClick={() => setStatus(s.key as Bolao["status"])} className={`p-2 rounded-lg border text-xs font-medium ${status === s.key ? (s.color === "green" ? "border-bolao-green bg-bolao-green/10 text-bolao-green" : s.color === "yellow" ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-gray-500 bg-gray-500/10 text-gray-400") : isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className={`sticky bottom-0 border-t p-5 flex justify-between ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <Button variant="outline" onClick={onClose} className={isDark ? "border-[#1C2432]" : ""}>Cancelar</Button>
          <Button onClick={handleApply} disabled={!hasChanges || showSuccess} className="bg-purple-500 hover:bg-purple-600 text-white">
            <ListChecks className="w-4 h-4 mr-2" />Aplicar em {selectedBolaos.length} Bolões
          </Button>
        </div>
      </Card>
    </div>
  );
};

// AI Intelligence Panel
const AIIntelligencePanel = () => {
  const { isDark } = useTheme();
  
  return (
    <Card className={`p-5 bg-gradient-to-br ${isDark ? "from-[#111827] to-[#0D1117] border-[#1C2432]" : "from-gray-50 to-white border-gray-200"}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Inteligência de Bolões</h3>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Análise baseada em IA</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]/50" : "bg-gray-100"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Probabilidade de Preenchimento</span>
            <span className="text-sm font-semibold text-bolao-green">87%</span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-[#1C2432]" : "bg-gray-200"}`}>
            <div className="h-full w-[87%] bg-gradient-to-r from-bolao-green to-bolao-green-light rounded-full" />
          </div>
        </div>
        <div className={`p-3 rounded-lg ${isDark ? "bg-[#0A0E14]/50" : "bg-gray-100"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-bolao-orange" />
            <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Dezenas Mais Sorteadas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[4, 10, 13, 20, 24, 25].map((num) => (
              <span key={num} className="w-8 h-8 rounded-lg bg-bolao-orange/10 border border-bolao-orange/30 flex items-center justify-center text-xs font-semibold text-bolao-orange">{num}</span>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-bolao-green/5 border border-bolao-green/20">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-bolao-green mt-0.5" />
            <div>
              <p className="text-xs font-medium text-bolao-green">Sugestão de Estratégia</p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Baseado nos padrões históricos, recomendamos usar a estratégia "Balanceada" com 18 dezenas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main Component
// Helper function to transform API response to frontend Bolao type
const transformApiBolaoToFrontend = (apiBolao: BolaoFromAPI, index: number): Bolao => {
  // Parse dates from ISO format
  const parseIsoDate = (isoStr: string) => {
    if (!isoStr) return { date: '', time: '' };
    try {
      const d = new Date(isoStr);
      const date = d.toLocaleDateString('pt-BR');
      const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return { date, time };
    } catch {
      return { date: '', time: '' };
    }
  };
  
  const sorteio = parseIsoDate(apiBolao.dataSorteio);
  const fechamento = parseIsoDate(apiBolao.dataFechamento);
  
  // Parse dezenas from JSON string
  let dezenas: number[] = [];
  try {
    dezenas = JSON.parse(apiBolao.numerosDezenas || '[]');
  } catch {
    dezenas = [];
  }
  
  return {
    id: apiBolao.id,
    codigoBolao: `BOL-${String(index + 1).padStart(4, '0')}`,
    numeroConcurso: apiBolao.concurso?.toString() || '',
    name: apiBolao.nome,
    type: apiBolao.tipo as LotteryType,
    dezenas: dezenas.length || 0,
    valorTotal: `R$ ${(apiBolao.valorCota * apiBolao.quantidadeCotas).toLocaleString('pt-BR')}`,
    disponivel: apiBolao.cotasDisponiveis,
    dataSorteio: sorteio.date,
    horarioSorteio: sorteio.time,
    dataEncerramento: fechamento.date,
    horarioEncerramento: fechamento.time,
    premioEstimado: `R$ ${apiBolao.valorPremio?.toLocaleString('pt-BR') || '0'}`,
    status: apiBolao.status as Bolao['status'],
  };
};

// ============================================================
// COMPONENTE: BOLÕES ESPECIAIS
// ============================================================

const BoloesEspeciaisContent = () => {
  const { isDark } = useTheme();
  const [boloesEspeciais, setBoloesEspeciais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [bolaoSelecionado, setBolaoSelecionado] = useState<any>(null);

  // Templates de bolões especiais
  const templates = [
    {
      tipo: 'mega_virada',
      nome: 'Mega-Sena da Virada',
      icone: '🎊',
      cor: '#10B981',
      data_referencia: '31/12',
      loteria: 'megasena',
      descricao: 'O maior prêmio do ano! Sorteio em 31 de dezembro.'
    },
    {
      tipo: 'quina_sao_joao',
      nome: 'Quina de São João',
      icone: '🎉',
      cor: '#0EA5E9',
      data_referencia: '24/06',
      loteria: 'quina',
      descricao: 'Tradicional sorteio de São João. Data próxima a 24 de junho.'
    },
    {
      tipo: 'lotofacil_independencia',
      nome: 'Lotofácil da Independência',
      icone: '🇧🇷',
      cor: '#8B5CF6',
      data_referencia: '07/09',
      loteria: 'lotofacil',
      descricao: 'Sorteio especial próximo ao dia 7 de setembro.'
    },
    {
      tipo: 'dupla_pascoa',
      nome: 'Dupla de Páscoa',
      icone: '🐰',
      cor: '#A855F7',
      data_referencia: 'Páscoa',
      loteria: 'duplasena',
      descricao: 'Sorteio no sábado que antecede o Domingo de Páscoa.'
    },
    {
      tipo: 'federal_natal',
      nome: 'Federal de Natal',
      icone: '🎄',
      cor: '#3B82F6',
      data_referencia: 'Dez/25',
      loteria: 'federal',
      descricao: 'Extração especial na semana do Natal.'
    }
  ];

  useEffect(() => {
    carregarBoloesEspeciais();
  }, []);

  const carregarBoloesEspeciais = async () => {
    try {
      setLoading(true);
      // Aqui chamaria a API real
      // const response = await fetch('/api/boloes-especiais');
      // const data = await response.json();
      // setBoloesEspeciais(data.boloes || []);
      
      // Mock temporário
      setBoloesEspeciais([]);
    } catch (error) {
      console.error('Erro ao carregar bolões especiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarBolao = (template: any) => {
    setBolaoSelecionado(template);
    setModalAberto(true);
  };

  return (
    <div className="space-y-6">
      {/* Header com descrição */}
      <Card className={`p-6 border-2 ${isDark ? "bg-gradient-to-br from-orange-500/10 to-transparent border-bolao-orange/30" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-bolao-orange/20 flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-bolao-orange" />
          </div>
          <div>
            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              <Crown className="w-5 h-5 text-bolao-orange" />
              Bolões de Datas Especiais
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Gerencie bolões das grandes datas: Mega da Virada, Quina de São João, Lotofácil da Independência e outros eventos especiais do calendário.
            </p>
            <p className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              💡 <strong>Importante:</strong> Estes são diferentes dos bolões de assinantes. Aqui você cria bolões para datas comemorativas oficiais.
            </p>
          </div>
        </div>
      </Card>

      {/* Grid de Templates de Bolões Especiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.tipo}
            className={`group relative overflow-hidden border-2 transition-all hover:scale-[1.02] ${
              isDark 
                ? "bg-[#111827] border-[#1C2432] hover:border-bolao-orange/50" 
                : "bg-white border-gray-200 hover:border-bolao-orange/50"
            }`}
          >
            {/* Barra superior colorida */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: template.cor }} />
            
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: template.cor + '20' }}
                >
                  {template.icone}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-base mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {template.nome}
                  </h4>
                  <Badge 
                    className="text-[10px] px-2 py-0.5"
                    style={{ 
                      backgroundColor: template.cor + '20', 
                      color: template.cor,
                      border: `1px solid ${template.cor}40`
                    }}
                  >
                    {template.data_referencia}
                  </Badge>
                </div>
              </div>

              {/* Descrição */}
              <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {template.descricao}
              </p>

              {/* Info adicional */}
              <div className={`flex items-center gap-2 text-xs mb-4 p-2 rounded-lg ${
                isDark ? "bg-[#0A0E14]" : "bg-gray-50"
              }`}>
                <Target className="w-3.5 h-3.5 text-bolao-green" />
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Loteria: <span className="font-semibold" style={{ color: template.cor }}>
                    {template.loteria}
                  </span>
                </span>
              </div>

              {/* Botão de ação */}
              <Button
                onClick={() => handleCriarBolao(template)}
                className="w-full bg-bolao-orange hover:bg-bolao-orange-dark text-white font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Bolão Especial
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Lista de Bolões Especiais Criados */}
      {boloesEspeciais.length > 0 && (
        <Card className={`p-6 ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Bolões Especiais Criados
          </h3>
          <div className="space-y-3">
            {boloesEspeciais.map((bolao: any) => (
              <div 
                key={bolao.id}
                className={`p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{bolao.icone}</div>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {bolao.nome}
                      </p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Sorteio: {bolao.data_sorteio} • {bolao.numero_cotas} cotas de R$ {bolao.valor_cota}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State quando não há bolões criados */}
      {!loading && boloesEspeciais.length === 0 && (
        <Card className={`p-12 text-center ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
          <div className="w-16 h-16 rounded-full bg-bolao-orange/10 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-bolao-orange" />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Nenhum Bolão Especial Criado
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Selecione um dos templates acima para criar seu primeiro bolão especial
          </p>
        </Card>
      )}

      {/* Modal de Criação (será implementado) */}
      {modalAberto && (
        <ModalCriarBolaoEspecial 
          template={bolaoSelecionado}
          onClose={() => {
            setModalAberto(false);
            setBolaoSelecionado(null);
          }}
          onSalvar={() => {
            carregarBoloesEspeciais();
            setModalAberto(false);
            setBolaoSelecionado(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================
// MODAL: CRIAR BOLÃO ESPECIAL
// ============================================================

interface ModalCriarBolaoEspecialProps {
  template: any;
  onClose: () => void;
  onSalvar: () => void;
}

const ModalCriarBolaoEspecial = ({ template, onClose, onSalvar }: ModalCriarBolaoEspecialProps) => {
  const { isDark } = useTheme();
  const [etapa, setEtapa] = useState(1); // 1 = dados básicos, 2 = configurações
  const [salvando, setSalvando] = useState(false);
  const [formData, setFormData] = useState({
    nome: template?.nome || '',
    data_sorteio: '',
    hora_sorteio: '20:00',
    valor_cota: '',
    numero_cotas: '',
    quantidade_dezenas: '',
    descricao: template?.descricao || '',
    premio_estimado: '',
    visivel_site: true,
    destacar_home: false,
  });

  const handleSubmit = async () => {
    try {
      setSalvando(true);
      
      // Validações básicas
      if (!formData.nome || !formData.data_sorteio || !formData.valor_cota || !formData.numero_cotas) {
        alert('Preencha todos os campos obrigatórios');
        setSalvando(false);
        return;
      }

      // Aqui chamaria a API real
      // await boloesEspeciaisService.criarDeTemplate({
      //   template_tipo: template.tipo,
      //   ...formData
      // });

      console.log('Criando bolão especial:', { template: template.tipo, ...formData });
      
      // Simular sucesso
      setTimeout(() => {
        setSalvando(false);
        onSalvar();
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar bolão especial:', error);
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
        isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b flex items-center justify-between ${
          isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: template?.cor + '20' }}
            >
              {template?.icone}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Criar {template?.nome}
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Etapa {etapa} de 2
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {etapa === 1 && (
            <>
              {/* Dados Básicos */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Nome do Bolão *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="Ex: Mega da Virada 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Data do Sorteio *
                    </label>
                    <input
                      type="date"
                      value={formData.data_sorteio}
                      onChange={(e) => setFormData({ ...formData, data_sorteio: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Hora do Sorteio *
                    </label>
                    <input
                      type="time"
                      value={formData.hora_sorteio}
                      onChange={(e) => setFormData({ ...formData, hora_sorteio: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Valor da Cota (R$) *
                    </label>
                    <input
                      type="number"
                      value={formData.valor_cota}
                      onChange={(e) => setFormData({ ...formData, valor_cota: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      placeholder="25.00"
                      min="5"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Nº de Cotas *
                    </label>
                    <input
                      type="number"
                      value={formData.numero_cotas}
                      onChange={(e) => setFormData({ ...formData, numero_cotas: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      placeholder="100"
                      min="2"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Dezenas *
                    </label>
                    <input
                      type="number"
                      value={formData.quantidade_dezenas}
                      onChange={(e) => setFormData({ ...formData, quantidade_dezenas: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm ${
                        isDark 
                          ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                      placeholder="15"
                      min="6"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Prêmio Estimado (R$)
                  </label>
                  <input
                    type="text"
                    value={formData.premio_estimado}
                    onChange={(e) => setFormData({ ...formData, premio_estimado: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border text-sm ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="500.000.000,00"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border text-sm resize-none ${
                      isDark 
                        ? "bg-[#0A0E14] border-[#1C2432] text-white" 
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="Descrição do bolão especial..."
                  />
                </div>
              </div>
            </>
          )}

          {etapa === 2 && (
            <>
              {/* Configurações Avançadas */}
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  isDark ? "bg-[#0A0E14] border-[#1C2432]" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        Visível no Site
                      </p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Usuários poderão ver e participar deste bolão
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, visivel_site: !formData.visivel_site })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.visivel_site ? "bg-bolao-green" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.visivel_site ? "left-7" : "left-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                        Destacar na Home
                      </p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        Exibir com destaque na página inicial
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, destacar_home: !formData.destacar_home })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        formData.destacar_home ? "bg-bolao-orange" : isDark ? "bg-[#1C2432]" : "bg-gray-300"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.destacar_home ? "left-7" : "left-1"
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Preview do Bolão */}
                <Card className={`p-4 border-2 ${isDark ? "bg-[#0A0E14] border-bolao-orange/30" : "bg-orange-50 border-orange-200"}`}>
                  <p className={`text-xs font-semibold mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    PREVIEW DO BOLÃO
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{template?.icone}</div>
                    <div>
                      <h4 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {formData.nome}
                      </h4>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {formData.data_sorteio} às {formData.hora_sorteio}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2 rounded ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                      <p className={isDark ? "text-gray-400" : "text-gray-600"}>Valor Cota</p>
                      <p className="font-bold text-bolao-green">R$ {formData.valor_cota || '0'}</p>
                    </div>
                    <div className={`p-2 rounded ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                      <p className={isDark ? "text-gray-400" : "text-gray-600"}>Cotas</p>
                      <p className="font-bold text-bolao-orange">{formData.numero_cotas || '0'}</p>
                    </div>
                    <div className={`p-2 rounded ${isDark ? "bg-[#111827]" : "bg-white"}`}>
                      <p className={isDark ? "text-gray-400" : "text-gray-600"}>Dezenas</p>
                      <p className="font-bold text-purple-400">{formData.quantidade_dezenas || '0'}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Footer com botões */}
        <div className={`sticky bottom-0 p-6 border-t flex items-center justify-between ${
          isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"
        }`}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          
          <div className="flex gap-2">
            {etapa === 2 && (
              <Button variant="outline" onClick={() => setEtapa(1)}>
                Voltar
              </Button>
            )}
            {etapa === 1 ? (
              <Button 
                onClick={() => setEtapa(2)}
                className="bg-bolao-orange hover:bg-bolao-orange-dark text-white"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={salvando}
                className="bg-bolao-green hover:bg-bolao-green-dark text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Criar Bolão Especial
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const AdminBoloes = () => {
  const { isDark } = useTheme();
  const { dispatchUpdate } = useBolaoUpdates();
  const { addEntry } = useAuditLog();
  const { sendNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("todos");
  const [activeStatus, setActiveStatus] = useState("todos");
  const [teimosinhaFilter, setTeimosinhaFilter] = useState("todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [selectedBolao, setSelectedBolao] = useState<Bolao | null>(null);
  const [selectedBolaoIds, setSelectedBolaoIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bolaos, setBolaos] = useState<Bolao[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch bolões from API
  const fetchBolaos = useCallback(async () => {
    try {
      setError(null);
      const response = await listarBoloes({ limit: 100 });
      
      if (response.success && response.boloes) {
        // Transform API data to frontend format
        const transformed = response.boloes.map((b, i) => transformApiBolaoToFrontend(b, i));
        setBolaos(transformed);
      } else {
        // If API fails or returns empty, use mock data as fallback
        console.warn('[AdminBoloes] API returned empty, using mock data');
        setBolaos(mockBolaos);
      }
    } catch (err: any) {
      console.error('[AdminBoloes] Error fetching bolões:', err);
      setError(err.message || 'Erro ao carregar bolões');
      // Fallback to mock data
      setBolaos(mockBolaos);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBolaos();
  }, [fetchBolaos]);

  // Handle create bolão
  const handleCreateBolao = async (bolaoData: any) => {
    const response = await criarBolao(bolaoData);
    
    if (response.success) {
      // Refresh the list to get the new bolão
      await fetchBolaos();
    } else {
      throw new Error(response.error || 'Erro ao criar bolão');
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBolaos();
  };

  // Handle delete
  const handleDeleteBolao = async (bolaoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este bolão?')) return;
    
    setIsDeleting(bolaoId);
    try {
      const response = await excluirBolao(bolaoId);
      
      if (response.success) {
        // Remove from local state
        setBolaos(prev => prev.filter(b => b.id !== bolaoId));
      } else {
        alert(`Erro ao excluir: ${response.error || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      console.error('[AdminBoloes] Error deleting bolão:', err);
      alert(`Erro ao excluir: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditClick = (bolao: Bolao) => {
    setSelectedBolao(bolao);
    setIsEditModalOpen(true);
  };

  const handleToggleSelect = (bolaoId: string) => {
    setSelectedBolaoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bolaoId)) newSet.delete(bolaoId);
      else newSet.add(bolaoId);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedBolaoIds.size === filteredBolaos.length) setSelectedBolaoIds(new Set());
    else setSelectedBolaoIds(new Set(filteredBolaos.map(b => b.id)));
  };

  const selectedBolaos = bolaos.filter(b => selectedBolaoIds.has(b.id));

  const handleBulkEditSave = (updates: { dataSorteio?: string; horarioSorteio?: string; status?: Bolao['status'] }) => {
    setBolaos(prev => prev.map(bolao => {
      if (!selectedBolaoIds.has(bolao.id)) return bolao;
      const updated = { ...bolao };
      if (updates.dataSorteio) {
        const [year, month, day] = updates.dataSorteio.split('-');
        updated.dataSorteio = `${day}/${month}/${year}`;
        updated.horarioSorteio = updates.horarioSorteio || bolao.horarioSorteio;
      }
      if (updates.status) updated.status = updates.status;
      dispatchUpdate({
        id: updated.id, codigoBolao: updated.codigoBolao, type: updated.type,
        dataSorteio: updated.dataSorteio, horarioSorteio: updated.horarioSorteio,
        dataEncerramento: updated.dataEncerramento, horarioEncerramento: updated.horarioEncerramento,
        premioEstimado: updated.premioEstimado, status: updated.status, updatedAt: Date.now(),
      });
      return updated;
    }));
    setSelectedBolaoIds(new Set());
  };

  const handleSaveBolao = async (updatedBolao: Bolao, changes: FieldChange[], reason?: string, notificationOpts?: NotificationOptions) => {
    // Find original bolao to detect if it's special
    const originalBolao = bolaos.find(b => b.id === updatedBolao.id);
    const isSpecial = originalBolao ? isSpecialEventBolao(originalBolao) : false;
    const participantsCount = originalBolao ? Math.floor(100 - originalBolao.disponivel) : 0;
    
    // Call API to update the bolão
    try {
      const response = await atualizarBolao(updatedBolao.id, {
        nome: updatedBolao.name,
        tipo: updatedBolao.type,
        status: updatedBolao.status,
        dataSorteio: updatedBolao.dataSorteio,
      });
      
      if (!response.success) {
        console.error('[AdminBoloes] Erro ao atualizar no backend:', response.error);
        // Continue with local update even if API fails
      }
    } catch (err) {
      console.error('[AdminBoloes] Erro ao atualizar bolão:', err);
    }
    
    // Update the bolao in state
    setBolaos(prev => prev.map(b => b.id === updatedBolao.id ? updatedBolao : b));
    
    // Dispatch update for real-time sync
    dispatchUpdate({
      id: updatedBolao.id, codigoBolao: updatedBolao.codigoBolao, type: updatedBolao.type,
      dataSorteio: updatedBolao.dataSorteio, horarioSorteio: updatedBolao.horarioSorteio,
      dataEncerramento: updatedBolao.dataEncerramento, horarioEncerramento: updatedBolao.horarioEncerramento,
      premioEstimado: updatedBolao.premioEstimado, status: updatedBolao.status, updatedAt: Date.now(),
    });
    
    // Add audit log entry
    if (changes.length > 0) {
      // Determine change type based on what was changed
      let changeType: "edit" | "status_change" = "edit";
      if (changes.length === 1 && changes[0].field === "status") {
        changeType = "status_change";
      }
      
      addEntry({
        adminUser: "Administrador", // In real app, get from auth context
        adminEmail: "admin@bolaomax.com",
        bolaoId: updatedBolao.id,
        bolaoCode: updatedBolao.codigoBolao,
        bolaoName: updatedBolao.name,
        bolaoType: updatedBolao.type,
        changeType,
        changes,
        reason,
        isSpecialEvent: isSpecial,
      });
    }
    
    // Send notifications if enabled
    if (notificationOpts?.enabled && participantsCount > 0) {
      const changesSummary = formatChangesForNotification(changes);
      
      sendNotification({
        bolaoId: updatedBolao.id,
        bolaoCode: updatedBolao.codigoBolao,
        bolaoName: updatedBolao.name,
        bolaoType: updatedBolao.type,
        changesSummary,
        customMessage: notificationOpts.customMessage,
        recipientCount: participantsCount,
        methods: notificationOpts.methods,
        isSpecialEvent: isSpecial,
        hasReminder: notificationOpts.sendReminder,
        reminderDate: notificationOpts.reminderDate,
      });
    }
  };

  const filteredBolaos = bolaos.filter((bolao) => {
    if (activeTab !== "todos" && bolao.type !== activeTab) return false;
    if (activeStatus !== "todos" && bolao.status !== activeStatus) return false;
    if (teimosinhaFilter === "com_teimosinha" && !bolao.teimosinha?.enabled) return false;
    if (teimosinhaFilter === "sem_teimosinha" && bolao.teimosinha?.enabled) return false;
    if (searchQuery && !bolao.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const teimosinhaBolaoCount = bolaos.filter(b => b.teimosinha?.enabled).length;

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout title="Gestão de Bolões" subtitle="Crie e gerencie todos os bolões">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-bolao-green animate-spin mb-4" />
          <p className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            Carregando bolões...
          </p>
          <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Buscando dados do banco de dados
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestão de Bolões" subtitle="Crie e gerencie todos os bolões">
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 font-medium text-sm">{error}</p>
            <p className="text-red-400/70 text-xs mt-1">Usando dados de demonstração como fallback</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-red-400 hover:text-red-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )}
      
      {/* Database status indicator */}
      <div className={`mb-4 flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        <Database className="w-4 h-4" />
        <span className="text-xs">
          {bolaos.length > 0 ? `${bolaos.length} bolões carregados` : 'Nenhum bolão encontrado'}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
          <input type="text" placeholder="Buscar bolões..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-bolao-green ${isDark ? "bg-[#111827] border-[#1C2432] text-white placeholder-gray-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"}`}
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedBolaoIds.size > 0 && (
            <Button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold" onClick={() => setIsBulkEditModalOpen(true)}>
              <ListChecks className="w-4 h-4 mr-2" />Editar {selectedBolaoIds.size} Selecionados
            </Button>
          )}
          <Button className="bg-bolao-green hover:bg-bolao-green-dark text-white font-semibold" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Criar Novo Bolão
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className={`flex flex-wrap items-center gap-2 p-1 rounded-lg border ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <TabButton active={activeTab === "todos"} onClick={() => setActiveTab("todos")}>Todos</TabButton>
            <TabButton active={activeTab === "lotofacil"} onClick={() => setActiveTab("lotofacil")}>Lotofácil</TabButton>
            <TabButton active={activeTab === "megasena"} onClick={() => setActiveTab("megasena")}>Mega-Sena</TabButton>
            <TabButton active={activeTab === "quina"} onClick={() => setActiveTab("quina")}>Quina</TabButton>
            <TabButton active={activeTab === "timemania"} onClick={() => setActiveTab("timemania")}>Timemania</TabButton>
            <TabButton active={activeTab === "dia-de-sorte"} onClick={() => setActiveTab("dia-de-sorte")}>Dia de Sorte</TabButton>
            <TabButton active={activeTab === "super-sete"} onClick={() => setActiveTab("super-sete")}>Super Sete</TabButton>
            <TabButton active={activeTab === "dupla-sena"} onClick={() => setActiveTab("dupla-sena")}>Dupla Sena</TabButton>
            <TabButton active={activeTab === "lotomania"} onClick={() => setActiveTab("lotomania")}>Lotomania</TabButton>
            <TabButton active={activeTab === "federal"} onClick={() => setActiveTab("federal")}>Federal</TabButton>
            <TabButton active={activeTab === "especiais"} onClick={() => setActiveTab("especiais")}>
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-bolao-orange" />
                Bolões Especiais
              </span>
            </TabButton>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <FilterButton active={activeStatus === "todos"} onClick={() => setActiveStatus("todos")}>Todos</FilterButton>
              <FilterButton active={activeStatus === "aberto"} onClick={() => setActiveStatus("aberto")}>Aberto</FilterButton>
              <FilterButton active={activeStatus === "fechado"} onClick={() => setActiveStatus("fechado")}>Fechado</FilterButton>
              <FilterButton active={activeStatus === "em_andamento"} onClick={() => setActiveStatus("em_andamento")}>Em andamento</FilterButton>
            </div>
            <div className={`flex items-center gap-2 pl-4 border-l ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
              <Repeat className="w-4 h-4 text-purple-400" />
              <button onClick={() => setTeimosinhaFilter("todos")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${teimosinhaFilter === "todos" ? (isDark ? "bg-[#1C2432] text-white border border-[#2D3748]" : "bg-gray-200 text-gray-900 border border-gray-300") : ""}`}>Todos</button>
              <button onClick={() => setTeimosinhaFilter("com_teimosinha")} className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 ${teimosinhaFilter === "com_teimosinha" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : ""}`}>
                <Repeat className="w-3 h-3" />Com Teimosinha<Badge className="bg-purple-500/20 text-purple-400 border-0 text-[10px] px-1.5 py-0">{teimosinhaBolaoCount}</Badge>
              </button>
              <button onClick={() => setTeimosinhaFilter("sem_teimosinha")} className={`px-3 py-1.5 text-xs font-medium rounded-md ${teimosinhaFilter === "sem_teimosinha" ? (isDark ? "bg-[#1C2432] text-white border border-[#2D3748]" : "bg-gray-200 text-gray-900 border border-gray-300") : ""}`}>Sem Teimosinha</button>
            </div>
          </div>

          {/* Conteúdo quando aba "Bolões Especiais" está ativa */}
          {activeTab === "especiais" ? (
            <div className="space-y-6">
              {/* Seção de Bolões Especiais */}
              <BoloesEspeciaisContent />
            </div>
          ) : (
            /* Tabela normal de bolões */
            <Card className={`overflow-hidden ${isDark ? "bg-[#111827] border-[#1C2432]" : "bg-white border-gray-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? "border-[#1C2432]" : "border-gray-200"}`}>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      <button onClick={handleSelectAll} className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedBolaoIds.size === filteredBolaos.length && filteredBolaos.length > 0 ? "bg-purple-500 border-purple-500 text-white" : isDark ? "border-[#1C2432] hover:border-purple-500" : "border-gray-300 hover:border-purple-500"}`}>
                        {selectedBolaoIds.size === filteredBolaos.length && filteredBolaos.length > 0 ? <Check className="w-3 h-3" /> : null}
                      </button>
                    </th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Código</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Concurso</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Nome / Tipo</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Dezenas</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Data Sorteio</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Status</th>
                    <th className={`text-left text-xs font-medium p-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBolaos.map((bolao) => (
                    <tr key={bolao.id} className={`border-b last:border-0 transition-colors ${selectedBolaoIds.has(bolao.id) ? (isDark ? "bg-purple-500/10" : "bg-purple-50") : (isDark ? "border-[#1C2432] hover:bg-[#1C2432]/30" : "border-gray-200 hover:bg-gray-50")}`}>
                      <td className="p-4">
                        <button onClick={() => handleToggleSelect(bolao.id)} className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedBolaoIds.has(bolao.id) ? "bg-purple-500 border-purple-500 text-white" : isDark ? "border-[#1C2432] hover:border-purple-500" : "border-gray-300 hover:border-purple-500"}`}>
                          {selectedBolaoIds.has(bolao.id) ? <Check className="w-3 h-3" /> : null}
                        </button>
                      </td>
                      <td className="p-4"><div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-bolao-green" /><span className="text-sm font-mono font-semibold text-bolao-green">{bolao.codigoBolao}</span></div></td>
                      <td className="p-4"><div className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-purple-400" /><span className={`text-sm font-mono ${isDark ? "text-purple-300" : "text-purple-600"}`}>{bolao.numeroConcurso}</span></div></td>
                      <td className="p-4"><div><p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{bolao.name}</p><Badge className={`mt-1 text-[10px] ${typeColors[bolao.type].bg} ${typeColors[bolao.type].text} border ${typeColors[bolao.type].border}`}>{lotteryTypeLabels[bolao.type]}</Badge></div></td>
                      <td className="p-4"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold ${isDark ? "bg-[#1C2432] text-white" : "bg-gray-100 text-gray-900"}`}>{bolao.dezenas}</span></td>
                      <td className={`p-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{bolao.dataSorteio}</td>
                      <td className="p-4"><Badge className={`${statusConfig[bolao.status].bg} ${statusConfig[bolao.status].text} border-0`}>{statusConfig[bolao.status].label}</Badge></td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`} onClick={() => handleEditClick(bolao)} title="Editar bolão">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className={`h-8 w-8 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`}><Copy className="w-4 h-4" /></Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 hover:text-red-400 ${isDark ? "hover:bg-[#1C2432]" : "hover:bg-gray-100"}`}
                            onClick={() => handleDeleteBolao(bolao.id)}
                            disabled={isDeleting === bolao.id}
                            title="Excluir bolão"
                          >
                            {isDeleting === bolao.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          )}
        </div>

        <div className="lg:col-span-1"><AIIntelligencePanel /></div>
      </div>

      <CreateBolaoModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreateBolao={handleCreateBolao}
      />
      <EditBolaoModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedBolao(null); }} bolao={selectedBolao} onSave={handleSaveBolao} />
      <BulkEditModal isOpen={isBulkEditModalOpen} onClose={() => setIsBulkEditModalOpen(false)} selectedBolaos={selectedBolaos} onSave={handleBulkEditSave} />
    </AdminLayout>
  );
};

export default AdminBoloes;
