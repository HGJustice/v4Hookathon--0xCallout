// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseHook} from "v4-hooks-public/src/base/BaseHook.sol";
import {Currency} from "v4-hooks-public/lib/v4-core/src/types/Currency.sol";
import {PoolKey} from "v4-hooks-public/lib/v4-core/src/types/PoolKey.sol";
import {
    SwapParams,
    ModifyLiquidityParams
} from "v4-hooks-public/lib/v4-core/src/types/PoolOperation.sol";
import {
    IPoolManager
} from "v4-hooks-public/lib/v4-core/src/interfaces/IPoolManager.sol";
import {
    BeforeSwapDelta,
    toBeforeSwapDelta
} from "v4-hooks-public/lib/v4-core/src/types/BeforeSwapDelta.sol";
import {Hooks} from "v4-hooks-public/lib/v4-core/src/libraries/Hooks.sol";
import {
    CurrencySettler
} from "v4-hooks-public/lib/v4-core/test/utils/CurrencySettler.sol";
import {SafeCast} from "v4-hooks-public/lib/v4-core/src/libraries/SafeCast.sol";

import "../Marketplace/MarketplaceFactory.sol";
import "./LMSRLibrary.sol";

contract CalloutHook is BaseHook {
    using CurrencySettler for Currency;

    MarketplaceFactory private immutable marketplaceFactory;

    uint256 constant B = 1;

    error AddLiquidityNotAllowed();
    error OnlyMarketplaceFactory();

    constructor(
        IPoolManager _manager,
        address payable _marketplaceFactory
    ) BaseHook(_manager) {
        marketplaceFactory = MarketplaceFactory(_marketplaceFactory);
    }

    function _beforeAddLiquidity(
        address,
        PoolKey calldata,
        ModifyLiquidityParams calldata,
        bytes calldata
    ) internal pure override returns (bytes4) {
        revert AddLiquidityNotAllowed();
    }

    function _beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        if (sender != address(marketplaceFactory))
            revert OnlyMarketplaceFactory();

        (uint256 yesReserves, uint256 noReserves, bool yesIsCurrency0) = abi
            .decode(hookData, (uint256, uint256, bool));

        uint256 betAmount = uint256(-params.amountSpecified);
        bool bettingYes = params.zeroForOne != yesIsCurrency0;

        uint256 poolPaysOut = _getSwapAmountOut(
            yesReserves,
            noReserves,
            betAmount,
            bettingYes
        );

        (Currency inCur, Currency outCur) = params.zeroForOne
            ? (key.currency0, key.currency1)
            : (key.currency1, key.currency0);

        inCur.take(poolManager, address(this), betAmount, true);
        outCur.settle(poolManager, address(this), poolPaysOut, true);

        BeforeSwapDelta beforeSwapDelta = toBeforeSwapDelta(
            SafeCast.toInt128(betAmount),
            -SafeCast.toInt128(poolPaysOut)
        );

        return (BaseHook.beforeSwap.selector, beforeSwapDelta, 0);
    }

    function _getSwapAmountOut(
        uint256 _currentYesReserves,
        uint256 _currentNoReserves,
        uint256 _betAmount,
        bool _yes
    ) private pure returns (uint256) {
        int256 yesTerm = LMSRLibrary._getTerm(B, _currentYesReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, _currentNoReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);

        if (_yes)
            return
                LMSRLibrary._getSwapAmountOut(
                    _currentYesReserves,
                    _currentNoReserves,
                    _betAmount,
                    B,
                    score
                );

        return
            LMSRLibrary._getSwapAmountOut(
                _currentNoReserves,
                _currentYesReserves,
                _betAmount,
                B,
                score
            );
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
}
