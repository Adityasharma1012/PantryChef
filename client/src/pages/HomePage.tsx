import React, { useState } from "react";
import type { Recipe, RecipeRequest } from "@pantrychef/shared";
import { generateRecipesApi, regenerateRecipeApi, ClientApiError } from "../api/client.js";
import { ErrorBanner } from "../components/ErrorBanner.js";
import { FilterControls } from "../components/FilterControls.js";
import { ChefHatIcon } from "../components/Icons.js";
import { IngredientChips } from "../components/IngredientChips.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { RecipeSkeleton } from "../components/RecipeSkeleton.js";
import { useToast } from "../components/Toast.js";

export const HomePage: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(["Pasta", "Garlic", "Olive oil"]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>("Any");
  const [selectedMaxMinutes, setSelectedMaxMinutes] = useState<number | null>(null);
  const [servings, setServings] = useState<number>(2);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);

  const { showToast } = useToast();

  const handleAddIngredient = (item: string) => {
    setIngredients((prev) => [...prev, item]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleDiet = (diet: string) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;

    setIsLoading(true);
    setError(null);

    const payload: RecipeRequest = {
      ingredients,
      diets: selectedDiets,
      cuisine: selectedCuisine,
      maxMinutes: selectedMaxMinutes,
      servings,
      count: 3,
    };

    try {
      const results = await generateRecipesApi(payload);
      setRecipes(results);
      showToast("Generated 3 fresh recipes for your pantry!", "success");
    } catch (err: unknown) {
      if (err instanceof ClientApiError) {
        setError({ code: err.code, message: err.message });
      } else {
        setError({
          code: "GEMINI_UNAVAILABLE",
          message: "An unexpected error occurred while communicating with the recipe server.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCard = async (oldRecipe: Recipe) => {
    setRegeneratingId(oldRecipe.id);
    try {
      const allTitles = recipes.map((r) => r.title);
      const newRecipe = await regenerateRecipeApi({
        ingredients,
        diets: selectedDiets,
        cuisine: selectedCuisine,
        maxMinutes: selectedMaxMinutes,
        servings,
        count: 3,
        replaceTitle: oldRecipe.title,
        exclude: allTitles,
      });

      setRecipes((prev) =>
        prev.map((r) => (r.id === oldRecipe.id ? newRecipe : r))
      );
      showToast(`Regenerated "${newRecipe.title}"!`, "success");
    } catch (err: unknown) {
      if (err instanceof ClientApiError) {
        showToast(err.message, "warning");
      } else {
        showToast("Could not regenerate this recipe. Please try again.", "warning");
      }
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-espresso-900 tracking-tight mb-3">
          What can we cook today?
        </h1>
        <p className="text-sm sm:text-base text-espresso-700 max-w-xl mx-auto leading-relaxed">
          Tell PantryChef what ingredients you have in your kitchen, pick any diet or time constraints, and let our Gemini culinary assistant craft 3 custom recipes.
        </p>
      </div>

      {/* Main Pantry Input Card */}
      <div className="bg-cream-100/60 border border-espresso-200/80 rounded-3xl p-5 sm:p-8 shadow-card mb-8">
        <IngredientChips
          ingredients={ingredients}
          onAdd={handleAddIngredient}
          onRemove={handleRemoveIngredient}
          maxLimit={30}
        />

        <FilterControls
          selectedDiets={selectedDiets}
          onToggleDiet={handleToggleDiet}
          selectedCuisine={selectedCuisine}
          onCuisineChange={setSelectedCuisine}
          selectedMaxMinutes={selectedMaxMinutes}
          onMaxMinutesChange={setSelectedMaxMinutes}
          servings={servings}
          onServingsChange={setServings}
        />

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={ingredients.length === 0 || isLoading}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 bg-paprika-500 hover:bg-paprika-600 disabled:opacity-50 disabled:hover:bg-paprika-500 text-cream-50 font-bold text-base rounded-2xl shadow-warm flex items-center justify-center gap-2.5 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-paprika-300"
          >
            <ChefHatIcon className="w-5 h-5" />
            <span>
              {isLoading
                ? "Simmering customized recipes..."
                : `Generate ${recipes.length > 0 ? "New" : "3"} Recipes`}
            </span>
          </button>
        </div>
      </div>

      {/* Error Banner with aria-live */}
      {error && (
        <ErrorBanner
          code={error.code}
          message={error.message}
          onRetry={handleGenerate}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8"
          aria-live="polite"
          aria-busy="true"
        >
          <RecipeSkeleton />
          <RecipeSkeleton />
          <RecipeSkeleton />
        </div>
      )}

      {/* Generated Recipes Grid */}
      {!isLoading && recipes.length > 0 && (
        <section
          aria-label="Generated Recipes"
          className="mt-8"
          aria-live="polite"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold text-espresso-900">
              Suggested Creations
            </h2>
            <span className="text-xs text-espresso-600 font-medium">
              3 personalized ideas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onRegenerate={handleRegenerateCard}
                isRegenerating={regeneratingId === recipe.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State before first generation */}
      {!isLoading && recipes.length === 0 && !error && (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-espresso-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-cream-200 text-espresso-600 flex items-center justify-center">
            <ChefHatIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-espresso-800 mb-1">
            Your kitchen is waiting
          </h3>
          <p className="text-sm text-espresso-600 max-w-sm mx-auto">
            Add ingredients like tomatoes, eggs, pasta, or spinach above and tap "Generate Recipes" to discover dishes tailored to your pantry.
          </p>
        </div>
      )}
    </div>
  );
};
