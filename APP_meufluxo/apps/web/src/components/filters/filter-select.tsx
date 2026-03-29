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
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  "data-lpignore"?: "true" | "false";
  "data-1p-ignore"?: "true" | "false";
  "data-form-type"?: "other";
};

/**
 * Select único reutilizável para filtros.
 * Estilo: bordas arredondadas, sombra leve no dropdown, seta à direita, estados hover/focus.
 */
export function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  id,
  name,
  placeholder = "Selecionar",
  className,
  triggerClassName,
  disabled = false,
  "data-lpignore": dataLpIgnore = "true",
  "data-1p-ignore": data1pIgnore = "true",
  "data-form-type": dataFormType = "other",
}: FilterSelectProps<T>) {
  const EMPTY_VALUE = "__empty__";

  return (
    <Select
      value={value === "" ? undefined : value}
      onValueChange={(v) => onChange((v === EMPTY_VALUE ? "" : v) as T)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        name={name}
        data-lpignore={dataLpIgnore}
        data-1p-ignore={data1pIgnore}
        data-form-type={dataFormType}
        className={cn(
          "h-10 min-h-10 min-w-0 w-full items-center gap-2 py-2 pr-10 text-sm leading-normal box-border",
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
