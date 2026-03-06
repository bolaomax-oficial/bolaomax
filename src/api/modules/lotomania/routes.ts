/**
 * ============================================================
 * ROTAS API - BOLÕES LOTOMANIA
 * ============================================================
 * 
 * Endpoints públicos e administrativos para bolões da Lotomania.
 * ============================================================
 */

import { Hono } from 'hono';
import { LotomaniaBolaoService, inicializarDadosExemploLotomania } from './service';
import { STATUS_BOLAO } from './regras-comerciais';
import { ModoEstrategia } from './regras-estrategia';

// Dados de exemplo inicializados sob demanda
const lotomaniaRoutes = new Hono();

// ============================================================
// ROTAS PÚBLICAS
// ============================================================

/**
 * GET /api/boloes/lotomania
 * Lista bolões disponíveis da Lotomania
 */
lotomaniaRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',');
    const limite = parseInt(c.req.query('limite') || '20');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    // Por padrão, retorna apenas bolões ativos/encerrando
    const statusFiltro = status || ['ativo', 'encerrando', 'publicado'];
    
    const resultado = LotomaniaBolaoService.listarBoloes({
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
    console.error('[LOTOMANIA] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/lotomania/:id
 * Obtém detalhes de um bolão específico
 */
lotomaniaRoutes.get('/:id', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = LotomaniaBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[LOTOMANIA] Erro ao obter bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/lotomania/:id/apostas
 * Obtém apostas de um bolão
 */
lotomaniaRoutes.get('/:id/apostas', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = LotomaniaBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: {
        apostas: resultado.dados?.apostas,
        pool: resultado.dados?.pool,
        quantidadeApostas: resultado.dados?.quantidadeApostas,
        quantidadeApostasEspelho: resultado.dados?.quantidadeApostasEspelho,
      },
    });
  } catch (error) {
    console.error('[LOTOMANIA] Erro ao obter apostas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/boloes/lotomania/:id/comprar-cotas
 * Compra cotas de um bolão
 */
lotomaniaRoutes.post('/:id/comprar-cotas', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    // Validar input
    if (!body.quantidadeCotas || body.quantidadeCotas < 1) {
      return c.json({ erro: 'Quantidade de cotas inválida' }, 400);
    }
    
    // TODO: Obter usuarioId do token de autenticação
    const usuarioId = body.usuarioId || 'guest';
    
    const resultado = LotomaniaBolaoService.comprarCotas({
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
    console.error('[LOTOMANIA] Erro ao comprar cotas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/lotomania/config/regras
 * Obtém regras da modalidade e comerciais
 */
lotomaniaRoutes.get('/config/regras', (c) => {
  try {
    return c.json({
      sucesso: true,
      dados: {
        modalidade: LotomaniaBolaoService.obterRegrasModalidade(),
        comercial: LotomaniaBolaoService.obterRegrasComerciais(),
      },
    });
  } catch (error) {
    console.error('[LOTOMANIA] Erro ao obter regras:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

// ============================================================
// ROTAS ADMIN (PROTEGIDAS)
// ============================================================

const lotomaniaAdminRoutes = new Hono();

/**
 * POST /api/admin/boloes/lotomania
 * Cria um novo bolão
 */
lotomaniaAdminRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validar campos obrigatórios
    const camposObrigatorios = ['titulo', 'concurso', 'dataSorteio', 'quantidadeApostas', 'totalCotas'];
    const camposFaltando = camposObrigatorios.filter(campo => body[campo] === undefined);
    
    if (camposFaltando.length > 0) {
      return c.json({ erro: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}` }, 400);
    }
    
    // Converter data
    const dataSorteio = new Date(body.dataSorteio);
    
    // TODO: Obter criadoPor do token de autenticação
    const criadoPor = body.criadoPor || 'admin';
    
    const resultado = LotomaniaBolaoService.criarBolao({
      titulo: body.titulo,
      descricao: body.descricao,
      concurso: body.concurso,
      dataSorteio,
      modo: body.modo as ModoEstrategia,
      quantidadeApostas: body.quantidadeApostas,
      poolPersonalizado: body.poolPersonalizado,
      incluirEspelhos: body.incluirEspelhos,
      teimosinha: body.teimosinha,
      totalCotas: body.totalCotas,
      taxaPercentual: body.taxaPercentual,
      politicaCotasNaoVendidas: body.politicaCotasNaoVendidas,
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
    console.error('[LOTOMANIA ADMIN] Erro ao criar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/lotomania/preview
 * Pré-visualização de bolão (sem salvar)
 */
lotomaniaAdminRoutes.post('/preview', async (c) => {
  try {
    const body = await c.req.json();
    
    const resultado = LotomaniaBolaoService.preVisualizarBolao({
      titulo: body.titulo || 'Preview',
      concurso: body.concurso || '0000',
      dataSorteio: new Date(body.dataSorteio || Date.now()),
      modo: body.modo as ModoEstrategia,
      quantidadeApostas: body.quantidadeApostas || 5,
      poolPersonalizado: body.poolPersonalizado,
      incluirEspelhos: body.incluirEspelhos,
      teimosinha: body.teimosinha,
      totalCotas: body.totalCotas || 50,
      criadoPor: 'preview',
    });
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[LOTOMANIA ADMIN] Erro ao gerar preview:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/lotomania/:id/publicar
 * Publica um bolão
 */
lotomaniaAdminRoutes.post('/:id/publicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter usuarioId do token
    const usuarioId = 'admin';
    
    const resultado = LotomaniaBolaoService.publicarBolao(id, usuarioId);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[LOTOMANIA ADMIN] Erro ao publicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * PATCH /api/admin/boloes/lotomania/:id/status
 * Altera status de um bolão manualmente
 */
lotomaniaAdminRoutes.patch('/:id/status', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    if (!body.status) {
      return c.json({ erro: 'Status é obrigatório' }, 400);
    }
    
    // Validar status
    if (!STATUS_BOLAO[body.status as keyof typeof STATUS_BOLAO]) {
      return c.json({ erro: 'Status inválido' }, 400);
    }
    
    // TODO: Obter usuarioId do token
    const usuarioId = 'admin';
    
    const resultado = LotomaniaBolaoService.alterarStatus(
      id, 
      body.status as keyof typeof STATUS_BOLAO, 
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
    console.error('[LOTOMANIA ADMIN] Erro ao alterar status:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/lotomania/:id/duplicar
 * Duplica um bolão existente
 */
lotomaniaAdminRoutes.post('/:id/duplicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter criadoPor do token
    const criadoPor = 'admin';
    
    const resultado = LotomaniaBolaoService.duplicarBolao(id, criadoPor);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    }, 201);
  } catch (error) {
    console.error('[LOTOMANIA ADMIN] Erro ao duplicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/lotomania/:id/logs
 * Obtém logs de status de um bolão
 */
lotomaniaAdminRoutes.get('/:id/logs', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = LotomaniaBolaoService.obterLogsStatus(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[LOTOMANIA ADMIN] Erro ao obter logs:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/lotomania
 * Lista todos os bolões (incluindo rascunhos)
 */
lotomaniaAdminRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',');
    const limite = parseInt(c.req.query('limite') || '50');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    const resultado = LotomaniaBolaoService.listarBoloes({
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
    console.error('[LOTOMANIA ADMIN] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

export { lotomaniaRoutes, lotomaniaAdminRoutes };
export default lotomaniaRoutes;
