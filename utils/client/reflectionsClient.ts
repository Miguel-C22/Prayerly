import { createClient } from "@/lib/supabase/client";

// Database reflection type
export interface DBReflection {
  id: string;
  note: string;
  prayer_id: string;
  user_id: string;
  created_at: string;
}

// UI reflection type
export interface UIReflection {
  id: string;
  reflection: string;
  date: string;
}

export async function getReflections(prayerId?: string): Promise<UIReflection[]> {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("No authenticated user");
      return [];
    }

    // Build the query
    let query = supabase.from("reflections").select("*").eq("user_id", user.id);

    // Filter by prayer_id if provided
    if (prayerId) {
      query = query.eq("prayer_id", prayerId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Transform database format to UI format
    const transformedData = (data || []).map((item: DBReflection): UIReflection => ({
      id: item.id,
      reflection: item.note,
      date: new Date(item.created_at).toLocaleDateString()
    }));

    return transformedData;
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return [];
  }
}

export async function updateReflection(
  reflectionId: string,
  note: string
): Promise<UIReflection | null> {
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

    // Update the reflection in the database
    const { data, error } = await supabase
      .from("reflections")
      .update({
        note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reflectionId)
      .eq("user_id", user.id) // Ensure user can only update their own reflections
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    // Transform to UI format
    return {
      id: data.id,
      reflection: data.note,
      date: new Date(data.created_at).toLocaleDateString()
    };
  } catch (error) {
    console.error("Error updating reflection:", error);
    return null;
  }
}
