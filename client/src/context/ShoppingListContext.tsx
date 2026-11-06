import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loadShoppingList,
  mergeShoppingItems,
  saveShoppingList,
  type ShoppingItem,
} from "../storage/storage.js";

interface ShoppingListContextType {
  items: ShoppingItem[];
  addItem: (name: string, quantity?: string) => void;
  addMissingIngredients: (
    ingredients: { name: string; quantity: string }[]
  ) => number;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
  isLoading: boolean;
}

const ShoppingListContext = createContext<ShoppingListContextType | null>(null);

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadShoppingList().then((loaded) => {
      if (mounted) {
        setItems(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addItem = useCallback((name: string, quantity = "") => {
    if (!name.trim()) return;
    setItems((prev) => {
      const { updated } = mergeShoppingItems(prev, [{ name, quantity }]);
      saveShoppingList(updated);
      return updated;
    });
  }, []);

  const addMissingIngredients = useCallback(
    (ingredients: { name: string; quantity: string }[]) => {
      let added = 0;
      setItems((prev) => {
        const result = mergeShoppingItems(prev, ingredients);
        added = result.addedCount;
        saveShoppingList(result.updated);
        return result.updated;
      });
      return added;
    },
    []
  );

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      saveShoppingList(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveShoppingList(next);
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => {
      const next = prev.filter((item) => !item.checked);
      saveShoppingList(next);
      return next;
    });
  }, []);

  return (
    <ShoppingListContext.Provider
      value={{
        items,
        addItem,
        addMissingIngredients,
        toggleItem,
        removeItem,
        clearChecked,
        isLoading,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export function useShoppingList() {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error(
      "useShoppingList must be used within a ShoppingListProvider"
    );
  }
  return context;
}
