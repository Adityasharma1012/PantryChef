/**
 * Sanitizes user-provided text by stripping control characters, capping length,
 * and normalizing whitespace to treat user inputs purely as data.
 */
export function sanitizeText(input: unknown, maxLength = 100): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove control characters (ASCII 0-31 and 127-159)
  // Remove potentially confusing prompt-injection marker tokens or formatting delimiters
  const cleaned = input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/[`${}\\]/g, "")
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes an array of ingredient names.
 */
export function sanitizeIngredients(ingredients: unknown[]): string[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  const seen = new Set<string>();
  const sanitized: string[] = [];

  for (const item of ingredients) {
    const clean = sanitizeText(item, 40);
    const lower = clean.toLowerCase();
    if (clean.length > 0 && !seen.has(lower)) {
      seen.add(lower);
      sanitized.push(clean);
      if (sanitized.length >= 30) {
        break;
      }
    }
  }

  return sanitized;
}
