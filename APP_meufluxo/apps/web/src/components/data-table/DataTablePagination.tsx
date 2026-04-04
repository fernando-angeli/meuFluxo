"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function DataTablePagination({
  page,
  size,
  totalElements,
  totalPages,
  first,
  last,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: {
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}) {
  const rangeStart = totalElements === 0 ? 0 : page * size + 1;
  const rangeEnd = Math.min(totalElements, (page + 1) * size);
  const safeTotalPages = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(0, page), safeTotalPages - 1);
  const goToPage = React.useCallback(
    (nextPage: number) => {
      const clamped = Math.min(Math.max(0, nextPage), safeTotalPages - 1);
      onPageChange(clamped);
    },
    [onPageChange, safeTotalPages],
  );

  const visiblePages = React.useMemo(() => {
    const maxVisible = 5;
    if (safeTotalPages <= maxVisible) {
      return Array.from({ length: safeTotalPages }, (_, i) => i);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, currentPage - half);
    let end = start + maxVisible - 1;
    if (end >= safeTotalPages) {
      end = safeTotalPages - 1;
      start = end - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, safeTotalPages]);

  return (
    <div
      className={cn(
        "grid gap-3 rounded-xl border bg-card px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground md:justify-self-start">
        <span>Mostrando</span>
        <Select
          value={String(size)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 w-[120px] rounded-full px-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt} / página
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center gap-1.5 md:justify-self-center">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Página anterior"
            onClick={() => goToPage(currentPage - 1)}
            disabled={first}
            className="h-8 w-8 rounded-full px-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((pageIndex) => {
            const active = pageIndex === currentPage;
            return (
              <Button
                key={pageIndex}
                type="button"
                size="sm"
                variant={active ? "default" : "ghost"}
                onClick={() => onPageChange(pageIndex)}
                className={cn(
                  "h-8 w-8 rounded-full px-0",
                  active
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {pageIndex + 1}
              </Button>
            );
          })}

          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Próxima página"
            onClick={() => goToPage(currentPage + 1)}
            disabled={last}
            className="h-8 w-8 rounded-full px-0 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
      </div>

      <div className="text-sm text-muted-foreground md:justify-self-end">
        {rangeStart}-{rangeEnd} de {totalElements} linhas
      </div>
    </div>
  );
}

