import type { LoginRequest, LoginResponse, User } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type AuthApi = {
  login: (body: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  me: () => Promise<User | null>;
};

export function createAuthApi(http: HttpClient): AuthApi {
  return {
    login: (body) => http.request<LoginResponse>("/auth/login", { method: "POST", body }),
    logout: () => http.request<void>("/auth/logout", { method: "POST" }),
    me: () => http.request<User | null>("/auth/me", { method: "GET" }),
  };
}
