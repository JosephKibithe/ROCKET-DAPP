/**
 * Supabase Realtime Test
 * Tests the Supabase Realtime subscription functionality
 * Run with: `npx vitest run test/supabaseRealtimeTest.js`
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { mockSupabaseClient } from "./mocks/supabaseMocks";
import { subscribeToLiveBets, fetchBets } from "../lib/supabase";

// Mock bet data
const MOCK_BETS = [
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

describe("Supabase Realtime Tests", () => {
  // Mock event handlers
  const insertHandler = vi.fn();
  const updateHandler = vi.fn();
  const deleteHandler = vi.fn();

  // Subscription object
  let subscription;

  beforeAll(() => {
    console.log("Setting up Supabase Realtime tests...");

    // Set up mock Supabase with test data
    mockSupabaseClient.setData("bets", MOCK_BETS);

    // Set up event handlers
    mockSupabaseClient.setEventHandlers({
      INSERT: insertHandler,
      UPDATE: updateHandler,
      DELETE: deleteHandler,
    });

    // Subscribe to live bets
    subscription = subscribeToLiveBets((payload) => {
      console.log("Realtime event received:", payload);

      if (payload.eventType === "INSERT") {
        insertHandler(payload);
      } else if (payload.eventType === "UPDATE") {
        updateHandler(payload);
      } else if (payload.eventType === "DELETE") {
        deleteHandler(payload);
      }
    });
  });

  afterAll(() => {
    console.log("Tearing down Supabase Realtime tests...");

    // Clean up subscription
    if (subscription) {
      subscription.unsubscribe();
    }

    // Reset mock data
    mockSupabaseClient.resetData();
  });

  it("should fetch bets from Supabase", async () => {
    const bets = await fetchBets({});

    console.log("Fetched bets:", bets);

    // Verify the bets were fetched
    expect(bets).toHaveLength(MOCK_BETS.length);
    expect(bets[0].id).toBe(MOCK_BETS[0].id);
    expect(bets[1].id).toBe(MOCK_BETS[1].id);
  });

  it("should filter bets by category", async () => {
    const bets = await fetchBets({ category: "crypto" });

    console.log("Filtered bets:", bets);

    // Verify the filtering works
    expect(bets).toHaveLength(2); // Both are crypto

    // Try a non-existent category
    const emptyBets = await fetchBets({ category: "sports" });
    expect(emptyBets).toHaveLength(0);
  });

  it("should receive INSERT events", async () => {
    // Simulate a new bet being created
    const newBet = {
      id: "3",
      question: "Will NFTs recover in 2023?",
      created_at: new Date().toISOString(),
      resolution_time: new Date(
        Date.now() + 45 * 24 * 60 * 60 * 1000
      ).toISOString(),
      category: "crypto",
    };

    // Trigger an INSERT event
    mockSupabaseClient.triggerEvent("INSERT", { new: newBet });

    // Verify the handler was called
    expect(insertHandler).toHaveBeenCalledWith({
      eventType: "INSERT",
      new: newBet,
    });

    // Verify the bet was added to the database
    const bets = await fetchBets({});
    expect(bets).toHaveLength(MOCK_BETS.length + 1);
    expect(bets[2].id).toBe(newBet.id);
  });

  it("should receive UPDATE events", async () => {
    // Simulate a bet being updated
    const updatedBet = { ...MOCK_BETS[0], question: "Updated Question" };

    // Trigger an UPDATE event
    mockSupabaseClient.triggerEvent("UPDATE", {
      old: MOCK_BETS[0],
      new: updatedBet,
    });

    // Verify the handler was called
    expect(updateHandler).toHaveBeenCalledWith({
      eventType: "UPDATE",
      old: MOCK_BETS[0],
      new: updatedBet,
    });

    // Verify the bet was updated in the database
    const bets = await fetchBets({});
    const bet = bets.find((b) => b.id === updatedBet.id);
    expect(bet.question).toBe(updatedBet.question);
  });

  it("should receive DELETE events", async () => {
    // Simulate a bet being deleted
    const deletedBet = MOCK_BETS[1];

    // Trigger a DELETE event
    mockSupabaseClient.triggerEvent("DELETE", { old: deletedBet });

    // Verify the handler was called
    expect(deleteHandler).toHaveBeenCalledWith({
      eventType: "DELETE",
      old: deletedBet,
    });

    // Verify the bet was removed from the database
    const bets = await fetchBets({});
    expect(bets.find((b) => b.id === deletedBet.id)).toBeUndefined();
  });

  it("should handle subscription errors gracefully", async () => {
    // Simulate an error in the subscription
    mockSupabaseClient.triggerError(new Error("Connection lost"));

    // Verify we can still fetch data after an error
    const bets = await fetchBets({});
    expect(bets).toBeDefined();
  });
});
