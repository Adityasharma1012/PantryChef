import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "warning";
}

interface ToastContextType {
  showToast: (text: string, type?: "success" | "info" | "warning") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: "success" | "info" | "warning" = "success") => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, text, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-espresso-900 text-cream-50 px-4 py-3 rounded-xl shadow-floating border border-espresso-700 flex items-center justify-between text-sm animate-fade-in"
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" && (
                <svg
                  className="w-5 h-5 text-basil-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === "warning" && (
                <svg
                  className="w-5 h-5 text-saffron-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
              <span>{toast.text}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
