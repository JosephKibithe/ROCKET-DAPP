"use client";

import { useState } from "react";
import { uploadToIPFS, uploadMetadataToIPFS } from "../../lib/ipfs";

export default function IpfsUploadTest() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [metadataUrl, setMetadataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload the file to IPFS
      const ipfsUrl = await uploadToIPFS(file);
      setFileUrl(ipfsUrl);

      // Create and upload metadata
      const metadata = {
        name: file.name,
        description: "Test upload from ROCKET",
        image: ipfsUrl,
        attributes: [
          {
            trait_type: "Upload Date",
            value: new Date().toISOString(),
          },
        ],
      };

      const metadataIpfsUrl = await uploadMetadataToIPFS(metadata);
      setMetadataUrl(metadataIpfsUrl);
    } catch (err) {
      console.error("Error during IPFS upload:", err);
      setError(err.message || "Error uploading to IPFS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm max-w-md mx-auto my-8">
      <h2 className="text-2xl font-heading mb-4">IPFS Upload Test</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select Image File
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full border border-gray-300 rounded p-2"
          accept="image/*"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Uploading..." : "Upload to IPFS"}
      </button>

      {error && (
        <div className="mt-4 text-red-600 text-sm">
          <p>Error: {error}</p>
        </div>
      )}

      {fileUrl && (
        <div className="mt-4">
          <h3 className="font-medium">File Uploaded:</h3>
          <div className="overflow-x-auto">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {fileUrl}
            </a>
          </div>
          <div className="mt-2">
            <img
              src={fileUrl}
              alt="Uploaded preview"
              className="max-w-full max-h-48 object-contain border rounded mt-2"
            />
          </div>
        </div>
      )}

      {metadataUrl && (
        <div className="mt-4">
          <h3 className="font-medium">Metadata Uploaded:</h3>
          <div className="overflow-x-auto">
            <a
              href={metadataUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {metadataUrl}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
