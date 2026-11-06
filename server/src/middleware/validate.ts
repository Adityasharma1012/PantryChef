import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { InvalidRequestError } from "../utils/errors.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message).join("; ");
      next(
        new InvalidRequestError(
          `Invalid request parameters: ${issues || "Validation failed."}`
        )
      );
      return;
    }
    req.body = result.data;
    next();
  };
}
