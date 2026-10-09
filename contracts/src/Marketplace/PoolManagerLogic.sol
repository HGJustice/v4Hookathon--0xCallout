// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {CurrencySettler} from "v4-core/test/utils/CurrencySettler.sol";
import {TransientStateLibrary} from "v4-core/src/libraries/TransientStateLibrary.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {SafeCallback} from "v4-periphery/src/base/SafeCallback.sol";

abstract contract PoolManagerLogic is SafeCallback {
    using CurrencySettler for Currency;
    using TransientStateLibrary for IPoolManager;
    using StateLibrary for IPoolManager;
    using PoolIdLibrary for PoolKey;

    enum CallbackAction {
        CreateMarket,
        PlaceBet
    }

    constructor(IPoolManager _poolManager) SafeCallback(_poolManager) {}

    function _createPoolAddLiquidity(
        PoolKey memory _newMarketKey,
        uint256 _amount
    ) internal {
        uint160 sqrtPriceX96 = 79228162514264337593543950336;

        poolManager.initialize(_newMarketKey, sqrtPriceX96);
        bytes memory data = abi.encode(
            _newMarketKey,
            _amount,
            CallbackAction.CreateMarket,
            false,
            msg.sender
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
            address user
        ) = abi.decode(data, (PoolKey, uint256, CallbackAction, bool, address));

        if (action == CallbackAction.CreateMarket) {
            poolManager.modifyLiquidity(
                poolKey,
                IPoolManager.ModifyLiquidityParams({
                    tickLower: -887220,
                    tickUpper: 887220,
                    liquidityDelta: int256(amount),
                    salt: bytes32(0)
                }),
                bytes("")
            );

            (int256 delta0, int256 delta1) = _getCurrencyDelta(poolKey);

            poolKey.currency0.settle(
                poolManager,
                address(this),
                uint256(-delta0),
                false
            );

            poolKey.currency1.settle(
                poolManager,
                address(this),
                uint256(-delta1),
                false
            );
        } else if (action == CallbackAction.PlaceBet) {
            poolManager.swap(
                poolKey,
                IPoolManager.SwapParams({
                    zeroForOne: decision,
                    amountSpecified: -int256(amount),
                    sqrtPriceLimitX96: decision
                        ? TickMath.MIN_SQRT_PRICE + 1
                        : TickMath.MAX_SQRT_PRICE - 1
                }),
                ""
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
                poolKey.currency0.take(
                    poolManager,
                    user,
                    uint256(delta0),
                    false
                );
            }

            if (delta1 < 0) {
                poolKey.currency1.settle(
                    poolManager,
                    address(this),
                    uint256(-delta1),
                    false
                );
            } else if (delta1 > 0) {
                poolKey.currency1.take(
                    poolManager,
                    user,
                    uint256(delta1),
                    false
                );
            }
        }
        return "";
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
    ) internal pure returns (PoolKey memory) {
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

        return PoolKey(currency0, currency1, 0, 60, IHooks(address(0)));
    }

    function _getPoolTokenBalance(
        PoolKey memory _poolKey
    ) internal view returns (uint256 amount0, uint256 amount1) {
        (uint160 sqrtPriceX96, , , ) = poolManager.getSlot0(_poolKey.toId());
        uint128 liquidity = poolManager.getLiquidity(_poolKey.toId());

        uint160 sqrtLower = TickMath.getSqrtPriceAtTick(-887220);
        uint160 sqrtUpper = TickMath.getSqrtPriceAtTick(887220);

        (amount0, amount1) = LiquidityAmounts.getAmountsForLiquidity(
            sqrtPriceX96,
            sqrtLower,
            sqrtUpper,
            liquidity
        );
    }
}
