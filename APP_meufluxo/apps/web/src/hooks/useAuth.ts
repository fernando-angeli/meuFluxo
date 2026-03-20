"use client";

import * as React from "react";

import type { User, UserPreferences } from "@meufluxo/types";
import { useSession, useSessionOptional } from "@/features/auth/session-context";

type AuthShape = {
  accessToken: string | null;
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

function sessionToAuth(session: ReturnType<typeof useSession> | null): AuthShape | null {
  if (!session) return null;
  const data = session.data;
  return {
    accessToken: session.token?.accessToken ?? null,
    user: data ? { id: Number(data.id) || 0, fullName: data.name, email: data.email } : null,
    preferences: (data?.preferences ?? null) as UserPreferences | null,
    isAuthenticated: session.status === "authenticated_ready",
    isBootstrapping:
      session.loading ||
      session.status === "initial" ||
      session.status === "authenticating" ||
      session.status === "authenticated_loading_session",
    error: session.error,
    login: session.login,
    logout: session.logout,
    refreshSession: session.refreshSession,
  };
}

export function useAuth(): AuthShape {
  const session = useSession();
  const auth = React.useMemo(() => sessionToAuth(session), [session]);
  if (!auth) throw new Error("useAuth must be used within SessionProvider");
  return auth;
}

export function useAuthOptional(): AuthShape | null {
  const session = useSessionOptional();
  return React.useMemo(() => sessionToAuth(session), [session]);
}
