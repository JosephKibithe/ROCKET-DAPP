"use client";

import { useState, useEffect, useRef } from "react";
import {
  supabase,
  mockBets,
  fetchBets as supabaseFetchBets,
  subscribeToLiveBets,
} from "../../lib/supabase";
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
import { Calendar, Clock, Tag, Users, TrendingUp, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

// Add a check for Supabase initialization
const initializeSupabase = () => {
  try {
    return supabase;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    return null;
  }
};

// Use the initialized Supabase instance or fallback
const supabaseClient = initializeSupabase();

export default function LiveBetFeed({
  category = "",
  status = "",
  limit = 10,
  showFilters = true,
  isCompact = false,
}) {
  const [bets, setBets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(category);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const isDevMode = process.env.NODE_ENV === "development";

  // Fetch bets on component mount and when filters change
  useEffect(() => {
    const fetchBetsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Reset pagination when filters change
        if (currentOffset === 0) {
          setBets([]);
        }

        const fetchedBets = await supabaseFetchBets({
          category: currentCategory || undefined,
          status: currentStatus || undefined,
          limit,
          offset: currentOffset,
        });

        setBets((prevBets) =>
          currentOffset === 0 ? fetchedBets : [...prevBets, ...fetchedBets]
        );

        setHasMore(fetchedBets.length === limit);
      } catch (err) {
        console.error("Error fetching bets:", err);
        setError("Failed to load predictions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBetsData();
  }, [currentCategory, currentStatus, currentOffset, limit]);

  // Subscribe to real-time updates
  useEffect(() => {
    let subscription;

    if (supabaseClient) {
      // Subscribe to real-time updates
      subscription = subscribeToLiveBets((payload) => {
        console.log("Real-time update received:", payload);

        // Handle different types of changes
        if (payload.eventType === "INSERT") {
          setBets((prevBets) => [payload.new, ...prevBets]);
        } else if (payload.eventType === "UPDATE") {
          setBets((prevBets) =>
            prevBets.map((bet) =>
              bet.id === payload.new.id ? payload.new : bet
            )
          );
        } else if (payload.eventType === "DELETE") {
          setBets((prevBets) =>
            prevBets.filter((bet) => bet.id !== payload.old.id)
          );
        }
      });
    }

    // Clean up subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Handle filters
  const applyFilters = (newCategory, newStatus) => {
    setCurrentCategory(newCategory);
    setCurrentStatus(newStatus);
    setCurrentOffset(0); // Reset pagination when filters change
  };

  // Load more bets
  const loadMore = () => {
    setCurrentOffset((prevOffset) => prevOffset + limit);
  };

  // No bets to display
  if (!isLoading && bets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No predictions found</h3>
        <p className="text-white/60">
          {error || "Try adjusting your filters or create a new prediction."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 md:hidden"
          >
            <Filter size={16} />
            {isFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>

          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${
              isFiltersOpen ? "block" : "hidden md:grid"
            }`}
          >
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Category
              </label>
              <select
                value={currentCategory}
                onChange={(e) => applyFilters(e.target.value, currentStatus)}
                className="bg-dark/50 border border-white/10 rounded-lg p-2 w-full text-white"
              >
                <option value="">All Categories</option>
                <option value="crypto">Crypto</option>
                <option value="sports">Sports</option>
                <option value="politics">Politics</option>
                <option value="entertainment">Entertainment</option>
                <option value="tech">Tech</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => applyFilters(currentCategory, e.target.value)}
                className="bg-dark/50 border border-white/10 rounded-lg p-2 w-full text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Sort filter (placeholder for future implementation) */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Sort By
              </label>
              <select
                defaultValue="newest"
                className="bg-dark/50 border border-white/10 rounded-lg p-2 w-full text-white"
              >
                <option value="newest">Newest First</option>
                <option value="stakes">Highest Stakes</option>
                <option value="ending">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Bet cards */}
      <div className="space-y-4">
        {bets.map((bet, index) => (
          <Link href={`/bet/${bet.id}`} key={bet.id}>
            <motion.div
              className="bg-dark/50 border border-white/10 rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">
                      {bet.category || "Misc"}
                    </span>
                    {bet.trending && (
                      <span className="bg-orange-500/20 text-orange-500 text-xs px-2 py-1 rounded flex items-center">
                        <TrendingUp size={12} className="mr-1" /> Trending
                      </span>
                    )}
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-white/50 group-hover:text-primary"
                  />
                </div>

                <h3 className="text-lg font-medium mb-1">
                  {bet.title || bet.question}
                </h3>

                {!isCompact && (
                  <p className="text-white/70 text-sm mb-3">
                    {bet.description || "No description provided."}
                  </p>
                )}

                <div className="flex justify-between items-center text-sm text-white/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDistanceToNow(new Date(bet.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                    {!isCompact && (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        Ends{" "}
                        {formatDistanceToNow(
                          new Date(bet.end_date || bet.resolution_time),
                          {
                            addSuffix: true,
                          }
                        )}
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-white">
                    {bet.yes_stake
                      ? `${(
                          Number(bet.yes_stake) + Number(bet.no_stake || 0)
                        ).toFixed(2)} ETH`
                      : "0 ETH"}
                  </div>
                </div>
              </div>

              {!isCompact && (
                <div className="bg-dark/70 p-3 flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400 font-medium">Yes</span>{" "}
                    <span className="text-white/60">
                      {bet.yes_stake ? `${bet.yes_stake} ETH` : "No stakes yet"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-red-400 font-medium">No</span>{" "}
                    <span className="text-white/60">
                      {bet.no_stake ? `${bet.no_stake} ETH` : "No stakes yet"}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </Link>
        ))}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="bg-dark/50 h-32 rounded-lg mb-4"></div>
              <div className="bg-dark/50 h-32 rounded-lg mb-4"></div>
              <div className="bg-dark/50 h-32 rounded-lg"></div>
            </div>
          </div>
        )}

        {/* Load More button */}
        {hasMore && bets.length > 0 && (
          <button
            onClick={loadMore}
            className="w-full py-3 bg-dark/50 hover:bg-dark/70 border border-white/10 rounded-lg text-white/70 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
}
