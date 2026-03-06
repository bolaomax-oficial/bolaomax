/**
 * Serviço para gerenciar bolões via API Admin
 * Conecta a UI do admin com o backend real (SQLite/PostgreSQL)
 * 
 * IMPORTANTE: Usa o token JWT armazenado em localStorage
 */

// Token key (deve corresponder ao AuthContext)
const TOKEN_KEY = "bolaomax_token";

// Helper para obter o token
const getAuthToken = (): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  } catch {
    return null;
  }
};

// Helper para obter headers com autenticação
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export interface BolaoAPI {
  id: string;
  nome: string;
  tipo: string;
  numerosDezenas: string; // JSON array como string
  quantidadeCotas: number;
  cotasDisponiveis: number;
  valorCota: number;
  dataAbertura: string; // ISO date string
  dataFechamento?: string;
  dataSorteio?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BolaoUI {
  id: string;
  codigoBolao: string;
  numeroConcurso: string;
  name: string;
  type: string;
  dezenas: number;
  valorTotal: string;
  disponivel: number;
  dataSorteio: string;
  status: string;
}

export interface CreateBolaoDTO {
  nome: string;
  tipo: string;
  numerosDezenas: number[];
  quantidadeCotas: number;
  valorCota: number;
  dataAbertura: string;
  dataFechamento?: string;
  dataSorteio?: string;
}

export interface UpdateBolaoDTO extends Partial<CreateBolaoDTO> {
  cotasDisponiveis?: number;
  status?: string;
}

/**
 * Converte dados do backend para formato da UI
 */
export function formatarBolaoDoBackend(bolaoAPI: BolaoAPI): BolaoUI {
  const dezenas = JSON.parse(bolaoAPI.numerosDezenas || "[]");
  const valorTotal = bolaoAPI.quantidadeCotas * bolaoAPI.valorCota;
  
  return {
    id: bolaoAPI.id,
    codigoBolao: `BOL-${bolaoAPI.id.slice(0, 4).toUpperCase()}`,
    numeroConcurso: bolaoAPI.id.slice(0, 4),
    name: bolaoAPI.nome,
    type: bolaoAPI.tipo,
    dezenas: dezenas.length,
    valorTotal: `R$ ${valorTotal.toFixed(2).replace('.', ',')}`,
    disponivel: bolaoAPI.cotasDisponiveis,
    dataSorteio: formatarData(bolaoAPI.dataSorteio || bolaoAPI.dataAbertura),
    status: bolaoAPI.status || 'ativo'
  };
}

/**
 * Converte dados da UI para formato do backend
 */
export function formatarBolaoParaBackend(bolaoUI: any): CreateBolaoDTO {
  return {
    nome: bolaoUI.name,
    tipo: bolaoUI.type,
    numerosDezenas: bolaoUI.numerosDezenas || [],
    quantidadeCotas: bolaoUI.quantidadeCotas || 100,
    valorCota: bolaoUI.valorCota || 25,
    dataAbertura: new Date().toISOString(),
    dataSorteio: bolaoUI.dataSorteio
  };
}

/**
 * Formata data ISO para formato brasileiro
 */
function formatarData(dataISO: string): string {
  if (!dataISO) return 'A definir';
  
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
}

/**
 * Lista todos os bolões
 */
export async function listarBoloes(): Promise<BolaoUI[]> {
  try {
    const response = await fetch('/api/admin/boloes', {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao listar bolões: ${response.status}`);
    }

    const data = await response.json();
    const boloes: BolaoAPI[] = data.boloes || data;
    
    return boloes.map(formatarBolaoDoBackend);
  } catch (error) {
    console.error('Erro ao listar bolões:', error);
    throw error;
  }
}

/**
 * Busca bolão por ID
 */
export async function buscarBolaoPorId(id: string): Promise<BolaoUI> {
  try {
    const response = await fetch(`/api/admin/boloes/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao buscar bolão: ${response.status}`);
    }

    const bolaoAPI: BolaoAPI = await response.json();
    return formatarBolaoDoBackend(bolaoAPI);
  } catch (error) {
    console.error('Erro ao buscar bolão:', error);
    throw error;
  }
}

/**
 * Cria novo bolão
 */
export async function criarBolao(bolao: CreateBolaoDTO): Promise<BolaoUI> {
  try {
    const response = await fetch('/api/admin/boloes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bolao)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao criar bolão: ${response.status}`);
    }

    const bolaoAPI: BolaoAPI = await response.json();
    return formatarBolaoDoBackend(bolaoAPI);
  } catch (error) {
    console.error('Erro ao criar bolão:', error);
    throw error;
  }
}

/**
 * Atualiza bolão existente
 */
export async function atualizarBolao(id: string, dados: UpdateBolaoDTO): Promise<BolaoUI> {
  try {
    const response = await fetch(`/api/admin/boloes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dados)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao atualizar bolão: ${response.status}`);
    }

    const bolaoAPI: BolaoAPI = await response.json();
    return formatarBolaoDoBackend(bolaoAPI);
  } catch (error) {
    console.error('Erro ao atualizar bolão:', error);
    throw error;
  }
}

/**
 * Exclui bolão
 */
export async function excluirBolao(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/admin/boloes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao excluir bolão: ${response.status}`);
    }
  } catch (error) {
    console.error('Erro ao excluir bolão:', error);
    throw error;
  }
}

/**
 * Busca estatísticas do admin
 */
export async function buscarEstatisticas() {
  try {
    const response = await fetch('/api/admin/boloes/stats/summary', {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || `Erro ao buscar estatísticas: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}
