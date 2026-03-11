"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";

import "react-day-picker/src/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("rdp-root p-3", className)}
      classNames={classNames}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
