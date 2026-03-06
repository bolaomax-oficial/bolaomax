import { API_URL } from '@/lib/api';

const API_BASE = API_URL;

interface Configuracao {
  valor: string;
  tipo: string;
  descricao: string;
}

interface ConfiguracoesPorCategoria {
  [categoria: string]: {
    [chave: string]: Configuracao;
  };
}

interface ConfiguracaoUpdate {
  categoria: string;
  chave: string;
  valor: string | number | boolean;
}

interface LogConfiguracao {
  id: number;
  categoria: string;
  chave: string;
  valor_anterior: string;
  valor_novo: string;
  usuario_id: string;
  usuario_nome?: string;
  data_hora: string;
}

export const configuracoesService = {
  /**
   * Obter todas as configurações (agrupadas por categoria)
   */
  async obterTodas(): Promise<ConfiguracoesPorCategoria> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/configuracoes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar configurações');
    }

    const data = await response.json();
    return data.configuracoes || {};
  },

  /**
   * Obter configuração específica
   */
  async obter(categoria: string, chave: string): Promise<Configuracao> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/configuracoes/${categoria}/${chave}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar configuração');
    }

    const data = await response.json();
    return data.configuracao;
  },

  /**
   * Atualizar configuração única
   */
  async atualizar(categoria: string, chave: string, valor: string | number | boolean): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/configuracoes/${categoria}/${chave}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ valor })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar configuração');
    }
  },

  /**
   * Atualizar múltiplas configurações de uma vez
   */
  async atualizarEmLote(configuracoes: ConfiguracaoUpdate[]): Promise<{
    sucessos: ConfiguracaoUpdate[];
    erros?: Array<{ categoria: string; chave: string; erro: string }>;
  }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/configuracoes/batch`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ configuracoes })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar configurações');
    }

    const data = await response.json();
    return {
      sucessos: data.sucessos || [],
      erros: data.erros
    };
  },

  /**
   * Obter histórico de alterações
   */
  async obterHistorico(limit: number = 50): Promise<LogConfiguracao[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/admin/configuracoes/logs/historico?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar histórico');
    }

    const data = await response.json();
    return data.logs || [];
  },

  /**
   * Salvar configurações do localStorage (para configurações de UI que não vão pro backend)
   */
  salvarLocal(categoria: string, config: any): void {
    try {
      const key = `config_${categoria}`;
      localStorage.setItem(key, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configuração local:', error);
    }
  },

  /**
   * Carregar configurações do localStorage
   */
  carregarLocal(categoria: string): any | null {
    try {
      const key = `config_${categoria}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar configuração local:', error);
      return null;
    }
  },

  /**
   * Converter valor de string para o tipo apropriado
   */
  converterValor(valor: string, tipo: string): string | number | boolean {
    switch (tipo) {
      case 'number':
        return parseFloat(valor);
      case 'boolean':
        return valor === 'true' || valor === '1';
      case 'json':
        try {
          return JSON.parse(valor);
        } catch {
          return valor;
        }
      default:
        return valor;
    }
  }
};
