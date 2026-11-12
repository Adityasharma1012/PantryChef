import rateLimit from "express-rate-limit";
import { ERROR_MESSAGE_MAP, ERROR_STATUS_MAP } from "@pantrychef/shared";

export const recipesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
  },
  handler: (_req, res) => {
    res.status(ERROR_STATUS_MAP.RATE_LIMITED).json({
      error: {
        code: "RATE_LIMITED",
        message: ERROR_MESSAGE_MAP.RATE_LIMITED,
      },
    });
  },
});
