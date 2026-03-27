"use client";

import type { Holiday, HolidayScope, PageQueryParams, PageResponse } from "@meufluxo/types";

import { api } from "@/services/api";

export function normalizeHolidayFromApi(raw: unknown): Holiday {
  const r = raw as Record<string, unknown>;
  const meta = r.meta as Record<string, unknown> | undefined;

  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    holidayDate: String(r.holidayDate ?? ""),
    scope: String(r.scope ?? "NATIONAL") as HolidayScope,
    countryCode: String(r.countryCode ?? "BR"),
    stateCode: r.stateCode != null ? String(r.stateCode) : null,
    cityName: r.cityName != null ? String(r.cityName) : null,
    workspaceId: r.workspaceId != null ? String(r.workspaceId) : null,
    meta: {
      createdAt: String(meta?.createdAt ?? ""),
      updatedAt: String(meta?.updatedAt ?? ""),
      active: Boolean(meta?.active),
    },
  };
}

function normalizePage(page: PageResponse<unknown>): PageResponse<Holiday> {
  return {
    ...page,
    content: (page.content ?? []).map((item) => normalizeHolidayFromApi(item)),
  };
}

export async function fetchHolidaysPage(
  params: PageQueryParams & Record<string, unknown>,
): Promise<PageResponse<Holiday>> {
  const page = await api.holidays.list({
    page: params.page,
    size: params.size,
    ...(params.sort ? { sort: params.sort } : {}),
    ...(params.scope ? { scope: String(params.scope) } : {}),
    ...(params.countryCode ? { countryCode: String(params.countryCode) } : {}),
    ...(typeof params.active === "boolean" ? { active: params.active } : {}),
  });
  return normalizePage(page as PageResponse<unknown>);
}
