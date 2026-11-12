// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "v4-hooks-public/lib/v4-core/src/types/PoolKey.sol";

interface IMarketplaceFactory {

    struct Marketplace {
        uint256 marketplaceID;
        string title;
        address initializer;
        bool resolved;
        uint256 balance;
        uint256 deadline;
        PredictionOutcome proposedOutcome;
        uint256 proposedAt;
        bool outcomeDisputed;
        PredictionOutcome disputedOutcome;
        PredictionOutcome finalOutcome;
        PoolKey pool;
        address yesToken;
        address noToken;
        uint256 winningSupplyAtResolve;
        uint256 poolWinningBalanceAtResolve;
        uint256 yesReserves;
        uint256 noReserves;
    }

    enum PredictionOutcome {
        Unresolved,
        Yes,
        No,
        Void
    }

    event MarketCreated(
        uint256 marketplaceID,
        string title,
        address initializer,
        uint256 balance,
        uint256 deadline,
        PoolKey pool,
        address yesToken,
        address noToken
    );

    event MarketBet(
        uint256 marketplaceID,
        string title,
        uint256 newBalance,
        address indexed user,
        PoolKey pool
    );

    event OutcomeProposed(
        uint256 marketplaceID,
        PredictionOutcome proposedOutcome,
        address user,
        uint256 timestamp
    );

    event OutcomeDisputed(
        uint256 marketplaceID,
        PredictionOutcome disputedOutcome,
        address user,
        uint256 timestamp
    );

    function createMarket(string calldata title, uint256 deadline) external payable;

    function betMarket(uint256 marketplaceID, bool decision) external payable;

    function proposeOutcome(uint256 marketplaceID, PredictionOutcome outcome) external payable;

    function disputeOutcome(uint256 marketplaceID, PredictionOutcome outcome) external payable;

    function redeemMarket(uint256 marketplaceID) external;

    function finaliseUndisputedMarket(uint256 marketplaceID) external;

    function finaliseDisputedMarket(uint256 marketplaceID, PredictionOutcome outcome) external;

    function withdrawProtocolFees() external;
  
    function getMarket(uint256 marketplaceID) external view returns (Marketplace memory);

    function marketplaceID() external view returns (uint256);

    function protocolFeeBalance() external view returns (uint256);
}
