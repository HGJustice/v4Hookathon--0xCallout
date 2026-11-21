// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {
    FixedPointMathLib
} from "v4-hooks-public/lib/solady/src/utils/FixedPointMathLib.sol";

library LMSRLibrary {
    error InsufficientLiquidity();

    function _getTerm(
        uint256 _b,
        uint256 _yesNoReserves
    ) internal pure returns (int256) {
        int256 exponent = FixedPointMathLib.sDivWad(
            -int256(_yesNoReserves),
            int256(_b)
        );
        return FixedPointMathLib.expWad(exponent);
    }

    function _getInTerm(
        uint256 _b,
        uint256 _reserveIn,
        uint256 _amountIn
    ) internal pure returns (int256) {
        uint256 total = _reserveIn + _amountIn;
        int256 exponent = FixedPointMathLib.sDivWad(-int256(total), int256(_b));
        return FixedPointMathLib.expWad(exponent);
    }

    function _getOutTerm(
        int256 _newInTerm,
        int256 _score
    ) internal pure returns (int256) {
        int256 outTerm = _score - _newInTerm;
        if (outTerm <= 0) revert InsufficientLiquidity();
        return outTerm;
    }

    function _getNewOutReserve(
        uint256 _b,
        int256 _newOutTerm
    ) internal pure returns (int256) {
        int256 logNewOutTerm = FixedPointMathLib.lnWad(_newOutTerm);
        return FixedPointMathLib.sMulWad(-int256(_b), logNewOutTerm);
    }

    function _getAmountOut(
        uint256 _poolsCurrentReserves,
        int256 _newOutReserve
    ) internal pure returns (uint256) {
        if (_newOutReserve < 0) revert InsufficientLiquidity();
        return _poolsCurrentReserves - uint256(_newOutReserve) - 1 wei;
    }

    function _getSwapAmountOut(
        uint256 _currentOutReserves,
        uint256 _currentInReserves,
        uint256 _betAmount,
        uint256 _b,
        int256 _score
    ) internal pure returns (uint256) {
        int256 newInTerm = LMSRLibrary._getInTerm(
            _b,
            _currentInReserves,
            _betAmount
        );

        int256 newOutTerm = LMSRLibrary._getOutTerm(newInTerm, _score);
        int256 newOutReserve = LMSRLibrary._getNewOutReserve(_b, newOutTerm);
        uint256 tokenOutput = LMSRLibrary._getAmountOut(
            _currentOutReserves,
            newOutReserve
        );
        return tokenOutput;
    }

    function _getYesPrice(
        int256 _yesTerm,
        int256 _score
    ) internal pure returns (int256) {
        return FixedPointMathLib.sDivWad(_yesTerm, _score);
    }

    function _getNoPrice(
        int256 _noTerm,
        int256 _score
    ) internal pure returns (int256) {
        return FixedPointMathLib.sDivWad(_noTerm, _score);
    }

    function _getScore(
        int256 _yesTerm,
        int256 _noTerm
    ) internal pure returns (int256) {
        return _yesTerm + _noTerm;
    }
}
