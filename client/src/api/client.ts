import {
  type ApiErrorResponse,
  type ErrorCode,
  type HealthResponse,
  HealthResponseSchema,
  type Recipe,
  type RecipeRequest,
  RecipesResponseSchema,
  type RegenerateRequest,
  RegenerateResponseSchema,
} from "@pantrychef/shared";

export class ClientApiError extends Error {
  public readonly code: ErrorCode | "NETWORK_OFFLINE" | "UNKNOWN";
  public readonly status: number;

  constructor(
    message: string,
    code: ErrorCode | "NETWORK_OFFLINE" | "UNKNOWN" = "UNKNOWN",
    status = 500
  ) {
    super(message);
    this.name = "ClientApiError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Checks server health and Gemini configuration status.
 */
export async function getHealth(): Promise<HealthResponse> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: true, geminiConfigured: false };
  }

  try {
    const res = await fetch("/api/health");
    if (!res.ok) {
      return { ok: true, geminiConfigured: false };
    }
    const data = await res.json();
    return HealthResponseSchema.parse(data);
  } catch {
    return { ok: true, geminiConfigured: false };
  }
}

/**
 * Sends a request to generate 3 recipes from pantry ingredients and filters.
 */
export async function generateRecipesApi(
  payload: RecipeRequest
): Promise<Recipe[]> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ClientApiError(
      "You appear to be offline. Recipe generation requires an active internet connection to contact the server.",
      "NETWORK_OFFLINE",
      0
    );
  }

  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorData = data as ApiErrorResponse | null;
    const code = errorData?.error?.code || "GEMINI_UNAVAILABLE";
    const message =
      errorData?.error?.message ||
      "An unexpected error occurred while generating recipes.";
    throw new ClientApiError(message, code, res.status);
  }

  const parsed = RecipesResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new ClientApiError(
      "Received an invalid recipe response structure from the server.",
      "GEMINI_BAD_RESPONSE",
      502
    );
  }

  return parsed.data.recipes;
}

/**
 * Requests regeneration for a specific recipe card.
 */
export async function regenerateRecipeApi(
  payload: RegenerateRequest
): Promise<Recipe> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ClientApiError(
      "You appear to be offline. Regenerating recipes requires an active internet connection.",
      "NETWORK_OFFLINE",
      0
    );
  }

  const res = await fetch("/api/recipes/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorData = data as ApiErrorResponse | null;
    const code = errorData?.error?.code || "GEMINI_UNAVAILABLE";
    const message =
      errorData?.error?.message ||
      "An unexpected error occurred while regenerating the recipe.";
    throw new ClientApiError(message, code, res.status);
  }

  const parsed = RegenerateResponseSchema.safeParse(data);
  if (!parsed.success) {
    throw new ClientApiError(
      "Received an invalid recipe response structure from the server.",
      "GEMINI_BAD_RESPONSE",
      502
    );
  }

  return parsed.data.recipe;
}
