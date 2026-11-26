// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "../Basetest.sol";
import {
    PoolId,
    PoolIdLibrary
} from "v4-hooks-public/lib/v4-core/src/types/PoolId.sol";
import {
    StateLibrary
} from "v4-hooks-public/lib/v4-core/src/libraries/StateLibrary.sol";
import "forge-std/console.sol";
import "../../src/Marketplace/MarketplaceFactory.sol";

contract MarketplaceFactoryUnit is BaseTest {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    function test_createMarket() external {
        _createDefaultMarket(user1, 0.05 ether);

        assertEq(marketplaceContract.marketplaceID(), 2);
        MarketplaceFactory.Marketplace memory market = _getMarket(1);
        assertEq(market.title, "Is btc going to hit 3k by friday?");
        assertEq(market.deadline, 12343434);
        assertEq(market.balance, 0.049 ether);
        assertEq(market.initializer, user1);
        assertEq(
            uint8(market.proposedOutcome),
            uint8(IMarketplaceFactory.PredictionOutcome.Unresolved)
        );
        assertEq(
            uint8(market.disputedOutcome),
            uint8(IMarketplaceFactory.PredictionOutcome.Unresolved)
        );
        assertEq(
            uint8(market.finalOutcome),
            uint8(IMarketplaceFactory.PredictionOutcome.Unresolved)
        );
        assertEq(market.yesReserves, 0.049 ether);
        assertEq(market.noReserves, 0.049 ether);
        assertEq(market.B, 0.07 ether);
    }

    function test__multipleMarkets() external {
        vm.startPrank(user1);
        marketplaceContract.createMarket{value: 0.005 ether}(
            "Will McGreggor fight in 2026?",
            553343
        );
        marketplaceContract.createMarket{value: 0.005 ether}(
            "Will Jon Jones fight in 2026?",
            553344
        );
        marketplaceContract.createMarket{value: 0.005 ether}(
            "Will Sean say something racist during UFC 328",
            553345
        );
        vm.stopPrank();
        MarketplaceFactory.Marketplace memory market1 = _getMarket(1);
        MarketplaceFactory.Marketplace memory market2 = _getMarket(2);
        MarketplaceFactory.Marketplace memory market3 = _getMarket(3);

        assertEq(market1.title, "Will McGreggor fight in 2026?");
        assertEq(market1.marketplaceID, 1);
        assertEq(market1.balance, 0.004 ether);
        assertEq(market2.title, "Will Jon Jones fight in 2026?");
        assertEq(market2.marketplaceID, 2);
        assertEq(market2.balance, 0.004 ether);
        assertEq(
            market3.title,
            "Will Sean say something racist during UFC 328"
        );
        assertEq(market3.marketplaceID, 3);
        assertEq(market3.balance, 0.004 ether);
        assertEq(marketplaceContract.marketplaceID(), 4);
    }

    function test_betMarket() external {
        _createDefaultMarket(user1, 1 ether);

        _betYes(user2, 0.001 ether, 1);

        MarketplaceFactory.Marketplace memory market = _getMarket(1);
        assertEq(market.balance, 1.00 ether);
        YesToken yesToken = YesToken(market.yesToken);
        NoToken noToken = NoToken(market.noToken);
        assertGt(yesToken.balanceOf(user2), 0);
        assertEq(noToken.balanceOf(user2), 0);

        _betNo(user3, 0.002 ether, 1);
        MarketplaceFactory.Marketplace memory marketUpdated = _getMarket(1);
        assertEq(marketUpdated.balance, 1.002 ether);
        assertGt(noToken.balanceOf(user3), 0);
        assertEq(yesToken.balanceOf(user3), 0);
    }

    function test_betMultiple() external {
        _createDefaultMarket(user1, 1 ether);

        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        vm.stopPrank();
        vm.startPrank(user4);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();

        MarketplaceFactory.Marketplace memory market = _getMarket(1);

        YesToken yesToken = YesToken(market.yesToken);
        NoToken noToken = NoToken(market.noToken);
        assertEq(market.balance, 1.999 ether);
        assertGt(yesToken.balanceOf(user2), 0);
        assertEq(noToken.balanceOf(user2), 0);
        assertGt(noToken.balanceOf(user3), 0);
        assertEq(yesToken.balanceOf(user3), 0);
        assertGt(yesToken.balanceOf(user4), 0);
        assertGt(noToken.balanceOf(user4), 0);
    }

    function test_proposeCreFinaliseRedeemOutcome() external {
        _createDefaultMarket(user1, 1 ether);
        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        vm.stopPrank();

        _proposeMarket(
            user4,
            0.1 ether,
            IMarketplaceFactory.PredictionOutcome.Yes,
            1
        );
        _finaliseMarketChainlinkCre(1);
        _redeemMarket(1, user2);

        assertGt(user2.balance, user3.balance);
    }

    function test_proposeDisputeMultiSigFinaliseRedeemOutcome() external {
        _createDefaultMarket(user1, 1 ether);
        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        marketplaceContract.betMarket{value: 0.1 ether}(1, false);
        vm.stopPrank();

        _proposeMarket(
            user4,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.Yes,
            1
        );

        _disputeMarket(
            user5,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.No,
            1
        );
        _finaliseMarketMultiSig(1, IMarketplaceFactory.PredictionOutcome.No);
        _redeemMarket(1, user3);
        assertGt(user3.balance, user2.balance);
    }

    function test_botCreatesEscrowMarket() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "1+1=3 what do you think",
            0.010 ether,
            3444232323
        );
        MarketplaceFactory.EscrowMarket
            memory currentEscrowMarket = marketplaceContract.getEscrowMarket(1);
        assertEq(currentEscrowMarket.eMarketplaceID, 1);
        assertEq(currentEscrowMarket.user1, address(0));
        assertEq(currentEscrowMarket.user2, address(0));
    }

    function test_user1AcceptsEscrow() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "1+1=3 what do you think",
            0.010 ether,
            3444232323
        );
        MarketplaceFactory.EscrowMarket
            memory currentEscrowMarket = marketplaceContract.getEscrowMarket(1);
        assertEq(currentEscrowMarket.eMarketplaceID, 1);
        assertEq(currentEscrowMarket.user1, address(0));
        assertEq(currentEscrowMarket.user2, address(0));

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, true);

        MarketplaceFactory.EscrowMarket
            memory escrowMarket = marketplaceContract.getEscrowMarket(1);
        assertEq(escrowMarket.user1, user1);
        assertEq(escrowMarket.user1Decision, true);
        assertEq(escrowMarket.seedAmount, 0.005 ether);
        assertEq(
            uint8(escrowMarket.status),
            uint8(IMarketplaceFactory.EscrowStatus.Open)
        );
    }

    function test_createEscrowMarketIntoMarketplace() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "1+1=3 what do you think",
            0.010 ether,
            3444232323
        );
        MarketplaceFactory.EscrowMarket
            memory currentEscrowMarket = marketplaceContract.getEscrowMarket(1);
        assertEq(currentEscrowMarket.eMarketplaceID, 1);
        assertEq(currentEscrowMarket.user1, address(0));
        assertEq(currentEscrowMarket.user2, address(0));

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, true);

        vm.prank(user2);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, false);

        MarketplaceFactory.Marketplace memory currentMarketplace = _getMarket(
            1
        );
        YesToken yesToken = YesToken(currentMarketplace.yesToken);
        NoToken noToken = NoToken(currentMarketplace.noToken);

        MarketplaceFactory.EscrowMarket
            memory newEscrowMarket = marketplaceContract.getEscrowMarket(1);

        assertEq(newEscrowMarket.user2, user2);
        assertEq(
            uint8(newEscrowMarket.status),
            uint8(IMarketplaceFactory.EscrowStatus.Closed)
        );
        assertEq(currentMarketplace.marketplaceID, 1);
        assertEq(currentMarketplace.initializer, user1);
        assertEq(currentMarketplace.yesReserves, 0.005 ether);
        assertEq(currentMarketplace.noReserves, 0.005 ether);
        assertEq(currentMarketplace.balance, 0.025 ether);
        assertEq(currentMarketplace.B, 7142857142857142);
        assertEq(yesToken.balanceOf(user1), 0.02 ether);
        assertEq(noToken.balanceOf(user2), 0.02 ether);
    }

    function test_createEscrowMarketIntoMarketplaceOpposite() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "1+1=3 what do you think",
            0.010 ether,
            3444232323
        );
        MarketplaceFactory.EscrowMarket
            memory currentEscrowMarket = marketplaceContract.getEscrowMarket(1);
        assertEq(currentEscrowMarket.eMarketplaceID, 1);
        assertEq(currentEscrowMarket.user1, address(0));
        assertEq(currentEscrowMarket.user2, address(0));

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, false);

        vm.prank(user2);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, true);

        MarketplaceFactory.Marketplace memory currentMarketplace = _getMarket(
            1
        );
        YesToken yesToken = YesToken(currentMarketplace.yesToken);
        NoToken noToken = NoToken(currentMarketplace.noToken);

        MarketplaceFactory.EscrowMarket
            memory newEscrowMarket = marketplaceContract.getEscrowMarket(1);

        assertEq(newEscrowMarket.user2, user2);
        assertEq(
            uint8(newEscrowMarket.status),
            uint8(IMarketplaceFactory.EscrowStatus.Closed)
        );
        assertEq(currentMarketplace.marketplaceID, 1);
        assertEq(currentMarketplace.initializer, user1);
        assertEq(currentMarketplace.yesReserves, 0.005 ether);
        assertEq(currentMarketplace.noReserves, 0.005 ether);
        assertEq(currentMarketplace.balance, 0.025 ether);
        assertEq(currentMarketplace.B, 7142857142857142);
        assertEq(yesToken.balanceOf(user2), 0.02 ether);
        assertEq(noToken.balanceOf(user1), 0.02 ether);
    }

    function test_fullEscrowCycle() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "1+1=3 what do you think",
            0.010 ether,
            3444232323
        );

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, false);
        vm.prank(user2);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, true);

        _proposeMarket(
            user3,
            0.005 ether,
            IMarketplaceFactory.PredictionOutcome.No,
            1
        );
        _finaliseMarketChainlinkCre(1);
        _redeemMarket(1, user1);
        MarketplaceFactory.Marketplace memory currentMarketplace = _getMarket(
            1
        );
        MarketplaceFactory.EscrowMarket
            memory currentEscrowMarket = marketplaceContract.getEscrowMarket(1);
        NoToken noToken = NoToken(currentMarketplace.noToken);

        assertEq(user1.balance, 1.01 ether);
        assertEq(user2.balance, 0.99 ether);
        assertEq(noToken.balanceOf(user1), 0.00 ether);
        assertEq(currentMarketplace.balance, 0 ether);
        assertEq(
            uint8(currentMarketplace.finalOutcome),
            uint8(IMarketplaceFactory.PredictionOutcome.No)
        );
        assertEq(
            uint8(currentEscrowMarket.status),
            uint8(IMarketplaceFactory.EscrowStatus.Closed)
        );
    }
}
