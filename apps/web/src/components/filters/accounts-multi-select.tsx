"use client";

import { useAccounts } from "@/hooks/api";
import { useTranslation } from "@/lib/i18n";
import { MultiSelectDropdown } from "./multi-select-dropdown";

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
  const { data: accounts = [], isLoading } = useAccounts();

  const options = accounts.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <MultiSelectDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={t("filters.accounts")}
      allLabel={t("filters.allAccounts")}
      applyLabel={t("filters.apply")}
      emptyMessage={isLoading ? t("filters.loading") : t("filters.noAccount")}
      className={className}
      triggerClassName={triggerClassName}
    />
  );
}
