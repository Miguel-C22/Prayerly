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
    const { prayer_id, note } = body;

    // Validate required fields
    if (!note || !prayer_id) {
      return NextResponse.json(
        { error: "Note and prayer_id are required" },
        { status: 400 }
      );
    }

    // Insert the prayer into the database
    const { data, error } = await supabase
      .from("reflections")
      .insert({
        user_id: user.id,
        note,
        prayer_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create reflection" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Reflection submitted successfully",
        reflection: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
