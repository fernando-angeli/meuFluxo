"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

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
  color?: string;
};

type MultiSelectDropdownProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  allLabel?: string;
  applyLabel?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
};

/**
 * Multi-select com checkboxes, scroll interno, contador no campo e botão Aplicar.
 * value = [] significa "todos" (nenhum filtro). Se nenhuma opção selecionada ao aplicar, não envia filtro.
 */
export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Selecionar",
  allLabel = "Todas",
  applyLabel = "Aplicar",
  emptyMessage = "Nenhuma opção",
  className,
  triggerClassName,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string[]>(value);

  React.useEffect(() => {
    setPending(value);
  }, [value, open]);

  const isAll = pending.length === 0;
  const displayText = isAll
    ? allLabel
    : pending.length === 1
      ? options.find((o) => o.value === pending[0])?.label ?? `${pending.length} selecionada(s)`
      : `${pending.length} selecionadas`;

  const toggle = (id: string) => {
    if (pending.length === 0) {
      setPending(options.filter((o) => o.value !== id).map((o) => o.value));
    } else if (pending.includes(id)) {
      const next = pending.filter((x) => x !== id);
      setPending(next);
    } else {
      const next = [...pending, id];
      setPending(next.length === options.length ? [] : next);
    }
  };

  const selectAll = () => setPending([]);

  const handleApply = () => {
    onChange(pending);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
            "hover:bg-muted/50 hover:border-input",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
            triggerClassName,
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", className)}
        align="start"
        sideOffset={6}
      >
        <div className="rounded-xl border bg-popover shadow-lg overflow-hidden">
          <div className="p-1.5 border-b bg-muted/30">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent"
              onClick={selectAll}
            >
              <Checkbox checked={isAll} onCheckedChange={selectAll} />
              <span>{allLabel}</span>
            </button>
          </div>
          <ScrollArea className="h-[220px]">
            <div className="p-1">
              {options.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground text-sm">
                  {emptyMessage}
                </p>
              ) : (
                options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent"
                  >
                    <Checkbox
                      checked={isAll || pending.includes(opt.value)}
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
          <div className="border-t p-2">
            <Button
              type="button"
              className="w-full rounded-lg"
              size="sm"
              onClick={handleApply}
            >
              {applyLabel}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
