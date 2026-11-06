import React from "react";

export const RecipeSkeleton: React.FC = () => {
  return (
    <div
      className="bg-cream-50 border border-espresso-200 rounded-3xl p-6 shadow-card animate-pulse-subtle flex flex-col justify-between"
      aria-hidden="true"
    >
      <div>
        {/* Title skeleton */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-7 bg-cream-200 rounded-lg w-3/4"></div>
          <div className="w-8 h-8 bg-cream-200 rounded-full"></div>
        </div>

        {/* Summary skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-cream-200 rounded w-full"></div>
          <div className="h-4 bg-cream-200 rounded w-5/6"></div>
        </div>

        {/* Badges skeleton */}
        <div className="flex gap-2 mb-5">
          <div className="h-6 bg-cream-200 rounded-full w-20"></div>
          <div className="h-6 bg-cream-200 rounded-full w-24"></div>
        </div>

        {/* Ingredients skeleton */}
        <div className="mb-5 space-y-2">
          <div className="h-3 bg-cream-200 rounded w-1/4 mb-3"></div>
          <div className="h-6 bg-cream-200 rounded-lg w-full"></div>
          <div className="h-6 bg-cream-200 rounded-lg w-full"></div>
          <div className="h-6 bg-cream-200 rounded-lg w-full"></div>
        </div>

        {/* Steps skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-cream-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-cream-200 rounded w-full"></div>
          <div className="h-4 bg-cream-200 rounded w-11/12"></div>
          <div className="h-4 bg-cream-200 rounded w-4/5"></div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="pt-4 mt-6 border-t border-espresso-200 flex gap-2">
        <div className="h-9 bg-cream-200 rounded-xl flex-1"></div>
        <div className="h-9 bg-cream-200 rounded-xl w-28"></div>
      </div>
    </div>
  );
};
