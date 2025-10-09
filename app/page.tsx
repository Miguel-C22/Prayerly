import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // User is logged in, redirect to home dashboard
    redirect("/home");
  } else {
    // User is not logged in, redirect to login page
    redirect("/auth/login");
  }
}
