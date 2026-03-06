/**
 * Serviço de Analytics e Logs
 * 
 * Responsável por:
 * - Registrar eventos de analytics
 * - Registrar logs do sistema
 * - Gerar relatórios
 * - Limpeza de dados antigos
 */

import { db } from '../database';
import { 
  analyticsEvents, 
  systemLogs,
  type NewAnalyticsEvent,
  type NewSystemLog 
} from '../database/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * Registra evento de analytics
 */
export async function trackEvent(event: {
  tipo: string;
  categoria?: string;
  acao?: string;
  label?: string;
  valor?: number;
  usuarioId?: string;
  sessaoId?: string;
  metadados?: any;
}): Promise<void> {
  try {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Detecta dispositivo e navegador (simulação - em produção usar user-agent)
    const dispositivo = detectDevice();
    const navegador = detectBrowser();
    
    const analyticsData: NewAnalyticsEvent = {
      id: eventId,
      tipo: event.tipo,
      categoria: event.categoria || null,
      acao: event.acao || null,
      label: event.label || null,
      valor: event.valor || null,
      usuarioId: event.usuarioId || null,
      sessaoId: event.sessaoId || null,
      dispositivo,
      navegador,
      origem: null, // TODO: Capturar UTM params
      metadados: event.metadados ? JSON.stringify(event.metadados) : null,
    };

    await db.insert(analyticsEvents).values(analyticsData);
    
    console.log(`[ANALYTICS] 📊 Evento registrado: ${event.tipo} - ${event.categoria}`);
  } catch (error) {
    console.error('[ANALYTICS] Erro ao registrar evento:', error);
  }
}

/**
 * Registra log do sistema
 */
export async function log(
  nivel: 'info' | 'warn' | 'error' | 'debug',
  categoria: string,
  mensagem: string,
  detalhes?: any,
  usuarioId?: string
): Promise<void> {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logData: NewSystemLog = {
      id: logId,
      nivel,
      categoria,
      mensagem,
      detalhes: detalhes ? JSON.stringify(detalhes, null, 2) : null,
      usuarioId: usuarioId || null,
      ip: null, // TODO: Capturar IP real
      userAgent: null, // TODO: Capturar user agent real
    };

    await db.insert(systemLogs).values(logData);
    
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    }[nivel];
    
    console.log(`[LOG] ${emoji} [${categoria.toUpperCase()}] ${mensagem}`);
  } catch (error) {
    console.error('[LOG] Erro ao registrar log:', error);
  }
}

/**
 * Atalhos para diferentes níveis de log
 */
export const logger = {
  info: (categoria: string, mensagem: string, detalhes?: any, usuarioId?: string) =>
    log('info', categoria, mensagem, detalhes, usuarioId),
  
  warn: (categoria: string, mensagem: string, detalhes?: any, usuarioId?: string) =>
    log('warn', categoria, mensagem, detalhes, usuarioId),
  
  error: (categoria: string, mensagem: string, detalhes?: any, usuarioId?: string) =>
    log('error', categoria, mensagem, detalhes, usuarioId),
  
  debug: (categoria: string, mensagem: string, detalhes?: any, usuarioId?: string) =>
    log('debug', categoria, mensagem, detalhes, usuarioId),
};

/**
 * Registra eventos comuns
 */
export const analytics = {
  pageView: (page: string, usuarioId?: string, sessaoId?: string) =>
    trackEvent({
      tipo: 'pageview',
      categoria: 'navegacao',
      label: page,
      usuarioId,
      sessaoId,
    }),

  click: (elemento: string, categoria: string, usuarioId?: string) =>
    trackEvent({
      tipo: 'click',
      categoria,
      acao: 'clique',
      label: elemento,
      usuarioId,
    }),

  bolaoView: (bolaoId: string, tipo: string, usuarioId?: string) =>
    trackEvent({
      tipo: 'bolao_visualizado',
      categoria: 'bolao',
      acao: 'visualizar',
      label: bolaoId,
      usuarioId,
      metadados: { tipo },
    }),

  bolaoParticipation: (bolaoId: string, tipo: string, valor: number, usuarioId?: string) =>
    trackEvent({
      tipo: 'bolao_participacao',
      categoria: 'bolao',
      acao: 'participar',
      label: bolaoId,
      valor,
      usuarioId,
      metadados: { tipo },
    }),

  purchase: (valor: number, bolaoId: string, usuarioId: string) =>
    trackEvent({
      tipo: 'compra',
      categoria: 'transacao',
      acao: 'finalizada',
      label: bolaoId,
      valor,
      usuarioId,
    }),

  signup: (usuarioId: string, metodo: string) =>
    trackEvent({
      tipo: 'cadastro',
      categoria: 'autenticacao',
      acao: 'cadastro_completo',
      label: metodo,
      usuarioId,
    }),

  login: (usuarioId: string, metodo: string) =>
    trackEvent({
      tipo: 'login',
      categoria: 'autenticacao',
      acao: 'login_sucesso',
      label: metodo,
      usuarioId,
    }),
};

