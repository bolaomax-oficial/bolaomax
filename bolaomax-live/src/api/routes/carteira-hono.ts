/**
 * API Routes - Carteira (Hono)
 * 
 * Rotas para gerenciamento da carteira do usuário:
 * - Recarregar saldo (PIX, Cartão, Boleto)
 * - Consultar saldo
 * - Histórico de recargas
 * 
 * PROTEÇÃO: Todas as rotas requerem autenticação JWT
 */

import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import crypto from 'crypto';
import { validateSession, UserRecord, updateUserSaldo } from '../auth/auth-store';

// ============================================================
// Types
// ============================================================
interface RecargaRecord {
  id: string;
  userId: string;
  valor: number;
  formaPagamento: 'pix' | 'cartao' | 'boleto';
  status: 'pendente' | 'aprovado' | 'recusado' | 'expirado';
  transacaoId: string | null;
  dataCriacao: string;
  dataConfirmacao: string | null;
}

interface PixPaymentData {
  qrCode: string;
  qrCodeBase64: string;
  copiaCola: string;
  transacaoId: string;
  expiraEm: string;
}

interface BoletoPaymentData {
  url: string;
  codigoBarras: string;
  transacaoId: string;
  vencimento: string;
}

// Extend Hono context with authenticated user
type Variables = {
  user: UserRecord;
};

const app = new Hono<{ Variables: Variables }>();

// ============================================================
// In-memory stores
// ============================================================
const recargasStore = new Map<string, RecargaRecord>();

// ============================================================
// Auth Middleware (User)
// ============================================================
const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Token de autenticação não fornecido',
      code: 'NO_TOKEN',
    }, 401);
  }

  const token = authHeader.substring(7);
  const result = validateSession(token);

  if (!result.valid || !result.user) {
    return c.json({
      success: false,
      error: result.error || 'Sessão inválida ou expirada',
      code: 'INVALID_SESSION',
    }, 401);
  }

  c.set('user', result.user);
  await next();
});

// Apply auth middleware to all routes
app.use('/*', authMiddleware);

// ============================================================
// Helper: Generate mock PIX data
// ============================================================
const gerarDadosPix = (valor: number, transacaoId: string): PixPaymentData => {
  // In production, this would integrate with Pagar.me API
  const copiaCola = `00020126580014br.gov.bcb.pix0136${crypto.randomUUID()}5204000053039865802BR5925BOLAOMAX PAGAMENTOS LTDA6009SAO PAULO62070503***63041D3D`;
  
  // Mock QR Code base64 (in production, generate real QR)
  const qrCodeBase64 = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect fill="#fff" width="200" height="200"/>
      <text x="100" y="100" text-anchor="middle" font-size="12" fill="#333">PIX QR Code</text>
      <text x="100" y="120" text-anchor="middle" font-size="10" fill="#666">R$ ${valor.toFixed(2)}</text>
      <rect x="40" y="40" width="120" height="120" fill="none" stroke="#000" stroke-width="4"/>
      <rect x="50" y="50" width="20" height="20" fill="#000"/>
      <rect x="80" y="50" width="20" height="20" fill="#000"/>
      <rect x="130" y="50" width="20" height="20" fill="#000"/>
      <rect x="50" y="80" width="20" height="20" fill="#000"/>
      <rect x="100" y="80" width="20" height="20" fill="#000"/>
      <rect x="130" y="80" width="20" height="20" fill="#000"/>
      <rect x="50" y="130" width="20" height="20" fill="#000"/>
      <rect x="80" y="130" width="20" height="20" fill="#000"/>
      <rect x="130" y="130" width="20" height="20" fill="#000"/>
    </svg>
  `)}`;
  
  const expiraEm = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
  
  return {
    qrCode: copiaCola,
    qrCodeBase64,
    copiaCola,
    transacaoId,
    expiraEm,
  };
};

// ============================================================
// Helper: Generate mock Boleto data
// ============================================================
const gerarDadosBoleto = (valor: number, transacaoId: string): BoletoPaymentData => {
  // In production, this would integrate with Pagar.me API
  const codigoBarras = `23793.38128 60000.000003 00000.000400 ${Math.floor(Math.random() * 900000000 + 100000000)}`;
  const vencimento = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days
  
  return {
    url: `https://boleto.example.com/${transacaoId}.pdf`,
    codigoBarras,
    transacaoId,
    vencimento,
  };
};

