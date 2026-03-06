/**
 * Serviço Financeiro BolãoMax
 * Gestão de carteira, fundo de registro e transações
 */

import { db, schema } from '../database/connection.js';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================
// CARTEIRA VIRTUAL
// ============================================================

/**
 * Creditar saldo na carteira do usuário
 */
export async function creditarSaldo({ 
  userId, 
  valor, 
  tipo, 
  descricao, 
  gatewayTransactionId = null,
  metadata = {} 
}) {
  try {
    // Buscar saldo atual
    const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    
    if (!user.length) {
      throw new Error('Usuário não encontrado');
    }
    
    const saldoAnterior = user[0].saldo || 0;
    const saldoNovo = saldoAnterior + valor;
    
    // Criar transação
    const transacaoId = crypto.randomUUID();
    await db.insert(schema.transactions).values({
      id: transacaoId,
      userId,
      tipo,
      valor,
      saldoAnterior,
      saldoNovo,
      status: 'confirmado',
      descricao,
      gatewayTransactionId,
      metadata: JSON.stringify(metadata),
      processadoEm: new Date()
    });
    
    // Atualizar saldo do usuário
    await db.update(schema.users)
      .set({ saldo: saldoNovo })
      .where(eq(schema.users.id, userId));
    
    // Log de auditoria
    await logAuditoria({
      tipo: 'saldo_creditado',
      userId,
      dadosAntes: { saldo: saldoAnterior },
      dadosDepois: { saldo: saldoNovo }
    });
    
    console.log(`✅ [FINANCEIRO] Creditado R$ ${valor} para usuário ${userId}`);
    
    return {
      success: true,
      transacaoId,
      saldoAnterior,
      saldoNovo
    };
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao creditar saldo:', error);
    throw error;
  }
}

/**
 * Debitar saldo da carteira do usuário
 */
export async function debitarSaldo({ 
  userId, 
  valor, 
  tipo, 
  descricao, 
  metadata = {} 
}) {
  try {
    // Buscar saldo atual
    const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    
    if (!user.length) {
      throw new Error('Usuário não encontrado');
    }
    
    const saldoAnterior = user[0].saldo || 0;
    
    if (saldoAnterior < valor) {
      throw new Error('Saldo insuficiente');
    }
    
    const saldoNovo = saldoAnterior - valor;
    
    // Criar transação
    const transacaoId = crypto.randomUUID();
    await db.insert(schema.transactions).values({
      id: transacaoId,
      userId,
      tipo,
      valor: -valor, // Negativo para débito
      saldoAnterior,
      saldoNovo,
      status: 'confirmado',
      descricao,
      metadata: JSON.stringify(metadata),
      processadoEm: new Date()
    });
    
    // Atualizar saldo do usuário
    await db.update(schema.users)
      .set({ saldo: saldoNovo })
      .where(eq(schema.users.id, userId));
    
    // Log de auditoria
    await logAuditoria({
      tipo: 'saldo_debitado',
      userId,
      dadosAntes: { saldo: saldoAnterior },
      dadosDepois: { saldo: saldoNovo }
    });
    
    console.log(`✅ [FINANCEIRO] Debitado R$ ${valor} de usuário ${userId}`);
    
    return {
      success: true,
      transacaoId,
      saldoAnterior,
      saldoNovo
    };
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao debitar saldo:', error);
    throw error;
  }
}

// ============================================================
// FUNDO DE REGISTRO
// ============================================================

/**
 * Inicializar Fundo de Registro
 */
export async function inicializarFundo(valorInicial = 10000) {
  try {
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    
    if (fundo.length) {
      console.log('⚠️  [FUNDO] Já existe');
      return fundo[0];
    }
    
    const fundoId = crypto.randomUUID();
    await db.insert(schema.fundoRegistro).values({
      id: fundoId,
      saldoDisponivel: valorInicial,
      saldoBloqueado: 0,
      saldoTotal: valorInicial,
      limiteMinimo: 5000,
      limiteIdeal: 20000,
      historico: JSON.stringify([{
        data: new Date().toISOString(),
        tipo: 'inicializacao',
        valor: valorInicial,
        descricao: 'Fundo inicializado'
      }])
    });
    
    console.log(`✅ [FUNDO] Inicializado com R$ ${valorInicial}`);
    
    return { id: fundoId, saldoDisponivel: valorInicial };
  } catch (error) {
    console.error('[FUNDO] Erro ao inicializar:', error);
    throw error;
  }
}

/**
 * Adicionar valor ao Fundo (quando pagamento confirmado)
 */
