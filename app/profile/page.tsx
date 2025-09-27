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

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  // Fetch user data
  const prayers = await getPrayers();
  const reflections = await getReflections();

  return (
    <AppLayout>
      <ProfilePageClient
        userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
        email={user.email || ''}
        prayers={prayers}
        reflections={reflections}
      />
    </AppLayout>
  );
}

export default page;
