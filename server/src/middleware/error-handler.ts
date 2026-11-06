import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import {
  type ErrorCode,
  ERROR_MESSAGE_MAP,
  ERROR_STATUS_MAP,
} from "@pantrychef/shared";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // If the error is an AppError instance
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const code: ErrorCode = "INVALID_REQUEST";
    const details = err.issues.map((i) => i.message).join(", ");
    res.status(ERROR_STATUS_MAP[code]).json({
      error: {
        code,
        message: details ? `Validation error: ${details}` : ERROR_MESSAGE_MAP[code],
      },
    });
    return;
  }

  // Handle body parser errors (e.g., body limit exceeded or malformed JSON)
  if (err.type === "entity.too.large") {
    const code: ErrorCode = "INVALID_REQUEST";
    res.status(ERROR_STATUS_MAP[code]).json({
      error: {
        code,
        message: "Request payload too large. Maximum allowed size is 10 KB.",
      },
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    const code: ErrorCode = "INVALID_REQUEST";
    res.status(ERROR_STATUS_MAP[code]).json({
      error: {
        code,
        message: "Malformed JSON payload in request.",
      },
    });
    return;
  }

  // Rate limiter standard error if uncaught
  if (err.status === 429) {
    const code: ErrorCode = "RATE_LIMITED";
    res.status(ERROR_STATUS_MAP[code]).json({
      error: {
        code,
        message: ERROR_MESSAGE_MAP[code],
      },
    });
    return;
  }

  // Unknown or unhandled server error - safe user message without leaking internals
  console.error("[Internal Server Error]:", err.message || err);
  const code: ErrorCode = "GEMINI_UNAVAILABLE";
  res.status(ERROR_STATUS_MAP[code]).json({
    error: {
      code,
      message: ERROR_MESSAGE_MAP[code],
    },
  });
};
