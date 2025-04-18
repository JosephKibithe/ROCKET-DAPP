"use client";

import { useState, useEffect, useRef } from "react";
import { subscribeToLiveBets, fetchBets } from "../../lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag, Users, TrendingUp } from "lucide-react";

// Sample data for development
const SAMPLE_BETS = [
  {
    id: "1",
    question: "Will ETH reach $5000 before July 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "crypto",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    participants: 156,
    volume: 2450,
    yes_percentage: 65,
  },
  {
    id: "2",
    question: "Will Bitcoin break $100K in 2023?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "crypto",
    status: "active",
    options: JSON.stringify(["Yes", "No", "It will drop below $20K first"]),
    participants: 324,
    volume: 5870,
    yes_percentage: 38,
  },
  {
    id: "3",
    question: "Will the Lakers win the NBA Championship?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "sports",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    participants: 278,
    volume: 3120,
    yes_percentage: 42,
  },
  {
    id: "4",
    question: "Will PulseChain reach $0.01 by May 2024?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 75 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "crypto",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    participants: 497,
    volume: 8950,
    yes_percentage: 78,
  },
  {
    id: "5",
    question: "Will Quentin Tarantino direct a Marvel movie?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "entertainment",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    participants: 135,
    volume: 975,
    yes_percentage: 12,
  },
  {
    id: "6",
    question: "Will SpaceX complete a successful Mars landing?",
    created_at: new Date().toISOString(),
    resolution_time: new Date(
      Date.now() + 180 * 24 * 60 * 60 * 1000
    ).toISOString(),
    category: "science",
    status: "active",
    options: JSON.stringify(["Yes", "No"]),
    participants: 412,
    volume: 6840,
    yes_percentage: 58,
  },
];

// Motion variants for animation
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

// BetCard component with framer-motion
const BetCard = ({ bet, index }) => {
  return (
    <Link href={`/bet/${bet.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          type: "spring",
          stiffness: 100,
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        <Card className="bg-dark/50 border-primary/10 hover:border-primary/50 transition-colors mb-4 overflow-hidden cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-white font-heading">
                {bet.question}
              </CardTitle>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  bet.status === "active"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : bet.status === "resolved"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
              </span>
            </div>
            <CardDescription className="text-gray-400 flex items-center gap-1">
              <Calendar size={14} />
              {new Date(bet.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <Tag size={14} />
                  <span>
                    {bet.category.charAt(0).toUpperCase() +
                      bet.category.slice(1)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-300">
                  <Clock size={14} />
                  <span>
                    Resolves:{" "}
                    {new Date(bet.resolution_time).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-300">
                  <Users size={14} />
                  <span>{bet.participants} participants</span>
                </div>

                <div className="flex items-center gap-1 text-gray-300">
                  <TrendingUp size={14} />
                  <span>{bet.volume} PLS volume</span>
                </div>
              </div>

              {/* Progress bar for Yes/No ratio */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>YES</span>
                  <span>NO</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${bet.yes_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{bet.yes_percentage}%</span>
                  <span>{100 - bet.yes_percentage}%</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">
              Predict Now
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
};

export default function LiveBetFeed({
  categoryFilter = "all",
  statusFilter = "all",
}) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const parentRef = useRef(null);

  // Filter bets based on category and status
  const filteredBets = bets.filter(
    (bet) =>
      (categoryFilter === "all" || bet.category === categoryFilter) &&
      (statusFilter === "all" || bet.status === statusFilter)
  );

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
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-lg">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (filteredBets.length === 0) {
    return (
      <div className="p-8 bg-dark/50 border border-white/10 rounded-lg text-center">
        <p className="text-xl font-heading mb-2">No predictions found</p>
        <p className="text-gray-400">
          Try selecting a different category or status.
        </p>
      </div>
    );
  }

  // Render the predictions in a simple list instead of using virtualization
  return (
    <div>
      <h2 className="text-2xl font-heading text-primary mb-4">
        Live Prediction Feed
        {categoryFilter !== "all" && (
          <span>
            {" "}
            - {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
          </span>
        )}
      </h2>

      <div
        ref={parentRef}
        className="overflow-auto max-h-[800px] pr-2 space-y-6"
      >
        {filteredBets.map((bet, index) => (
          <div key={bet.id} className="mb-6">
            <BetCard bet={bet} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
