"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Plus, Search, User, TrendingUp } from "lucide-react";
import { useAppStore } from "@/lib/store";

/**
 * Mobile bottom navigation component with icons and animation
 * @returns {JSX.Element} Animated mobile bottom navigation bar
 */
export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { toggleBetCreationModal, isMobile } = useAppStore();

  // Only show bottom nav on mobile
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMobile) return null;

  // Navigation items with icons and paths
  const navItems = [
    {
      name: "Home",
      icon: <Home size={24} />,
      path: "/browse",
      active: pathname === "/browse",
    },
    {
      name: "Trending",
      icon: <TrendingUp size={24} />,
      path: "/trending",
      active: pathname === "/trending",
    },
    {
      name: "Create",
      icon: (
        <div className="bg-gradient-to-r from-primary to-secondary rounded-full p-3 -mt-8 shadow-glow">
          <Plus size={24} color="white" />
        </div>
      ),
      action: () => toggleBetCreationModal(),
      special: true,
    },
    {
      name: "Search",
      icon: <Search size={24} />,
      path: "/search",
      active: pathname === "/search",
    },
    {
      name: "Profile",
      icon: <User size={24} />,
      path: "/dashboard",
      active: pathname === "/dashboard",
    },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-white/10 py-2 px-4 z-50"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item, index) => (
          <div key={item.name} className="relative">
            {item.special ? (
              <button
                onClick={item.action}
                className="flex flex-col items-center justify-center py-1"
                aria-label={item.name}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </button>
            ) : (
              <Link
                href={item.path}
                className={`flex flex-col items-center justify-center py-1 ${
                  item.active ? "text-primary" : "text-gray-400"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.name}</span>
                {item.active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-2 w-12 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
