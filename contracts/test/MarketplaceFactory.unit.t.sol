// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {console} from "forge-std/console.sol";
import {BaseTest} from "./utils/Basetest.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import "forge-std/console.sol";
import "../src/Marketplace/MarketplaceFactory.sol";

contract MarketplaceFactoryUnit is BaseTest {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    function test_createMarket() external {
        _createDefaultMarket(user1, 0.05 ether);

        assertEq(marketplaceContract.marketplaceID(), 2);
        MarketplaceFactory.Marketplace memory market = _getMarket(1);
        assertEq(market.title, "Is btc going to hit 3k by friday?");
        assertEq(market.deadline, 12343434);
        assertEq(market.balance, 0.04 ether);
        assertEq(market.initializer, user1);
        assertEq(
            uint8(market.proposedOutcome),
            uint8(MarketplaceFactory.PredictionOutcome.Unresolved)
        );
        assertEq(
            uint8(market.disputedOutcome),
            uint8(MarketplaceFactory.PredictionOutcome.Unresolved)
        );
        assertEq(
            uint8(market.finalOutcome),
            uint8(MarketplaceFactory.PredictionOutcome.Unresolved)
        );
        PoolId poolId = market.pool.toId();
        (uint160 sqrtPriceX96, int24 tick, , ) = manager.getSlot0(poolId);
        assertEq(sqrtPriceX96, 79228162514264337593543950336);
        assertEq(tick, 0);
        uint128 liquidity = manager.getLiquidity(poolId);
        assertGt(liquidity, 0);
    }

    function test__multipleMarkets() external {
        vm.startPrank(user1);
        marketplaceContract.createMarket{value: 0.05 ether}(
            "Will McGreggor fight in 2026?",
            553343
        );
        marketplaceContract.createMarket{value: 0.05 ether}(
            "Will Jon Jones fight in 2026?",
            553344
        );
        marketplaceContract.createMarket{value: 0.05 ether}(
            "Will Sean say something racist during UFC 328",
            553345
        );
        vm.stopPrank();
        MarketplaceFactory.Marketplace memory market1 = _getMarket(1);
        MarketplaceFactory.Marketplace memory market2 = _getMarket(2);
        MarketplaceFactory.Marketplace memory market3 = _getMarket(3);

        assertEq(market1.title, "Will McGreggor fight in 2026?");
        assertEq(market1.marketplaceID, 1);
        assertEq(market1.balance, 0.04 ether);
        assertEq(market2.title, "Will Jon Jones fight in 2026?");
        assertEq(market2.marketplaceID, 2);
        assertEq(market2.balance, 0.04 ether);
        assertEq(
            market3.title,
            "Will Sean say something racist during UFC 328"
        );
        assertEq(market3.marketplaceID, 3);
        assertEq(market3.balance, 0.04 ether);
        assertEq(marketplaceContract.marketplaceID(), 4);
    }

    function test_betMarket() external {
        _createDefaultMarket(user1, 1 ether);

        _betYes(user2, 0.1 ether, 1);

        MarketplaceFactory.Marketplace memory market = _getMarket(1);
        assertEq(market.balance, 1.09 ether);
        YesToken yesToken = YesToken(market.yesToken);
        NoToken noToken = NoToken(market.noToken);
        assertGt(yesToken.balanceOf(user2), 0);
        assertEq(noToken.balanceOf(user2), 0);

        _betNo(user3, 0.1 ether, 1);
        MarketplaceFactory.Marketplace memory marketUpdated = _getMarket(1);
        assertEq(marketUpdated.balance, 1.19 ether);
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
        assertEq(market.balance, 1.99 ether);
        assertGt(yesToken.balanceOf(user2), 0);
        assertEq(noToken.balanceOf(user2), 0);
        assertGt(noToken.balanceOf(user3), 0);
        assertEq(yesToken.balanceOf(user3), 0);
        assertGt(yesToken.balanceOf(user4), 0);
        assertGt(noToken.balanceOf(user4), 0);
    }
}
