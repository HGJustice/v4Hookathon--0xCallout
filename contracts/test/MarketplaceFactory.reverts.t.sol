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
}
