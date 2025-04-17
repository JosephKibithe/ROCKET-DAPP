import IpfsUploadTest from "../../components/IpfsUploadTest";

export const metadata = {
  title: "IPFS Upload Test - ROCKET",
  description: "Test IPFS uploads for the ROCKET prediction market platform",
};

export default function IpfsTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-heading text-center mb-8">
        IPFS Upload Testing
      </h1>

      <p className="text-center mb-8 max-w-2xl mx-auto">
        This page allows you to test uploading images to IPFS for the ROCKET
        prediction market platform. Select an image file and click upload to
        store it on IPFS.
      </p>

      <IpfsUploadTest />
    </div>
  );
}
