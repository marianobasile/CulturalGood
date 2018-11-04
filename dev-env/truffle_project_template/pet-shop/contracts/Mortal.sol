pragma solidity ^0.4.24;

import "./AccessRestriction.sol";
  /**
   * @title Mortal
   * @dev Mortal contract is used to clean up (a buggy or deprecated) contract 
   */
contract Mortal is AccessRestriction {
  /**
   * @dev Event useful in case of external dependencies and for future reference 
   */
  event Closed();
  
  /**
   * @dev Remove contract's code and move remaining Ethers to the owner 
   */
  function close() public onlyOwner {
    emit Closed();
    selfdestruct(owner);
  }

}