import { createClient } from "@/lib/supabase/client";

export async function updateReminder(active: boolean, prayerId: string) {
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

    const { data, error } = await supabase
      .from("reminders")
      .update({
        is_active: active,
      })
      .eq("prayer_id", prayerId)
      .eq("user_id", user.id)
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
