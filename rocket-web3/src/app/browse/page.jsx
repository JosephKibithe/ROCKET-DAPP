import LiveBetFeed from "@/components/LiveBetFeed";
import BetCreationForm from "@/components/BetCreationForm";

export const metadata = {
  title: "Browse Predictions - ROCKET",
  description: "Browse live prediction markets on ROCKET.",
};

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Browse Predictions
          </h1>
          <p className="text-xl font-body text-secondary">
            Discover and participate in live prediction markets
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-dark/30 p-6 rounded h-min sticky top-4">
              <h2 className="text-2xl font-heading text-primary mb-6">
                Categories
              </h2>
              <ul className="space-y-2">
                <li className="text-secondary hover:text-primary cursor-pointer transition-colors">
                  All Categories
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Crypto
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Sports
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Politics
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Entertainment
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Science
                </li>
              </ul>

              <h2 className="text-2xl font-heading text-primary mt-8 mb-6">
                Status
              </h2>
              <ul className="space-y-2">
                <li className="text-secondary hover:text-primary cursor-pointer transition-colors">
                  All
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Active
                </li>
                <li className="text-gray-300 hover:text-primary cursor-pointer transition-colors">
                  Resolved
                </li>
              </ul>

              <div className="mt-8">
                <BetCreationForm />
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <LiveBetFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
