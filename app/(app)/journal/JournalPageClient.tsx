"use client";

import React, { useEffect, useState } from "react";
import PrayerRequestDrawer from "@/components/prayer/add-prayer/PrayerDrawer";
import BibleVerse from "@/components/bible/BibleVerse";
import useTabs from "@/hooks/useTabs";
import { Prayer } from "@/types/prayer";
import {
  getPrayers,
  getSinglePrayerClient,
} from "@/utils/client/prayersClient";
import ViewPrayerDrawer from "@/components/prayer/view-prayer/ViewPrayerDrawer";
import ContentCard from "@/components/ui/cards/ContentCard";
import FilterBar from "@/components/filters/FilterBar";
import BulkActionBar from "@/components/filters/BulkActionBar";
import { usePrayerFilters } from "@/hooks/usePrayerFilters";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { deleteReflectionsAction } from "@/app/actions/reflectionActions";
import { getReflectionsFilteredClient } from "@/utils/client/getReflectionsFilteredClient";

export interface ReflectionEntry {
  id: string;
  reflection_id: string;
  title: string;
  created_at: string;
  category: string | null;
  reflection: string;
}

export default function JournalPageClient() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>("");
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);

  // Filter hooks
  const filters = usePrayerFilters();

  // Bulk selection hooks
  const bulkSelection = useBulkSelection(reflections);

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Exiting selection mode, clear selections
      bulkSelection.clearSelection();
    }
  };

  const allReflections = reflections;
  const activeReflections = reflections.filter(
    (r) => prayers.find((p) => p.id === r.id && !p.is_answered && !p.is_archived)
  );
  const answeredReflections = reflections.filter(
    (r) => prayers.find((p) => p.id === r.id && p.is_answered)
  );

  const { displayTabs, selectedTab } = useTabs([
    { tab: "All Entries", amount: allReflections.length },
    { tab: "Active", amount: activeReflections.length },
    { tab: "Answered", amount: answeredReflections.length },
  ]);

  const handlePrayerSubmitted = (prayerData: any, response: any) => {
    // Create the optimistic prayer object
    const optimisticPrayer: Prayer = {
      id: response.prayer.id,
      user_id: response.prayer.user_id,
      title: prayerData.title,
      description: prayerData.description || null,
      category: prayerData.category || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      metadata: null,
      is_answered: false,
      is_archived: false,
    };

    setPrayers((prev) => [optimisticPrayer, ...prev]);
  };

  const handleViewDetails = async () => {
    try {
      const prayer = await getSinglePrayerClient(selectedPrayerId);
      setSelectedPrayer(prayer);
    } catch (error) {
      console.error("Failed to fetch prayer:", error);
    }
  };

  const refetchPrayers = async () => {
    const newPrayers = await getPrayers();
    setPrayers(newPrayers);
    setSelectedPrayerId("");
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = bulkSelection.getSelectedIds();
      // Get reflection IDs from selected items
      const reflectionIds = reflections
        .filter((r) => selectedIds.includes(r.id))
        .map((r) => r.reflection_id);

      const result = await deleteReflectionsAction(reflectionIds);

      if (result.success) {
        // Optimistically remove from UI
        setReflections((prev) =>
          prev.filter((r) => !reflectionIds.includes(r.reflection_id))
        );
        bulkSelection.clearSelection();
        setSelectionMode(false); // Exit selection mode
      } else {
        alert(`Failed to delete reflections: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting reflections:", error);
      alert("Failed to delete reflections. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch filtered reflections when filters change
  useEffect(() => {
    const fetchFilteredReflections = async () => {
      try {
        // Map selectedTab to status for API
        let status: "active" | "answered" | "archived" | "all" = "all";
        if (selectedTab === "Active") status = "active";
        else if (selectedTab === "Answered") status = "answered";
        else status = "all"; // "All Entries" shows all

        const filteredReflections = await getReflectionsFilteredClient({
          searchQuery: filters.searchQuery,
          categories: filters.categories,
          status,
        });
        setReflections(filteredReflections);
      } catch (error) {
        console.error("Error fetching filtered reflections:", error);
      }
    };

    fetchFilteredReflections();
  }, [filters.searchQuery, filters.categories, selectedTab]);

  useEffect(() => {
    if (selectedPrayerId) {
      handleViewDetails();
    }
  }, [selectedPrayerId]);

  return (
    <div className="flex flex-col gap-8">
      <PrayerRequestDrawer onPrayerSubmitted={handlePrayerSubmitted} />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        selectedCategories={filters.categories}
        onToggleCategory={filters.toggleCategory}
        onRemoveCategory={filters.removeCategory}
        onClearSearch={() => filters.setSearchQuery("")}
        onClearAll={filters.clearFilters}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        searchPlaceholder="Search reflections..."
      />

      <BibleVerse
        verse="The prayer of a righteous person is powerful and effective."
        chapter="James 5:16"
      />

      {/* Bulk Action Bar - only show when items are selected */}
      {bulkSelection.hasSelection && (
        <BulkActionBar
          selectionCount={bulkSelection.selectionCount}
          onClearSelection={bulkSelection.clearSelection}
          onDeleteSelected={handleBulkDelete}
          isDeleting={isDeleting}
        />
      )}

      <div className="flex flex-col gap-4">
        {displayTabs()}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reflections.map((item) => (
            <ContentCard
              variant="combo"
              key={item.reflection_id}
              id={item.id}
              title={item.title}
              reflection={item.reflection}
              date={new Date(item.created_at).toLocaleDateString()}
              category={item.category || undefined}
              setSelectedPrayerId={setSelectedPrayerId}
              selectable={selectionMode}
              isSelected={bulkSelection.isSelected(item.id)}
              onToggleSelection={bulkSelection.toggleSelection}
            />
          ))}
        </div>
        <ViewPrayerDrawer
          prayerDetails={selectedPrayer}
          refetchPrayers={refetchPrayers}
        />
      </div>
    </div>
  );
}
