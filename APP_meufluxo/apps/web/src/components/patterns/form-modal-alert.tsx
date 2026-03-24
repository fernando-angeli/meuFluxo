"use client";

/**
 * Banner de erro genérico para modais de formulário (validação/API).
 */
export function FormModalAlert({ message }: { message: string }) {
  return (
    <div
      className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
    >
      {message}
    </div>
  );
}
