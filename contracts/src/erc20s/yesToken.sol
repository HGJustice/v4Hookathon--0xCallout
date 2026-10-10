// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "solmate/src/tokens/ERC20.sol";

contract YesToken is ERC20 {
    uint256 marketID;
    address marketFactory;

    error OnlyMarketFactoryAccess();

    constructor(uint256 _marketID) ERC20("Yes", "YES", 18) {
        marketID = _marketID;
        marketFactory = msg.sender;
    }

    modifier OnlyMarketFactory() {
        if (msg.sender != marketFactory) revert OnlyMarketFactoryAccess();
        _;
    }

    function mintYesToken(uint256 _amount) external OnlyMarketFactory {
        _mint(marketFactory, _amount);
    }

    function burnYesToken(
        address _from,
        uint256 _amount
    ) external OnlyMarketFactory {
        _burn(_from, _amount);
    }
}
