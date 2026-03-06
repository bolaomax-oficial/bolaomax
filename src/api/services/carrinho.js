/**
 * Serviço de Carrinho
 * Gerencia carrinho temporário com reservas de 5 minutos
 */

import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Adicionar item ao carrinho
 * Cria reserva temporária de 5 minutos
 */
export async function adicionarAoCarrinho({ userId, bolaoId, quantidadeCotas = 1 }) {
  try {
    // Buscar bolão
    const bolao = await db.all(sql`SELECT * FROM boloes WHERE id = ${bolaoId} LIMIT 1`);
    
    if (!bolao.length) {
      throw new Error('Bolão não encontrado');
    }
    
    const b = bolao[0];
    
    // Verificar se há cotas disponíveis
    const cotasVendidas = await db.all(sql`
      SELECT COALESCE(SUM(quantidade_cotas), 0) as total
      FROM participacoes 
      WHERE bolao_id = ${bolaoId}
    `);
    
    const cotasReservadas = await db.all(sql`
      SELECT COALESCE(SUM(quantidade_cotas), 0) as total
      FROM carrinho_itens
      WHERE bolao_id = ${bolaoId} 
        AND status = 'reservado'
        AND expira_em > datetime('now')
    `);
    
    const cotasDisponiveis = b.total_cotas - (cotasVendidas[0].total + cotasReservadas[0].total);
    
    if (quantidadeCotas > cotasDisponiveis) {
      throw new Error(`Apenas ${cotasDisponiveis} cotas disponíveis`);
    }
    
    // Calcular valores
    const valorUnitario = b.valor_cota;
    const valorTotal = valorUnitario * quantidadeCotas;
    
    // Definir expiração: 5 minutos
    const expiraEm = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    // Verificar se já existe item no carrinho para este bolão
    const itemExistente = await db.all(sql`
      SELECT * FROM carrinho_itens
      WHERE user_id = ${userId}
        AND bolao_id = ${bolaoId}
        AND status = 'reservado'
        AND expira_em > datetime('now')
      LIMIT 1
    `);
    
    if (itemExistente.length) {
      // Atualizar quantidade
      const novaQuantidade = itemExistente[0].quantidade_cotas + quantidadeCotas;
      const novoValorTotal = valorUnitario * novaQuantidade;
      
      // Renovar expiração
      await db.run(sql`
        UPDATE carrinho_itens
        SET quantidade_cotas = ${novaQuantidade},
            valor_total = ${novoValorTotal},
            expira_em = ${expiraEm}
        WHERE id = ${itemExistente[0].id}
      `);
      
      console.log(`✅ [CARRINHO] Atualizado item ${itemExistente[0].id} (${novaQuantidade} cotas)`);
      
      return {
        success: true,
        itemId: itemExistente[0].id,
        action: 'updated'
      };
    }
    
    // Criar novo item
    const itemId = crypto.randomUUID();
    await db.run(sql`
      INSERT INTO carrinho_itens (
        id, user_id, bolao_id, quantidade_cotas, 
        valor_unitario, valor_total, expira_em, status
      ) VALUES (
        ${itemId}, ${userId}, ${bolaoId}, ${quantidadeCotas},
        ${valorUnitario}, ${valorTotal}, ${expiraEm}, 'reservado'
      )
    `);
    
    console.log(`✅ [CARRINHO] Adicionado ${quantidadeCotas} cotas do bolão ${bolaoId}`);
    
    return {
      success: true,
      itemId,
      action: 'created',
      expiraEm
    };
  } catch (error) {
    console.error('[CARRINHO] Erro ao adicionar:', error);
    throw error;
  }
}

/**
 * Buscar carrinho do usuário
 */
