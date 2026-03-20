"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        Mostrando {rangeStart}–{rangeEnd} de {totalElements} registros
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Primeira página"
            onClick={() => onPageChange(0)}
            disabled={first}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Página anterior"
            onClick={() => onPageChange(page - 1)}
            disabled={first}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Página anterior"
            onClick={() => onPageChange(page - 1)}
            disabled={first}
            className="sm:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[110px] text-center text-sm text-muted-foreground">
            Página {page + 1} de {Math.max(1, totalPages)}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Próxima página"
            onClick={() => onPageChange(page + 1)}
            disabled={last}
            className="sm:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Próxima página"
            onClick={() => onPageChange(page + 1)}
            disabled={last}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Última página"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={last}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página</span>
          <Select
            value={String(size)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-9 w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