export async function adicionarAoFundo(valor, origem = 'pagamento') {
  try {
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    
    if (!fundo.length) {
      await inicializarFundo();
      return adicionarAoFundo(valor, origem);
    }
    
    const novoSaldoDisponivel = fundo[0].saldoDisponivel + valor;
    const novoSaldoTotal = fundo[0].saldoTotal + valor;
    
    await db.update(schema.fundoRegistro)
      .set({
        saldoDisponivel: novoSaldoDisponivel,
        saldoTotal: novoSaldoTotal,
        totalReposto: (fundo[0].totalReposto || 0) + valor,
        ultimaAtualizacao: new Date()
      })
      .where(eq(schema.fundoRegistro.id, fundo[0].id));
    
    console.log(`✅ [FUNDO] Adicionado R$ ${valor} (${origem})`);
    
    return { success: true, novoSaldo: novoSaldoDisponivel };
  } catch (error) {
    console.error('[FUNDO] Erro ao adicionar:', error);
    throw error;
  }
}

/**
 * Reservar valor do Fundo para registro de bolão
 */
export async function reservarFundo(bolaoId, valor) {
  try {
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    
    if (!fundo.length) {
      throw new Error('Fundo não inicializado');
    }
    
    if (fundo[0].saldoDisponivel < valor) {
      throw new Error(`Fundo insuficiente. Disponível: R$ ${fundo[0].saldoDisponivel}`);
    }
    
    // Criar reserva
    const reservaId = crypto.randomUUID();
    await db.insert(schema.reservasFundo).values({
      id: reservaId,
      bolaoId,
      valorReservado: valor,
      status: 'reservado'
    });
    
    // Atualizar fundo
    const novoSaldoDisponivel = fundo[0].saldoDisponivel - valor;
    const novoSaldoBloqueado = fundo[0].saldoBloqueado + valor;
    
    await db.update(schema.fundoRegistro)
      .set({
        saldoDisponivel: novoSaldoDisponivel,
        saldoBloqueado: novoSaldoBloqueado,
        ultimaAtualizacao: new Date()
      })
      .where(eq(schema.fundoRegistro.id, fundo[0].id));
    
    console.log(`✅ [FUNDO] Reservado R$ ${valor} para bolão ${bolaoId}`);
    
    return { success: true, reservaId };
  } catch (error) {
    console.error('[FUNDO] Erro ao reservar:', error);
    throw error;
  }
}

/**
 * Utilizar reserva (registrar bolão na lotérica)
 */
export async function utilizarReserva(bolaoId, codigoRegistro) {
  try {
    const reserva = await db.select().from(schema.reservasFundo)
      .where(and(
        eq(schema.reservasFundo.bolaoId, bolaoId),
        eq(schema.reservasFundo.status, 'reservado')
      ))
      .limit(1);
    
    if (!reserva.length) {
      throw new Error('Reserva não encontrada');
    }
    
    // Atualizar reserva
    await db.update(schema.reservasFundo)
      .set({
        status: 'utilizado',
        valorUtilizado: reserva[0].valorReservado,
        codigoRegistro,
        dataUtilizacao: new Date()
      })
      .where(eq(schema.reservasFundo.id, reserva[0].id));
    
    // Atualizar estatísticas do fundo
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    await db.update(schema.fundoRegistro)
      .set({
        totalUtilizado: (fundo[0].totalUtilizado || 0) + reserva[0].valorReservado
      })
      .where(eq(schema.fundoRegistro.id, fundo[0].id));
    
    console.log(`✅ [FUNDO] Utilizado R$ ${reserva[0].valorReservado} - Código: ${codigoRegistro}`);
    
    return { success: true };
  } catch (error) {
    console.error('[FUNDO] Erro ao utilizar reserva:', error);
    throw error;
  }
}

/**
 * Monitorar saúde do Fundo
 */
export async function monitorarFundo() {
  try {
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    
    if (!fundo.length) {
      return { alerta: 'critico', mensagem: 'Fundo não inicializado' };
    }
    
    const percentualDisponivel = (fundo[0].saldoDisponivel / fundo[0].limiteIdeal) * 100;
    
    let status = 'saudavel';
    let alerta = null;
    
    if (fundo[0].saldoDisponivel < fundo[0].limiteMinimo) {
      status = 'critico';
      alerta = `Fundo crítico: R$ ${fundo[0].saldoDisponivel.toFixed(2)} (< R$ ${fundo[0].limiteMinimo})`;
    } else if (percentualDisponivel < 50) {
      status = 'atencao';
      alerta = `Fundo baixo: ${percentualDisponivel.toFixed(0)}% do ideal`;
    }
    
    return {
      status,
      alerta,
      saldoDisponivel: fundo[0].saldoDisponivel,
      saldoBloqueado: fundo[0].saldoBloqueado,
      percentualDisponivel: percentualDisponivel.toFixed(1),
      capacidade: Math.floor(fundo[0].saldoDisponivel / 2500) // Qtd bolões médios
    };
  } catch (error) {
    console.error('[FUNDO] Erro ao monitorar:', error);
    return { status: 'erro', alerta: error.message };
  }
}

