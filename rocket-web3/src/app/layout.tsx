import type { Metadata } from "next";
import { Inter, Comic_Neue } from "next/font/google";
import "./globals.css";
import "./tailwind.css";
import Web3Provider from "../components/Web3Provider";
import EventListenersWrapper from "../components/EventListenersWrapper";

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
          <EventListenersWrapper />
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
