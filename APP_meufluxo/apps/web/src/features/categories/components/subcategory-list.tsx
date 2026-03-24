"use client";

import type { SubCategory } from "@meufluxo/types";

import { AccountStatusBadge } from "@/features/accounts/components/account-status-badge";
import { SubcategoryRowActions } from "@/features/categories/components/subcategory-row-actions";

type SubcategoryListProps = {
  rows: SubCategory[];
  onEdit: (s: SubCategory) => void;
  onDelete: (s: SubCategory) => void;
  deletingId: string | null;
  isDeletePending: boolean;
};

/**
 * Mini-tabela de subcategorias (uso dentro da linha expandida da categoria).
 */
export function SubcategoryList({
  rows,
  onEdit,
  onDelete,
  deletingId,
  isDeletePending,
}: SubcategoryListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-left text-xs font-medium text-muted-foreground">
            <th className="px-3 py-2">Nome</th>
            <th className="px-3 py-2">Descrição</th>
            <th className="px-3 py-2">Status</th>
            <th className="w-[88px] px-2 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sub) => (
            <tr
              key={sub.id}
              className="border-b border-border/60 last:border-0 hover:bg-accent/30"
            >
              <td className="px-3 py-2 font-medium">{sub.name}</td>
              <td className="px-3 py-2 text-muted-foreground">
                {sub.description?.trim() ? sub.description : "—"}
              </td>
              <td className="px-3 py-2">
                <AccountStatusBadge active={!!sub.meta.active} />
              </td>
              <td className="px-2 py-1">
                <SubcategoryRowActions
                  subcategory={sub}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDeleting={isDeletePending && deletingId === sub.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
