"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { HOME_PATH } from "@/lib/navigation";
import { api } from "@/services/api";
import { authTokenRef, on401RetryRef, onUnauthorizedRef } from "@/lib/auth-token";
import { refreshWithCredentials } from "@/services/auth.service";
import type { SessionData, SessionState, AuthStatus, TokenMeta } from "./session-types";
import { initialSessionState } from "./session-types";
import type { LoginResponse, UserTheme, WorkspaceSummary } from "@meufluxo/types";
import { normalizeUserTheme, userPreferencesFromThemePatchResponse, userThemeToApi } from "@meufluxo/types";

type SessionContextValue = SessionState & {
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  loadSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => void;
  clearSession: () => void;
  setActiveWorkspace: (workspaceId: string | null) => void;
  /** PATCH tema no backend; atualiza `data.preferences` em caso de sucesso. */
  persistTheme: (theme: UserTheme) => Promise<void>;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }

  return fallback;
}

function getErrorStatus(error: unknown): number {
  if (error && typeof error === "object" && "status" in error) {
    return Number((error as { status: number }).status);
  }

  return 0;
}

function buildTokenMeta(response: LoginResponse): TokenMeta {
  const expiresIn = response.expiresIn ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType ?? "Bearer",
    expiresIn,
    expiresAt,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [state, setState] = React.useState<SessionState>(initialSessionState);
  const initialLoadDone = React.useRef(false);

  const applyPreferences = React.useCallback(
    (data: SessionData | null) => {
      const theme = data?.preferences.theme;
      if (theme) {
        setTheme(normalizeUserTheme(theme));
      }
    },
    [setTheme],
  );

  const clearSession = React.useCallback(() => {
    authTokenRef.current = null;
    setState({
      ...initialSessionState,
      authStatus: "unauthenticated",
      loading: false,
    });
  }, []);

  const applySession = React.useCallback(
    (token: TokenMeta, data: SessionData) => {
      authTokenRef.current = token.accessToken;
      applyPreferences(data);
      setState({
        authStatus: "authenticated_ready",
        loading: false,
        error: null,
        token,
        data,
      });
    },
    [applyPreferences],
  );

  const handleSessionExpired = React.useCallback(() => {
    authTokenRef.current = null;
    setState({
      ...initialSessionState,
      authStatus: "session_expired",
      loading: false,
    });
    // Não redireciona aqui: o `ProtectedRoute` observa `isBootstrapping`/`isAuthenticated`
    // e decide a navegação apenas quando a checagem inicial terminar.
  }, [router]);

  const refreshWithToken = React.useCallback(
    async (token: TokenMeta, fallbackData: SessionData | null, source: "login" | "restore" | "refresh") => {
      authTokenRef.current = token.accessToken;

      try {
        const me = await api.users.me();
        applySession(token, me);
        return me;
      } catch (error) {
        const status = getErrorStatus(error);
        const message = getErrorMessage(error, "Falha ao carregar sessão");

        if (status === 401) {
          handleSessionExpired();
          return null;
        }

        if (source === "login") {
          authTokenRef.current = null;
          setState({
            ...initialSessionState,
            authStatus: "auth_error",
            loading: false,
            error: message,
          });
          return null;
        }

        if (fallbackData) {
          applyPreferences(fallbackData);
          setState({
            authStatus: "authenticated_ready",
            loading: false,
            error: message,
            token,
            data: fallbackData,
          });
          return fallbackData;
        }

        authTokenRef.current = null;
        setState({
          ...initialSessionState,
          authStatus: "auth_error",
          loading: false,
          error: message,
        });
        return null;
      }
    },
    [applyPreferences, applySession, handleSessionExpired],
  );

  /** Bootstrap: tenta POST /auth/refresh (cookie), depois GET /users/me. Token só em memória. */
  const loadSession = React.useCallback(async () => {
    try {
      const refreshData = await refreshWithCredentials();
      if (!refreshData?.accessToken) {
        authTokenRef.current = null;
        setState({
          ...initialSessionState,
          authStatus: "unauthenticated",
          loading: false,
        });
        return;
      }

      const token = buildTokenMeta(refreshData);
      authTokenRef.current = token.accessToken;
      setState({
        authStatus: "authenticated_loading_session",
        loading: true,
        error: null,
        token,
        data: null,
      });

      await refreshWithToken(token, null, "restore");
    } catch {
      authTokenRef.current = null;
      setState({
        ...initialSessionState,
        authStatus: "unauthenticated",
        loading: false,
      });
    }
  }, [handleSessionExpired, refreshWithToken]);

  const doRefresh = React.useCallback(async (): Promise<string | null> => {
    const data = await refreshWithCredentials();
    if (!data?.accessToken) return null;
    const token = buildTokenMeta(data);
    authTokenRef.current = token.accessToken;
    setState((prev) => (prev.token ? { ...prev, token } : prev));
    return token.accessToken;
  }, []);

  const refreshPromiseRef = React.useRef<Promise<string | null> | null>(null);
  const on401Retry = React.useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    const p = doRefresh()
      .then((t) => {
        refreshPromiseRef.current = null;
        return t;
      })
      .catch(() => {
        refreshPromiseRef.current = null;
        return null;
      });
    refreshPromiseRef.current = p;
    return p;
  }, [doRefresh]);

  React.useEffect(() => {
    if (initialLoadDone.current) return;

    initialLoadDone.current = true;
    on401RetryRef.current = on401Retry;
    onUnauthorizedRef.current = handleSessionExpired;
    void loadSession();

    return () => {
      on401RetryRef.current = null;
      onUnauthorizedRef.current = null;
    };
  }, [handleSessionExpired, loadSession, on401Retry]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      setState((previous) => ({
        ...previous,
        authStatus: "authenticating",
        loading: true,
        error: null,
      }));

      try {
        const response = await api.auth.login({ email, password });
        if (!response.accessToken) {
          setState({
            ...initialSessionState,
            authStatus: "auth_error",
            loading: false,
            error: "Login não retornou token",
          });
          return;
        }

        const token = buildTokenMeta(response);
        authTokenRef.current = token.accessToken;

        setState({
          authStatus: "authenticated_loading_session",
          loading: true,
          error: null,
          token,
          data: null,
        });

        const session = await refreshWithToken(token, null, "login");
        if (session) {
          router.replace(HOME_PATH);
        }
      } catch (error) {
        setState({
          ...initialSessionState,
          authStatus: "auth_error",
          loading: false,
          error: getErrorMessage(error, "Falha no login"),
        });
      }
    },
    [refreshWithToken, router],
  );

  const refreshSession = React.useCallback(async () => {
    if (!state.token) return;

    setState((previous) => ({
      ...previous,
      authStatus: "authenticated_loading_session",
      loading: true,
      error: null,
    }));

    await refreshWithToken(state.token, state.data, "refresh");
  }, [refreshWithToken, state.data, state.token]);

  const setActiveWorkspace = React.useCallback((workspaceId: string | null) => {
    setState((previous) => {
      if (!previous.data) return previous;

      const selectedWorkspace = workspaceId
        ? previous.data.workspaces.find((workspace) => workspace.id === workspaceId)
        : null;

      const activeWorkspace: WorkspaceSummary | null = selectedWorkspace
        ? { id: selectedWorkspace.id, name: selectedWorkspace.name }
        : null;

      const nextData: SessionData = {
        ...previous.data,
        activeWorkspace,
      };

      return {
        ...previous,
        data: nextData,
      };
    });
  }, []);

  const persistTheme = React.useCallback(
    async (theme: UserTheme) => {
      const userId = state.data?.id;
      if (!userId) return;
      const raw = await api.users.patchThemePreference(userId, { theme: userThemeToApi(theme) });
      const preferences = userPreferencesFromThemePatchResponse(raw);
      setState((previous) => ({
        ...previous,
        data: previous.data ? { ...previous.data, preferences } : null,
      }));
    },
    [state.data?.id],
  );

  const logout = React.useCallback(() => {
    on401RetryRef.current = null;
    onUnauthorizedRef.current = null;
    clearSession();
    api.auth.logout().catch(() => {});
    router.replace("/login");
  }, [clearSession, router]);

  const value: SessionContextValue = {
    ...state,
    status: state.authStatus,
    login,
    loadSession,
    refreshSession,
    logout,
    clearSession,
    setActiveWorkspace,
    persistTheme,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}

export function useSessionOptional(): SessionContextValue | null {
  return React.useContext(SessionContext);
}

