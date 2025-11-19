import { Prayer } from "@/types/prayer";

export interface PrayerFiltersClient {
  searchQuery?: string;
  categories?: string[];
  status?: "active" | "answered" | "archived" | "all";
}

export async function getPrayersFilteredClient(
  filters: PrayerFiltersClient = {}
): Promise<Prayer[]> {
  try {
    // Build query params
    const params = new URLSearchParams();

    if (filters.searchQuery) {
      params.set("q", filters.searchQuery);
    }

    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach((cat) => params.append("categories", cat));
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    const response = await fetch(`/api/prayers/filtered?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      // Don't throw error for auth issues - just return empty array
      if (response.status === 401) {
        console.warn("Not authenticated yet - waiting for session");
        return [];
      }
      throw new Error("Failed to fetch prayers");
    }

    const data = await response.json();
    return data.prayers || [];
  } catch (error) {
    console.error("Error fetching filtered prayers:", error);
    return [];
  }
}
