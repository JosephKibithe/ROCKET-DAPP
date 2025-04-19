"use client";

import { createContext, useContext, useEffect } from "react";

// Create context for accessibility features
const AccessibilityContext = createContext({
  focusVisible: false,
});

/**
 * Accessibility Provider component
 * Adds necessary attributes and focus management for keyboard navigation
 * Ensures WCAG 2.1 AA compliant focus states
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function AccessibilityProvider({ children }) {
  useEffect(() => {
    // Add class to body when using keyboard navigation
    const handleFirstTab = (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("user-is-tabbing");
        window.removeEventListener("keydown", handleFirstTab);
      }
    };

    // Add focus outline for keyboard navigation
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .user-is-tabbing *:focus {
        outline: 3px solid #FF2D75 !important;
        outline-offset: 4px !important;
      }
      
      /* Hide focus outlines for mouse users */
      *:focus:not(:focus-visible) {
        outline: none !important;
      }
      
      /* Skip to content link for keyboard users */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #FF2D75;
        color: white;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 0;
      }
    `;
    document.head.appendChild(styleElement);

    // Add skip to content link for keyboard users
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Skip to content";
    document.body.prepend(skipLink);

    // Set up event listener for first tab press
    window.addEventListener("keydown", handleFirstTab);

    // Clean up function
    return () => {
      window.removeEventListener("keydown", handleFirstTab);
      document.head.removeChild(styleElement);
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={{ focusVisible: true }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 * @returns {Object} Accessibility context
 */
export function useAccessibility() {
  return useContext(AccessibilityContext);
}
