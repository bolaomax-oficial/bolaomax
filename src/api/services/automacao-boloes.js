/**
 * Serviço de Automação de Bolões
 * 
 * Responsável por:
 * - Encerrar bolões automaticamente quando tempo expirar
 * - Ativar novos bolões diariamente às 22:00
 * - Gerenciar visibilidade de bolões (ocultar expirados)
 * - Processar bolões especiais
 */

import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';

// ============================================================
// CONFIGURAÇÕES
// ============================================================

/**
 * Buscar configurações de automação
 */
export const buscarConfiguracoes = async () => {
  const result = await db.all(sql`
    SELECT * FROM configuracoes_automacao 
    WHERE id = 'config-automacao-001'
    LIMIT 1
  `);
  
  return result[0] || null;
};

/**
 * Atualizar configurações de automação
 */
export const atualizarConfiguracoes = async (configuracoes) => {
  const {
    horario_ativacao_diaria,
    ativar_novos_boloes_automaticamente,
    encerrar_automaticamente,
    minutos_antecedencia_encerramento,
    ocultar_boloes_expirados,
    mostrar_apenas_data_vigente,
    notificar_encerramento,
    notificar_ativacao,
    status_sistema,
  } = configuracoes;

  await db.run(sql`
    UPDATE configuracoes_automacao 
    SET 
      horario_ativacao_diaria = ${horario_ativacao_diaria},
      ativar_novos_boloes_automaticamente = ${ativar_novos_boloes_automaticamente ? 1 : 0},
      encerrar_automaticamente = ${encerrar_automaticamente ? 1 : 0},
      minutos_antecedencia_encerramento = ${minutos_antecedencia_encerramento},
      ocultar_boloes_expirados = ${ocultar_boloes_expirados ? 1 : 0},
      mostrar_apenas_data_vigente = ${mostrar_apenas_data_vigente ? 1 : 0},
      notificar_encerramento = ${notificar_encerramento ? 1 : 0},
      notificar_ativacao = ${notificar_ativacao ? 1 : 0},
      status_sistema = ${status_sistema},
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = 'config-automacao-001'
  `);

  return await buscarConfiguracoes();
};

// ============================================================
// ENCERRAMENTO AUTOMÁTICO
// ============================================================

/**
 * Encerrar bolões que atingiram o horário de fechamento
 */
export const encerrarBoloesExpirados = async () => {
  const config = await buscarConfiguracoes();
  
  if (!config || !config.encerrar_automaticamente) {
    console.log('[AUTOMAÇÃO] Encerramento automático está desabilitado');
    return { success: true, message: 'Encerramento automático desabilitado', boloesEncerrados: [] };
  }

  const now = new Date().toISOString();
  const boloesEncerrados = [];
  const erros = [];

  try {
    // Buscar bolões que devem ser encerrados
    const boloes = await db.all(sql`
      SELECT * FROM boloes 
      WHERE status = 'aberto' 
        AND datetime(data_fechamento) <= datetime(${now})
        AND encerramento_automatico = 1
        AND visivel = 1
    `);

    console.log(`[AUTOMAÇÃO] Encontrados ${boloes.length} bolões para encerrar`);

    // Encerrar cada bolão
    for (const bolao of boloes) {
      try {
        // Atualizar status do bolão
        await db.run(sql`
          UPDATE boloes 
          SET 
            status = 'encerrado',
            encerrado_automaticamente = 1,
            data_encerramento_real = ${now},
            visivel = ${config.ocultar_boloes_expirados ? 0 : 1},
            atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ${bolao.id}
        `);

        // Registrar no histórico
        await registrarHistorico({
          tipo_acao: 'encerramento_automatico',
          descricao: `Bolão "${bolao.nome}" encerrado automaticamente`,
          bolao_id: bolao.id,
          bolao_tipo: bolao.tipo_bolao || 'normal',
          tipo_loteria: bolao.tipo,
          status_anterior: 'aberto',
          status_novo: 'encerrado',
          sucesso: 1,
        });

        boloesEncerrados.push({
          id: bolao.id,
          nome: bolao.nome,
          tipo: bolao.tipo,
        });

        console.log(`[AUTOMAÇÃO] ✓ Bolão encerrado: ${bolao.nome}`);

      } catch (error) {
        console.error(`[AUTOMAÇÃO] ✗ Erro ao encerrar bolão ${bolao.id}:`, error);
        erros.push({
          bolao_id: bolao.id,
          erro: error.message,
        });

        // Registrar erro no histórico
        await registrarHistorico({
          tipo_acao: 'encerramento_automatico',
          descricao: `Falha ao encerrar bolão "${bolao.nome}"`,
          bolao_id: bolao.id,
          bolao_tipo: bolao.tipo_bolao || 'normal',
          tipo_loteria: bolao.tipo,
          status_anterior: 'aberto',
          status_novo: 'aberto',
          sucesso: 0,
          mensagem_erro: error.message,
        });
      }
    }

    // Atualizar última execução
    await db.run(sql`
      UPDATE configuracoes_automacao 
      SET ultima_execucao_cron = ${now}
      WHERE id = 'config-automacao-001'
    `);

    return {
      success: true,
      message: `${boloesEncerrados.length} bolões encerrados com sucesso`,
      boloesEncerrados,
      erros: erros.length > 0 ? erros : undefined,
    };

  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro crítico ao encerrar bolões:', error);
    return {
      success: false,
      error: error.message,
      boloesEncerrados,
      erros,
    };
  }
};

