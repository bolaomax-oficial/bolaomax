import { API_URL } from "@/lib/api";

/**
 * Sub-Usuários Service (Frontend)
 * Funções para gerenciar sub-usuários e permissões
 */

// ============================================================
// Types
// ============================================================

export interface SubUsuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  telefone?: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  criado_em: string;
  atualizado_em?: string;
  permissoes: {
    [modulo: string]: string[];
  };
}

export interface Permissao {
  modulo: string;
  permissao: string;
}

export interface RoleTemplate {
  id: string;
  nome: string;
  descricao: string;
  permissoes: Permissao[];
}

export interface SubUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  cargo: string;
  telefone?: string;
  permissoes: Permissao[];
}

export interface SubUsuariosResponse {
  success: boolean;
  subUsuarios?: SubUsuario[];
  subUsuario?: SubUsuario;
  message?: string;
  error?: string;
  code?: string;
}

export interface RolesResponse {
  success: boolean;
  roles?: RoleTemplate[];
  error?: string;
  code?: string;
}

// Módulos e suas permissões
export const MODULOS = [
  {
    id: 'boloes',
    nome: 'Bolões',
    permissoes: ['visualizar', 'criar', 'editar', 'excluir']
  },
  {
    id: 'usuarios',
    nome: 'Usuários',
    permissoes: ['visualizar', 'editar']
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    permissoes: ['visualizar']
  },
  {
    id: 'saques',
    nome: 'Saques',
    permissoes: ['visualizar', 'aprovar']
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    permissoes: ['visualizar']
  },
  {
    id: 'suporte',
    nome: 'Suporte',
    permissoes: ['visualizar', 'criar', 'editar']
  },
  {
    id: 'whatsapp',
    nome: 'WhatsApp',
    permissoes: ['visualizar', 'enviar']
  }
];

// ============================================================
// Helpers
// ============================================================

const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem("bolaomax_token");
  } catch {
    return null;
  }
};

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
 * Listar todos os sub-usuários
 */
export const listar = async (): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao listar:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Buscar sub-usuário específico
 */
export const buscar = async (id: string): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao buscar:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Criar novo sub-usuário
 */
export const criar = async (dados: SubUsuarioInput): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao criar:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Atualizar dados do sub-usuário
 */
export const atualizar = async (
  id: string,
  dados: Partial<SubUsuarioInput>
): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao atualizar:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Atualizar permissões do sub-usuário
 */
export const atualizarPermissoes = async (
  id: string,
  permissoes: Permissao[]
): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/${id}/permissoes`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissoes }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao atualizar permissões:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Alterar status do sub-usuário
 */
export const alterarStatus = async (
  id: string,
  status: 'ativo' | 'inativo' | 'bloqueado'
): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao alterar status:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Excluir sub-usuário
 */
export const excluir = async (id: string): Promise<SubUsuariosResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao excluir:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

/**
 * Buscar templates de roles pré-definidas
 */
export const buscarRoles = async (): Promise<RolesResponse> => {
  try {
    const response = await fetch(`${API_URL}/admin/sub-usuarios/roles/templates`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[subUsuariosService] Erro ao buscar roles:", error);
    return {
      success: false,
      error: "Erro de conexão. Tente novamente.",
      code: "NETWORK_ERROR",
    };
  }
};

// Helper para converter permissões do formato da API para checkboxes
export const permissoesParaCheckboxes = (permissoes: { [modulo: string]: string[] }) => {
  const checkboxes: { [key: string]: boolean } = {};
  
  MODULOS.forEach(modulo => {
    modulo.permissoes.forEach(permissao => {
      const key = `${modulo.id}.${permissao}`;
      checkboxes[key] = permissoes[modulo.id]?.includes(permissao) || false;
    });
  });
  
  return checkboxes;
};

// Helper para converter checkboxes para formato da API
export const checkboxesParaPermissoes = (checkboxes: { [key: string]: boolean }): Permissao[] => {
  const permissoes: Permissao[] = [];
  
  Object.entries(checkboxes).forEach(([key, value]) => {
    if (value) {
      const [modulo, permissao] = key.split('.');
      permissoes.push({ modulo, permissao });
    }
  });
  
  return permissoes;
};

// Default export
const subUsuariosService = {
  listar,
  buscar,
  criar,
  atualizar,
  atualizarPermissoes,
  alterarStatus,
  excluir,
  buscarRoles,
  permissoesParaCheckboxes,
  checkboxesParaPermissoes,
};

export default subUsuariosService;
