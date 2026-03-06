/**
 * Carteira Service (Frontend)
 * Funções para interagir com a API de carteira do usuário
 */

// ============================================================
// Types
// ============================================================

export interface RecargaResponse {
  success: boolean;
  message?: string;
  recargaId?: string;
  transacaoId?: string;
  novoSaldo?: number;
  pix?: PixPaymentData;
  boleto?: BoletoPaymentData;
  error?: string;
  code?: string;
}

export interface PixPaymentData {
  qrCode: string;
  qrCodeBase64: string;
  copiaCola: string;
  transacaoId: string;
  expiraEm: string;
}

export interface BoletoPaymentData {
  url: string;
  codigoBarras: string;
  transacaoId: string;
  vencimento: string;
}

export interface HistoricoRecarga {
  id: string;
  valor: number;
  formaPagamento: 'pix' | 'cartao' | 'boleto';
  status: 'pendente' | 'aprovado' | 'recusado' | 'expirado';
  dataCriacao: string;
  dataConfirmacao: string | null;
}

export interface HistoricoResponse {
  success: boolean;
  recargas: HistoricoRecarga[];
  error?: string;
  code?: string;
}

export interface SaldoResponse {
  success: boolean;
  saldo: number;
  error?: string;
  code?: string;
}

export interface DadosPagamentoCartao {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
}

// ============================================================
// Helpers
// ============================================================

// Helper to get auth token
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("bolaomax_token");
  } catch {
    return null;
  }
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

// ============================================================
// API Functions
// ============================================================

/**
 * Buscar saldo atual da carteira
 */
export const buscarSaldo = async (): Promise<SaldoResponse> => {
  try {
    const response = await fetch("/api/carteira/saldo", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carteiraService] Erro ao buscar saldo:", error);
    return {
      success: false,
      saldo: 0,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Recarregar carteira
 * @param valor - Valor da recarga em reais
 * @param formaPagamento - Forma de pagamento (pix, cartao, boleto)
 * @param dadosPagamento - Dados do cartão (opcional, apenas para cartão)
 */
export const recarregar = async (
  valor: number,
  formaPagamento: 'pix' | 'cartao' | 'boleto',
  dadosPagamento?: DadosPagamentoCartao
): Promise<RecargaResponse> => {
  try {
    const payload: Record<string, unknown> = {
      valor,
      formaPagamento,
    };

    // Add card data if provided
    if (formaPagamento === 'cartao' && dadosPagamento) {
      payload.dadosPagamento = {
        numero: dadosPagamento.numero.replace(/\s/g, ""),
        nome: dadosPagamento.nome,
        validade: dadosPagamento.validade,
        cvv: dadosPagamento.cvv,
      };
    }

    const response = await fetch("/api/carteira/recarregar", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carteiraService] Erro ao recarregar:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Buscar histórico de recargas
 */
export const buscarHistoricoRecargas = async (): Promise<HistoricoResponse> => {
  try {
    const response = await fetch("/api/carteira/historico", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carteiraService] Erro ao buscar histórico:", error);
    return {
      success: false,
      recargas: [],
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Confirmar pagamento de uma recarga (para PIX/Boleto)
 * @param recargaId - ID da recarga a confirmar
 */
export const confirmarRecarga = async (recargaId: string): Promise<RecargaResponse> => {
  try {
    const response = await fetch(`/api/carteira/confirmar/${recargaId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[carteiraService] Erro ao confirmar recarga:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

// Default export with all functions
const carteiraService = {
  buscarSaldo,
  recarregar,
  buscarHistoricoRecargas,
  confirmarRecarga,
};

export default carteiraService;
