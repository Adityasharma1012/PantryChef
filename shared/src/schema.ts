import { z } from "zod";

export const ERROR_CODES = [
  "GEMINI_KEY_MISSING",
  "INVALID_REQUEST",
  "RATE_LIMITED",
  "GEMINI_UNAVAILABLE",
  "GEMINI_BAD_RESPONSE",
  "TIMEOUT",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  GEMINI_KEY_MISSING: 503,
  INVALID_REQUEST: 400,
  RATE_LIMITED: 429,
  GEMINI_UNAVAILABLE: 502,
  GEMINI_BAD_RESPONSE: 502,
  TIMEOUT: 504,
};

export const ERROR_MESSAGE_MAP: Record<ErrorCode, string> = {
  GEMINI_KEY_MISSING:
    "The Gemini API key is not configured on the server. Please set GEMINI_API_KEY in your server environment or enable USE_MOCK_GEMINI=true for testing.",
  INVALID_REQUEST:
    "The recipe request was invalid. Please ensure 1 to 30 ingredients (each 1-40 characters), valid servings (1-12), and valid cooking time are provided.",
  RATE_LIMITED:
    "Too many recipe requests received. Please wait a moment before trying again.",
  GEMINI_UNAVAILABLE:
    "The Gemini AI service is currently unavailable or unreachable. Please try again shortly.",
  GEMINI_BAD_RESPONSE:
    "The AI service produced a recipe response that could not be validated. Please try again.",
  TIMEOUT:
    "The recipe generation request timed out. Please try again with fewer ingredients or simplified preferences.",
};

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
  }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export const RecipeIngredientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  quantity: z.string().trim().min(1).max(100),
  haveIt: z.boolean(),
});

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(150),
  summary: z.string().trim().min(1).max(1000),
  timeMinutes: z.number().int().min(1).max(360),
  servings: z.number().int().min(1).max(24),
  ingredients: z.array(RecipeIngredientSchema).min(1),
  steps: z.array(z.string().trim().min(1).max(1000)).min(1),
});

export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeRequestSchema = z.object({
  ingredients: z
    .array(z.string().trim().min(1).max(40))
    .min(1, "At least one ingredient is required")
    .max(30, "Maximum of 30 ingredients allowed"),
  diets: z.array(z.string().trim().max(40)).default([]),
  cuisine: z.string().trim().max(40).default("Any"),
  maxMinutes: z.number().int().min(1).max(360).nullable().default(null),
  servings: z.number().int().min(1).max(12).default(2),
  count: z.literal(3).default(3),
  exclude: z.array(z.string().trim().max(150)).optional(),
});

export type RecipeRequest = z.infer<typeof RecipeRequestSchema>;

export const RegenerateRequestSchema = RecipeRequestSchema.extend({
  replaceTitle: z.string().trim().min(1).max(150),
});

export type RegenerateRequest = z.infer<typeof RegenerateRequestSchema>;

export const RecipesResponseSchema = z.object({
  recipes: z.array(RecipeSchema).length(3),
});

export type RecipesResponse = z.infer<typeof RecipesResponseSchema>;

export const RegenerateResponseSchema = z.object({
  recipe: RecipeSchema,
});

export type RegenerateResponse = z.infer<typeof RegenerateResponseSchema>;

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  geminiConfigured: z.boolean(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
