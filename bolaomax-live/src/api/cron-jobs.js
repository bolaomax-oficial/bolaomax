/**
 * Cron Job - Automação de Bolões
 * 
 * Agenda tarefas automáticas:
 * - A cada minuto: Verifica encerramentos (desenvolvimento)
 * - A cada hora: Verifica visibilidade e bolões especiais
 * - Às 22:00: Ativa novos bolões do próximo ciclo
 */

import cron from 'node-cron';
import { executarTodasTarefasAutomacao } from './services/automacao-boloes.js';

let cronJobAtivo = null;

/**
 * Iniciar Cron Jobs
 */
export const iniciarCronJobs = () => {
  console.log('\n🕐 Inicializando Cron Jobs de Automação de Bolões...\n');

  // =============================================================
  // PRODUÇÃO: A cada 5 minutos (verifica encerramentos)
  // =============================================================
  const jobVerificacao = cron.schedule('*/5 * * * *', async () => {
    console.log('\n[CRON] Executando verificação de encerramentos...');
    try {
      await executarTodasTarefasAutomacao();
    } catch (error) {
      console.error('[CRON] Erro na verificação:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  });

  // =============================================================
  // ATIVAÇÃO DIÁRIA: Às 22:00 (cria novos bolões)
  // =============================================================
  const jobAtivacaoDiaria = cron.schedule('0 22 * * *', async () => {
    console.log('\n[CRON] ✨ Executando ativação diária de novos bolões (22:00)...');
    try {
      await executarTodasTarefasAutomacao();
    } catch (error) {
      console.error('[CRON] Erro na ativação diária:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
  });

  // =============================================================
  // DESENVOLVIMENTO: A cada minuto (para testes)
  // Descomente apenas em desenvolvimento
  // =============================================================
  // const jobDesenvolvimento = cron.schedule('* * * * *', async () => {
  //   console.log('\n[CRON-DEV] Verificação rápida (1 min)...');
  //   await executarTodasTarefasAutomacao();
  // }, {
  //   scheduled: true,
  //   timezone: 'America/Sao_Paulo'
  // });

  cronJobAtivo = {
    verificacao: jobVerificacao,
    ativacaoDiaria: jobAtivacaoDiaria,
    // desenvolvimento: jobDesenvolvimento, // descomente se usar
  };

  console.log('✅ Cron Jobs iniciados com sucesso!');
  console.log('   - Verificação de encerramentos: a cada 5 minutos');
  console.log('   - Ativação diária: 22:00 (horário de Brasília)');
  console.log('');

  return cronJobAtivo;
};

/**
 * Parar Cron Jobs
 */
export const pararCronJobs = () => {
  if (cronJobAtivo) {
    Object.values(cronJobAtivo).forEach(job => {
      if (job && job.stop) {
        job.stop();
      }
    });
    console.log('🛑 Cron Jobs parados');
    cronJobAtivo = null;
  }
};

/**
 * Status dos Cron Jobs
 */
export const statusCronJobs = () => {
  return {
    ativo: cronJobAtivo !== null,
    jobs: cronJobAtivo ? Object.keys(cronJobAtivo) : [],
    timezone: 'America/Sao_Paulo',
  };
};

export default {
  iniciarCronJobs,
  pararCronJobs,
  statusCronJobs,
};
