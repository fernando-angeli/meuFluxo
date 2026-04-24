"use client";

import { useAccounts } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { FilterMultiSelect } from "./filter-multi-select";

type AccountsMultiSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  triggerClassName?: string;
};

export function AccountsMultiSelect({
  value,
  onChange,
  className,
  triggerClassName,
}: AccountsMultiSelectProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useAccounts();
  const accounts = Array.isArray(data) ? data : [];

  const options = accounts.map((a) => ({ value: a.id, label: a.name }));

  return (
    <FilterMultiSelect
      options={options}
      value={value}
      onChange={onChange}
      allLabel={t("filters.allAccounts")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noAccount")}
      className={className}
      triggerClassName={triggerClassName}
      renderTriggerSummary={(ids) => {
        if (ids.length === 1) {
          return accounts.find((a) => a.id === ids[0])?.name ?? ids[0];
        }
        return t("filters.multiSelectedCount").replace("{count}", String(ids.length));
      }}
    />
  );
}
