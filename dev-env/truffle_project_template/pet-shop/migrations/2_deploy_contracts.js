/* artifacts.require() requires the name of the contract to deploy
 * as specified inside the .sol after the contract keyword.
 * This name has to correspond to the value of the key "contractName" 
 * inside the correspondent truffle contract object (EVM smart contract) 
 * generated after compiling the contract (/build/contracts). It return a contract abstraction */ 
let CulturalGood = artifacts.require("CulturalGood");

module.exports = function(deployer) {

/* Deploy the contract CulturalGood. */ 
	deployer.deploy(CulturalGood);
	
}