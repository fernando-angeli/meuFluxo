"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation, useLocale, LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  return (
    <div className="space-y-6">
      <PageHeader title={t("pages.settings.title")} description={t("pages.settings.description")} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pages.settings.language")}</CardTitle>
            <CardDescription>Escolha o idioma da interface (PT-BR, EN, ES).</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
              <SelectTrigger className="w-full max-w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pages.settings.workspace.title")}</CardTitle>
            <CardDescription>{t("pages.settings.workspace.description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("pages.settings.workspace.body")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pages.settings.notifications.title")}</CardTitle>
            <CardDescription>{t("pages.settings.notifications.description")}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("pages.settings.notifications.body")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("pages.settings.holidays.title")}</CardTitle>
            <CardDescription>{t("pages.settings.holidays.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/settings/holidays">{t("pages.settings.holidays.action")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

