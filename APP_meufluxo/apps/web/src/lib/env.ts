export const env = {
  /** Base URL da API externa. Ex.: http://localhost:8080/api */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  /**
   * true = usa mocks (não chama a API).
   * false = chama a API real.
   * Default true para você visualizar e implementar rota por rota.
   */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",
};

