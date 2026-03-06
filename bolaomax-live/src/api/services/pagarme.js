/**
 * Serviço de Integração com Pagar.me (Stone)
 * Gateway de pagamento oficial do BolãoMax
 */

import pagarme from 'pagarme';

// Configurações (vão vir do banco de dados/env)
const PAGARME_API_KEY = process.env.PAGARME_API_KEY || 'sk_test_example';
const PAGARME_ENCRYPTION_KEY = process.env.PAGARME_ENCRYPTION_KEY || 'ek_test_example';
const IS_SANDBOX = process.env.PAGARME_SANDBOX === 'true';

let client = null;

/**
 * Inicializar cliente Pagar.me
 */
async function initClient() {
  if (!client) {
    client = await pagarme.client.connect({ 
      api_key: PAGARME_API_KEY,
      encryption_key: PAGARME_ENCRYPTION_KEY
    });
  }
  return client;
}

/**
 * Testar conexão com Pagar.me
 */
export async function testConnection() {
  try {
    const client = await initClient();
    
    // Buscar informações da conta
    const company = await client.company.current();
    
    return {
      success: true,
      connected: true,
      company: {
        name: company.name,
        email: company.email,
        id: company.id,
      },
      environment: IS_SANDBOX ? 'sandbox' : 'production'
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao testar conexão:', error);
    return {
      success: false,
      connected: false,
      error: error.message
    };
  }
}

/**
 * Criar transação PIX
 */
export async function createPixTransaction({ amount, customer, metadata = {} }) {
  try {
    const client = await initClient();
    
    const transaction = await client.transactions.create({
      amount: Math.round(amount * 100), // Converter para centavos
      payment_method: 'pix',
      pix_expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
      customer: {
        external_id: customer.id,
        name: customer.name,
        email: customer.email,
        type: 'individual',
        country: 'br',
        documents: [
          {
            type: 'cpf',
            number: customer.cpf?.replace(/\D/g, '') || '00000000000'
          }
        ]
      },
      metadata: {
        ...metadata,
        platform: 'bolaomax'
      }
    });
    
    return {
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      pixQrCode: transaction.pix_qr_code,
      pixQrCodeUrl: transaction.pix_qr_code_url,
      expiresAt: transaction.pix_expiration_date
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao criar transação PIX:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Criar transação com Cartão de Crédito
 */
export async function createCreditCardTransaction({ 
  amount, 
  installments = 1,
  cardHash,
  customer, 
  metadata = {} 
}) {
  try {
    const client = await initClient();
    
    const transaction = await client.transactions.create({
      amount: Math.round(amount * 100), // Converter para centavos
      payment_method: 'credit_card',
      card_hash: cardHash,
      installments,
      customer: {
        external_id: customer.id,
        name: customer.name,
        email: customer.email,
        type: 'individual',
        country: 'br',
        documents: [
          {
            type: 'cpf',
            number: customer.cpf?.replace(/\D/g, '') || '00000000000'
          }
        ],
        phone_numbers: customer.telefone ? [
          `+55${customer.telefone.replace(/\D/g, '')}`
        ] : []
      },
      billing: {
        name: customer.name,
        address: customer.address || {
          country: 'br',
          state: 'sp',
          city: 'São Paulo',
          neighborhood: 'Centro',
          street: 'Rua Exemplo',
          street_number: '123',
          zipcode: '01310100'
        }
      },
      metadata: {
        ...metadata,
        platform: 'bolaomax'
      }
    });
    
    return {
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      authorizationCode: transaction.authorization_code,
      tid: transaction.tid,
      nsu: transaction.nsu
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao criar transação cartão:', error);
    return {
      success: false,
      error: error.message,
      errors: error.response?.errors
    };
  }
}

/**
 * Criar transação Boleto
 */
export async function createBoletoTransaction({ amount, customer, metadata = {} }) {
  try {
    const client = await initClient();
    
    const transaction = await client.transactions.create({
      amount: Math.round(amount * 100), // Converter para centavos
      payment_method: 'boleto',
      boleto_expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
      customer: {
        external_id: customer.id,
        name: customer.name,
        email: customer.email,
        type: 'individual',
        country: 'br',
        documents: [
          {
            type: 'cpf',
            number: customer.cpf?.replace(/\D/g, '') || '00000000000'
          }
        ]
      },
      metadata: {
        ...metadata,
        platform: 'bolaomax'
      }
    });
    
    return {
      success: true,
      transactionId: transaction.id,
      status: transaction.status,
      boletoUrl: transaction.boleto_url,
      boletoBarcode: transaction.boleto_barcode,
      expiresAt: transaction.boleto_expiration_date
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao criar transação boleto:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Consultar status de transação
 */
export async function getTransactionStatus(transactionId) {
  try {
    const client = await initClient();
    const transaction = await client.transactions.find({ id: transactionId });
    
    return {
      success: true,
      status: transaction.status,
      amount: transaction.amount / 100,
      paidAt: transaction.date_updated,
      refunded: transaction.refunded,
      metadata: transaction.metadata
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao consultar transação:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Processar webhook do Pagar.me
 */
export async function processWebhook(payload, signature) {
  try {
    // TODO: Validar assinatura do webhook
    
    const event = payload.event;
    const transaction = payload.current_status;
    
    console.log(`[PAGARME] Webhook recebido: ${event}`, {
      transactionId: payload.id,
      status: transaction
    });
    
    // Mapear status do Pagar.me para status interno
    const statusMap = {
      'paid': 'confirmado',
      'waiting_payment': 'pendente',
      'processing': 'processando',
      'authorized': 'autorizado',
      'refused': 'recusado',
      'refunded': 'reembolsado',
      'chargedback': 'chargeback',
    };
    
    // Se pagamento foi confirmado, creditar carteira
    if (transaction === 'paid') {
      const { creditarSaldo, adicionarAoFundo } = await import('./financeiro.js');
      const { confirmarRecarga } = await import('./recarga-carteira.js');
      
      // Buscar dados da transação original
      const metadata = payload.metadata || {};
      const amount = payload.amount / 100; // Converter de centavos
      
      // Verificar se é recarga de carteira
      if (metadata.tipo === 'recarga_carteira') {
        console.log(`[WEBHOOK] Detectada recarga de carteira: ${payload.id}`);
        
        // Confirmar recarga (credita saldo automaticamente)
        await confirmarRecarga(payload.id);
        
        // Adicionar ao Fundo de Registro
        await adicionarAoFundo(amount, `recarga_${payload.id}`);
        
        console.log(`✅ [WEBHOOK] Recarga confirmada: R$ ${amount}`);
      } else if (metadata.userId) {
        // Pagamento normal de bolão
        // Creditar carteira do usuário
        await creditarSaldo({
          userId: metadata.userId,
          valor: amount,
          tipo: 'deposito',
          descricao: `Pagamento via ${payload.payment_method} - ${payload.id}`,
          gatewayTransactionId: payload.id,
          metadata: {
            paymentMethod: payload.payment_method,
            bolaoId: metadata.bolaoId,
            gatewayEvent: event
          }
        });
        
        // Adicionar ao Fundo de Registro
        await adicionarAoFundo(amount, `transacao_${payload.id}`);
        
        console.log(`✅ [WEBHOOK] Creditado R$ ${amount} para usuário ${metadata.userId}`);
      }
    }
    
    return {
      success: true,
      transactionId: payload.id,
      event,
      status: statusMap[transaction] || transaction,
      needsUpdate: true
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao processar webhook:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Criar assinatura (recorrência)
 */
export async function createSubscription({ planId, customer, cardHash, metadata = {} }) {
  try {
    const client = await initClient();
    
    const subscription = await client.subscriptions.create({
      plan_id: planId,
      card_hash: cardHash,
      customer: {
        external_id: customer.id,
        name: customer.name,
        email: customer.email,
        type: 'individual',
        country: 'br',
        documents: [
          {
            type: 'cpf',
            number: customer.cpf?.replace(/\D/g, '') || '00000000000'
          }
        ]
      },
      metadata: {
        ...metadata,
        platform: 'bolaomax'
      }
    });
    
    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao criar assinatura:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(subscriptionId) {
  try {
    const client = await initClient();
    const subscription = await client.subscriptions.cancel({ id: subscriptionId });
    
    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao cancelar assinatura:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Listar transações
 */
export async function listTransactions({ page = 1, count = 10, status = null }) {
  try {
    const client = await initClient();
    
    const params = {
      page,
      count
    };
    
    if (status) {
      params.status = status;
    }
    
    const transactions = await client.transactions.all(params);
    
    return {
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount / 100,
        status: t.status,
        paymentMethod: t.payment_method,
        createdAt: t.date_created,
        customer: t.customer?.name
      })),
      page,
      hasMore: transactions.length === count
    };
  } catch (error) {
    console.error('[PAGARME] Erro ao listar transações:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
