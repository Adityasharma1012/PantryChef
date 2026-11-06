import React from "react";
import { UsersIcon, ClockIcon } from "./Icons.js";

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Halal",
  "Keto",
];

export const CUISINE_OPTIONS = [
  "Any",
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "Indian",
  "American",
  "French",
  "Middle Eastern",
];

export const TIME_OPTIONS = [
  { label: "Any time", value: null },
  { label: "15 min (quick)", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
];

interface FilterControlsProps {
  selectedDiets: string[];
  onToggleDiet: (diet: string) => void;
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
  selectedMaxMinutes: number | null;
  onMaxMinutesChange: (minutes: number | null) => void;
  servings: number;
  onServingsChange: (servings: number) => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedDiets,
  onToggleDiet,
  selectedCuisine,
  onCuisineChange,
  selectedMaxMinutes,
  onMaxMinutesChange,
  servings,
  onServingsChange,
}) => {
  return (
    <div className="space-y-6 pt-4 border-t border-espresso-200">
      {/* Dietary preferences */}
      <div>
        <label className="block text-sm font-semibold text-espresso-800 mb-2">
          Dietary Restrictions & Preferences
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Dietary preferences">
          {DIETARY_OPTIONS.map((diet) => {
            const isSelected = selectedDiets.includes(diet);
            return (
              <button
                key={diet}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onToggleDiet(diet)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500 ${
                  isSelected
                    ? "bg-basil-600 text-cream-50 shadow-sm border border-basil-700"
                    : "bg-cream-100 hover:bg-cream-200 text-espresso-800 border border-espresso-200"
                }`}
              >
                {isSelected ? `✓ ${diet}` : diet}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Cuisine, Time, Servings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cuisine Select */}
        <div>
          <label
            htmlFor="cuisine-select"
            className="block text-sm font-semibold text-espresso-800 mb-1.5"
          >
            Cuisine Style
          </label>
          <div className="relative">
            <select
              id="cuisine-select"
              value={selectedCuisine}
              onChange={(e) => onCuisineChange(e.target.value)}
              className="w-full min-h-tap px-3 py-2 bg-cream-50 border-2 border-espresso-200 rounded-xl text-sm text-espresso-900 focus:border-paprika-500 focus:outline-none transition-colors"
            >
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Max Cooking Time Select */}
        <div>
          <label
            htmlFor="time-select"
            className="block text-sm font-semibold text-espresso-800 mb-1.5 flex items-center gap-1.5"
          >
            <ClockIcon className="w-4 h-4 text-espresso-600" />
            <span>Max Cooking Time</span>
          </label>
          <select
            id="time-select"
            value={selectedMaxMinutes === null ? "null" : String(selectedMaxMinutes)}
            onChange={(e) => {
              const val = e.target.value === "null" ? null : parseInt(e.target.value, 10);
              onMaxMinutesChange(val);
            }}
            className="w-full min-h-tap px-3 py-2 bg-cream-50 border-2 border-espresso-200 rounded-xl text-sm text-espresso-900 focus:border-paprika-500 focus:outline-none transition-colors"
          >
            {TIME_OPTIONS.map((opt) => (
              <option
                key={opt.label}
                value={opt.value === null ? "null" : String(opt.value)}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Servings Stepper */}
        <div>
          <label className="block text-sm font-semibold text-espresso-800 mb-1.5 flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-espresso-600" />
            <span>Servings</span>
          </label>
          <div className="flex items-center justify-between min-h-tap px-2 bg-cream-50 border-2 border-espresso-200 rounded-xl">
            <button
              type="button"
              disabled={servings <= 1}
              onClick={() => onServingsChange(Math.max(1, servings - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-espresso-800 hover:bg-cream-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="font-semibold text-sm text-espresso-900 px-2" aria-live="polite">
              {servings} {servings === 1 ? "person" : "people"}
            </span>
            <button
              type="button"
              disabled={servings >= 12}
              onClick={() => onServingsChange(Math.min(12, servings + 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-espresso-800 hover:bg-cream-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-paprika-500"
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
