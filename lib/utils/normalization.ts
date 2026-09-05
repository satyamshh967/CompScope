export function normalizeCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s&.-]/g, "");
}

export function normalizeRoleName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s-]/g, "");
}

export function normalizeLevelName(level: string): string {
  return level
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeLocation(
  city: string,
  country: string,
) {
  return {
    city: city.trim(),
    country: country.trim(),
  };
}