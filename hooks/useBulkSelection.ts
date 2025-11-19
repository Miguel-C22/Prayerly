import { useState, useCallback } from "react";

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Toggle selection for a single item
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Check if an item is selected
  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Select multiple items
  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  // Get selected items
  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // Get selected IDs as array
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // Check if any items are selected
  const hasSelection = selectedIds.size > 0;

  // Get selection count
  const selectionCount = selectedIds.size;

  return {
    selectedIds,
    toggleSelection,
    isSelected,
    clearSelection,
    selectMultiple,
    getSelectedItems,
    getSelectedIds,
    hasSelection,
    selectionCount,
  };
}
