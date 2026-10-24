// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseHook} from "v4-hooks-public/src/base/BaseHook.sol";
import {Currency} from "v4-hooks-public/lib/v4-core/src/types/Currency.sol";
import {PoolKey} from "v4-hooks-public/lib/v4-core/src/types/PoolKey.sol";
import {PoolId} from "v4-hooks-public/lib/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-hooks-public/lib/v4-core/src/types/BalanceDelta.sol";
import {SwapParams, ModifyLiquidityParams} from "v4-hooks-public/lib/v4-core/src/types/PoolOperation.sol";
import {IPoolManager} from "v4-hooks-public/lib/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-hooks-public/lib/v4-core/src/libraries/Hooks.sol";

contract CalloutHook is BaseHook {
    address immutable marketplaceFactory;

    constructor(
        IPoolManager _manager,
        address _marketplaceFactory
    ) BaseHook(_manager) {
        marketplaceFactory = _marketplaceFactory;
    }

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: true,
                beforeRemoveLiquidity: false,
                afterAddLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: true,
                afterSwap: false,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: true,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    function _afterSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata swapParams,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        return (this.afterSwap.selector, 0);
    }
}
