import { config } from "../config.js";
import { GeminiRecipeGenerator } from "./gemini.generator.js";
import type { RecipeGenerator } from "./generator.interface.js";
import { MockRecipeGenerator } from "./mock.generator.js";

let customGenerator: RecipeGenerator | null = null;

export function setRecipeGenerator(generator: RecipeGenerator | null): void {
  customGenerator = generator;
}

export function getRecipeGenerator(): RecipeGenerator {
  if (customGenerator) {
    return customGenerator;
  }

  if (config.useMockGemini) {
    return new MockRecipeGenerator();
  }

  return new GeminiRecipeGenerator();
}
