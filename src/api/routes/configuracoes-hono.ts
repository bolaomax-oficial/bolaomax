import { Hono } from 'hono';

const app = new Hono();

// Mock data (em produção viria do D1/SQLite)
const configuracoesMock: any = {
  geral: {
    nome_site: { valor: 'BolãoMax', tipo: 'text', descricao: 'Nome do site' },
    slogan: { valor: 'Sua sorte em grande estilo', tipo: 'text', descricao: 'Slogan do site' },
    email_contato: { valor: 'contato@bolaomax.com', tipo: 'email', descricao: 'Email de contato' },
    telefone_contato: { valor: '(11) 99999-9999', tipo: 'text', descricao: 'Telefone' },
    whatsapp_numero: { valor: '5511999999999', tipo: 'text', descricao: 'WhatsApp' },
  },
  aparencia: {
    cor_primaria: { valor: '#02CF51', tipo: 'color', descricao: 'Cor principal' },
    cor_secundaria: { valor: '#FFA200', tipo: 'color', descricao: 'Cor secundária' },
    tema_padrao: { valor: 'dark', tipo: 'text', descricao: 'Tema padrão' },
  },
  pagamentos: {
    pagar_me_ativo: { valor: 'true', tipo: 'boolean', descricao: 'Pagar.me ativo' },
    pix_ativo: { valor: 'true', tipo: 'boolean', descricao: 'PIX ativo' },
    cartao_credito_ativo: { valor: 'true', tipo: 'boolean', descricao: 'Cartão ativo' },
    valor_minimo_deposito: { valor: '10', tipo: 'number', descricao: 'Valor mínimo depósito' },
  },
  integracoes: {
    thelotter_ativo: { valor: 'false', tipo: 'boolean', descricao: 'TheLotter ativo' },
    smtp_ativo: { valor: 'true', tipo: 'boolean', descricao: 'SMTP ativo' },
    sms_ativo: { valor: 'false', tipo: 'boolean', descricao: 'SMS ativo' },
  },
  seguranca: {
    two_factor_obrigatorio: { valor: 'false', tipo: 'boolean', descricao: '2FA obrigatório' },
    senha_min_caracteres: { valor: '8', tipo: 'number', descricao: 'Mínimo de caracteres' },
  },
};

// GET /api/admin/configuracoes - Obter todas
app.get('/', (c) => {
  return c.json({
    success: true,
    configuracoes: configuracoesMock
  });
});

// GET /api/admin/configuracoes/:categoria/:chave - Obter específica
app.get('/:categoria/:chave', (c) => {
  const categoria = c.req.param('categoria');
  const chave = c.req.param('chave');
  
  if (!configuracoesMock[categoria] || !configuracoesMock[categoria][chave]) {
    return c.json({ 
      success: false, 
      error: 'Configuração não encontrada' 
    }, 404);
  }
  
  return c.json({
    success: true,
    configuracao: configuracoesMock[categoria][chave]
  });
});

// PUT /api/admin/configuracoes/:categoria/:chave - Atualizar uma
app.put('/:categoria/:chave', async (c) => {
  const categoria = c.req.param('categoria');
  const chave = c.req.param('chave');
  const { valor } = await c.req.json();
  
  if (!configuracoesMock[categoria] || !configuracoesMock[categoria][chave]) {
    return c.json({ 
      success: false, 
      error: 'Configuração não encontrada' 
    }, 404);
  }
  
  // Atualizar valor
  configuracoesMock[categoria][chave].valor = String(valor);
  
  return c.json({
    success: true,
    message: 'Configuração atualizada com sucesso'
  });
});

// PUT /api/admin/configuracoes/batch - Atualizar múltiplas
app.put('/batch', async (c) => {
  const { configuracoes } = await c.req.json();
  
  const sucessos: any[] = [];
  const erros: any[] = [];
  
  for (const config of configuracoes) {
    const { categoria, chave, valor } = config;
    
    if (configuracoesMock[categoria] && configuracoesMock[categoria][chave]) {
      configuracoesMock[categoria][chave].valor = String(valor);
      sucessos.push({ categoria, chave });
    } else {
      erros.push({ categoria, chave, erro: 'Não encontrada' });
    }
  }
  
  return c.json({
    success: true,
    message: `${sucessos.length} configurações atualizadas`,
    sucessos,
    erros: erros.length > 0 ? erros : undefined
  });
});

// GET /api/admin/configuracoes/logs/historico - Histórico
app.get('/logs/historico', (c) => {
  const logs = [
    {
      id: 1,
      categoria: 'geral',
      chave: 'nome_site',
      valor_anterior: 'BolãoMax',
      valor_novo: 'BolãoMax Pro',
      usuario_id: 'user-admin-001',
      usuario_nome: 'Administrador',
      data_hora: new Date().toISOString()
    }
  ];
  
  return c.json({
    success: true,
    logs
  });
});

export default app;
