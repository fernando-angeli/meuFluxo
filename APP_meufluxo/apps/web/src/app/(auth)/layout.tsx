import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MeuFluxo • Acesso",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-md items-center px-4">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

