"use client";

import type { PlannedEntryStatus } from "@meufluxo/types";

import { FilterMultiSelect } from "@/components/filters";
import { useTranslation } from "@/lib/i18n";

const STATUS_ORDER: readonly PlannedEntryStatus[] = ["OPEN", "OVERDUE", "COMPLETED", "CANCELED"];

function statusesToKeys(statuses: PlannedEntryStatus[]): string[] {
  return statuses
    .map((s) => {
      const i = STATUS_ORDER.indexOf(s);
      return i >= 0 ? String(i) : null;
    })
    .filter((k): k is string => k != null);
}

function keysToStatuses(keys: string[]): PlannedEntryStatus[] {
  if (keys.length === 0) {
    return [];
  }
  const indices = [...new Set(keys)]
    .map((k) => Number(k))
    .filter((n) => Number.isInteger(n) && n >= 0 && n < STATUS_ORDER.length)
    .sort((a, b) => a - b);
  return indices.map((i) => STATUS_ORDER[i]);
}

type PlannedStatusMultiSelectProps = {
  value: PlannedEntryStatus[];
  onChange: (value: PlannedEntryStatus[]) => void;
  labelByStatus?: Partial<Record<PlannedEntryStatus, string>>;
  className?: string;
  triggerClassName?: string;
};

export function PlannedStatusMultiSelect({
  value,
  onChange,
  labelByStatus,
  className,
  triggerClassName,
}: PlannedStatusMultiSelectProps) {
  const { t } = useTranslation();
  const options = STATUS_ORDER.map((status, index) => ({
    value: String(index),
    label: labelByStatus?.[status] ?? status,
  }));

  return (
    <FilterMultiSelect
      options={options}
      value={statusesToKeys(value)}
      onChange={(keys) => onChange(keysToStatuses(keys))}
      collapseWhenAllSelected={false}
      allLabel={t("filters.all")}
      className={className}
      triggerClassName={triggerClassName}
      renderTriggerSummary={(ids) => {
        const sts = keysToStatuses(ids);
        if (sts.length === 1) {
          return labelByStatus?.[sts[0]] ?? sts[0];
        }
        return t("filters.multiSelectedCount").replace("{count}", String(sts.length));
      }}
    />
  );
}
