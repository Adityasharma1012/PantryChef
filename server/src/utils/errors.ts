import { ErrorCode, ERROR_MESSAGE_MAP, ERROR_STATUS_MAP } from "@pantrychef/shared";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, customMessage?: string) {
    const message = customMessage || ERROR_MESSAGE_MAP[code];
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class GeminiKeyMissingError extends AppError {
  constructor(message?: string) {
    super("GEMINI_KEY_MISSING", message);
  }
}

export class InvalidRequestError extends AppError {
  constructor(message?: string) {
    super("INVALID_REQUEST", message);
  }
}

export class RateLimitedError extends AppError {
  constructor(message?: string) {
    super("RATE_LIMITED", message);
  }
}

export class GeminiUnavailableError extends AppError {
  constructor(message?: string) {
    super("GEMINI_UNAVAILABLE", message);
  }
}

export class GeminiBadResponseError extends AppError {
  constructor(message?: string) {
    super("GEMINI_BAD_RESPONSE", message);
  }
}

export class TimeoutError extends AppError {
  constructor(message?: string) {
    super("TIMEOUT", message);
  }
}
