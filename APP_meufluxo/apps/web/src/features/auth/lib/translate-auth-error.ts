import type { TranslationKey } from "@/lib/i18n";

function normalizeAuthErrorMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\.+$/g, "");
}

/** Mensagens conhecidas da API (inglês) ou textos fixos do cliente (pt) → chave do dicionário. */
const AUTH_ERROR_NORMALIZED_TO_KEY: Record<string, TranslationKey> = {
  "invalid email or password": "auth.error.invalidCredentials",
  "authentication is required or the provided token is invalid": "auth.error.authenticationRequired",
  "one or more fields are invalid": "auth.error.validationFields",
  "login não retornou token": "auth.error.noToken",
  "falha ao carregar sessão": "auth.error.sessionLoadFailed",
  "falha no login": "auth.error.loginFailed",
  "falha na conexão com o servidor": "auth.error.connectionFailed",
  "erro de conexão": "auth.error.genericConnection",
  "erro de requisição": "auth.error.requestFailed",
};

export function translateAuthDisplayError(
  error: string | null,
  translate: (key: TranslationKey) => string,
): string | null {
  if (!error) return null;
  const key = AUTH_ERROR_NORMALIZED_TO_KEY[normalizeAuthErrorMessage(error)];
  if (key) return translate(key);
  return error;
}
