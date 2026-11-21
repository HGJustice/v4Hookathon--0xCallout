// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test, console} from "forge-std/Test.sol";
import "../../src/Hook/LMSRLibrary.sol";

uint256 constant B = 1 ether;
uint256 constant startingYesPoolReserves = 0.02 ether;
uint256 constant startingNoPoolReserves = 0.02 ether;
uint256 constant betAmount = 0.02 ether;
bool constant decision = true;

contract LMSRLibraryUnit is Test {

    function test__getTerm() external pure { 
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        assertApproxEqAbs(yesTerm, 0.9801986733 ether, 1e10);
        assertApproxEqAbs(noTerm, 0.9801986733 ether, 1e10);
    }

    function test__getInTerm() external pure {
        int256 inTerm = LMSRLibrary._getInTerm(B, startingNoPoolReserves, betAmount);
        assertApproxEqAbs(inTerm, 0.9607894392 ether, 1e10);
    }

    function test__getScore() external pure {
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        assertApproxEqAbs(score, 1.960397347 ether, 1e10);
    }

    function test__getOutTerm() external pure {
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        int256 newInTerm = LMSRLibrary._getInTerm(B, startingNoPoolReserves, betAmount);

        int256 newOutTerm = LMSRLibrary._getOutTerm(newInTerm, score);
        assertApproxEqAbs(newOutTerm, 0.9996079075 ether, 1e10);
    }

    function test__getOutReserve() external pure{
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        int256 newInTerm = LMSRLibrary._getInTerm(B, startingNoPoolReserves, betAmount);

        int256 newOutTerm = LMSRLibrary._getOutTerm(newInTerm, score);
        assertApproxEqAbs(newOutTerm, 0.9996079075 ether, 1e10);
        int256 newOutReserve = LMSRLibrary._getNewOutReserve(B, newOutTerm);
        assertApproxEqAbs(newOutReserve, 0.0003921694272 ether, 1e10);
    }

    function test__getSwapAmountOut() external pure {
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        int256 newInTerm = LMSRLibrary._getInTerm(B, startingNoPoolReserves, betAmount);

        int256 newOutTerm = LMSRLibrary._getOutTerm(newInTerm, score);
        assertApproxEqAbs(newOutTerm, 0.9996079075 ether, 1e10);
        int256 newOutReserve = LMSRLibrary._getNewOutReserve(B, newOutTerm);
        assertApproxEqAbs(newOutReserve, 0.0003921694272 ether, 1e10);
        uint256 poolPaysOut = LMSRLibrary._getAmountOut(startingYesPoolReserves, newOutReserve);
        assertApproxEqAbs(poolPaysOut, 0.01960783057 ether, 1e10);
    }

    function test__getYesPrice() external pure {
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        int256 yesPrice = LMSRLibrary._getYesPrice(yesTerm, score);
        assertApproxEqAbs(yesPrice, 0.5 ether, 1e2);
    }

    function test__getNoPrice() external pure {
        int256 yesTerm = LMSRLibrary._getTerm(B, startingYesPoolReserves);
        int256 noTerm = LMSRLibrary._getTerm(B, startingNoPoolReserves);
        int256 score = LMSRLibrary._getScore(yesTerm, noTerm);
        int256 noPrice = LMSRLibrary._getNoPrice(noTerm, score);
        assertApproxEqAbs(noPrice, 0.5 ether, 1e2);
    }
}