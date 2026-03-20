"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthOptional } from "@/hooks/useAuth";
import { HOME_PATH } from "@/lib/navigation";

/** Em layout (auth): redireciona para home se já autenticado; evita usuário logado acessar /login. */
export function AuthLayoutRedirect({ children }: { children: React.ReactNode }) {
  const auth = useAuthOptional();
  const router = useRouter();

  useEffect(() => {
    if (auth?.isAuthenticated && !auth?.isBootstrapping) {
      router.replace(HOME_PATH);
    }
  }, [auth?.isAuthenticated, auth?.isBootstrapping, router]);

  if (auth?.isAuthenticated && !auth?.isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

