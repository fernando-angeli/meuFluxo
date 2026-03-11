"use client";

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
            <CardTitle className="text-base">Workspace</CardTitle>
            <CardDescription>Nome, moeda e membros (em breve).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Estrutura pronta para multiusuário e permissão por role.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificações</CardTitle>
            <CardDescription>In-app e integrações futuras (WhatsApp).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Canal WhatsApp previsto no domínio, mas ainda não implementado.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

