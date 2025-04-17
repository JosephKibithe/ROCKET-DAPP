import type { Metadata } from "next";
import { Inter, Comic_Neue } from "next/font/google";
import "./globals.css";
import "./tailwind.css";
import Web3Provider from "../components/Web3Provider";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with wagmi/web3 components
const EventListenersComponent = dynamic(
  () =>
    import("../lib/initEventListeners").then((mod) => mod.InitEventListeners),
  { ssr: false }
);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const comicNeue = Comic_Neue({
  variable: "--font-comic-neue",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROCKET - Web3 Prediction Market",
  description: "A decentralized prediction market for PulseChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${comicNeue.variable} antialiased bg-gradient-to-br from-dark to-black text-white`}
      >
        <Web3Provider>
          {/* Initialize contract event listeners */}
          <EventListenersComponent />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
