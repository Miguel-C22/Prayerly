import { createClient } from "@/lib/supabase/server";

/**
 * Bulk delete multiple reflections (does NOT delete parent prayers)
 */
export async function bulkDeleteReflections(
  reflectionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!reflectionIds || reflectionIds.length === 0) {
      return { success: false, error: "No reflection IDs provided" };
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

    // Delete reflections (only the user's own reflections)
    const { error } = await supabase
      .from("reflections")
      .delete()
      .in("id", reflectionIds)
      .eq("user_id", user.id);

    if (error) {
      console.error("Bulk delete reflections error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in bulk delete reflections:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
