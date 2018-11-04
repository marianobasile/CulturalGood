pragma solidity ^0.4.24;

	/**
	 * @title AccessRestriction
	 * @dev AccessRestriction contract implements a "restriction access" pattern 
	 */
contract AccessRestriction {
  address owner;
  
  /**
   * @dev Set the owner of the contract to the sender account
   */
  constructor() public {
    owner = msg.sender;
  }
  
  /**
   * @dev Implementation of "EOAs permissions"
   */
  modifier onlyOwner {
    require(owner == msg.sender);
    _;
  }
  
  /**
   * @dev Change the current owner
   */
  function changeOwner(address _newOwner) public onlyOwner {
    owner = _newOwner;
  }
  
}