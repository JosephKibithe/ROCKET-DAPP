"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
        Dashboard
      </h1>
      <p className="text-xl font-body text-secondary mb-8">
        Manage your predictions and track your performance
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {/* Main content area */}
          <div className="bg-dark/30 p-6 rounded">
            <h2 className="text-2xl font-heading text-primary mb-6">
              Your Active Predictions
            </h2>
            {/* Add prediction list component here */}
          </div>
        </div>

        <div className="lg:col-span-4">
          {/* Sidebar */}
          <div className="bg-dark/30 p-6 rounded">
            <h2 className="text-2xl font-heading text-primary mb-6">
              Statistics
            </h2>
            {/* Add statistics component here */}
          </div>
        </div>
      </div>
    </div>
  );
}
