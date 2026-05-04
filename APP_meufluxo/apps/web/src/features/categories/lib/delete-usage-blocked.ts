/**
 * Resposta de regra de negócio ao tentar excluir categoria/subcategoria ainda em uso.
 * Mantido alinhado às mensagens de {@code BusinessException} na API.
 */
export function isDeleteBlockedByUsageMessage(detail: string | undefined): boolean {
  if (!detail) return false;
  const d = detail.toLowerCase();
  return d.includes("não é possível excluir") && (d.includes("inativ") || d.includes("em uso"));
}
