/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF2D75", // electric pink
        secondary: "#00E0C7", // teal
        dark: "#1A0933", // deep purple
      },
      fontFamily: {
        heading: ["var(--font-comic-neue)"],
        body: ["var(--font-inter)"],
        anime: ["var(--font-comic-neue)", "sans-serif"], // Anime/Ghibli-inspired font
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        glow: "0 0 15px rgba(255, 45, 117, 0.5)",
        "glow-teal": "0 0 15px rgba(0, 224, 199, 0.5)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
