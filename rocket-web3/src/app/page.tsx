import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">ROCKET</h1>
      <p className="mb-8">Web3 Prediction Market</p>
      <a
        href="/browse"
        className="bg-primary text-white px-6 py-3 rounded hover:opacity-90"
      >
        Get Started
      </a>
    </div>
  );
}
