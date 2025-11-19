import AppLayout from "@/components/layout/AppLayout";
import React from "react";
import JournalPageClient from "./JournalPageClient";

interface JournalPageProps {
  searchParams: Promise<{
    q?: string;
    categories?: string | string[];
  }>;
}

export default async function page({ searchParams }: JournalPageProps) {
  // Await search params but don't use them for initial fetch
  // The client component will fetch filtered data based on URL params
  await searchParams;

  return (
    <AppLayout>
      <JournalPageClient />
    </AppLayout>
  );
}
