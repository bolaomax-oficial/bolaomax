/**
 * Financeiro Service
 * 
 * Serviço para gerenciar dados financeiros via API
 * Todas as requisições incluem o token de autenticação JWT
 */

// Types
export interface FundoRegistro {
  saldoDisponivel: number;
  saldoBloqueado: number;
  saldoTotal: number;
  limiteMinimo: number;
  limiteIdeal: number;
  percentualUso: number;
  status: 'ok' | 'alerta' | 'critico';
  totalUtilizado: number;
  totalReposto: number;
}

export interface DashboardUsuarios {
  total: number;
  saldoTotal: number;
}

export interface TransacoesHoje {
  quantidade: number;
  valor: number;
}

export interface SaquesPendentes {
  quantidade: number;
  valor: number;
}

export interface FinanceiroDashboard {
  fundo: FundoRegistro;
  usuarios: DashboardUsuarios;
  transacoesHoje: TransacoesHoje;
  saquesPendentes: SaquesPendentes;
}

export interface DashboardResponse {
  success: boolean;
  fundo?: FundoRegistro;
  usuarios?: DashboardUsuarios;
  transacoesHoje?: TransacoesHoje;
  saquesPendentes?: SaquesPendentes;
  error?: string;
  code?: string;
}

export interface SaquePendente {
  id: string;
  userId: string;
  valorSolicitado: number;
  valorLiquido: number;
  tipoConta: string;
  chavePix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  dataSolicitacao: string;
  // Extra fields for UI
  cliente?: string;
  clienteAvatar?: string;
  clienteEmail?: string;
  status?: string;
}

export interface SaquesPendentesResponse {
  success: boolean;
  saques: SaquePendente[];
  error?: string;
  code?: string;
}

export interface AprovarSaqueResponse {
  success: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export interface AportarFundoResponse {
  success: boolean;
  message?: string;
  novoSaldo?: number;
  error?: string;
  code?: string;
}

export interface ReconciliarResponse {
  success: boolean;
  discrepancias?: number;
  ajustes?: number;
  error?: string;
  code?: string;
}

// Token key (must match AuthContext)
const TOKEN_KEY = "bolaomax_token";

// Get base URL (works both client and server side)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

// Get stored token from localStorage
const getStoredToken = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

// Get headers with authentication
const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Busca o dashboard financeiro completo
 * GET /api/financeiro/admin/dashboard
 */
export const buscarDashboard = async (): Promise<DashboardResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/dashboard`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    // Handle authentication errors
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      console.error('[FinanceiroService] Erro de autenticação:', data.error);
    }
    
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao buscar dashboard:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar dashboard',
    };
  }
};

/**
 * Busca saques pendentes de aprovação
 * GET /api/financeiro/admin/saques-pendentes
 */
export const buscarSaquesPendentes = async (): Promise<SaquesPendentesResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/saques-pendentes`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao buscar saques pendentes:', error);
    return {
      success: false,
      saques: [],
      error: error.message || 'Erro ao buscar saques pendentes',
    };
  }
};

/**
 * Aprova um saque pendente
 * POST /api/financeiro/admin/saque/:id/aprovar
 */
export const aprovarSaque = async (id: string): Promise<AprovarSaqueResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/saque/${id}/aprovar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao aprovar saque:', error);
    return {
      success: false,
      error: error.message || 'Erro ao aprovar saque',
    };
  }
};

/**
 * Recusa um saque pendente
 * POST /api/financeiro/admin/saque/:id/recusar
 */
export const recusarSaque = async (id: string, motivo: string): Promise<AprovarSaqueResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/saque/${id}/recusar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivo }),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao recusar saque:', error);
    return {
      success: false,
      error: error.message || 'Erro ao recusar saque',
    };
  }
};

/**
 * Aporta capital no fundo de registro
 * POST /api/financeiro/admin/fundo/aportar
 */
export const aportarFundo = async (valor: number): Promise<AportarFundoResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/fundo/aportar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ valor }),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao aportar no fundo:', error);
    return {
      success: false,
      error: error.message || 'Erro ao aportar no fundo',
    };
  }
};

/**
 * Executa reconciliação financeira
 * POST /api/financeiro/admin/reconciliar
 */
export const reconciliarFinanceiro = async (): Promise<ReconciliarResponse> => {
  try {
    const url = `${getBaseUrl()}/api/financeiro/admin/reconciliar`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[FinanceiroService] Erro ao reconciliar:', error);
    return {
      success: false,
      error: error.message || 'Erro ao reconciliar',
    };
  }
};

// Helper functions for formatting
export const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getFundoStatusColor = (status: string): string => {
  switch (status) {
    case 'ok':
      return 'text-bolao-green';
    case 'alerta':
      return 'text-yellow-500';
    case 'critico':
      return 'text-red-400';
    default:
      return 'text-muted-foreground';
  }
};

export const getFundoStatusLabel = (status: string): string => {
  switch (status) {
    case 'ok':
      return 'Saudável';
    case 'alerta':
      return 'Atenção';
    case 'critico':
      return 'Crítico';
    default:
      return 'Desconhecido';
  }
};

export default {
  buscarDashboard,
  buscarSaquesPendentes,
  aprovarSaque,
  recusarSaque,
  aportarFundo,
  reconciliarFinanceiro,
  formatCurrency,
  getFundoStatusColor,
  getFundoStatusLabel,
};
