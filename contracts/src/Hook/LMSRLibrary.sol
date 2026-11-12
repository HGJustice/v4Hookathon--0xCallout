pragma solidity 0.8.26;

import {FixedPointMathLib} from "v4-hooks-public/lib/solady/src/utils/FixedPointMathLib.sol";

library LMSRLibrary{

    function _getTerm(uint256 _b, uint256 _reserves) internal pure returns (int256) {
        int256 exponent = FixedPointMathLib.sDivWad(-int256(_reserves), int256(_b));
        return FixedPointMathLib.expWad(exponent);
    }

}