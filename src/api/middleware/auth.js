/**
 * BolãoMax - Middlewares de Autenticação
 * Middlewares Express para proteger rotas
 */

import { verifyToken } from '../services/auth.js';

/**
 * Middleware: Requer autenticação
 * Verifica se o usuário está autenticado via JWT
 */
export function requireAuth(req, res, next) {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        code: 'NO_TOKEN'
      });
    }
    
    // Formato esperado: "Bearer TOKEN"
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Adicionar usuário ao request
    req.user = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('[AUTH] Erro no middleware requireAuth:', error);
    return res.status(401).json({ 
      error: 'Erro ao verificar autenticação',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Middleware: Requer role específica
 * Verifica se o usuário tem a role necessária
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    try {
      // requireAuth deve ter sido executado antes
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }
      
      // Verificar se tem a role necessária
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Permissão negada',
          code: 'FORBIDDEN',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (error) {
      console.error('[AUTH] Erro no middleware requireRole:', error);
      return res.status(403).json({ 
        error: 'Erro ao verificar permissões',
        code: 'ROLE_ERROR'
      });
    }
  };
}

/**
 * Middleware: Requer admin
 * Atalho para requireRole('admin')
 */
export function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

/**
 * Middleware: Auth opcional
 * Adiciona usuário ao request se autenticado, mas não bloqueia
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Não autenticado, mas ok
      req.user = null;
      return next();
    }
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
      req.token = token;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Erro silencioso, continua sem autenticação
    req.user = null;
    next();
  }
}

/**
 * Middleware: Verificar se é o próprio usuário ou admin
 * Usado para rotas como /users/:id
 */
export function requireSelfOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    const targetUserId = req.params.id || req.params.userId;
    
    // Admin pode acessar qualquer usuário
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Usuário só pode acessar seus próprios dados
    if (req.user.id === targetUserId) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Você só pode acessar seus próprios dados',
      code: 'FORBIDDEN'
    });
  } catch (error) {
    console.error('[AUTH] Erro no middleware requireSelfOrAdmin:', error);
    return res.status(403).json({ 
      error: 'Erro ao verificar permissões',
      code: 'PERMISSION_ERROR'
    });
  }
}

/**
 * Middleware: Rate limiting simples
 * Previne abuso de endpoints de auth
 */
const rateLimitStore = new Map();

export function rateLimit(maxRequests = 5, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}-${req.path}`;
    
    const now = Date.now();
    const userRequests = rateLimitStore.get(key) || [];
    
    // Remover requisições antigas
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Muitas requisições. Tente novamente mais tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }
    
    // Adicionar nova requisição
    recentRequests.push(now);
    rateLimitStore.set(key, recentRequests);
    
    next();
  };
}

/**
 * Middleware: Verificar email verificado
 */
export function requireEmailVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }
  
  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Email não verificado. Verifique seu email antes de continuar.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }
  
  next();
}
