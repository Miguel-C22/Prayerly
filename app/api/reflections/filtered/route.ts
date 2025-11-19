import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse filters from URL
    const searchQuery = searchParams.get("q") || "";
    const categoriesParam = searchParams.getAll("categories");
    const status = searchParams.get("status") || "active";

    // Build query with JOIN to prayers table
    let query = supabase
      .from("reflections")
      .select(
        `
        id,
        note,
        prayer_id,
        created_at,
        prayers!inner (
          id,
          title,
          category,
          is_answered,
          is_archived
        )
      `
      )
      .eq("user_id", user.id);

    // Apply search filter (search both reflection note and prayer title)
    if (searchQuery && searchQuery.trim() !== "") {
      query = query.or(
        `note.ilike.%${searchQuery.trim()}%,prayers.title.ilike.%${searchQuery.trim()}%`
      );
    }

    // Apply category filters (from prayer)
    if (categoriesParam.length > 0) {
      query = query.in("prayers.category", categoriesParam);
    }

    // Apply status filters (from prayer)
    if (status && status !== "all") {
      switch (status) {
        case "active":
          query = query
            .eq("prayers.is_answered", false)
            .eq("prayers.is_archived", false);
          break;
        case "answered":
          query = query.eq("prayers.is_answered", true);
          break;
        case "archived":
          query = query.eq("prayers.is_archived", true);
          break;
      }
    }

    // Order by creation date (newest first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reflections" },
        { status: 500 }
      );
    }

    // Transform data to ReflectionEntry format
    const reflections = (data || []).map((item: any) => ({
      id: item.prayers.id, // Prayer ID
      reflection_id: item.id, // Reflection ID
      title: item.prayers.title,
      created_at: item.created_at,
      category: item.prayers.category,
      reflection: item.note,
    }));

    return NextResponse.json({ reflections });
  } catch (error) {
    console.error("Error in filtered reflections API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
