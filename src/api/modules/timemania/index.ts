/**
 * ============================================================
 * ÍNDICE DO MÓDULO TIMEMANIA
 * ============================================================
 */

// Regras da Modalidade (Caixa - imutáveis)
export * from './regras-modalidade';

// Regras Comerciais (BolãoMax - configuráveis)
export * from './regras-comerciais';

// Schema do banco de dados
export * from './schema';

// Serviço principal
export * from './service';

// Rotas API
export { timemaniaRoutes, timemaniaAdminRoutes } from './routes';
