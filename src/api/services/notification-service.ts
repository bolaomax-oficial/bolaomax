/**
 * Serviço de Notificações de Premiação
 * 
 * Responsável por:
 * - Verificar ganhadores nos bolões
 * - Enviar notificações por email
 * - Enviar notificações push
 * - Registrar notificações no banco
 */

import { db } from '../database';
import { 
  prizeNotifications, 
  lotteryResults,
  type NewPrizeNotification 
} from '../database/schema';
import { eq, and } from 'drizzle-orm';

interface WinningTicket {
  usuarioId: string;
  bolaoId: string;
  tipo: string;
  concurso: number;
  acertos: number;
  premioFaixa: string;
  valorPremio: number;
}

/**
 * Verifica prêmios e envia notificações
 */
export async function checkPrizesAndNotify(): Promise<void> {
  console.log('[NOTIFICATION] 🏆 Verificando prêmios...');
  
  try {
    // Busca últimos resultados
    const results = await db
      .select()
      .from(lotteryResults)
      .limit(10);

    for (const result of results) {
      const winners = await checkBolaoWinners(result);
      
      for (const winner of winners) {
        await notifyWinner(winner);
      }
    }
    
    console.log('[NOTIFICATION] ✅ Verificação de prêmios concluída');
  } catch (error) {
    console.error('[NOTIFICATION] ❌ Erro ao verificar prêmios:', error);
  }
}

/**
 * Verifica ganhadores em um bolão (SIMULAÇÃO)
 * 
 * TODO: Implementar lógica real de verificação com dados dos bolões
 */
async function checkBolaoWinners(result: any): Promise<WinningTicket[]> {
  // Esta é uma simulação - na implementação real, você deve:
  // 1. Buscar todos os bolões ativos do tipo da loteria
  // 2. Comparar números apostados com resultado
  // 3. Identificar ganhadores e faixas de prêmio
  
  const winners: WinningTicket[] = [];
  
  // Exemplo simulado (remover em produção)
  if (Math.random() > 0.95) { // 5% de chance de simular ganhador
    winners.push({
      usuarioId: 'user_123',
      bolaoId: 'bolao_456',
      tipo: result.tipo,
      concurso: result.concurso,
      acertos: 15,
      premioFaixa: '15 acertos',
      valorPremio: 1500000,
    });
  }
  
  return winners;
}

/**
 * Envia notificação para um ganhador
 */
async function notifyWinner(winner: WinningTicket): Promise<void> {
  try {
    const notificationId = `notif_${winner.usuarioId}_${winner.concurso}_${Date.now()}`;
    
    // Verifica se já foi notificado
    const existing = await db
      .select()
      .from(prizeNotifications)
      .where(
        and(
          eq(prizeNotifications.usuarioId, winner.usuarioId),
          eq(prizeNotifications.bolaoId, winner.bolaoId),
          eq(prizeNotifications.concurso, winner.concurso)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`[NOTIFICATION] ⚠️  Usuário ${winner.usuarioId} já foi notificado`);
      return;
    }

    // Salva notificação no banco
    const notification: NewPrizeNotification = {
      id: notificationId,
      usuarioId: winner.usuarioId,
      bolaoId: winner.bolaoId,
      tipo: winner.tipo,
      concurso: winner.concurso,
      premioFaixa: winner.premioFaixa,
      valorPremio: winner.valorPremio,
      acertos: winner.acertos,
      lida: false,
      enviadaEmail: false,
      enviadaPush: false,
    };

    await db.insert(prizeNotifications).values(notification);

    // Envia email (simulação)
    const emailSent = await sendEmail(winner);
    if (emailSent) {
      await db
        .update(prizeNotifications)
        .set({ enviadaEmail: true })
        .where(eq(prizeNotifications.id, notificationId));
    }

    // Envia push (simulação)
    const pushSent = await sendPushNotification(winner);
    if (pushSent) {
      await db
        .update(prizeNotifications)
        .set({ enviadaPush: true })
        .where(eq(prizeNotifications.id, notificationId));
    }

    console.log(`[NOTIFICATION] 🎉 Ganhador notificado: ${winner.usuarioId} - R$ ${winner.valorPremio.toLocaleString('pt-BR')}`);
  } catch (error) {
    console.error('[NOTIFICATION] ❌ Erro ao notificar ganhador:', error);
  }
}

