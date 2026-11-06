import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { RecipesResponseSchema } from "@pantrychef/shared";
import { createApp } from "../src/app.js";
import { setRecipeGenerator } from "../src/services/generator.factory.js";
import { MockRecipeGenerator } from "../src/services/mock.generator.js";

describe("Backend Recipe Generation Tests", () => {
  const app = createApp();

  beforeEach(() => {
    setRecipeGenerator(new MockRecipeGenerator());
  });

  it("successfully generates 3 valid recipes matching schema", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: ["pasta", "tomatoes", "spinach"],
        diets: ["Vegetarian"],
        cuisine: "Italian",
        maxMinutes: 30,
        servings: 4,
        count: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.recipes).toBeDefined();
    expect(res.body.recipes).toHaveLength(3);

    const parsed = RecipesResponseSchema.safeParse(res.body);
    expect(parsed.success).toBe(true);

    for (const recipe of res.body.recipes) {
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBeDefined();
      expect(recipe.summary).toBeDefined();
      expect(recipe.timeMinutes).toBeLessThanOrEqual(30);
      expect(recipe.servings).toBe(4);
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);

      // Check ingredient haveIt distinction
      const pantryIngredients = recipe.ingredients.filter(
        (i: { haveIt: boolean }) => i.haveIt
      );
      const stapleIngredients = recipe.ingredients.filter(
        (i: { haveIt: boolean }) => !i.haveIt
      );

      expect(pantryIngredients.length).toBeGreaterThan(0);
      expect(stapleIngredients.length).toBeGreaterThan(0);
    }
  });
});
