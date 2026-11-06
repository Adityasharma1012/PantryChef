import { Router } from "express";
import {
  type RecipeRequest,
  RecipeRequestSchema,
  type RecipesResponse,
  type RegenerateRequest,
  RegenerateRequestSchema,
  type RegenerateResponse,
} from "@pantrychef/shared";
import { validateBody } from "../middleware/validate.js";
import { getRecipeGenerator } from "../services/generator.factory.js";

export const recipesRouter = Router();

// POST /api/recipes
recipesRouter.post(
  "/",
  validateBody(RecipeRequestSchema),
  async (req, res, next) => {
    try {
      const requestData = req.body as RecipeRequest;
      const generator = getRecipeGenerator();
      const recipes = await generator.generateRecipes(requestData);

      const response: RecipesResponse = { recipes };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/recipes/regenerate
recipesRouter.post(
  "/regenerate",
  validateBody(RegenerateRequestSchema),
  async (req, res, next) => {
    try {
      const requestData = req.body as RegenerateRequest;
      const generator = getRecipeGenerator();
      const recipe = await generator.regenerateRecipe(requestData);

      const response: RegenerateResponse = { recipe };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
);
