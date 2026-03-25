"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Category, MovementType } from "@meufluxo/types";
import { TRANSACTION_MOVEMENT_TYPE_LABELS } from "@meufluxo/types";

import { DetailsRow, DetailsSection } from "@/components/details";
import {
  SectionEmptyState,
  SectionErrorState,
  SectionLoadingState,
} from "@/components/patterns";
import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { CategorySubcategoriesPanel } from "@/features/categories/components/category-subcategories-panel";

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  try {
    return format(parseISO(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "Indisponível no momento";
  }
}

function movementLabel(type: MovementType) {
  return TRANSACTION_MOVEMENT_TYPE_LABELS[type] ?? type;
}

export function CategoryDetails({
  category,
  loading = false,
  error = null,
}: {
  category: Category | null;
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return <SectionLoadingState message="Carregando detalhes da categoria..." />;
  }

  if (error) {
    return <SectionErrorState message={error} />;
  }

  if (!category) {
    return (
      <SectionEmptyState message="Selecione uma categoria para visualizar os detalhes." />
    );
  }

  return (
    <div className="space-y-4">
      <DetailsSection title="Resumo" description="Informações principais da categoria">
        <DetailsRow label="Nome" value={category.name} />
        <DetailsRow
          label="Descrição"
          value={
            category.description?.trim() ? category.description : "Não informado"
          }
        />
        <DetailsRow
          label="Tipo de movimento"
          value={movementLabel(category.movementType)}
        />
        <DetailsRow
          label="Status"
          value={<AccountStatusBadge active={!!category.meta.active} />}
        />
        <DetailsRow
          label="Quantidade de subcategorias"
          value={
            typeof category.subCategoryCount === "number"
              ? String(category.subCategoryCount)
              : "Não informado"
          }
        />
      </DetailsSection>

      <DetailsSection title="Metadados" description="Datas de criação e atualização">
        <DetailsRow label="Criado em" value={formatDateTime(category.meta.createdAt)} />
        <DetailsRow label="Atualizado em" value={formatDateTime(category.meta.updatedAt)} />
      </DetailsSection>

      <CategorySubcategoriesPanel category={category} />
    </div>
  );
}
