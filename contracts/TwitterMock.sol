// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "./Twitter.sol";

contract TwitterMock is Twitter {
    uint private _blocksAdd;

    function addBlocks(uint pAmount) external {
        _blocksAdd += pAmount;
    }

    function _getCurrentBlockNumber() internal view override returns (uint) {
        return block.number + _blocksAdd;
    }
}
