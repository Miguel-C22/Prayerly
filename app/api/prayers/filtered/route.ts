import { NextRequest, NextResponse } from "next/server";
import { getPrayersFiltered } from "@/utils/server/getPrayersFiltered";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from URL
    const searchQuery = searchParams.get("q") || "";
    const categoriesParam = searchParams.getAll("categories");
    const status = searchParams.get("status") || "active";

    // Fetch filtered prayers
    const prayers = await getPrayersFiltered({
      searchQuery,
      categories: categoriesParam,
      status: status as any,
    });

    return NextResponse.json({ prayers });
  } catch (error) {
    console.error("Error in filtered prayers API:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayers" },
      { status: 500 }
    );
  }
}
