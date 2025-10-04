import { createClient } from "@/lib/supabase/client";
import { Prayer } from "@/types/prayer";

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

export async function getSinglePrayerClient(
  prayerId: string
): Promise<Prayer | null> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user");
      return null;
    }

    // Fetch the specific prayer for the current user
    const { data, error } = await supabase
      .from("prayers")
      .select("*") // Select all columns, not the prayerId
      .eq("id", prayerId) // Filter by prayer ID
      .eq("user_id", user.id) // Ensure it belongs to the current user
      .single(); // Get single record

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching prayer:", error);
    return null;
  }
}

export async function updatePrayer(
  prayerId: string,
  updates: Partial<
    Pick<
      Prayer,
      "title" | "description" | "category" | "is_answered" | "is_archived"
    >
  >
): Promise<Prayer | null> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user");
      return null;
    }

    // Update the prayer in the database
    const { data, error } = await supabase
      .from("prayers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prayerId)
      .eq("user_id", user.id) // Ensure user can only update their own prayers
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating prayer:", error);
    return null;
  }
}

export async function deletePrayer(prayerId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user");
      return false;
    }

    // Delete the prayer from the database
    const { error } = await supabase
      .from("prayers")
      .delete()
      .eq("id", prayerId)
      .eq("user_id", user.id); // Ensure user can only delete their own prayers

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting prayer:", error);
    return false;
  }
}
