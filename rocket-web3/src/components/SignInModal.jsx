"use client";

import { useState } from "react";
import {
  X,
  Mail,
  UserPlus,
  ArrowRight,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";

/**
 * SignInModal component for user authentication
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @returns {JSX.Element} Sign In Modal component
 */
export default function SignInModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("signIn"); // signIn or signUp
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn } = useAppStore();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Extract form data
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const username =
        activeTab === "signUp" ? formData.get("username") : email.split("@")[0];

      // Here you would implement actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Update global store with user data
      signIn({
        email,
        username,
        createdAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-dark/95 border border-white/10 rounded-lg w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-xl font-medium">
                {activeTab === "signIn" ? "Sign In" : "Create Account"}
              </h3>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white rounded-full p-1 hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  className={`pb-2 px-1 ${
                    activeTab === "signIn"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("signIn")}
                >
                  Sign In
                </button>
                <button
                  className={`pb-2 px-1 ml-4 ${
                    activeTab === "signUp"
                      ? "border-b-2 border-primary text-primary"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("signUp")}
                >
                  Sign Up
                </button>
              </div>

              {/* Error message if present */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSignIn}>
                <div className="space-y-4">
                  {activeTab === "signUp" && (
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-white/70 mb-1"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                        />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          className="bg-dark/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 w-full text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="Create a username"
                          required={activeTab === "signUp"}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-white/70 mb-1"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="bg-dark/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 w-full text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-white/70 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="bg-dark/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 w-full text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        placeholder={
                          activeTab === "signIn"
                            ? "Enter your password"
                            : "Create a password"
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-lg flex items-center justify-center mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {activeTab === "signIn" ? "Sign In" : "Create Account"}
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center mt-6 mb-4">
                <div className="flex-1 border-t border-white/10"></div>
                <div className="px-3 text-white/40 text-sm">
                  or continue with
                </div>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              {/* Social login buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full border border-white/10 bg-dark/50 hover:bg-dark/70 text-white py-2 rounded-lg flex items-center justify-center"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      signIn({
                        email: "user@example.com",
                        username: "googleuser",
                        provider: "google",
                        createdAt: new Date().toISOString(),
                      });
                      onClose();
                    }, 1000);
                  }}
                  disabled={isLoading}
                >
                  <img
                    src="/images/google-icon.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  Continue with Google
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
