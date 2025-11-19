"use client";

import React from "react";
import SearchInput from "./SearchInput";
import FilterDropdown from "./FilterDropdown";
import FilterChips from "./FilterChips";
import ThemeToggle from "@/components/settings/theme/ThemeToggle";
import Icon from "@/components/ui/icon/Icon";
import { PrayerCategory } from "@/types/prayer";

interface FilterBarProps {
  // Search props
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Category filter props
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  availableCategories?: PrayerCategory[];

  // Clear functions
  onClearSearch: () => void;
  onClearAll: () => void;

  // Selection mode
  selectionMode?: boolean;
  onToggleSelectionMode?: () => void;

  // Optional features
  showThemeToggle?: boolean;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  showDeleteButton?: boolean;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search prayers...",
  selectedCategories,
  onToggleCategory,
  onRemoveCategory,
  availableCategories,
  onClearSearch,
  onClearAll,
  selectionMode = false,
  onToggleSelectionMode,
  showThemeToggle = true,
  showSearch = true,
  showCategoryFilter = true,
  showDeleteButton = true,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || selectedCategories.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Search and action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Search input - takes full width on mobile, flex-1 on desktop */}
        {showSearch && (
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {/* Action buttons - stack on mobile, row on desktop */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {showThemeToggle && <ThemeToggle />}

          {showCategoryFilter && (
            <FilterDropdown
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
              availableCategories={availableCategories}
            />
          )}

          {showDeleteButton && onToggleSelectionMode && (
            <button
              onClick={onToggleSelectionMode}
              className={`h-10 px-4 rounded-full border transition-colors flex items-center gap-2 ${
                selectionMode
                  ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                  : "border-border-gray bg-backgrounds-grayLight text-text-grayPrimary hover:bg-backgrounds-grayLight/80"
              }`}
              aria-label={selectionMode ? "Cancel selection" : "Delete prayers"}
            >
              <Icon icon="trash" className="w-5 h-5" />
              <span className="hidden sm:inline">
                {selectionMode ? "Cancel" : "Delete"}
              </span>
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <FilterChips
          searchQuery={searchQuery}
          selectedCategories={selectedCategories}
          onRemoveCategory={onRemoveCategory}
          onClearSearch={onClearSearch}
          onClearAll={onClearAll}
        />
      )}
    </div>
  );
}
