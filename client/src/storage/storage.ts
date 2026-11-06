import { get, set } from "idb-keyval";
import { type Recipe, RecipeSchema } from "@pantrychef/shared";
import { z } from "zod";

export const STORAGE_SCHEMA_VERSION = 1;

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  addedAt: number;
}

const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  quantity: z.string().trim(),
  checked: z.boolean(),
  addedAt: z.number(),
});

const FavoritesPayloadSchema = z.object({
  version: z.number(),
  updatedAt: z.number(),
  data: z.array(RecipeSchema),
});

const ShoppingPayloadSchema = z.object({
  version: z.number(),
  updatedAt: z.number(),
  data: z.array(ShoppingItemSchema),
});

const FAVORITES_KEY = "pantrychef_favorites_v1";
const SHOPPING_KEY = "pantrychef_shopping_v1";

const hasIndexedDb = (): boolean => {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
};

/**
 * Safe local storage fallback in case IndexedDB is unavailable
 */
function getFromLocalStorage(key: string): unknown {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setToLocalStorage(key: string, value: unknown): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or disabled storage
  }
}

/**
 * Loads favorites with corruption tolerance and version checking.
 */
export async function loadFavorites(): Promise<Recipe[]> {
  let payload: unknown = null;

  if (hasIndexedDb()) {
    try {
      payload = await get(FAVORITES_KEY);
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    payload = getFromLocalStorage(FAVORITES_KEY);
  }

  if (!payload) return [];

  try {
    const parsed = FavoritesPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Corrupted or invalid favorites data, resetting to empty list.");
      return [];
    }
    return parsed.data.data;
  } catch {
    return [];
  }
}

/**
 * Saves favorites to both IndexedDB and localStorage.
 */
export async function saveFavorites(recipes: Recipe[]): Promise<void> {
  const payload = {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    data: recipes,
  };

  if (hasIndexedDb()) {
    try {
      await set(FAVORITES_KEY, payload);
    } catch {
      // IDB failed, fallback to localStorage
    }
  }
  setToLocalStorage(FAVORITES_KEY, payload);
}

/**
 * Loads shopping list with corruption tolerance.
 */
export async function loadShoppingList(): Promise<ShoppingItem[]> {
  let payload: unknown = null;

  if (hasIndexedDb()) {
    try {
      payload = await get(SHOPPING_KEY);
    } catch {
      payload = null;
    }
  }

  if (!payload) {
    payload = getFromLocalStorage(SHOPPING_KEY);
  }

  if (!payload) return [];

  try {
    const parsed = ShoppingPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      console.warn("Corrupted or invalid shopping list data, resetting to empty list.");
      return [];
    }
    return parsed.data.data;
  } catch {
    return [];
  }
}

/**
 * Saves shopping list to both IndexedDB and localStorage.
 */
export async function saveShoppingList(items: ShoppingItem[]): Promise<void> {
  const payload = {
    version: STORAGE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    data: items,
  };

  if (hasIndexedDb()) {
    try {
      await set(SHOPPING_KEY, payload);
    } catch {
      // IDB fallback
    }
  }
  setToLocalStorage(SHOPPING_KEY, payload);
}

/**
 * Helper to merge new items into existing shopping list without duplicate entries.
 * Returns the updated list and the count of newly added items.
 */
export function mergeShoppingItems(
  existing: ShoppingItem[],
  incoming: { name: string; quantity: string }[]
): { updated: ShoppingItem[]; addedCount: number } {
  const map = new Map<string, ShoppingItem>();

  for (const item of existing) {
    map.set(item.name.toLowerCase().trim(), { ...item });
  }

  let addedCount = 0;

  for (const inc of incoming) {
    const key = inc.name.toLowerCase().trim();
    if (!key) continue;

    if (map.has(key)) {
      const existingItem = map.get(key)!;
      // If unchecked, append quantity if different
      if (
        inc.quantity &&
        existingItem.quantity &&
        !existingItem.quantity.includes(inc.quantity)
      ) {
        existingItem.quantity = `${existingItem.quantity}, ${inc.quantity}`;
      } else if (!existingItem.quantity && inc.quantity) {
        existingItem.quantity = inc.quantity;
      }
    } else {
      addedCount++;
      map.set(key, {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: inc.name.trim(),
        quantity: inc.quantity.trim(),
        checked: false,
        addedAt: Date.now(),
      });
    }
  }

  return {
    updated: Array.from(map.values()),
    addedCount,
  };
}
