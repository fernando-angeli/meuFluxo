import type { EntityMeta } from "./categories";

export type BrandCard = "VISA" | "MASTERCARD";

export type CreditCard = {
  id: string;
  name: string;
  lastFourDigits: string | null;
  creditLimit: number | null;
  closingDay: number;
  dueDay: number;
  annualFeeEnabled: boolean | null;
  annualFeeAmount: number | null;
  brandCard: BrandCard | null;
  annualFeeWaiverThreshold: number | null;
  defaultPaymentAccountId: string | null;
  meta: EntityMeta;
};
