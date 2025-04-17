const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let predictionMarket;
  let owner;
  let user1;
  let user2;
  let user3;
  let currentTimestamp;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy the contract
    const PredictionMarket = await ethers.getContractFactory(
      "PredictionMarket"
    );
    predictionMarket = await PredictionMarket.deploy();
    await predictionMarket.waitForDeployment();

    // Get the current block timestamp
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    currentTimestamp = blockBefore.timestamp;
  });

  describe("Prediction Creation", function () {
    it("Should create a prediction with valid parameters", async function () {
      const question = "Will ETH reach $5000 in 2023?";
      const options = ["Yes", "No"];
      const resolutionTime = currentTimestamp + 86400; // 1 day from now

      await expect(
        predictionMarket.createPrediction(question, options, resolutionTime)
      )
        .to.emit(predictionMarket, "PredictionCreated")
        .withArgs(0, question, owner.address, resolutionTime);

      // Get the created prediction options
      const predictionOptions = await predictionMarket.getPredictionOptions(0);
      expect(predictionOptions.length).to.equal(2);
      expect(predictionOptions[0].name).to.equal("Yes");
      expect(predictionOptions[1].name).to.equal("No");
    });

    it("Should revert if resolution time is in the past", async function () {
      const question = "Will ETH reach $5000 in 2023?";
      const options = ["Yes", "No"];
      const resolutionTime = currentTimestamp - 1; // 1 second ago

      await expect(
        predictionMarket.createPrediction(question, options, resolutionTime)
      ).to.be.revertedWith("Resolution time must be in the future");
    });

    it("Should revert if fewer than two options are provided", async function () {
      const question = "Will ETH reach $5000 in 2023?";
      const options = ["Yes"];
      const resolutionTime = currentTimestamp + 86400; // 1 day from now

      await expect(
        predictionMarket.createPrediction(question, options, resolutionTime)
      ).to.be.revertedWith("At least two options required");
    });
  });

  describe("Staking", function () {
    let predictionId;
    let resolutionTime;

    beforeEach(async function () {
      const question = "Will ETH reach $5000 in 2023?";
      const options = ["Yes", "No"];
      resolutionTime = currentTimestamp + 86400; // 1 day from now

      await predictionMarket.createPrediction(
        question,
        options,
        resolutionTime
      );
      predictionId = 0;
    });

    it("Should allow users to place stakes", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      const optionIndex = 0; // "Yes"

      await expect(
        predictionMarket
          .connect(user1)
          .placeStake(predictionId, optionIndex, { value: stakeAmount })
      )
        .to.emit(predictionMarket, "StakePlaced")
        .withArgs(predictionId, optionIndex, user1.address, stakeAmount);

      // Verify the stake was recorded correctly
      const userStake = await predictionMarket.getUserStake(
        predictionId,
        optionIndex,
        user1.address
      );
      expect(userStake).to.equal(stakeAmount);

      // Verify option stakes
      const options = await predictionMarket.getPredictionOptions(predictionId);
      expect(options[optionIndex].totalStaked).to.equal(stakeAmount);
    });

    it("Should revert when staking on invalid option index", async function () {
      const stakeAmount = ethers.parseEther("1.0");
      const invalidOptionIndex = 2; // There are only options 0 and 1

      await expect(
        predictionMarket
          .connect(user1)
          .placeStake(predictionId, invalidOptionIndex, { value: stakeAmount })
      ).to.be.revertedWith("Invalid option index");
    });

    it("Should revert when staking with zero amount", async function () {
      const optionIndex = 0; // "Yes"

      await expect(
        predictionMarket
          .connect(user1)
          .placeStake(predictionId, optionIndex, { value: 0 })
      ).to.be.revertedWith("Stake amount must be greater than zero");
    });
  });

  describe("Resolution and Rewards", function () {
    let predictionId;
    let resolutionTime;

    beforeEach(async function () {
      const question = "Will ETH reach $5000 in 2023?";
      const options = ["Yes", "No"];

      // Setting resolution time to near future so we can fast forward to it
      resolutionTime = currentTimestamp + 3600; // 1 hour from now

      await predictionMarket.createPrediction(
        question,
        options,
        resolutionTime
      );
      predictionId = 0;

      // User1 stakes 1 ETH on "Yes"
      await predictionMarket.connect(user1).placeStake(predictionId, 0, {
        value: ethers.parseEther("1.0"),
      });

      // User2 stakes 2 ETH on "No"
      await predictionMarket.connect(user2).placeStake(predictionId, 1, {
        value: ethers.parseEther("2.0"),
      });

      // User3 stakes 0.5 ETH on "Yes"
      await predictionMarket.connect(user3).placeStake(predictionId, 0, {
        value: ethers.parseEther("0.5"),
      });
    });

    it("Should resolve prediction correctly by creator after resolution time", async function () {
      // Fast forward time to after the resolution time
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        resolutionTime + 1,
      ]);
      await ethers.provider.send("evm_mine");

      const winningOptionIndex = 0; // "Yes"

      await expect(
        predictionMarket.resolvePrediction(predictionId, winningOptionIndex)
      )
        .to.emit(predictionMarket, "PredictionResolved")
        .withArgs(predictionId, winningOptionIndex);
    });

    it("Should not allow non-creator to resolve prediction", async function () {
      // Fast forward time to after the resolution time
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        resolutionTime + 1,
      ]);
      await ethers.provider.send("evm_mine");

      const winningOptionIndex = 0; // "Yes"

      await expect(
        predictionMarket
          .connect(user1)
          .resolvePrediction(predictionId, winningOptionIndex)
      ).to.be.revertedWith("Only creator can call this function");
    });

    it("Should not allow resolution before resolution time", async function () {
      const winningOptionIndex = 0; // "Yes"

      await expect(
        predictionMarket.resolvePrediction(predictionId, winningOptionIndex)
      ).to.be.revertedWith("Resolution time not reached");
    });

    it("Should allow winners to claim rewards after resolution", async function () {
      // Fast forward time to after the resolution time
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        resolutionTime + 1,
      ]);
      await ethers.provider.send("evm_mine");

      const winningOptionIndex = 0; // "Yes"

      // Resolve the prediction
      await predictionMarket.resolvePrediction(
        predictionId,
        winningOptionIndex
      );

      // User1 claims reward
      const user1BalanceBefore = await ethers.provider.getBalance(
        user1.address
      );

      const tx = await predictionMarket
        .connect(user1)
        .claimReward(predictionId);
      const receipt = await tx.wait();

      // Calculate gas used
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);

      // User1 staked 1 ETH of the total 1.5 ETH in the winning pool (Yes)
      // So they should get their 1 ETH back plus 2/3 of the 2 ETH from the losing pool minus 1% fee
      // That's 1 + (2/3 * 2 * 0.99) ≈ 1 + 1.32 = 2.32 ETH
      const expectedReward = ethers.parseEther("2.32");

      // Allow for small rounding errors in calculation
      const difference =
        user1BalanceAfter - user1BalanceBefore - expectedReward + gasUsed;
      expect(Math.abs(Number(difference))).to.be.lessThan(
        Number(ethers.parseEther("0.01"))
      );
    });

    it("Should not allow double claiming of rewards", async function () {
      // Fast forward time to after the resolution time
      await ethers.provider.send("evm_setNextBlockTimestamp", [
        resolutionTime + 1,
      ]);
      await ethers.provider.send("evm_mine");

      const winningOptionIndex = 0; // "Yes"

      // Resolve the prediction
      await predictionMarket.resolvePrediction(
        predictionId,
        winningOptionIndex
      );

      // User1 claims reward
      await predictionMarket.connect(user1).claimReward(predictionId);

      // Try to claim again
      await expect(
        predictionMarket.connect(user1).claimReward(predictionId)
      ).to.be.revertedWith("Rewards already claimed");
    });
  });
});
