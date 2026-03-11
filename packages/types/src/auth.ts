/** Contratos de auth para integração com API externa (genéricos, sem acoplar a backend). */

export type LoginRequest = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type LoginResponse = {
  token: string;
  user?: User;
  expiresAt?: string; // ISO
};

export type Session = {
  user: User;
  token: string;
  expiresAt?: string;
};
