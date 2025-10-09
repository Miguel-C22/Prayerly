import AppLayout from "@/components/layout/AppLayout";
import React from "react";
import JournalPageClient from "./JournalPageClient";
import { getPrayers } from "@/utils/server/prayersServer";
import { getReflections } from "@/utils/server/reflectionsServer";

export default async function page() {
  const initialPrayers = await getPrayers();
  const initialReflections = await getReflections();

  return (
    <AppLayout>
      <JournalPageClient
        initialPrayers={initialPrayers}
        initialReflections={initialReflections}
      />
    </AppLayout>
  );
}
