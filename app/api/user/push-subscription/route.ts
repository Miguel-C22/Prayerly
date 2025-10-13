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
    const { subscriberId } = await request.json();

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

    // If subscribing (not unsubscribing), auto-enable push for all existing prayers
    if (subscriberId) {
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
    }

    return NextResponse.json({
      success: true,
      message: subscriberId
        ? "Push subscription saved successfully"
        : "Push subscription removed successfully",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
