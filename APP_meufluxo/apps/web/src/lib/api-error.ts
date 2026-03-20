/**
 * Tipos e utilitários para erros de validação retornados pela API.
 * Reutilizável em todos os formulários de cadastro e edição.
 */

export type FieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  title: string;
  detail: string;
  path: string;
  errors?: FieldError[];
};

/**
 * Converte errors[] da API em mapa por campo (field -> message).
 */
export function mapApiFieldErrors(errors?: FieldError[]): Record<string, string> {
  if (!errors || errors.length === 0) return {};

  return errors.reduce<Record<string, string>>((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {});
}

/**
 * Tipo do erro lançado pelo HttpClient do api-client (details contém o body da resposta).
 */
type HttpErrorLike = {
  status?: number;
  message?: string;
  details?: unknown;
};

function isApiErrorShape(details: unknown): details is ApiErrorResponse {
  return (
    typeof details === "object" &&
    details !== null &&
    "detail" in details &&
    typeof (details as ApiErrorResponse).detail === "string"
  );
}

/**
 * Extrai ApiErrorResponse do erro lançado pelo client HTTP.
 * Se o backend retornou o formato padrão (timestamp, status, title, detail, path, errors[]),
 * retorna esse objeto; caso contrário monta um erro geral a partir de message.
 */
export function extractApiError(error: unknown): ApiErrorResponse | null {
  if (error === null || error === undefined) return null;

  const err = error as HttpErrorLike;
  const details = err?.details;

  if (isApiErrorShape(details)) {
    return details;
  }

  const message =
    typeof err?.message === "string"
      ? err.message
      : "Ocorreu um erro ao processar a requisição.";

  return {
    timestamp: new Date().toISOString(),
    status: err?.status ?? 400,
    title: "Erro",
    detail: message,
    path: "",
  };
}

/**
 * Retorna classes CSS para input com estado de erro (borda e ring vermelhos).
 */
export function getInputErrorClass(error?: string | null): string {
  return error
    ? "border-destructive focus-visible:ring-destructive"
    : "";
}
