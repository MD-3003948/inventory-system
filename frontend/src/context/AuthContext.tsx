import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, getStoredToken, setStoredToken, clearStoredToken } from "../api";
import type { ChangePasswordInput, CurrentUser, LoginRequest } from "../types";

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  changePassword: (input: ChangePasswordInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }
    try {
      setUser(await authApi.me());
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    setStoredToken(response.token);
    setUser(await authApi.me());
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  const changePassword = async (input: ChangePasswordInput) => {
    const response = await authApi.changePassword(input);
    setStoredToken(response.token);
    setUser(await authApi.me());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
