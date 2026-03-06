/**
 * Serviço de Bolões Especiais
 * 
 * Gerencia bolões especiais como:
 * - Mega da Virada, Quina de São João, Lotofácil da Independência
 * - Dupla Sena de Páscoa, Loteria Federal de Natal
 */

import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================
// LISTAR
// ============================================================

/**
 * Listar todos os bolões especiais
 */
export const listarBoloesEspeciais = async (filtros = {}) => {
  try {
    const boloes = await db.all(sql`
      SELECT * FROM boloes_especiais 
      WHERE ativo = 1
      ORDER BY data_sorteio ASC
    `);

    return boloes;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao listar:', error);
    return [];
  }
};

/**
 * Listar bolões especiais visíveis (para frontend)
 */
export const listarBoloesEspeciaisVisiveis = async () => {
  try {
    const boloes = await db.all(sql`
      SELECT * FROM v_boloes_especiais_detalhados
      WHERE visivel = 1 
        AND status IN ('aguardando', 'aberto')
      ORDER BY data_sorteio ASC
    `);

    return boloes;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao listar visíveis:', error);
    return [];
  }
};

/**
 * Buscar bolão especial por ID
 */
export const buscarBolaoEspecialPorId = async (id) => {
  try {
    const boloes = await db.all(sql`
      SELECT * FROM v_boloes_especiais_detalhados
      WHERE id = ${id}
      LIMIT 1
    `);

    return boloes[0] || null;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao buscar:', error);
    return null;
  }
};

// ============================================================
// CRIAR
// ============================================================

/**
 * Criar novo bolão especial
 */
export const criarBolaoEspecial = async (dados, criadoPor) => {
  const id = crypto.randomUUID();
  
  const {
    tipo_especial,
    nome,
    descricao,
    ano,
    tipo_loteria,
    concurso,
    numeros_dezenas,
    quantidade_cotas,
    valor_cota,
    data_inicio_vendas,
    data_fim_vendas,
    data_sorteio,
    status,
    visivel,
    metadados,
  } = dados;

  // Calcular valor total
  const valor_total_bolao = quantidade_cotas * valor_cota;
  const cotas_disponiveis = quantidade_cotas;

  try {
    await db.run(sql`
      INSERT INTO boloes_especiais (
        id,
        tipo_especial,
        nome,
        descricao,
        ano,
        tipo_loteria,
        concurso,
        numeros_dezenas,
        quantidade_cotas,
        cotas_disponiveis,
        valor_cota,
        valor_total_bolao,
        data_inicio_vendas,
        data_fim_vendas,
        data_sorteio,
        status,
        visivel,
        metadados,
        criado_por
      ) VALUES (
        ${id},
        ${tipo_especial},
        ${nome},
        ${descricao || null},
        ${ano},
        ${tipo_loteria},
        ${concurso || null},
        ${JSON.stringify(numeros_dezenas)},
        ${quantidade_cotas},
        ${cotas_disponiveis},
        ${valor_cota},
        ${valor_total_bolao},
        ${data_inicio_vendas},
        ${data_fim_vendas},
        ${data_sorteio},
        ${status || 'aguardando'},
        ${visivel ? 1 : 0},
        ${metadados ? JSON.stringify(metadados) : null},
        ${criadoPor}
      )
    `);

    return await buscarBolaoEspecialPorId(id);

  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao criar:', error);
    throw error;
  }
};

// ============================================================
// ATUALIZAR
// ============================================================

/**
 * Atualizar bolão especial
 */
