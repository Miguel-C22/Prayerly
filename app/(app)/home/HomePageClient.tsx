"use client";

import React, { useEffect, useState } from "react";
import PrayerRequestDrawer from "@/components/prayer/add-prayer/PrayerDrawer";
import BibleVerse from "@/components/bible/BibleVerse";
import ContentCard from "@/components/ui/cards/ContentCard";
import useTabs from "@/hooks/useTabs";
import { Prayer } from "@/types/prayer";
import {
  getPrayers,
  getSinglePrayerClient,
  deletePrayer,
} from "@/utils/client/prayersClient";
import ViewPrayerDrawer from "@/components/prayer/view-prayer/ViewPrayerDrawer";
import FilterBar from "@/components/filters/FilterBar";
import BulkActionBar from "@/components/filters/BulkActionBar";
import { usePrayerFilters } from "@/hooks/usePrayerFilters";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { deletePrayersAction } from "@/app/actions/prayerActions";
import { getPrayersFilteredClient } from "@/utils/client/getPrayersFilteredClient";

export default function HomePageClient() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>("");
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  // Filter hooks
  const filters = usePrayerFilters();

  // Bulk selection hooks
  const bulkSelection = useBulkSelection(prayers);

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Exiting selection mode, clear selections
      bulkSelection.clearSelection();
    }
  };

  const activePrayers = prayers.filter((p) => !p.is_answered && !p.is_archived);
  const answeredPrayers = prayers.filter((p) => p.is_answered);
  const archivedPrayers = prayers.filter((p) => p.is_archived);

  const { displayTabs, selectedTab } = useTabs([
    { tab: "Active", amount: activePrayers.length },
    { tab: "Answered", amount: answeredPrayers.length },
    { tab: "Archived", amount: archivedPrayers.length },
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

  // Get prayers based on selected tab
  const getFilteredPrayers = () => {
    switch (selectedTab) {
      case "Active":
        return activePrayers;
      case "Answered":
        return answeredPrayers;
      case "Archived":
        return archivedPrayers;
      default:
        return activePrayers;
    }
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

  const handleDeletePrayer = async (prayerId: string) => {
    const success = await deletePrayer(prayerId);
    if (success) {
      // Optimistically remove from UI
      setPrayers((prev) => prev.filter((p) => p.id !== prayerId));
    } else {
      alert("Failed to delete prayer. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedIds = bulkSelection.getSelectedIds();
      const result = await deletePrayersAction(selectedIds);

      if (result.success) {
        // Optimistically remove from UI
        setPrayers((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        bulkSelection.clearSelection();
        setSelectionMode(false); // Exit selection mode
      } else {
        alert(`Failed to delete prayers: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting prayers:", error);
      alert("Failed to delete prayers. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch filtered prayers when filters change
  useEffect(() => {
    const fetchFilteredPrayers = async () => {
      try {
        // Map selectedTab to status for API
        let status: "active" | "answered" | "archived" | "all" = "active";
        if (selectedTab === "Answered") status = "answered";
        else if (selectedTab === "Archived") status = "archived";
        else status = "active";

        const filteredPrayers = await getPrayersFilteredClient({
          searchQuery: filters.searchQuery,
          categories: filters.categories,
          status,
        });
        setPrayers(filteredPrayers);
      } catch (error) {
        console.error("Error fetching filtered prayers:", error);
      }
    };

    fetchFilteredPrayers();
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
          {getFilteredPrayers().map((prayer) => (
            <ContentCard
              variant="prayer"
              key={prayer.id}
              id={prayer.id}
              title={prayer.title}
              description={prayer.description || ""}
              date={new Date(prayer.created_at).toLocaleDateString()}
              category={prayer.category || undefined}
              setSelectedPrayerId={setSelectedPrayerId}
              onDelete={handleDeletePrayer}
              selectable={selectionMode}
              isSelected={bulkSelection.isSelected(prayer.id)}
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
