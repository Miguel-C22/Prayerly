import { createClient } from "@/lib/supabase/server";

export async function getPrayers() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user");
      return [];
    }

    // Fetch prayers for the current user
    const { data, error } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching prayers:", error);
    return [];
  }
}
