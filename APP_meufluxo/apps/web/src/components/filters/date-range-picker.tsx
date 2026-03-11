"use client";

import * as React from "react";
import { format, parse, startOfDay, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

const DISPLAY_FORMAT = "dd/MM/yyyy";
const ISO_FORMAT = "yyyy-MM-dd";

function toDate(iso: string): Date {
  return startOfDay(parse(iso, ISO_FORMAT, new Date()));
}

function toISO(d: Date): string {
  return format(d, ISO_FORMAT);
}

function formatDisplay(value: DateRangeValue | null): string {
  if (!value) return "";
  const start = toDate(value.startDate);
  const end = toDate(value.endDate);
  if (value.startDate === value.endDate) {
    return format(start, DISPLAY_FORMAT, { locale: ptBR });
  }
  return `${format(start, DISPLAY_FORMAT, { locale: ptBR })} - ${format(end, DISPLAY_FORMAT, { locale: ptBR })}`;
}

type DateRangePickerProps = {
  value: DateRangeValue | null;
  onChange: (value: DateRangeValue | null) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  maxRangeDays?: number;
};

/**
 * Fluxo de seleção:
 * - Ao abrir: mostra range atual (se houver) ou vazio.
 * - Primeiro clique: define startDate; aguarda endDate.
 * - Segundo clique (data >= startDate): define endDate, aplica e fecha.
 * - Segundo clique (data < startDate): reinicia; essa data vira o novo startDate.
 * - Com range já completo, novo clique: reinicia (resetOnSelect do DayPicker).
 * - Um único dia: startDate = endDate (mesmo dia).
 * - Fechar sem completar: aplica só o start como único dia (startDate = endDate).
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Selecionar período",
  className,
  minDate,
  maxDate,
  maxRangeDays,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const [pendingRange, setPendingRange] = React.useState<{
    from: Date;
    to?: Date;
  } | null>(null);

  const committedRange = React.useMemo(() => {
    if (!value) return undefined;
    const from = toDate(value.startDate);
    const to =
      value.startDate === value.endDate ? undefined : toDate(value.endDate);
    return { from, to };
  }, [value?.startDate, value?.endDate]);

  const displayRange = open ? (pendingRange ?? committedRange) : committedRange;

  const previewRange = React.useMemo(() => {
    if (
      !pendingRange?.from ||
      pendingRange.to !== undefined ||
      !hoverDate
    ) {
      return undefined;
    }
    const from = startOfDay(pendingRange.from);
    const to = startOfDay(hoverDate);
    if (to.getTime() < from.getTime()) return undefined;
    return { from, to };
  }, [pendingRange?.from, pendingRange?.to, hoverDate]);

  const selectedRange = previewRange ?? displayRange;
  const prevOpenRef = React.useRef(false);
  const committedRef = React.useRef(committedRange);
  committedRef.current = committedRange;

  React.useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (open && !wasOpen) {
      setPendingRange(committedRef.current ?? null);
    }
    if (!open) {
      setPendingRange(null);
      setHoverDate(null);
    }
  }, [open]);

  const handleSelect = React.useCallback(
    (range: { from?: Date; to?: Date } | undefined) => {
      if (!range?.from) {
        setPendingRange(null);
        setHoverDate(null);
        onChange(null);
        return;
      }

      const from = startOfDay(range.from);
      const to = range.to ? startOfDay(range.to) : undefined;

      if (to !== undefined) {
        const startStr = toISO(from);
        const endStr = toISO(to);
        onChange({ startDate: startStr, endDate: endStr });
        setPendingRange(null);
        setHoverDate(null);
        setOpen(false);
        return;
      }

      setPendingRange({ from, to: undefined });
      setHoverDate(null);
    },
    [onChange],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && pendingRange?.from) {
        const startStr = toISO(pendingRange.from);
        onChange({ startDate: startStr, endDate: startStr });
      }
      if (!nextOpen) {
        setPendingRange(null);
        setHoverDate(null);
      }
      setOpen(nextOpen);
    },
    [pendingRange, onChange],
  );

  const disabled = React.useMemo(() => {
    const matchers: Array<(date: Date) => boolean> = [];
    if (minDate) matchers.push((d) => isBefore(d, minDate));
    if (maxDate) matchers.push((d) => isAfter(d, maxDate));
    if (
      pendingRange?.from &&
      pendingRange.to === undefined
    ) {
      const from = pendingRange.from.getTime();
      matchers.push((d) => d.getTime() < from);
    }
    if (matchers.length === 0) return undefined;
    return (date: Date) => matchers.some((m) => m(date));
  }, [minDate, maxDate, pendingRange?.from?.getTime(), pendingRange?.to]);

  const defaultMonth = React.useMemo(() => {
    if (displayRange?.from) return displayRange.from;
    if (value?.startDate) return toDate(value.startDate);
    return new Date();
  }, [displayRange?.from, value?.startDate]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
            "hover:bg-muted/50 hover:border-input",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "data-[state=open]:border-primary/50 data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
            !value && "text-muted-foreground",
            className,
          )}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <span className="truncate">
            {value ? formatDisplay(value) : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="rounded-lg border bg-popover shadow-lg">
          <Calendar
            mode="range"
            defaultMonth={defaultMonth}
            selected={selectedRange}
            onSelect={handleSelect}
            onDayPointerEnter={setHoverDate}
            onDayPointerLeave={() => setHoverDate(null)}
            numberOfMonths={1}
            disabled={disabled}
            max={maxRangeDays}
            locale={ptBR}
            resetOnSelect
            startMonth={
              minDate
                ? new Date(minDate.getFullYear(), minDate.getMonth(), 1)
                : undefined
            }
            endMonth={
              maxDate
                ? new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
                : undefined
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
