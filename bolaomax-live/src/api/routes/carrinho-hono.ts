/**
 * Rotas Hono - Carrinho
 * Gerenciamento do carrinho de compras
 */

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

// In-memory cart storage (temporary implementation)
// In production, this should use the database service
interface CartItem {
  id: string;
  userId: string;
  bolaoId: string;
  bolaoNome: string;
  tipoLoteria: string;
  quantidadeCotas: number;
  valorUnitario: number;
  valorTotal: number;
  expiraEm: Date;
  criadoEm: Date;
}

const cartStorage = new Map<string, CartItem[]>();

// Helper to get user from request (assumes auth middleware sets user)
const getUserId = (c: any): string => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    throw new HTTPException(401, { message: 'Token não fornecido' });
  }
  // For now, extract user ID from token (simplified)
  // In production, validate JWT properly
  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || 'anonymous';
  } catch {
    throw new HTTPException(401, { message: 'Token inválido' });
  }
};

// Helper to generate ID
const generateId = () => crypto.randomUUID();

// Mock bolão data (in production, fetch from database)
const mockBoloes: Record<string, { nome: string; tipoLoteria: string; valorCota: number; cotasDisponiveis: number; status: string }> = {
  '1': { nome: 'Lotofácil Premium', tipoLoteria: 'lotofacil', valorCota: 15, cotasDisponiveis: 100, status: 'aberto' },
  '2': { nome: 'Mega-Sena VIP', tipoLoteria: 'megasena', valorCota: 25, cotasDisponiveis: 50, status: 'aberto' },
  '3': { nome: 'Quina Especial', tipoLoteria: 'quina', valorCota: 10, cotasDisponiveis: 200, status: 'aberto' },
  'ind-1': { nome: 'Lotofácil Independência', tipoLoteria: 'lotofacil', valorCota: 15, cotasDisponiveis: 80, status: 'aberto' },
  'ind-2': { nome: 'Lotofácil Independência 18', tipoLoteria: 'lotofacil', valorCota: 25, cotasDisponiveis: 60, status: 'aberto' },
  'ind-3': { nome: 'Lotofácil Independência 20', tipoLoteria: 'lotofacil', valorCota: 35, cotasDisponiveis: 40, status: 'aberto' },
};

/**
 * POST /api/carrinho/adicionar
 * Adicionar item ao carrinho
 */
app.post('/adicionar', async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json();
    const { bolaoId, quantidadeCotas = 1 } = body;

    if (!bolaoId) {
      return c.json({
        success: false,
        error: 'bolaoId obrigatório',
        code: 'MISSING_BOLAO_ID'
      }, 400);
    }

    if (quantidadeCotas < 1) {
      return c.json({
        success: false,
        error: 'Quantidade deve ser maior que zero',
        code: 'INVALID_QUANTITY'
      }, 400);
    }

    // Get or simulate bolão data
    const bolao = mockBoloes[bolaoId];
    if (!bolao) {
      return c.json({
        success: false,
        error: 'Bolão não encontrado',
        code: 'BOLAO_NOT_FOUND'
      }, 404);
    }

    if (bolao.status !== 'aberto') {
      return c.json({
        success: false,
        error: 'Bolão não está aberto para participações',
        code: 'BOLAO_CLOSED'
      }, 400);
    }

    if (quantidadeCotas > bolao.cotasDisponiveis) {
      return c.json({
        success: false,
        error: `Apenas ${bolao.cotasDisponiveis} cotas disponíveis`,
        code: 'INSUFFICIENT_COTAS'
      }, 400);
    }

    // Get user's cart
    let userCart = cartStorage.get(userId) || [];
    
    // Check if item already exists
    const existingIndex = userCart.findIndex(item => item.bolaoId === bolaoId);
    
    const expiraEm = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (existingIndex >= 0) {
      // Update existing item
      const existing = userCart[existingIndex];
      existing.quantidadeCotas += quantidadeCotas;
      existing.valorTotal = existing.quantidadeCotas * existing.valorUnitario;
      existing.expiraEm = expiraEm;
      
      return c.json({
        success: true,
        itemId: existing.id,
        action: 'updated',
        expiraEm: expiraEm.toISOString(),
        message: 'Quantidade atualizada no carrinho'
      });
    }

    // Create new item
    const newItem: CartItem = {
      id: generateId(),
      userId,
      bolaoId,
      bolaoNome: bolao.nome,
      tipoLoteria: bolao.tipoLoteria,
      quantidadeCotas,
      valorUnitario: bolao.valorCota,
      valorTotal: bolao.valorCota * quantidadeCotas,
      expiraEm,
      criadoEm: new Date()
    };

    userCart.push(newItem);
    cartStorage.set(userId, userCart);

    return c.json({
      success: true,
      itemId: newItem.id,
      action: 'created',
      expiraEm: expiraEm.toISOString(),
      message: 'Item adicionado ao carrinho'
    });
  } catch (error: any) {
    console.error('[API] Erro ao adicionar ao carrinho:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      success: false,
      error: error.message || 'Erro ao adicionar ao carrinho',
      code: 'ADD_ERROR'
    }, 400);
  }
});

