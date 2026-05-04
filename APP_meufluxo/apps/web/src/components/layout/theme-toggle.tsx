"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import type { UserTheme } from "@meufluxo/types";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { useSessionOptional } from "@/features/auth/session-context";
import { useTranslation } from "@/lib/i18n";
import { getQueryErrorMessage } from "@/lib/query-error";

export function ThemeToggle() {
  const { t } = useTranslation();
  const toast = useToast();
  const session = useSessionOptional();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  const [saving, setSaving] = React.useState(false);

  const onToggle = React.useCallback(async () => {
    const next: UserTheme = current === "dark" ? "light" : "dark";
    setTheme(next);
    if (session?.status !== "authenticated_ready" || !session.data?.id) return;
    setSaving(true);
    try {
      await session.persistTheme(next);
    } catch (err) {
      toast.error(getQueryErrorMessage(err, "Não foi possível salvar o tema."));
    } finally {
      setSaving(false);
    }
  }, [current, session, setTheme, toast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("theme.toggle")}
      disabled={saving}
      onClick={() => void onToggle()}
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="hidden h-4 w-4 dark:block" />
    </Button>
  );
}

