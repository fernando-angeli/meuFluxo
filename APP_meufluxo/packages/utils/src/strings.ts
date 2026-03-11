export function titleCase(input: string) {
  return input
    .trim()
    .split(/\s+/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

