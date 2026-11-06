import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { setRecipeGenerator } from "../src/services/generator.factory.js";
import { MockRecipeGenerator } from "../src/services/mock.generator.js";

describe("Backend Validation Tests", () => {
  const app = createApp();

  beforeEach(() => {
    setRecipeGenerator(new MockRecipeGenerator());
  });

  it("fails with 400 INVALID_REQUEST when ingredients array is empty", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: [],
        diets: [],
        cuisine: "Any",
        maxMinutes: 30,
        servings: 2,
        count: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });

  it("fails with 400 INVALID_REQUEST when exceeding 30 ingredients", async () => {
    const excessiveIngredients = Array.from(
      { length: 31 },
      (_, i) => `Ingredient ${i}`
    );

    const res = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: excessiveIngredients,
        diets: [],
        cuisine: "Any",
        maxMinutes: 30,
        servings: 2,
        count: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });

  it("fails with 400 INVALID_REQUEST when an ingredient exceeds 40 characters", async () => {
    const longIngredient = "a".repeat(41);

    const res = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: [longIngredient],
        diets: [],
        cuisine: "Any",
        maxMinutes: 30,
        servings: 2,
        count: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });

  it("fails with 400 INVALID_REQUEST when servings is out of bounds (< 1 or > 12)", async () => {
    const resLow = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: ["pasta"],
        diets: [],
        cuisine: "Any",
        maxMinutes: 30,
        servings: 0,
        count: 3,
      });

    expect(resLow.status).toBe(400);
    expect(resLow.body.error.code).toBe("INVALID_REQUEST");

    const resHigh = await request(app)
      .post("/api/recipes")
      .send({
        ingredients: ["pasta"],
        diets: [],
        cuisine: "Any",
        maxMinutes: 30,
        servings: 15,
        count: 3,
      });

    expect(resHigh.status).toBe(400);
    expect(resHigh.body.error.code).toBe("INVALID_REQUEST");
  });

  it("fails with 400 INVALID_REQUEST on malformed JSON payload", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Content-Type", "application/json")
      .send("{ malformed: json, ");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });

  it("fails with 400 INVALID_REQUEST when request body exceeds 10 KB limit", async () => {
    // Large payload > 10 KB
    const bigString = "x".repeat(12000);
    const res = await request(app)
      .post("/api/recipes")
      .set("Content-Type", "application/json")
      .send(`{"big": "${bigString}"}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
    expect(res.body.error.message).toContain("10 KB");
  });

  it("fails with 400 INVALID_REQUEST when regenerate request is missing replaceTitle", async () => {
    const res = await request(app)
      .post("/api/recipes/regenerate")
      .send({
        ingredients: ["rice"],
        diets: [],
        cuisine: "Any",
        maxMinutes: 20,
        servings: 2,
        count: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REQUEST");
  });
});
