"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type FilterMultiSelectOption = {
  /** Identificador estável (ex.: id da entidade em string; pode ser numérico "123" ou UUID). */
  value: string;
  label: string;
  color?: string;
};

type FilterMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options: FilterMultiSelectOption[];
  /** Lista vazia = sem filtro (equivalente a “todas”). */
  placeholder?: string | undefined;
  allLabel?: string | undefined;
  applyLabel?: string | undefined;
  clearLabel?: string | undefined;
  emptyMessage?: string | undefined;
  searchPlaceholder?: string | undefined;
  className?: string | undefined;
  triggerClassName?: string | undefined;
  disabled?: boolean | undefined;
  renderTriggerSummary?: ((ids: string[]) => string) | undefined;
};

/**
 * Multi-select padrão para filtros: busca, chips com remoção, aplicar e limpar.
 * `value` vazio = nenhum filtro ativo (“todas as opções”).
 */
export function FilterMultiSelect({
  value,
  onChange,
  options,
  placeholder: placeholderProp,
  allLabel: allLabelProp,
  applyLabel: applyLabelProp,
  clearLabel: clearLabelProp,
  emptyMessage: emptyMessageProp,
  searchPlaceholder: searchPlaceholderProp,
  className,
  triggerClassName,
  disabled = false,
  renderTriggerSummary,
}: FilterMultiSelectProps) {
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t("filters.selectOneOrMore");
  const allLabel = allLabelProp ?? t("filters.all");
  const applyLabel = applyLabelProp ?? t("filters.apply");
  const clearLabel = clearLabelProp ?? t("filters.clear");
  const emptyMessage = emptyMessageProp ?? t("filters.noOption");
  const searchPlaceholder = searchPlaceholderProp ?? t("filters.search");
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<string[]>(value);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    setPending(value);
  }, [value, open]);

  const isAll = pending.length === 0;
  const appliedSummary =
    value.length === 0
      ? allLabel
      : (renderTriggerSummary?.(value) ??
        t("filters.multiSelectedCount").replace("{count}", String(value.length)));
  const triggerLabel = open ? (isAll ? allLabel : placeholder) : appliedSummary;

  const filteredOptions = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const labelById = React.useMemo(() => {
    const m = new Map<string, string>();
    options.forEach((o) => m.set(o.value, o.label));
    return m;
  }, [options]);

  const toggle = (id: string) => {
    if (pending.length === 0) {
      setPending(options.filter((o) => o.value !== id).map((o) => o.value));
    } else if (pending.includes(id)) {
      setPending(pending.filter((x) => x !== id));
    } else {
      const next = [...pending, id];
      setPending(next.length === options.length ? [] : next);
    }
  };

  const selectAll = () => setPending([]);

  const handleApply = () => {
    onChange(pending);
    setOpen(false);
    setSearch("");
  };

  const handleClearPending = () => {
    setPending([]);
    onChange([]);
    setOpen(false);
    setSearch("");
  };

  const removeChip = (id: string) => {
    const next = value.filter((x) => x !== id);
    onChange(next);
  };

  const clearAllApplied = () => {
    onChange([]);
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 min-w-[140px] items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
              "hover:bg-muted/50 hover:border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
              "disabled:pointer-events-none disabled:opacity-50",
              triggerClassName,
            )}
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="truncate text-left">{triggerLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={6}
        >
          <div className="rounded-xl border bg-popover shadow-lg overflow-hidden">
            <div className="border-b p-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 rounded-lg"
                aria-label={searchPlaceholder}
              />
            </div>
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
                {filteredOptions.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground text-sm">{emptyMessage}</p>
                ) : (
                  filteredOptions.map((opt) => (
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
            <div className="flex gap-2 border-t p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={handleClearPending}
              >
                {clearLabel}
              </Button>
              <Button type="button" className="flex-1 rounded-lg" size="sm" onClick={handleApply}>
                {applyLabel}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {value.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="max-w-full gap-1 pr-1 font-normal"
            >
              <span className="truncate">{labelById.get(id) ?? String(id)}</span>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                onClick={() => removeChip(id)}
                aria-label={`Remover ${labelById.get(id) ?? id}`}
              >
                <X className="h-3 w-3 shrink-0 opacity-70" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={clearAllApplied}
          >
            {clearLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