/**
 * Gera relatório de eventos por período
 */
export async function getAnalyticsReport(
  dataInicio: string,
  dataFim: string,
  tipo?: string
) {
  try {
    let query = db
      .select()
      .from(analyticsEvents)
      .where(
        and(
          gte(analyticsEvents.criadoEm, dataInicio),
          lte(analyticsEvents.criadoEm, dataFim)
        )
      );

    if (tipo) {
      query = query.where(eq(analyticsEvents.tipo, tipo));
    }

    const events = await query;

    return {
      totalEventos: events.length,
      porTipo: groupBy(events, 'tipo'),
      porCategoria: groupBy(events, 'categoria'),
      porDispositivo: groupBy(events, 'dispositivo'),
      eventos: events,
    };
  } catch (error) {
    console.error('[ANALYTICS] Erro ao gerar relatório:', error);
    return null;
  }
}

/**
 * Busca logs do sistema por critérios
 */
export async function getSystemLogs(
  nivel?: 'info' | 'warn' | 'error' | 'debug',
  categoria?: string,
  limite: number = 100
) {
  try {
    let query = db
      .select()
      .from(systemLogs)
      .orderBy(systemLogs.criadoEm)
      .limit(limite);

    if (nivel) {
      query = query.where(eq(systemLogs.nivel, nivel));
    }

    if (categoria) {
      query = query.where(eq(systemLogs.categoria, categoria));
    }

    return await query;
  } catch (error) {
    console.error('[LOG] Erro ao buscar logs:', error);
    return [];
  }
}

/**
 * Remove logs e eventos antigos
 */
export async function cleanOldLogs(diasParaManter: number = 30): Promise<void> {
  try {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasParaManter);
    const dataLimiteStr = dataLimite.toISOString();

    // Remove analytics antigos
    const deletedAnalytics = await db
      .delete(analyticsEvents)
      .where(lte(analyticsEvents.criadoEm, dataLimiteStr));

    // Remove logs antigos
    const deletedLogs = await db
      .delete(systemLogs)
      .where(lte(systemLogs.criadoEm, dataLimiteStr));

    console.log(`[CLEANUP] 🧹 Limpeza concluída: ${deletedAnalytics} analytics, ${deletedLogs} logs removidos`);
  } catch (error) {
    console.error('[CLEANUP] Erro ao limpar dados antigos:', error);
  }
}

/**
 * Detecta dispositivo (simulação)
 */
function detectDevice(): string {
  // Em produção, analisar user agent
  const devices = ['mobile', 'desktop', 'tablet'];
  return devices[Math.floor(Math.random() * devices.length)];
}

/**
 * Detecta navegador (simulação)
 */
function detectBrowser(): string {
  // Em produção, analisar user agent
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  return browsers[Math.floor(Math.random() * browsers.length)];
}

/**
 * Agrupa array por propriedade
 */
function groupBy(array: any[], key: string): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Estatísticas em tempo real
 */
export async function getRealtimeStats() {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    const events = await db
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.criadoEm, hoje));

    return {
      eventosHoje: events.length,
      pageviewsHoje: events.filter(e => e.tipo === 'pageview').length,
      comprasHoje: events.filter(e => e.tipo === 'compra').length,
      cadastrosHoje: events.filter(e => e.tipo === 'cadastro').length,
      valorTotalHoje: events
        .filter(e => e.tipo === 'compra')
        .reduce((sum, e) => sum + (e.valor || 0), 0),
    };
  } catch (error) {
    console.error('[ANALYTICS] Erro ao buscar estatísticas em tempo real:', error);
    return null;
  }
}
