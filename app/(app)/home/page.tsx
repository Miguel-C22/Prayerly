import AppLayout from "@/components/layout/AppLayout";
import HomePageClient from "./HomePageClient";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    categories?: string | string[];
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Await search params but don't use them for initial fetch
  // The client component will fetch filtered data based on URL params
  await searchParams;

  return (
    <AppLayout>
      <HomePageClient />
    </AppLayout>
  );
}
