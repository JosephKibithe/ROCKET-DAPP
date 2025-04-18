"use client";

import { useState } from "react";
import LiveBetFeed from "@/components/LiveBetFeed";
import CategoriesPanel from "@/components/CategoriesPanel";

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

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
            <CategoriesPanel
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
            />
          </div>

          <div className="lg:col-span-9">
            <LiveBetFeed
              categoryFilter={selectedCategory}
              statusFilter={selectedStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
