import type { AuthenticatedUserSessionResponse } from "@meufluxo/types";

const SESSION_STORAGE_KEY = "meufluxo_session";

export type StoredToken = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
};

export type StoredSession = {
  token: StoredToken;
  sessionCache: AuthenticatedUserSessionResponse | null;
};

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getStoredSession(): StoredSession | null {
  const raw = safeGetItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession | null): void {
  if (session === null) {
    safeRemoveItem(SESSION_STORAGE_KEY);
    return;
  }

  safeSetItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredToken(): string | null {
  return getStoredSession()?.token.accessToken ?? null;
}

export function setStoredToken(token: StoredToken | null): void {
  const session = getStoredSession();
  if (token === null) {
    setStoredSession(null);
    return;
  }

  setStoredSession({
    token,
    sessionCache: session?.sessionCache ?? null,
  });
}

export function getSessionCache(): AuthenticatedUserSessionResponse | null {
  return getStoredSession()?.sessionCache ?? null;
}

export function setSessionCache(data: AuthenticatedUserSessionResponse | null): void {
  const session = getStoredSession();
  if (!session?.token) {
    if (data === null) {
      setStoredSession(null);
    }
    return;
  }

  setStoredSession({
    token: session.token,
    sessionCache: data,
  });
}

export function clearSessionStorage(): void {
  safeRemoveItem(SESSION_STORAGE_KEY);
}
