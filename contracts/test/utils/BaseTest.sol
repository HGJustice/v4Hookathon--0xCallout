// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {PoolManager} from "v4-core/src/PoolManager.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
import {MarketplaceFactory} from "../../src/Marketplace/MarketplaceFactory.sol";

abstract contract BaseTest is Test, Deployers {
    MarketplaceFactory public marketplaceContract;

    address multiSig = makeAddr("multiSig");
    address user1 = makeAddr("user1");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");
    address user4 = makeAddr("user4");
    address user5 = makeAddr("user5");

    function setUp() public virtual {
        deal(multiSig, 1 ether);
        deal(user1, 1 ether);
        deal(user2, 1 ether);
        deal(user3, 1 ether);
        deal(user4, 1 ether);
        deal(user5, 1 ether);

        deployFreshManagerAndRouters();
        marketplaceContract = new MarketplaceFactory(
            IPoolManager(address(manager)),
            multiSig
        );
    }

    function _createDefaultMarket(address _user, uint256 _amount) internal {
        vm.prank(_user);
        marketplaceContract.createMarket{value: _amount}(
            "Is btc going to hit 3k by friday?",
            12343434
        );
    }

    function _getMarket(
        uint256 _marketplaceID
    ) internal view returns (MarketplaceFactory.Marketplace memory) {
        return marketplaceContract.getMarket(_marketplaceID);
    }

    function _betYes(
        address _user,
        uint256 _amount,
        uint256 _marketID
    ) internal {
        vm.prank(_user);
        marketplaceContract.betMarket{value: _amount}(_marketID, true);
    }

    function _betNo(
        address _user,
        uint256 _amount,
        uint256 _marketID
    ) internal {
        vm.prank(_user);
        marketplaceContract.betMarket{value: _amount}(_marketID, false);
    }
}
