"use client";

import * as React from "react";

import type { Holiday } from "@meufluxo/types";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/DataTable";
import { useAuthOptional } from "@/hooks/useAuth";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { getQueryErrorMessage } from "@/lib/query-error";
import { fetchHolidaysPage } from "@/features/holidays/holidays.service";
import { getHolidaysColumns } from "@/features/holidays/holidays.columns";
import { useTranslation } from "@/lib/i18n";

const holidaysQueryKey = ["holidays"] as const;

export default function HolidaysSettingsPage() {
  const auth = useAuthOptional();
  const { t } = useTranslation();
  const columns = React.useMemo(() => getHolidaysColumns(), []);

  const holidaysTable = useServerDataTable<Holiday>({
    queryKey: holidaysQueryKey,
    fetchPage: fetchHolidaysPage,
    initialPageSize: 20,
    initialSortKey: "holidayDate",
    initialDirection: "asc",
    enabled: !auth?.isBootstrapping && !!auth?.isAuthenticated,
  });

  const pageResponse = holidaysTable.pageResponseQuery.data ?? null;
  const holidays = pageResponse?.content ?? [];
  const errorMessage = holidaysTable.pageResponseQuery.isError
    ? getQueryErrorMessage(
        holidaysTable.pageResponseQuery.error,
        "Não foi possível carregar os feriados.",
      )
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("holidays.page.title")}
        description={t("holidays.page.description")}
      />

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("holidays.page.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={holidays}
            loading={holidaysTable.pageResponseQuery.isLoading}
            error={errorMessage}
            pageResponse={pageResponse}
            sortState={{
              sortKey: holidaysTable.sortKey,
              direction: holidaysTable.direction,
            }}
            onSortChange={holidaysTable.onSortChange}
            onPageChange={holidaysTable.onPageChange}
            onPageSizeChange={holidaysTable.onPageSizeChange}
            getRowKey={(row) => row.id}
            emptyTitle={t("holidays.page.emptyTitle")}
            emptyDescription={t("holidays.page.emptyDescription")}
            pageSizeOptions={[10, 20, 50]}
          />
        </CardContent>
      </Card>
    </section>
  );
}
