import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import { recipesRateLimiter } from "./middleware/rate-limiter.js";
import { healthRouter } from "./routes/health.js";
import { recipesRouter } from "./routes/recipes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Trust reverse proxy (Render, Cloudflare, load balancers)
  app.set("trust proxy", 1);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
          fontSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  const allowedOrigins =
    config.nodeEnv === "production"
      ? [config.clientOrigin]
      : ["http://localhost:5173", "http://127.0.0.1:5173", config.clientOrigin];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin in production)
        // Also allow onrender.com subdomains automatically when hosted on Render
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          (process.env.RENDER && origin.endsWith(".onrender.com"))
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    })
  );

  // Request body parsing with strict 10 KB limit
  app.use(express.json({ limit: "10kb" }));

  // API Routes
  app.use("/api/health", healthRouter);
  app.use("/api/recipes", recipesRateLimiter, recipesRouter);

  // Serve static client assets in production or when client/dist exists
  const clientDistPath = path.resolve(__dirname, "../../client/dist");
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // Client-side routing fallback for non-API routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  // Error handling middleware
  app.use(errorHandler);

  return app;
}
