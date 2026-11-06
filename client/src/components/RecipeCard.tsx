import React, { useState } from "react";
import type { Recipe } from "@pantrychef/shared";
import { useFavorites } from "../context/FavoritesContext.js";
import { useShoppingList } from "../context/ShoppingListContext.js";
import { useToast } from "./Toast.js";
import {
  CartAddIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  RefreshIcon,
  UsersIcon,
} from "./Icons.js";

interface RecipeCardProps {
  recipe: Recipe;
  onRegenerate?: (recipe: Recipe) => Promise<void> | void;
  isRegenerating?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onRegenerate,
  isRegenerating = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addMissingIngredients } = useShoppingList();
  const { showToast } = useToast();

  const [stepsOpen, setStepsOpen] = useState(true);

  const favorited = isFavorite(recipe.id);

  const missingIngredients = recipe.ingredients.filter((i) => !i.haveIt);
  const pantryIngredients = recipe.ingredients.filter((i) => i.haveIt);

  const handleToggleFavorite = () => {
    toggleFavorite(recipe);
    if (!favorited) {
      showToast(`Saved "${recipe.title}" to Favorites!`, "success");
    } else {
      showToast(`Removed "${recipe.title}" from Favorites.`, "info");
    }
  };

  const handleAddMissing = () => {
    if (missingIngredients.length === 0) {
      showToast("All ingredients are already in your pantry!", "info");
      return;
    }

    const added = addMissingIngredients(missingIngredients);
    showToast(
      `Added ${added} ${added === 1 ? "item" : "items"} to your Shopping List.`,
      "success"
    );
  };

  const handleRegenerate = async () => {
    if (onRegenerate && !isRegenerating) {
      await onRegenerate(recipe);
    }
  };

  return (
    <article
      className="bg-cream-50 border border-espresso-200 rounded-3xl p-6 shadow-card hover:shadow-warm transition-shadow flex flex-col justify-between"
      aria-labelledby={`recipe-title-${recipe.id}`}
    >
      <div>
        {/* Header: Title and Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            id={`recipe-title-${recipe.id}`}
            className="font-serif text-xl sm:text-2xl font-bold text-espresso-900 leading-snug"
          >
            {recipe.title}
          </h3>
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={favorited ? `Remove ${recipe.title} from favorites` : `Save ${recipe.title} to favorites`}
            className="min-h-tap min-w-tap p-2.5 rounded-full hover:bg-cream-100 text-espresso-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
          >
            {favorited ? (
              <HeartFilledIcon className="w-6 h-6 text-paprika-500" />
            ) : (
              <HeartOutlineIcon className="w-6 h-6 hover:text-paprika-500" />
            )}
          </button>
        </div>

        {/* Summary */}
        <p className="text-sm text-espresso-700 mb-4 leading-relaxed">
          {recipe.summary}
        </p>

        {/* Badges: Time & Servings */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-semibold">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{recipe.timeMinutes} mins</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 border border-espresso-200 text-espresso-700 text-xs font-semibold">
            <UsersIcon className="w-3.5 h-3.5" />
            <span>{recipe.servings} servings</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-basil-50 border border-basil-200 text-basil-700 text-xs font-semibold">
            <span>{pantryIngredients.length} in pantry</span>
          </span>
          {missingIngredients.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-paprika-50 border border-paprika-200 text-paprika-700 text-xs font-semibold">
              <span>{missingIngredients.length} to buy</span>
            </span>
          )}
        </div>

        {/* Ingredients section */}
        <div className="mb-5">
          <h4 className="text-xs uppercase tracking-wider font-bold text-espresso-600 mb-2.5">
            Ingredients
          </h4>
          <ul className="space-y-1.5" aria-label="Ingredients list">
            {recipe.ingredients.map((ing, idx) => (
              <li
                key={`${ing.name}-${idx}`}
                className={`text-sm py-1 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                  ing.haveIt
                    ? "bg-basil-50/60 text-espresso-900"
                    : "bg-cream-100/70 text-espresso-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {ing.haveIt ? (
                    <span
                      className="w-4 h-4 rounded-full bg-basil-500 text-cream-50 flex items-center justify-center flex-shrink-0"
                      title="In pantry"
                      aria-label="In pantry"
                    >
                      <CheckIcon className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full border border-saffron-600 text-saffron-600 flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      title="Need to buy"
                      aria-label="Need to buy"
                    >
                      +
                    </span>
                  )}
                  <span className={ing.haveIt ? "font-medium" : ""}>
                    {ing.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-espresso-600">{ing.quantity}</span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      ing.haveIt
                        ? "bg-basil-100 text-basil-700"
                        : "bg-saffron-100 text-saffron-700"
                    }`}
                  >
                    {ing.haveIt ? "Pantry" : "Buy"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Collapsible */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setStepsOpen(!stepsOpen)}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-bold text-espresso-700 py-1.5 border-b border-espresso-200 hover:text-espresso-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
            aria-expanded={stepsOpen}
          >
            <span>Cooking Steps ({recipe.steps.length})</span>
            {stepsOpen ? (
              <ChevronUpIcon className="w-4 h-4 text-espresso-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-espresso-600" />
            )}
          </button>

          {stepsOpen && (
            <ol className="mt-3 space-y-2.5 text-sm text-espresso-800" aria-label="Step-by-step instructions">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-cream-200 text-espresso-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step.replace(/^\d+\.\s*/, "")}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-4 border-t border-espresso-200 flex flex-wrap items-center gap-2">
        {missingIngredients.length > 0 && (
          <button
            type="button"
            onClick={handleAddMissing}
            className="min-h-tap flex-1 px-3 py-2 bg-saffron-50 hover:bg-saffron-100 text-saffron-700 border border-saffron-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            <CartAddIcon className="w-4 h-4" />
            <span>Add missing ({missingIngredients.length})</span>
          </button>
        )}

        {onRegenerate && (
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="min-h-tap px-3.5 py-2 bg-cream-100 hover:bg-cream-200 disabled:opacity-50 text-espresso-800 border border-espresso-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
            title="Replace this recipe with a new suggestion"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Regenerating..." : "Regenerate"}</span>
          </button>
        )}
      </div>
    </article>
  );
};
