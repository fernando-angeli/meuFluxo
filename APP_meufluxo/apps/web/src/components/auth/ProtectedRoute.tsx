"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/layout/app-shell";
import { HOME_PATH } from "@/lib/navigation";

const PUBLIC_PATHS = ["/login"];

/**
 * Protege rotas: durante bootstrap mostra loading; se não autenticado redireciona para /login;
 * se autenticado em /login redireciona para home.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isBootstrapping) return;

    if (!isAuthenticated) {
      if (!PUBLIC_PATHS.includes(pathname ?? "")) {
        router.replace("/login");
      }
      return;
    }

    if (pathname === "/login") {
      router.replace(HOME_PATH);
    }
  }, [isAuthenticated, isBootstrapping, pathname, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Carregando"
        />
      </div>
    );
  }

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname ?? "")) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
