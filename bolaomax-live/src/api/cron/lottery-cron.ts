/**
 * Sistema de Cron Jobs para Automação
 * 
 * Agenda:
 * - A cada 30 minutos: Verificar novos resultados
 * - A cada 1 hora: Atualizar estatísticas
 * - A cada 24 horas: Limpeza de cache
 * - Dias de sorteio: Verificação intensiva
 */

import { updateAllLotteries, updateSingleLottery } from '../services/lottery-updater';
import { checkPrizesAndNotify } from '../services/notification-service';
import { cleanOldLogs } from '../services/analytics-service';

// Configuração de intervalos (em milissegundos)
const INTERVALS = {
  CHECK_RESULTS: 30 * 60 * 1000, // 30 minutos
  UPDATE_STATS: 60 * 60 * 1000, // 1 hora
  CLEAN_CACHE: 24 * 60 * 60 * 1000, // 24 horas
  INTENSIVE_CHECK: 10 * 60 * 1000, // 10 minutos (dias de sorteio)
};

// Dias de sorteio por loteria
const DRAW_DAYS = {
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

// Horários típicos de sorteio (formato 24h)
const DRAW_TIMES = {
  start: 19, // 19:00
  end: 22, // 22:00
};

let activeJobs: NodeJS.Timeout[] = [];
let isRunning = false;

/**
 * Verifica se hoje é dia de sorteio para uma loteria
 */
function isDrawDay(lottery: keyof typeof DRAW_DAYS): boolean {
  const today = new Date().getDay(); // 0 = Domingo, 6 = Sábado
  return DRAW_DAYS[lottery].includes(today);
}

/**
 * Verifica se está próximo ao horário de sorteio
 */
function isNearDrawTime(): boolean {
  const hour = new Date().getHours();
  return hour >= DRAW_TIMES.start - 1 && hour <= DRAW_TIMES.end + 1;
}

/**
 * Job: Verificar novos resultados (PADRÃO)
 */
async function checkResultsJob() {
  console.log('[CRON] 🔄 Executando verificação de resultados...');
  
  try {
    const result = await updateAllLotteries();
    console.log(`[CRON] ✅ Verificação concluída: ${result.success} sucesso, ${result.failed} falhas`);
    
    // Se houver novos resultados, verificar prêmios e enviar notificações
    if (result.success > 0) {
      await checkPrizesAndNotify();
    }
  } catch (error) {
    console.error('[CRON] ❌ Erro na verificação de resultados:', error);
  }
}

/**
 * Job: Verificação intensiva (dias de sorteio)
 */
async function intensiveCheckJob() {
  const lotteries = Object.keys(DRAW_DAYS) as (keyof typeof DRAW_DAYS)[];
  
  for (const lottery of lotteries) {
    if (isDrawDay(lottery) && isNearDrawTime()) {
      console.log(`[CRON] 🎯 Verificação intensiva: ${lottery}`);
      await updateSingleLottery(lottery);
    }
  }
}

/**
 * Job: Limpeza de cache e logs antigos
 */
async function cleanupJob() {
  console.log('[CRON] 🧹 Executando limpeza de cache e logs...');
  
  try {
    await cleanOldLogs(30); // Remove logs com mais de 30 dias
    console.log('[CRON] ✅ Limpeza concluída');
  } catch (error) {
    console.error('[CRON] ❌ Erro na limpeza:', error);
  }
}

/**
 * Inicia todos os cron jobs
 */
export function startCronJobs() {
  if (isRunning) {
    console.log('[CRON] ⚠️  Cron jobs já estão rodando');
    return;
  }

  console.log('[CRON] ========================================');
  console.log('[CRON] 🚀 INICIANDO SISTEMA DE AUTOMAÇÃO');
  console.log('[CRON] ========================================');
  console.log(`[CRON] ✓ Verificação de resultados: a cada ${INTERVALS.CHECK_RESULTS / 60000} minutos`);
  console.log(`[CRON] ✓ Verificação intensiva: a cada ${INTERVALS.INTENSIVE_CHECK / 60000} minutos (dias de sorteio)`);
  console.log(`[CRON] ✓ Limpeza de cache: a cada ${INTERVALS.CLEAN_CACHE / 60000 / 60} horas`);
  console.log('[CRON] ========================================');

  // Job 1: Verificação normal (30 minutos)
  const job1 = setInterval(checkResultsJob, INTERVALS.CHECK_RESULTS);
  activeJobs.push(job1);

  // Job 2: Verificação intensiva (10 minutos em dias de sorteio)
  const job2 = setInterval(intensiveCheckJob, INTERVALS.INTENSIVE_CHECK);
  activeJobs.push(job2);

  // Job 3: Limpeza de cache (24 horas)
  const job3 = setInterval(cleanupJob, INTERVALS.CLEAN_CACHE);
  activeJobs.push(job3);

  isRunning = true;

  // Executa primeira verificação imediatamente
  setTimeout(() => {
    console.log('[CRON] 🎬 Executando primeira verificação...');
    checkResultsJob();
  }, 5000); // Aguarda 5 segundos após iniciar
}

/**
 * Para todos os cron jobs
 */
export function stopCronJobs() {
  console.log('[CRON] 🛑 Parando sistema de automação...');
  
  activeJobs.forEach(job => clearInterval(job));
  activeJobs = [];
  isRunning = false;
  
  console.log('[CRON] ✅ Sistema de automação parado');
}

/**
 * Reinicia todos os cron jobs
 */
export function restartCronJobs() {
  stopCronJobs();
  setTimeout(startCronJobs, 1000);
}

/**
 * Verifica status dos cron jobs
 */
export function getCronStatus() {
  return {
    isRunning,
    activeJobs: activeJobs.length,
    config: {
      checkResultsInterval: INTERVALS.CHECK_RESULTS / 60000 + ' minutos',
      intensiveCheckInterval: INTERVALS.INTENSIVE_CHECK / 60000 + ' minutos',
      cleanupInterval: INTERVALS.CLEAN_CACHE / 60000 / 60 + ' horas',
    },
    drawSchedule: DRAW_DAYS,
  };
}

/**
 * Executa verificação manual (útil para testes)
 */
export async function manualCheck() {
  console.log('[CRON] 🔧 Verificação manual iniciada...');
  await checkResultsJob();
}

// Auto-iniciar se NODE_ENV === production
if (process.env.NODE_ENV === 'production') {
  console.log('[CRON] 🚀 Modo produção detectado - iniciando automação');
  startCronJobs();
}
