import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { configureFetchClient } from "@/api/fetchClient";
import { authService } from "@/api/services/auth.service";
import type { User, RoleName } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: RoleName[]) => boolean;
}

const STORAGE_KEYS = {
  access: "pharmacy_access_token",
  refresh: "pharmacy_refresh_token",
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem(STORAGE_KEYS.access),
    refreshToken: localStorage.getItem(STORAGE_KEYS.refresh),
    isAuthenticated: false,
    isLoading: true,
  });

  const setTokens = useCallback((access: string, refresh: string) => {
    localStorage.setItem(STORAGE_KEYS.access, access);
    localStorage.setItem(STORAGE_KEYS.refresh, refresh);
    setState((prev) => ({
      ...prev,
      accessToken: access,
      refreshToken: refresh,
    }));
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.access);
    localStorage.removeItem(STORAGE_KEYS.refresh);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authService.login(email, password);
      const data = response.data!;
      setTokens(data.accessToken, data.refreshToken);
      setState({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    },
    [setTokens]
  );

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem(STORAGE_KEYS.refresh);
      if (rt) await authService.logout(rt);
    } catch {
      // ignore
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user) return false;
      if (state.user.role?.nombre === "administrador") return true;
      return state.user.permissions?.includes(permission) ?? false;
    },
    [state.user]
  );

  const hasRole = useCallback(
    (...roles: RoleName[]): boolean => {
      if (!state.user) return false;
      return roles.includes(state.user.role?.nombre as RoleName);
    },
    [state.user]
  );

  useEffect(() => {
    configureFetchClient({
      getAccessToken: () => localStorage.getItem(STORAGE_KEYS.access),
      getRefreshToken: () => localStorage.getItem(STORAGE_KEYS.refresh),
      onRefresh: (newToken: string) => {
        localStorage.setItem(STORAGE_KEYS.access, newToken);
        setState((prev) => ({ ...prev, accessToken: newToken }));
      },
      onLogout: clearAuth,
    });
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.access);
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      try {
        const response = await authService.me();
        setState({
          user: response.data!,
          accessToken: token,
          refreshToken: localStorage.getItem(STORAGE_KEYS.refresh),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        clearAuth();
      }
    };
    initAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
