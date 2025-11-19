import { createClient } from "@/lib/supabase/server";
import { Prayer } from "@/types/prayer";

export interface PrayerFilters {
  searchQuery?: string;
  categories?: string[];
  status?: "active" | "answered" | "archived" | "all";
}

export async function getPrayersFiltered(
  filters: PrayerFilters = {}
): Promise<Prayer[]> {
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

    // Start building the query
    let query = supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id);

    // Apply search filter (title only)
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      query = query.ilike("title", `%${filters.searchQuery.trim()}%`);
    }

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      query = query.in("category", filters.categories);
    }

    // Apply status filters
    if (filters.status && filters.status !== "all") {
      switch (filters.status) {
        case "active":
          query = query.eq("is_answered", false).eq("is_archived", false);
          break;
        case "answered":
          query = query.eq("is_answered", true);
          break;
        case "archived":
          query = query.eq("is_archived", true);
          break;
      }
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching filtered prayers:", error);
    return [];
  }
}
