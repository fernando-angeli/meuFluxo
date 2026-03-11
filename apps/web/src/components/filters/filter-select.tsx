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
}: FilterSelectProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger
        className={cn(
          "h-10 min-w-[140px] rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
          "hover:bg-muted/50 hover:border-input",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
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
            key={opt.value}
            value={opt.value}
            className="rounded-lg py-2 cursor-pointer focus:bg-accent"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
