// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "v4-hooks-public/lib/solady/src/tokens/ERC20.sol";

contract NoToken is ERC20 {
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
        return "No";
    }

    function symbol() public pure override returns (string memory) {
        return "NO";
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
