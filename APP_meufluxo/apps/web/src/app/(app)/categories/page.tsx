"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockCategories } from "@/features/categories/mocks/categories";
import { useTranslation } from "@/lib/i18n";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const byId = new Map(mockCategories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.categories.title")}
        description="Categorias e subcategorias para classificar entradas/saídas."
        right={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleTable
            columns={[
              { key: "name", header: t("table.name") },
              { key: "type", header: t("table.type") },
              { key: "parent", header: t("table.parent") },
              { key: "status", header: t("table.status") },
            ]}
            rows={mockCategories.map((c) => ({
              name: c.name,
              type: c.type,
              parent: c.parentId ? byId.get(c.parentId)?.name ?? c.parentId : "—",
              status: c.isActive ? t("status.active") : t("status.inactive"),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

