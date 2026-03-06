/**
 * Serviço de Bolões Especiais (Frontend)
 * 
 * Gerencia bolões especiais:
 * - Mega da Virada
 * - Quina de São João
 * - Lotofácil da Independência
 * - Dupla Sena de Páscoa
 * - Federal de Natal
 */

// ============================================================
// Types
// ============================================================

export interface BolaoEspecial {
  id: string;
  tipo_especial: 'mega_virada' | 'quina_sao_joao' | 'lotofacil_independencia' | 'dupla_pascoa' | 'federal_natal';
  nome: string;
  descricao: string;
  ano: number;
  tipo_loteria: string;
  concurso: string;
  numeros_dezenas: number[];
  quantidade_cotas: number;
  cotas_disponiveis: number;
  valor_cota: number;
  valor_total_bolao: number;
  data_inicio_vendas: string;
  data_fim_vendas: string;
  data_sorteio: string;
  status: 'aguardando' | 'aberto' | 'encerrado' | 'sorteado';
  visivel: boolean;
  premiado: boolean;
  valor_premio: number;
  metadados?: any;
  criado_em: string;
  // Campos da view detalhada
  total_participantes?: number;
  cotas_vendidas?: number;
  percentual_preenchimento?: number;
}

export interface TemplateEspecial {
  id: string;
  tipo_especial: string;
  nome_padrao: string;
  descricao_padrao: string;
  tipo_loteria: string;
  dias_antecedencia_vendas: number;
  dias_antecedencia_encerramento: number;
  horas_antecedencia_encerramento: number;
  icone: string;
  cor_tema: string;
}

export interface ConfigAutomacao {
  id: string;
  horario_ativacao_diaria: string;
  ativar_novos_boloes_automaticamente: boolean;
  encerrar_automaticamente: boolean;
  minutos_antecedencia_encerramento: number;
  ocultar_boloes_expirados: boolean;
  mostrar_apenas_data_vigente: boolean;
  notificar_encerramento: boolean;
  notificar_ativacao: boolean;
  status_sistema: 'ativo' | 'pausado' | 'manutencao';
  ultima_execucao_cron?: string;
  proxima_execucao_cron?: string;
}

export interface HistoricoAutomacao {
  id: string;
  tipo_acao: string;
  descricao: string;
  bolao_id?: string;
  bolao_tipo?: string;
  tipo_loteria?: string;
  status_anterior?: string;
  status_novo?: string;
  data_hora_execucao: string;
  executado_por: string;
  sucesso: boolean;
  mensagem_erro?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
// Bolões Especiais - CRUD
// ============================================================

/**
 * Listar bolões especiais visíveis (público)
 */
export const listarVisiveis = async (): Promise<BolaoEspecial[]> => {
  try {
    const response = await fetch("/api/boloes-especiais/visiveis", {
      method: "GET",
    });
    
    const data = await response.json();
    
    if (data.success && data.boloesEspeciais) {
      return data.boloesEspeciais;
    }
    
    return [];
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao listar visíveis:", error);
    return [];
  }
};

/**
 * Listar todos os bolões especiais (admin)
 */
export const listar = async (filtros?: {
  tipo_especial?: string;
  ano?: number;
  status?: string;
}): Promise<BolaoEspecial[]> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.tipo_especial) params.append('tipo_especial', filtros.tipo_especial);
    if (filtros?.ano) params.append('ano', filtros.ano.toString());
    if (filtros?.status) params.append('status', filtros.status);
    
    const url = `/api/boloes-especiais/admin/lista${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.boloesEspeciais) {
      return data.boloesEspeciais;
    }
    
    return [];
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao listar:", error);
    return [];
  }
};

/**
 * Buscar bolão especial por ID
 */
export const buscar = async (id: string): Promise<BolaoEspecial | null> => {
  try {
    const response = await fetch(`/api/boloes-especiais/${id}`, {
      method: "GET",
    });
    
    const data = await response.json();
    
    if (data.success && data.bolaoEspecial) {
      return data.bolaoEspecial;
    }
    
    return null;
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar:", error);
    return null;
  }
};

/**
 * Criar bolão especial
 */
export const criar = async (dados: Partial<BolaoEspecial>): Promise<ApiResponse<BolaoEspecial>> => {
  try {
    const response = await fetch("/api/boloes-especiais/admin/criar", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.bolaoEspecial,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao criar:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar bolão especial",
    };
  }
};

/**
 * Criar bolão a partir de template
 */
export const criarAPartirDeTemplate = async (
  tipoEspecial: string,
  dadosAdicionais: any
): Promise<ApiResponse<BolaoEspecial>> => {
  try {
    const response = await fetch("/api/boloes-especiais/admin/criar-template", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        tipo_especial: tipoEspecial,
        ...dadosAdicionais,
      }),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.bolaoEspecial,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao criar a partir de template:", error);
    return {
      success: false,
      error: error.message || "Erro ao criar bolão especial",
    };
  }
};

/**
 * Atualizar bolão especial
 */
export const atualizar = async (
  id: string,
  dados: Partial<BolaoEspecial>
): Promise<ApiResponse<BolaoEspecial>> => {
  try {
    const response = await fetch(`/api/boloes-especiais/admin/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(dados),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.bolaoEspecial,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao atualizar:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar bolão especial",
    };
  }
};

/**
 * Alterar status
 */
