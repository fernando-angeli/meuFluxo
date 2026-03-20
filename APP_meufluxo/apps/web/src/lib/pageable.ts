import type { PageQueryParams, SortDirection } from "@meufluxo/types";

type BuildPageableParamsInput = {
  page: number;
  size: number;
  sortField?: string | null;
  sortDirection?: SortDirection | "ASC" | "DESC";
};

/**
 * Monta query params no formato esperado pelo Spring Pageable:
 * page=0&size=20&sort=name,ASC
 */
export function buildPageableParams({
  page,
  size,
  sortField,
  sortDirection,
}: BuildPageableParamsInput): PageQueryParams {
  const params: PageQueryParams = {
    page,
    size,
  };

  if (sortField) {
    const direction = String(sortDirection ?? "ASC").toUpperCase();
    params.sort = `${sortField},${direction}`;
  }

  return params;
}
