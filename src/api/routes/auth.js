/**
 * BolãoMax - Rotas de Autenticação
 * Endpoints para login, registro, logout, etc
 */

import express from 'express';
import { db, schema } from '../database/connection.js';
import * as authService from '../services/auth.js';
import { requireAuth, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// REGISTRO
// ============================================================

router.post('/register', rateLimit(3, 300000), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      });
    }
    
    if (!email.includes('@')) {
      return res.status(400).json({ 
        error: 'Email inválido' 
      });
    }
    
    // Registrar
    const result = await authService.register(db, schema, { name, email, password });
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      user: result.user,
      token: result.token,
    });
    
    console.log(`✅ [AUTH] Usuário registrado: ${email}`);
  } catch (error) {
    console.error('❌ [AUTH] Erro no registro:', error);
    
    if (error.message === 'Email já cadastrado') {
      return res.status(409).json({ 
        error: error.message,
        code: 'EMAIL_EXISTS'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao registrar usuário',
      code: 'REGISTER_ERROR'
    });
  }
});

// ============================================================
// LOGIN
// ============================================================

router.post('/login', rateLimit(5, 300000), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validações
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    // Login
    const result = await authService.login(db, schema, { email, password });
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      user: result.user,
      token: result.token,
    });
    
    console.log(`✅ [AUTH] Login: ${email}`);
  } catch (error) {
    console.error('❌ [AUTH] Erro no login:', error.message);
    
    // Não revelar se é email ou senha incorretos
    res.status(401).json({ 
      error: 'Email ou senha incorretos',
      code: 'INVALID_CREDENTIALS'
    });
  }
});

// ============================================================
// LOGOUT
// ============================================================

router.post('/logout', requireAuth, async (req, res) => {
  try {
    await authService.logout(db, schema, req.token);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
    
    console.log(`✅ [AUTH] Logout: ${req.user.email}`);
  } catch (error) {
    console.error('❌ [AUTH] Erro no logout:', error);
    
    res.status(500).json({ 
      error: 'Erro ao fazer logout',
      code: 'LOGOUT_ERROR'
    });
  }
});

// ============================================================
// VERIFICAR AUTENTICAÇÃO (ME)
// ============================================================

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await authService.verifyAuth(db, schema, req.token);
    
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar usuário:', error);
    
    res.status(401).json({ 
      error: 'Sessão inválida',
      code: 'INVALID_SESSION'
    });
  }
});

// ============================================================
// ATUALIZAR SENHA
// ============================================================

router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Senha atual e nova senha são obrigatórias' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
    }
    
    await authService.updatePassword(db, schema, req.user.id, { 
      currentPassword, 
      newPassword 
    });
    
    res.json({
      success: true,
      message: 'Senha atualizada com sucesso',
    });
    
    console.log(`✅ [AUTH] Senha atualizada: ${req.user.email}`);
  } catch (error) {
    console.error('❌ [AUTH] Erro ao atualizar senha:', error);
    
    if (error.message === 'Senha atual incorreta') {
      return res.status(401).json({ 
        error: error.message,
        code: 'WRONG_PASSWORD'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao atualizar senha',
      code: 'UPDATE_PASSWORD_ERROR'
    });
  }
});

// ============================================================
// RESET DE SENHA (REQUEST)
// ============================================================

router.post('/password/reset', rateLimit(3, 3600000), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email é obrigatório' 
      });
    }
    
    await authService.requestPasswordReset(db, schema, email);
    
    // Sempre retornar sucesso (não revelar se email existe)
    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para resetar sua senha',
    });
    
    console.log(`📧 [AUTH] Reset de senha solicitado: ${email}`);
  } catch (error) {
    console.error('❌ [AUTH] Erro ao solicitar reset:', error);
    
    res.status(500).json({ 
      error: 'Erro ao processar solicitação',
      code: 'RESET_ERROR'
    });
  }
});

// ============================================================
// VERIFICAR TOKEN (DEBUG)
// ============================================================

if (process.env.NODE_ENV !== 'production') {
  router.post('/verify-token', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token é obrigatório' });
      }
      
      const decoded = authService.verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({ 
          valid: false,
          error: 'Token inválido ou expirado' 
        });
      }
      
      res.json({
        valid: true,
        decoded,
      });
    } catch (error) {
      res.status(500).json({ 
        valid: false,
        error: error.message 
      });
    }
  });
}

export default router;
