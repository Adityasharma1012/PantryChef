import React, { useState, type KeyboardEvent } from "react";
import { XIcon } from "./Icons.js";

interface IngredientChipsProps {
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
  maxLimit?: number;
}

const COMMON_SUGGESTIONS = [
  "Tomatoes",
  "Garlic",
  "Onion",
  "Olive oil",
  "Eggs",
  "Pasta",
  "Rice",
  "Cheese",
  "Spinach",
  "Chicken breast",
];

export const IngredientChips: React.FC<IngredientChipsProps> = ({
  ingredients,
  onAdd,
  onRemove,
  maxLimit = 30,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleCommit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (trimmed.length > 40) {
      setInputError("Ingredient name must be 40 characters or less.");
      return;
    }

    if (ingredients.length >= maxLimit) {
      setInputError(`Maximum of ${maxLimit} ingredients reached.`);
      return;
    }

    const lower = trimmed.toLowerCase();
    const isDuplicate = ingredients.some((i) => i.toLowerCase() === lower);
    if (isDuplicate) {
      setInputError(`"${trimmed}" is already in your pantry.`);
      return;
    }

    setInputError(null);
    onAdd(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleCommit(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && ingredients.length > 0) {
      onRemove(ingredients.length - 1);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="ingredient-input"
          className="block text-sm font-semibold text-espresso-800"
        >
          What's in your pantry?
        </label>
        <span
          className={`text-xs font-medium ${
            ingredients.length >= maxLimit
              ? "text-paprika-600 font-bold"
              : "text-espresso-600"
          }`}
          aria-live="polite"
        >
          {ingredients.length}/{maxLimit} ingredients
        </span>
      </div>

      {/* Input container with chips */}
      <div className="min-h-[56px] p-2 bg-cream-50 border-2 border-espresso-200 focus-within:border-paprika-500 rounded-2xl flex flex-wrap items-center gap-2 transition-colors shadow-sm">
        {ingredients.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl bg-paprika-50 border border-paprika-200 text-espresso-900 text-sm font-medium animate-scale-in"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="min-h-[28px] min-w-[28px] p-1 rounded-lg text-paprika-600 hover:text-paprika-700 hover:bg-paprika-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
              aria-label={`Remove ${item}`}
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        <input
          id="ingredient-input"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputError(null);
            setInputValue(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              handleCommit(inputValue);
            }
          }}
          disabled={ingredients.length >= maxLimit}
          placeholder={
            ingredients.length === 0
              ? "Add an ingredient (e.g., tomatoes, pasta, garlic)..."
              : ingredients.length >= maxLimit
                ? "Limit reached"
                : "Add another..."
          }
          className="flex-1 min-w-[160px] bg-transparent border-none py-2 px-2 text-sm text-espresso-900 placeholder-espresso-400 focus:outline-none focus:ring-0 disabled:opacity-50"
          aria-describedby="ingredient-help"
        />
      </div>

      {inputError ? (
        <p className="mt-1.5 text-xs text-paprika-600 font-medium" role="alert">
          {inputError}
        </p>
      ) : (
        <p id="ingredient-help" className="mt-1.5 text-xs text-espresso-600">
          Press <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-espresso-800 font-mono text-[11px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-cream-200 rounded text-espresso-800 font-mono text-[11px]">,</kbd> to add. Backspace removes the last item.
        </p>
      )}

      {/* Quick Suggestions */}
      {ingredients.length < 5 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wider text-espresso-500 font-semibold mb-2">
            Quick additions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUGGESTIONS.filter(
              (s) => !ingredients.some((i) => i.toLowerCase() === s.toLowerCase())
            )
              .slice(0, 7)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleCommit(suggestion)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-cream-100 hover:bg-cream-200 text-espresso-800 border border-espresso-200 transition-colors flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
                >
                  <span>+</span> {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
