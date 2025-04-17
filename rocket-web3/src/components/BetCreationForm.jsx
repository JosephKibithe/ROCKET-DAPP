"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBet } from "../../lib/supabase";

export default function BetCreationForm() {
  const [question, setQuestion] = useState("");
  const [optionText, setOptionText] = useState("");
  const [options, setOptions] = useState([]);
  const [category, setCategory] = useState("");
  const [resolutionDays, setResolutionDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addOption = () => {
    if (optionText.trim() === "") return;
    setOptions([...options, optionText.trim()]);
    setOptionText("");
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (question.trim() === "") {
      setError("Question is required");
      setLoading(false);
      return;
    }

    if (options.length < 2) {
      setError("At least two options are required");
      setLoading(false);
      return;
    }

    try {
      // Calculate resolution time based on days from now
      const resolutionTime = new Date();
      resolutionTime.setDate(
        resolutionTime.getDate() + parseInt(resolutionDays, 10)
      );

      // Create the bet object
      const bet = {
        question: question.trim(),
        options: JSON.stringify(options),
        category: category.trim() || "Uncategorized",
        resolution_time: resolutionTime.toISOString(),
        // Note: In a real app, creator_id would be set by the server based on authentication
        creator_id: "00000000-0000-0000-0000-000000000000", // Placeholder
        status: "active",
      };

      // Check if we're in development mode with no Supabase config
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isDevMode = !supabaseUrl || supabaseUrl === "your_supabase_url";

      if (isDevMode) {
        console.log("Development mode: simulating bet creation", bet);
        // Simulate successful creation
        setTimeout(() => {
          // Reset form on success
          setQuestion("");
          setOptionText("");
          setOptions([]);
          setCategory("");
          setResolutionDays(7);
          setSuccess(true);
          setLoading(false);
        }, 1000);
        return;
      }

      // Call the API to create the bet
      const response = await fetch("/api/bet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bet),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create bet");
      }

      // Reset form on success
      setQuestion("");
      setOptionText("");
      setOptions([]);
      setCategory("");
      setResolutionDays(7);
      setSuccess(true);
    } catch (err) {
      console.error("Error creating bet:", err);
      setError(err.message || "Failed to create bet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-dark/50 border-primary/30">
      <CardHeader>
        <CardTitle className="text-primary font-heading">
          Create New Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4">
            Prediction created successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-gray-300">
              Question
            </Label>
            <Input
              id="question"
              placeholder="E.g., Will ETH reach $5000 in 2023?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-dark/30 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">
              Category
            </Label>
            <Input
              id="category"
              placeholder="E.g., Crypto"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-dark/30 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolutionDays" className="text-gray-300">
              Resolution Time (days from now)
            </Label>
            <Input
              id="resolutionDays"
              type="number"
              min="1"
              max="365"
              value={resolutionDays}
              onChange={(e) => setResolutionDays(e.target.value)}
              className="bg-dark/30 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="options" className="text-gray-300">
              Options
            </Label>
            <div className="flex space-x-2">
              <Input
                id="options"
                placeholder="Add an option"
                value={optionText}
                onChange={(e) => setOptionText(e.target.value)}
                className="bg-dark/30 border-gray-700 text-white"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addOption}
                className="bg-secondary text-dark hover:bg-secondary/80"
              >
                Add
              </Button>
            </div>

            {options.length > 0 && (
              <ul className="mt-2 space-y-2">
                {options.map((option, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-dark/30 p-2 rounded"
                  >
                    <span className="text-gray-300">{option}</span>
                    <Button
                      type="button"
                      onClick={() => removeOption(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Prediction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
