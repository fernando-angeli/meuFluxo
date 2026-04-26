export const CARD_BRANDS = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
  "Hipercard",
  "Diners Club",
  "Discover",
  "Banricompras",
  "Cabal",
  "Aura",
  "JCB",
  "UnionPay",
  "Outro",
] as const;

export type BrandCard = (typeof CARD_BRANDS)[number];