// ============================================================
// SAQUES
// ============================================================

/**
 * Solicitar saque
 */
export async function solicitarSaque({ userId, valor, tipoConta, dadosBancarios }) {
  try {
    // Buscar usuário
    const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
    
    if (!user.length) {
      throw new Error('Usuário não encontrado');
    }
    
    // Buscar config
    const config = await db.select().from(schema.configFinanceira).limit(1);
    const conf = config.length ? config[0] : {};
    
    // Validações
    const saqueMinimo = conf.saqueMinimo || 20;
    const saqueMaximo = conf.saqueMaximo || 10000;
    
    if (valor < saqueMinimo) {
      throw new Error(`Valor mínimo para saque: R$ ${saqueMinimo}`);
    }
    
    if (valor > saqueMaximo) {
      throw new Error(`Valor máximo para saque: R$ ${saqueMaximo}`);
    }
    
    if (user[0].saldo < valor) {
      throw new Error('Saldo insuficiente');
    }
    
    // Calcular taxa
    const taxaPercentual = (valor * (conf.taxaSaquePercentual || 0)) / 100;
    const taxaFixa = conf.taxaSaqueFixa || 0;
    const taxaTotal = Math.max(taxaPercentual + taxaFixa, conf.taxaSaqueMinima || 2);
    const valorLiquido = valor - taxaTotal;
    
    // Criar solicitação
    const saqueId = crypto.randomUUID();
    await db.insert(schema.saques).values({
      id: saqueId,
      userId,
      valorSolicitado: valor,
      valorTaxa: taxaTotal,
      valorLiquido,
      tipoConta,
      ...dadosBancarios,
      status: 'solicitado'
    });
    
    // Bloquear saldo (criar transação pendente)
    await debitarSaldo({
      userId,
      valor,
      tipo: 'saque',
      descricao: `Saque solicitado - ID: ${saqueId}`,
      metadata: { saqueId, status: 'pendente' }
    });
    
    console.log(`✅ [SAQUE] Solicitado R$ ${valor} por usuário ${userId}`);
    
    return {
      success: true,
      saqueId,
      valorSolicitado: valor,
      valorTaxa: taxaTotal,
      valorLiquido,
      status: 'solicitado'
    };
  } catch (error) {
    console.error('[SAQUE] Erro ao solicitar:', error);
    throw error;
  }
}

// ============================================================
// AUDITORIA
// ============================================================

/**
 * Log de auditoria
 */
async function logAuditoria({ tipo, userId = null, adminId = null, dadosAntes = {}, dadosDepois = {} }) {
  try {
    await db.insert(schema.auditFinanceira).values({
      id: crypto.randomUUID(),
      tipo,
      userId,
      adminId,
      dadosAntes: JSON.stringify(dadosAntes),
      dadosDepois: JSON.stringify(dadosDepois)
    });
  } catch (error) {
    console.error('[AUDIT] Erro:', error);
  }
}

/**
 * Reconciliação financeira (rodar diariamente)
 */
export async function reconciliarFinanceiro() {
  try {
    // Somar todos os saldos de usuários
    const totalUsuarios = await db.select({
      total: sql`SUM(saldo)`
    }).from(schema.users);
    
    // Somar todas as transações confirmadas
    const totalTransacoes = await db.select({
      total: sql`SUM(valor)`
    }).from(schema.transactions).where(eq(schema.transactions.status, 'confirmado'));
    
    // Buscar fundo
    const fundo = await db.select().from(schema.fundoRegistro).limit(1);
    
    const resultado = {
      data: new Date().toISOString(),
      totalUsuarios: totalUsuarios[0]?.total || 0,
      totalTransacoes: totalTransacoes[0]?.total || 0,
      fundoDisponivel: fundo[0]?.saldoDisponivel || 0,
      fundoBloqueado: fundo[0]?.saldoBloqueado || 0,
      divergencia: Math.abs((totalUsuarios[0]?.total || 0) - (totalTransacoes[0]?.total || 0))
    };
    
    if (resultado.divergencia > 0.01) {
      console.warn('⚠️  [RECONCILIAÇÃO] Divergência detectada:', resultado);
    } else {
      console.log('✅ [RECONCILIAÇÃO] Financeiro OK');
    }
    
    return resultado;
  } catch (error) {
    console.error('[RECONCILIAÇÃO] Erro:', error);
    throw error;
  }
}
