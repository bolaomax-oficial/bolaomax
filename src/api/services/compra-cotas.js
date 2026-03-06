/**
 * Serviço de Compra de Cotas
 * Integrado com sistema financeiro
 */

import { db, schema } from '../database/connection.js';
import { debitarSaldo } from './financeiro.js';
import crypto from 'crypto';

/**
 * Comprar cota de bolão
 */
export async function comprarCota({ userId, bolaoId, quantidadeCotas = 1 }) {
  try {
    // Buscar bolão
    const bolao = await db.select().from(schema.boloes)
      .where(eq(schema.boloes.id, bolaoId))
      .limit(1);
    
    if (!bolao.length) {
      throw new Error('Bolão não encontrado');
    }
    
    const b = bolao[0];
    
    // Validações
    if (b.status !== 'aberto') {
      throw new Error('Bolão não está aberto para participações');
    }
    
    if (b.cotasDisponiveis < quantidadeCotas) {
      throw new Error(`Apenas ${b.cotasDisponiveis} cotas disponíveis`);
    }
    
    const valorTotal = b.valorCota * quantidadeCotas;
    
    // Buscar usuário
    const user = await db.select().from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!user.length) {
      throw new Error('Usuário não encontrado');
    }
    
    if (user[0].saldo < valorTotal) {
      throw new Error(`Saldo insuficiente. Necessário: R$ ${valorTotal.toFixed(2)}`);
    }
    
    // Debitar saldo do usuário
    await debitarSaldo({
      userId,
      valor: valorTotal,
      tipo: 'compra_cota',
      descricao: `Compra de ${quantidadeCotas} cota(s) - ${b.nome}`,
      metadata: {
        bolaoId,
        quantidadeCotas,
        valorCota: b.valorCota
      }
    });
    
    // Criar participação
    const participacaoId = crypto.randomUUID();
    await db.insert(schema.participacoes).values({
      id: participacaoId,
      bolaoId,
      userId,
      quantidadeCotas,
      valorTotal,
      status: 'ativa',
      pagamentoConfirmado: true
    });
    
    // Atualizar cotas disponíveis
    const novasCotasDisponiveis = b.cotasDisponiveis - quantidadeCotas;
    await db.update(schema.boloes)
      .set({ cotasDisponiveis: novasCotasDisponiveis })
      .where(eq(schema.boloes.id, bolaoId));
    
    console.log(`✅ [COMPRA] ${quantidadeCotas} cota(s) comprada(s) - Bolão ${bolaoId}`);
    
    // Se bolão fechou (100% vendido), iniciar processo de registro
    if (novasCotasDisponiveis === 0) {
      console.log(`🎯 [BOLAO] Bolão ${bolaoId} atingiu 100% - iniciando registro`);
      // Chamar função de fechar bolão (implementar depois)
      // await fecharBolao(bolaoId);
    }
    
    return {
      success: true,
      participacaoId,
      quantidadeCotas,
      valorTotal,
      saldoRestante: user[0].saldo - valorTotal
    };
  } catch (error) {
    console.error('[COMPRA] Erro:', error);
    throw error;
  }
}

/**
 * Cancelar participação e reembolsar
 */
export async function cancelarParticipacao({ participacaoId, userId, motivo = 'cancelamento_usuario' }) {
  try {
    // Buscar participação
    const participacao = await db.select().from(schema.participacoes)
      .where(and(
        eq(schema.participacoes.id, participacaoId),
        eq(schema.participacoes.userId, userId)
      ))
      .limit(1);
    
    if (!participacao.length) {
      throw new Error('Participação não encontrada');
    }
    
    const p = participacao[0];
    
    if (p.status === 'cancelada') {
      throw new Error('Participação já cancelada');
    }
    
    // Buscar bolão
    const bolao = await db.select().from(schema.boloes)
      .where(eq(schema.boloes.id, p.bolaoId))
      .limit(1);
    
    if (bolao[0].status !== 'aberto') {
      throw new Error('Bolão já foi fechado, não é possível cancelar');
    }
    
    // Reembolsar saldo
    await creditarSaldo({
      userId,
      valor: p.valorTotal,
      tipo: 'reembolso',
      descricao: `Reembolso - ${motivo}`,
      metadata: {
        participacaoId,
        bolaoId: p.bolaoId
      }
    });
    
    // Atualizar participação
    await db.update(schema.participacoes)
      .set({ status: 'cancelada' })
      .where(eq(schema.participacoes.id, participacaoId));
    
    // Devolver cotas ao bolão
    await db.update(schema.boloes)
      .set({ 
        cotasDisponiveis: bolao[0].cotasDisponiveis + p.quantidadeCotas 
      })
      .where(eq(schema.boloes.id, p.bolaoId));
    
    console.log(`✅ [CANCELAMENTO] Participação ${participacaoId} cancelada - R$ ${p.valorTotal} reembolsado`);
    
    return {
      success: true,
      valorReembolsado: p.valorTotal
    };
  } catch (error) {
    console.error('[CANCELAMENTO] Erro:', error);
    throw error;
  }
}
