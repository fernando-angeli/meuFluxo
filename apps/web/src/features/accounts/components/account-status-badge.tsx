"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

export function AccountStatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation();

  return (
    <Badge
      variant={active ? "success" : "muted"}
      className="rounded-lg font-normal"
    >
      {active ? t("status.active") : t("status.inactive")}
    </Badge>
  );
}

