"use client";

import React from "react";
import Icon from "@/components/ui/icon/Icon";
import { PrayerCategory } from "@/types/prayer";

interface FilterChipsProps {
  searchQuery: string;
  selectedCategories: string[];
  onRemoveCategory: (category: string) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

const CATEGORY_LABELS: Record<PrayerCategory, string> = {
  personal: "Personal",
  family: "Family",
  friends: "Friends",
  health: "Health",
  work: "Work",
  other: "Other",
};

export default function FilterChips({
  searchQuery,
  selectedCategories,
  onRemoveCategory,
  onClearSearch,
  onClearAll,
}: FilterChipsProps) {
  const hasFilters = searchQuery || selectedCategories.length > 0;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-text-graySecondary">Filters:</span>

      {/* Search query chip */}
      {searchQuery && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-backgrounds-veryLight border border-border-gray text-sm text-text-grayPrimary">
          <Icon icon="search" className="w-3.5 h-3.5 text-text-graySecondary" />
          <span className="max-w-[150px] truncate">{searchQuery}</span>
          <button
            onClick={onClearSearch}
            className="text-text-graySecondary hover:text-text-grayPrimary transition-colors"
            aria-label="Clear search"
          >
            <Icon icon="close" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category chips */}
      {selectedCategories.map((category) => (
        <div
          key={category}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-backgrounds-veryLight border border-border-gray text-sm text-text-grayPrimary"
        >
          <span>
            {CATEGORY_LABELS[category as PrayerCategory] || category}
          </span>
          <button
            onClick={() => onRemoveCategory(category)}
            className="text-text-graySecondary hover:text-text-grayPrimary transition-colors"
            aria-label={`Remove ${category} filter`}
          >
            <Icon icon="close" className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Clear all button */}
      {(searchQuery || selectedCategories.length > 1) && (
        <button
          onClick={onClearAll}
          className="text-sm text-text-purplePrimary hover:underline font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
