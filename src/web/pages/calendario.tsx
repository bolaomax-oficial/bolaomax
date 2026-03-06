import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/SEOHead';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Bell,
  Share2,
  Filter,
  List,
  Grid3x3,
  Sparkles,
} from 'lucide-react';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const CORES_LOTERIAS = {
  megasena: '#10B981',
  lotofacil: '#8B5CF6',
  quina: '#0EA5E9',
  lotomania: '#F97316',
  duplasena: '#A855F7',
  timemania: '#10B981',
  diadesorte: '#F59E0B',
  supersete: '#EC4899',
  federal: '#3B82F6',
};

// Mock dados de sorteios
const MOCK_SORTEIOS = [
  // Fevereiro 2025
  {
    id: 'megasena_2025_02_15',
    tipo: 'megasena',
    nome: 'Mega-Sena',
    data: '2025-02-15',
    hora: '20:00',
    premio: 'R$ 5.000.000',
    especial: false,
  },
  {
    id: 'megasena_2025_02_19',
    tipo: 'megasena',
    nome: 'Mega-Sena',
    data: '2025-02-19',
    hora: '20:00',
    premio: 'R$ 5.000.000',
    especial: false,
  },
  {
    id: 'lotofacil_2025_02_18',
    tipo: 'lotofacil',
    nome: 'Lotofácil',
    data: '2025-02-18',
    hora: '20:00',
    premio: 'R$ 1.500.000',
    especial: false,
  },
  {
    id: 'quina_2025_02_20',
    tipo: 'quina',
    nome: 'Quina',
    data: '2025-02-20',
    hora: '20:00',
    premio: 'R$ 1.200.000',
    especial: false,
  },
  // Março 2025
  {
    id: 'megasena_2025_03_15',
    tipo: 'megasena',
    nome: 'Mega-Sena',
    data: '2025-03-15',
    hora: '20:00',
    premio: 'R$ 5.500.000',
    especial: false,
  },
  {
    id: 'megasena_2025_03_19',
    tipo: 'megasena',
    nome: 'Mega-Sena',
    data: '2025-03-19',
    hora: '20:00',
    premio: 'R$ 5.500.000',
    especial: false,
  },
  // Dezembro 2025 - Mega da Virada
  {
    id: 'megasena_2025_12_31',
    tipo: 'megasena',
    nome: '🎄 Mega da Virada',
    data: '2025-12-31',
    hora: '20:00',
    premio: 'R$ 300.000.000',
    especial: true,
  },
];

