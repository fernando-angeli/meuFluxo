"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** Opcional: cor (hex) para indicador */
  color?: string;
};

type MultiSelectPopoverProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  /** Quando vazio = "todos". Texto do botão quando nenhum selecionado */
  allLabel?: string;
};

/**
 * Multi-select reutilizável com popover e checkboxes.
 * value = [] significa "todos selecionados" (nenhum filtro).
 */
export function MultiSelectPopover({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  emptyMessage = "Nenhuma opção",
  className,
  triggerClassName,
  allLabel = "Todos",
}: MultiSelectPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const isAll = value.length === 0;
  const displayLabel = isAll
    ? allLabel
    : value.length === 1
      ? options.find((o) => o.value === value[0])?.label ?? `${value.length} selecionado(s)`
      : `${value.length} selecionado(s)`;

  const toggle = (id: string) => {
    const isAll = value.length === 0;
    if (isAll) {
      // Estava "todos"; desmarcar este = selecionar todos os outros
      onChange(options.filter((o) => o.value !== id).map((o) => o.value));
    } else if (value.includes(id)) {
      const next = value.filter((x) => x !== id);
      onChange(next.length === 0 ? [] : next);
    } else {
      const next = [...value, id];
      // Normaliza: se passou a ter todos, usa [] para exibir "Todos"
      onChange(next.length === options.length ? [] : next);
    }
  };

  const selectAll = () => {
    onChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-9 w-full justify-between font-normal min-w-[140px]",
            triggerClassName,
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)} align="start">
        <div className="p-1.5 border-b">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start text-muted-foreground"
            onClick={() => {
              selectAll();
              setOpen(false);
            }}
          >
            <Check className={cn("mr-2 h-4 w-4", isAll ? "opacity-100" : "opacity-0")} />
            {allLabel}
          </Button>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            {options.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground text-sm">{emptyMessage}</p>
            ) : (
              options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm py-2 px-2 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={value.length === 0 ? true : value.includes(opt.value)}
                    onCheckedChange={() => toggle(opt.value)}
                  />
                  {opt.color != null && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span className="truncate">{opt.label}</span>
                </label>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
