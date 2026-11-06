import React, { useEffect, useState } from "react";
import { DownloadIcon, XIcon } from "./Icons.js";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios");

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isIos,
    triggerInstall,
  };
}

interface InstallBannerProps {
  canInstall: boolean;
  isIos: boolean;
  onInstall: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
  canInstall,
  isIos,
  onInstall,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (!canInstall && !isIos)) {
    return null;
  }

  return (
    <aside
      aria-label="App installation banner"
      className="bg-saffron-50 border border-saffron-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3 text-sm text-espresso-900 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-saffron-500 text-cream-50 flex items-center justify-center flex-shrink-0">
          <DownloadIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-espresso-900">
            {isIos ? "Install PantryChef on iOS" : "Install PantryChef App"}
          </p>
          <p className="text-xs text-espresso-700">
            {isIos
              ? "Tap the Share button in Safari, then choose 'Add to Home Screen' for instant offline access."
              : "Install to your device for rapid offline access to your saved recipes and shopping list."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {canInstall && (
          <button
            type="button"
            onClick={onInstall}
            className="min-h-tap px-3.5 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-cream-50 font-semibold text-xs rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss install notice"
          className="p-1.5 text-espresso-600 hover:text-espresso-900 rounded-lg transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
