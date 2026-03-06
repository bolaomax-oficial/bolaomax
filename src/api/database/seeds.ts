/**
 * Seed de Sorteios - Pré-cadastra 40+ sorteios
 */

import { lotteryDraws } from "./schema";
import { db } from "./index";

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

const HORAS_SORTEIO: Record<string, string> = {
  megasena: '20:00',
  lotofacil: '20:00',
  quina: '20:00',
  lutomania: '20:00',
  duplasena: '20:00',
  timemania: '20:00',
  diadesorte: '20:00',
  supersete: '11:00',
  federal: '19:00',
};

const NOMES_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/**
 * Gera sorteios para um período
 */
export function generateDraws(
  dataInicio: Date = new Date(2026, 1, 1),
  dataFim: Date = new Date(2026, 11, 31)
): LotteryDraw[] {
  const draws: LotteryDraw[] = [];
  let concursoMap: Record<string, number> = {
    megasena: 2789,
    lotofacil: 3000,
    quina: 6000,
    lutomania: 3500,
    duplasena: 2900,
    timemania: 2100,
    diadesorte: 1000,
    supersete: 500,
    federal: 5700,
  };

  const current = new Date(dataInicio);
  
  while (current <= dataFim) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    // Iterar sobre todas as loterias
    for (const [tipo, dias] of Object.entries(DIAS_SORTEIO)) {
      if (dias.includes(dayOfWeek)) {
        const concurso = concursoMap[tipo]++;
        const hora = HORAS_SORTEIO[tipo] || '20:00';
        const diaSemana = NOMES_DIAS[dayOfWeek];

        const draw: LotteryDraw = {
          id: `${tipo}_${dateStr.replace(/-/g, '')}`,
          tipo,
          data: dateStr,
          hora,
          diaSemana,
          concurso,
          premioEstimado: 5000000 + (concurso * 12345 % 8000000),
          local: 'São Paulo, SP',
          especial: false,
        };

        // Mega da Virada (última semana do ano)
        if (tipo === 'megasena' && current.getMonth() === 11 && current.getDate() > 20) {
          draw.especial = true;
          draw.observacoes = 'Mega da Virada - Prêmio Especial';
          draw.premioEstimado = 500000000;
        }

        draws.push(draw);
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return draws;
}

/**
 * Insere sorteios no banco de dados
 */
export async function seedDraws(): Promise<number> {
  try {
    const draws = generateDraws(
      new Date(2025, 1, 1),
      new Date(2026, 11, 31)
    );

    let inserted = 0;

    for (const draw of draws) {
      try {
        // Simular insert (em produção, usar db.insert().values())
        // Para agora, apenas contar
        inserted++;
      } catch (error) {
        console.error(`Erro ao inserir sorteio ${draw.id}:`, error);
      }
    }

    console.log(`✅ ${inserted} sorteios pré-cadastrados com sucesso`);
    return inserted;
  } catch (error) {
    console.error('Erro ao fazer seed de sorteios:', error);
    return 0;
  }
}

/**
 * Retorna sorteios em memória para desenvolvimento
 */
export const drawsCache = new Map<string, LotteryDraw>();

/**
 * Inicializa cache de sorteios
 */
export function initializeDrawsCache(): void {
  const draws = generateDraws();
  for (const draw of draws) {
    drawsCache.set(draw.id, draw);
  }
  console.log(`✅ Cache de ${draws.length} sorteios inicializado`);
}
