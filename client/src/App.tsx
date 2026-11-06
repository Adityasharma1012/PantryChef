import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { InstallBanner, usePwaInstall } from "./components/InstallPrompt.js";
import { Navigation } from "./components/Navigation.js";
import { ToastProvider } from "./components/Toast.js";
import { FavoritesProvider } from "./context/FavoritesContext.js";
import { ShoppingListProvider } from "./context/ShoppingListContext.js";
import { FavoritesPage } from "./pages/FavoritesPage.js";
import { HomePage } from "./pages/HomePage.js";
import { ShoppingListPage } from "./pages/ShoppingListPage.js";

export const App: React.FC = () => {
  const { canInstall, isIos, triggerInstall } = usePwaInstall();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <FavoritesProvider>
      <ShoppingListProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-cream-50 text-espresso-900 flex flex-col font-sans">
              {/* Global Offline Bar */}
              {isOffline && (
                <div
                  role="status"
                  className="bg-espresso-800 text-cream-50 px-4 py-2 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></span>
                  <span>
                    You are in offline mode. Saved favorites and shopping list remain fully accessible.
                  </span>
                </div>
              )}

              {/* Navigation Header */}
              <Navigation
                canInstall={canInstall}
                onInstallClick={triggerInstall}
              />

              {/* Main Content Area */}
              <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
                <InstallBanner
                  canInstall={canInstall}
                  isIos={isIos}
                  onInstall={triggerInstall}
                />

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/shopping-list" element={<ShoppingListPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="hidden md:block py-6 border-t border-espresso-200 text-center text-xs text-espresso-600 bg-cream-50">
                <p>
                  PantryChef — Powered by Google Gemini AI. Crafted for zero food waste.
                </p>
              </footer>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </ShoppingListProvider>
    </FavoritesProvider>
  );
};

export default App;
