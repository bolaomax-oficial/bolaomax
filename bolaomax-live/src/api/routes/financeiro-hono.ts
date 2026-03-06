/**
 * Admin API - Sistema Financeiro (Hono)
 * 
 * Rotas para administradores gerenciarem o sistema financeiro
 * Usando armazenamento em memória para compatibilidade com Cloudflare Workers
 * 
 * PROTEÇÃO: Todas as rotas requerem autenticação JWT com role = admin
 */

import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import crypto from 'crypto';
import { validateSession, UserRecord } from '../auth/auth-store';

// ============================================================
// Types
// ============================================================
interface FundoRegistro {
  id: string;
  saldoDisponivel: number;
  saldoBloqueado: number;
  saldoTotal: number;
  limiteMinimo: number;
  limiteIdeal: number;
  totalUtilizado: number;
  totalReposto: number;
  ultimaAtualizacao: string;
}

interface SaqueRecord {
  id: string;
  userId: string;
  valorSolicitado: number;
  valorTaxa: number;
  valorLiquido: number;
  tipoConta: string;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  status: string;
  motivoRecusa: string | null;
  dataSolicitacao: string;
  dataAprovacao: string | null;
  aprovadoPor: string | null;
  // Extra fields for UI
  clienteNome: string;
  clienteEmail: string;
}

interface UserCarteira {
  id: string;
  nome: string;
  email: string;
  saldo: number;
}

// Extend Hono context with authenticated user
type Variables = {
  user: UserRecord;
};

const app = new Hono<{ Variables: Variables }>();

// ============================================================
// Admin Authentication Middleware
// ============================================================
const adminAuthMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
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

  if (result.user.role !== 'admin') {
    return c.json({
      success: false,
      error: 'Acesso negado. Permissão de administrador necessária.',
      code: 'FORBIDDEN',
    }, 403);
  }

  c.set('user', result.user);
  await next();
});

// Apply admin auth middleware to all routes
app.use('/*', adminAuthMiddleware);

// ============================================================
// In-memory stores (initialized with seed data)
// ============================================================

// Fundo de Registro
const fundoRegistro: FundoRegistro = {
  id: 'fundo-001',
  saldoDisponivel: 45000,
  saldoBloqueado: 12500,
  saldoTotal: 57500,
  limiteMinimo: 5000,
  limiteIdeal: 20000,
  totalUtilizado: 125000,
  totalReposto: 180000,
  ultimaAtualizacao: new Date().toISOString(),
};

// Saques pendentes
const saquesStore = new Map<string, SaqueRecord>();

// Seed saques
const seedSaques: SaqueRecord[] = [
  {
    id: 'saq-001',
    userId: 'user-001',
    valorSolicitado: 2500,
    valorTaxa: 0,
    valorLiquido: 2500,
    tipoConta: 'pix',
    chavePix: 'maria.silva@email.com',
    banco: null,
    agencia: null,
    conta: null,
    status: 'solicitado',
    motivoRecusa: null,
    dataSolicitacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    dataAprovacao: null,
    aprovadoPor: null,
    clienteNome: 'Maria Silva Santos',
    clienteEmail: 'maria.silva@email.com',
  },
  {
    id: 'saq-002',
    userId: 'user-002',
    valorSolicitado: 850,
    valorTaxa: 0,
    valorLiquido: 850,
    tipoConta: 'pix',
    chavePix: '11999887766',
    banco: null,
    agencia: null,
    conta: null,
    status: 'solicitado',
    motivoRecusa: null,
    dataSolicitacao: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    dataAprovacao: null,
    aprovadoPor: null,
    clienteNome: 'João Pedro Oliveira',
    clienteEmail: 'joao.pedro@email.com',
  },
  {
    id: 'saq-003',
    userId: 'user-003',
    valorSolicitado: 5000,
    valorTaxa: 0,
    valorLiquido: 5000,
    tipoConta: 'ted',
    chavePix: null,
    banco: '001',
    agencia: '1234',
    conta: '56789-0',
    status: 'processando',
    motivoRecusa: null,
    dataSolicitacao: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22h ago
    dataAprovacao: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    aprovadoPor: 'admin',
    clienteNome: 'Ana Costa',
    clienteEmail: 'ana.costa@email.com',
  },
  {
    id: 'saq-004',
    userId: 'user-004',
    valorSolicitado: 750,
    valorTaxa: 0,
    valorLiquido: 750,
    tipoConta: 'pix',
    chavePix: 'roberto@email.com',
    banco: null,
    agencia: null,
    conta: null,
    status: 'solicitado',
    motivoRecusa: null,
    dataSolicitacao: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // 28h ago - overdue
    dataAprovacao: null,
    aprovadoPor: null,
    clienteNome: 'Roberto Almeida',
    clienteEmail: 'roberto@email.com',
  },
];

