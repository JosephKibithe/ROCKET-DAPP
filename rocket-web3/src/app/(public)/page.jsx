"use client"; // Add this since we're using useState

import Link from "next/link";
import { useState } from "react";

// Create a simple modal component for the sign-in options
function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-dark border-2 border-primary/50 rounded-lg p-8 max-w-md w-full mx-4 animate-fadeIn">
        <h2 className="text-2xl font-heading text-center text-primary mb-6">
          Sign In / Connect
        </h2>

        <div className="space-y-4">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={() => console.log("Google OAuth login")}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            Continue with Google
          </button>

          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={() => console.log("Email login")}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
              </svg>
            </span>
            Continue with Email
          </button>

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={() => console.log("Wallet connect")}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6ZM16 16H8V15C8 13.9 9.79 13 12 13C14.21 13 16 13.9 16 15V16Z" />
              </svg>
            </span>
            Connect Wallet
          </button>

          <button
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            onClick={() => console.log("Anonymous login")}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </span>
            Continue as Guest
          </button>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark bg-[url('/stars-bg.svg')] bg-repeat">
      <div className="text-center px-6">
        {/* Anime/cartoon-inspired title with animation */}
        <h1
          className="text-6xl md:text-8xl font-heading font-bold mb-4 
                     bg-gradient-to-r from-primary via-pink-400 to-secondary 
                     bg-clip-text text-transparent 
                     animate-pulse drop-shadow-[0_0_15px_rgba(255,45,117,0.5)]"
        >
          ROCKET
        </h1>

        <p className="text-xl md:text-2xl mb-10 text-white/70 font-heading">
          The next-gen prediction market on PulseChain
        </p>

        {/* Sign In button that opens auth modal */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white 
                    px-12 py-4 rounded-full text-lg font-medium
                    transition-all transform hover:scale-105 hover:-rotate-1
                    shadow-[0_4px_20px_rgba(255,45,117,0.4)] 
                    hover:shadow-[0_8px_30px_rgba(255,45,117,0.6)]
                    animate-bounce-subtle"
        >
          Sign In
        </button>

        {/* Subtle CTA text */}
        <p className="mt-6 text-gray-400 text-sm">
          Browse predictions without an account or sign in to participate
        </p>
      </div>

      {/* Flying rocket animation in bottom corner */}
      <div className="fixed bottom-10 right-10 animate-float hidden md:block">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/20 rounded-full animate-pulse"></div>
          <svg viewBox="0 0 24 24" className="w-16 h-16 text-primary">
            <path
              fill="currentColor"
              d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.41 14.54 6.63S16.59 5.85 17.37 6.63C18.14 7.41 18.15 8.68 17.37 9.46C16.59 10.24 15.32 10.24 14.54 9.46M8.88 16.53L7.47 15.12L8.88 16.53Z"
            />
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-white/40 text-sm">
        &copy; {new Date().getFullYear()} ROCKET. All rights reserved.
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Custom animation keyframes would be defined in globals.css */}
      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
