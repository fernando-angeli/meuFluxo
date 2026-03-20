import type { ReactNode } from "react";

import type { SortDirection } from "@meufluxo/types";

export type DataTableAlign = "left" | "center" | "right";

export type DataTableColumn<T> = {
  /** Id unico da coluna (usado em headers). */
  key: string;
  /** Titulo do header. */
  title: ReactNode;
  /** Campo de onde tirar valor (quando `render` nao for fornecido). */
  dataIndex?: keyof T;
  /** Renderiza celula customizada. */
  render?: (row: T) => ReactNode;
  /** Permite ordenar por este campo no backend. */
  sortable?: boolean;
  /** Chave do backend para ordenar (ex.: `name`, `currentBalance`). */
  sortKey?: string;
  align?: DataTableAlign;
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
};

export type DataTableSortState = {
  sortKey: string | null;
  direction: SortDirection;
};

