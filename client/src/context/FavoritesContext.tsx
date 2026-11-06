import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Recipe } from "@pantrychef/shared";
import { loadFavorites, saveFavorites } from "../storage/storage.js";

interface FavoritesContextType {
  favorites: Recipe[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (recipe: Recipe) => void;
  removeFavorite: (id: string) => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadFavorites().then((loaded) => {
      if (mounted) {
        setFavorites(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === recipe.id);
      const next = exists
        ? prev.filter((f) => f.id !== recipe.id)
        : [recipe, ...prev];
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFavorites(next);
      return next;
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
