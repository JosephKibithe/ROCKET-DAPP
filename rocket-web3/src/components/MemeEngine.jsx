"use client";

import { useState, useRef, useEffect } from "react";
import { uploadToIPFS } from "../../lib/ipfs";

// Sample meme templates - in a production app, you would have more templates
const MEME_TEMPLATES = [
  {
    id: "drake",
    name: "Drake Meme",
    url: "/meme-templates/drake.jpg",
    textPositions: [
      { x: 50, y: 25, maxWidth: 90, color: "#000000", align: "center" },
      { x: 50, y: 75, maxWidth: 90, color: "#000000", align: "center" },
    ],
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    url: "/meme-templates/distracted.jpg",
    textPositions: [
      { x: 15, y: 20, maxWidth: 25, color: "#ffffff", align: "center" },
      { x: 50, y: 20, maxWidth: 25, color: "#ffffff", align: "center" },
      { x: 80, y: 20, maxWidth: 25, color: "#ffffff", align: "center" },
    ],
  },
  {
    id: "button",
    name: "Two Buttons",
    url: "/meme-templates/buttons.jpg",
    textPositions: [
      { x: 35, y: 8, maxWidth: 60, color: "#ffffff", align: "center" },
      { x: 65, y: 8, maxWidth: 60, color: "#ffffff", align: "center" },
      { x: 50, y: 80, maxWidth: 80, color: "#ffffff", align: "center" },
    ],
  },
];

export default function MemeEngine({ onMemeGenerated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(MEME_TEMPLATES[0]);
  const [texts, setTexts] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Initialize text inputs when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setTexts(selectedTemplate.textPositions.map(() => ""));
      setImageLoaded(false);
    }
  }, [selectedTemplate]);

  // Update the canvas when texts or image changes
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    renderMeme();
  }, [texts, imageLoaded]);

  const handleTemplateChange = (templateId) => {
    const template = MEME_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const handleTextChange = (index, value) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const renderMeme = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Draw text overlays
      texts.forEach((text, index) => {
        if (!text) return;

        const position = selectedTemplate.textPositions[index];

        ctx.fillStyle = position.color || "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.font = "bold 36px Arial";
        ctx.textAlign = position.align || "center";
        ctx.textBaseline = "middle";

        // Calculate position in pixels
        const x = (position.x / 100) * canvas.width;
        const y = (position.y / 100) * canvas.height;
        const maxWidth = (position.maxWidth / 100) * canvas.width;

        // Handle multiline text
        const words = text.split(" ");
        let line = "";
        let lineY = y;

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);

          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, lineY);
            ctx.strokeText(line, x, lineY);
            line = words[i] + " ";
            lineY += 40; // Line height
          } else {
            line = testLine;
          }
        }

        ctx.fillText(line, x, lineY);
        ctx.strokeText(line, x, lineY);
      });
    };

    img.src = selectedTemplate.url;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `rocket-meme-${selectedTemplate.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadToIPFS = async () => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, "image/png");
      });

      // Upload to IPFS
      const ipfsUrl = await uploadToIPFS(blob);

      if (onMemeGenerated) {
        onMemeGenerated({
          url: ipfsUrl,
          template: selectedTemplate.id,
          texts: [...texts],
        });
      }

      return ipfsUrl;
    } catch (err) {
      console.error("Error uploading meme to IPFS:", err);
      setError(err.message || "Error uploading to IPFS");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm my-8">
      <h2 className="text-2xl font-heading mb-4">Meme Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Template
            </label>
            <select
              value={selectedTemplate.id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            >
              {MEME_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {texts.map((text, index) => (
            <div key={index} className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Text #{index + 1}
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder={`Enter text for position ${index + 1}`}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>
          ))}

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleDownload}
              disabled={!imageLoaded}
              className="bg-secondary text-dark px-4 py-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download
            </button>

            <button
              onClick={handleUploadToIPFS}
              disabled={loading || !imageLoaded}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Upload to IPFS"}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm">
              <p>Error: {error}</p>
            </div>
          )}
        </div>

        <div>
          <div className="relative bg-gray-100 border rounded-lg overflow-hidden">
            <img
              src={selectedTemplate.url}
              alt={selectedTemplate.name}
              className="hidden"
              onLoad={handleImageLoad}
            />
            <canvas ref={canvasRef} className="max-w-full mx-auto" />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Loading template...</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Preview your meme above
          </p>
        </div>
      </div>
    </div>
  );
}
