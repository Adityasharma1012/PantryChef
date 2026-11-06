import { beforeEach, describe, expect, it } from "vitest";
import type { Recipe } from "@pantrychef/shared";
import {
  loadFavorites,
  loadShoppingList,
  saveFavorites,
  saveShoppingList,
  STORAGE_SCHEMA_VERSION,
} from "../storage/storage.js";

describe("Storage Layer Resilience Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleRecipe: Recipe = {
    id: "recipe_1",
    title: "Test Pasta",
    summary: "A quick pasta test.",
    timeMinutes: 20,
    servings: 2,
    ingredients: [{ name: "pasta", quantity: "200g", haveIt: true }],
    steps: ["1. Boil water", "2. Cook pasta"],
  };

  it("saves and loads favorites correctly", async () => {
    await saveFavorites([sampleRecipe]);
    const loaded = await loadFavorites();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe("Test Pasta");
  });

  it("handles corrupted non-JSON data in favorites gracefully", async () => {
    localStorage.setItem("pantrychef_favorites_v1", "corrupted{{not-json");

    const loaded = await loadFavorites();
    expect(loaded).toEqual([]);
  });

  it("handles schema mismatch / missing fields in favorites gracefully", async () => {
    // Missing required fields like timeMinutes or steps
    const corruptedPayload = {
      version: STORAGE_SCHEMA_VERSION,
      updatedAt: Date.now(),
      data: [{ id: "bad_1", title: "Incomplete" }],
    };
    localStorage.setItem(
      "pantrychef_favorites_v1",
      JSON.stringify(corruptedPayload)
    );

    const loaded = await loadFavorites();
    expect(loaded).toEqual([]);
  });

  it("handles corrupted non-JSON data in shopping list gracefully", async () => {
    localStorage.setItem("pantrychef_shopping_v1", "{bad-data-broken");

    const loaded = await loadShoppingList();
    expect(loaded).toEqual([]);
  });

  it("saves and loads shopping items correctly", async () => {
    const items = [
      {
        id: "item_1",
        name: "Olive oil",
        quantity: "1 bottle",
        checked: false,
        addedAt: Date.now(),
      },
    ];

    await saveShoppingList(items);
    const loaded = await loadShoppingList();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("Olive oil");
    expect(loaded[0].checked).toBe(false);
  });
});
