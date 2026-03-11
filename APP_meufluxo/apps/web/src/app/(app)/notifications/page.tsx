"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockNotifications } from "@/features/notifications/mocks/notifications";
import { useTranslation } from "@/lib/i18n";

export default function NotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <PageHeader title={t("pages.notifications.title")} description={t("pages.notifications.description")} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Inbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockNotifications.map((n, idx) => (
            <div key={n.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                </div>
                <div className="text-xs text-muted-foreground">{n.status}</div>
              </div>
              {idx < mockNotifications.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

