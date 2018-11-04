const ipfsAPI = require('ipfs-api');
const elasticsearch = require('elasticsearch');
const fs = require('fs');

//Define IPFS daemon setting 
const ipfsHost = 'ipfs_peer1';
const ipfsPort = '5001';

//Define ES settings
const esHost = 'elasticsearch:9200';

//Define path to OA3_0/RA3_0 imgs directories
//It has to the absolute path inside the container fs.
const imgsPath = ['/cultural-good/external_res/OA3_0/imgs','/cultural-good/external_res/RA3_0/imgs'];

//Connect to IPFS daemon
let ipfs = ipfsAPI(ipfsHost, ipfsPort, {protocol: 'http'});

//Create a ES client
let esClient = new elasticsearch.Client({ host: esHost, log: ['error', 'warning'], apiVersion: '6.3'});

let imgsPathCount	= imgsPath.length;

for (let i = 0; i < imgsPathCount; i++) {

	let files;
	try {
		//Get filenames inside OA3_0/imgs and RA3_0/imgs
		files = fs.readdirSync(imgsPath[i]);
	} catch (err) {
		throw err;
	}
	 
	//let files = fs.readdirSync(imgsPath[i]);

	let filesCount = files.length;

	for(let j=0; j<filesCount; j++) {

		/*===============================================================================
			ONLY cultural-good imgs have to be added to IPFS.
			To reduce the chance of adding other files a check on the filename is perfomed.
			It has to be a SHA-256 hash in hex format, i.e 64 chars [0-9a-f]
		=================================================================================*/	 
		let isValidSHA256 = /[0-9a-f]{64}/;
		if (! isValidSHA256.test(files[j]))
			continue; 

		//let culturalGoodImg = fs.readFile(imgsPath[i]+'/'+files[j],(err, culturalGoodImg) => {
		fs.readFile(imgsPath[i]+'/'+files[j],(err, culturalGoodImg) => {
			
			if (err)
				throw err;

			//Add each OA3_0/RA3_0 img to IPFS
			ipfs.files.add(culturalGoodImg,(err,res) => {

				if (err)
					throw err;

				//Define ES type
				const esType = 'doc'
				//ES UPDATE API requires id to be of string type.
				let fingerprint = files[j].split(".")[0].toString();
				//retrieve IPFS CID (v0 as of October,2018) 
				let cid = res[0].hash;
				//Define ES index involved
				let esIndex;
				i == 0 ? esIndex = 'oa3_0' : esIndex = 'ra3_0';
				//Update OA3_0/RA3_0 documents with the img CID
				esClient.update({
					index: esIndex,
					type: esType,
					id: fingerprint,
					body: {
						doc: {
							'img_ipfs_hash': cid
						}
					}
				},(err, response) => {
						if (err) 
							throw err;
						
						//console.log('document _id: ' + fingerprint + '\timage CID: ' + cid);

						let restorePath;
						if (esIndex == 'oa3_0')
							restorePath = '/cultural-good/external_res/OA3_0/restore/oa3_0-migration.json';
						else
							restorePath = '/cultural-good/external_res/RA3_0/restore/ra3_0-migration.json';

						let data = '{"fingerprint":"' + fingerprint + '","img_ipfs_hash":"' + cid + '"}\n';

						fs.writeFile(restorePath, data, {flag: 'a'}, (err) => {
							if(err)
								throw err;
						});
				});
			});
		});
	}
}