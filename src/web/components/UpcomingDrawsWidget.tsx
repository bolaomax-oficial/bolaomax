import { Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';

interface ProximoSorteio {
  id: string;
  tipo: string;
  nome: string;
  data: string;
  hora: string;
  premio: string;
  badge?: string;
  especial?: boolean;
}

interface UpcomingDrawsWidgetProps {
  sorteios?: ProximoSorteio[];
}

export function UpcomingDrawsWidget({ sorteios = [] }: UpcomingDrawsWidgetProps) {
  const mockSorteios = sorteios.length > 0 ? sorteios : [
    {
      id: 'megasena_2025_02_19',
      tipo: 'megasena',
      nome: '🎰 Mega-Sena',
      data: '2025-02-19',
      hora: '20:00',
      premio: 'R$ 5.000.000',
      badge: '📅 Amanhã',
      especial: false,
    },
    {
      id: 'lotofacil_2025_02_18',
      tipo: 'lotofacil',
      nome: '🎰 Lotofácil',
      data: '2025-02-18',
      hora: '20:00',
      premio: 'R$ 1.500.000',
      badge: '📅 Hoje',
      especial: false,
    },
    {
      id: 'quina_2025_02_20',
      tipo: 'quina',
      nome: '🎰 Quina',
      data: '2025-02-20',
      hora: '20:00',
      premio: 'R$ 1.200.000',
      badge: '📅 Esta semana',
      especial: false,
    },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-bolao-card to-bolao-card/50 border-bolao-card-border">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-bolao-green" />
          <h3 className="text-lg font-bold">Próximos Sorteios</h3>
        </div>
        <Link to="/calendario">
          <Button variant="ghost" size="sm" className="text-bolao-green hover:text-bolao-green-dark">
            Ver todos
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Lista de sorteios */}
      <div className="space-y-3">
        {mockSorteios.slice(0, 5).map((sorteio, index) => (
          <div
            key={sorteio.id}
            className="flex items-center justify-between p-3 rounded-lg bg-bolao-dark/50 hover:bg-bolao-dark transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{sorteio.nome}</span>
                {sorteio.badge && (
                  <span className="text-xs px-2 py-0.5 rounded bg-bolao-green/20 text-bolao-green">
                    {sorteio.badge}
                  </span>
                )}
                {sorteio.especial && (
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Especial
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(sorteio.data).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
                {' · '}
                {sorteio.hora}
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-bolao-green text-sm">{sorteio.premio}</p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-white mt-1"
              >
                Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-bolao-card-border">
        <Button
          className="w-full bg-bolao-green hover:bg-bolao-green-dark text-bolao-dark font-semibold text-sm"
          size="sm"
        >
          📥 Exportar .ics
        </Button>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
          size="sm"
        >
          🔗 Google Agenda
        </Button>
      </div>
    </Card>
  );
}

export default UpcomingDrawsWidget;
