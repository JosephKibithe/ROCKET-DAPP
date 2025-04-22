import { createClient } from "@supabase/supabase-js";

// Mock data for when Supabase is not configured
export const mockBets = [
  {
    id: "mock-1",
    title: "Will BTC reach $100k by EOY?",
    description: "Bitcoin price prediction for end of year",
    category: "crypto",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    end_date: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
    creator: "0x123...789",
    yes_stake: "2.5",
    no_stake: "1.75",
    status: "active",
  },
  {
    id: "mock-2",
    title: "Will ETH flip BTC in 2024?",
    description: "Ethereum market cap exceeding Bitcoin",
    category: "crypto",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    end_date: new Date(Date.now() + 3600000 * 24 * 60).toISOString(),
    creator: "0xabc...def",
    yes_stake: "5.2",
    no_stake: "12.1",
    status: "active",
  },
];

// Initialize Supabase client with fallback for missing env vars
let supabase;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing, using mock data instead");
    supabase = {
      from: () => ({
        select: () => ({
          order: () => ({
            data: mockBets,
            error: null,
          }),
        }),
      }),
      channel: () => ({
        on: () => ({
          subscribe: () => {},
        }),
      }),
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error("Error initializing Supabase:", error);
  // Provide mock implementation
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          data: mockBets,
          error: null,
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => {},
      }),
    }),
  };
}

/**
 * Subscribe to real-time updates on the bets table
 * @param {function} callback - Function to be called when changes occur
 * @returns {Object} - The subscription object with an unsubscribe method
 */
export function subscribeToLiveBets(callback) {
  if (supabase.from) {
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
  } else {
    console.log("Development mode: Real-time updates not available");
    return {
      unsubscribe: () => {
        console.log("Development mode: No subscription to unsubscribe from");
      },
    };
  }
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
  if (supabase.from) {
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
  } else {
    console.log("Development mode: Using mock bet data");

    // Apply filtering to mock data
    let filteredBets = [...mockBets];

    if (category) {
      filteredBets = filteredBets.filter((bet) => bet.category === category);
    }

    if (status) {
      filteredBets = filteredBets.filter((bet) => bet.status === status);
    }

    if (creator) {
      filteredBets = filteredBets.filter((bet) => bet.creator === creator);
    }

    // Apply pagination
    filteredBets = filteredBets.slice(offset, offset + limit);

    return Promise.resolve(filteredBets);
  }
}

/**
 * Fetch a single bet by ID
 * @param {string} id - The bet ID
 * @returns {Promise<Object>} - The fetched bet
 */
export async function fetchBetById(id) {
  if (supabase.from) {
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
  } else {
    console.log("Development mode: Fetching mock bet by ID:", id);
    const bet = mockBets.find((bet) => bet.id === id);

    if (!bet) {
      const error = new Error("Bet not found");
      console.error("Error fetching bet:", error);
      throw error;
    }

    return Promise.resolve(bet);
  }
}

/**
 * Create a new bet
 * @param {Object} bet - The bet data
 * @returns {Promise<Object>} - The inserted bet
 */
export async function createBet(bet) {
  if (supabase.from) {
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
  } else {
    console.log("Development mode: Creating mock bet:", bet);

    // Generate a simple mock ID
    const mockId = Math.random().toString(36).substring(2, 15);
    const createdBet = {
      ...bet,
      id: mockId,
      created_at: new Date().toISOString(),
    };

    // Add to mock data
    mockBets.push(createdBet);

    return Promise.resolve(createdBet);
  }
}

/**
 * Update a bet
 * @param {string} id - The bet ID
 * @param {Object} updates - The updates to apply
 * @returns {Promise<Object>} - The updated bet
 */
export async function updateBet(id, updates) {
  if (supabase.from) {
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
  } else {
    console.log("Development mode: Updating mock bet:", id, updates);

    const betIndex = mockBets.findIndex((bet) => bet.id === id);

    if (betIndex === -1) {
      const error = new Error("Bet not found");
      console.error("Error updating bet:", error);
      throw error;
    }

    // Update the bet
    const updatedBet = {
      ...mockBets[betIndex],
      ...updates,
    };

    mockBets[betIndex] = updatedBet;

    return Promise.resolve(updatedBet);
  }
}

/**
 * Delete a bet
 * @param {string} id - The bet ID
 * @returns {Promise<void>}
 */
export async function deleteBet(id) {
  if (supabase.from) {
    const { error } = await supabase.from("bets").delete().eq("id", id);

    if (error) {
      console.error("Error deleting bet:", error);
      throw error;
    }
  } else {
    console.log("Development mode: Deleting mock bet:", id);

    const betIndex = mockBets.findIndex((bet) => bet.id === id);

    if (betIndex === -1) {
      const error = new Error("Bet not found");
      console.error("Error deleting bet:", error);
      throw error;
    }

    // Remove the bet
    mockBets.splice(betIndex, 1);

    return Promise.resolve();
  }
}

export { supabase };
