import dotenv from "dotenv";

// Load environment variables from .env if present
dotenv.config();

export interface ServerConfig {
  port: number;
  geminiModel: string;
  useMockGemini: boolean;
  clientOrigin: string;
  nodeEnv: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.8-flash",
  useMockGemini: process.env.USE_MOCK_GEMINI === "true",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};

/**
 * Checks whether GEMINI_API_KEY is configured in the environment at request time.
 * Never logs or exposes the key value.
 */
export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

/**
 * Retrieves the GEMINI_API_KEY at request time.
 */
export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (typeof key === "string" && key.trim().length > 0) {
    return key.trim();
  }
  return null;
}
