import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Get subscriberId from query params
    const { searchParams } = new URL(request.url);
    const subscriberId = searchParams.get("subscriberId");

    if (!subscriberId) {
      return NextResponse.json(
        { error: "subscriberId is required" },
        { status: 400 }
      );
    }

    // Check if this subscription exists and is active in our database
    const { data: subscription, error: dbError } = await supabase
      .from("push_subscriptions")
      .select("is_subscribed")
      .eq("user_id", user.id)
      .eq("subscriber_id", subscriberId)
      .single();

    if (dbError || !subscription) {
      // Subscription not found in database
      return NextResponse.json({ isActive: false });
    }

    // Return whether subscription is active
    return NextResponse.json({ isActive: subscription.is_subscribed === true });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Internal Server Error", isActive: false },
      { status: 500 }
    );
  }
}
