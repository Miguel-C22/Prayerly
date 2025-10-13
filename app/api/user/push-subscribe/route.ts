import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

    // Parse the request body
    const { subscription, subscriberId: unsubscribeId } = await request.json();

    // If unsubscribing - delete this device's subscription
    if (!subscription) {
      // If unsubscribeId provided, delete specific subscription
      if (unsubscribeId) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("subscriber_id", unsubscribeId);
      } else {
        // If no unsubscribeId, try to find by subscription endpoint
        const endpoint = subscription?.endpoint;
        if (endpoint) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", user.id)
            .contains("subscription_data", { endpoint });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Push subscription removed successfully",
      });
    }

    // Register subscription with Webpushr REST API
    const webpushrResponse = await fetch("https://api.webpushr.com/v1/subscription/save", {
      method: "POST",
      headers: {
        "webpushrKey": process.env.WEBPUSHR_REST_API_KEY!,
        "webpushrAuthToken": process.env.WEBPUSHR_AUTH_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_data: subscription,
      }),
    });

    if (!webpushrResponse.ok) {
      const errorText = await webpushrResponse.text();
      console.error("Webpushr API error:", errorText);
      return NextResponse.json(
        { error: "Failed to register with push service" },
        { status: 500 }
      );
    }

    const webpushrData = await webpushrResponse.json();
    const subscriberId = webpushrData.sid || webpushrData.subscriber_id;

    if (!subscriberId) {
      console.error("No subscriber ID in Webpushr response:", webpushrData);
      return NextResponse.json(
        { error: "Failed to get subscriber ID" },
        { status: 500 }
      );
    }

    // Get device info from user agent
    const userAgent = request.headers.get("user-agent") || "";
    const deviceInfo = {
      userAgent,
      browser: getBrowserInfo(userAgent),
      createdAt: new Date().toISOString(),
    };

    // Check if this subscription already exists
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("subscriber_id", subscriberId)
      .single();

    if (existing) {
      // Update last_used_at
      await supabase
        .from("push_subscriptions")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      // Insert new subscription
      const { error: insertError } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: user.id,
          subscriber_id: subscriberId,
          device_info: deviceInfo,
          subscription_data: subscription,
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error saving push subscription:", insertError);
        return NextResponse.json(
          { error: "Failed to save subscription" },
          { status: 500 }
        );
      }
    }

    // Check if user has any existing push subscriptions
    const { data: userSubscriptions } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id);

    // Auto-enable push for all existing prayers (only if this is their first device)
    if (userSubscriptions && userSubscriptions.length === 1) {
      try {
        // Get all reminders for this user
        const { data: reminders, error: fetchError } = await supabase
          .from("reminders")
          .select("id, channel, destination")
          .eq("user_id", user.id);

        if (!fetchError && reminders) {
          // Update each reminder to include push channel
          for (const reminder of reminders) {
            const channels = Array.isArray(reminder.channel)
              ? reminder.channel
              : [reminder.channel].filter(Boolean);

            // Only update if push not already in channels
            if (!channels.includes("push")) {
              const updatedChannels = [...channels, "push"];

              // Note: destination.push_subscriber_id is no longer used
              // We'll fetch all user subscriptions when sending
              await supabase
                .from("reminders")
                .update({
                  channel: updatedChannels,
                })
                .eq("id", reminder.id);
            }
          }
        }
      } catch (updateError) {
        // Log but don't fail the whole request
        console.error("Error auto-enabling push for prayers:", updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper to extract browser info from user agent
function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  if (userAgent.includes("Opera")) return "Opera";
  return "Unknown";
}
