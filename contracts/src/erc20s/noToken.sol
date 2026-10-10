// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "solmate/src/tokens/ERC20.sol";

contract NoToken is ERC20 {
    uint256 marketID;
    address marketFactory;

    error OnlyMarketFactoryAccess();

    constructor(uint256 _marketID) ERC20("No", "NO", 18) {
        marketID = _marketID;
        marketFactory = msg.sender;
    }

    modifier OnlyMarketFactory() {
        if (msg.sender != marketFactory) revert OnlyMarketFactoryAccess();
        _;
    }

    function mintNoToken(uint256 _amount) external OnlyMarketFactory {
        _mint(marketFactory, _amount);
    }

    function burnNoToken(
        address _from,
        uint256 _amount
    ) external OnlyMarketFactory {
        _burn(_from, _amount);
    }
}
