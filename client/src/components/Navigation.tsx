import React from "react";
import { NavLink } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.js";
import { useShoppingList } from "../context/ShoppingListContext.js";
import {
  ChefHatIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  HomeIcon,
  ShoppingBagIcon,
} from "./Icons.js";

interface NavigationProps {
  onInstallClick?: () => void;
  canInstall?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  onInstallClick,
  canInstall,
}) => {
  const { favorites } = useFavorites();
  const { items } = useShoppingList();

  const uncheckedCount = items.filter((i) => !i.checked).length;
  const favoritesCount = favorites.length;

  return (
    <>
      {/* Top Navigation for Desktop */}
      <header className="hidden md:block sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-espresso-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-3 text-espresso-900 group focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-paprika-500 text-cream-50 flex items-center justify-center shadow-md group-hover:bg-paprika-600 transition-colors">
              <ChefHatIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-espresso-900">
                Pantry<span className="text-paprika-500">Chef</span>
              </span>
              <span className="block text-xs uppercase tracking-wider text-espresso-600 font-medium -mt-1">
                AI Recipe Studio
              </span>
            </div>
          </NavLink>

          <nav className="flex items-center gap-2" aria-label="Desktop Navigation">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `min-h-tap px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-paprika-500 text-cream-50 shadow-sm"
                    : "text-espresso-700 hover:bg-cream-100 hover:text-espresso-900"
                }`
              }
            >
              <HomeIcon className="w-4 h-4" />
              <span>Pantry</span>
            </NavLink>

            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `min-h-tap px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 relative transition-all ${
                  isActive
                    ? "bg-paprika-500 text-cream-50 shadow-sm"
                    : "text-espresso-700 hover:bg-cream-100 hover:text-espresso-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <HeartFilledIcon className="w-4 h-4 text-cream-50" />
                  ) : (
                    <HeartOutlineIcon className="w-4 h-4" />
                  )}
                  <span>Favorites</span>
                  {favoritesCount > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                        isActive
                          ? "bg-cream-50 text-paprika-600"
                          : "bg-paprika-100 text-paprika-600"
                      }`}
                    >
                      {favoritesCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/shopping-list"
              className={({ isActive }) =>
                `min-h-tap px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 relative transition-all ${
                  isActive
                    ? "bg-paprika-500 text-cream-50 shadow-sm"
                    : "text-espresso-700 hover:bg-cream-100 hover:text-espresso-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Shopping List</span>
                  {uncheckedCount > 0 && (
                    <span
                      className={`ml-1 px-2 py-0.5 text-xs rounded-full font-semibold ${
                        isActive
                          ? "bg-cream-50 text-paprika-600"
                          : "bg-saffron-100 text-saffron-700"
                      }`}
                    >
                      {uncheckedCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>

            {canInstall && (
              <button
                type="button"
                onClick={onInstallClick}
                className="min-h-tap ml-3 px-3.5 py-2 border border-paprika-500 text-paprika-600 hover:bg-paprika-50 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
              >
                Install App
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-espresso-200 px-4 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-paprika-500 text-cream-50 flex items-center justify-center shadow">
            <ChefHatIcon className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-espresso-900">
            Pantry<span className="text-paprika-500">Chef</span>
          </span>
        </NavLink>

        {canInstall && (
          <button
            type="button"
            onClick={onInstallClick}
            className="text-xs px-2.5 py-1.5 border border-paprika-500 text-paprika-600 rounded-lg font-medium"
          >
            Install
          </button>
        )}
      </div>

      {/* Bottom Tab Bar for Mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-espresso-200 px-2 py-1 flex items-center justify-around shadow-warm"
        aria-label="Mobile Bottom Navigation"
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 min-h-[52px] flex flex-col items-center justify-center rounded-xl py-1 text-xs font-medium transition-colors ${
              isActive
                ? "text-paprika-600 font-semibold"
                : "text-espresso-600 hover:text-espresso-900"
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `flex-1 min-h-[52px] flex flex-col items-center justify-center rounded-xl py-1 text-xs font-medium relative transition-colors ${
              isActive
                ? "text-paprika-600 font-semibold"
                : "text-espresso-600 hover:text-espresso-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                {isActive ? (
                  <HeartFilledIcon className="w-5 h-5 mb-0.5 text-paprika-600" />
                ) : (
                  <HeartOutlineIcon className="w-5 h-5 mb-0.5" />
                )}
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-paprika-500 text-cream-50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </span>
                )}
              </div>
              <span>Favorites</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/shopping-list"
          className={({ isActive }) =>
            `flex-1 min-h-[52px] flex flex-col items-center justify-center rounded-xl py-1 text-xs font-medium relative transition-colors ${
              isActive
                ? "text-paprika-600 font-semibold"
                : "text-espresso-600 hover:text-espresso-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <ShoppingBagIcon className="w-5 h-5 mb-0.5" />
                {uncheckedCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-saffron-600 text-cream-50 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {uncheckedCount > 9 ? "9+" : uncheckedCount}
                  </span>
                )}
              </div>
              <span>Shopping</span>
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
};
