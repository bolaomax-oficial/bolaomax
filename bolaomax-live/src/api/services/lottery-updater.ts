/**
 * Serviço de Atualização Automática de Resultados
 * 
 * Responsável por:
 * - Buscar resultados da API da Caixa
 * - Salvar no banco de dados
 * - Atualizar estatísticas
 * - Enviar notificações
 */

import { db } from '../database';
import { 
  lotteryResults, 
  updateHistory, 
  lotteryStatistics,
  type NewLotteryResult,
  type NewUpdateHistory,
} from '../database/schema';
import { 
  fetchLatestResult, 
  fetchAllResults,
  formatCaixaResult,
  type LotteryType,
} from '../integrations/caixa-api';
import { eq } from 'drizzle-orm';

/**
 * Salva resultado no banco de dados
 */
export async function saveLotteryResult(
  tipo: LotteryType,
  data: any
): Promise<boolean> {
  try {
    const id = `${tipo}_${data.numero}`;
    
    // Verifica se já existe
    const existing = await db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.id, id))
      .limit(1);

    const resultData: NewLotteryResult = {
      id,
      tipo,
      concurso: data.numero,
      data: new Date(data.dataApuracao).toISOString(),
      dezenas: JSON.stringify(data.listaDezenas),
      dezenas2: data.listaDezenasSegundoSorteio 
        ? JSON.stringify(data.listaDezenasSegundoSorteio) 
        : null,
      premios: JSON.stringify(data.listaRateioPremio),
      acumulado: data.acumulado,
      valorAcumulado: data.valorAcumuladoProximoConcurso,
      proximoConcurso: JSON.stringify({
        numero: data.numeroConcursoProximo,
        data: data.dataProximoConcurso,
        valorEstimado: data.valorEstimadoProximoConcurso,
      }),
      timeCoracao: data.nomeTimeCoracaoMesSorte || null,
      mesDaSorte: data.nomeTimeCoracaoMesSorte || null,
      metadados: JSON.stringify({
        localSorteio: data.localSorteio,
        valorArrecadado: data.valorArrecadado,
      }),
    };

    if (existing.length > 0) {
      // Atualiza existente
      await db
        .update(lotteryResults)
        .set({
          ...resultData,
          atualizadoEm: new Date().toISOString(),
        })
        .where(eq(lotteryResults.id, id));
      
      console.log(`[UPDATE SERVICE] Resultado atualizado: ${id}`);
    } else {
      // Insere novo
      await db.insert(lotteryResults).values(resultData);
      console.log(`[UPDATE SERVICE] Novo resultado salvo: ${id}`);
    }

    return true;
  } catch (error) {
    console.error(`[UPDATE SERVICE] Erro ao salvar resultado de ${tipo}:`, error);
    return false;
  }
}

/**
 * Atualiza resultado de uma loteria específica
 */
export async function updateSingleLottery(
  tipo: LotteryType
): Promise<{ success: boolean; concurso?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    console.log(`[UPDATE SERVICE] Atualizando ${tipo}...`);
    
    const result = await fetchLatestResult(tipo);
    
    if (!result) {
      const errorMsg = 'Sem resposta da API da Caixa';
      await logUpdate(tipo, 0, 'error', errorMsg, Date.now() - startTime);
      return { success: false, error: errorMsg };
    }

    const saved = await saveLotteryResult(tipo, result);
    
    if (!saved) {
      const errorMsg = 'Erro ao salvar no banco de dados';
      await logUpdate(tipo, result.numero, 'error', errorMsg, Date.now() - startTime);
      return { success: false, concurso: result.numero, error: errorMsg };
    }

    // Atualiza estatísticas
    await updateStatistics(tipo, result.listaDezenas);

    await logUpdate(tipo, result.numero, 'success', 'Atualização bem-sucedida', Date.now() - startTime);
    
    console.log(`[UPDATE SERVICE] ✅ ${tipo} atualizado: Concurso ${result.numero}`);
    
    return { success: true, concurso: result.numero };
  } catch (error: any) {
    const errorMsg = error.message || 'Erro desconhecido';
    await logUpdate(tipo, 0, 'error', errorMsg, Date.now() - startTime);
    console.error(`[UPDATE SERVICE] ❌ Erro ao atualizar ${tipo}:`, error);
    return { success: false, error: errorMsg };
  }
}

