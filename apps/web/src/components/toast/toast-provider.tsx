"use client";

import * as React from "react";

type ToastVariant = "success" | "error" | "default";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastContextValue = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  toast: (options: ToastOptions) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `toast_${Date.now()}_${Math.random()}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<
    Array<ToastOptions & { id: string; variant: ToastVariant }>
  >([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = React.useCallback(
    (options: ToastOptions) => {
      const id = createId();
      const variant = options.variant ?? "default";
      const durationMs = options.durationMs ?? 3200;

      setToasts((prev) => [
        ...prev,
        {
          id,
          variant,
          title: options.title,
          description: options.description,
          durationMs,
        },
      ]);

      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast],
  );

  const value = React.useMemo<ToastContextValue>(
    () => ({
      toast: pushToast,
      success: (title, description) =>
        pushToast({ title, description, variant: "success" }),
      error: (title, description) =>
        pushToast({ title, description, variant: "error" }),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto w-full max-w-sm rounded-xl border bg-background p-3 shadow-lg",
              t.variant === "success" && "border-emerald-500/30",
              t.variant === "error" && "border-destructive/30",
              t.variant === "default" && "border-border",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description ? (
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar toast"
                onClick={() => removeToast(t.id)}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }
  return ctx;
}

