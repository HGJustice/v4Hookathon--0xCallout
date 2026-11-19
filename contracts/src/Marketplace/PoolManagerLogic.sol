// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "v4-hooks-public/lib/v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-hooks-public/lib/v4-core/src/types/Currency.sol";
import {IHooks} from "v4-hooks-public/lib/v4-core/src/interfaces/IHooks.sol";
import {
    IPoolManager
} from "v4-hooks-public/lib/v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "v4-hooks-public/lib/v4-core/src/libraries/TickMath.sol";
import {
    CurrencySettler
} from "v4-hooks-public/lib/v4-core/test/utils/CurrencySettler.sol";
import {
    TransientStateLibrary
} from "v4-hooks-public/lib/v4-core/src/libraries/TransientStateLibrary.sol";
import {
    SafeCallback
} from "v4-hooks-public/lib/v4-periphery/src/base/SafeCallback.sol";
import {
    SwapParams
} from "v4-hooks-public/lib/v4-core/src/types/PoolOperation.sol";

abstract contract PoolManagerLogic is SafeCallback {
    using CurrencySettler for Currency;
    using TransientStateLibrary for IPoolManager;

    enum CallbackAction {
        CreateMarket,
        PlaceBet
    }

    address hookContract;

    error HookAddressNotSet();

    constructor(IPoolManager _poolManager) SafeCallback(_poolManager) {}

    function _createPoolAddLiquidity(
        PoolKey memory _newMarketKey,
        uint256 _amount
    ) internal {
        if (hookContract == address(0)) revert HookAddressNotSet();
        uint160 sqrtPriceX96 = 79228162514264337593543950336;

        poolManager.initialize(_newMarketKey, sqrtPriceX96);
        bytes memory data = abi.encode(
            _newMarketKey,
            _amount,
            CallbackAction.CreateMarket,
            false,
            msg.sender,
            bytes("")
        );
        poolManager.unlock(data);
    }

    function _unlockCallback(
        bytes calldata data
    ) internal override returns (bytes memory) {
        (
            PoolKey memory poolKey,
            uint256 amount,
            CallbackAction action,
            bool decision,
            address user,
            bytes memory hookData
        ) = abi.decode(
                data,
                (PoolKey, uint256, CallbackAction, bool, address, bytes)
            );
        uint256 amountOut;

        if (action == CallbackAction.CreateMarket) {
            poolKey.currency0.settle(
                poolManager,
                address(this),
                uint256(amount),
                false
            );

            poolKey.currency1.settle(
                poolManager,
                address(this),
                uint256(amount),
                false
            );

            poolKey.currency0.take(poolManager, hookContract, amount, true);
            poolKey.currency1.take(poolManager, hookContract, amount, true);
        } else if (action == CallbackAction.PlaceBet) {
            poolManager.swap(
                poolKey,
                SwapParams({
                    zeroForOne: decision,
                    amountSpecified: -int256(amount),
                    sqrtPriceLimitX96: decision
                        ? TickMath.MIN_SQRT_PRICE + 1
                        : TickMath.MAX_SQRT_PRICE - 1
                }),
                hookData
            );

            (int256 delta0, int256 delta1) = _getCurrencyDelta(poolKey);

            if (delta0 < 0) {
                poolKey.currency0.settle(
                    poolManager,
                    address(this),
                    uint256(-delta0),
                    false
                );
            } else if (delta0 > 0) {
                amountOut = uint256(delta0);
                poolKey.currency0.take(poolManager, user, amountOut, false);
            }

            if (delta1 < 0) {
                poolKey.currency1.settle(
                    poolManager,
                    address(this),
                    uint256(-delta1),
                    false
                );
            } else if (delta1 > 0) {
                amountOut = uint256(delta1);
                poolKey.currency1.take(poolManager, user, amountOut, false);
            }
        }
        return abi.encode(amountOut);
    }

    function _getCurrencyDelta(
        PoolKey memory _poolKey
    ) internal view returns (int256, int256) {
        int256 delta0 = poolManager.currencyDelta(
            address(this),
            _poolKey.currency0
        );
        int256 delta1 = poolManager.currencyDelta(
            address(this),
            _poolKey.currency1
        );

        return (delta0, delta1);
    }

    function _createPoolKey(
        address _yesToken,
        address _noToken
    ) internal view returns (PoolKey memory) {
        (Currency currency0, Currency currency1) = address(_yesToken) <
            address(_noToken)
            ? (
                Currency.wrap(address(_yesToken)),
                Currency.wrap(address(_noToken))
            )
            : (
                Currency.wrap(address(_noToken)),
                Currency.wrap(address(_yesToken))
            );

        return PoolKey(currency0, currency1, 0, 60, IHooks(hookContract));
    }
}
