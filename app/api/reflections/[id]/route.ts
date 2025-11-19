import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reflectionId } = await params;

    // Delete the reflection (RLS ensures user owns it)
    const { error: deleteError } = await supabase
      .from("reflections")
      .delete()
      .eq("id", reflectionId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting reflection:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete reflection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in reflection DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
