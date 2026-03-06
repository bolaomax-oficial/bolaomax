/**
 * Serviço de Recarga de Carteira
 * Permite usuário adicionar saldo usando PIX, Cartão ou Boleto
 */

import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';
import * as pagarme from './pagarme.js';
import { creditarSaldo } from './financeiro.js';

/**
 * Solicitar recarga de carteira
 * Cria transação no Pagar.me e armazena na tabela recarga_carteira
 */
export async function solicitarRecarga({ 
  userId, 
  valor, 
  formaPagamento, // 'pix', 'credit_card', 'boleto'
  dadosPagamento = {} // Dados do cartão, se aplicável
}) {
  try {
    if (valor < 10) {
      throw new Error('Valor mínimo de recarga: R$ 10,00');
    }
    
    // Buscar usuário
    const usuario = await db.all(sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`);
    
    if (!usuario.length) {
      throw new Error('Usuário não encontrado');
    }
    
    const user = usuario[0];
    const recargaId = crypto.randomUUID();
    
    let transacaoPagarme;
    let qrCode, qrCodeUrl, boletoUrl, expiraEm;
    
    // Criar transação no Pagar.me conforme forma de pagamento
    switch (formaPagamento) {
      case 'pix':
        transacaoPagarme = await pagarme.createPixTransaction({
          amount: Math.round(valor * 100), // Centavos
          customer: {
            name: user.name,
            email: user.email,
            type: 'individual',
            document: user.cpf || '00000000000',
            document_type: 'CPF'
          },
          metadata: {
            tipo: 'recarga_carteira',
            recargaId,
            userId
          }
        });
        
        qrCode = transacaoPagarme.charges?.[0]?.last_transaction?.qr_code;
        qrCodeUrl = transacaoPagarme.charges?.[0]?.last_transaction?.qr_code_url;
        expiraEm = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos
        break;
        
      case 'credit_card':
        if (!dadosPagamento.cardNumber || !dadosPagamento.cardHolderName || 
            !dadosPagamento.cardExpirationDate || !dadosPagamento.cardCvv) {
          throw new Error('Dados do cartão incompletos');
        }
        
        transacaoPagarme = await pagarme.createCreditCardTransaction({
          amount: Math.round(valor * 100),
          customer: {
            name: user.name,
            email: user.email,
            type: 'individual',
            document: user.cpf || '00000000000',
            document_type: 'CPF'
          },
          payment_method: 'credit_card',
          card: {
            number: dadosPagamento.cardNumber,
            holder_name: dadosPagamento.cardHolderName,
            exp_month: parseInt(dadosPagamento.cardExpirationDate.split('/')[0]),
            exp_year: parseInt(dadosPagamento.cardExpirationDate.split('/')[1]),
            cvv: dadosPagamento.cardCvv
          },
          metadata: {
            tipo: 'recarga_carteira',
            recargaId,
            userId
          }
        });
        break;
        
      case 'boleto':
        transacaoPagarme = await pagarme.createBoletoTransaction({
          amount: Math.round(valor * 100),
          customer: {
            name: user.name,
            email: user.email,
            type: 'individual',
            document: user.cpf || '00000000000',
            document_type: 'CPF'
          },
          metadata: {
            tipo: 'recarga_carteira',
            recargaId,
            userId
          }
        });
        
        boletoUrl = transacaoPagarme.charges?.[0]?.last_transaction?.url;
        expiraEm = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 dias
        break;
        
      default:
        throw new Error('Forma de pagamento inválida');
    }
    
    const gatewayTransactionId = transacaoPagarme.id;
    const status = transacaoPagarme.status === 'paid' ? 'confirmado' : 'pendente';
    
    // Salvar recarga no database
    await db.run(sql`
      INSERT INTO recarga_carteira (
        id, user_id, valor, forma_pagamento, gateway_transaction_id,
        status, qr_code, qr_code_url, boleto_url, expira_em,
        metadata
      ) VALUES (
        ${recargaId}, ${userId}, ${valor}, ${formaPagamento}, ${gatewayTransactionId},
        ${status}, ${qrCode || null}, ${qrCodeUrl || null}, ${boletoUrl || null}, 
        ${expiraEm || null}, ${JSON.stringify(transacaoPagarme)}
      )
    `);
    
    console.log(`✅ [RECARGA] Solicitada para usuário ${userId}: R$ ${valor} via ${formaPagamento}`);
    
    // Se cartão foi aprovado imediatamente, creditar
    if (status === 'confirmado') {
      await creditarSaldo({
        userId,
        valor,
        tipo: 'recarga',
        descricao: `Recarga de carteira via ${formaPagamento}`,
        gatewayTransactionId,
        metadata: { recargaId }
      });
      
      await db.run(sql`
        UPDATE recarga_carteira
        SET confirmado_em = datetime('now')
        WHERE id = ${recargaId}
      `);
    }
    
    return {
      success: true,
      recargaId,
      gatewayTransactionId,
      status,
      valor,
      formaPagamento,
      qrCode,
      qrCodeUrl,
      boletoUrl,
      expiraEm
    };
  } catch (error) {
    console.error('[RECARGA] Erro ao solicitar:', error);
    throw error;
  }
}

/**
 * Buscar recargas do usuário
 */
export async function buscarRecargas(userId) {
  try {
    const recargas = await db.all(sql`
      SELECT * FROM recarga_carteira
      WHERE user_id = ${userId}
      ORDER BY criado_em DESC
      LIMIT 20
    `);
    
    return {
      success: true,
      recargas: recargas.map(r => ({
        id: r.id,
        valor: r.valor,
        formaPagamento: r.forma_pagamento,
        status: r.status,
        qrCode: r.qr_code,
        qrCodeUrl: r.qr_code_url,
        boletoUrl: r.boleto_url,
        expiraEm: r.expira_em,
        criadoEm: r.criado_em,
        confirmadoEm: r.confirmado_em
      }))
    };
  } catch (error) {
    console.error('[RECARGA] Erro ao buscar:', error);
    throw error;
  }
}

/**
 * Confirmar recarga (chamado pelo webhook Pagar.me)
 */
export async function confirmarRecarga(gatewayTransactionId) {
  try {
    // Buscar recarga
    const recarga = await db.all(sql`
      SELECT * FROM recarga_carteira
      WHERE gateway_transaction_id = ${gatewayTransactionId}
      LIMIT 1
    `);
    
    if (!recarga.length) {
      console.warn(`[RECARGA] Transação ${gatewayTransactionId} não encontrada`);
      return { success: false, error: 'Recarga não encontrada' };
    }
    
    const r = recarga[0];
    
    if (r.status === 'confirmado') {
      console.log(`[RECARGA] Já confirmada: ${r.id}`);
      return { success: true, message: 'Já confirmada' };
    }
    
    // Creditar saldo
    await creditarSaldo({
      userId: r.user_id,
      valor: r.valor,
      tipo: 'recarga',
      descricao: `Recarga de carteira via ${r.forma_pagamento}`,
      gatewayTransactionId,
      metadata: { recargaId: r.id }
    });
    
    // Marcar como confirmado
    await db.run(sql`
      UPDATE recarga_carteira
      SET status = 'confirmado',
          confirmado_em = datetime('now')
      WHERE id = ${r.id}
    `);
    
    console.log(`✅ [RECARGA] Confirmada ${r.id}: R$ ${r.valor} para usuário ${r.user_id}`);
    
    return {
      success: true,
      recargaId: r.id,
      userId: r.user_id,
      valor: r.valor
    };
  } catch (error) {
    console.error('[RECARGA] Erro ao confirmar:', error);
    throw error;
  }
}

export default {
  solicitarRecarga,
  buscarRecargas,
  confirmarRecarga
};
