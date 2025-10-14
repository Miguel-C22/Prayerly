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
    const { subscription, subscriberId } = await request.json();

    // If unsubscribing - delete this device's subscription
    // Check explicitly for null (not just falsy) to distinguish from undefined
    if (subscription === null && subscriberId) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("subscriber_id", subscriberId);

      return NextResponse.json({
        success: true,
        message: "Push subscription removed successfully",
      });
    }

    // If subscribing - OneSignal SDK has already created the player
    // We just need to save the subscriber ID to our database
    if (!subscriberId) {
      return NextResponse.json(
        { error: "No subscriber ID provided" },
        { status: 400 }
      );
    }

    // Get device info from user agent
    const userAgent = request.headers.get("user-agent") || "";
    const deviceInfo = {
      userAgent,
      browser: getBrowserInfo(userAgent),
      createdAt: new Date().toISOString(),
    };

    // Verify the player exists in OneSignal before saving
    const verifyResponse = await fetch(`https://onesignal.com/api/v1/players/${subscriberId}?app_id=${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
    });

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error(`OneSignal player verification failed (${verifyResponse.status}):`, errorText);
      return NextResponse.json(
        {
          error: "Player not found in OneSignal. The subscription may not have completed properly.",
          details: `HTTP ${verifyResponse.status}`,
        },
        { status: 400 }
      );
    }

    await verifyResponse.json();

    // Tag the OneSignal player with our user ID for targeting
    try {
      const tagResponse = await fetch(`https://onesignal.com/api/v1/players/${subscriberId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          tags: {
            user_id: user.id,
          },
        }),
      });

      if (!tagResponse.ok) {
        console.error("Failed to tag OneSignal player:", await tagResponse.text());
      }
    } catch (error) {
      console.error("Failed to tag OneSignal player:", error);
    }

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
          subscription_data: {}, // OneSignal SDK manages subscription data
          created_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error saving push subscription:", insertError);
        return NextResponse.json(
          { error: "Failed to save subscription", details: insertError.message },
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
