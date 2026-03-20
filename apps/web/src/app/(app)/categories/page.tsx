"use client";

import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { SimpleTable } from "@/components/tables/simple-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories, useSubCategories } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const { data: subCategories = [] } = useSubCategories();

  const rows = [
    ...categories.map((category) => ({
      name: category.name,
      type: category.movementType,
      parent: "—",
      status: category.meta.active ? t("status.active") : t("status.inactive"),
    })),
    ...subCategories.map((subCategory) => ({
      name: subCategory.name,
      type: subCategory.movementType,
      parent: subCategory.category.name,
      status: subCategory.meta.active ? t("status.active") : t("status.inactive"),
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.categories.title")}
        description="Categorias e subcategorias para classificar entradas e saídas."
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
            rows={rows}
          />
        </CardContent>
      </Card>
    </div>
  );
}
