import React from "react";
import { AlertCircleIcon, RefreshIcon, XIcon } from "./Icons.js";

interface ErrorBannerProps {
  code?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  code,
  message,
  onRetry,
  onDismiss,
}) => {
  const isKeyMissing = code === "GEMINI_KEY_MISSING";
  const isOffline = code === "NETWORK_OFFLINE";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full bg-paprika-50 border-2 border-paprika-500 rounded-2xl p-4 sm:p-5 shadow-sm my-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-paprika-500 text-cream-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertCircleIcon className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-bold text-paprika-700 uppercase tracking-wider mb-1">
            {isKeyMissing
              ? "Gemini API Key Required"
              : isOffline
                ? "No Internet Connection"
                : "Unable to Generate Recipes"}
          </h4>

          <p className="text-sm text-espresso-900 leading-relaxed mb-3">
            {message}
          </p>

          {isKeyMissing && (
            <div className="bg-cream-100 p-3 rounded-xl text-xs text-espresso-800 mb-3 border border-espresso-200">
              <p className="font-semibold mb-1">Administrator Setup:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>
                  Set your API key in the server's environment (.env file on the backend host).
                </li>
                <li>
                  Or enable mock mode on the server:{" "}
                  <code className="bg-cream-200 px-1 py-0.5 rounded font-mono text-espresso-900">
                    USE_MOCK_GEMINI=true
                  </code>
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-tap px-4 py-2 bg-paprika-500 hover:bg-paprika-600 text-cream-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="min-h-tap px-3 py-2 text-espresso-700 hover:text-espresso-900 text-xs font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-espresso-500"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close error notice"
            className="p-1 rounded-lg text-espresso-600 hover:text-espresso-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
