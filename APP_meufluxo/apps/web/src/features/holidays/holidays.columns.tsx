"use client";

import type { Holiday, HolidayScope } from "@meufluxo/types";

import type { DataTableColumn } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";

const SCOPE_LABELS: Record<HolidayScope, string> = {
  NATIONAL: "Nacional",
  STATE: "Estadual",
  CITY: "Municipal",
  WORKSPACE: "Workspace",
};

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function getHolidaysColumns(): Array<DataTableColumn<Holiday>> {
  return [
    {
      key: "name",
      title: "Nome",
      dataIndex: "name",
      sortable: true,
      sortKey: "name",
      cellClassName: "font-medium",
    },
    {
      key: "holidayDate",
      title: "Data",
      sortable: true,
      sortKey: "holidayDate",
      render: (row) => <span>{formatDate(row.holidayDate)}</span>,
    },
    {
      key: "scope",
      title: "Escopo",
      sortable: true,
      sortKey: "scope",
      render: (row) => (
        <Badge variant="secondary">{SCOPE_LABELS[row.scope] ?? row.scope}</Badge>
      ),
    },
    {
      key: "countryCode",
      title: "País",
      sortable: true,
      sortKey: "countryCode",
      render: (row) => row.countryCode || "—",
    },
    {
      key: "stateCode",
      title: "Estado",
      render: (row) => row.stateCode || "—",
    },
    {
      key: "cityName",
      title: "Cidade",
      render: (row) => row.cityName || "—",
    },
    {
      key: "workspaceId",
      title: "Workspace",
      render: (row) => row.workspaceId || "—",
    },
    {
      key: "status",
      title: "Status",
      render: (row) =>
        row.meta.active ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="muted">Inativo</Badge>
        ),
    },
  ];
}
