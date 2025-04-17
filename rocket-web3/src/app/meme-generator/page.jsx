"use client";

import { useState } from "react";
import MemeEngine from "../../components/MemeEngine";

export default function MemeGeneratorPage() {
  const [generatedMeme, setGeneratedMeme] = useState(null);

  const handleMemeGenerated = (meme) => {
    setGeneratedMeme(meme);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-heading text-center mb-8">
        ROCKET Meme Generator
      </h1>

      <p className="text-center mb-8 max-w-2xl mx-auto">
        Create and share memes about your predictions! Select a template, add
        your text, and upload to IPFS to share with the community.
      </p>

      <MemeEngine onMemeGenerated={handleMemeGenerated} />

      {generatedMeme && (
        <div className="mt-8 p-6 border rounded-lg shadow-sm">
          <h2 className="text-2xl font-heading mb-4">Your Generated Meme</h2>

          <div className="flex flex-col items-center">
            <img
              src={generatedMeme.url}
              alt="Generated meme"
              className="max-w-md max-h-96 object-contain border rounded mb-4"
            />

            <p className="text-lg font-medium">IPFS URL:</p>
            <div className="w-full md:w-3/4 overflow-x-auto bg-gray-100 p-2 rounded mb-4">
              <a
                href={generatedMeme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {generatedMeme.url}
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(generatedMeme.url)}
                className="bg-dark text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
              >
                Copy Link
              </button>

              <a
                href={generatedMeme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary text-dark px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
