pragma solidity ^0.4.24;

import "./AccessRestriction.sol";
import "./Mortal.sol";

  /**
   * @title CulturalGood
   * @dev CulturalGood contract provides consensus on a db state
   */
contract CulturalGood is Mortal {
    
  /**
   * @dev To notify a db state change.
   * @param dbCID - Updated db CIDv0
   * @param typology - Specifies the involved cultural good typology.
   * A lookup table has been defined for this purpose.
   * @notice typology is indexed so to filter content on the client side.
   */
  event DbStateChange(bytes32 dbCID, uint8 indexed typology);
  
  /**
   * @dev New operation performed: emits DbStateChange event.
   */
  function dbStateChange(bytes32 dbCID, uint8 typology) public onlyOwner {
    emit DbStateChange(dbCID, typology);
  }

}