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
    const { subscription } = await request.json();

    // If unsubscribing
    if (!subscription) {
      await supabase.auth.updateUser({
        data: { webpushr_subscriber_id: null },
      });

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

    // Store subscriber ID in user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        webpushr_subscriber_id: subscriberId,
      },
    });

    if (error) {
      console.error("Error saving push subscription:", error);
      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    // Auto-enable push for all existing prayers
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

            // Update destination to include push subscriber ID
            const updatedDestination = {
              ...reminder.destination,
              push_subscriber_id: subscriberId,
            };

            await supabase
              .from("reminders")
              .update({
                channel: updatedChannels,
                destination: updatedDestination,
              })
              .eq("id", reminder.id);
          }
        }
      }
    } catch (updateError) {
      // Log but don't fail the whole request
      console.error("Error auto-enabling push for prayers:", updateError);
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
