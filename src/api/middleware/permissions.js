/**
 * Middleware de Permissões para Sub-Usuários
 * Verifica se sub-usuário tem permissão para acessar recurso específico
 */

import { verificarPermissao } from '../services/sub-usuarios.js';

/**
 * Middleware: Requer permissão específica
 * Uso: requirePermission('boloes', 'visualizar')
 */
export function requirePermission(modulo, permissao) {
  return async (req, res, next) => {
    try {
      // Se é admin master, libera tudo
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Se é sub-usuário, verifica permissão
      if (req.user.role === 'sub-usuario') {
        const temPermissao = await verificarPermissao(
          req.user.id, 
          modulo, 
          permissao
        );
        
        if (!temPermissao) {
          return res.status(403).json({
            success: false,
            error: 'Você não tem permissão para esta ação',
            code: 'PERMISSION_DENIED',
            required: { modulo, permissao }
          });
        }
        
        return next();
      }
      
      // Se não é admin nem sub-usuario, bloqueia
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        code: 'ACCESS_DENIED'
      });
    } catch (error) {
      console.error('[MIDDLEWARE] Erro ao verificar permissão:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Middleware: Requer qualquer uma das permissões (OR)
 * Uso: requireAnyPermission([['boloes', 'visualizar'], ['boloes', 'editar']])
 */
export function requireAnyPermission(permissoesArray) {
  return async (req, res, next) => {
    try {
      // Admin master libera tudo
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Sub-usuário: verificar se tem pelo menos uma das permissões
      if (req.user.role === 'sub-usuario') {
        for (const [modulo, permissao] of permissoesArray) {
          const temPermissao = await verificarPermissao(
            req.user.id,
            modulo,
            permissao
          );
          
          if (temPermissao) {
            return next();
          }
        }
        
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para esta ação',
          code: 'PERMISSION_DENIED'
        });
      }
      
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    } catch (error) {
      console.error('[MIDDLEWARE] Erro ao verificar permissões:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar permissões'
      });
    }
  };
}

/**
 * Middleware: Verifica se sub-usuário está ativo
 */
export async function requireSubUsuarioAtivo(req, res, next) {
  try {
    if (req.user.role !== 'sub-usuario') {
      return next();
    }
    
    // Buscar sub-usuário
    const { db } = await import('../database/connection.js');
    const { sql } = await import('drizzle-orm');
    
    const subUsuario = await db.all(sql`
      SELECT status FROM sub_usuarios WHERE id = ${req.user.id} LIMIT 1
    `);
    
    if (!subUsuario.length || subUsuario[0].status !== 'ativo') {
      return res.status(403).json({
        success: false,
        error: 'Sua conta está inativa ou bloqueada',
        code: 'ACCOUNT_INACTIVE'
      });
    }
    
    next();
  } catch (error) {
    console.error('[MIDDLEWARE] Erro ao verificar status:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar status da conta'
    });
  }
}

export default {
  requirePermission,
  requireAnyPermission,
  requireSubUsuarioAtivo
};
