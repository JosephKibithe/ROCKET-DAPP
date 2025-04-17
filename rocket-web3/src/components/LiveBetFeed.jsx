"use client";

import { useState, useEffect } from "react";
import { subscribeToLiveBets, fetchBets } from "../../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Sample data for development
const SAMPLE_BETS = [
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
  },
];

export default function LiveBetFeed() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initial fetch of bets
    const loadBets = async () => {
      try {
        setLoading(true);

        // Check if we're in a development environment with no Supabase config
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const isDevMode = !supabaseUrl || supabaseUrl === "your_supabase_url";

        if (isDevMode) {
          console.log("Using sample data in development mode");
          setBets(SAMPLE_BETS);
          setLoading(false);
          return;
        }

        const fetchedBets = await fetchBets({});
        setBets(fetchedBets);
      } catch (err) {
        console.error("Error fetching bets:", err);
        setError("Failed to load bets. Please try again later.");

        // Fallback to sample data in case of error
        setBets(SAMPLE_BETS);
      } finally {
        setLoading(false);
      }
    };

    loadBets();

    // Only set up subscription if we're not in dev mode with dummy data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isDevMode = !supabaseUrl || supabaseUrl === "your_supabase_url";

    if (!isDevMode) {
      // Subscribe to real-time updates
      const subscription = subscribeToLiveBets((payload) => {
        console.log("Real-time update received:", payload);

        // Handle different types of changes
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === "INSERT") {
          // Add the new bet to the list
          setBets((currentBets) => [newRecord, ...currentBets]);
        } else if (eventType === "UPDATE") {
          // Update the bet in the list
          setBets((currentBets) =>
            currentBets.map((bet) =>
              bet.id === newRecord.id ? newRecord : bet
            )
          );
        } else if (eventType === "DELETE") {
          // Remove the bet from the list
          setBets((currentBets) =>
            currentBets.filter((bet) => bet.id !== oldRecord.id)
          );
        }
      });

      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading bets...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (bets.length === 0) {
    return (
      <div className="p-8">No bets available. Create one to get started!</div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-heading text-primary mb-4">
        Live Prediction Feed
      </h2>

      {bets.map((bet) => (
        <Card
          key={bet.id}
          className="bg-dark/50 border-primary/30 hover:border-primary transition-colors"
        >
          <CardHeader>
            <CardTitle className="text-primary font-heading">
              {bet.question}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {new Date(bet.created_at).toLocaleDateString()} - {bet.status}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-300">
                Category: {bet.category || "Uncategorized"}
              </p>
              <p className="text-gray-300">
                Resolution: {new Date(bet.resolution_time).toLocaleDateString()}
              </p>
              {bet.options && (
                <div className="mt-4">
                  <p className="text-gray-300 mb-2">Options:</p>
                  <ul className="list-disc list-inside">
                    {JSON.parse(bet.options).map((option, index) => (
                      <li key={index} className="text-secondary">
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-secondary text-dark hover:bg-secondary/80">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
