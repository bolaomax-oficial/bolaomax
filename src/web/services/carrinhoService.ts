/**
 * Carrinho Service (Frontend)
 * Funções para interagir com a API de carrinho
 */

// Types
export interface CartItem {
  id: string;
  bolaoId: string;
  bolaoNome: string;
  tipoLoteria: string;
  quantidadeCotas: number;
  valorUnitario: number;
  valorTotal: number;
  expiraEm: string;
  segundosRestantes: number;
}

export interface CartResponse {
  success: boolean;
  itens: CartItem[];
  totalItens: number;
  valorTotal: number;
  expiraEmGlobal: string | null;
  error?: string;
  code?: string;
}

export interface AddToCartResponse {
  success: boolean;
  itemId?: string;
  action?: "created" | "updated";
  expiraEm?: string;
  message?: string;
  error?: string;
  code?: string;
}

export interface RemoveItemResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export interface CheckoutResponse {
  success: boolean;
  itens?: CartItem[];
  valorTotal?: number;
  formaPagamento?: string;
  message?: string;
  redirectUrl?: string;
  error?: string;
  code?: string;
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper to build headers with auth
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Adicionar item ao carrinho
 * @param bolaoId - ID do bolão
 * @param quantidadeCotas - Quantidade de cotas (default: 1)
 */
export const adicionarAoCarrinho = async (
  bolaoId: string,
  quantidadeCotas: number = 1
): Promise<AddToCartResponse> => {
  try {
    const response = await fetch("/api/carrinho/adicionar", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        bolaoId,
        quantidadeCotas,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao adicionar ao carrinho:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Buscar carrinho do usuário
 */
export const buscarCarrinho = async (): Promise<CartResponse> => {
  try {
    const response = await fetch("/api/carrinho", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao buscar carrinho:", error);
    return {
      success: false,
      itens: [],
      totalItens: 0,
      valorTotal: 0,
      expiraEmGlobal: null,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Remover item do carrinho
 * @param itemId - ID do item no carrinho
 */
export const removerItem = async (itemId: string): Promise<RemoveItemResponse> => {
  try {
    const response = await fetch(`/api/carrinho/item/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao remover item:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Limpar todo o carrinho
 */
export const limparCarrinho = async (): Promise<RemoveItemResponse> => {
  try {
    const response = await fetch("/api/carrinho/limpar", {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao limpar carrinho:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Atualizar quantidade de cotas de um item
 * @param itemId - ID do item no carrinho
 * @param quantidadeCotas - Nova quantidade de cotas
 */
export const atualizarQuantidade = async (
  itemId: string,
  quantidadeCotas: number
): Promise<AddToCartResponse> => {
  try {
    const response = await fetch(`/api/carrinho/item/${itemId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quantidadeCotas,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao atualizar quantidade:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Finalizar compra do carrinho
 * @param formaPagamento - Forma de pagamento (pix, cartao, boleto)
 */
export const finalizarCarrinho = async (
  formaPagamento: "pix" | "cartao" | "boleto"
): Promise<CheckoutResponse> => {
  try {
    const response = await fetch("/api/carrinho/finalizar", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        formaPagamento,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carrinhoService] Erro ao finalizar compra:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

// Default export with all functions
export default {
  adicionarAoCarrinho,
  buscarCarrinho,
  removerItem,
  limparCarrinho,
  atualizarQuantidade,
  finalizarCarrinho,
};
