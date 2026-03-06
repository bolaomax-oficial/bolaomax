import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bell,
  Download,
  Filter,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
} from "lucide-react";

interface Sorteio {
  id: string;
  tipo: string;
  numero: number;
  data: string;
  hora: string;
  dia_semana: string;
  mes: number;
  ano: number;
  local_sorteio: string;
  destaque?: boolean;
  descricao?: string;
  cor?: string;
  badge?: string;
}

const LOTERIAS = [
  { id: "megasena", nome: "Mega-Sena", cor: "#10B981" },
  { id: "lotofacil", nome: "Lotofácil", cor: "#8B5CF6" },
  { id: "quina", nome: "Quina", cor: "#0EA5E9" },
  { id: "lotomania", nome: "Lotomania", cor: "#F97316" },
  { id: "duplasena", nome: "Dupla Sena", cor: "#A855F7" },
  { id: "timemania", nome: "Timemania", cor: "#10B981" },
  { id: "diadesorte", nome: "Dia de Sorte", cor: "#F59E0B" },
  { id: "supersete", nome: "Super Sete", cor: "#EC4899" },
  { id: "federal", nome: "Federal", cor: "#3B82F6" },
];

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function AdminCalendarioPage() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [loteriaSelecionada, setLoteriaSelecionada] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"mes" | "lista" | "estatisticas">("mes");

  useEffect(() => {
    carregarSorteios();
  }, [mesAtual, anoAtual, loteriaSelecionada]);

  const carregarSorteios = async () => {
    try {
      setLoading(true);

      let url = `/api/sorteios/mes/${mesAtual}?ano=${anoAtual}`;
      const res = await fetch(url);
      const data = await res.json();
      let sorteiosFiltrados = data.data || [];

      if (loteriaSelecionada) {
        sorteiosFiltrados = sorteiosFiltrados.filter(
          (s: Sorteio) => s.tipo === loteriaSelecionada
        );
      }

      setSorteios(sorteiosFiltrados);
    } catch (error) {
      console.error("Erro ao carregar sorteios:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportarICS = async () => {
    const loterias = loteriaSelecionada || "megasena,lotofacil,quina";
    window.location.href = `/api/sorteios/exportar?formato=ics&loterias=${loterias}&mes=${mesAtual}&ano=${anoAtual}`;
  };

  const navMesAnterior = () => {
    if (mesAtual === 1) {
      setMesAtual(12);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const navProxMes = () => {
    if (mesAtual === 12) {
      setMesAtual(1);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  return (
    <AdminLayout title="Calendário de Sorteios" subtitle="Gerencie todos os sorteios das loterias">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-bolao-card border-bolao-card-border">
            <div className="text-sm text-muted-foreground mb-1">Total Sorteios</div>
            <div className="text-3xl font-bold text-bolao-green">{sorteios.length}</div>
            <div className="text-xs text-muted-foreground mt-2">
              em {MESES[mesAtual - 1]}
            </div>
          </Card>

          <Card className="p-4 bg-bolao-card border-bolao-card-border">
            <div className="text-sm text-muted-foreground mb-1">Próximos 7 dias</div>
            <div className="text-3xl font-bold text-blue-400">
              {sorteios.filter((s) => {
                const dataSorteio = new Date(s.data);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const proximos7 = new Date(hoje);
                proximos7.setDate(proximos7.getDate() + 7);
                return dataSorteio >= hoje && dataSorteio <= proximos7;
              }).length}
            </div>
          </Card>

          <Card className="p-4 bg-bolao-card border-bolao-card-border">
            <div className="text-sm text-muted-foreground mb-1">Loterias</div>
            <div className="text-3xl font-bold text-purple-400">
              {new Set(sorteios.map((s) => s.tipo)).size}
            </div>
          </Card>

          <Card className="p-4 bg-bolao-card border-bolao-card-border">
            <div className="text-sm text-muted-foreground mb-1">Mega da Virada</div>
            <div className="text-2xl font-bold text-yellow-400">
              {sorteios.filter((s) => s.destaque).length}
            </div>
          </Card>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() => setView("mes")}
              variant={view === "mes" ? "default" : "outline"}
              className={view === "mes" ? "bg-bolao-green" : ""}
            >
              Calendário
            </Button>
            <Button
              onClick={() => setView("lista")}
              variant={view === "lista" ? "default" : "outline"}
              className={view === "lista" ? "bg-bolao-green" : ""}
            >
              Lista
            </Button>
            <Button
              onClick={() => setView("estatisticas")}
              variant={view === "estatisticas" ? "default" : "outline"}
              className={view === "estatisticas" ? "bg-bolao-green" : ""}
            >
              Estatísticas
            </Button>
          </div>

          <div className="flex gap-2">
            <select
              value={loteriaSelecionada}
              onChange={(e) => setLoteriaSelecionada(e.target.value)}
              className="px-3 py-2 bg-bolao-card border border-bolao-card-border rounded-lg text-white"
            >
              <option value="">Todas as loterias</option>
              {LOTERIAS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>

            <Button
              onClick={exportarICS}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>

            <Button className="bg-bolao-green hover:bg-bolao-green-dark gap-2">
              <Plus className="w-4 h-4" />
              Novo
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : view === "mes" ? (
          <ViewMesAdmin
            mesAtual={mesAtual}
            anoAtual={anoAtual}
            sorteios={sorteios}
            onMesAnterior={navMesAnterior}
            onProxMes={navProxMes}
          />
        ) : view === "lista" ? (
          <ViewListaAdmin sorteios={sorteios} mesAtual={mesAtual} anoAtual={anoAtual} />
        ) : (
          <ViewEstatisticas sorteios={sorteios} />
        )}
      </div>
    </AdminLayout>
  );
}

// ==================== COMPONENTES ====================

function ViewMesAdmin({
  mesAtual,
  anoAtual,
  sorteios,
  onMesAnterior,
  onProxMes,
}: {
  mesAtual: number;
  anoAtual: number;
  sorteios: Sorteio[];
  onMesAnterior: () => void;
  onProxMes: () => void;
}) {
  return (
    <Card className="p-6 bg-bolao-card border-bolao-card-border">
      {/* Navegação */}
      <div className="flex items-center justify-between mb-6">
        <Button onClick={onMesAnterior} variant="outline" size="sm">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold">
          {MESES[mesAtual - 1]} de {anoAtual}
        </h2>
        <Button onClick={onProxMes} variant="outline" size="sm">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((dia) => (
          <div key={dia} className="text-center font-semibold text-muted-foreground py-2">
            {dia}
          </div>
        ))}

        {Array.from({ length: 31 }, (_, i) => {
          const dataStr = `${anoAtual}-${String(mesAtual).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const sorteiosDoDia = sorteios.filter((s) => s.data === dataStr);

          return (
            <div
              key={i + 1}
              className="min-h-24 p-2 bg-bolao-darker border border-bolao-card-border rounded-lg hover:border-bolao-green/50 transition-all"
            >
              <div className="font-semibold text-sm mb-1">{i + 1}</div>
              <div className="space-y-1">
                {sorteiosDoDia.slice(0, 2).map((s) => (
                  <div
                    key={s.id}
                    className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: s.cor + "30",
                      color: s.cor,
                      borderLeft: `2px solid ${s.cor}`,
                    }}
                    title={`${s.tipo} - Concurso ${s.numero}`}
                  >
                    {s.tipo}
                  </div>
                ))}
                {sorteiosDoDia.length > 2 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{sorteiosDoDia.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ViewListaAdmin({
  sorteios,
  mesAtual,
  anoAtual,
}: {
  sorteios: Sorteio[];
  mesAtual: number;
  anoAtual: number;
}) {
  if (sorteios.length === 0) {
    return (
      <Card className="p-8 text-center bg-bolao-card border-bolao-card-border text-muted-foreground">
        Nenhum sorteio em {MESES[mesAtual - 1]} de {anoAtual}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sorteios.map((sorteio) => (
        <Card
          key={sorteio.id}
          className="p-4 bg-bolao-card border-bolao-card-border hover:border-bolao-green/50 transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-1 h-16 rounded"
                style={{ backgroundColor: sorteio.cor }}
              />
              <div className="flex-1">
                <div className="font-bold">{sorteio.tipo.toUpperCase()}</div>
                <p className="text-sm text-muted-foreground">
                  Concurso {sorteio.numero} • {new Date(sorteio.data).toLocaleDateString("pt-BR")} às {sorteio.hora}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{sorteio.local_sorteio}</p>
              </div>
              {sorteio.destaque && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ViewEstatisticas({ sorteios }: { sorteios: Sorteio[] }) {
  const loteriasCount = sorteios.reduce(
    (acc, s) => {
      acc[s.tipo] = (acc[s.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const diasSemana = sorteios.reduce(
    (acc, s) => {
      acc[s.dia_semana] = (acc[s.dia_semana] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Loterias */}
      <Card className="p-6 bg-bolao-card border-bolao-card-border">
        <h3 className="font-bold text-lg mb-4">Sorteios por Loteria</h3>
        <div className="space-y-3">
          {Object.entries(loteriasCount).map(([loteria, count]) => (
            <div key={loteria} className="flex items-center justify-between">
              <span className="capitalize">{loteria}</span>
              <Badge className="bg-bolao-green">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Dias da Semana */}
      <Card className="p-6 bg-bolao-card border-bolao-card-border">
        <h3 className="font-bold text-lg mb-4">Sorteios por Dia</h3>
        <div className="space-y-3">
          {Object.entries(diasSemana).map(([dia, count]) => (
            <div key={dia} className="flex items-center justify-between">
              <span>{dia}</span>
              <Badge className="bg-blue-600">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
