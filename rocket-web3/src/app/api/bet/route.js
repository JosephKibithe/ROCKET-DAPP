import { NextResponse } from "next/server";
import supabase, {
  createBet,
  updateBet,
  fetchBetById,
} from "../../../../lib/supabase";

/**
 * POST /api/bet - Create a new bet
 */
export async function POST(request) {
  try {
    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.question || !data.options || !data.resolution_time) {
      return NextResponse.json(
        {
          error: "Missing required fields: question, options, resolution_time",
        },
        { status: 400 }
      );
    }

    // Add creator_id from the authenticated user
    const bet = {
      ...data,
      creator_id: session.user.id,
      created_at: new Date().toISOString(),
      status: "active",
    };

    // Store in Supabase
    const result = await createBet(bet);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating bet:", error);

    return NextResponse.json(
      { error: "Failed to create bet", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bet/:id - Update a bet
 */
export async function PATCH(request, { params }) {
  try {
    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if the bet exists and belongs to the user
    const existingBet = await fetchBetById(id);

    if (!existingBet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    if (existingBet.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this bet" },
        { status: 403 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Update in Supabase
    const result = await updateBet(id, data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating bet:", error);

    return NextResponse.json(
      { error: "Failed to update bet", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bet/:id - Get a bet by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Fetch from Supabase
    const bet = await fetchBetById(id);

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json(bet);
  } catch (error) {
    console.error("Error fetching bet:", error);

    return NextResponse.json(
      { error: "Failed to fetch bet", details: error.message },
      { status: 500 }
    );
  }
}