// ============================================================
// ATIVAÇÃO DIÁRIA (22:00)
// ============================================================

/**
 * Ativar novos bolões para o próximo ciclo
 */
export const ativarNovosBoloesProximoCiclo = async () => {
  const config = await buscarConfiguracoes();
  
  if (!config || !config.ativar_novos_boloes_automaticamente) {
    console.log('[AUTOMAÇÃO] Ativação automática está desabilitada');
    return { success: true, message: 'Ativação automática desabilitada', boloesAtivados: [] };
  }

  console.log('[AUTOMAÇÃO] Iniciando ativação de novos bolões para próximo ciclo...');

  const now = new Date().toISOString();
  const boloesAtivados = [];
  const erros = [];

  try {
    // Ativar bolões que estavam aguardando e chegou a hora
    const boloes = await db.all(sql`
      SELECT * FROM boloes 
      WHERE status = 'aguardando' 
        AND datetime(data_abertura) <= datetime(${now})
    `);

    console.log(`[AUTOMAÇÃO] Encontrados ${boloes.length} bolões para ativar`);

    for (const bolao of boloes) {
      try {
        await db.run(sql`
          UPDATE boloes 
          SET 
            status = 'aberto',
            visivel = 1,
            atualizado_em = CURRENT_TIMESTAMP
          WHERE id = ${bolao.id}
        `);

        await registrarHistorico({
          tipo_acao: 'ativacao_diaria',
          descricao: `Bolão "${bolao.nome}" ativado automaticamente`,
          bolao_id: bolao.id,
          bolao_tipo: bolao.tipo_bolao || 'normal',
          tipo_loteria: bolao.tipo,
          status_anterior: 'aguardando',
          status_novo: 'aberto',
          sucesso: 1,
        });

        boloesAtivados.push({
          id: bolao.id,
          nome: bolao.nome,
          tipo: bolao.tipo,
        });

        console.log(`[AUTOMAÇÃO] ✓ Bolão ativado: ${bolao.nome}`);

      } catch (error) {
        console.error(`[AUTOMAÇÃO] ✗ Erro ao ativar bolão ${bolao.id}:`, error);
        erros.push({
          bolao_id: bolao.id,
          erro: error.message,
        });
      }
    }

    // Atualizar última execução
    await db.run(sql`
      UPDATE configuracoes_automacao 
      SET ultima_execucao_cron = ${now}
      WHERE id = 'config-automacao-001'
    `);

    return {
      success: true,
      message: `${boloesAtivados.length} bolões ativados com sucesso`,
      boloesAtivados,
      erros: erros.length > 0 ? erros : undefined,
    };

  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro crítico ao ativar bolões:', error);
    return {
      success: false,
      error: error.message,
      boloesAtivados,
      erros,
    };
  }
};

// ============================================================
// VISIBILIDADE
// ============================================================

/**
 * Ocultar bolões expirados (não da data vigente)
 */
