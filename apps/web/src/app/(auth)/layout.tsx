import type { Metadata } from "next";

import { AuthLayoutRedirect } from "@/components/auth/auth-layout-redirect";

export const metadata: Metadata = {
  title: "MeuFluxo • Acesso",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutRedirect>
      <div className="min-h-dvh bg-background">
        <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </AuthLayoutRedirect>
  );
}

