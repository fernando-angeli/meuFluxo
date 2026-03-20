import type { AuthenticatedUserSessionResponse } from "@meufluxo/types";

export type AuthStatus =
  | "initial"
  | "unauthenticated"
  | "authenticating"
  | "authenticated_loading_session"
  | "authenticated_ready"
  | "auth_error"
  | "session_expired";

export type TokenMeta = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
};

export type SessionData = AuthenticatedUserSessionResponse;

export type SessionState = {
  authStatus: AuthStatus;
  error: string | null;
  loading: boolean;
  token: TokenMeta | null;
  data: SessionData | null;
};

export const initialSessionState: SessionState = {
  authStatus: "initial",
  error: null,
  loading: true,
  token: null,
  data: null,
};
