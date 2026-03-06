/**
 * Serviço de Calendário de Sorteios
 * 
 * Gera 40+ sorteios pré-cadastrados para todas as loterias
 */

export interface LotteryDraw {
  id: string;
  tipo: string;
  data: string;
  hora: string;
  diaSemana: string;
  concurso?: number;
  premioEstimado?: number;
  local: string;
  observacoes?: string;
  especial?: boolean;
}

// Calendário de sorteios para 2025-2026
const DIAS_SORTEIO = {
  megasena: [3, 6], // Quarta (3) e Sábado (6)
  lotofacil: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  quina: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  lotomania: [2, 4, 6], // Terça, Quinta e Sábado
  duplasena: [2, 4, 6], // Terça, Quinta e Sábado
  timemania: [2, 4, 6], // Terça, Quinta e Sábado
  diadesorte: [2, 4, 6], // Terça, Quinta e Sábado
  supersete: [1, 3, 5], // Segunda, Quarta e Sexta
  federal: [3, 6], // Quarta e Sábado
};

const NOMES_LOTERIAS = {
  megasena: 'Mega-Sena',
  lotofacil: 'Lotofácil',
  quina: 'Quina',
  lotomania: 'Lotomania',
  duplasena: 'Dupla Sena',
  timemania: 'Timemania',
  diadesorte: 'Dia de Sorte',
  supersete: 'Super Sete',
  federal: 'Federal',
};

const HORAS_SORTEIO = {
  megasena: '20:00',
  lotofacil: '20:00',
  quina: '20:00',
  lotomania: '20:00',
  duplasena: '20:00',
  timemania: '20:00',
  diadesorte: '20:00',
  supersete: '15:00',
  federal: '19:00',
};

const PREMIOS_ESTIMADOS = {
  megasena: 5000000,
  lotofacil: 1500000,
  quina: 1200000,
  lotomania: 3500000,
  duplasena: 2500000,
  timemania: 1800000,
  diadesorte: 800000,
  supersete: 500000,
  federal: 500000,
};

const DIAS_SEMANA = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado'
];

/**
 * Gera todos os sorteios de um período
 */
export function generateDraws(
  mesInicio: number,
  anoInicio: number,
  mesFim: number,
  anoFim: number
): LotteryDraw[] {
  const draws: LotteryDraw[] = [];
  let concursos = {
    megasena: 2789,
    lotofacil: 3258,
    quina: 6587,
    lotomania: 2850,
    duplasena: 2789,
    timemania: 2145,
    diadesorte: 1056,
    supersete: 678,
    federal: 5987,
  };

  // Itera por cada mês do período
  for (let ano = anoInicio; ano <= anoFim; ano++) {
    const mesStart = ano === anoInicio ? mesInicio : 1;
    const mesEnd = ano === anoFim ? mesFim : 12;

    for (let mes = mesStart; mes <= mesEnd; mes++) {
      // Número de dias do mês
      const ultimoDia = new Date(ano, mes, 0).getDate();

      // Para cada loteria
      for (const [tipo, diasSorteio] of Object.entries(DIAS_SORTEIO)) {
        // Para cada dia de sorteio da loteria
        for (const dia of diasSorteio) {
          if (dia <= ultimoDia) {
            const data = new Date(ano, mes - 1, dia);
            const dataFormatada = data.toISOString().split('T')[0];
            const diaSemana = data.getDay();
            const especial =
              tipo === 'megasena' &&
              mes === 12 &&
              dia >= 20 &&
              dia <= 31; // Mega da Virada

            draws.push({
              id: `${tipo}_${ano}_${mes.toString().padStart(2, '0')}_${dia.toString().padStart(2, '0')}`,
              tipo,
              data: dataFormatada,
              hora: HORAS_SORTEIO[tipo as keyof typeof HORAS_SORTEIO],
              diaSemana: DIAS_SEMANA[diaSemana],
              concurso: (concursos[tipo as keyof typeof concursos] || 1) + Math.floor(Math.random() * 5),
              premioEstimado: PREMIOS_ESTIMADOS[tipo as keyof typeof PREMIOS_ESTIMADOS],
              local: 'Auditório da Caixa Econômica Federal, Brasília - DF',
              observacoes: especial
                ? '🎄 MEGA DA VIRADA - Maior prêmio do ano!'
                : undefined,
              especial: especial ? true : false,
            });
          }
        }
      }
    }
  }

  return draws.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

/**
 * Busca sorteios de um mês específico
 */
export function getDrawsByMonth(mes: number, ano: number): LotteryDraw[] {
  const draws = generateDraws(mes, ano, mes, ano);
  return draws;
}

/**
 * Busca próximos sorteios (próximos 30 dias)
 */
export function getUpcomingDraws(dias: number = 30): LotteryDraw[] {
  const hoje = new Date();
  const dataFim = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);

  const draws = generateDraws(
    hoje.getMonth() + 1,
    hoje.getFullYear(),
    dataFim.getMonth() + 1,
    dataFim.getFullYear()
  );

  return draws.filter((draw) => {
    const drawDate = new Date(draw.data);
    return drawDate >= hoje && drawDate <= dataFim;
  });
}

/**
 * Busca sorteios por loteria
 */
