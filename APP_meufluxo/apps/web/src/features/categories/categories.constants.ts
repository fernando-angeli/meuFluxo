/**
 * Campos ordenáveis na listagem de categorias (devem existir no backend como propriedades ordenáveis).
 */
export const CATEGORY_SORT_KEYS = ["name", "movementType"] as const;

export type CategorySortKey = (typeof CATEGORY_SORT_KEYS)[number];
