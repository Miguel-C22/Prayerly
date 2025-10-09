import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Protected Layout
 *
 * This layout wraps all app routes (/home, /journal, /reminders, /profile)
 * and ensures users are authenticated before accessing them.
 *
 * The (app) folder is a route group - it doesn't affect URLs, just organization.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user is authenticated, redirect to login
  if (!user) {
    redirect("/auth/login");
  }

  // User is authenticated, render the page
  return <>{children}</>;
}
