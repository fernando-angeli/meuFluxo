import { CARD_BRANDS, type BrandCard } from "@meufluxo/types";

export { CARD_BRANDS };
export type { BrandCard };

export const CARD_BRAND_OPTIONS = CARD_BRANDS.map((brand) => ({
  value: brand,
  label: brand,
}));

/**
 * Mantem estrutura pronta para adicionar icones no futuro
 * sem alterar os contratos dos componentes.
 */
export const CARD_BRAND_ICONS: Partial<Record<BrandCard, string>> = {};

const CARD_BRAND_TO_API: Record<BrandCard, string> = {
  Visa: "VISA",
  Mastercard: "MASTERCARD",
  Elo: "ELO",
  "American Express": "AMERICAN_EXPRESS",
  Hipercard: "HIPERCARD",
  "Diners Club": "DINERS_CLUB",
  Discover: "DISCOVER",
  Banricompras: "BANRICOMPRAS",
  Cabal: "CABAL",
  Aura: "AURA",
  JCB: "JCB",
  UnionPay: "UNIONPAY",
  Outro: "OUTRO",
};

const LEGACY_BRAND_ALIASES: Record<string, BrandCard> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  MASTER: "Mastercard",
  ELO: "Elo",
  AMERICAN_EXPRESS: "American Express",
  AMEX: "American Express",
  HIPERCARD: "Hipercard",
  DINERS_CLUB: "Diners Club",
  DINERS: "Diners Club",
  DISCOVER: "Discover",
  BANRICOMPRAS: "Banricompras",
  CABAL: "Cabal",
  AURA: "Aura",
  JCB: "JCB",
  UNIONPAY: "UnionPay",
  OUTRO: "Outro",
  OTHER: "Outro",
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

export function normalizeCardBrand(value: unknown): BrandCard | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const byExact = CARD_BRANDS.find((brand) => brand.toLowerCase() === trimmed.toLowerCase());
  if (byExact) return byExact;

  return LEGACY_BRAND_ALIASES[normalizeKey(trimmed)] ?? null;
}

export function getCardBrandLabel(
  value: unknown,
  fallback: BrandCard | null = null,
): string | null {
  return normalizeCardBrand(value) ?? fallback;
}

export function toApiCardBrand(value: BrandCard): string {
  return CARD_BRAND_TO_API[value];
}
