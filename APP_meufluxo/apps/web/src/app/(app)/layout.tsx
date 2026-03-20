import type { Metadata } from "next";

import { ProtectedLayout } from "@/components/auth/protected-layout";

export const metadata: Metadata = {
  title: "MeuFluxo",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