export function getDrawsByLottery(tipo: string, mes?: number, ano?: number): LotteryDraw[] {
  const hoje = new Date();
  const mesStart = mes || hoje.getMonth() + 1;
  const anoStart = ano || hoje.getFullYear();

  const draws = generateDraws(mesStart, anoStart, mesStart, anoStart);

  return draws.filter((draw) => draw.tipo === tipo);
}

/**
 * Gera iCal (.ics) para importar em calendários
 */
export function generateICalendar(draws: LotteryDraw[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BolãoMax//Lottery Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Calendário de Sorteios - BolãoMax',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'X-WR-CALDESC:Sorteios de todas as loterias brasileiras',
  ];

  for (const draw of draws) {
    const [ano, mes, dia] = draw.data.split('-');
    const [hora, minuto] = draw.hora.split(':');

    // DTSTART em formato UTC
    const dtStart = `${ano}${mes}${dia}T${hora}${minuto}00`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${draw.id}@bolaomax.com.br`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtStart}`);
    lines.push(`SUMMARY:🎰 Sorteio ${NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS]}`);
    lines.push(`DESCRIPTION:${draw.observacoes || `Sorteio da ${NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS]}`}`);
    lines.push(`LOCATION:${draw.local}`);
    lines.push(`CATEGORIES:${draw.tipo}`);
    if (draw.especial) {
      lines.push('PRIORITY:1');
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Gera URL para Google Calendar
 */
export function generateGoogleCalendarUrl(draw: LotteryDraw): string {
  const [ano, mes, dia] = draw.data.split('-');
  const startTime = `${ano}${mes}${dia}T${draw.hora.replace(':', '')}00`;
  const endTime = `${ano}${mes}${dia}T${String(parseInt(draw.hora.split(':')[0]) + 1).padStart(2, '0')}${draw.hora.split(':')[1]}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `🎰 Sorteio ${NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS]}`,
    details: draw.observacoes || `Sorteio da ${NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS]}`,
    location: draw.local,
    startTime,
    endTime,
    ctz: 'America/Sao_Paulo',
  });

  return `https://calendar.google.com/calendar/r/eventedit?${params.toString()}`;
}

/**
 * Calcula badge de proximidade
 */
export function getProximityBadge(data: string): string | null {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEvento = new Date(data);
  dataEvento.setHours(0, 0, 0, 0);

  const diferenca = (dataEvento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

  if (diferenca === 0) return '📅 Hoje';
  if (diferenca === 1) return '📅 Amanhã';
  if (diferenca > 1 && diferenca <= 7) return '📅 Esta semana';

  return null;
}

/**
 * Agrupa sorteios por semana
 */
export function groupDrawsByWeek(draws: LotteryDraw[]): Record<string, LotteryDraw[]> {
  const grouped: Record<string, LotteryDraw[]> = {};

  for (const draw of draws) {
    const date = new Date(draw.data);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());

    const weekKey = weekStart.toISOString().split('T')[0];

    if (!grouped[weekKey]) {
      grouped[weekKey] = [];
    }

    grouped[weekKey].push(draw);
  }

  return grouped;
}

/**
 * Formata data para exibição
 */
export function formatDate(data: string, locale: string = 'pt-BR'): string {
  const date = new Date(data + 'T00:00:00');
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Gera iCal (.ics) para sorteios
 */
export function generateiCal(draws: LotteryDraw[]): string {
  if (draws.length === 0) {
    return generateEmptyiCal();
  }

  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BolãoMax//Calendario de Sorteios//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Sorteios da Caixa
X-WR-TIMEZONE:America/Sao_Paulo
X-WR-CALDESC:Calendário de sorteios das loterias da Caixa Econômica Federal
BEGIN:VTIMEZONE
TZID:America/Sao_Paulo
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:BRT
END:STANDARD
END:VTIMEZONE
`;

  for (const draw of draws) {
    const startTime = draw.hora.replace(":", "") + "00";
    const dateStr = draw.data.replace(/-/g, "");
    const dtstart = `${dateStr}T${startTime}`;
    const dtend = `${dateStr}T${(parseInt(startTime.slice(0, 2)) + 2).toString().padStart(2, "0")}${startTime.slice(2)}`;

    const titulo = draw.concurso 
      ? `${NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS]} - Concurso ${draw.concurso}`
      : NOMES_LOTERIAS[draw.tipo as keyof typeof NOMES_LOTERIAS];
    
    const descricao = `Sorteio ${titulo}\\nHorário: ${draw.hora}\\nLocal: ${draw.local}\\nPrêmio Estimado: R$ ${(draw.premioEstimado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    ical += `BEGIN:VEVENT
DTSTART;TZID=America/Sao_Paulo:${dtstart}
DTEND;TZID=America/Sao_Paulo:${dtend}
SUMMARY:${titulo}
DESCRIPTION:${descricao}
LOCATION:${draw.local}
UID:${draw.id}@bolaomax.local
DTSTAMP:${new Date().toISOString().replace(/[:-]/g, "").split(".")[0]}Z
STATUS:CONFIRMED
CATEGORIES:Loteria
END:VEVENT
`;
  }

  ical += `END:VCALENDAR`;

  return ical;
}

function generateEmptyiCal(): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BolãoMax//Calendario de Sorteios//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Sorteios da Caixa
X-WR-TIMEZONE:America/Sao_Paulo
END:VCALENDAR`;
}
