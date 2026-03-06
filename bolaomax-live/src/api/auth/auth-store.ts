/**
 * Auth Store - Shared authentication storage and utilities
 * 
 * Centralizes user and session storage for use across all API routes
 */

import crypto from 'crypto';

// ============================================================
// Types
// ============================================================
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  saldo: number;
  avatar: string | null;
  role: string;
  status: string;
  criadoEm: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  criadoEm: string;
}

// ============================================================
// In-memory stores
// ============================================================
export const usersStore = new Map<string, UserRecord>();
export const sessionsStore = new Map<string, SessionRecord>();

// ============================================================
// Helper functions
// ============================================================
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getSessionExpiry = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

/**
 * Validates a session token and returns the user if valid
 */
export const validateSession = (token: string): { valid: boolean; user?: UserRecord; error?: string } => {
  const session = sessionsStore.get(token);

  if (!session) {
    return { valid: false, error: 'Sessão inválida ou expirada' };
  }

  // Check if session expired
  if (new Date(session.expiresAt) < new Date()) {
    sessionsStore.delete(token);
    return { valid: false, error: 'Sessão expirada' };
  }

  // Find user by ID
  let user: UserRecord | undefined;
  for (const u of usersStore.values()) {
    if (u.id === session.userId) {
      user = u;
      break;
    }
  }

  if (!user) {
    sessionsStore.delete(token);
    return { valid: false, error: 'Usuário não encontrado' };
  }

  return { valid: true, user };
};

/**
 * Gets user from email
 */
export const getUserByEmail = (email: string): UserRecord | undefined => {
  return usersStore.get(email.toLowerCase());
};

/**
 * Gets user by ID
 */
export const getUserById = (id: string): UserRecord | undefined => {
  for (const user of usersStore.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return undefined;
};

/**
 * Updates user balance
 */
export const updateUserSaldo = (userId: string, novoSaldo: number): boolean => {
  for (const [email, user] of usersStore.entries()) {
    if (user.id === userId) {
      user.saldo = novoSaldo;
      usersStore.set(email, user);
      console.log(`[AUTH-STORE] Saldo atualizado para ${user.email}: R$ ${novoSaldo}`);
      return true;
    }
  }
  return false;
};

// ============================================================
// Initialize with seed data
// ============================================================
const adminUser: UserRecord = {
  id: 'user-admin-001',
  name: 'Administrador',
  email: 'admin@bolaomax.com',
  passwordHash: hashPassword('admin123'),
  saldo: 1000,
  avatar: null,
  role: 'admin',
  status: 'active',
  criadoEm: new Date().toISOString(),
};
usersStore.set(adminUser.email, adminUser);

const demoUser: UserRecord = {
  id: 'user-demo-001',
  name: 'Usuário Demo',
  email: 'demo@bolaomax.com',
  passwordHash: hashPassword('demo123'),
  saldo: 150,
  avatar: null,
  role: 'user',
  status: 'active',
  criadoEm: new Date().toISOString(),
};
usersStore.set(demoUser.email, demoUser);

const testeUser: UserRecord = {
  id: 'user-teste-001',
  name: 'Usuário Teste',
  email: 'usuario@teste.com',
  passwordHash: hashPassword('123456'),
  saldo: 100,
  avatar: null,
  role: 'user',
  status: 'active',
  criadoEm: new Date().toISOString(),
};
usersStore.set(testeUser.email, testeUser);

console.log('✅ [AUTH-STORE] Usuários inicializados:');
console.log('   - admin@bolaomax.com / admin123 (admin)');
console.log('   - demo@bolaomax.com / demo123 (user)');
console.log('   - usuario@teste.com / 123456 (user)');