export const atualizarVisibilidadeBoloes = async () => {
  const config = await buscarConfiguracoes();
  
  if (!config || !config.mostrar_apenas_data_vigente) {
    return { success: true, message: 'Filtro de data vigente desabilitado' };
  }

  const now = new Date().toISOString();

  try {
    // Ocultar bolões normais que não são da data vigente
    const result = await db.run(sql`
      UPDATE boloes 
      SET visivel = 0
      WHERE tipo_bolao = 'normal'
        AND datetime(data_fechamento) < datetime(${now})
        AND visivel = 1
    `);

    console.log(`[AUTOMAÇÃO] Bolões ocultados (fora da data vigente)`);

    return {
      success: true,
      boloesOcultados: result.changes || 0,
    };

  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro ao atualizar visibilidade:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// BOLÕES ESPECIAIS
// ============================================================

/**
 * Processar bolões especiais (verificar datas, ativar/desativar)
 */
export const processarBoloesEspeciais = async () => {
  const now = new Date().toISOString();

  try {
    // Ativar bolões especiais que chegaram na data de início
    const ativados = await db.run(sql`
      UPDATE boloes_especiais 
      SET 
        status = 'aberto',
        visivel = 1
      WHERE status = 'aguardando'
        AND datetime(data_inicio_vendas) <= datetime(${now})
        AND datetime(data_fim_vendas) > datetime(${now})
    `);

    // Encerrar bolões especiais que chegaram na data de fim
    const encerrados = await db.run(sql`
      UPDATE boloes_especiais 
      SET 
        status = 'encerrado',
        visivel = 0
      WHERE status = 'aberto'
        AND datetime(data_fim_vendas) <= datetime(${now})
    `);

    console.log(`[AUTOMAÇÃO] Especiais: ${ativados.changes || 0} ativados, ${encerrados.changes || 0} encerrados`);

    return {
      success: true,
      ativados: ativados.changes || 0,
      encerrados: encerrados.changes || 0,
    };

  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro ao processar bolões especiais:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================
// HISTÓRICO
// ============================================================

/**
 * Registrar ação no histórico
 */
export const registrarHistorico = async (dados) => {
  try {
    await db.run(sql`
      INSERT INTO historico_automacao_boloes (
        tipo_acao,
        descricao,
        bolao_id,
        bolao_tipo,
        tipo_loteria,
        status_anterior,
        status_novo,
        executado_por,
        sucesso,
        mensagem_erro,
        metadados
      ) VALUES (
        ${dados.tipo_acao},
        ${dados.descricao},
        ${dados.bolao_id || null},
        ${dados.bolao_tipo || null},
        ${dados.tipo_loteria || null},
        ${dados.status_anterior || null},
        ${dados.status_novo || null},
        ${dados.executado_por || 'sistema'},
        ${dados.sucesso ? 1 : 0},
        ${dados.mensagem_erro || null},
        ${dados.metadados ? JSON.stringify(dados.metadados) : null}
      )
    `);

    return true;
  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro ao registrar histórico:', error);
    return false;
  }
};

/**
 * Buscar histórico de automação
 */
export const buscarHistorico = async (filtros = {}) => {
  try {
    // Base query
    let conditions = [];
    let params = [];

    if (filtros.tipo_acao) {
      conditions.push(`tipo_acao = ?`);
      params.push(filtros.tipo_acao);
    }

    if (filtros.bolao_id) {
      conditions.push(`bolao_id = ?`);
      params.push(filtros.bolao_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filtros.limit || 100;

    // Usar query simples sem parâmetros dinâmicos complexos
    const historico = await db.all(sql`
      SELECT * FROM historico_automacao_boloes
      ORDER BY data_hora_execucao DESC 
      LIMIT ${limit}
    `);

    return historico;
  } catch (error) {
    console.error('[AUTOMAÇÃO] Erro ao buscar histórico:', error);
    return [];
  }
};

// ============================================================
// EXECUTAR TUDO (para Cron Job)
// ============================================================

/**
 * Executar todas as tarefas de automação
 */
export const executarTodasTarefasAutomacao = async () => {
  console.log('\n=================================================');
  console.log('🤖 AUTOMAÇÃO DE BOLÕES - EXECUÇÃO INICIADA');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}`);
  console.log('=================================================\n');

  const resultados = {
    timestamp: new Date().toISOString(),
    tarefas: {},
  };

  try {
    // 1. Processar bolões especiais
    console.log('📋 Processando bolões especiais...');
    resultados.tarefas.especiais = await processarBoloesEspeciais();

    // 2. Encerrar bolões expirados
    console.log('\n🔒 Encerrando bolões expirados...');
    resultados.tarefas.encerramento = await encerrarBoloesExpirados();

    // 3. Atualizar visibilidade
    console.log('\n👁️  Atualizando visibilidade...');
    resultados.tarefas.visibilidade = await atualizarVisibilidadeBoloes();

    // 4. Ativar novos bolões (apenas às 22:00)
    const horaAtual = new Date().getHours();
    if (horaAtual === 22) {
      console.log('\n✨ Ativando novos bolões do próximo ciclo...');
      resultados.tarefas.ativacao = await ativarNovosBoloesProximoCiclo();
    }

    console.log('\n=================================================');
    console.log('✅ AUTOMAÇÃO CONCLUÍDA COM SUCESSO');
    console.log('=================================================\n');

    // Registrar execução completa
    await registrarHistorico({
      tipo_acao: 'execucao_completa_cron',
      descricao: 'Ciclo completo de automação executado',
      sucesso: 1,
      metadados: resultados,
    });

    return {
      success: true,
      ...resultados,
    };

  } catch (error) {
    console.error('\n❌ ERRO NA AUTOMAÇÃO:', error);

    await registrarHistorico({
      tipo_acao: 'execucao_completa_cron',
      descricao: 'Erro ao executar ciclo de automação',
      sucesso: 0,
      mensagem_erro: error.message,
    });

    return {
      success: false,
      error: error.message,
      resultados,
    };
  }
};

export default {
  buscarConfiguracoes,
  atualizarConfiguracoes,
  encerrarBoloesExpirados,
  ativarNovosBoloesProximoCiclo,
  atualizarVisibilidadeBoloes,
  processarBoloesEspeciais,
  registrarHistorico,
  buscarHistorico,
  executarTodasTarefasAutomacao,
};
