const CulturalGood = artifacts.require('CulturalGood');

contract('CulturalGood', function(accounts) {
	let owner = accounts[0];
	let unauthorizedAccount = accounts[1];
	let randomBytes = '0x8618149226d7207a704d39fab2a78b2d516162f99942542bbff6822b6c6b4f58';
	const maxCulturalGoodTypologies = 30;
	let randomTypology = Math.random() * (maxCulturalGoodTypologies + 1);

	it('should not remove code from the blockchain', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.close({from: unauthorizedAccount});
		}).catch((error) => {
			assert.equal(error.message,'VM Exception while processing transaction: revert', 'Seems that the unauthorizedAccount is the owner!');
		});
	});

	it('should not change the owner', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.changeOwner(unauthorizedAccount,{from: unauthorizedAccount});
		}).catch((error) => {
			assert.equal(error.message,'VM Exception while processing transaction: revert', 'Seems that the unauthorizedAccount is the owner!');
		});
	});

	it('should change the owner', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.changeOwner(unauthorizedAccount);
		}).then(() => {
			owner = unauthorizedAccount;
			unauthorizedAccount = accounts[0]; 
			assert.equal(owner, owner, 'Seems that the unauthorizedAccount is the owner!');
		});
	});

	it('should emit DbStateChange event', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.dbStateChange(randomBytes, randomTypology, {from: owner});
		}).then((result)=> {
			assert.equal(result.logs[0].event,'DbStateChange','DbStateChange event wasn\'t emitted');
		});
	});

	it('should not emit DbStateChange event', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.dbStateChange(randomBytes, randomTypology);
		}).catch((error) => {
			assert.equal(error.message,'VM Exception while processing transaction: revert', 'Seems that the unauthorizedAccount is the owner!');
		});
	});
	/* Gets emitted, but we do no want to remove the code from the blockchain
	it('should remove code from the blockchain', function() {
		return CulturalGood.deployed().then((istance) => {
			return istance.close();
		}).then((result)=> {
			assert.equal(result.logs[0].event,'Closed','Closed event wasn\'t emitted');
		});
	});*/
});
