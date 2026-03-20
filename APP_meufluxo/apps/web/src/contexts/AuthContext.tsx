"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { HOME_PATH } from "@/lib/navigation";
import { api } from "@/services/api";
import { authTokenRef, on401RetryRef, onUnauthorizedRef } from "@/lib/auth-token";
import { refreshWithCredentials } from "@/services/auth.service";
import type { User, UserPreferences } from "@meufluxo/types";

/** Mapeia resposta de GET /users/me para User + preferences do contexto. */
function mapMeToUserAndPreferences(
  me: { id: string; name: string; email: string; preferences: UserPreferences },
): { user: User; preferences: UserPreferences } {
  return {
    user: {
      id: Number(me.id) || 0,
      fullName: me.name,
      email: me.email,
    },
    preferences: me.preferences ?? {},
  };
}

export type AuthState = {
  accessToken: string | null;
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  bootstrapAuth: () => Promise<void>;
  clearSession: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  accessToken: null,
  user: null,
  preferences: null,
  isAuthenticated: false,
  isBootstrapping: true,
  error: null,
};

/** Evita múltiplos refresh simultâneos: uma única promise em flight. */
let refreshPromise: Promise<string | null> | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [state, setState] = React.useState<AuthState>(initialState);
  const bootstrapDone = React.useRef(false);

  const setAccessToken = React.useCallback((token: string | null) => {
    authTokenRef.current = token;
    setState((prev) => ({
      ...prev,
      accessToken: token,
      isAuthenticated: !!token,
    }));
  }, []);

  const applyPreferences = React.useCallback(
    (preferences: UserPreferences | null) => {
      if (preferences?.theme && setTheme) {
        setTheme(preferences.theme as "light" | "dark" | "system");
      }
    },
    [setTheme],
  );

  const clearSession = React.useCallback(() => {
    authTokenRef.current = null;
    setState({
      ...initialState,
      isBootstrapping: false,
      isAuthenticated: false,
    });
  }, []);

  const handleUnauthorized = React.useCallback(() => {
    clearSession();
    on401RetryRef.current = null;
    onUnauthorizedRef.current = null;
    router.replace("/login");
  }, [clearSession, router]);

  /** Retorna novo accessToken ou null. Uma única chamada em flight. */
  const doRefresh = React.useCallback(async (): Promise<string | null> => {
    if (refreshPromise) return refreshPromise;
    refreshPromise = refreshWithCredentials()
      .then((data) => {
        refreshPromise = null;
        return data?.accessToken ?? null;
      })
      .catch(() => {
        refreshPromise = null;
        return null;
      });
    return refreshPromise;
  }, []);

  /** Carrega user e preferences via GET /users/me (token já deve estar em memória). */
  const loadUserFromMe = React.useCallback(async (): Promise<{ user: User; preferences: UserPreferences } | null> => {
    try {
      const me = await api.users.me();
      const name = "name" in me ? (me as { name: string }).name : (me as { fullName?: string }).fullName ?? "";
      if (me?.id != null && me?.email) {
        return mapMeToUserAndPreferences({
          id: String(me.id),
          name,
          email: me.email,
          preferences: (me.preferences ?? {}) as UserPreferences,
        });
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const bootstrapAuth = React.useCallback(async () => {
    const data = await refreshWithCredentials();
    if (data?.accessToken) {
      authTokenRef.current = data.accessToken;
      const fromMe = await loadUserFromMe();
        const user = fromMe?.user ?? null;
        const preferences = fromMe?.preferences ?? null;
      applyPreferences(preferences);
      setState({
        accessToken: data.accessToken,
        user,
        preferences,
        isAuthenticated: true,
        isBootstrapping: false,
        error: null,
      });
    } else {
      setState((prev) => ({ ...prev, isBootstrapping: false }));
    }
  }, [applyPreferences, loadUserFromMe]);

  React.useEffect(() => {
    if (bootstrapDone.current) return;
    bootstrapDone.current = true;

    on401RetryRef.current = async (): Promise<string | null> => {
      const token = await doRefresh();
      if (token) {
        setState((prev) => ({ ...prev, accessToken: token, isAuthenticated: true }));
        return token;
      }
      handleUnauthorized();
      return null;
    };

    onUnauthorizedRef.current = handleUnauthorized;
    void bootstrapAuth();

    return () => {
      on401RetryRef.current = null;
      onUnauthorizedRef.current = null;
    };
  }, [bootstrapAuth, doRefresh, handleUnauthorized]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, error: null, isBootstrapping: false }));

      try {
        const res = await api.auth.login({ email, password });
        if (!res.accessToken) {
          setState((prev) => ({
            ...prev,
            error: "Login não retornou token",
            isAuthenticated: false,
          }));
          return;
        }

        authTokenRef.current = res.accessToken;
        const fromMe = await loadUserFromMe();
        const user = fromMe?.user ?? null;
        const preferences = fromMe?.preferences ?? null;
        applyPreferences(preferences);
        setState({
          accessToken: res.accessToken,
          user,
          preferences,
          isAuthenticated: true,
          isBootstrapping: false,
          error: null,
        });
        router.replace(HOME_PATH);
      } catch (e) {
        const message =
          e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Falha no login";
        setState((prev) => ({
          ...prev,
          error: message,
          isAuthenticated: false,
          isBootstrapping: false,
        }));
      }
    },
    [applyPreferences, loadUserFromMe, router],
  );

  const logout = React.useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignora
    }
    clearSession();
    on401RetryRef.current = null;
    onUnauthorizedRef.current = null;
    router.replace("/login");
  }, [clearSession, router]);

  const refreshSession = React.useCallback(async () => {
    const data = await refreshWithCredentials();
    if (data?.accessToken) {
      authTokenRef.current = data.accessToken;
      const fromMe = await loadUserFromMe();
      setState((prev) => ({
        ...prev,
        accessToken: data.accessToken,
        user: fromMe?.user ?? prev.user,
        preferences: fromMe?.preferences ?? prev.preferences,
        isAuthenticated: true,
      }));
      applyPreferences(fromMe?.preferences ?? null);
    }
  }, [applyPreferences, loadUserFromMe]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshSession,
    setAccessToken,
    bootstrapAuth,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return React.useContext(AuthContext);
}
