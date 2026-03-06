/**
 * Configuração global da API
 * Em desenvolvimento, chama diretamente a porta 3000
 * Em produção, usa o proxy reverso
 */

export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000' 
  : '';

export const API_URL = `${API_BASE_URL}/api`;

// Helper para fazer requests autenticados
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}
