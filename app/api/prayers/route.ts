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
    const { title, description, category, metadata } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Insert the prayer into the database
    const { data, error } = await supabase
      .from("prayers")
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        category: category || null,
        metadata: metadata || null,
        is_answered: false,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create prayer" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Prayer submitted successfully",
        prayer: data,
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

    // Fetch prayers for the current user
    const { data, error } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch prayers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prayers: data }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
