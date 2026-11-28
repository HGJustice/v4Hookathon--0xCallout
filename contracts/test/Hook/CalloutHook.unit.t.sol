// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import {BaseTest} from "../Basetest.sol";
import {IHooks} from "v4-hooks-public/lib/v4-core/src/interfaces/IHooks.sol";
import {
    CustomRevert
} from "v4-hooks-public/lib/v4-core/src/libraries/CustomRevert.sol";
import {
    PoolSwapTest
} from "v4-hooks-public/lib/v4-core/src/test/PoolSwapTest.sol";
import "../../src/Hook/CalloutHook.sol";
import "../../src/Hook/LMSRLibrary.sol";

contract CalloutHookTest is BaseTest {
    function test_exactPayoutYes() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory before = _getMarket(1);

        uint256 expected = _expectedPayout(
            before.yesReserves,
            before.noReserves,
            0.01 ether,
            before.B
        );

        _betYes(user2, 0.01 ether, 1);

        MarketplaceFactory.Marketplace memory afterBet = _getMarket(1);
        YesToken yesToken = YesToken(afterBet.yesToken);
        NoToken noToken = NoToken(afterBet.noToken);

        assertGt(expected, 0);
        assertEq(yesToken.balanceOf(user2), 0.01 ether + expected);
        assertEq(noToken.balanceOf(user2), 0);
        assertEq(afterBet.yesReserves, before.yesReserves - expected);
        assertEq(afterBet.noReserves, before.noReserves + 0.01 ether);
        assertEq(afterBet.balance, before.balance + 0.01 ether);
    }

    function test_exactPayoutNo() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory before = _getMarket(1);

        uint256 expected = _expectedPayout(
            before.noReserves,
            before.yesReserves,
            0.01 ether,
            before.B
        );

        _betNo(user2, 0.01 ether, 1);

        MarketplaceFactory.Marketplace memory afterBet = _getMarket(1);
        YesToken yesToken = YesToken(afterBet.yesToken);
        NoToken noToken = NoToken(afterBet.noToken);

        assertEq(noToken.balanceOf(user2), 0.01 ether + expected);
        assertEq(yesToken.balanceOf(user2), 0);
        assertEq(afterBet.noReserves, before.noReserves - expected);
        assertEq(afterBet.yesReserves, before.yesReserves + 0.01 ether);
        assertEq(afterBet.balance, before.balance + 0.01 ether);
    }

    function test_samePayoutDifferentMarkets() external {
        _createDefaultMarket(user1, 0.015 ether);
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory market1 = _getMarket(1);
        MarketplaceFactory.Marketplace memory market2 = _getMarket(2);

        uint256 market1Expected = _expectedPayout(
            market1.noReserves,
            market1.yesReserves,
            0.01 ether,
            market1.B
        );
        uint256 market2Expected = _expectedPayout(
            market2.yesReserves,
            market2.noReserves,
            0.01 ether,
            market2.B
        );

        _betNo(user2, 0.01 ether, 1);
        _betYes(user2, 0.01 ether, 2);

        MarketplaceFactory.Marketplace memory market1AfterBet = _getMarket(1);
        MarketplaceFactory.Marketplace memory market2AfterBet = _getMarket(2);
        YesToken yesToken = YesToken(market2AfterBet.yesToken);
        NoToken noToken = NoToken(market1AfterBet.noToken);

        assertEq(market1Expected, market2Expected);
        assertEq(market1AfterBet.yesReserves, market2AfterBet.noReserves);
        assertEq(yesToken.balanceOf(user2), 0.01 ether + market2Expected);
        assertEq(noToken.balanceOf(user2), 0.01 ether + market1Expected);
        assertEq(market1AfterBet.noReserves, market2AfterBet.yesReserves);
        assertEq(noToken.balanceOf(user2), yesToken.balanceOf(user2));
    }

    function test_priceMovesCorrectly() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory beforeBet = _getMarket(1);

        int256 yesTermBefore = LMSRLibrary._getTerm(
            beforeBet.B,
            beforeBet.yesReserves
        );
        int256 noTermBefore = LMSRLibrary._getTerm(
            beforeBet.B,
            beforeBet.noReserves
        );
        int256 scoreBefore = LMSRLibrary._getScore(yesTermBefore, noTermBefore);
        int256 yesPriceBefore = LMSRLibrary._getYesPrice(
            yesTermBefore,
            scoreBefore
        );

        assertApproxEqAbs(yesPriceBefore, 0.5 ether, 10);

        _betYes(user2, 0.01 ether, 1);
        MarketplaceFactory.Marketplace memory afterBet = _getMarket(1);

        int256 yesTermAfter = LMSRLibrary._getTerm(
            afterBet.B,
            afterBet.yesReserves
        );
        int256 noTermAfter = LMSRLibrary._getTerm(
            afterBet.B,
            afterBet.noReserves
        );
        int256 scoreAfter = LMSRLibrary._getScore(yesTermAfter, noTermAfter);
        int256 yesPriceAfter = LMSRLibrary._getYesPrice(
            yesTermAfter,
            scoreAfter
        );
        int256 noPriceAfter = LMSRLibrary._getNoPrice(noTermAfter, scoreAfter);

        assertLt(afterBet.yesReserves, beforeBet.yesReserves); // pool holds less YES
        assertGt(yesPriceAfter, yesPriceBefore); // so YES got pricier
        assertApproxEqAbs(yesPriceAfter + noPriceAfter, 1 ether, 10); // prices sum to 1
    }

    function test_checkScore() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory beforeBet = _getMarket(1);

        int256 scoreBefore = LMSRLibrary._getScore(
            LMSRLibrary._getTerm(beforeBet.B, beforeBet.yesReserves),
            LMSRLibrary._getTerm(beforeBet.B, beforeBet.noReserves)
        );

        _betNo(user2, 0.01 ether, 1);
        MarketplaceFactory.Marketplace memory afterBet = _getMarket(1);

        int256 scoreAfter = LMSRLibrary._getScore(
            LMSRLibrary._getTerm(afterBet.B, afterBet.yesReserves),
            LMSRLibrary._getTerm(afterBet.B, afterBet.noReserves)
        );

        assertApproxEqAbs(scoreAfter, scoreBefore, 1e6);
        assertLe(scoreAfter, scoreBefore);
    }

    function test_reservesUpdateCorrectly() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory marketBefore = _getMarket(1);

        uint256 market2Expected = _expectedPayout(
            marketBefore.noReserves,
            marketBefore.yesReserves,
            0.01 ether,
            marketBefore.B
        );
        _betYes(user2, 0.01 ether, 1);
        MarketplaceFactory.Marketplace memory afterBet = _getMarket(1);

        assertEq(afterBet.noReserves, marketBefore.noReserves + 0.01 ether);
        assertEq(
            afterBet.yesReserves,
            marketBefore.yesReserves - market2Expected
        );
    }

    function test_claimsMatchReserves() external {
        _createDefaultMarket(user1, 0.015 ether);

        _betYes(user2, 0.01 ether, 1);
        _betNo(user3, 0.02 ether, 1);
        _betYes(user4, 0.005 ether, 1);
        _betNo(user2, 0.01 ether, 1);

        MarketplaceFactory.Marketplace memory market = _getMarket(1);

        uint256 hookYesClaims = manager.balanceOf(
            address(hook),
            Currency.wrap(market.yesToken).toId()
        );
        uint256 hookNoClaims = manager.balanceOf(
            address(hook),
            Currency.wrap(market.noToken).toId()
        );

        assertEq(hookYesClaims, market.yesReserves);
        assertEq(hookNoClaims, market.noReserves);
    }

    function test_booksBalance() external {
        _createDefaultMarket(user1, 0.015 ether);

        _betYes(user2, 0.01 ether, 1);
        _betNo(user3, 0.02 ether, 1);
        _betYes(user4, 0.005 ether, 1);

        MarketplaceFactory.Marketplace memory market = _getMarket(1);
        YesToken yesToken = YesToken(market.yesToken);
        NoToken noToken = NoToken(market.noToken);

        assertEq(yesToken.totalSupply(), market.balance);
        assertEq(noToken.totalSupply(), market.balance);

        assertEq(
            address(marketplaceContract).balance,
            market.balance + marketplaceContract.protocolFeeBalance()
        );
    }

    function test_addLiquidityReverts() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory market = _getMarket(1);

        // Uniswap wraps hook errors: (hook, hook function, hook's error, HookCallFailed)
        vm.expectRevert(
            abi.encodeWithSelector(
                CustomRevert.WrappedError.selector,
                address(hook),
                IHooks.beforeAddLiquidity.selector,
                abi.encodeWithSelector(
                    CalloutHook.AddLiquidityNotAllowed.selector
                ),
                abi.encodeWithSelector(Hooks.HookCallFailed.selector)
            )
        );
        modifyLiquidityRouter.modifyLiquidity(
            market.pool,
            LIQUIDITY_PARAMS,
            ZERO_BYTES
        );
    }

    function test_swapFromNonFactoryReverts() external {
        _createDefaultMarket(user1, 0.015 ether);
        MarketplaceFactory.Marketplace memory market = _getMarket(1);

        vm.expectRevert(
            abi.encodeWithSelector(
                CustomRevert.WrappedError.selector,
                address(hook),
                IHooks.beforeSwap.selector,
                abi.encodeWithSelector(
                    CalloutHook.OnlyMarketplaceFactory.selector
                ),
                abi.encodeWithSelector(Hooks.HookCallFailed.selector)
            )
        );
        swapRouter.swap(
            market.pool,
            SwapParams({
                zeroForOne: true,
                amountSpecified: -0.001 ether,
                sqrtPriceLimitX96: MIN_PRICE_LIMIT
            }),
            PoolSwapTest.TestSettings({
                takeClaims: false,
                settleUsingBurn: false
            }),
            ZERO_BYTES
        );
    }
}
