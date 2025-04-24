const hre = require("hardhat");
const { parseEther } = require("ethers");

async function main() {
  // Get the contract factory
  const PredictionMarket = await hre.ethers.getContractFactory(
    "PredictionMarket"
  );

  // Connect to the deployed contract
  const predictionMarket = await PredictionMarket.attach(
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  );

  // Create a test prediction
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const resolutionTime = currentTimestamp + 86400; // 24 hours from now
  const question = "Will ETH reach $5000 by end of 2025?";
  const options = ["Yes", "No"];

  console.log("Creating test prediction...");
  const tx = await predictionMarket.createPrediction(
    question,
    options,
    resolutionTime
  );
  await tx.wait();

  console.log("Prediction created successfully!");
  console.log("Transaction hash:", tx.hash);

  // Place a stake on "Yes" (option 0)
  console.log("\nPlacing stake on 'Yes' option...");
  const stakeAmount = parseEther("1.0"); // Stake 1 ETH
  const stakeTx = await predictionMarket.placeStake(0, 0, {
    value: stakeAmount,
  });
  await stakeTx.wait();

  console.log("Stake placed successfully!");
  console.log("Stake transaction hash:", stakeTx.hash);

  // Get the prediction options to verify stakes
  const predictionOptions = await predictionMarket.getPredictionOptions(0);
  console.log("\nUpdated prediction options:");
  predictionOptions.forEach((option, index) => {
    console.log(
      `${index + 1}. ${option.name} (Total staked: ${option.totalStaked})`
    );
  });

  // Fast forward time (in local network) to after resolution time
  console.log("\nFast forwarding time to resolution...");
  await hre.network.provider.send("evm_setNextBlockTimestamp", [
    resolutionTime + 1,
  ]);
  await hre.network.provider.send("evm_mine");

  // Resolve the prediction (Yes wins)
  console.log("\nResolving prediction (Yes wins)...");
  const resolveTx = await predictionMarket.resolvePrediction(0, 0); // 0 = Yes wins
  await resolveTx.wait();

  console.log("Prediction resolved successfully!");
  console.log("Resolution transaction hash:", resolveTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
