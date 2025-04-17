// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PredictionMarket
 * @dev A smart contract for creating and resolving prediction markets
 */
contract PredictionMarket {
    // Structs
    struct Option {
        string name;
        uint256 totalStaked;
    }

    struct Prediction {
        string question;
        address creator;
        uint64 creationTime;
        uint64 resolutionTime;
        bool isResolved;
        uint16 winningOptionIndex;
        Option[] options;
        uint256 totalStaked;
        mapping(address => mapping(uint16 => uint256)) userStakes; // user => optionIndex => stake
        mapping(address => bool) hasClaimed;
    }

    // State variables
    Prediction[] public predictions;
    uint8 public immutable fee = 1; // 1% platform fee
    address public immutable owner;

    // Events
    event PredictionCreated(
        uint256 indexed predictionId,
        string question,
        address creator,
        uint64 resolutionTime
    );
    event StakePlaced(
        uint256 indexed predictionId,
        uint16 optionIndex,
        address user,
        uint256 amount
    );
    event PredictionResolved(
        uint256 indexed predictionId,
        uint16 winningOptionIndex
    );
    event RewardClaimed(
        uint256 indexed predictionId,
        address user,
        uint256 amount
    );

    constructor() {
        owner = msg.sender;
    }

    // Modifiers
    modifier predictionExists(uint256 _predictionId) {
        require(
            _predictionId < predictions.length,
            "Prediction does not exist"
        );
        _;
    }

    modifier notResolved(uint256 _predictionId) {
        require(
            !predictions[_predictionId].isResolved,
            "Prediction already resolved"
        );
        _;
    }

    modifier onlyCreator(uint256 _predictionId) {
        require(
            msg.sender == predictions[_predictionId].creator,
            "Only creator can call this function"
        );
        _;
    }

    modifier afterResolutionTime(uint256 _predictionId) {
        require(
            block.timestamp >= predictions[_predictionId].resolutionTime,
            "Resolution time not reached"
        );
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /**
     * @dev Create a new prediction market
     * @param _question The question being predicted
     * @param _options Array of option names
     * @param _resolutionTime Time when the prediction will be resolved
     */
    function createPrediction(
        string calldata _question,
        string[] calldata _options,
        uint64 _resolutionTime
    ) external {
        require(_options.length >= 2, "At least two options required");
        require(
            _resolutionTime > block.timestamp,
            "Resolution time must be in the future"
        );
        require(_options.length <= type(uint16).max, "Too many options");

        uint256 predictionId = predictions.length;
        Prediction storage newPrediction = predictions.push();

        newPrediction.question = _question;
        newPrediction.creator = msg.sender;
        newPrediction.creationTime = uint64(block.timestamp);
        newPrediction.resolutionTime = _resolutionTime;
        newPrediction.isResolved = false;

        for (uint16 i = 0; i < _options.length; i++) {
            newPrediction.options.push(
                Option({name: _options[i], totalStaked: 0})
            );
        }

        emit PredictionCreated(
            predictionId,
            _question,
            msg.sender,
            _resolutionTime
        );
    }

    /**
     * @dev Place a stake on a specific option
     * @param _predictionId The ID of the prediction
     * @param _optionIndex The index of the chosen option
     */
    function placeStake(
        uint256 _predictionId,
        uint16 _optionIndex
    )
        external
        payable
        predictionExists(_predictionId)
        notResolved(_predictionId)
    {
        require(
            block.timestamp < predictions[_predictionId].resolutionTime,
            "Prediction has ended"
        );
        require(
            _optionIndex < predictions[_predictionId].options.length,
            "Invalid option index"
        );
        require(msg.value > 0, "Stake amount must be greater than zero");

        Prediction storage prediction = predictions[_predictionId];

        prediction.userStakes[msg.sender][_optionIndex] += msg.value;
        prediction.options[_optionIndex].totalStaked += msg.value;
        prediction.totalStaked += msg.value;

        emit StakePlaced(_predictionId, _optionIndex, msg.sender, msg.value);
    }

    /**
     * @dev Resolve the prediction by setting the winning option
     * @param _predictionId The ID of the prediction
     * @param _winningOptionIndex The index of the winning option
     */
    function resolvePrediction(
        uint256 _predictionId,
        uint16 _winningOptionIndex
    )
        external
        predictionExists(_predictionId)
        notResolved(_predictionId)
        onlyCreator(_predictionId)
        afterResolutionTime(_predictionId)
    {
        require(
            _winningOptionIndex < predictions[_predictionId].options.length,
            "Invalid option index"
        );

        Prediction storage prediction = predictions[_predictionId];
        prediction.isResolved = true;
        prediction.winningOptionIndex = _winningOptionIndex;

        emit PredictionResolved(_predictionId, _winningOptionIndex);
    }

    /**
     * @dev Claim rewards for correctly predicting the outcome
     * @param _predictionId The ID of the prediction
     */
    function claimReward(
        uint256 _predictionId
    ) external predictionExists(_predictionId) {
        Prediction storage prediction = predictions[_predictionId];

        require(prediction.isResolved, "Prediction not resolved yet");
        require(!prediction.hasClaimed[msg.sender], "Rewards already claimed");

        uint16 winningOptionIndex = prediction.winningOptionIndex;
        uint256 userStake = prediction.userStakes[msg.sender][
            winningOptionIndex
        ];

        require(userStake > 0, "No winning stake to claim");

        // Calculate reward: proportional share of total stakes, minus platform fee
        uint256 totalWinningStakes = prediction
            .options[winningOptionIndex]
            .totalStaked;

        uint256 totalLostStakes;
        unchecked {
            totalLostStakes = prediction.totalStaked - totalWinningStakes;
        }

        // User's proportion of the winning pool
        uint256 proportion = (userStake * 1e18) / totalWinningStakes;

        // Calculate reward: original stake + proportion of losing pool, minus fee
        uint256 rewardFromLosers;
        uint256 platformFeeAmount;
        uint256 totalReward;

        unchecked {
            rewardFromLosers = (proportion * totalLostStakes) / 1e18;
            platformFeeAmount = (rewardFromLosers * fee) / 100;
            totalReward = userStake + rewardFromLosers - platformFeeAmount;
        }

        prediction.hasClaimed[msg.sender] = true;

        // Transfer reward to user
        (bool success, ) = payable(msg.sender).call{value: totalReward}("");
        require(success, "Transfer failed");

        emit RewardClaimed(_predictionId, msg.sender, totalReward);
    }

    /**
     * @dev Get the options for a prediction
     * @param _predictionId The ID of the prediction
     * @return Array of option names and stakes
     */
    function getPredictionOptions(
        uint256 _predictionId
    ) external view predictionExists(_predictionId) returns (Option[] memory) {
        return predictions[_predictionId].options;
    }

    /**
     * @dev Get user's stake on a specific option
     * @param _predictionId The ID of the prediction
     * @param _optionIndex The index of the option
     * @param _user The address of the user
     * @return User's stake amount
     */
    function getUserStake(
        uint256 _predictionId,
        uint16 _optionIndex,
        address _user
    ) external view predictionExists(_predictionId) returns (uint256) {
        return predictions[_predictionId].userStakes[_user][_optionIndex];
    }

    /**
     * @dev Withdraw platform fees (onlyOwner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transfer failed");
    }
}
