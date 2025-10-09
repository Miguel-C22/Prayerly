import AppLayout from "@/components/layout/AppLayout";
import HomePageClient from "./HomePageClient";
import { getPrayers } from "@/utils/server/prayersServer";

export default async function HomePage() {
  const initialPrayers = await getPrayers();

  return (
    <AppLayout>
      <HomePageClient initialPrayers={initialPrayers} />
    </AppLayout>
  );
}
