import { NextResponse } from "next/server";
import { fetchBets } from "../../../../lib/supabase";

/**
 * GET /api/bets - List bets with filtering options
 * Query parameters:
 * - category: filter by category
 * - status: filter by status (active, resolved)
 * - creator: filter by creator ID
 * - limit: limit the number of results (default 20)
 * - offset: offset for pagination (default 0)
 */
export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const creator = url.searchParams.get("creator");
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Fetch bets from Supabase
    const bets = await fetchBets({
      category,
      status,
      creator,
      limit,
      offset,
    });

    return NextResponse.json(bets);
  } catch (error) {
    console.error("Error fetching bets:", error);

    return NextResponse.json(
      { error: "Failed to fetch bets", details: error.message },
      { status: 500 }
    );
  }
}
