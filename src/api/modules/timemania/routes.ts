/**
 * ============================================================
 * ROTAS API - BOLÕES TIMEMANIA
 * ============================================================
 * 
 * Endpoints públicos e administrativos para bolões da Timemania.
 * ============================================================
 */

import { Hono } from 'hono';
import { TimemaniaBolaoService, inicializarDadosExemploTimemania } from './service';
import { ApostaTimemania } from './regras-modalidade';
import { StatusBolao } from './regras-comerciais';

// Dados de exemplo inicializados sob demanda
const timemaniaRoutes = new Hono();

// ============================================================
// ROTAS PÚBLICAS
// ============================================================

/**
 * GET /api/boloes/timemania
 * Lista bolões disponíveis da Timemania
 */
timemaniaRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',') as StatusBolao[] | undefined;
    const limite = parseInt(c.req.query('limite') || '20');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    // Por padrão, retorna apenas bolões ativos/encerrando
    const statusFiltro = status || ['active', 'closing'];
    
    const resultado = TimemaniaBolaoService.listarBoloes({
      status: statusFiltro,
      limite,
      pagina,
    });
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
      meta: {
        pagina,
        limite,
        total: resultado.dados?.length || 0,
      }
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/timemania/:id
 * Obtém detalhes de um bolão específico
 */
