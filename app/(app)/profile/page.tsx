import AppLayout from "@/components/layout/AppLayout";
import React from "react";
import ProfilePageClient from "./ProfilePageClient";
import { createClient } from "@/lib/supabase/server";
import { getPrayers } from "@/utils/server/prayersServer";
import { getReflections } from "@/utils/server/reflectionsServer";

async function page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already checks auth, so user is guaranteed to exist
  // Using non-null assertion since layout redirects unauthenticated users
  const prayers = await getPrayers();
  const reflections = await getReflections();

  return (
    <AppLayout>
      <ProfilePageClient
        userName={user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'User'}
        email={user!.email || ''}
        prayers={prayers}
        reflections={reflections}
      />
    </AppLayout>
  );
}

export default page;
