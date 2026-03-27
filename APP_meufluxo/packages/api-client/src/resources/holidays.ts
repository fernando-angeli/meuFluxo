import type { Holiday, PageQueryParams, PageResponse } from "@meufluxo/types";

import type { HttpClient } from "../http";

export type HolidaysListParams = Partial<Omit<PageQueryParams, "page" | "size">> & {
  page?: number;
  size?: number;
  sort?: string;
  scope?: string;
  countryCode?: string;
  active?: boolean;
};

export type HolidaysApi = {
  list: (params?: HolidaysListParams) => Promise<PageResponse<Holiday>>;
};

export function createHolidaysApi(http: HttpClient): HolidaysApi {
  return {
    list: (params) =>
      http.request<PageResponse<Holiday>>("/holidays", {
        method: "GET",
        query: {
          ...(params?.page !== undefined ? { page: params.page } : {}),
          ...(params?.size !== undefined ? { size: params.size } : {}),
          ...(params?.sort ? { sort: params.sort } : {}),
          ...(params?.scope ? { scope: params.scope } : {}),
          ...(params?.countryCode ? { countryCode: params.countryCode } : {}),
          ...(params?.active !== undefined ? { active: params.active } : {}),
        } as Record<string, string | number | boolean | null | undefined>,
      }),
  };
}
