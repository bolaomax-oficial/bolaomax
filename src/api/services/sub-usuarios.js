/**
 * Serviço de Sub-Usuários
 * Gerenciamento de equipe com permissões granulares
 */

import { db } from '../database/connection.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Hash de senha
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Criar sub-usuário
 */
export async function criarSubUsuario({
  nome,
  email,
  senha,
  telefone = null,
  cargo = null,
  permissoes = [],
  criadoPor
}) {
  try {
    // Verificar se email já existe
    const existe = await db.all(sql`
      SELECT id FROM sub_usuarios WHERE email = ${email}
      UNION
      SELECT id FROM users WHERE email = ${email}
    `);
    
    if (existe.length > 0) {
      throw new Error('Email já cadastrado');
    }
    
    const subUsuarioId = crypto.randomUUID();
    const passwordHash = hashPassword(senha);
    
    // Criar sub-usuário
    await db.run(sql`
      INSERT INTO sub_usuarios (
        id, nome, email, password_hash, telefone, cargo, status, criado_por
      ) VALUES (
        ${subUsuarioId}, ${nome}, ${email}, ${passwordHash}, 
        ${telefone}, ${cargo}, 'ativo', ${criadoPor}
      )
    `);
    
    // Adicionar permissões
    if (permissoes.length > 0) {
      for (const perm of permissoes) {
        const permId = crypto.randomUUID();
        await db.run(sql`
          INSERT INTO permissoes_sub_usuario (id, sub_usuario_id, modulo, permissao, ativo)
          VALUES (${permId}, ${subUsuarioId}, ${perm.modulo}, ${perm.permissao}, 1)
        `);
      }
    }
    
    console.log(`✅ [SUB-USUARIO] Criado: ${email}`);
    
    return {
      success: true,
      subUsuarioId,
      message: 'Sub-usuário criado com sucesso'
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao criar:', error);
    throw error;
  }
}

/**
 * Listar sub-usuários
 */
export async function listarSubUsuarios(adminId) {
  try {
    const subUsuarios = await db.all(sql`
      SELECT * FROM v_sub_usuarios_resumo
      ORDER BY criado_em DESC
    `);
    
    // Buscar permissões detalhadas para cada um
    const resultado = [];
    for (const su of subUsuarios) {
      const permissoes = await db.all(sql`
        SELECT modulo, permissao, ativo
        FROM permissoes_sub_usuario
        WHERE sub_usuario_id = ${su.id}
        ORDER BY modulo, permissao
      `);
      
      resultado.push({
        ...su,
        permissoes: permissoes.reduce((acc, p) => {
          if (!acc[p.modulo]) acc[p.modulo] = [];
          if (p.ativo) acc[p.modulo].push(p.permissao);
          return acc;
        }, {})
      });
    }
    
    return {
      success: true,
      subUsuarios: resultado
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao listar:', error);
    throw error;
  }
}

/**
 * Buscar sub-usuário por ID
 */
export async function buscarSubUsuario(id) {
  try {
    const subUsuario = await db.all(sql`
      SELECT * FROM sub_usuarios WHERE id = ${id} LIMIT 1
    `);
    
    if (!subUsuario.length) {
      throw new Error('Sub-usuário não encontrado');
    }
    
    const permissoes = await db.all(sql`
      SELECT modulo, permissao, ativo
      FROM permissoes_sub_usuario
      WHERE sub_usuario_id = ${id}
    `);
    
    return {
      success: true,
      subUsuario: {
        ...subUsuario[0],
        permissoes
      }
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao buscar:', error);
    throw error;
  }
}

/**
 * Atualizar sub-usuário
 */
export async function atualizarSubUsuario({
  id,
  nome,
  email,
  telefone,
  cargo,
  senha = null
}) {
  try {
    let query = `
      UPDATE sub_usuarios 
      SET nome = ?, email = ?, telefone = ?, cargo = ?
    `;
    const params = [nome, email, telefone, cargo];
    
    if (senha) {
      query += `, password_hash = ?`;
      params.push(hashPassword(senha));
    }
    
    query += ` WHERE id = ?`;
    params.push(id);
    
    await db.run(sql.raw(query, params));
    
    console.log(`✅ [SUB-USUARIO] Atualizado: ${id}`);
    
    return {
      success: true,
      message: 'Sub-usuário atualizado'
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao atualizar:', error);
    throw error;
  }
}

/**
 * Atualizar permissões
 */
export async function atualizarPermissoes(subUsuarioId, permissoes) {
  try {
    // Remover permissões antigas
    await db.run(sql`
      DELETE FROM permissoes_sub_usuario 
      WHERE sub_usuario_id = ${subUsuarioId}
    `);
    
    // Adicionar novas permissões
    for (const perm of permissoes) {
      const permId = crypto.randomUUID();
      await db.run(sql`
        INSERT INTO permissoes_sub_usuario (id, sub_usuario_id, modulo, permissao, ativo)
        VALUES (${permId}, ${subUsuarioId}, ${perm.modulo}, ${perm.permissao}, 1)
      `);
    }
    
    console.log(`✅ [SUB-USUARIO] Permissões atualizadas: ${subUsuarioId}`);
    
    return {
      success: true,
      message: 'Permissões atualizadas'
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao atualizar permissões:', error);
    throw error;
  }
}

/**
 * Alterar status
 */
export async function alterarStatus(id, novoStatus) {
  try {
    await db.run(sql`
      UPDATE sub_usuarios 
      SET status = ${novoStatus}
      WHERE id = ${id}
    `);
    
    console.log(`✅ [SUB-USUARIO] Status alterado: ${id} → ${novoStatus}`);
    
    return {
      success: true,
      message: `Sub-usuário ${novoStatus}`
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao alterar status:', error);
    throw error;
  }
}

/**
 * Excluir sub-usuário
 */
export async function excluirSubUsuario(id) {
  try {
    await db.run(sql`
      DELETE FROM sub_usuarios WHERE id = ${id}
    `);
    
    console.log(`✅ [SUB-USUARIO] Excluído: ${id}`);
    
    return {
      success: true,
      message: 'Sub-usuário excluído'
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao excluir:', error);
    throw error;
  }
}

/**
 * Verificar permissão específica
 */
export async function verificarPermissao(subUsuarioId, modulo, permissao) {
  try {
    const result = await db.all(sql`
      SELECT COUNT(*) as tem
      FROM permissoes_sub_usuario
      WHERE sub_usuario_id = ${subUsuarioId}
        AND modulo = ${modulo}
        AND permissao = ${permissao}
        AND ativo = 1
    `);
    
    return result[0].tem > 0;
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao verificar permissão:', error);
    return false;
  }
}

/**
 * Buscar roles pré-definidas
 */
export async function buscarRoles() {
  try {
    const roles = await db.all(sql`
      SELECT * FROM roles_pre_definidas
      ORDER BY nome
    `);
    
    return {
      success: true,
      roles: roles.map(r => ({
        ...r,
        permissoes: JSON.parse(r.permissoes)
      }))
    };
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao buscar roles:', error);
    throw error;
  }
}

/**
 * Registrar log de acesso
 */
export async function registrarLog({
  subUsuarioId,
  acao,
  modulo = null,
  detalhes = {},
  ipAddress = null,
  userAgent = null
}) {
  try {
    const logId = crypto.randomUUID();
    await db.run(sql`
      INSERT INTO logs_acesso_sub_usuario (
        id, sub_usuario_id, acao, modulo, detalhes, ip_address, user_agent
      ) VALUES (
        ${logId}, ${subUsuarioId}, ${acao}, ${modulo}, 
        ${JSON.stringify(detalhes)}, ${ipAddress}, ${userAgent}
      )
    `);
  } catch (error) {
    console.error('[SUB-USUARIO] Erro ao registrar log:', error);
  }
}

export default {
  criarSubUsuario,
  listarSubUsuarios,
  buscarSubUsuario,
  atualizarSubUsuario,
  atualizarPermissoes,
  alterarStatus,
  excluirSubUsuario,
  verificarPermissao,
  buscarRoles,
  registrarLog
};
