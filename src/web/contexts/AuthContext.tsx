import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  saldo: number;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateSaldo: (newSaldo: number) => void;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "bolaomax_token";

// Helper: Get stored token
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper: Store token
const storeToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    console.error("[Auth] Erro ao salvar token");
  }
};

// Helper: Remove token
const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    console.error("[Auth] Erro ao remover token");
  }
};

// Helper: API request with auth
const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify existing session on mount
  const verifySession = useCallback(async () => {
    const token = getStoredToken();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authFetch("/api/auth/me");
      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
      } else {
        // Token inválido ou expirado
        removeToken();
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("[Auth] Erro ao verificar sessão:", error);
      removeToken();
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        storeToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return true;
      }

      console.error("[Auth] Login falhou:", data.error);
      return false;
    } catch (error) {
      console.error("[Auth] Erro ao fazer login:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("[Auth] Erro ao fazer logout:", error);
    } finally {
      removeToken();
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user && data.token) {
        storeToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        return true;
      }

      console.error("[Auth] Registro falhou:", data.error);
      return false;
    } catch (error) {
      console.error("[Auth] Erro ao registrar:", error);
      return false;
    }
  };

  const updateSaldo = async (newSaldo: number) => {
    if (!user) return;

    try {
      const response = await authFetch("/api/auth/saldo", {
        method: "PUT",
        body: JSON.stringify({ saldo: newSaldo }),
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => (prev ? { ...prev, saldo: newSaldo } : null));
      }
    } catch (error) {
      console.error("[Auth] Erro ao atualizar saldo:", error);
      // Atualiza localmente mesmo se falhar no servidor
      setUser((prev) => (prev ? { ...prev, saldo: newSaldo } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, isLoading, login, logout, register, updateSaldo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
