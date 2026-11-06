import { Router } from "express";
import type { HealthResponse } from "@pantrychef/shared";
import { isGeminiConfigured } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const response: HealthResponse = {
    ok: true,
    geminiConfigured: isGeminiConfigured(),
  };

  res.status(200).json(response);
});
