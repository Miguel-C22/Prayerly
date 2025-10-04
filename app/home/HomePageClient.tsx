"use client";

import React, { useEffect, useState } from "react";
import PrayerRequestDrawer from "@/components/add-prayer-drawer/PrayerDrawer";
import BibleVerse from "@/components/bible-verse/BibleVerse";
import PrayerCard from "@/components/cards/PrayerCard";
import useTabs from "@/hooks/useTabs";
import { Prayer } from "@/types/prayer";
import {
  getPrayers,
  getSinglePrayerClient,
  deletePrayer,
} from "@/utils/client/prayersClient";
import ViewPrayerDrawer from "@/components/view-prayer-drawer/ViewPrayerDrawer";

interface HomePageClientProps {
  initialPrayers: Prayer[];
}

export default function HomePageClient({
  initialPrayers,
}: HomePageClientProps) {
  const [prayers, setPrayers] = useState<Prayer[]>(initialPrayers);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>("");
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

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

  useEffect(() => {
    if (selectedPrayerId) {
      handleViewDetails();
    }
  }, [selectedPrayerId]);

  return (
    <div className="flex flex-col gap-8">
      <PrayerRequestDrawer onPrayerSubmitted={handlePrayerSubmitted} />
      <BibleVerse
        verse="The prayer of a righteous person is powerful and effective."
        chapter="James 5:16"
      />
      <div className="flex flex-col gap-4">
        {displayTabs()}
        <div className="flex flex-col gap-4">
          {getFilteredPrayers().map((prayer) => (
            <PrayerCard
              key={prayer.id}
              id={prayer.id}
              title={prayer.title}
              description={prayer.description || ""}
              date={new Date(prayer.created_at).toLocaleDateString()}
              category={prayer.category || undefined}
              setSelectedPrayerId={setSelectedPrayerId}
              onDelete={handleDeletePrayer}
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
