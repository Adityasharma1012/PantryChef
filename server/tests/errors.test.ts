import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import type { RecipeGenerator } from "../src/services/generator.interface.js";
import { setRecipeGenerator } from "../src/services/generator.factory.js";
import {
  GeminiBadResponseError,
  GeminiKeyMissingError,
  GeminiUnavailableError,
  RateLimitedError,
  TimeoutError,
} from "../src/utils/errors.js";

describe("Backend Error Mapping Tests", () => {
  const app = createApp();

  afterEach(() => {
    setRecipeGenerator(null);
  });

  const validPayload = {
    ingredients: ["tomato", "basil", "garlic"],
    diets: ["Vegetarian"],
    cuisine: "Italian",
    maxMinutes: 30,
    servings: 2,
    count: 3,
  };

  it("returns 503 GEMINI_KEY_MISSING when API key is missing", async () => {
    const stubGenerator: RecipeGenerator = {
      generateRecipes: async () => {
        throw new GeminiKeyMissingError();
      },
      regenerateRecipe: async () => {
        throw new GeminiKeyMissingError();
      },
    };
    setRecipeGenerator(stubGenerator);

    const res = await request(app).post("/api/recipes").send(validPayload);

    expect(res.status).toBe(503);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe("GEMINI_KEY_MISSING");
    expect(typeof res.body.error.message).toBe("string");
    expect(res.body.error.message.length).toBeGreaterThan(10);
  });

  it("returns 429 RATE_LIMITED when rate limit is exceeded", async () => {
    const stubGenerator: RecipeGenerator = {
      generateRecipes: async () => {
        throw new RateLimitedError();
      },
      regenerateRecipe: async () => {
        throw new RateLimitedError();
      },
    };
    setRecipeGenerator(stubGenerator);

    const res = await request(app).post("/api/recipes").send(validPayload);

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("RATE_LIMITED");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("returns 504 TIMEOUT when request times out", async () => {
    const stubGenerator: RecipeGenerator = {
      generateRecipes: async () => {
        throw new TimeoutError();
      },
      regenerateRecipe: async () => {
        throw new TimeoutError();
      },
    };
    setRecipeGenerator(stubGenerator);

    const res = await request(app).post("/api/recipes").send(validPayload);

    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe("TIMEOUT");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("returns 502 GEMINI_UNAVAILABLE when service is unreachable", async () => {
    const stubGenerator: RecipeGenerator = {
      generateRecipes: async () => {
        throw new GeminiUnavailableError();
      },
      regenerateRecipe: async () => {
        throw new GeminiUnavailableError();
      },
    };
    setRecipeGenerator(stubGenerator);

    const res = await request(app).post("/api/recipes").send(validPayload);

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("GEMINI_UNAVAILABLE");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("returns 502 GEMINI_BAD_RESPONSE when response schema or JSON is malformed", async () => {
    const stubGenerator: RecipeGenerator = {
      generateRecipes: async () => {
        throw new GeminiBadResponseError();
      },
      regenerateRecipe: async () => {
        throw new GeminiBadResponseError();
      },
    };
    setRecipeGenerator(stubGenerator);

    const res = await request(app).post("/api/recipes").send(validPayload);

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe("GEMINI_BAD_RESPONSE");
    expect(typeof res.body.error.message).toBe("string");
  });

  it("verifies GET /api/health contract without exposing keys", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.geminiConfigured).toBe("boolean");
    // Ensure no key or token is leaked
    expect(JSON.stringify(res.body)).not.toContain("AIza");
    expect(JSON.stringify(res.body)).not.toContain("key");
  });
});
