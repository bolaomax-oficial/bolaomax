/**
 * Admin Bolão Service
 * 
 * Serviço para gerenciar bolões via API
 * Todas as requisições incluem o token de autenticação JWT
 */

// Types
export interface BolaoFromAPI {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  concurso: number | null;
  status: string;
  numerosDezenas: string;
  quantidadeCotas: number;
  cotasDisponiveis: number;
  valorCota: number;
  dataAbertura: string;
  dataFechamento: string;
  dataSorteio: string;
  premiado: boolean;
  valorPremio: number;
  faixaPremio: string | null;
  acertos: number | null;
  criadoPor: string;
  aprovado: boolean;
  aprovadoPor: string | null;
  visualizacoes: number;
  compartilhamentos: number;
  metadados: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateBolaoInput {
  nome: string;
  descricao?: string;
  tipo: string;
  concurso?: number;
  numerosDezenas?: number[];
  quantidadeCotas: number;
  valorCota: number;
  dataAbertura?: string;
  dataFechamento?: string;
  dataSorteio?: string;
}

export interface UpdateBolaoInput {
  nome?: string;
  descricao?: string;
  tipo?: string;
  concurso?: number;
  status?: string;
  numerosDezenas?: number[];
  quantidadeCotas?: number;
  cotasDisponiveis?: number;
  valorCota?: number;
  dataAbertura?: string;
  dataFechamento?: string;
  dataSorteio?: string;
  premiado?: boolean;
  valorPremio?: number;
}

export interface ListBoloesParams {
  status?: string;
  tipo?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListBoloesResponse {
  success: boolean;
  boloes: BolaoFromAPI[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  message?: string;
  code?: string;
}

export interface SingleBolaoResponse {
  success: boolean;
  bolao?: BolaoFromAPI;
  error?: string;
  message?: string;
  code?: string;
}

export interface MutateBolaoResponse {
  success: boolean;
  bolao?: BolaoFromAPI;
  message?: string;
  error?: string;
  code?: string;
}

export interface StatsResponse {
  success: boolean;
  stats?: {
    totalBoloes: number;
    boloesAbertos: number;
    boloesFechados: number;
    boloesEmAndamento: number;
    totalUsuarios: number;
  };
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
 * Lista todos os bolões com filtros opcionais
 */
export const listarBoloes = async (params: ListBoloesParams = {}): Promise<ListBoloesResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.tipo) searchParams.append('tipo', params.tipo);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    const url = `${getBaseUrl()}/api/admin/boloes${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    // Handle authentication errors
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      console.error('[AdminBolaoService] Erro de autenticação:', data.error);
    }
    
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao listar bolões:', error);
    return {
      success: false,
      boloes: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      error: error.message || 'Erro ao listar bolões',
    };
  }
};

/**
 * Busca um bolão específico por ID
 */
export const buscarBolao = async (id: string): Promise<SingleBolaoResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/boloes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao buscar bolão:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar bolão',
    };
  }
};

/**
 * Cria um novo bolão
 */
export const criarBolao = async (input: CreateBolaoInput): Promise<MutateBolaoResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/boloes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao criar bolão:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar bolão',
    };
  }
};

/**
 * Atualiza um bolão existente
 */
export const atualizarBolao = async (id: string, input: UpdateBolaoInput): Promise<MutateBolaoResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/boloes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao atualizar bolão:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar bolão',
    };
  }
};

/**
 * Exclui um bolão
 */
export const excluirBolao = async (id: string): Promise<MutateBolaoResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/boloes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao excluir bolão:', error);
    return {
      success: false,
      error: error.message || 'Erro ao excluir bolão',
    };
  }
};

/**
 * Busca estatísticas gerais
 */
export const buscarEstatisticas = async (): Promise<StatsResponse> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/admin/boloes/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[AdminBolaoService] Erro ao buscar estatísticas:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar estatísticas',
    };
  }
};

export default {
  listarBoloes,
  buscarBolao,
  criarBolao,
  atualizarBolao,
  excluirBolao,
  buscarEstatisticas,
};
