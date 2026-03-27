"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterSelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type FilterSelectProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  options: FilterSelectOption<T>[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
};

/**
 * Select único reutilizável para filtros.
 * Estilo: bordas arredondadas, sombra leve no dropdown, seta à direita, estados hover/focus.
 */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Selecionar",
  className,
  triggerClassName,
  disabled = false,
}: FilterSelectProps<T>) {
  const EMPTY_VALUE = "__empty__";

  return (
    <Select
      value={value === "" ? undefined : value}
      onValueChange={(v) => onChange((v === EMPTY_VALUE ? "" : v) as T)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-10 min-h-10 min-w-0 w-full items-center gap-2 py-2 text-sm leading-normal box-border",
          "data-[state=open]:border-primary data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-primary/25 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background dark:data-[state=open]:ring-primary/35",
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="rounded-xl border bg-popover shadow-lg"
        position="popper"
        sideOffset={6}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value || EMPTY_VALUE}
            value={opt.value === "" ? EMPTY_VALUE : opt.value}
            className="rounded-lg py-2 cursor-pointer focus:bg-accent"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
