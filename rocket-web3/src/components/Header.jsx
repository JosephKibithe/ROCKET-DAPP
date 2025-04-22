"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Menu, X, User } from "lucide-react";
import { useAccount } from "wagmi";
import { useAppStore } from "@/lib/store";
import WalletConnectModal from "./WalletConnectModal";
import SignInModal from "./SignInModal";

/**
 * Header component with navigation and wallet connection
 * @returns {JSX.Element} Header component
 */
export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { isConnected } = useAccount();
  const { wallet, user, isAuthenticated, signOut } = useAppStore();

  // Navigation links
  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/trending", label: "Trending" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="bg-dark/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-heading font-bold text-primary"
          >
            ROCKET
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  pathname === link.href
                    ? "text-primary font-medium"
                    : "text-white/70 hover:text-white"
                } transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth and Wallet Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!isConnected && (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="bg-dark hover:bg-dark/70 text-white px-4 py-2 rounded-lg flex items-center border border-white/20"
              >
                <Wallet size={18} className="mr-2" />
                Connect Wallet
              </button>
            )}

            {isAuthenticated ? (
              <div className="relative group">
                <button className="bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 rounded-lg flex items-center">
                  <User size={18} className="mr-2" />
                  {user?.username || "User"}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-dark/95 border border-white/10 rounded-lg shadow-xl z-20 hidden group-hover:block">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg"
              >
                Sign In
              </button>
            )}

            {isConnected && (
              <Link
                href="/dashboard"
                className="bg-dark hover:bg-dark/70 text-white px-4 py-2 rounded-lg flex items-center border border-white/20"
              >
                <Wallet size={18} className="mr-2" />
                {wallet?.address ? (
                  <span>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                ) : (
                  "My Wallet"
                )}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 mt-4 animate-fadeIn">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? "text-primary font-medium"
                      : "text-white/70"
                  } transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 space-y-3">
                {!isConnected && (
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-dark hover:bg-dark/70 text-white px-4 py-2 rounded-lg flex items-center border border-white/20 w-full"
                  >
                    <Wallet size={18} className="mr-2" />
                    Connect Wallet
                  </button>
                )}

                {isAuthenticated ? (
                  <>
                    <div className="bg-primary/20 text-white px-4 py-2 rounded-lg flex items-center">
                      <User size={18} className="mr-2" />
                      {user?.username || "User"}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 rounded-md"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsSignInModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg block text-center w-full"
                  >
                    Sign In
                  </button>
                )}

                {isConnected && (
                  <Link
                    href="/dashboard"
                    className="bg-dark hover:bg-dark/70 text-white px-4 py-2 rounded-lg flex items-center border border-white/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Wallet size={18} className="mr-2" />
                    {wallet?.address ? (
                      <span>
                        {wallet.address.slice(0, 6)}...
                        {wallet.address.slice(-4)}
                      </span>
                    ) : (
                      "My Wallet"
                    )}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </header>
  );
}
