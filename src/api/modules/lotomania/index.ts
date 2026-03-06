/**
 * ============================================================
 * ÍNDICE DO MÓDULO LOTOMANIA
 * ============================================================
 */

// Regras da Modalidade (Caixa - imutáveis)
export * from './regras-modalidade';

// Regras Comerciais (BolãoMax - configuráveis)
export * from './regras-comerciais';

// Regras de Estratégia (Geração de apostas)
export * from './regras-estrategia';

// Schema do banco de dados
export * from './schema';

// Serviço principal
export * from './service';

// Rotas API
export { lotomaniaRoutes, lotomaniaAdminRoutes } from './routes';
