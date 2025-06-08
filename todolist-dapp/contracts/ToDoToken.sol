// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TodoToken is ERC20 {
    address public admin;

    constructor() ERC20("TodoToken", "TODO") {
        admin = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can mint tokens");
        _mint(to, amount);
    }

    function setAdmin(address newAdmin) external {
        require(msg.sender == admin, "Only admin can set new admin");
        admin = newAdmin;
    }
}
