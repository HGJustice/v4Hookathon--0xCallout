// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "../erc20s/yesToken.sol";
import "../erc20s/noToken.sol";
import "../Marketplace/Errors.sol";
import "../Marketplace/PoolManagerLogic.sol";

contract MarketplaceFactory is PoolManagerLogic {
    uint256 constant PROTOCOL_FEE = 0.01 ether;
    uint256 constant MARKET_SETUP_FEE = 0.05 ether;

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

    constructor(
        IPoolManager _poolManager,
        address _multiSig
    ) PoolManagerLogic(_poolManager) {
        owner = msg.sender;
        multiSig = _multiSig;
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

    function getMarket(
        uint256 _marketplaceID
    ) external view returns (Marketplace memory) {
        return marketplaces[_marketplaceID];
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

    function withdrawFees() external {
        if (msg.sender != owner) revert OnlyOwnerAccess();

        (bool success, ) = payable(owner).call{value: address(this).balance}( //testing purpeses withdraw all eth
            ""
        );
        require(success, "Transfer of protocolFees failed");
    }

    function _mintApproveYesNoTokens(
        uint256 _marketplaceID,
        uint256 _amount
    ) internal returns (address, address) {
        YesToken newYesToken = new YesToken(_marketplaceID);
        NoToken newNoToken = new NoToken(_marketplaceID);
        newYesToken.mintYesToken(_amount);
        newYesToken.approve(address(poolManager), _amount);
        newNoToken.mintNoToken(_amount);
        newNoToken.approve(address(poolManager), _amount);

        return (address(newYesToken), address(newNoToken));
    }
}
