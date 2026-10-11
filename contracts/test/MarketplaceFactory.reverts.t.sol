// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseTest} from "./utils/Basetest.sol";
import "../src/Marketplace/MarketplaceFactory.sol";
import "../src/Marketplace/Errors.sol";

contract MarketplaceFactoryReverts is BaseTest {
    function test_insufficientFundsFail() external {
        vm.expectRevert(InsufficientSetupFee.selector);
        _createDefaultMarket(user1, 0.03 ether);
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
        marketplaceContract.withdrawFees();
    }
}
