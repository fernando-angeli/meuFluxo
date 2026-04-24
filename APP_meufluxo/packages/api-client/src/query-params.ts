export type HttpQueryScalar = string | number | boolean;

export type HttpQueryValue =
  | HttpQueryScalar
  | null
  | undefined
  | readonly HttpQueryScalar[];

/**
 * Aplica query ao URL: escalares com set; arrays repetem a chave (ex.: Spring List<Long>).
 */
export function applyQueryRecord(
  url: URL,
  query: Record<string, HttpQueryValue>,
): void {
  for (const [key, raw] of Object.entries(query)) {
    if (raw === null || raw === undefined) continue;
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item === null || item === undefined) continue;
        url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.set(key, String(raw));
    }
  }
}