/**
 * Envia email de premiação (SIMULAÇÃO)
 * 
 * TODO: Integrar com serviço de email real (SendGrid, AWS SES, etc)
 */
async function sendEmail(winner: WinningTicket): Promise<boolean> {
  try {
    console.log(`[EMAIL] 📧 Enviando email para usuário ${winner.usuarioId}...`);
    
    const emailContent = `
      🎉 PARABÉNS! VOCÊ GANHOU! 🎉
      
      Bolão: ${winner.bolaoId}
      Loteria: ${winner.tipo.toUpperCase()}
      Concurso: ${winner.concurso}
      
      Acertos: ${winner.acertos}
      Faixa: ${winner.premioFaixa}
      Prêmio: R$ ${winner.valorPremio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      
      Acesse o BolãoMax para verificar seus prêmios!
    `;
    
    // Simulação - em produção, usar serviço real
    // await emailService.send({
    //   to: getUserEmail(winner.usuarioId),
    //   subject: `🎉 Você ganhou R$ ${winner.valorPremio.toLocaleString('pt-BR')}!`,
    //   body: emailContent
    // });
    
    console.log(`[EMAIL] ✅ Email simulado enviado`);
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Envia notificação push (SIMULAÇÃO)
 * 
 * TODO: Integrar com serviço push real (FCM, OneSignal, etc)
 */
async function sendPushNotification(winner: WinningTicket): Promise<boolean> {
  try {
    console.log(`[PUSH] 📱 Enviando push para usuário ${winner.usuarioId}...`);
    
    const pushData = {
      title: '🎉 Você ganhou!',
      body: `R$ ${winner.valorPremio.toLocaleString('pt-BR')} no ${winner.tipo}`,
      data: {
        tipo: 'premio',
        bolaoId: winner.bolaoId,
        concurso: winner.concurso,
      },
    };
    
    // Simulação - em produção, usar serviço real
    // await pushService.send({
    //   userId: winner.usuarioId,
    //   ...pushData
    // });
    
    console.log(`[PUSH] ✅ Push simulado enviado`);
    return true;
  } catch (error) {
    console.error('[PUSH] ❌ Erro ao enviar push:', error);
    return false;
  }
}

/**
 * Busca notificações não lidas de um usuário
 */
export async function getUnreadNotifications(usuarioId: string) {
  try {
    return await db
      .select()
      .from(prizeNotifications)
      .where(
        and(
          eq(prizeNotifications.usuarioId, usuarioId),
          eq(prizeNotifications.lida, false)
        )
      )
      .orderBy(prizeNotifications.criadoEm);
  } catch (error) {
    console.error('[NOTIFICATION] Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Marca notificação como lida
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    await db
      .update(prizeNotifications)
      .set({ lida: true })
      .where(eq(prizeNotifications.id, notificationId));
    
    return true;
  } catch (error) {
    console.error('[NOTIFICATION] Erro ao marcar como lida:', error);
    return false;
  }
}

/**
 * Obtém histórico de prêmios de um usuário
 */
export async function getUserPrizeHistory(usuarioId: string, limite: number = 50) {
  try {
    return await db
      .select()
      .from(prizeNotifications)
      .where(eq(prizeNotifications.usuarioId, usuarioId))
      .orderBy(prizeNotifications.criadoEm)
      .limit(limite);
  } catch (error) {
    console.error('[NOTIFICATION] Erro ao buscar histórico:', error);
    return [];
  }
}
