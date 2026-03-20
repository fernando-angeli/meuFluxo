export type SortDirection = "asc" | "desc";

/**
 * Contrato paginado retornado pela API (Spring PageResponse).
 * Observacao: `content` e a lista no formato esperado pelo frontend.
 */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type PageQueryParams = {
  page: number;
  size: number;
  sort?: string;
};

