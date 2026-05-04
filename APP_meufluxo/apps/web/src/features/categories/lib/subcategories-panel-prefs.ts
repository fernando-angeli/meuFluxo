const SIZE_KEY = "meufluxo.categories.subcategoriesPageSize";

export function loadStoredSubcategoryPageSize(): number {
  if (typeof window === "undefined") return 10;
  try {
    const raw = window.localStorage.getItem(SIZE_KEY);
    const n = raw != null ? Number(raw) : 10;
    if (n === 10 || n === 20 || n === 50) return n;
    return 10;
  } catch {
    return 10;
  }
}

export function saveStoredSubcategoryPageSize(size: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIZE_KEY, String(size));
  } catch {
    /* ignore */
  }
}
