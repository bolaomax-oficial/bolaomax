/**
 * Authentication API Routes - BolãoMax
 * 
 * Rotas para autenticação de usuários
 * - POST /auth/register - Criar conta
 * - POST /auth/login - Fazer login
 * - POST /auth/logout - Fazer logout
 * - GET /auth/me - Verificar sessão atual
 */

import { Hono } from 'hono';
import crypto from 'crypto';
import {
  usersStore,
  sessionsStore,
  hashPassword,
  generateToken,
  getSessionExpiry,
  validateSession,
  UserRecord,
  SessionRecord,
} from '../auth/auth-store';

const app = new Hono();

// ============================================================
// POST /auth/register - Criar conta
// ============================================================
app.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password } = body;

    // Validação
    if (!name || !email || !password) {
      return c.json({
        success: false,
        error: 'Campos obrigatórios: name, email, password',
        code: 'MISSING_FIELDS',
      }, 400);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({
        success: false,
        error: 'Formato de email inválido',
        code: 'INVALID_EMAIL',
      }, 400);
    }

    // Validar senha (mínimo 6 caracteres)
    if (password.length < 6) {
      return c.json({
        success: false,
        error: 'Senha deve ter no mínimo 6 caracteres',
        code: 'WEAK_PASSWORD',
      }, 400);
    }

    // Verificar se email já existe
    if (usersStore.has(email.toLowerCase())) {
      return c.json({
        success: false,
        error: 'Este email já está cadastrado',
        code: 'EMAIL_EXISTS',
      }, 409);
    }

    // Criar usuário
    const newUser: UserRecord = {
      id: `user-${crypto.randomUUID()}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      saldo: 0,
      avatar: null,
      role: 'user',
      status: 'active',
      criadoEm: new Date().toISOString(),
    };

    usersStore.set(newUser.email, newUser);

    // Criar sessão
    const token = generateToken();
    const session: SessionRecord = {
      id: `session-${crypto.randomUUID()}`,
      userId: newUser.id,
      token,
      expiresAt: getSessionExpiry(),
      criadoEm: new Date().toISOString(),
    };

    sessionsStore.set(token, session);

    // Retornar usuário (sem senha) e token
    return c.json({
      success: true,
      message: 'Conta criada com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        saldo: newUser.saldo,
        avatar: newUser.avatar,
        role: newUser.role,
      },
      token,
    }, 201);

  } catch (error: any) {
    console.error('[AUTH] Erro ao registrar:', error);
    return c.json({
      success: false,
      error: 'Erro ao criar conta',
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /auth/login - Fazer login
// ============================================================
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validação
    if (!email || !password) {
      return c.json({
        success: false,
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS',
      }, 400);
    }

    // Buscar usuário
    const user = usersStore.get(email.toLowerCase());

    if (!user) {
      return c.json({
        success: false,
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
      }, 401);
    }

    // Verificar senha
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return c.json({
        success: false,
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
      }, 401);
    }

    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      return c.json({
        success: false,
        error: 'Conta suspensa ou inativa',
        code: 'ACCOUNT_INACTIVE',
      }, 403);
    }

    // Criar nova sessão
    const token = generateToken();
    const session: SessionRecord = {
      id: `session-${crypto.randomUUID()}`,
      userId: user.id,
      token,
      expiresAt: getSessionExpiry(),
      criadoEm: new Date().toISOString(),
    };

    sessionsStore.set(token, session);

    // Retornar usuário (sem senha) e token
    return c.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        saldo: user.saldo,
        avatar: user.avatar,
        role: user.role,
      },
      token,
    });

  } catch (error: any) {
    console.error('[AUTH] Erro ao fazer login:', error);
    return c.json({
      success: false,
      error: 'Erro ao fazer login',
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// POST /auth/logout - Fazer logout
// ============================================================
app.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      sessionsStore.delete(token);
    }

    return c.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });

  } catch (error: any) {
    console.error('[AUTH] Erro ao fazer logout:', error);
    return c.json({
      success: false,
      error: 'Erro ao fazer logout',
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// GET /auth/me - Verificar sessão atual
// ============================================================
app.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Token não fornecido',
        code: 'NO_TOKEN',
      }, 401);
    }

    const token = authHeader.substring(7);
    const result = validateSession(token);

    if (!result.valid || !result.user) {
      return c.json({
        success: false,
        error: result.error || 'Sessão inválida',
        code: 'INVALID_SESSION',
      }, 401);
    }

    const user = result.user;

    // Retornar dados do usuário
    return c.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        saldo: user.saldo,
        avatar: user.avatar,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error('[AUTH] Erro ao verificar sessão:', error);
    return c.json({
      success: false,
      error: 'Erro ao verificar sessão',
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

// ============================================================
// PUT /auth/saldo - Atualizar saldo do usuário
// ============================================================
app.put('/saldo', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        success: false,
        error: 'Token não fornecido',
        code: 'NO_TOKEN',
      }, 401);
    }

    const token = authHeader.substring(7);
    const result = validateSession(token);

    if (!result.valid || !result.user) {
      return c.json({
        success: false,
        error: result.error || 'Sessão inválida',
        code: 'INVALID_SESSION',
      }, 401);
    }

    const body = await c.req.json();
    const { saldo } = body;

    if (typeof saldo !== 'number' || saldo < 0) {
      return c.json({
        success: false,
        error: 'Saldo inválido',
        code: 'INVALID_SALDO',
      }, 400);
    }

    // Buscar e atualizar usuário
    for (const [email, user] of usersStore.entries()) {
      if (user.id === result.user.id) {
        user.saldo = saldo;
        usersStore.set(email, user);
        
        return c.json({
          success: true,
          message: 'Saldo atualizado',
          saldo: user.saldo,
        });
      }
    }

    return c.json({
      success: false,
      error: 'Usuário não encontrado',
      code: 'USER_NOT_FOUND',
    }, 404);

  } catch (error: any) {
    console.error('[AUTH] Erro ao atualizar saldo:', error);
    return c.json({
      success: false,
      error: 'Erro ao atualizar saldo',
      message: error.message,
      code: 'INTERNAL_ERROR',
    }, 500);
  }
});

export default app;
