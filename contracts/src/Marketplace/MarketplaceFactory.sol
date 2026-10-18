// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../erc20s/yesToken.sol";
import "../erc20s/noToken.sol";
import "../Marketplace/Errors.sol";
import "../Marketplace/PoolManagerLogic.sol";

contract MarketplaceFactory is PoolManagerLogic {
    uint256 constant PROTOCOL_FEE = 0.01 ether;
    uint256 constant MARKET_SETUP_FEE = 0.05 ether;
    uint256 constant PROPOSE_OUTCOME_FEE = 0.05 ether;

    enum PredictionOutcome {
        Unresolved,
        Yes,
        No,
        Void
    }

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
    }

    uint256 public marketplaceID = 1;
    mapping(uint256 => Marketplace) public marketplaces;
    uint256 public protocolFeeBalance = 0;
    address immutable owner;
    address immutable multiSig;
    address immutable chainlinkCre;

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
        address user,
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

    constructor(
        IPoolManager _poolManager,
        address _multiSig,
        address _chainlinkCre
    ) PoolManagerLogic(_poolManager) {
        owner = msg.sender;
        multiSig = _multiSig;
        chainlinkCre = _chainlinkCre;
    }

    modifier checkMarketplaceID(uint256 _marketplaceID) {
        if (_marketplaceID >= marketplaceID) revert InvalidMarketplaceID();
        _;
    }

    function createMarket(
        string calldata _title,
        uint256 _deadline
    ) external payable {
        if (msg.value < MARKET_SETUP_FEE) revert InsufficientSetupFee();

        if (bytes(_title).length < 10) revert TitleNotLongEnough();

        // if (_deadline < block.timestamp + 1 days) revert DeadlineNotLongEnough(); block.timestamp can be ahead of time on testnet

        uint256 amountAfterFee = msg.value - PROTOCOL_FEE;
        protocolFeeBalance += PROTOCOL_FEE;

        (address newYesToken, address newNoToken) = _mintApproveYesNoTokens(
            marketplaceID,
            amountAfterFee
        );
        PoolKey memory newMarketKey = _createPoolKey(newYesToken, newNoToken);
        _createPoolAddLiquidity(newMarketKey, amountAfterFee);

        Marketplace memory newMarketplace = Marketplace({
            marketplaceID: marketplaceID,
            title: _title,
            initializer: msg.sender,
            resolved: false,
            balance: amountAfterFee,
            deadline: _deadline,
            proposedOutcome: PredictionOutcome.Unresolved,
            proposedAt: 0,
            outcomeDisputed: false,
            disputedOutcome: PredictionOutcome.Unresolved,
            finalOutcome: PredictionOutcome.Unresolved,
            pool: newMarketKey,
            yesToken: newYesToken,
            noToken: newNoToken,
            winningSupplyAtResolve: 0,
            poolWinningBalanceAtResolve: 0
        });
        marketplaces[marketplaceID] = newMarketplace;

        emit MarketCreated(
            marketplaceID,
            _title,
            msg.sender,
            amountAfterFee,
            _deadline,
            newMarketKey,
            newYesToken,
            newNoToken
        );
        marketplaceID++;
    }

    function betMarket(
        uint256 _marketplaceID,
        bool _decision
    ) external payable checkMarketplaceID(_marketplaceID) {
        if (msg.value == 0) revert InsufficientBetAmount();
        Marketplace storage currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.resolved) revert MarketEnded();
        // if (block.timestamp >= currentMarket.deadline) revert BettingClosed();  testnet timestamp buggy

        currentMarket.balance += msg.value;

        YesToken yesToken = YesToken(currentMarket.yesToken);
        NoToken noToken = NoToken(currentMarket.noToken);
        yesToken.mintYesToken(msg.value);
        yesToken.approve(address(poolManager), msg.value);
        noToken.mintNoToken(msg.value);
        noToken.approve(address(poolManager), msg.value);

        bool zeroForOne = _decision
            ? currentMarket.noToken ==
                Currency.unwrap(currentMarket.pool.currency0)
            : currentMarket.yesToken ==
                Currency.unwrap(currentMarket.pool.currency0);

        bytes memory data = abi.encode(
            currentMarket.pool,
            msg.value,
            CallbackAction.PlaceBet,
            zeroForOne,
            msg.sender
        );
        poolManager.unlock(data);

        if (_decision) {
            yesToken.transfer(msg.sender, msg.value);
        } else {
            noToken.transfer(msg.sender, msg.value);
        }
        emit MarketBet(
            _marketplaceID,
            currentMarket.title,
            currentMarket.balance,
            msg.sender,
            currentMarket.pool
        );
    }
    function proposeOutcome(
        uint256 _marketplaceID,
        PredictionOutcome _outcome
    ) external payable checkMarketplaceID(_marketplaceID) {
        if (msg.value < PROPOSE_OUTCOME_FEE) revert InsufficientProposeFee();
        if (_outcome == PredictionOutcome.Unresolved)
            revert CannotBeUnresolved();
        Marketplace storage currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.proposedOutcome != PredictionOutcome.Unresolved)
            revert MarketplaceAlreadyProposed();

        protocolFeeBalance += PROPOSE_OUTCOME_FEE;
        currentMarket.proposedOutcome = _outcome;
        currentMarket.proposedAt = block.timestamp;

        emit OutcomeProposed(
            _marketplaceID,
            _outcome,
            msg.sender,
            block.timestamp
        );
    }

    function disputeOutcome(
        uint256 _marketplaceID,
        PredictionOutcome _outcome
    ) external payable checkMarketplaceID(_marketplaceID) {
        if (msg.value < PROPOSE_OUTCOME_FEE) revert InsufficientProposeFee();
        Marketplace storage currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.proposedOutcome == PredictionOutcome.Unresolved)
            revert MarketStillUnresolved();
        if (currentMarket.outcomeDisputed) revert MarketplaceAlreadyDisputed();
        if (_outcome == PredictionOutcome.Unresolved)
            revert CannotBeUnresolved();
        if (_outcome == currentMarket.proposedOutcome)
            revert DisputedOutcomeCannotBeProposed();

        protocolFeeBalance += PROPOSE_OUTCOME_FEE;
        currentMarket.outcomeDisputed = true;
        currentMarket.disputedOutcome = _outcome;

        emit OutcomeDisputed(
            _marketplaceID,
            _outcome,
            msg.sender,
            block.timestamp
        );
    }

    function finaliseUndisputedMarket(
        uint256 _marketplaceID
    ) external checkMarketplaceID(_marketplaceID) {
        if (msg.sender != chainlinkCre) revert OnlyChainlinkCreAccess();
        Marketplace memory currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.resolved) revert MarketplaceResolved();
        if (currentMarket.outcomeDisputed) revert MarketplaceDisputed();
        if (currentMarket.proposedOutcome == PredictionOutcome.Unresolved)
            revert CannotBeUnresolved();

        _resolveMarket(_marketplaceID, currentMarket.proposedOutcome);
    }

    function finaliseDisputedMarket(
        uint256 _marketplaceID,
        PredictionOutcome _outcome
    ) external checkMarketplaceID(_marketplaceID) {
        if (_outcome == PredictionOutcome.Unresolved)
            revert CannotBeUnresolved();
        if (msg.sender != multiSig) revert OnlyMultiSigAccess();
        Marketplace memory currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.resolved) revert MarketplaceResolved();

        _resolveMarket(_marketplaceID, _outcome);
    }

    function redeemMarket(
        uint256 _marketplaceID
    ) external checkMarketplaceID(_marketplaceID) {
        Marketplace storage currentMarket = marketplaces[_marketplaceID];
        if (!currentMarket.resolved) revert MarketUnresolved();

        YesToken yesToken = YesToken(currentMarket.yesToken);
        NoToken noToken = NoToken(currentMarket.noToken);

        uint256 circulatingWinningSupply = currentMarket
            .winningSupplyAtResolve - currentMarket.poolWinningBalanceAtResolve;

        if (currentMarket.finalOutcome == PredictionOutcome.Void) {
            return; // need to return all funds if prediciton is called off
        } else if (currentMarket.finalOutcome == PredictionOutcome.Yes) {
            uint256 yesBalance = yesToken.balanceOf(msg.sender);
            if (yesBalance == 0) revert NoTokensToRedeem();
            yesToken.burnYesToken(msg.sender, yesBalance);

            uint256 userShare = (currentMarket.balance * yesBalance) /
                circulatingWinningSupply;

            currentMarket.balance -= userShare;
            currentMarket.winningSupplyAtResolve -= yesBalance;

            (bool sent, ) = payable(msg.sender).call{value: userShare}("");
            if (!sent) revert RedeemETHFailed();
        } else if (currentMarket.finalOutcome == PredictionOutcome.No) {
            uint256 noBalance = noToken.balanceOf(msg.sender);
            if (noBalance == 0) revert NoTokensToRedeem();
            noToken.burnNoToken(msg.sender, noBalance);

            uint256 userShare = (currentMarket.balance * noBalance) /
                circulatingWinningSupply;

            currentMarket.balance -= userShare;
            currentMarket.winningSupplyAtResolve -= noBalance;

            (bool sent, ) = payable(msg.sender).call{value: userShare}("");
            if (!sent) revert RedeemETHFailed();
        }
    }

    function withdrawProtocolFees() external {
        if (msg.sender != owner) revert OnlyOwnerAccess();

        (bool success, ) = payable(owner).call{value: address(this).balance}( //testing purpeses withdraw all eth
            ""
        );
        require(success, "Transfer of protocolFees failed");
    }

    function _resolveMarket(
        uint256 _marketplaceID,
        PredictionOutcome _outcome
    ) private {
        Marketplace storage currentMarket = marketplaces[_marketplaceID];
        if (currentMarket.resolved) revert MarketEnded();

        currentMarket.resolved = true;
        currentMarket.finalOutcome = _outcome;

        (uint256 poolAmount0, uint256 poolAmount1) = _getPoolTokenBalance(
            currentMarket.pool
        );

        if (currentMarket.finalOutcome == PredictionOutcome.Yes) {
            currentMarket.winningSupplyAtResolve = YesToken(
                currentMarket.yesToken
            ).totalSupply();

            currentMarket.poolWinningBalanceAtResolve = currentMarket
                .yesToken == Currency.unwrap(currentMarket.pool.currency0)
                ? poolAmount0
                : poolAmount1;
        } else if (currentMarket.finalOutcome == PredictionOutcome.No) {
            currentMarket.winningSupplyAtResolve = NoToken(
                currentMarket.noToken
            ).totalSupply();
            currentMarket.poolWinningBalanceAtResolve = currentMarket.noToken ==
                Currency.unwrap(currentMarket.pool.currency0)
                ? poolAmount0
                : poolAmount1;
        }
    }

    function _mintApproveYesNoTokens(
        uint256 _marketplaceID,
        uint256 _amount
    ) private returns (address, address) {
        YesToken newYesToken = new YesToken(_marketplaceID);
        NoToken newNoToken = new NoToken(_marketplaceID);
        newYesToken.mintYesToken(_amount);
        newYesToken.approve(address(poolManager), _amount);
        newNoToken.mintNoToken(_amount);
        newNoToken.approve(address(poolManager), _amount);

        return (address(newYesToken), address(newNoToken));
    }

    receive() external payable {}
}
