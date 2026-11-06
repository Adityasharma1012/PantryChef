import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorBanner } from "../components/ErrorBanner.js";

describe("ErrorBanner Component Tests", () => {
  it("renders friendly error message and triggers retry", () => {
    const handleRetry = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <ErrorBanner
        code="GEMINI_UNAVAILABLE"
        message="The Gemini AI service is currently unavailable. Please try again shortly."
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The Gemini AI service is currently unavailable. Please try again shortly."
      )
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    const dismissBtn = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders specific instructions when key is missing", () => {
    render(
      <ErrorBanner
        code="GEMINI_KEY_MISSING"
        message="The Gemini API key is not configured on the server."
      />
    );

    expect(screen.getByText("Gemini API Key Required")).toBeInTheDocument();
    expect(screen.getByText(/Administrator Setup:/)).toBeInTheDocument();
    expect(screen.getByText(/USE_MOCK_GEMINI=true/)).toBeInTheDocument();
  });
});
