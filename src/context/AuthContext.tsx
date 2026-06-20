import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { apiFetch } from "../lib/api";
import {
  AuthResponse,
  AuthUser,
  clearAccessToken,
  getAccessToken,
  setAccessToken
} from "../lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readAuthResponse(response: Response): Promise<AuthResponse> {
  if (!response.ok) {
    let message = "请求失败";
    try {
      const data = (await response.json()) as { detail?: string };
      if (data.detail) {
        message = data.detail;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as AuthResponse;
}

function applyAuthResponse(
  data: AuthResponse,
  setUser: (user: AuthUser | null) => void
): void {
  setAccessToken(data.access_token);
  setUser(data.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const restoreSession = async () => {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiFetch("/v1/auth/me", {
          signal: controller.signal
        });

        if (!response.ok) {
          clearAccessToken();
          setUser(null);
          return;
        }

        const currentUser = (await response.json()) as AuthUser;
        setUser(currentUser);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        clearAccessToken();
        setUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      controller.abort();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await readAuthResponse(response);
    applyAuthResponse(data, setUser);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const response = await apiFetch("/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || null
        })
      });
      const data = await readAuthResponse(response);
      applyAuthResponse(data, setUser);
    },
    []
  );

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
