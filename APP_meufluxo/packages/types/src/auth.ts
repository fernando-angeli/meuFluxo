/** Contratos de auth para integração com a API. */

export type LoginRequest = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
};

export type UserPreferences = {
  theme?: "light" | "dark" | "system";
  language?: string;
  [key: string]: unknown;
};

/** Resposta de POST /auth/login — apenas token. Dados do usuário vêm de GET /users/me. */
export type LoginResponse = {
  accessToken: string;
  expiresIn?: number;
  tokenType?: string;
};

/** Resposta de POST /auth/refresh — apenas token. Dados do usuário vêm de GET /users/me. */
export type RefreshResponse = LoginResponse;
