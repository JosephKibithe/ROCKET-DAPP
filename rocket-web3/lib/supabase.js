import { createClient } from "@supabase/supabase-js";

// Mock data for when Supabase is not configured
export const mockBets = [
  {
    id: "1",
    question: "Will ETH reach $5000 before July 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "crypto",
  },
  {
    id: "2",
    question: "Will Bitcoin break $100K in 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "crypto",
  },
];

// Initialize Supabase client with fallback for missing env vars
let supabase;
let mockDatabase = [...mockBets];

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials missing, using mock data instead");
    supabase = {
      from: () => ({
        select: () => ({
          order: () => ({
            range: () => ({
              eq: (column, value) => ({
                data: mockDatabase.filter((bet) => bet[column] === value),
                error: null,
              }),
              data: mockDatabase,
              error: null,
            }),
          }),
        }),
      }),
      channel: () => ({
        on: (event, filter, callback) => ({
          subscribe: () => ({
            unsubscribe: () => console.log("Mock: Unsubscribing from channel"),
          }),
        }),
      }),
      removeSubscription: () => {
        console.log("Mock: Removing subscription");
      },
    };
  } else {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error("Error initializing Supabase:", error);
}

export function updateMockData(data) {
  mockDatabase = data;
}

export function getMockData() {
  return mockDatabase;
}

export function resetMockData() {
  mockDatabase = [...mockBets];
}

export function subscribeToLiveBets(callback) {
  if (supabase.channel) {
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
          // Update mock database based on the event
          if (payload.eventType === "INSERT" && payload.new) {
            mockDatabase = [...mockDatabase, payload.new];
          } else if (payload.eventType === "UPDATE" && payload.new) {
            const index = mockDatabase.findIndex(
              (bet) => bet.id === payload.new.id
            );
            if (index !== -1) {
              mockDatabase[index] = payload.new;
            }
          } else if (payload.eventType === "DELETE" && payload.old) {
            mockDatabase = mockDatabase.filter(
              (bet) => bet.id !== payload.old.id
            );
          }

          callback(payload);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        if (subscription.unsubscribe) {
          subscription.unsubscribe();
        } else if (supabase.removeSubscription) {
          supabase.removeSubscription(subscription);
        }
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

export async function fetchBets({
  category,
  status,
  creator,
  limit = 20,
  offset = 0,
}) {
  let result;

  if (supabase.from) {
    const query = supabase
      .from("bets")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query.eq("category", category);
    }

    if (status) {
      query.eq("status", status);
    }

    if (creator) {
      query.eq("creator_id", creator);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching bets:", error);
      throw error;
    }

    result = data;
  } else {
    console.log("Development mode: Using mock data");
    result = [...mockDatabase];

    if (category) {
      result = result.filter((bet) => bet.category === category);
    }

    if (status) {
      result = result.filter((bet) => bet.status === status);
    }

    if (creator) {
      result = result.filter((bet) => bet.creator_id === creator);
    }

    result = result.slice(offset, offset + limit);
  }

  return result;
}

export { supabase };
