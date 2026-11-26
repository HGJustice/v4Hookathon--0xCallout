// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "../Basetest.sol";
import "../../src/Marketplace/MarketplaceFactory.sol";
import "../../src/Marketplace/Errors.sol";
import "../../src/Marketplace/IMarketplaceFactory.sol";

contract MarketplaceFactoryReverts is BaseTest {
    function test_insufficientFundsFail() external {
        vm.expectRevert(InsufficientSetupFee.selector);
        _createDefaultMarket(user1, 0.003 ether);
    }

    function test_invalidTitleFail() external {
        vm.prank(user1);
        vm.expectRevert(TitleNotLongEnough.selector);
        marketplaceContract.createMarket{value: 0.05 ether}("fjfjf", 4223233);
    }

    // function test_invalidDeadlineFail() external {
    //     vm.expectRevert(DeadlineNotLongEnough.selector);
    //     _createDefaultMarket(user1, 0.05 ether);
    // }

    function test_invalidBetAmountFail() external {
        _createDefaultMarket(user1, 0.05 ether);

        vm.prank(user2);
        vm.expectRevert(InsufficientBetAmount.selector);
        marketplaceContract.betMarket{value: 0 ether}(1, true);
    }

    function test_invalidMarketplaceIDFail() external {
        _createDefaultMarket(user1, 1 ether);
        vm.prank(user2);
        vm.expectRevert(InvalidMarketplaceID.selector);
        marketplaceContract.betMarket{value: 0.5 ether}(2, true);
    }

    function test_withdrawProtocolFeesFail() external {
        _createDefaultMarket(user1, 0.05 ether);
        vm.prank(user1);
        vm.expectRevert(OnlyOwnerAccess.selector);
        marketplaceContract.withdrawProtocolFees();
    }

    function test__betResolvedMarketInvalid() external {
        _createDefaultMarket(user1, 0.05 ether);
        _proposeMarket(
            user3,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.Yes,
            1
        );
        _finaliseMarketChainlinkCre(1);

        vm.prank(user2);
        vm.expectRevert(MarketEnded.selector);
        marketplaceContract.betMarket{value: 0.05 ether}(1, true);
    }

    function test__marketResolvedFail() external {
        _createDefaultMarket(user1, 0.05 ether);
        _proposeMarket(
            user2,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.Yes,
            1
        );
        _finaliseMarketChainlinkCre(1);

        vm.expectRevert(MarketplaceResolved.selector);
        _finaliseMarketChainlinkCre(1);
    }

    function test_marketUnresolved() external {
        _createDefaultMarket(user1, 0.05 ether);

        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();

        vm.expectRevert(MarketUnresolved.selector);
        _redeemMarket(1, user2);
    }

    function test_noTokensToRedeem() external {
        _createDefaultMarket(user1, 0.05 ether);

        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();

        _proposeMarket(
            user4,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.No,
            1
        );
        _finaliseMarketChainlinkCre(1);

        vm.expectRevert(NoTokensToRedeem.selector);
        _redeemMarket(1, user2);
    }

    function test__doubleRedeemInvalid() external {
        _createDefaultMarket(user1, 0.05 ether);

        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();

        _proposeMarket(
            user4,
            0.05 ether,
            IMarketplaceFactory.PredictionOutcome.Yes,
            1
        );
        _finaliseMarketChainlinkCre(1);
        _redeemMarket(1, user2);

        vm.expectRevert(NoTokensToRedeem.selector);
        _redeemMarket(1, user2);
    }

    function test_onlyMultiSig() external {
        _createDefaultMarket(user1, 0.05 ether);

        vm.startPrank(user2);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        vm.stopPrank();
        vm.startPrank(user3);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
        marketplaceContract.betMarket{value: 0.1 ether}(1, true);
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

        vm.expectRevert(MarketplaceDisputed.selector);
        _finaliseMarketChainlinkCre(1);
    }

    function test_botOnlyAccess() external {
        vm.prank(user1);
        vm.expectRevert(BotOnlyAccess.selector);
        marketplaceContract.createEscrowMarket(
            "yooooooooo",
            0.010 ether,
            43434334343423
        );
    }

    function test_user1NotSendEnough() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "yooooooooo",
            0.010 ether,
            43434334343423
        );

        vm.prank(user1);
        vm.expectRevert(NotEnoughSetupEscrowMarket.selector);
        marketplaceContract.acceptEscrowMarket{value: 0.01 ether}(1, true);
    }

    function test_user2NotSendEnough() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "yooooooooo",
            0.010 ether,
            43434334343423
        );

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, true);

        vm.prank(user2);
        vm.expectRevert(InsufficientEscrowBetAmount.selector);
        marketplaceContract.acceptEscrowMarket{value: 0.001 ether}(1, false);
    }

    function test_user2PickWrongSide() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "yooooooooo",
            0.010 ether,
            43434334343423
        );

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, true);

        vm.prank(user2);
        vm.expectRevert(SideAlreadyTaken.selector);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, true);
    }

    function test_escrowMarketIsClosed() external {
        vm.prank(bot);
        marketplaceContract.createEscrowMarket(
            "yooooooooo",
            0.010 ether,
            43434334343423
        );

        vm.prank(user1);
        marketplaceContract.acceptEscrowMarket{value: 0.015 ether}(1, true);
        vm.prank(user2);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, false);

        vm.prank(user3);
        vm.expectRevert(EscrowMustBeOpen.selector);
        marketplaceContract.acceptEscrowMarket{value: 0.010 ether}(1, false);
    }
}