export const alterarStatus = async (
  id: string,
  novoStatus: string
): Promise<ApiResponse<BolaoEspecial>> => {
  try {
    const response = await fetch(`/api/boloes-especiais/admin/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: novoStatus }),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.bolaoEspecial,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao alterar status:", error);
    return {
      success: false,
      error: error.message || "Erro ao alterar status",
    };
  }
};

/**
 * Alterar visibilidade
 */
export const alterarVisibilidade = async (
  id: string,
  visivel: boolean
): Promise<ApiResponse<BolaoEspecial>> => {
  try {
    const response = await fetch(`/api/boloes-especiais/admin/${id}/visibilidade`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ visivel }),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.bolaoEspecial,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao alterar visibilidade:", error);
    return {
      success: false,
      error: error.message || "Erro ao alterar visibilidade",
    };
  }
};

/**
 * Excluir bolão especial
 */
export const excluir = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`/api/boloes-especiais/admin/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao excluir:", error);
    return {
      success: false,
      error: error.message || "Erro ao excluir bolão especial",
    };
  }
};

// ============================================================
// Templates
// ============================================================

/**
 * Buscar templates disponíveis
 */
export const buscarTemplates = async (): Promise<TemplateEspecial[]> => {
  try {
    const response = await fetch("/api/boloes-especiais/admin/templates/lista", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.templates) {
      return data.templates;
    }
    
    return [];
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar templates:", error);
    return [];
  }
};

// ============================================================
// Estatísticas
// ============================================================

/**
 * Buscar estatísticas
 */
export const buscarEstatisticas = async (): Promise<any[]> => {
  try {
    const response = await fetch("/api/boloes-especiais/admin/estatisticas/dados", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.estatisticas) {
      return data.estatisticas;
    }
    
    return [];
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar estatísticas:", error);
    return [];
  }
};

// ============================================================
// Automação
// ============================================================

/**
 * Buscar configurações de automação
 */
export const buscarConfigAutomacao = async (): Promise<ConfigAutomacao | null> => {
  try {
    const response = await fetch("/api/admin/automacao/configuracoes", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.configuracoes) {
      return data.configuracoes;
    }
    
    return null;
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar config:", error);
    return null;
  }
};

/**
 * Atualizar configurações de automação
 */
export const atualizarConfigAutomacao = async (
  config: Partial<ConfigAutomacao>
): Promise<ApiResponse<ConfigAutomacao>> => {
  try {
    const response = await fetch("/api/admin/automacao/configuracoes", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data.configuracoes,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao atualizar config:", error);
    return {
      success: false,
      error: error.message || "Erro ao atualizar configurações",
    };
  }
};

/**
 * Executar automação manualmente
 */
export const executarAutomacao = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch("/api/admin/automacao/executar-agora", {
      method: "POST",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    return {
      success: data.success,
      data: data,
      message: data.message,
      error: data.error,
    };
  } catch (error: any) {
    console.error("[BoloesEspeciaisService] Erro ao executar automação:", error);
    return {
      success: false,
      error: error.message || "Erro ao executar automação",
    };
  }
};

/**
 * Buscar histórico de automação
 */
export const buscarHistorico = async (filtros?: {
  tipo_acao?: string;
  limit?: number;
}): Promise<HistoricoAutomacao[]> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.tipo_acao) params.append('tipo_acao', filtros.tipo_acao);
    if (filtros?.limit) params.append('limit', filtros.limit.toString());
    
    const url = `/api/admin/automacao/historico${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.historico) {
      return data.historico;
    }
    
    return [];
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar histórico:", error);
    return [];
  }
};

/**
 * Buscar status do sistema
 */
export const buscarStatus = async (): Promise<any> => {
  try {
    const response = await fetch("/api/admin/automacao/status", {
      method: "GET",
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success && data.status) {
      return data.status;
    }
    
    return null;
  } catch (error) {
    console.error("[BoloesEspeciaisService] Erro ao buscar status:", error);
    return null;
  }
};

// ============================================================
// Helpers de Formatação
// ============================================================

export const getNomeTemplate = (tipo: string): string => {
  const nomes: Record<string, string> = {
    'mega_virada': '🎊 Mega da Virada',
    'quina_sao_joao': '🎉 Quina de São João',
    'lotofacil_independencia': '🇧🇷 Lotofácil da Independência',
    'dupla_pascoa': '🐰 Dupla Sena de Páscoa',
    'federal_natal': '🎄 Federal de Natal',
  };
  
  return nomes[tipo] || tipo;
};

export const getCorTemplate = (tipo: string): string => {
  const cores: Record<string, string> = {
    'mega_virada': '#02CF51',
    'quina_sao_joao': '#FFA200',
    'lotofacil_independencia': '#009739',
    'dupla_pascoa': '#FF69B4',
    'federal_natal': '#C41E3A',
  };
  
  return cores[tipo] || '#02CF51';
};

export default {
  listarVisiveis,
  listar,
  buscar,
  criar,
  criarAPartirDeTemplate,
  atualizar,
  alterarStatus,
  alterarVisibilidade,
  excluir,
  buscarTemplates,
  buscarEstatisticas,
  buscarConfigAutomacao,
  atualizarConfigAutomacao,
  executarAutomacao,
  buscarHistorico,
  buscarStatus,
  getNomeTemplate,
  getCorTemplate,
};
