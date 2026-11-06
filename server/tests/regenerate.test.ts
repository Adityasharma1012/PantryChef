import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { RegenerateResponseSchema } from "@pantrychef/shared";
import { createApp } from "../src/app.js";
import { setRecipeGenerator } from "../src/services/generator.factory.js";
import { MockRecipeGenerator } from "../src/services/mock.generator.js";

describe("Backend Recipe Regeneration Tests", () => {
  const app = createApp();

  beforeEach(() => {
    setRecipeGenerator(new MockRecipeGenerator());
  });

  it("regenerates a single recipe with a title strictly differing from replaceTitle and exclude list", async () => {
    const replaceTitle = "Tomatoes Rustic Skillet Sauté";
    const exclude = [
      replaceTitle,
      "Pasta Aromatic Fragrant Bowl",
      "Spinach Crispy Oven Bake",
    ];

    const res = await request(app)
      .post("/api/recipes/regenerate")
      .send({
        ingredients: ["tomatoes", "pasta", "spinach"],
        diets: ["Vegetarian"],
        cuisine: "Italian",
        maxMinutes: 30,
        servings: 2,
        count: 3,
        replaceTitle,
        exclude,
      });

    expect(res.status).toBe(200);
    expect(res.body.recipe).toBeDefined();

    const parsed = RegenerateResponseSchema.safeParse(res.body);
    expect(parsed.success).toBe(true);

    const regeneratedRecipe = res.body.recipe;
    expect(regeneratedRecipe.title).not.toBe(replaceTitle);
    expect(exclude).not.toContain(regeneratedRecipe.title);
    expect(regeneratedRecipe.ingredients.length).toBeGreaterThan(0);
    expect(regeneratedRecipe.steps.length).toBeGreaterThan(0);
  });
});