export default function Calendario() {
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [visualizacao, setVisualizacao] = useState<'calendario' | 'lista'>('calendario');
  const [filtroLoteria, setFiltroLoteria] = useState<string | null>(null);

  // Filtrar sorteios
  const sorteiosFiltrados = useMemo(() => {
    return MOCK_SORTEIOS.filter((sorteio) => {
      const [anoS, mesS] = sorteio.data.split('-').map(Number);
      const mesMatch = mesS === mes;
      const anoMatch = anoS === ano;
      const loteryMatch = !filtroLoteria || sorteio.tipo === filtroLoteria;

      return mesMatch && anoMatch && loteryMatch;
    });
  }, [mes, ano, filtroLoteria]);

  // Calcular dias do mês
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const primeiroDia = new Date(ano, mes - 1, 1).getDay();

  const diasMes = Array.from({ length: ultimoDia }, (_, i) => i + 1);

  // Avanço de mês
  const proximoMes = () => {
    if (mes === 12) {
      setMes(1);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const mesPasses = () => {
    if (mes === 1) {
      setMes(12);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  // Função para voltar ao mês atual
  const voltarHoje = () => {
    const hoje = new Date();
    setMes(hoje.getMonth() + 1);
    setAno(hoje.getFullYear());
  };

  // Obter sorteios de um dia
  const getSorteiosDia = (dia: number) => {
    const dataFormatada = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    return sorteiosFiltrados.filter((s) => s.data === dataFormatada);
  };

  // Calcular badge de proximidade
  const getProximityBadge = (data: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataEvento = new Date(data);
    dataEvento.setHours(0, 0, 0, 0);

    const diferenca = (dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    if (diferenca === 0) return '📅 Hoje';
    if (diferenca === 1) return '📅 Amanhã';
    if (diferenca > 1 && diferenca <= 7) return '📅 Esta semana';

    return null;
  };

  return (
    <div className="min-h-screen bg-bolao-dark text-white">
      <SEOHead
        title="📅 Calendário de Sorteios - BolãoMax"
        description="Veja todos os sorteios das loterias brasileiras. Mega da Virada, próximos sorteios, alertas e exportar para Google Calendar."
        keywords={["calendário sorteios", "mega sena", "loteria 2025", "agenda loteria"]}
        pageType="lottery"
        canonicalUrl="https://bolaomax.com.br/calendario"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho sem header específico */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-bolao-green" />
            <h1 className="text-3xl sm:text-4xl font-extrabold">Calendário de Sorteios</h1>
          </div>
          <p className="text-muted-foreground">
            Veja todos os sorteios do mês, receba alertas e exporte para seu calendário pessoal
          </p>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between rounded-lg border border-bolao-card-border bg-bolao-card p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={mesPasses}
              className="text-muted-foreground hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {MESES[mes - 1]} de {ano}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={proximoMes}
              className="text-muted-foreground hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Botão Hoje */}
          <Button
            onClick={voltarHoje}
            className="bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold"
          >
            Hoje
          </Button>

          {/* Filtro de loteria */}
          <select
            value={filtroLoteria || ''}
            onChange={(e) => setFiltroLoteria(e.target.value || null)}
            className="rounded-lg border border-bolao-card-border bg-bolao-card px-4 py-2 text-white focus:outline-none focus:border-bolao-green"
          >
            <option value="">Todas as loterias</option>
            <option value="megasena">Mega-Sena</option>
            <option value="lotofacil">Lotofácil</option>
            <option value="quina">Quina</option>
            <option value="lotomania">Lotomania</option>
            <option value="duplasena">Dupla Sena</option>
            <option value="timemania">Timemania</option>
            <option value="diadesorte">Dia de Sorte</option>
            <option value="supersete">Super Sete</option>
            <option value="federal">Federal</option>
          </select>

          {/* Botões de visualização e ações */}
          <div className="flex gap-2">
            <Button
              variant={visualizacao === 'calendario' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualizacao('calendario')}
              className="flex-1"
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Cal.
            </Button>
            <Button
              variant={visualizacao === 'lista' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualizacao('lista')}
              className="flex-1"
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-1" />
              .ics
            </Button>
          </div>
        </div>

        {/* Visualização Calendário */}
        {visualizacao === 'calendario' && (
          <Card className="p-6 bg-bolao-card border-bolao-card-border mb-8">
            {/* Header dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="p-2 text-center text-sm font-semibold text-muted-foreground"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias vazios do início */}
            {Array.from({ length: primeiroDia }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Dias do mês */}
            {diasMes.map((dia) => {
              const sorteios = getSorteiosDia(dia);
              const hoje = new Date();
              const ehHoje =
                dia === hoje.getDate() &&
                mes === hoje.getMonth() + 1 &&
                ano === hoje.getFullYear();

              return (
                <div
                  key={dia}
                  className={`p-2 rounded-lg border transition-colors ${
                    ehHoje
                      ? 'border-bolao-green bg-bolao-green/10'
                      : sorteios.length > 0
                        ? 'border-bolao-card-border bg-bolao-card'
                        : 'border-bolao-card-border'
                  } ${sorteios.length === 0 && !ehHoje ? 'opacity-50' : ''}`}
                  style={{
                    gridColumn: dia === diasMes[0] ? primeiroDia + 1 : 'auto',
                  }}
                >
                  <div className="text-sm font-semibold mb-1">{dia}</div>

                  {sorteios.length > 0 && (
                    <div className="space-y-1">
                      {sorteios.slice(0, 2).map((sorteio) => (
                        <div
                          key={sorteio.id}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${CORES_LOTERIAS[sorteio.tipo as keyof typeof CORES_LOTERIAS]}33`,
                            borderLeft: `2px solid ${CORES_LOTERIAS[sorteio.tipo as keyof typeof CORES_LOTERIAS]}`,
                          }}
                        >
                          <p className="font-semibold truncate">{sorteio.nome}</p>
                        </div>
                      ))}

                      {sorteios.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{sorteios.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        )}

        {/* Visualização Lista */}
        {visualizacao === 'lista' && (
          <div className="space-y-4">
            {sorteiosFiltrados.length === 0 ? (
              <Card className="p-8 bg-bolao-card border-bolao-card-border text-center">
                <p className="text-muted-foreground">
                  Nenhum sorteio encontrado para este período
                </p>
              </Card>
            ) : (
              sorteiosFiltrados.map((sorteio) => (
                <Card
                  key={sorteio.id}
                  className="p-4 bg-bolao-card border-bolao-card-border hover:border-bolao-green/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: CORES_LOTERIAS[sorteio.tipo as keyof typeof CORES_LOTERIAS],
                          }}
                        />
                        <h3 className="text-lg font-bold">{sorteio.nome}</h3>
                        {sorteio.especial && (
                          <Badge className="bg-red-500 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Especial
                          </Badge>
                        )}
                        {getProximityBadge(sorteio.data) && (
                          <Badge className="bg-bolao-green text-bolao-dark">
                            {getProximityBadge(sorteio.data)}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data</p>
                          <p className="font-semibold">
                            {new Date(sorteio.data).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Hora</p>
                          <p className="font-semibold">{sorteio.hora}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prêmio</p>
                          <p className="font-semibold text-bolao-green">{sorteio.premio}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Adicionar alerta"
                      >
                        <Bell className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Adicionar ao Google Calendar"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Widget de Próximos Sorteios */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border-bolao-green/30">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-bolao-green" />
              Próximos Sorteios
            </h3>
            <div className="space-y-3">
              {sorteiosFiltrados.slice(0, 3).map((sorteio) => (
                <div key={sorteio.id} className="flex justify-between text-sm">
                  <span>{sorteio.nome}</span>
                  <span className="text-bolao-green font-semibold">{sorteio.data}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-400" />
              Especiais
            </h3>
            <div className="text-sm space-y-2">
              <p>🎄 <strong>Mega da Virada</strong></p>
              <p className="text-muted-foreground">31 de dezembro de 2025</p>
              <p className="text-red-400 font-semibold">R$ 300.000.000</p>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-bolao-green/20 to-bolao-green/5 border-bolao-green/30">
            <h3 className="font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold" size="sm">
                📥 Exportar iCal
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" size="sm">
                🔗 Google Calendar
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
