/**
 * Extrai mensagem legível de erros vindos de useQuery / mutations (ex.: HttpError do api-client).
 */
export function getQueryErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}
