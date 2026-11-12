// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {FixedPointMathLib} from "v4-hooks-public/lib/solady/src/utils/FixedPointMathLib.sol";

library LMSRLibrary{

    function _getTerm(uint256 _b, uint256 _yesNoReserves) internal pure returns (int256) {
        int256 exponent = FixedPointMathLib.sDivWad(-int256(_yesNoReserves), int256(_b));
        return FixedPointMathLib.expWad(exponent);
    }

    function _getOutTerm(int256 _newInTerm, int256 _score) internal pure returns (int256) {
        return _score - _newInTerm
    }

    function _getPoolPaysOut() internal pure returns (int256) {
        
    }

    function _getYesPrice(int256 _yesTerm, int256 _score) internal pure returns (int256) {
        return FixedPointMathLib.sDivWad(_yesTerm, _score);
    }

    function _getNoPrice(int256 _noTerm, int256 _score) internal pure returns (int256) {
        return FixedPointMathLib.sDivWad(_noTerm, _score);
    }

    function _getScore(int256 _yesTerm, int256 _noTerm) internal pure returns (int256) {
        return _yesTerm + _noTerm;
    }

}