seedSaques.forEach(saque => {
  saquesStore.set(saque.id, saque);
});

// Mock users with balances
const usersCarteira: UserCarteira[] = [
  { id: 'user-001', nome: 'Maria Silva', email: 'maria@email.com', saldo: 1250 },
  { id: 'user-002', nome: 'João Pedro', email: 'joao@email.com', saldo: 850 },
  { id: 'user-003', nome: 'Ana Costa', email: 'ana@email.com', saldo: 2500 },
  { id: 'user-004', nome: 'Roberto Almeida', email: 'roberto@email.com', saldo: 450 },
  { id: 'user-005', nome: 'Carlos Lima', email: 'carlos@email.com', saldo: 3200 },
];

// ============================================================
// Helper Functions
// ============================================================
const monitorarFundo = () => {
  const percentualUso = fundoRegistro.limiteIdeal > 0 
    ? (fundoRegistro.saldoTotal / fundoRegistro.limiteIdeal) * 100 
    : 0;
  
  let status: 'ok' | 'alerta' | 'critico' = 'ok';
  if (fundoRegistro.saldoDisponivel < fundoRegistro.limiteMinimo) {
    status = 'critico';
  } else if (fundoRegistro.saldoDisponivel < fundoRegistro.limiteMinimo * 2) {
    status = 'alerta';
  }

  return {
    ...fundoRegistro,
    percentualUso: Math.round(percentualUso),
    status,
  };
};

