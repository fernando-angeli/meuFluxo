/**
 * Refs para integração HttpClient ↔ Session.
 * Atualizados pelo SessionProvider; usados pelo client HTTP.
 */

export const authTokenRef: { current: string | null } = { current: null };

export function getAuthToken(): string | null {
  return authTokenRef.current;
}

export function setAuthToken(token: string | null): void {
  authTokenRef.current = token;
}

/** Callback chamado em 401; definido pelo SessionProvider para limpar sessão. */
export const onUnauthorizedRef: { current: (() => void) | null } = {
  current: null,
};

/** Chamado no 401 para tentar refresh; deve retornar novo token ou null. Definido pelo AuthProvider. */
export const on401RetryRef: {
  current: (() => Promise<string | null>) | null;
} = { current: null };