/**
 * Atualiza todas as loterias
 */
export async function updateAllLotteries(): Promise<{
  success: number;
  failed: number;
  results: Record<LotteryType, boolean>;
}> {
  console.log('[UPDATE SERVICE] ========================================');
  console.log('[UPDATE SERVICE] INICIANDO ATUALIZAÇÃO DE TODAS AS LOTERIAS');
  console.log('[UPDATE SERVICE] ========================================');
  
  const lotteries: LotteryType[] = [
    'megasena',
    'lotofacil',
    'quina',
    'lotomania',
    'duplasena',
    'timemania',
    'diadesorte',
    'supersete',
    'federal',
  ];

  const results: Record<string, boolean> = {};
  let success = 0;
  let failed = 0;

  for (const tipo of lotteries) {
    const result = await updateSingleLottery(tipo);
    results[tipo] = result.success;
    
    if (result.success) {
      success++;
    } else {
      failed++;
    }
    
    // Aguarda 2 segundos entre cada requisição para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('[UPDATE SERVICE] ========================================');
  console.log(`[UPDATE SERVICE] ATUALIZAÇÃO CONCLUÍDA: ${success} sucesso, ${failed} falhas`);
  console.log('[UPDATE SERVICE] ========================================');

  return {
    success,
    failed,
    results: results as Record<LotteryType, boolean>,
  };
}

/**
 * Atualiza estatísticas de frequência dos números
 */
async function updateStatistics(tipo: LotteryType, dezenas: string[]): Promise<void> {
  try {
    const today = new Date().toISOString();

    for (const numero of dezenas) {
      const id = `${tipo}_numero_${numero}`;
      
      const existing = await db
        .select()
        .from(lotteryStatistics)
        .where(eq(lotteryStatistics.id, id))
        .limit(1);

      if (existing.length > 0) {
        const stat = existing[0];
        await db
          .update(lotteryStatistics)
          .set({
            frequencia: (stat.frequencia || 0) + 1,
            ultimaAparicao: today,
            diasSemSair: 0,
            atualizadoEm: today,
          })
          .where(eq(lotteryStatistics.id, id));
      } else {
        await db.insert(lotteryStatistics).values({
          id,
          tipo,
          numero: parseInt(numero),
          frequencia: 1,
          ultimaAparicao: today,
          diasSemSair: 0,
          categoriaFrequencia: 'normal',
        });
      }
    }

    console.log(`[UPDATE SERVICE] Estatísticas atualizadas para ${tipo}`);
  } catch (error) {
    console.error(`[UPDATE SERVICE] Erro ao atualizar estatísticas de ${tipo}:`, error);
  }
}

/**
 * Registra histórico de atualização
 */
async function logUpdate(
  tipo: LotteryType,
  concurso: number,
  status: 'success' | 'error' | 'skipped',
  mensagem: string,
  duracaoMs: number
): Promise<void> {
  try {
    const id = `${tipo}_${concurso}_${Date.now()}`;
    
    const logData: NewUpdateHistory = {
      id,
      tipo,
      concurso,
      status,
      mensagem,
      duracaoMs,
    };

    await db.insert(updateHistory).values(logData);
  } catch (error) {
    console.error('[UPDATE SERVICE] Erro ao registrar log:', error);
  }
}

/**
 * Obtém último resultado salvo no banco
 */
export async function getLatestStoredResult(tipo: LotteryType) {
  try {
    const results = await db
      .select()
      .from(lotteryResults)
      .where(eq(lotteryResults.tipo, tipo))
      .orderBy(lotteryResults.concurso)
      .limit(1);

    return results[0] || null;
  } catch (error) {
    console.error(`[UPDATE SERVICE] Erro ao buscar último resultado de ${tipo}:`, error);
    return null;
  }
}

/**
 * Obtém histórico de atualizações
 */
export async function getUpdateHistory(limite: number = 50) {
  try {
    return await db
      .select()
      .from(updateHistory)
      .orderBy(updateHistory.criadoEm)
      .limit(limite);
  } catch (error) {
    console.error('[UPDATE SERVICE] Erro ao buscar histórico:', error);
    return [];
  }
}
