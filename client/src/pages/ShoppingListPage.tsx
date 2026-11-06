import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChefHatIcon,
  CheckIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "../components/Icons.js";
import { useShoppingList } from "../context/ShoppingListContext.js";

export const ShoppingListPage: React.FC = () => {
  const { items, addItem, toggleItem, removeItem, clearChecked, isLoading } =
    useShoppingList();

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const checkedCount = items.filter((i) => i.checked).length;
  const remainingCount = items.length - checkedCount;

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = itemName.trim();
    if (!trimmed) {
      setInputError("Please enter an item name.");
      return;
    }

    addItem(trimmed, itemQuantity.trim());
    setItemName("");
    setItemQuantity("");
    setInputError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-espresso-200">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-espresso-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBagIcon className="w-7 h-7 text-saffron-600" />
            <span>Shopping List</span>
          </h1>
          <p className="text-sm text-espresso-600 mt-1">
            Persisted locally and available offline while you shop.
          </p>
        </div>

        {items.length > 0 && checkedCount > 0 && (
          <button
            type="button"
            onClick={clearChecked}
            className="min-h-tap px-3 py-1.5 text-xs font-semibold text-paprika-600 hover:text-paprika-700 bg-paprika-50 hover:bg-paprika-100 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
          >
            Clear Checked ({checkedCount})
          </button>
        )}
      </div>

      {/* Manual Add Form */}
      <form
        onSubmit={handleManualAdd}
        className="bg-cream-100/70 border border-espresso-200 rounded-2xl p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <label htmlFor="manual-item-name" className="sr-only">
              Ingredient or Item Name
            </label>
            <input
              id="manual-item-name"
              type="text"
              value={itemName}
              onChange={(e) => {
                setInputError(null);
                setItemName(e.target.value);
              }}
              placeholder="Add item (e.g., olive oil, parmesan)..."
              className="w-full min-h-tap px-3.5 py-2 bg-cream-50 border border-espresso-200 rounded-xl text-sm text-espresso-900 placeholder-espresso-400 focus:border-paprika-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="w-full sm:w-36">
            <label htmlFor="manual-item-quantity" className="sr-only">
              Quantity or Amount
            </label>
            <input
              id="manual-item-quantity"
              type="text"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              placeholder="Quantity (e.g. 1 jar)"
              className="w-full min-h-tap px-3.5 py-2 bg-cream-50 border border-espresso-200 rounded-xl text-sm text-espresso-900 placeholder-espresso-400 focus:border-paprika-500 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            className="min-h-tap px-5 py-2 bg-paprika-500 hover:bg-paprika-600 text-cream-50 font-bold text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500 flex-shrink-0"
          >
            Add to List
          </button>
        </div>

        {inputError && (
          <p className="mt-2 text-xs text-paprika-600 font-medium" role="alert">
            {inputError}
          </p>
        )}
      </form>

      {/* Item List */}
      {isLoading ? (
        <div className="py-12 text-center text-espresso-600">
          Loading your shopping items...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-cream-100/50 rounded-3xl border border-dashed border-espresso-200">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center">
            <ShoppingBagIcon className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-xl font-bold text-espresso-900 mb-2">
            Your shopping list is clear
          </h2>
          <p className="text-sm text-espresso-600 max-w-md mx-auto mb-6 leading-relaxed">
            When you generate recipes, tap "Add missing to list" to send any needed ingredients directly here, or add items manually using the form above.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-paprika-500 hover:bg-paprika-600 text-cream-50 font-bold text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
          >
            <ChefHatIcon className="w-4 h-4" />
            <span>Generate Recipes</span>
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between text-xs text-espresso-600 font-semibold mb-3 px-2">
            <span>
              {remainingCount} {remainingCount === 1 ? "item remaining" : "items remaining"}
            </span>
            {checkedCount > 0 && <span>{checkedCount} checked off</span>}
          </div>

          <ul className="space-y-2" aria-label="Shopping items">
            {items.map((item) => (
              <li
                key={item.id}
                className={`min-h-[52px] px-4 py-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.checked
                    ? "bg-cream-100/50 border-espresso-200 opacity-60"
                    : "bg-cream-50 border-espresso-200 shadow-sm"
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 select-none min-h-tap">
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      item.checked
                        ? "bg-basil-600 border-basil-600 text-cream-50"
                        : "border-espresso-400 bg-cream-50"
                    }`}
                  >
                    {item.checked && <CheckIcon className="w-4 h-4" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                    className="sr-only"
                    aria-label={`Mark ${item.name} as ${item.checked ? "unpurchased" : "purchased"}`}
                  />
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-sm font-medium ${
                        item.checked
                          ? "line-through text-espresso-500"
                          : "text-espresso-900"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="text-xs text-espresso-500 font-normal">
                        ({item.quantity})
                      </span>
                    )}
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Delete ${item.name} from list`}
                  className="min-h-tap min-w-tap p-2 rounded-xl text-espresso-500 hover:text-paprika-600 hover:bg-paprika-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
