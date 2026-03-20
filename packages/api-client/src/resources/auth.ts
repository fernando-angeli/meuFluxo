import type { LoginRequest, LoginResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type AuthApi = {
  login: (body: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
};

export function createAuthApi(http: HttpClient): AuthApi {
  return {
    login: (body) =>
      http.request<LoginResponse>("/auth/login", { method: "POST", body }),
    logout: () => http.request<void>("/auth/logout", { method: "POST" }),
  };
}
