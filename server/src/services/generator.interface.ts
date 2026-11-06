import type { Recipe, RecipeRequest, RegenerateRequest } from "@pantrychef/shared";

export interface RecipeGenerator {
  /**
   * Generates exactly 3 recipes given user ingredients and filters.
   */
  generateRecipes(request: RecipeRequest): Promise<Recipe[]>;

  /**
   * Regenerates a single recipe replacing replaceTitle, distinct from all excluded titles.
   */
  regenerateRecipe(request: RegenerateRequest): Promise<Recipe>;
}
