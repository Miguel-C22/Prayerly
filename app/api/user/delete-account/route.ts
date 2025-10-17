import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Step 1: Get all push subscriptions to clean up from OneSignal
    const { data: pushSubscriptions } = await supabase
      .from("push_subscriptions")
      .select("subscriber_id")
      .eq("user_id", userId);

    // Step 2: Delete push subscriptions from OneSignal (optional - can just orphan them)
    if (pushSubscriptions && pushSubscriptions.length > 0) {
      for (const sub of pushSubscriptions) {
        try {
          // Optionally delete from OneSignal
          // Note: This is optional - OneSignal will handle inactive players automatically
          await fetch(
            `https://onesignal.com/api/v1/players/${sub.subscriber_id}?app_id=${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
              },
            }
          );
        } catch (error) {
          // Silently fail - not critical if OneSignal deletion fails
          console.error(
            `Failed to delete OneSignal player ${sub.subscriber_id}:`,
            error
          );
        }
      }
    }

    // Step 3: Delete all user data from database
    // Note: Cascade deletion should handle related tables automatically
    // But we'll explicitly delete push subscriptions first just to be safe
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", userId);

    // Step 4: Delete the user account using admin client
    // This will cascade delete all related data due to ON DELETE CASCADE
    const adminClient = createAdminClient();
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account", details: deleteError.message },
        { status: 500 }
      );
    }

    // Step 5: Sign out (clear session)
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Unexpected error during account deletion:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
