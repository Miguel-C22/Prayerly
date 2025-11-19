import { useQueryState, parseAsString, parseAsArrayOf } from "nuqs";

export function usePrayerFilters() {
  // Search query - nuqs will automatically sync with URL
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );

  // Categories (multi-select) - nuqs will automatically sync with URL
  // Note: parseAsArrayOf without separator handles repeated params: ?categories=val1&categories=val2
  const [categories, setCategories] = useQueryState(
    "categories",
    parseAsArrayOf(parseAsString).withDefault([])
  );

  // Helper function to add a category
  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  // Helper function to remove a category
  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  // Helper function to toggle a category
  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      removeCategory(category);
    } else {
      addCategory(category);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategories([]);
    // Keep status as is, don't reset to active
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" || categories.length > 0;

  return {
    // State
    searchQuery,
    categories,
    hasActiveFilters,

    // Setters
    setSearchQuery,
    setCategories,

    // Helper functions
    addCategory,
    removeCategory,
    toggleCategory,
    clearFilters,
  };
}
