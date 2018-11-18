module.exports = function(callback) {

	const CulturalGood = artifacts.require("CulturalGood");
	const ipfsAPI = require('ipfs-api');
	const fs = require('fs');
	const multihashes = require('multihashes');
	const readline = require('readline');

	const lookupTable = {
    operaEOggettoDArte : 25,
    repertoArcheologico: 6
  };

	let readlineInterface = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	//Define IPFS daemon setting 
	const ipfsHost = 'ipfs_peer1';
	const ipfsPort = '5001';

	//Connect to IPFS daemon
	let ipfs = ipfsAPI(ipfsHost, ipfsPort, {protocol: 'http'});

	//1-to-1 mapping betweern ES indexes and cultural good typologies
  let esIndexesToRestore = [];
  let culturalGoodTypology;


  function buildRestoreJSONFile(operations, restorePath, dbStateChangeEvent) {

  	for(let z = 0; z < operations.length; z++) {

  		if( !(/\n/.exec(operations[z])) ){
    		operations[z] += '\n';
    	}

      fs.writeFileSync(restorePath, operations[z], {flag: 'a'});
  	}
  	dbStateChangeEvent.stopWatching();
  }

  console.log('\n================ Ripristino ES Indices Via Ethereum Blockchain ================');

  function readTypologyToRestore() {

  	readlineInterface.question(
			'\nQuale tipologia di bene culturale ripristinare?\n'+
			'Inserisci 0 per ripristinare TUTTE LE TIPOLOGIE\n'+
			'Inserisci 1 per ripristinare OPERA E OGGETTO D\'ARTE\n'+
			'Inserisci 2 per ripristinare REPERTO ARCHEOLOGICO\n'+
			'\nTipologia da ripristinare: ', 
			(culturalGoodTypologyToRestore) => {
				culturalGoodTypology = culturalGoodTypologyToRestore;
				//console.log(typeof culturalGoodTypology);
				//console.log(culturalGoodTypology);

				switch (culturalGoodTypology) {

		      case '0':
		      	esIndexesToRestore.push('Opera e oggetto d\'Arte');
		      	esIndexesToRestore.push('Reperto archeologico');
		        break;

		      case '1':
		        esIndexesToRestore.push('Opera e oggetto d\'Arte');
		        break;

		      case '2':
		        esIndexesToRestore.push('Reperto archeologico');
		        break;

		      default:
		      	console.log('\nSCELTA NON CORRETTA!!\n');
		      	readTypologyToRestore();
		        break;
		    }

		    if(culturalGoodTypology == '0' || culturalGoodTypology == '1' || culturalGoodTypology == '2')
	  			readlineInterface.close();


	  		let additionalFilterOptionObject = { fromBlock: 0};
			  let indexedArgumentsUponWhichFilterLogsBy = {};
			  let dbStateChangeEvent;
			  /*An instance of the CulturalGood contract*/
				let CulturalGoodInstance;

			  CulturalGood.deployed().then( (instance) => {

					CulturalGoodInstance = instance;
					

					for (let i = 0; i < esIndexesToRestore.length; i++) {

				    switch (esIndexesToRestore[i]) {

				      case 'Opera e oggetto d\'Arte':
				        indexedArgumentsUponWhichFilterLogsBy['typology'] = lookupTable['operaEOggettoDArte'];
				        //console.log(indexedArgumentsUponWhichFilterLogsBy);
				        break;

				      case 'Reperto archeologico':
				        indexedArgumentsUponWhichFilterLogsBy['typology'] = lookupTable['repertoArcheologico'];
				        //console.log(indexedArgumentsUponWhichFilterLogsBy);
				        break;

				      default:
				        break;
				    }

				    dbStateChangeEvent = CulturalGoodInstance.DbStateChange(indexedArgumentsUponWhichFilterLogsBy,additionalFilterOptionObject);

				    dbStateChangeEvent.get((error, logs) => { 

				      const fnCodeCIDv0 = '12';   //hex encoding
				      const fnLengthCIDv0 = '20'; //hex encoding

				      let restorePath;
							if (esIndexesToRestore[i] == 'Opera e oggetto d\'Arte')
								restorePath = '/cultural-good/external_res/OA3_0/restore/oa3_0-restore.json';
							else
								restorePath = '/cultural-good/external_res/RA3_0/restore/ra3_0-restore.json';

							// Will store IPFS cat operations waiting to be completed (i.e promises awaiting to be resolved)
							let promisesToBeResolved= [];
							/* Will store correspondent operation count. Logs are retrieved sorted (asc) wrt block #. 
							 * This means that logs are sorted wrt to times at which ops have been performed).
							 * We need to respect this ordering while restoring the ES indices! */
							let associatedOpsCount = [];

							let opCount = 0;

				      for(let j = 0; j < logs.length; j++) {

				      	//console.log(logs[j]);

				      	opCount = j + 1; 

				      	console.log('\n================ OPERATION COUNT:' + opCount + ' BLOCK #:' + logs[j].blockNumber + '================\n');
				        //console.log(j + ') Block Number: ' + logs[j].blockNumber);
				        //console.log(j + ') dbCID: ' + logs[j].args.dbCID);

				        let hexMultihash = fnCodeCIDv0 + fnLengthCIDv0 + logs[j].args.ipfsLink.slice(2);
				        //console.log(hexMultihash);
				        let multihashBuffer = multihashes.fromHexString(hexMultihash);
				        let base58OperationCID = multihashes.toB58String(multihashBuffer);

				        console.log('Tipologia bene: '+ esIndexesToRestore[i]);
				        console.log('base58 dbCID: '+ base58OperationCID);
				        console.log('\n================ END OPERATION COUNT:' + opCount + ' BLOCK #:' + logs[j].blockNumber + '================\n\n');


				        promisesToBeResolved.push(ipfs.files.cat(base58OperationCID));
				        associatedOpsCount.push(j);
				      }

				      Promise.all(promisesToBeResolved).then( (operations) => {

				      	fs.access(restorePath, (err) => {

								  //File does not exists
								  if (err) {
								  	buildRestoreJSONFile(operations, restorePath, dbStateChangeEvent);
								  	return;
								  }

								  //File exists.So we need to delete it
							    fs.unlink(restorePath, (err) => {

									  if (err){
									  	alert('Errore nell\'eliminazione del JSON restore file precedentemente salvato!');
									  	console.error(err);
									  	return;
									  }
									  buildRestoreJSONFile(operations, restorePath, dbStateChangeEvent);
									});

								}); 
				      },(reason) => {
	              console.error(reason);
	            });
				    });
				  }
				}, (error) => {
					console.log(error);
				});
		});
	}

  readTypologyToRestore();
}