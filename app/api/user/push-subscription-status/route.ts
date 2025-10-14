import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    // Check if user has any active push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error checking push subscriptions:", error);
      return NextResponse.json(
        { error: "Failed to check subscription status" },
        { status: 500 }
      );
    }

    // User is subscribed if they have at least one subscription
    const isSubscribed = subscriptions && subscriptions.length > 0;

    return NextResponse.json({
      isSubscribed,
      count: subscriptions?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
