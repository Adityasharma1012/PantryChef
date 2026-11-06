import { describe, expect, it } from "vitest";
import { mergeShoppingItems, type ShoppingItem } from "../storage/storage.js";

describe("Shopping List Merge Function Tests", () => {
  it("merges new ingredients into an empty shopping list", () => {
    const existing: ShoppingItem[] = [];
    const incoming = [
      { name: "Extra virgin olive oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "3 cloves" },
    ];

    const { updated, addedCount } = mergeShoppingItems(existing, incoming);

    expect(addedCount).toBe(2);
    expect(updated).toHaveLength(2);
    expect(updated.map((i) => i.name)).toEqual([
      "Extra virgin olive oil",
      "Garlic",
    ]);
  });

  it("deduplicates case-insensitively and updates quantity when matching", () => {
    const existing: ShoppingItem[] = [
      {
        id: "item_1",
        name: "Garlic",
        quantity: "2 cloves",
        checked: false,
        addedAt: 1000,
      },
    ];

    const incoming = [
      { name: "garlic", quantity: "3 cloves" },
      { name: "Basil", quantity: "1 bunch" },
    ];

    const { updated, addedCount } = mergeShoppingItems(existing, incoming);

    expect(addedCount).toBe(1); // Only Basil is counted as a new item
    expect(updated).toHaveLength(2);

    const garlicItem = updated.find((i) => i.name.toLowerCase() === "garlic");
    expect(garlicItem).toBeDefined();
    expect(garlicItem?.quantity).toContain("2 cloves");
    expect(garlicItem?.quantity).toContain("3 cloves");

    const basilItem = updated.find((i) => i.name === "Basil");
    expect(basilItem).toBeDefined();
    expect(basilItem?.quantity).toBe("1 bunch");
  });

  it("ignores empty or whitespace-only ingredient names", () => {
    const existing: ShoppingItem[] = [];
    const incoming = [
      { name: "", quantity: "1 cup" },
      { name: "   ", quantity: "" },
      { name: "Pepper", quantity: "to taste" },
    ];

    const { updated, addedCount } = mergeShoppingItems(existing, incoming);

    expect(addedCount).toBe(1);
    expect(updated).toHaveLength(1);
    expect(updated[0].name).toBe("Pepper");
  });
});
