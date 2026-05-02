"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import type { PageQueryParams, PageResponse, SortDirection } from "@meufluxo/types";
import { buildPageableParams } from "@/lib/pageable";

export function useServerDataTable<T>({
  queryKey,
  fetchPage,
  initialPageSize = 20,
  initialSortKey = null,
  initialDirection = "asc",
  enabled = true,
  extraQueryParams,
}: {
  queryKey: readonly unknown[];
  fetchPage: (
    params: PageQueryParams & {
      [key: string]: unknown;
    },
  ) => Promise<PageResponse<T>>;
  initialPageSize?: number;
  initialSortKey?: string | null;
  initialDirection?: SortDirection;
  enabled?: boolean;
  extraQueryParams?: Record<string, unknown>;
}) {
  const [page, setPage] = React.useState(0); // 0-based
  const [size, setSize] = React.useState(initialPageSize);

  const [sortKey, setSortKey] = React.useState<string | null>(initialSortKey);
  const [direction, setDirection] = React.useState<SortDirection>(initialDirection);

  const extraKey = React.useMemo(
    () => JSON.stringify(extraQueryParams ?? {}),
    [extraQueryParams],
  );

  React.useLayoutEffect(() => {
    setPage(0);
  }, [extraKey]);

  const pageResponseQuery = useQuery<PageResponse<T>, unknown>({
    queryKey: [...queryKey, page, size, sortKey, direction, extraKey] as const,
    queryFn: () =>
      fetchPage({
        ...buildPageableParams({
          page,
          size,
          sortField: sortKey,
          sortDirection: direction,
        }),
        ...(extraQueryParams ?? {}),
      }),
    enabled,
  });

  const onPageChange = React.useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const onPageSizeChange = React.useCallback((nextSize: number) => {
    setSize(nextSize);
    setPage(0);
  }, []);

  const onSortChange = React.useCallback(
    (nextSortKey: string) => {
      setPage(0);
      if (sortKey === nextSortKey) {
        setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }
      setSortKey(nextSortKey);
      setDirection("asc");
    },
    [sortKey],
  );

  const onReset = React.useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    size,
    sortKey,
    direction,
    pageResponseQuery,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onReset,
  };
}

