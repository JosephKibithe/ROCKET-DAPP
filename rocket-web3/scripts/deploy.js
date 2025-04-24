const hre = require("hardhat");

async function main() {
  console.log("Deploying PredictionMarket contract...");

  const PredictionMarket = await hre.ethers.getContractFactory(
    "PredictionMarket"
  );
  const predictionMarket = await PredictionMarket.deploy();

  await predictionMarket.waitForDeployment();

  const address = await predictionMarket.getAddress();
  console.log("PredictionMarket deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
