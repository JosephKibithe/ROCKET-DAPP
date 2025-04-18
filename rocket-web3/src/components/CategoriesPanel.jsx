"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Categories" },
  { id: "crypto", name: "Crypto" },
  { id: "sports", name: "Sports" },
  { id: "politics", name: "Politics" },
  { id: "entertainment", name: "Entertainment" },
  { id: "science", name: "Science" },
  { id: "tech", name: "Technology" },
];

const STATUSES = [
  { id: "all", name: "All Statuses" },
  { id: "active", name: "Active" },
  { id: "resolved", name: "Resolved" },
  { id: "cancelled", name: "Cancelled" },
];

/**
 * CategoriesPanel component with collapsible filters
 * @param {Object} props Component props
 * @param {string} props.selectedCategory Currently selected category
 * @param {string} props.selectedStatus Currently selected status
 * @param {Function} props.onCategoryChange Function to call when category changes
 * @param {Function} props.onStatusChange Function to call when status changes
 * @returns {JSX.Element} Collapsible categories panel
 */
export default function CategoriesPanel({
  selectedCategory = "all",
  selectedStatus = "all",
  onCategoryChange,
  onStatusChange,
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(false);

  const toggleCategory = () => setIsCategoryOpen(!isCategoryOpen);
  const toggleStatus = () => setIsStatusOpen(!isStatusOpen);
  const toggleTime = () => setIsTimeOpen(!isTimeOpen);

  return (
    <div className="bg-dark/30 p-6 rounded h-min sticky top-4">
      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={toggleCategory}
          className="w-full flex items-center justify-between text-2xl font-heading text-primary mb-4 focus:outline-none"
        >
          <span>Categories</span>
          {isCategoryOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {isCategoryOpen && (
          <ul className="space-y-2 pl-2 animate-fadeIn">
            {CATEGORIES.map((category) => (
              <li
                key={category.id}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category.id
                    ? "text-secondary font-medium"
                    : "text-gray-300 hover:text-primary"
                }`}
                onClick={() =>
                  onCategoryChange && onCategoryChange(category.id)
                }
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status Section */}
      <div className="mb-6">
        <button
          onClick={toggleStatus}
          className="w-full flex items-center justify-between text-2xl font-heading text-primary mb-4 focus:outline-none"
        >
          <span>Status</span>
          {isStatusOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {isStatusOpen && (
          <ul className="space-y-2 pl-2 animate-fadeIn">
            {STATUSES.map((status) => (
              <li
                key={status.id}
                className={`cursor-pointer transition-colors ${
                  selectedStatus === status.id
                    ? "text-secondary font-medium"
                    : "text-gray-300 hover:text-primary"
                }`}
                onClick={() => onStatusChange && onStatusChange(status.id)}
              >
                {status.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Time Range Section */}
      <div className="mb-4">
        <button
          onClick={toggleTime}
          className="w-full flex items-center justify-between text-2xl font-heading text-primary mb-4 focus:outline-none"
        >
          <span>Time Range</span>
          {isTimeOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {isTimeOpen && (
          <div className="space-y-4 pl-2 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              <label className="text-gray-300 text-sm">Ending After</label>
              <input
                type="date"
                className="bg-dark/50 border border-gray-700 rounded p-2 text-white"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-gray-300 text-sm">Ending Before</label>
              <input
                type="date"
                className="bg-dark/50 border border-gray-700 rounded p-2 text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
