// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "v4-hooks-public/lib/solady/src/tokens/ERC20.sol";

contract YesToken is ERC20 {
    uint256 immutable marketID;
    address immutable marketFactory;

    error OnlyMarketFactoryAccess();

    constructor(uint256 _marketID) {
        marketID = _marketID;
        marketFactory = msg.sender;
    }

    modifier OnlyMarketFactory() {
        if (msg.sender != marketFactory) revert OnlyMarketFactoryAccess();
        _;
    }

    function name() public pure override returns (string memory) {
        return "Yes";
    }

    function symbol() public pure override returns (string memory) {
        return "YES";
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
