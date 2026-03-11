export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isoMonth(date: Date) {
  return date.toISOString().slice(0, 7);
}

