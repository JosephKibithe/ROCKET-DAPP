"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Tag,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Loader,
  Sparkles,
} from "lucide-react";

// Import UI components (assuming ShadCN is used)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * BetCreationModal - 4-step wizard for creating new prediction markets
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal should close
 * @param {Function} props.onSubmit - Function to call when prediction is submitted
 */
export default function BetCreationModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    category: "crypto",
    options: ["Yes", "No"],
    resolutionSource: "manual", // "manual" or "oracle"
    resolutionDate: "",
    initialStake: 5, // in PLS
    platformFee: 0.5, // display only, 0.5%
  });

  // For dynamic options addition
  const [newOption, setNewOption] = useState("");

  // Initial stake input validation
  const initialStakeRef = useRef(null);

  // Modal motion variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
  };

  // Step content variants
  const stepVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Direction of step change for animation
  const [[page, direction], setPage] = useState([1, 0]);

  // Page turning with directional animation
  const paginate = (newDirection) => {
    const newPage = page + newDirection;
    if (newPage < 1 || newPage > 4) return;

    setPage([newPage, newDirection]);
    setStep(newPage);
  };

  // Handle form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add a new option to the options array
  const addOption = () => {
    if (newOption.trim() && formData.options.length < 5) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()],
      });
      setNewOption("");
    }
  };

  // Remove an option
  const removeOption = (indexToRemove) => {
    // Always keep at least 2 options
    if (formData.options.length <= 2) return;

    setFormData({
      ...formData,
      options: formData.options.filter((_, index) => index !== indexToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.question.trim()) {
        setError("Prediction question is required");
        setLoading(false);
        return;
      }

      if (!formData.resolutionDate) {
        setError("Resolution date is required");
        setLoading(false);
        return;
      }

      // Mock API call for contract deployment
      console.log("Deploying prediction market contract with data:", formData);

      // Simulate delay for contract deployment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful creation
      setSuccess(true);

      // Call the parent component's submit handler after successful creation
      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (err) {
      console.error("Error creating prediction:", err);
      setError("Failed to create prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset modal state when closing
  const handleClose = () => {
    setStep(1);
    setPage([1, 0]);
    setFormData({
      question: "",
      description: "",
      category: "crypto",
      options: ["Yes", "No"],
      resolutionSource: "manual",
      resolutionDate: "",
      initialStake: 5,
      platformFee: 0.5,
    });
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  // Calculate the estimated gas fee and total cost
  const calculateCost = () => {
    // Mock values, would be calculated based on network gas prices in production
    const estimatedGasFee = 0.2; // PLS
    const totalCost = formData.initialStake + estimatedGasFee;

    return {
      stake: formData.initialStake,
      gasFee: estimatedGasFee,
      total: totalCost,
    };
  };

  const cost = calculateCost();

  // The render content per step
  const renderStepContent = () => {
    const currentStep = step; // Alias page to step for clarity

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Prediction Question *</Label>
              <Input
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Will ETH reach $5000 by the end of 2024?"
                className="bg-dark/30 border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about the terms, conditions, or context of this prediction"
                className="bg-dark/30 border-white/20 h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-dark/30 border border-white/20 rounded p-2 text-white"
              >
                <option value="crypto">Crypto</option>
                <option value="sports">Sports</option>
                <option value="politics">Politics</option>
                <option value="entertainment">Entertainment</option>
                <option value="science">Science</option>
                <option value="tech">Technology</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Options</Label>
              <p className="text-sm text-white/60">
                Participants will stake on one of these options. You can use
                Yes/No or add multiple options.
              </p>

              <div className="space-y-3 mt-3">
                {formData.options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-dark/30 border border-white/20 rounded p-2"
                  >
                    <span className="flex-grow">{option}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-white/60 hover:text-red-500"
                      disabled={formData.options.length <= 2}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {formData.options.length < 5 && (
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add another option"
                    className="bg-dark/30 border-white/20"
                  />
                  <Button
                    type="button"
                    onClick={addOption}
                    disabled={!newOption.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Resolution Mechanism</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, resolutionSource: "manual" })
                  }
                  className={`p-3 rounded-lg flex flex-col items-center ${
                    formData.resolutionSource === "manual"
                      ? "bg-primary/20 border border-primary"
                      : "bg-dark/50 border border-white/10 hover:bg-dark/70"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <Check size={20} className="text-primary" />
                  </div>
                  <span className="font-medium">Manual</span>
                  <span className="text-xs text-white/60">
                    You'll resolve it later
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, resolutionSource: "oracle" })
                  }
                  className={`p-3 rounded-lg flex flex-col items-center ${
                    formData.resolutionSource === "oracle"
                      ? "bg-primary/20 border border-primary"
                      : "bg-dark/50 border border-white/10 hover:bg-dark/70"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                    <Sparkles size={20} className="text-secondary" />
                  </div>
                  <span className="font-medium">Oracle</span>
                  <span className="text-xs text-white/60">
                    Auto-resolved from on-chain data
                  </span>
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resolutionDate">Resolution Date *</Label>
              <p className="text-sm text-white/60">
                When will this prediction be resolved? Participants can place
                stakes until this date.
              </p>
              <Input
                id="resolutionDate"
                name="resolutionDate"
                type="date"
                value={formData.resolutionDate}
                onChange={handleChange}
                className="bg-dark/30 border-white/20"
                min={new Date().toISOString().split("T")[0]} // Minimum date is today
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialStake">Your Initial Stake (PLS)</Label>
              <p className="text-sm text-white/60">
                How much do you want to stake on your preferred outcome?
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="initialStake"
                  name="initialStake"
                  type="number"
                  ref={initialStakeRef}
                  value={formData.initialStake}
                  onChange={handleChange}
                  min={1}
                  className="bg-dark/30 border-white/20"
                />
                <span>PLS</span>
              </div>
            </div>

            <div className="bg-dark/40 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Fee Information</p>
              <p className="text-sm text-white/60">
                A platform fee of {formData.platformFee}% will be deducted from
                the total pool before distributing rewards.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Confirm Your Prediction</h3>

            <div className="space-y-4 bg-dark/40 p-4 rounded-lg">
              <div>
                <p className="text-sm text-white/60">Question</p>
                <p className="font-medium">{formData.question}</p>
              </div>

              <div>
                <p className="text-sm text-white/60">Category</p>
                <p className="font-medium capitalize">{formData.category}</p>
              </div>

              <div>
                <p className="text-sm text-white/60">Options</p>
                <ul className="list-disc list-inside">
                  {formData.options.map((option, index) => (
                    <li key={index} className="font-medium">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm text-white/60">Resolution</p>
                <p className="font-medium">
                  {formData.resolutionSource === "manual" ? "Manual" : "Oracle"}{" "}
                  -
                  {formData.resolutionDate
                    ? ` ${new Date(
                        formData.resolutionDate
                      ).toLocaleDateString()}`
                    : " Not set"}
                </p>
              </div>
            </div>

            <div className="bg-dark/40 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">Cost Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Initial stake:</span>
                  <span>{cost.stake} PLS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Estimated gas fee:</span>
                  <span>{cost.gasFee} PLS</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-white/10 pt-2 mt-2">
                  <span>Total:</span>
                  <span>{cost.total} PLS</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Success view shown after successful submission
  const renderSuccessView = () => (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-4">
        <Check size={24} className="text-green-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Prediction Created!</h3>
      <p className="text-white/60 mb-6">
        Your prediction has been published. The link has been copied to your
        clipboard.
      </p>

      <div className="space-y-4">
        <button
          className="bg-primary hover:bg-primary/90 text-white w-full py-2 rounded-lg"
          onClick={handleClose}
        >
          Close
        </button>

        <button
          className="bg-dark/50 hover:bg-dark/70 text-white w-full py-2 rounded-lg"
          onClick={() => {
            // Here we would navigate to the new prediction
            handleClose();
          }}
        >
          View My Prediction
        </button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          {!success && (
            <>
              <DialogTitle>Create New Prediction</DialogTitle>
              <DialogDescription className="text-white/60">
                Set up your prediction market in 4 simple steps.
              </DialogDescription>

              <div className="flex justify-between mt-4">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-1/4 h-1 rounded-full mx-1 transition-colors duration-200 ${
                      stepNumber <= step ? "bg-primary" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key={page}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {renderStepContent()}
            </motion.div>
          ) : (
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {renderSuccessView()}
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => paginate(-1)}
              disabled={step === 1 || loading}
              className="bg-dark/50 border-white/20 text-white hover:bg-dark/70"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                type="button"
                onClick={() => paginate(1)}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Prediction
                    <Sparkles size={16} className="ml-2" />
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
