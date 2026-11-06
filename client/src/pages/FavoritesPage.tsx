import React from "react";
import { Link } from "react-router-dom";
import { HeartFilledIcon, ChefHatIcon } from "../components/Icons.js";
import { RecipeCard } from "../components/RecipeCard.js";
import { useFavorites } from "../context/FavoritesContext.js";

export const FavoritesPage: React.FC = () => {
  const { favorites, isLoading } = useFavorites();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-espresso-200">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-espresso-900 tracking-tight flex items-center gap-2.5">
            <HeartFilledIcon className="w-7 h-7 text-paprika-500" />
            <span>Saved Favorites</span>
          </h1>
          <p className="text-sm text-espresso-600 mt-1">
            Always available offline on this device.
          </p>
        </div>
        <span className="text-sm font-semibold text-espresso-700 bg-cream-100 px-3 py-1 rounded-full border border-espresso-200">
          {favorites.length} {favorites.length === 1 ? "recipe" : "recipes"}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-espresso-600">
          Loading saved recipes...
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 px-4 bg-cream-100/50 rounded-3xl border border-dashed border-espresso-200">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-paprika-50 text-paprika-500 flex items-center justify-center">
            <HeartFilledIcon className="w-7 h-7 text-paprika-400" />
          </div>
          <h2 className="font-serif text-xl font-bold text-espresso-900 mb-2">
            No saved favorites yet
          </h2>
          <p className="text-sm text-espresso-600 max-w-md mx-auto mb-6 leading-relaxed">
            Whenever you generate recipes you love, tap the heart button to store them here. You can view them anytime, even without an internet connection.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-paprika-500 hover:bg-paprika-600 text-cream-50 font-bold text-sm rounded-xl transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
          >
            <ChefHatIcon className="w-4 h-4" />
            <span>Discover Recipes</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
};
