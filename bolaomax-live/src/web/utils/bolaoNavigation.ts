/**
 * Utility functions for handling bolão participation navigation
 * Handles authentication-based redirection and localStorage for pending bolão
 */

export interface PendingBolao {
  id: string;
  name: string;
  type: "Lotofácil" | "Mega-Sena" | "Quina";
  dezenas: number;
  prizeValue: string;
  bolaoValue: number;
  sorteioDate: string;
  minParticipation: number;
  concurso?: string;
  isSpecial?: boolean;
}

const PENDING_BOLAO_KEY = "pendingBolao";

/**
 * Store pending bolão in localStorage
 */
export const storePendingBolao = (bolao: PendingBolao): void => {
  localStorage.setItem(PENDING_BOLAO_KEY, JSON.stringify(bolao));
};

/**
 * Retrieve pending bolão from localStorage
 */
export const getPendingBolao = (): PendingBolao | null => {
  try {
    const stored = localStorage.getItem(PENDING_BOLAO_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Clear pending bolão from localStorage
 */
export const clearPendingBolao = (): void => {
  localStorage.removeItem(PENDING_BOLAO_KEY);
};

/**
 * Build checkout URL with bolão parameters
 */
export const buildCheckoutUrl = (bolao: PendingBolao): string => {
  const params = new URLSearchParams({
    bolaoId: bolao.id,
    name: bolao.name,
    type: bolao.type,
    dezenas: bolao.dezenas.toString(),
    prizeValue: bolao.prizeValue,
    bolaoValue: bolao.bolaoValue.toString(),
    sorteioDate: bolao.sorteioDate,
    minParticipation: bolao.minParticipation.toString(),
  });
  
  if (bolao.concurso) {
    params.set("concurso", bolao.concurso);
  }
  
  if (bolao.isSpecial) {
    params.set("isSpecial", "true");
  }
  
  return `/checkout?${params.toString()}`;
};

/**
 * Build signup URL with return path for bolão participation
 */
export const buildSignupUrl = (returnPath: string): string => {
  return `/cadastro?returnUrl=${encodeURIComponent(returnPath)}`;
};

/**
 * Handle bolão participation click
 * - If authenticated: navigate directly to checkout with bolão details
 * - If not authenticated: store bolão in localStorage and redirect to signup
 * 
 * @param bolao - The bolão data to participate in
 * @param isAuthenticated - Whether the user is logged in
 * @param navigate - Navigation function (from wouter's useLocation)
 */
export const handleBolaoParticipation = (
  bolao: PendingBolao,
  isAuthenticated: boolean,
  navigate: (path: string) => void
): void => {
  const checkoutUrl = buildCheckoutUrl(bolao);
  
  if (isAuthenticated) {
    // User is logged in, go directly to checkout
    navigate(checkoutUrl);
  } else {
    // Store bolão details for after signup/login
    storePendingBolao(bolao);
    // Redirect to signup with return URL
    const signupUrl = buildSignupUrl(checkoutUrl);
    navigate(signupUrl);
  }
};

/**
 * Parse bolão value string to number
 * Handles formats like "R$ 1.500" or "R$ 2.400,00"
 */
export const parseBolaoValue = (valueStr: string): number => {
  // Remove currency symbol, dots (thousand separator), and replace comma with dot
  const cleanedStr = valueStr
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleanedStr) || 0;
};

/**
 * Parse participation value string to number
 * Handles formats like "R$ 15" or "R$ 25,00"
 */
export const parseMinParticipation = (valueStr: string): number => {
  const cleanedStr = valueStr
    .replace(/R\$\s*/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleanedStr) || 0;
};
