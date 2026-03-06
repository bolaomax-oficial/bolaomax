/**
 * ============================================================
 * ROTAS API - BOLÕES DIA DE SORTE
 * ============================================================
 * 
 * Endpoints públicos e administrativos para bolões do Dia de Sorte.
 * ============================================================
 */

import { Hono } from 'hono';
import { DiaDeSorteBolaoService, inicializarDadosExemploDiaDeSorte } from './service';
import { STATUS_BOLAO } from './regras-comerciais';
import { ModoEstrategia } from './regras-estrategia';

// Dados de exemplo inicializados sob demanda
const diaDeSorteRoutes = new Hono();

// ============================================================
// ROTAS PÚBLICAS
// ============================================================

/**
 * GET /api/boloes/dia-de-sorte
 * Lista bolões disponíveis do Dia de Sorte
 */
diaDeSorteRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',');
    const limite = parseInt(c.req.query('limite') || '20');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    // Por padrão, retorna apenas bolões ativos/encerrando
    const statusFiltro = status || ['ativo', 'encerrando', 'publicado'];
    
    const resultado = DiaDeSorteBolaoService.listarBoloes({
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
    console.error('[DIA DE SORTE] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/dia-de-sorte/:id
 * Obtém detalhes de um bolão específico
 */
diaDeSorteRoutes.get('/:id', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = DiaDeSorteBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[DIA DE SORTE] Erro ao obter bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/dia-de-sorte/:id/apostas
 * Obtém apostas de um bolão
 */
diaDeSorteRoutes.get('/:id/apostas', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = DiaDeSorteBolaoService.obterBolao(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: {
        apostas: resultado.dados?.apostas,
        quantidadeApostas: resultado.dados?.quantidadeApostas,
        quantidadeNumerosPorAposta: resultado.dados?.quantidadeNumerosPorAposta,
        mesDaSorteId: resultado.dados?.mesDaSorteId,
        mesDaSorteNome: resultado.dados?.mesDaSorteNome,
        distribuicaoMeses: resultado.dados?.distribuicaoMeses,
      },
    });
  } catch (error) {
    console.error('[DIA DE SORTE] Erro ao obter apostas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/boloes/dia-de-sorte/:id/comprar-cotas
 * Compra cotas de um bolão
 */
diaDeSorteRoutes.post('/:id/comprar-cotas', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    // Validar input
    if (!body.quantidadeCotas || body.quantidadeCotas < 1) {
      return c.json({ erro: 'Quantidade de cotas inválida' }, 400);
    }
    
    // TODO: Obter usuarioId do token de autenticação
    const usuarioId = body.usuarioId || 'guest';
    
    const resultado = DiaDeSorteBolaoService.comprarCotas({
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
    console.error('[DIA DE SORTE] Erro ao comprar cotas:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/boloes/dia-de-sorte/config/regras
 * Obtém regras da modalidade e comerciais
 */
diaDeSorteRoutes.get('/config/regras', (c) => {
  try {
    return c.json({
      sucesso: true,
      dados: {
        modalidade: DiaDeSorteBolaoService.obterRegrasModalidade(),
        comercial: DiaDeSorteBolaoService.obterRegrasComerciais(),
        meses: DiaDeSorteBolaoService.obterMesesDaSorte(),
      },
    });
  } catch (error) {
    console.error('[DIA DE SORTE] Erro ao obter regras:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

// ============================================================
// ROTAS ADMIN (PROTEGIDAS)
// ============================================================

const diaDeSorteAdminRoutes = new Hono();

/**
 * POST /api/admin/boloes/dia-de-sorte
 * Cria um novo bolão
 */
diaDeSorteAdminRoutes.post('/', async (c) => {
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
    
    const resultado = DiaDeSorteBolaoService.criarBolao({
      titulo: body.titulo,
      descricao: body.descricao,
      concurso: body.concurso,
      dataSorteio,
      modo: body.modo as ModoEstrategia,
      quantidadeApostas: body.quantidadeApostas,
      numerosPorAposta: body.numerosPorAposta,
      mesDaSorteFavorito: body.mesDaSorteFavorito,
      distribuirMeses: body.distribuirMeses,
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
    console.error('[DIA DE SORTE ADMIN] Erro ao criar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/dia-de-sorte/preview
 * Pré-visualização de bolão (sem salvar)
 */
diaDeSorteAdminRoutes.post('/preview', async (c) => {
  try {
    const body = await c.req.json();
    
    const resultado = DiaDeSorteBolaoService.preVisualizarBolao({
      titulo: body.titulo || 'Preview',
      concurso: body.concurso || '0000',
      dataSorteio: new Date(body.dataSorteio || Date.now()),
      modo: body.modo as ModoEstrategia,
      quantidadeApostas: body.quantidadeApostas || 5,
      numerosPorAposta: body.numerosPorAposta || 7,
      mesDaSorteFavorito: body.mesDaSorteFavorito,
      distribuirMeses: body.distribuirMeses,
      teimosinha: body.teimosinha,
      totalCotas: body.totalCotas || 50,
      criadoPor: 'preview',
    });
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[DIA DE SORTE ADMIN] Erro ao gerar preview:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/dia-de-sorte/:id/publicar
 * Publica um bolão
 */
diaDeSorteAdminRoutes.post('/:id/publicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter usuarioId do token
    const usuarioId = 'admin';
    
    const resultado = DiaDeSorteBolaoService.publicarBolao(id, usuarioId);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[DIA DE SORTE ADMIN] Erro ao publicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * PATCH /api/admin/boloes/dia-de-sorte/:id/status
 * Altera status de um bolão manualmente
 */
diaDeSorteAdminRoutes.patch('/:id/status', async (c) => {
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
    
    const resultado = DiaDeSorteBolaoService.alterarStatus(
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
    console.error('[DIA DE SORTE ADMIN] Erro ao alterar status:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * POST /api/admin/boloes/dia-de-sorte/:id/duplicar
 * Duplica um bolão existente
 */
diaDeSorteAdminRoutes.post('/:id/duplicar', async (c) => {
  try {
    const { id } = c.req.param();
    
    // TODO: Obter criadoPor do token
    const criadoPor = 'admin';
    
    const resultado = DiaDeSorteBolaoService.duplicarBolao(id, criadoPor);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 400);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    }, 201);
  } catch (error) {
    console.error('[DIA DE SORTE ADMIN] Erro ao duplicar bolão:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/dia-de-sorte/:id/logs
 * Obtém logs de status de um bolão
 */
diaDeSorteAdminRoutes.get('/:id/logs', (c) => {
  try {
    const { id } = c.req.param();
    
    const resultado = DiaDeSorteBolaoService.obterLogsStatus(id);
    
    if (!resultado.sucesso) {
      return c.json({ erro: resultado.erros }, 404);
    }
    
    return c.json({
      sucesso: true,
      dados: resultado.dados,
    });
  } catch (error) {
    console.error('[DIA DE SORTE ADMIN] Erro ao obter logs:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

/**
 * GET /api/admin/boloes/dia-de-sorte
 * Lista todos os bolões (incluindo rascunhos)
 */
diaDeSorteAdminRoutes.get('/', (c) => {
  try {
    const status = c.req.query('status')?.split(',');
    const limite = parseInt(c.req.query('limite') || '50');
    const pagina = parseInt(c.req.query('pagina') || '1');
    
    const resultado = DiaDeSorteBolaoService.listarBoloes({
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
    console.error('[DIA DE SORTE ADMIN] Erro ao listar bolões:', error);
    return c.json({ erro: 'Erro interno do servidor' }, 500);
  }
});

export { diaDeSorteRoutes, diaDeSorteAdminRoutes };
export default diaDeSorteRoutes;
