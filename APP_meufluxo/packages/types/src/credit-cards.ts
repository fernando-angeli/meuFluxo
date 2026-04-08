import type { EntityMeta } from "./categories";

export type BrandCard = "VISA" | "MASTERCARD";

export type CreditCardId = string;

export type CreditCard = {
  id: CreditCardId;
  name: string;
  cardDisplayName?: string | null;
  brand: BrandCard;
  brandCard?: BrandCard | null;
  creditLimit: number | null;
  closingDay: number;
  dueDay: number;
  defaultPaymentAccountId: string | null;
  defaultPaymentAccountName?: string | null;
  notes?: string | null;
  // Campos legados opcionais para compatibilidade com dados antigos/mocks.
  lastFourDigits?: string | null;
  annualFeeEnabled?: boolean | null;
  annualFeeAmount?: number | null;
  annualFeeWaiverThreshold?: number | null;
  meta: EntityMeta;
};
