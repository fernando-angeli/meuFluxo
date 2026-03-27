import type { EntityMeta } from "./categories";

export type HolidayScope = "NATIONAL" | "STATE" | "CITY" | "WORKSPACE";

export type Holiday = {
  id: string;
  name: string;
  holidayDate: string;
  scope: HolidayScope;
  countryCode: string;
  stateCode?: string | null;
  cityName?: string | null;
  workspaceId?: string | null;
  meta: EntityMeta;
};
