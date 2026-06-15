export const env = {
  /** Base URL da API externa. Ex.: http://localhost:8088/api */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8088/api",
  /**
   * Só usa mocks se NEXT_PUBLIC_USE_MOCKS for exatamente "true".
   * Caso contrário, todas as chamadas vão para a API real (padrão).
   */
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
};

