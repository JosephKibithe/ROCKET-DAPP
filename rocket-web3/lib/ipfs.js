import axios from "axios";
import FormData from "form-data";

// Pinata configuration
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
const ipfsGateway =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

// Check if we have API keys in server environment (not available in browser)
const hasPinataServerConfig =
  typeof window === "undefined" && pinataApiKey && pinataApiSecret;
// Check if we have JWT for browser-side uploads
const hasPinataBrowserConfig = typeof window !== "undefined" && pinataJWT;

/**
 * Upload a file to IPFS via Pinata
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} - The IPFS URI of the uploaded file
 */
export async function uploadToIPFS(file) {
  try {
    let ipfsHash;

    if (hasPinataServerConfig) {
      // Server-side upload
      ipfsHash = await serverSideUpload(file);
    } else if (hasPinataBrowserConfig) {
      // Browser-side upload with JWT
      ipfsHash = await browserSideUpload(file);
    } else {
      // If we're in development and have no API keys, use mock implementation
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Using mock IPFS implementation (no Pinata credentials found)"
        );
        return mockUploadToIPFS(file);
      } else {
        throw new Error(
          "Pinata API keys not configured. Check your environment variables."
        );
      }
    }

    // Return the IPFS URI
    const uri = `${ipfsGateway}${ipfsHash}`;
    return uri;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param {Object} metadata - The metadata object to upload
 * @returns {Promise<string>} - The IPFS URI of the uploaded metadata
 */
export async function uploadMetadataToIPFS(metadata) {
  try {
    // Convert metadata to a Buffer or Blob depending on environment
    const metadataString = JSON.stringify(metadata);
    let metadataFile;

    if (typeof window === "undefined") {
      // Server environment
      metadataFile = Buffer.from(metadataString);
    } else {
      // Browser environment
      metadataFile = new Blob([metadataString], { type: "application/json" });
    }

    // Use same upload function for metadata
    return await uploadToIPFS(metadataFile);
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}

// Server-side upload using Pinata API keys
async function serverSideUpload(file) {
  const formData = new FormData();

  // If we have a name from the file, use it
  const fileName = file.name || "file";

  formData.append("file", file, fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      app: "ROCKET",
      timestamp: Date.now(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret,
      },
    }
  );

  return response.data.IpfsHash;
}

// Browser-side upload using Pinata JWT
async function browserSideUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name || "file",
    keyvalues: {
      app: "ROCKET",
      timestamp: Date.now(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const response = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      maxBodyLength: "Infinity",
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
      },
    }
  );

  return response.data.IpfsHash;
}

// Mock implementation for development without API keys
async function mockUploadToIPFS(file) {
  console.log(
    "Mock uploading file to IPFS:",
    file.name || "unnamed file",
    file.size,
    "bytes"
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Generate mock CID
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let mockCID = "Qm";
  for (let i = 0; i < 44; i++) {
    mockCID += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const uri = `${ipfsGateway}${mockCID}`;
  console.log("Mock upload complete, URI:", uri);
  return uri;
}

export default {
  uploadToIPFS,
  uploadMetadataToIPFS,
  gateway: ipfsGateway,
};
