"use client";

import React, { useEffect, useState } from "react";
import PrayerRequestDrawer from "@/components/add-prayer-drawer/PrayerDrawer";
import BibleVerse from "@/components/bible-verse/BibleVerse";
import useTabs from "@/hooks/useTabs";
import { Prayer } from "@/types/prayer";
import {
  getPrayers,
  getSinglePrayerClient,
} from "@/utils/client/prayersClient";
import ViewPrayerDrawer from "@/components/view-prayer-drawer/ViewPrayerDrawer";
import ComboCard from "@/components/cards/ComboCard";
import { filterReflections } from "@/utils/filterReflections";

export interface ReflectionEntry {
  id: string;
  reflection_id: string;
  title: string;
  created_at: string;
  category: string | null;
  reflection: string;
}

interface JournalPageClientProps {
  initialPrayers: Prayer[];
  initialReflections?: any[];
}

export default function JournalPageClient({
  initialPrayers,
  initialReflections,
}: JournalPageClientProps) {
  const [prayers, setPrayers] = useState<Prayer[]>(initialPrayers);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>("");
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  const reflections: ReflectionEntry[] = initialPrayers.flatMap((prayer) => {
    return filterReflections(initialReflections, prayer);
  });

  const activePrayers = prayers.filter((p) => !p.is_answered && !p.is_archived);
  const activeReflections = activePrayers.flatMap((prayer) => {
    return filterReflections(initialReflections, prayer);
  });
  const answeredPrayers = prayers.filter((p) => p.is_answered);
  const activeAnsweredReflections = answeredPrayers.flatMap((prayer) => {
    return filterReflections(initialReflections, prayer);
  });
  const allPrayers = reflections;

  const { displayTabs, selectedTab } = useTabs([
    { tab: "All Entries", amount: allPrayers.length },
    { tab: "Active", amount: activeReflections.length },
    { tab: "Answered", amount: activeAnsweredReflections.length },
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
  const getFilteredPrayers = (): (Prayer | ReflectionEntry)[] => {
    switch (selectedTab) {
      case "All Entries":
        return allPrayers;
      case "Active":
        return activeReflections;
      case "Answered":
        return activeAnsweredReflections;
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
          {getFilteredPrayers().map((item) => (
            <ComboCard
              key={"reflection_id" in item ? item.reflection_id : item.id}
              id={item.id}
              title={item.title}
              reflection={
                "reflection" in item
                  ? item.reflection
                  : item.description || "No reflection yet"
              }
              date={new Date(item.created_at).toLocaleDateString()}
              category={item.category || undefined}
              setSelectedPrayerId={setSelectedPrayerId}
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
