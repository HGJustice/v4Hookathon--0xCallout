// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Script} from "forge-std/Script.sol";
import {MarketplaceFactory} from "../src/Marketplace/MarketplaceFactory.sol";
import {IPoolManager} from "v4-hooks-public/lib/v4-core/src/interfaces/IPoolManager.sol";

contract DeployMarketplaceScript is Script {
    address multiSig = 0x2eF691B20E7c79D02c5Ac5ba0D5cC6DC73aB3b79; // any custom accress too eth account at the momment
    address chainlinkCre = 0x980C4E9E9887DC85155Ce2b65ac62A6f6F3d2731; // any custom accress too eth account at the momment
    address uniArbitrumPoolManager = 0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317;
    uint256 deployerPrivateKey = vm.envUint("PK");

    function run() public {
        vm.startBroadcast(deployerPrivateKey);
        new MarketplaceFactory(
            IPoolManager(uniArbitrumPoolManager),
            multiSig,
            chainlinkCre
        );
        vm.stopBroadcast();
    }
}