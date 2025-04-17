import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in development mode with placeholder values
const isDevelopmentMode = !supabaseUrl || supabaseUrl === "your_supabase_url";

// Mock data for development
const MOCK_BETS = [
  {
    id: "1",
    question: "Will ETH reach $5000 before July 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "Crypto",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    creator_id: "00000000-0000-0000-0000-000000000000",
  },
  {
    id: "2",
    question: "Will Bitcoin break $100K in 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "Crypto",
    status: "active",
    options: JSON.stringify(["Yes", "No", "It will drop below $20K first"]),
    creator_id: "00000000-0000-0000-0000-000000000000",
  },
];

// Create the Supabase client only if we have valid credentials
const supabase = isDevelopmentMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

/**
 * Subscribe to real-time updates on the bets table
 * @param {function} callback - Function to be called when changes occur
 * @returns {Object} - The subscription object with an unsubscribe method
 */
export function subscribeToLiveBets(callback) {
  if (isDevelopmentMode) {
    console.log("Development mode: Real-time updates not available");
    return {
      unsubscribe: () => {
        console.log("Development mode: No subscription to unsubscribe from");
      },
    };
  }

  // Set up the subscription to the bets table
  const subscription = supabase
    .channel("bets-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "bets",
      },
      (payload) => {
        // Call the callback with the payload when changes occur
        callback(payload);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    },
  };
}

/**
 * Fetch all bets with filtering options
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @param {string} options.status - Filter by status
 * @param {string} options.creator - Filter by creator
 * @param {number} options.limit - Limit the number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} - The fetched bets
 */
export async function fetchBets({
  category,
  status,
  creator,
  limit = 20,
  offset = 0,
}) {
  if (isDevelopmentMode) {
    console.log("Development mode: Using mock bet data");

    // Apply filtering to mock data
    let filteredBets = [...MOCK_BETS];

    if (category) {
      filteredBets = filteredBets.filter((bet) => bet.category === category);
    }

    if (status) {
      filteredBets = filteredBets.filter((bet) => bet.status === status);
    }

    if (creator) {
      filteredBets = filteredBets.filter((bet) => bet.creator_id === creator);
    }

    // Apply pagination
    filteredBets = filteredBets.slice(offset, offset + limit);

    return Promise.resolve(filteredBets);
  }

  let query = supabase
    .from("bets")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters if provided
  if (category) {
    query = query.eq("category", category);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (creator) {
    query = query.eq("creator_id", creator);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching bets:", error);
    throw error;
  }

  return data;
}

/**
 * Fetch a single bet by ID
 * @param {string} id - The bet ID
 * @returns {Promise<Object>} - The fetched bet
 */
export async function fetchBetById(id) {
  if (isDevelopmentMode) {
    console.log("Development mode: Fetching mock bet by ID:", id);
    const bet = MOCK_BETS.find((bet) => bet.id === id);

    if (!bet) {
      const error = new Error("Bet not found");
      console.error("Error fetching bet:", error);
      throw error;
    }

    return Promise.resolve(bet);
  }

  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching bet:", error);
    throw error;
  }

  return data;
}

/**
 * Create a new bet
 * @param {Object} bet - The bet data
 * @returns {Promise<Object>} - The inserted bet
 */
export async function createBet(bet) {
  if (isDevelopmentMode) {
    console.log("Development mode: Creating mock bet:", bet);

    // Generate a simple mock ID
    const mockId = Math.random().toString(36).substring(2, 15);
    const createdBet = {
      ...bet,
      id: mockId,
      created_at: new Date().toISOString(),
    };

    // Add to mock data
    MOCK_BETS.push(createdBet);

    return Promise.resolve(createdBet);
  }

  const { data, error } = await supabase
    .from("bets")
    .insert(bet)
    .select()
    .single();

  if (error) {
    console.error("Error creating bet:", error);
    throw error;
  }

  return data;
}

/**
 * Update a bet
 * @param {string} id - The bet ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} - The updated bet
 */
export async function updateBet(id, updates) {
  if (isDevelopmentMode) {
    console.log("Development mode: Updating mock bet:", id, updates);

    const betIndex = MOCK_BETS.findIndex((bet) => bet.id === id);

    if (betIndex === -1) {
      const error = new Error("Bet not found");
      console.error("Error updating bet:", error);
      throw error;
    }

    // Update the bet
    const updatedBet = {
      ...MOCK_BETS[betIndex],
      ...updates,
    };

    MOCK_BETS[betIndex] = updatedBet;

    return Promise.resolve(updatedBet);
  }

  const { data, error } = await supabase
    .from("bets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating bet:", error);
    throw error;
  }

  return data;
}

/**
 * Delete a bet
 * @param {string} id - The bet ID
 * @returns {Promise<void>}
 */
export async function deleteBet(id) {
  if (isDevelopmentMode) {
    console.log("Development mode: Deleting mock bet:", id);

    const betIndex = MOCK_BETS.findIndex((bet) => bet.id === id);

    if (betIndex === -1) {
      const error = new Error("Bet not found");
      console.error("Error deleting bet:", error);
      throw error;
    }

    // Remove the bet
    MOCK_BETS.splice(betIndex, 1);

    return Promise.resolve();
  }

  const { error } = await supabase.from("bets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting bet:", error);
    throw error;
  }
}

export default supabase;
