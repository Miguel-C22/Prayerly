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
    const body = await request.json();
    const { recurrence_type, prayer_id } = body;

    // Validate required fields
    if (!recurrence_type || !prayer_id) {
      return NextResponse.json(
        { error: "Recurrence and Prayer ID are required" },
        { status: 400 }
      );
    }

    // Insert the reminder into the database
    const { data, error } = await supabase
      .from("reminders")
      .insert({
        user_id: user.id,
        prayer_id,
        recurrence_type,
        start_date: new Date().toISOString(),
        is_active: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        channel: "email",
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Reminder created successfully",
        reminder: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
