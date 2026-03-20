"use client";

/**
 * Exibe a mensagem de erro de validação abaixo do campo.
 * Reutilizável em todos os formulários.
 */
export function FormFieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}