// ============================================================
// POST /carteira/recarregar - Recarregar carteira
// ============================================================
app.post('/recarregar', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { valor, formaPagamento, dadosPagamento } = body;

    console.log(`[CARTEIRA] Recarga solicitada por ${user.email}: R$ ${valor} via ${formaPagamento}`);

    // Validate valor
    if (!valor || valor < 10 || valor > 10000) {
      return c.json({
        success: false,
        error: 'Valor deve estar entre R$ 10,00 e R$ 10.000,00',
        code: 'INVALID_VALUE',
      }, 400);
    }

    // Validate payment method
    if (!['pix', 'cartao', 'boleto'].includes(formaPagamento)) {
      return c.json({
        success: false,
        error: 'Forma de pagamento inválida',
        code: 'INVALID_PAYMENT_METHOD',
      }, 400);
    }

    const transacaoId = `rec_${crypto.randomUUID().split('-')[0]}`;
    
    // Create recarga record
    const recarga: RecargaRecord = {
      id: crypto.randomUUID(),
      userId: user.id,
      valor: Number(valor),
      formaPagamento,
      status: 'pendente',
      transacaoId,
      dataCriacao: new Date().toISOString(),
      dataConfirmacao: null,
    };

    // Handle different payment methods
    if (formaPagamento === 'pix') {
      const pixData = gerarDadosPix(valor, transacaoId);
      recargasStore.set(recarga.id, recarga);
      
      return c.json({
        success: true,
        message: 'PIX gerado com sucesso',
        pix: pixData,
        recargaId: recarga.id,
      });
    }
    
    if (formaPagamento === 'boleto') {
      const boletoData = gerarDadosBoleto(valor, transacaoId);
      recargasStore.set(recarga.id, recarga);
      
      return c.json({
        success: true,
        message: 'Boleto gerado com sucesso',
        boleto: boletoData,
        recargaId: recarga.id,
      });
    }
    
    if (formaPagamento === 'cartao') {
      // Validate card data
      if (!dadosPagamento || !dadosPagamento.numero || !dadosPagamento.nome || !dadosPagamento.validade || !dadosPagamento.cvv) {
        return c.json({
          success: false,
          error: 'Dados do cartão incompletos',
          code: 'INVALID_CARD_DATA',
        }, 400);
      }

      // In production, this would:
      // 1. Encrypt card data using Pagar.me encryption key
      // 2. Create transaction via Pagar.me API
      // 3. Handle 3DS authentication if required
      // 4. Process the payment

      // Simulate payment processing (always approve for demo)
      const cardLast4 = dadosPagamento.numero.slice(-4);
      console.log(`[CARTEIRA] Processando cartão final ${cardLast4}`);

      // Simulate success
      recarga.status = 'aprovado';
      recarga.dataConfirmacao = new Date().toISOString();
      recargasStore.set(recarga.id, recarga);

      // Update user balance
      const novoSaldo = (user.saldo || 0) + Number(valor);
      updateUserSaldo(user.id, novoSaldo);

      return c.json({
        success: true,
        message: 'Pagamento aprovado com sucesso',
        novoSaldo,
        recargaId: recarga.id,
        transacaoId,
      });
    }

    return c.json({
      success: false,
      error: 'Forma de pagamento não implementada',
      code: 'NOT_IMPLEMENTED',
    }, 400);

  } catch (error: any) {
    console.error('[CARTEIRA] Erro ao processar recarga:', error);
    return c.json({
      success: false,
      error: 'Erro ao processar recarga',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /carteira/saldo - Consultar saldo
// ============================================================
app.get('/saldo', async (c) => {
  try {
    const user = c.get('user');
    
    return c.json({
      success: true,
      saldo: user.saldo || 0,
    });
  } catch (error: any) {
    console.error('[CARTEIRA] Erro ao consultar saldo:', error);
    return c.json({
      success: false,
      error: 'Erro ao consultar saldo',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /carteira/historico - Histórico de recargas
// ============================================================
app.get('/historico', async (c) => {
  try {
    const user = c.get('user');
    
    const recargas = Array.from(recargasStore.values())
      .filter(r => r.userId === user.id)
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
      .slice(0, 20); // Last 20 records
    
    return c.json({
      success: true,
      recargas: recargas.map(r => ({
        id: r.id,
        valor: r.valor,
        formaPagamento: r.formaPagamento,
        status: r.status,
        dataCriacao: r.dataCriacao,
        dataConfirmacao: r.dataConfirmacao,
      })),
    });
  } catch (error: any) {
    console.error('[CARTEIRA] Erro ao buscar histórico:', error);
    return c.json({
      success: false,
      error: 'Erro ao buscar histórico',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /carteira/confirmar/:id - Confirmar pagamento (webhook simulation)
// ============================================================
app.post('/confirmar/:id', async (c) => {
  try {
    const user = c.get('user');
    const recargaId = c.req.param('id');
    
    const recarga = recargasStore.get(recargaId);
    
    if (!recarga) {
      return c.json({
        success: false,
        error: 'Recarga não encontrada',
        code: 'NOT_FOUND',
      }, 404);
    }
    
    if (recarga.userId !== user.id) {
      return c.json({
        success: false,
        error: 'Recarga não pertence ao usuário',
        code: 'FORBIDDEN',
      }, 403);
    }
    
    if (recarga.status !== 'pendente') {
      return c.json({
        success: false,
        error: 'Recarga já foi processada',
        code: 'ALREADY_PROCESSED',
      }, 400);
    }
    
    // Confirm payment
    recarga.status = 'aprovado';
    recarga.dataConfirmacao = new Date().toISOString();
    recargasStore.set(recargaId, recarga);
    
    // Update user balance
    const novoSaldo = (user.saldo || 0) + recarga.valor;
    updateUserSaldo(user.id, novoSaldo);
    
    return c.json({
      success: true,
      message: 'Pagamento confirmado',
      novoSaldo,
    });
  } catch (error: any) {
    console.error('[CARTEIRA] Erro ao confirmar recarga:', error);
    return c.json({
      success: false,
      error: 'Erro ao confirmar recarga',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

export default app;