export const atualizarBolaoEspecial = async (id, dados) => {
  try {
    // Simplificado: atualizar campos principais
    const {
      nome,
      descricao,
      concurso,
      data_inicio_vendas,
      data_fim_vendas,
      data_sorteio,
      status,
      visivel,
    } = dados;

    await db.run(sql`
      UPDATE boloes_especiais 
      SET 
        nome = COALESCE(${nome || null}, nome),
        descricao = COALESCE(${descricao || null}, descricao),
        concurso = COALESCE(${concurso || null}, concurso),
        data_inicio_vendas = COALESCE(${data_inicio_vendas || null}, data_inicio_vendas),
        data_fim_vendas = COALESCE(${data_fim_vendas || null}, data_fim_vendas),
        data_sorteio = COALESCE(${data_sorteio || null}, data_sorteio),
        status = COALESCE(${status || null}, status),
        visivel = COALESCE(${visivel !== undefined ? (visivel ? 1 : 0) : null}, visivel),
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return await buscarBolaoEspecialPorId(id);
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao atualizar:', error);
    throw error;
  }
};

/**
 * Alterar status do bolão especial
 */
export const alterarStatusBolaoEspecial = async (id, novoStatus) => {
  const statusPermitidos = ['aguardando', 'aberto', 'encerrado', 'sorteado'];
  
  if (!statusPermitidos.includes(novoStatus)) {
    throw new Error(`Status inválido: ${novoStatus}`);
  }

  try {
    await db.run(sql`
      UPDATE boloes_especiais 
      SET status = ${novoStatus}, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return await buscarBolaoEspecialPorId(id);
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao alterar status:', error);
    throw error;
  }
};

/**
 * Alterar visibilidade
 */
export const alterarVisibilidadeBolaoEspecial = async (id, visivel) => {
  try {
    await db.run(sql`
      UPDATE boloes_especiais 
      SET visivel = ${visivel ? 1 : 0}, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return await buscarBolaoEspecialPorId(id);
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao alterar visibilidade:', error);
    throw error;
  }
};

// ============================================================
// EXCLUIR (Soft Delete)
// ============================================================

/**
 * Excluir bolão especial (soft delete)
 */
export const excluirBolaoEspecial = async (id) => {
  try {
    await db.run(sql`
      UPDATE boloes_especiais 
      SET ativo = 0, visivel = 0, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `);

    return { success: true, message: 'Bolão especial excluído' };
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao excluir:', error);
    throw error;
  }
};

// ============================================================
// TEMPLATES
// ============================================================

/**
 * Buscar templates de bolões especiais
 */
export const buscarTemplates = async () => {
  try {
    const templates = await db.all(sql`
      SELECT * FROM templates_boloes_especiais
      WHERE ativo = 1
      ORDER BY tipo_especial
    `);

    return templates;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao buscar templates:', error);
    return [];
  }
};

/**
 * Buscar template específico
 */
export const buscarTemplatePorTipo = async (tipoEspecial) => {
  try {
    const templates = await db.all(sql`
      SELECT * FROM templates_boloes_especiais
      WHERE tipo_especial = ${tipoEspecial} AND ativo = 1
      LIMIT 1
    `);

    return templates[0] || null;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao buscar template:', error);
    return null;
  }
};

/**
 * Criar bolão a partir de template
 */
export const criarBolaoAPartirDeTemplate = async (tipoEspecial, dadosAdicionais, criadoPor) => {
  const template = await buscarTemplatePorTipo(tipoEspecial);
  
  if (!template) {
    throw new Error(`Template não encontrado: ${tipoEspecial}`);
  }

  const ano = new Date().getFullYear();
  
  // Calcular datas baseado no template
  const dataSorteio = new Date(dadosAdicionais.data_sorteio);
  const dataInicio = new Date(dataSorteio);
  dataInicio.setDate(dataInicio.getDate() - template.dias_antecedencia_vendas);
  
  const dataFim = new Date(dataSorteio);
  dataFim.setHours(dataFim.getHours() - template.horas_antecedencia_encerramento);

  const dados = {
    tipo_especial: tipoEspecial,
    nome: dadosAdicionais.nome || template.nome_padrao,
    descricao: dadosAdicionais.descricao || template.descricao_padrao,
    ano,
    tipo_loteria: template.tipo_loteria,
    ...dadosAdicionais,
    data_inicio_vendas: dataInicio.toISOString(),
    data_fim_vendas: dataFim.toISOString(),
    data_sorteio: dataSorteio.toISOString(),
    metadados: {
      template_usado: tipoEspecial,
      icone: template.icone,
      cor_tema: template.cor_tema,
      ...dadosAdicionais.metadados,
    },
  };

  return await criarBolaoEspecial(dados, criadoPor);
};

// ============================================================
// ESTATÍSTICAS
// ============================================================

/**
 * Buscar estatísticas de bolões especiais
 */
export const buscarEstatisticasBoloesEspeciais = async () => {
  try {
    const stats = await db.all(sql`
      SELECT 
        tipo_especial,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'aberto' THEN 1 ELSE 0 END) as abertos,
        SUM(CASE WHEN status = 'encerrado' THEN 1 ELSE 0 END) as encerrados,
        SUM(CASE WHEN status = 'sorteado' THEN 1 ELSE 0 END) as sorteados,
        SUM(CASE WHEN premiado = 1 THEN 1 ELSE 0 END) as premiados,
        SUM(valor_premio) as total_premiacao
      FROM boloes_especiais
      WHERE ativo = 1
      GROUP BY tipo_especial
    `);

    return stats;
  } catch (error) {
    console.error('[BOLOES_ESPECIAIS] Erro ao buscar estatísticas:', error);
    return [];
  }
};

export default {
  listarBoloesEspeciais,
  listarBoloesEspeciaisVisiveis,
  buscarBolaoEspecialPorId,
  criarBolaoEspecial,
  atualizarBolaoEspecial,
  alterarStatusBolaoEspecial,
  alterarVisibilidadeBolaoEspecial,
  excluirBolaoEspecial,
  buscarTemplates,
  buscarTemplatePorTipo,
  criarBolaoAPartirDeTemplate,
  buscarEstatisticasBoloesEspeciais,
};