export async function buscarCarrinho(userId) {
  try {
    const itens = await db.all(sql`
      SELECT * FROM v_carrinho_ativo
      WHERE user_id = ${userId}
      ORDER BY criado_em DESC
    `);
    
    const totalItens = itens.length;
    const valorTotal = itens.reduce((sum, item) => sum + item.valor_total, 0);
    
    return {
      success: true,
      itens: itens.map(item => ({
        id: item.id,
        bolaoId: item.bolao_id,
        bolaoNome: item.bolao_nome,
        tipoLoteria: item.tipo_loteria,
        quantidadeCotas: item.quantidade_cotas,
        valorUnitario: item.valor_unitario,
        valorTotal: item.valor_total,
        expiraEm: item.expira_em,
        segundosRestantes: item.segundos_restantes
      })),
      totalItens,
      valorTotal
    };
  } catch (error) {
    console.error('[CARRINHO] Erro ao buscar:', error);
    throw error;
  }
}

/**
 * Remover item do carrinho
 */
export async function removerDoCarrinho({ userId, itemId }) {
  try {
    // Verificar se item pertence ao usuário
    const item = await db.all(sql`
      SELECT * FROM carrinho_itens
      WHERE id = ${itemId} AND user_id = ${userId}
      LIMIT 1
    `);
    
    if (!item.length) {
      throw new Error('Item não encontrado');
    }
    
    // Marcar como cancelado (libera reserva)
    await db.run(sql`
      UPDATE carrinho_itens
      SET status = 'cancelado'
      WHERE id = ${itemId}
    `);
    
    console.log(`✅ [CARRINHO] Removido item ${itemId}`);
    
    return {
      success: true,
      message: 'Item removido do carrinho'
    };
  } catch (error) {
    console.error('[CARRINHO] Erro ao remover:', error);
    throw error;
  }
}

/**
 * Limpar carrinho do usuário
 */
export async function limparCarrinho(userId) {
  try {
    await db.run(sql`
      UPDATE carrinho_itens
      SET status = 'cancelado'
      WHERE user_id = ${userId} AND status = 'reservado'
    `);
    
    console.log(`✅ [CARRINHO] Limpo para usuário ${userId}`);
    
    return {
      success: true,
      message: 'Carrinho limpo'
    };
  } catch (error) {
    console.error('[CARRINHO] Erro ao limpar:', error);
    throw error;
  }
}

/**
 * Serviço de limpeza automática
 * Expira reservas antigas a cada 30 segundos
 */
export function iniciarServicoLimpeza() {
  setInterval(async () => {
    try {
      const resultado = await db.run(sql`
        UPDATE carrinho_itens
        SET status = 'expirado'
        WHERE status = 'reservado'
          AND expira_em < datetime('now')
      `);
      
      if (resultado.changes > 0) {
        console.log(`🧹 [CARRINHO] ${resultado.changes} reservas expiradas limpas`);
      }
    } catch (error) {
      console.error('[CARRINHO] Erro na limpeza:', error);
    }
  }, 30000); // 30 segundos
  
  console.log('🧹 [CARRINHO] Serviço de limpeza iniciado (a cada 30s)');
}

/**
 * Converter carrinho em compra
 * Marca itens como 'comprado' e cria participações
 */
export async function finalizarCarrinho({ userId, formaPagamento }) {
  try {
    // Buscar itens ativos do carrinho
    const itens = await db.all(sql`
      SELECT * FROM carrinho_itens
      WHERE user_id = ${userId}
        AND status = 'reservado'
        AND expira_em > datetime('now')
    `);
    
    if (!itens.length) {
      throw new Error('Carrinho vazio ou expirado');
    }
    
    // Marcar como comprado
    await db.run(sql`
      UPDATE carrinho_itens
      SET status = 'comprado'
      WHERE user_id = ${userId}
        AND status = 'reservado'
        AND expira_em > datetime('now')
    `);
    
    const valorTotal = itens.reduce((sum, item) => sum + item.valor_total, 0);
    
    console.log(`✅ [CARRINHO] Finalizado para usuário ${userId} (R$ ${valorTotal})`);
    
    return {
      success: true,
      itens,
      valorTotal
    };
  } catch (error) {
    console.error('[CARRINHO] Erro ao finalizar:', error);
    throw error;
  }
}

export default {
  adicionarAoCarrinho,
  buscarCarrinho,
  removerDoCarrinho,
  limparCarrinho,
  finalizarCarrinho,
  iniciarServicoLimpeza
};