// ============================================================
// GET /financeiro/admin/dashboard - Dashboard financeiro completo
// ============================================================
app.get('/admin/dashboard', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[FINANCEIRO] Dashboard requested by: ${user.email}`);

    const statusFundo = monitorarFundo();
    
    // Calculate totals from mock data
    const totalUsuarios = usersCarteira.length;
    const totalSaldo = usersCarteira.reduce((sum, u) => sum + u.saldo, 0);
    
    // Transactions today (mock)
    const transacoesHoje = {
      quantidade: 23,
      valor: 12450,
    };
    
    // Pending withdrawals
    const saquesPendentesArr = Array.from(saquesStore.values())
      .filter(s => s.status === 'solicitado');
    
    const saquesPendentes = {
      quantidade: saquesPendentesArr.length,
      valor: saquesPendentesArr.reduce((sum, s) => sum + s.valorSolicitado, 0),
    };

    return c.json({
      success: true,
      fundo: statusFundo,
      usuarios: {
        total: totalUsuarios,
        saldoTotal: totalSaldo,
      },
      transacoesHoje,
      saquesPendentes,
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro no dashboard:', error);
    return c.json({
      success: false,
      error: 'Erro ao carregar dashboard',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /financeiro/admin/saques-pendentes - Listar saques pendentes
// ============================================================
app.get('/admin/saques-pendentes', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[FINANCEIRO] Saques pendentes requested by: ${user.email}`);

    const saquesPendentes = Array.from(saquesStore.values())
      .filter(s => s.status === 'solicitado')
      .sort((a, b) => new Date(a.dataSolicitacao).getTime() - new Date(b.dataSolicitacao).getTime());

    return c.json({
      success: true,
      saques: saquesPendentes.map(s => ({
        id: s.id,
        userId: s.userId,
        valorSolicitado: s.valorSolicitado,
        valorLiquido: s.valorLiquido,
        tipoConta: s.tipoConta,
        chavePix: s.chavePix,
        banco: s.banco,
        agencia: s.agencia,
        conta: s.conta,
        dataSolicitacao: s.dataSolicitacao,
        cliente: s.clienteNome,
        clienteEmail: s.clienteEmail,
        clienteAvatar: s.clienteNome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      })),
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro ao listar saques pendentes:', error);
    return c.json({
      success: false,
      saques: [],
      error: 'Erro ao listar saques',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /financeiro/admin/saque/:id/aprovar - Aprovar saque
// ============================================================
app.post('/admin/saque/:id/aprovar', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    console.log(`[FINANCEIRO] Aprovar saque ${id} by: ${user.email}`);

    const saque = saquesStore.get(id);
    
    if (!saque) {
      return c.json({
        success: false,
        error: 'Saque não encontrado',
        code: 'NOT_FOUND',
      }, 404);
    }

    if (saque.status !== 'solicitado') {
      return c.json({
        success: false,
        error: 'Saque não está pendente de aprovação',
        code: 'INVALID_STATUS',
      }, 400);
    }

    // Update saque
    saque.status = 'aprovado';
    saque.dataAprovacao = new Date().toISOString();
    saque.aprovadoPor = user.id;
    saquesStore.set(id, saque);

    return c.json({
      success: true,
      message: 'Saque aprovado com sucesso',
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro ao aprovar saque:', error);
    return c.json({
      success: false,
      error: 'Erro ao aprovar saque',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /financeiro/admin/saque/:id/recusar - Recusar saque
// ============================================================
app.post('/admin/saque/:id/recusar', async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();
    const { motivo } = body;
    
    console.log(`[FINANCEIRO] Recusar saque ${id} by: ${user.email}`);

    const saque = saquesStore.get(id);
    
    if (!saque) {
      return c.json({
        success: false,
        error: 'Saque não encontrado',
        code: 'NOT_FOUND',
      }, 404);
    }

    if (saque.status !== 'solicitado') {
      return c.json({
        success: false,
        error: 'Saque não está pendente',
        code: 'INVALID_STATUS',
      }, 400);
    }

    // Update saque
    saque.status = 'recusado';
    saque.motivoRecusa = motivo || 'Não especificado';
    saque.dataAprovacao = new Date().toISOString();
    saque.aprovadoPor = user.id;
    saquesStore.set(id, saque);

    return c.json({
      success: true,
      message: 'Saque recusado',
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro ao recusar saque:', error);
    return c.json({
      success: false,
      error: 'Erro ao recusar saque',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /financeiro/admin/fundo/aportar - Aportar capital no fundo
// ============================================================
app.post('/admin/fundo/aportar', async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    const { valor } = body;
    
    console.log(`[FINANCEIRO] Aporte de R$ ${valor} by: ${user.email}`);

    if (!valor || valor <= 0) {
      return c.json({
        success: false,
        error: 'Valor inválido',
        code: 'VALIDATION_ERROR',
      }, 400);
    }

    // Update fundo
    fundoRegistro.saldoDisponivel += Number(valor);
    fundoRegistro.saldoTotal += Number(valor);
    fundoRegistro.totalReposto += Number(valor);
    fundoRegistro.ultimaAtualizacao = new Date().toISOString();

    return c.json({
      success: true,
      message: `Aporte de R$ ${valor.toFixed(2)} realizado com sucesso`,
      novoSaldo: fundoRegistro.saldoTotal,
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro ao aportar:', error);
    return c.json({
      success: false,
      error: 'Erro ao realizar aporte',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /financeiro/admin/reconciliar - Executar reconciliação
// ============================================================
app.post('/admin/reconciliar', async (c) => {
  try {
    const user = c.get('user');
    console.log(`[FINANCEIRO] Reconciliação executada by: ${user.email}`);

    // Mock reconciliation result
    return c.json({
      success: true,
      discrepancias: 0,
      ajustes: 0,
      message: 'Reconciliação concluída sem discrepâncias',
    });
  } catch (error: any) {
    console.error('[FINANCEIRO] Erro na reconciliação:', error);
    return c.json({
      success: false,
      error: 'Erro ao reconciliar',
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

export default app;
