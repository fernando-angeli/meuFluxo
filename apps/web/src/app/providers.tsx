"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { SessionProvider } from "@/features/auth/session-context";
import { ToastProvider } from "@/components/toast";
import { I18nProvider } from "@/lib/i18n";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <I18nProvider>
            <ToastProvider>
              <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
            </ToastProvider>
          </I18nProvider>
        </SessionProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

