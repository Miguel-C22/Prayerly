import { createClient } from "@/lib/supabase/server";

/**
 * Bulk delete multiple prayers
 */
export async function bulkDeletePrayers(
  prayerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!prayerIds || prayerIds.length === 0) {
      return { success: false, error: "No prayer IDs provided" };
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Delete prayers (only the user's own prayers)
    const { error } = await supabase
      .from("prayers")
      .delete()
      .in("id", prayerIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Bulk delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulk delete:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Bulk archive multiple prayers
 */
export async function bulkArchivePrayers(
  prayerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!prayerIds || prayerIds.length === 0) {
      return { success: false, error: "No prayer IDs provided" };
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update prayers to archived (only the user's own prayers)
    const { error } = await supabase
      .from("prayers")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .in("id", prayerIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Bulk archive error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulk archive:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Bulk mark prayers as answered
 */
export async function bulkMarkAsAnswered(
  prayerIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!prayerIds || prayerIds.length === 0) {
      return { success: false, error: "No prayer IDs provided" };
    }

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Update prayers to answered (only the user's own prayers)
    const { error } = await supabase
      .from("prayers")
      .update({ is_answered: true, updated_at: new Date().toISOString() })
      .in("id", prayerIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Bulk mark as answered error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulk mark as answered:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
