import { notFound } from "next/navigation";
import Image from "next/image";

// TODO: Replace with actual data fetching logic (e.g., from Supabase or contract)
async function getBetDetails(id) {
  // Simulating API call - Replace with actual fetching
  console.log(`Fetching details for bet ID: ${id}`);
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate network delay

  // Example data structure - adjust based on actual data
  const mockData = {
    123: {
      id: "123",
      title: "Will ETH reach $5k by EOY?",
      status: "Active",
      odds: { yes: 2.5, no: 1.8 },
      participants: 150,
      resolved: false,
      memeUrl: null,
    },
    456: {
      id: "456",
      title: "PulseChain TPS > 1000 sustained?",
      status: "Resolved",
      odds: { yes: 1.5, no: 3.0 },
      participants: 320,
      resolved: true,
      winningOption: "yes",
      memeUrl: "/placeholder-meme.png",
    }, // Example resolved bet with meme
  };

  const bet = mockData[id];

  if (!bet) {
    // If bet not found, return null or throw an error to trigger notFound()
    return null;
  }
  return bet;
}

// ISR Configuration: Generate static pages for existing bets at build time
// TODO: Fetch actual bet IDs for generation
export async function generateStaticParams() {
  // Fetch a list of existing bet IDs (e.g., from Supabase)
  // const betIds = await fetchAllBetIds();
  const betIds = ["123", "456"]; // Example IDs

  return betIds.map((id) => ({
    id,
  }));
}

// Set metadata dynamically based on the bet
export async function generateMetadata({ params }) {
  const bet = await getBetDetails(params.id);
  if (!bet) {
    return { title: "Bet Not Found" };
  }
  return {
    title: `${bet.title} - ROCKET Prediction`,
    description: `Details for the prediction market: ${bet.title}`,
  };
}

export default function BetDetailPage({ params }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark to-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary">
          Bet Details
        </h1>
        <p className="text-lg text-secondary mb-6">ID: {params.id}</p>
      </div>
    </div>
  );
}