/**
 * GET /api/carrinho
 * Buscar carrinho do usuário
 */
app.get('/', async (c) => {
  try {
    const userId = getUserId(c);
    const userCart = cartStorage.get(userId) || [];
    
    // Filter expired items
    const now = new Date();
    const activeItems = userCart.filter(item => new Date(item.expiraEm) > now);
    
    // Update storage with only active items
    cartStorage.set(userId, activeItems);
    
    const totalItens = activeItems.length;
    const valorTotal = activeItems.reduce((sum, item) => sum + item.valorTotal, 0);
    
    // Calculate seconds remaining for timer
    const itensComTimer = activeItems.map(item => ({
      id: item.id,
      bolaoId: item.bolaoId,
      bolaoNome: item.bolaoNome,
      tipoLoteria: item.tipoLoteria,
      quantidadeCotas: item.quantidadeCotas,
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
      expiraEm: item.expiraEm.toISOString(),
      segundosRestantes: Math.max(0, Math.floor((new Date(item.expiraEm).getTime() - now.getTime()) / 1000))
    }));

    return c.json({
      success: true,
      itens: itensComTimer,
      totalItens,
      valorTotal,
      // Global expiration (earliest item)
      expiraEmGlobal: activeItems.length > 0 
        ? new Date(Math.min(...activeItems.map(i => new Date(i.expiraEm).getTime()))).toISOString()
        : null
    });
  } catch (error: any) {
    console.error('[API] Erro ao buscar carrinho:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      success: false,
      error: 'Erro ao buscar carrinho',
      code: 'FETCH_ERROR'
    }, 500);
  }
});

/**
 * DELETE /api/carrinho/item/:id
 * Remover item do carrinho
 */
app.delete('/item/:id', async (c) => {
  try {
    const userId = getUserId(c);
    const itemId = c.req.param('id');
    
    const userCart = cartStorage.get(userId) || [];
    const itemIndex = userCart.findIndex(item => item.id === itemId);
    
    if (itemIndex < 0) {
      return c.json({
        success: false,
        error: 'Item não encontrado',
        code: 'ITEM_NOT_FOUND'
      }, 404);
    }
    
    userCart.splice(itemIndex, 1);
    cartStorage.set(userId, userCart);
    
    return c.json({
      success: true,
      message: 'Item removido do carrinho'
    });
  } catch (error: any) {
    console.error('[API] Erro ao remover do carrinho:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      success: false,
      error: error.message || 'Erro ao remover item',
      code: 'REMOVE_ERROR'
    }, 400);
  }
});

/**
 * DELETE /api/carrinho/limpar
 * Limpar todo o carrinho
 */
app.delete('/limpar', async (c) => {
  try {
    const userId = getUserId(c);
    cartStorage.delete(userId);
    
    return c.json({
      success: true,
      message: 'Carrinho limpo'
    });
  } catch (error: any) {
    console.error('[API] Erro ao limpar carrinho:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      success: false,
      error: 'Erro ao limpar carrinho',
      code: 'CLEAR_ERROR'
    }, 500);
  }
});

/**
 * POST /api/carrinho/finalizar
 * Finalizar compra do carrinho
 */
app.post('/finalizar', async (c) => {
  try {
    const userId = getUserId(c);
    const body = await c.req.json();
    const { formaPagamento } = body;
    
    if (!formaPagamento) {
      return c.json({
        success: false,
        error: 'Forma de pagamento obrigatória',
        code: 'MISSING_PAYMENT_METHOD'
      }, 400);
    }
    
    const userCart = cartStorage.get(userId) || [];
    
    // Filter expired items
    const now = new Date();
    const activeItems = userCart.filter(item => new Date(item.expiraEm) > now);
    
    if (activeItems.length === 0) {
      return c.json({
        success: false,
        error: 'Carrinho vazio ou expirado',
        code: 'EMPTY_CART'
      }, 400);
    }
    
    const valorTotal = activeItems.reduce((sum, item) => sum + item.valorTotal, 0);
    
    // Clear cart after purchase
    cartStorage.delete(userId);
    
    return c.json({
      success: true,
      itens: activeItems,
      valorTotal,
      formaPagamento,
      message: 'Compra iniciada com sucesso',
      // In production, return payment URL/instructions
      redirectUrl: `/checkout?total=${valorTotal}&method=${formaPagamento}`
    });
  } catch (error: any) {
    console.error('[API] Erro ao finalizar carrinho:', error);
    
    if (error instanceof HTTPException) {
      throw error;
    }
    
    return c.json({
      success: false,
      error: error.message || 'Erro ao finalizar compra',
      code: 'CHECKOUT_ERROR'
    }, 400);
  }
});

export default app;