timemaniaRoutes.get('/:id', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = TimemaniaBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao obter bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/timemania/:id/apostas
 * Obtém apostas de um bolão
 */
timemaniaRoutes.get('/:id/apostas', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = TimemaniaBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: {
        apostas: resultado.dados?.apostasDetalhadas,
        quantidadeApostas: resultado.dados?.quantidadeApostas,
      },
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao obter apostas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/boloes/timemania/:id/comprar-cotas
 * Compra cotas de um bolão
 */
timemaniaRoutes.post('/:id/comprar-cotas', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    // Validar input
    if (!body.quantidadeCotas || body.quantidadeCotas < 1) {
      return c.json({ erro: 'Quantidade de cotas inválida' }, 400);
    }
    
    // TODO: Obter usuarioId do token de autenticação
    const usuarioId = body.usuarioId || 'guest';
    
    const resultado = TimemaniaBolaoService.comprarCotas({
      bolaoId: id,
      usuarioId,
      quantidadeCotas: body.quantidadeCotas,
      metodoPagamento: body.metodoPagamento || 'pix',
    });
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros, avisos: resultado.avisos }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
      avisos: resultado.avisos,
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao comprar cotas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/timemania/times-coracao
 * Lista times do coração disponíveis
 */
timemaniaRoutes.get('/config/times-coracao', (c) => {
  try {
    const times = TimemaniaBolaoService.obterTimesDoCoracao();
    
    return c.json({
      sucesso: true,
      dados: times,
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao obter times:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/timemania/regras
 * Obtém regras da modalidade e comerciais
 */
timemaniaRoutes.get('/config/regras', (c) => {
  try {
    return c.json({
      sucesso: true,
      dados: {
        modalidade: TimemaniaBolaoService.obterRegrasModalidade(),
        comercial: TimemaniaBolaoService.obterRegrasComerciais(),
      },
    });
  } catch (error) {
    console.error('[TIMEMANIA] Erro ao obter regras:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

// ============================================================
// ROTAS ADMIN (PROTEGIDAS)
// ============================================================

const timemaniaAdminRoutes = new Hono();

/**
 * POST /api/admin/boloes/timemania
 * Cria um novo bolão
 */
timemaniaAdminRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validar campos obrigatórios
    const camposObrigatorios = ['titulo', 'concurso', 'dataSorteio', 'horarioLimiteCompra', 'apostas', 'totalCotas'];
    const camposFaltando = camposObrigatorios.filter(campo => !body[campo]);
    
    if (camposFaltando.length > 0) {
      return c.json({ erro: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}` }, 400);
    }
    
    // Converter datas
    const dataSorteio = new Date(body.dataSorteio);
    const horarioLimiteCompra = new Date(body.horarioLimiteCompra);
    
    // TODO: Obter criadoPor do token de autenticação
    const criadoPor = body.criadoPor || 'admin';
    
    const resultado = TimemaniaBolaoService.criarBolao({
      titulo: body.titulo,
      descricao: body.descricao,
      concurso: body.concurso,
      dataSorteio,
      horarioLimiteCompra,
      apostas: body.apostas as ApostaTimemania[],
      totalCotas: body.totalCotas,
      taxaPercentual: body.taxaPercentual,
      politicaCotasNaoVendidas: body.politicaCotasNaoVendidas,
      cotaMinimaConfirmacao: body.cotaMinimaConfirmacao,
      estrategia: body.estrategia,
      criadoPor,
    });
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros, avisos: resultado.avisos }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
      avisos: resultado.avisos,
    }, 201);
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao criar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/timemania/preview
 * Pré-visualização de bolão (sem salvar)
 */
timemaniaAdminRoutes.post('/preview', async (c) => {
  try {
    const body = await c.req.json();
    
    const resultado = TimemaniaBolaoService.preVisualizarBolao({
      titulo: body.titulo || 'Preview',
      concurso: body.concurso || '0000',
      dataSorteio: new Date(body.dataSorteio || Date.now()),
      horarioLimiteCompra: new Date(body.horarioLimiteCompra || Date.now()),
      apostas: body.apostas as ApostaTimemania[] || [],
      totalCotas: body.totalCotas || 10,
      taxaPercentual: body.taxaPercentual,
      criadoPor: 'preview',
    });
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao gerar preview:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/timemania/:id/publicar
 * Publica um bolão
 */
timemaniaAdminRoutes.post('/:id/publicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter usuarioId do token
    const usuarioId = 'admin';
    
    const resultado = TimemaniaBolaoService.publicarBolao(id, usuarioId);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao publicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * PATCH /api/admin/boloes/timemania/:id/status
 * Altera status de um bolão manualmente
 */
timemaniaAdminRoutes.patch('/:id/status', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    if (!body.status) {
      return c.json({ erro: 'Status é obrigatório' }, 400);
    }
    
    // TODO: Obter usuarioId do token
    const usuarioId = 'admin';
    
    const resultado = TimemaniaBolaoService.alterarStatus(
      id, 
      body.status as StatusBolao, 
      usuarioId,
      body.motivo
    );
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao alterar status:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/timemania/:id/duplicar
 * Duplica um bolão existente
 */
timemaniaAdminRoutes.post('/:id/duplicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter criadoPor do token
    const criadoPor = 'admin';
    
    const resultado = TimemaniaBolaoService.duplicarBolao(id, criadoPor);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    }, 201);
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao duplicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/jobs/atualizar-status
 * Job para atualização automática de status
 */
timemaniaAdminRoutes.post('/jobs/atualizar-status', async (c) => {
  try {
    const resultado = TimemaniaBolaoService.atualizarStatusAutomatico();
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao atualizar status:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/timemania/:id/logs
 * Obtém logs de status de um bolão
 */
timemaniaAdminRoutes.get('/:id/logs', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = TimemaniaBolaoService.obterLogsStatus(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao obter logs:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/timemania
 * Lista todos os bolões (incluindo drafts)
 */
timemaniaAdminRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',') as StatusBolao[] | undefined;
    const limite = parseInt(c.req.query('limite') || '50');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    const resultado = TimemaniaBolaoService.listarBoloes({
      status, // Sem filtro = todos os status
      limite,
      pagina,
    });
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
      meta: {
        pagina,
        limite,
        total: resultado.dados?.length || 0,
      }
    });
  } catch (error) {
    console.error('[TIMEMANIA ADMIN] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

export { timemaniaRoutes, timemaniaAdminRoutes };
export default timemaniaRoutes;
