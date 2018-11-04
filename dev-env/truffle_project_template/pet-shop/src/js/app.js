App = {
  /* The ethereum node to which connect to */
  web3Provider: null,
  /* Contract abstractions provided by Truffle */
  contracts: {},
  /* Gets the crypto object associated to the global object */
  cryptoObj: window.crypto,
  /* To perform crypto operations */
  subtleCrypto: window.crypto.subtle,
  /* Gets the local storage object */
  localStorage: window.localStorage,
  /* Define the key generation function to use */
  keyGenerationAlgorithm: {
    name: 'AES-CBC',
    length: 128
  },
  /* Define the cipher to use */
  cipher: {
    name: 'AES-CBC',
    //Define the AES-128-CBC IV to be used
   	iv: null
  },
  /* CryptoKey used for encryption (AES-128-CBC) */
  cipherKey: {},
  /* IV used for encryption (AES-128-CBC) */
  cipherIV: null,
  /* If #insertionForm (defined in src/index.html) has been submitted and data migration is completed, insert the new document */
  insertionFormSubmitted: false,

   /* CulturalGood contract's method dbStateChange() takes in a uint8 as second parameter:
    * the parameter represent the cultural good typology through which to filter emitted events.
    * For each typology an (Elasticsearch) index would be defined (so far oa3_0/ra3_0 only)
    * The table may be expanded for future use */
  lookupTable: {
    operaEOggettoDArte : 25,
    repertoArcheologico: 6
  },
  /* Elasticsearch endpoint to which connect to */
  esHost: '127.0.0.1:9200',
  /* ES index to query */
  elasticIndex: null,
  /* ES Type associated with the index */
  elasticType: 'doc',
  /* In order to use a clean copy of the culturalGoodTemplate (defined in src/index.html) at each new search operation */
  culturalGoodTemplateClone: null,
  /* In order to use a clean copy of the culturalGoodDetailsContainer (defined in src/index.html) at each new show details operation */
  culturalGoodDetailsContainerClone: null,
  /* To differenciate actions to be performed*/
  insertOperation: 0,
  deleteOperation: 2,
  //insertNewCulturalGood: null,


  init: function() {
  	//App.localStorage.removeItem('isOATransactionAccepted');
  	//App.localStorage.removeItem('isRATransactionAccepted');
  	//App.localStorage.removeItem('rawCipherKey');
  	//App.localStorage.removeItem('cipherIV');
    return App.initWeb3();
  },

  initWeb3: function() {
    /* For metamask version >= 4.14.0.
     * The web3 JavaScript library interacts with the Ethereum blockchain. It can retrieve user accounts, send transactions, 
     * interact with smart contracts, and more.
     * The Ethereum provider injected by MetaMask and other dapp browsers is now available at window.ethereum */
    if(window.ethereum) {
      /* If a provider has been injected by Metamask we get it and use it to create our web3 istance */
      App.web3Provider = window.ethereum;
      window.web3 = new Web3(App.web3Provider);
    } else {
      /* Since no provider has been injected by Metamask we creare our web3 instance using as provider GANACHE_CLI */
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
      window.web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  /* We need to instantiate our smart contract so web3 knows where to find it and how it works */
  initContract: function() {
    /* Available under build/contracts and exposed in the baseDir array in bs-config.json */
    $.getJSON('CulturalGood.json', function(data) {

      // CulturalGood contract artifact 
      let CulturalGoodArtifact = data;
    
      // Gets an abtraction of the CulturalGood contract
      App.contracts.CulturalGood = TruffleContract(CulturalGoodArtifact);

      // Sets the provider for CulturalGood contract
      App.contracts.CulturalGood.setProvider(App.web3Provider);

      if(App.localStorage.getItem('isOATransactionAccepted') == null || App.localStorage.getItem('isRATransactionAccepted') == null) {
      	alert('Per finalizzare la migrazione dati inziale risulta necessario memorizzare le operazioni eseguite in blockchain.');
         App.finalizeDataMigration();
      }
      
      return App.bindEvents();
    });
  },

  finalizeDataMigration: function() {

    /* Will point to the OA3_0/RA3_0 migration file.
     * No path is defind since exposed in the baseDir array in bs-config.json */
    let restoresPath;

    if(App.localStorage.getItem('isOATransactionAccepted') == null) {
    	restoresPath = 'oa3_0-migration.txt';
    } else {
    	restoresPath = 'ra3_0-migration.txt';
    }

    //console.log(restoresPath);

    App.storeMigrationOperations(restoresPath);
  },

  storeMigrationOperations: function(restoresPath) {

    /* An instance of the CulturalGood contract */
    let CulturalGoodInstance;

    //const Buffer = ipfs.Buffer;

    $.get(restoresPath, function(data) {
    
      let restoreFileContent = ipfs.Buffer.from(data);

      /* Add OA3_0/RA3_0 migration to IPFS */
      ipfs.files.add(restoreFileContent,(err,res) => {

        if (err || !res) {
          console.error('Ipfs error: ' + err);
          alert('Errore durante l\'aggiunta del contenuto del file di restore in IPFS. Apri la console per informazioni dettagliate.');
          return;
        }

        //retrieve IPFS CID (v0 as of October,2018) 
        let restoreFileCID = res[0].hash;

        /* Converts from base58 to multihash format.
         * Returns a Buffer */
        let multihash = multihashes.fromB58String(restoreFileCID);

        /* Converts a type Buffer multihash to a type String multihash */
        let hexString = multihashes.toHexString(multihash);

        /* The first two bytes of a multihash are (always):fn code and length. 
         * (As of October, 2018) IPFS make use of CIDv0 (SHA2-256).
         * fn code is: 0x12 and length is: 0x20. We can get rid of these. 
         * When a restore operation has to be perfomed a correct multihash 
         * has to be reconstructed (by adding again fn code and length) */

        let parsedRestoreFileCID = '0x' + hexString.slice(4);
        // console.log('\nIPFS CIDv0 : ' + parsedRestoreFileCID);
        // console.log('\nParsed Base16 equivalent: ' + parsedRestoreFileCID +'\n');
      
        // Define cultural good typology 
        let culturalGoodTypology;

        restoresPath == 'oa3_0-migration.txt' ? culturalGoodTypology = App.lookupTable['operaEOggettoDArte'] : culturalGoodTypology = App.lookupTable['repertoArcheologico'];
        
        window.ethereum.enable().then( (success) => {

          App.contracts.CulturalGood.deployed().then( (instance) => {

            CulturalGoodInstance = instance;

            // console.log('Contract address: ' + CulturalGoodInstance.address);
            // alert('Contract address: ' + CulturalGoodInstance.address);

            // console.log('OA: ' + App.localStorage.getItem('isOATransactionAccepted'));
            // console.log('RA: ' + App.localStorage.getItem('isRATransactionAccepted'));
            CulturalGoodInstance.dbStateChange(parsedRestoreFileCID,culturalGoodTypology).then( (result) => {

              let esIndex;
              if(culturalGoodTypology == 25){
                esIndex = 'ES Index: ' + 'oa3_0\n';
                /* Used to keep track whether OA transaction has been accepted or not. 
                 * In the latter case, user will be prompted again until he/she accepts. */
                App.localStorage.setItem('isOATransactionAccepted', 'yes');
                // console.log('isOATransactionAccepted setted!');
              }
              else{
                esIndex = 'ES Index: ' + 'ra3_0\n';
                /* Used to keep track whether RA transaction has been accepted or not. 
                 * In the latter case, user will be prompted again until he/she accepts. */
                App.localStorage.setItem('isRATransactionAccepted', 'yes');
                // console.log('isRATransactionAccepted setted!');
              }
              console.log(
                '\n================ Database State Change ================\n' +
                esIndex +
                'Restore file CIDv0: ' + restoreFileCID + 
                '\n================ Database State Change ================\n'
                );

              // console.log('OA: ' + App.localStorage.getItem('isOATransactionAccepted'));
              // console.log('RA: ' + App.localStorage.getItem('isRATransactionAccepted'));
              if(App.localStorage.getItem('isOATransactionAccepted') != null && App.localStorage.getItem('isRATransactionAccepted') != null) {
                
                App.generateCipherKeyAndIV();
              } else if(App.localStorage.getItem('isOATransactionAccepted') == null) {
                App.storeMigrationOperations('oa3_0-migration.txt');
              } else {
                App.storeMigrationOperations('ra3_0-migration.txt');
              }
            }).catch( (error) => {
              alert('Transazione non eseguita!');
              // console.log('OA: ' + App.localStorage.getItem('isOATransactionAccepted'));
              // console.log('RA: ' + App.localStorage.getItem('isRATransactionAccepted'));
              console.error(error);
            });
          }).catch( (error) => {
            console.error(error);
          });
        }).catch( (error) => {
          alert('Transazione non eseguita!\n\nQuando richiesto, concedi i permessi per accedere ai tuoi accounts.');
          console.error(error);
        });
      });
    }, 'text');
  },

  bindEvents: function() {
    $(document).on('click', '.btn-showCulturalGoodDetails', App.showCulturalGoodDetails);
    $(document).on('click', '.btn-backToQueryResults', App.renderCulturalGoodDetails);
    $(document).on('click', '.btn-editCulturalGoodDetails', App.editCulturalGoodDetails);
    $(document).on('click', '.btn-removeCulturalGood', App.removeCulturalGood);
  },

  importKeyAndIV: function() {

  	// console.log('CipherIV is: ');
  	// Retrieve rawCipherIV from the local storage
  	App.cipherIV = Uint8Array.from(App.localStorage.getItem('CipherIV').split(','));
  	// console.log(App.cipherIV);
  	// console.log('Cipher IV has been imported. Now available via: App.cipherIV');

  	// Init cipher with IV
  	App.initCipher();

  	// console.log('rawCipherKey is: ');
  	// Retrieve rawCipherKey from the local storage
  	let rawCipherKey = Uint8Array.from(App.localStorage.getItem('rawCipherKey').split(','));
  	// console.log(rawCipherKey);

  	// Import CryptoKey from rawCipherKey
  	return App.subtleCrypto.importKey('raw',rawCipherKey,App.keyGenerationAlgorithm, true, ['encrypt', 'decrypt']);
  },

  initCipher: function() {
  	App.cipher.iv = App.cipherIV;
  	// console.log('Cipher has been initialized! Cipher IV is: ' + App.cipher.iv);
  	return;
  },

  generateCipherKeyAndIV: function() {

  	// Will store the cipher IV
  	let initializationVector = new Uint8Array(16);

  	// Generated cipher IV is stored
  	App.cryptoObj.getRandomValues(initializationVector);
  	// console.log('Cipher IV has been generated!');
  	// console.log(initializationVector);
    // console.log(initializationVector.toString());

    //Save IV in the localStorage for future use
		App.localStorage.setItem('CipherIV',initializationVector.toString());
  	//console.log('Cipher IV has saved into the Local Storage! Name: CipherIV, Value: ' + initializationVector.toString());

  	// Generate the cipher key
    App.subtleCrypto.generateKey(App.keyGenerationAlgorithm,true,['encrypt', 'decrypt']).then( (key) => {
      // console.log('Cipher key has been generated!');
	  	App.subtleCrypto.exportKey('raw', key).then( (rawKey)=> {
	  		// console.log(rawKey);

	  		//Get a uint8View of the rawKey
	  		let uint8RawKeyView = new Uint8Array(rawKey);

        // console.log(uint8RawKeyView);
        // console.log(uint8RawKeyView.toString());

	  		// Save rawKey in the localStorage for future use
	  		App.localStorage.setItem('rawCipherKey',uint8RawKeyView.toString());

	  		// console.log('Cipher key has saved into the Local Storage! Name: rawCipherKey, Value: ' + uint8RawKeyView.toString());
	  		if (App.insertionFormSubmitted == true) {
	  			App.insertDocument();
	  		}
	  	}).catch((error) => {
	  		console.error(error);
	  	});
    }).catch( (error) => {
      console.error(error);
    });
  },

  encryptField: function(field) {

  	let fieldAsByteArray = new TextEncoder("utf-8").encode(field);
    //console.log(fieldAsByteArray);

    return App.subtleCrypto.encrypt(App.cipher,App.cipherKey,fieldAsByteArray).then( (cipherText) => {
      // console.log(cipherText);
      stringifiedCiphertext = new Uint8Array(cipherText).toString();
     // console.log(stringifiedCiphertext);
      return stringifiedCiphertext;
    }).catch((error) => {
      console.error(error);
    });
  },

  decryptField: function(encryptedField) {

    let rawEncryptedField = Uint8Array.from(encryptedField.split(','));

    //console.log(rawEncryptedField);

    return App.subtleCrypto.decrypt(App.cipher,App.cipherKey,rawEncryptedField);
  },

  interactWithTheSmartContract: function(documentCID,culturalGoodTypology,operationType) {

    App.contracts.CulturalGood.deployed().then( (instance) => {

      CulturalGoodInstance = instance;

      // console.log('Contract address: ' + CulturalGoodInstance.address);
      // console.log('typology' + culturalGoodTypology);

      CulturalGoodInstance.dbStateChange(documentCID,culturalGoodTypology).then( (result) => {

        alert('Operazione registrata correttamente in blockchain!');
        let esIndex;

        if(culturalGoodTypology == 25){
          esIndex = 'ES Index: ' + 'oa3_0\n';
        }
        else{
          esIndex = 'ES Index: ' + 'ra3_0\n';
        }

        console.log(
          '\n================ Database State Change ================\n' +
          esIndex +
          'Document CIDv0: ' + documentCID + 
          '\n================ Database State Change ================\n'
          );

          if (operationType == App.insertOperation) {

            App.insertionFormSubmitted = false;
            $('#insertionForm')[0].reset();

            if( $('#insertNewCulturalGood h3').text().indexOf('Modifica Scheda Di Catalogo') != -1 ){
              $('.nav-tabs a[href="#searchCulturalGoods"]').tab('show');
              App.renderCulturalGoodSuccessOperation();
            }
          } else if (operationType == App.deleteOperation) {  
            App.renderCulturalGoodSuccessOperation();
          }
      }).catch( (error) => {
        alert('Operazione non registrata in blockchain!');
        console.error(error);

        if (operationType == App.insertOperation) {

          App.insertionFormSubmitted = false;
          $('#insertionForm')[0].reset();

          if( $('#insertNewCulturalGood h3').text().indexOf('Modifica Scheda Di Catalogo') != -1 ){
            $('.nav-tabs a[href="#searchCulturalGoods"]').tab('show');
            App.renderCulturalGoodSuccessOperation();
          }
        } else if (operationType == App.deleteOperation) {  
          App.renderCulturalGoodSuccessOperation();
        }
      });
    }).catch( (error) => {
      console.error(error);
    });
  },


  finalizeInsertOperation: function(indexRequestBodyJSONObject) {

    let stringifiedJSONDocument = JSON.stringify(indexRequestBodyJSONObject);

    //Define cultural good typology: required for sending dbStateChange() tx to the smart contract
    let culturalGoodTypology; 

    indexRequestBodyJSONObject.typology == 'Opera e oggetto d\'Arte' ? culturalGoodTypology = App.lookupTable['operaEOggettoDArte'] : culturalGoodTypology = App.lookupTable['repertoArcheologico'];

    ipfs.files.add(ipfs.Buffer.from(stringifiedJSONDocument),(err,res) => {

      if (err || !res) {
        console.error('Ipfs error: ' + err);
        alert('Errore durante l\'aggiunta dell\'operazione di inserimento in corso in IPFS. Apri la console per informazioni dettagliate.');
        return;
      }

      //retrieve IPFS CID (v0 as of October,2018) 
      let documentCID = res[0].hash;
      //console.log('Document CIDv0: ' + documentCID);

      /* Converts from base58 to multihash format.
       * Returns a Buffer */
      let multihash = multihashes.fromB58String(documentCID);

      /* Converts a type Buffer multihash to a type String multihash */
      let hexString = multihashes.toHexString(multihash);

      /* The first two bytes of a multihash are (always):fn code and length. 
       * (As of October, 2018) IPFS make use of CIDv0 (SHA2-256).
       * fn code is: 0x12 and length is: 0x20. We can get rid of these. 
       * When a restore operation has to be perfomed a correct multihash 
       * has to be reconstructed (by adding again fn code and length) */

      let parsedRestoreDocumentCID = '0x' + hexString.slice(4);
      //console.log('\nIPFS CIDv0 : ' + restoreJSONFileCID);
      //console.log('\nParsed Base16 equivalent: ' + hexString +'\n');

      //console.log('Parsed Document CIDv0: ' + parsedRestoreDocumentCID);

      App.interactWithTheSmartContract(parsedRestoreDocumentCID,culturalGoodTypology,App.insertOperation);


    });
  },

  buildESIndexRequestBodyJSONObject: function (culturalGoodImgPath,culturalGoodCategory,culturalGoodDisciplinarySector,culturalGoodTypology,culturalGoodNctr,culturalGoodNctn,culturalGoodNcts,culturalGoodAtbd,culturalGoodCdgg,culturalGoodOgtd,culturalGoodSgti,culturalGoodDes,culturalGoodPvcs,culturalGoodPvcr,culturalGoodPvcp,culturalGoodPvcc,culturalGoodPvcl,culturalGoodPvce,culturalGoodLdc,culturalGoodDtsi,culturalGoodDtsv,culturalGoodDtsf,culturalGoodDtsl,culturalGoodMtc,culturalGoodAdsp,culturalGoodFingerprint,culturalGoodImgExtension,culturalGoodImgFileCID) {
  	
    let indexRequestBodyJSONObject = {
      category: culturalGoodCategory,
      disciplinarySector: culturalGoodDisciplinarySector,
      typology: culturalGoodTypology,

      cd: {
        nct: {
          nctr: culturalGoodNctr,
          nctn: culturalGoodNctn
        }
      },
      tu:{
        cdg: {
          cdgg: culturalGoodCdgg
        }
      },
      og: {
        ogt: culturalGoodOgtd
      },
      da: {
        des: culturalGoodDes
      },
      lc: {
        pvc: {
          pvcs: culturalGoodPvcs,
          pvcr: culturalGoodPvcr,
          pvcp: culturalGoodPvcp,
          pvcc: culturalGoodPvcc
        }
      },
      mt: {
        mtc: culturalGoodMtc
      },
      ad: {
        ads:{
          adsp: culturalGoodAdsp
        }
      },
      fingerprint: culturalGoodFingerprint
    };
    
    if (culturalGoodNcts.length != 0){
      indexRequestBodyJSONObject.cd.nct['ncts'] = culturalGoodNcts;
    }

    if (culturalGoodAtbd.length != 0){

      indexRequestBodyJSONObject['au'] = {};
      indexRequestBodyJSONObject.au['atb'] = [{}];
      
      if (culturalGoodAtbd.length != 0) {
        indexRequestBodyJSONObject.au.atb[0]['atbd'] = culturalGoodAtbd;
      }
    }
    
    if (culturalGoodSgti.length != 0){
      indexRequestBodyJSONObject.og['sgt'] = {};
      indexRequestBodyJSONObject.og.sgt['sgti'] = culturalGoodSgti;

    }

    if (culturalGoodPvcl.length != 0){
      indexRequestBodyJSONObject.lc.pvc['pvcl'] = culturalGoodPvcl;
    }

    if (culturalGoodPvce.length != 0){
      indexRequestBodyJSONObject.lc.pvc['pvce'] = culturalGoodPvce;
    }

    if (culturalGoodLdc != null) {
      if (culturalGoodLdc.length != 0) {
        indexRequestBodyJSONObject.lc['ldc'] = culturalGoodLdc;
      }
    }
    
    if (culturalGoodDtsi.length != 0){
      indexRequestBodyJSONObject['dt']={};
      indexRequestBodyJSONObject.dt['dts']={}
      indexRequestBodyJSONObject.dt.dts['dtsi'] = culturalGoodDtsi;
    }
      
    if (culturalGoodDtsv.length != 0){
      indexRequestBodyJSONObject.dt.dts['dtsv'] = culturalGoodDtsv;
    }

    if (culturalGoodDtsf.length != 0){
      indexRequestBodyJSONObject.dt.dts['dtsf'] = culturalGoodDtsf;
    }

    if (culturalGoodDtsl.length != 0){
      indexRequestBodyJSONObject.dt.dts['dtsl'] = culturalGoodDtsl;
    }

    if (culturalGoodImgExtension != null){
      indexRequestBodyJSONObject.img_extension = culturalGoodImgExtension;
    }

    if (culturalGoodImgFileCID != null){
      indexRequestBodyJSONObject.img_ipfs_hash = culturalGoodImgFileCID;
    }

    return indexRequestBodyJSONObject;
  },

  sendIndexRequest: function(indexRequestBodyJSONObject) {

    window.ethereum.enable().then( (success) => {

      let esClient = elasticsearch.Client({ host: App.esHost, log: ['error', 'warning'], apiVersion: '6.3', deadTimeout: 1000, keepAliveFreeSocketTimeout: 3600000});

      //console.log(esClient);

      //Define ES index involved
      //let esIndex;

      indexRequestBodyJSONObject.typology == 'Opera e oggetto d\'Arte' ? App.elasticIndex = 'oa3_0' : App.elasticIndex = 'ra3_0';

      //Index OA3_0/RA3_0 document
      esClient.index({
        index: App.elasticIndex,
        type: App.elasticType,
        // To let doc be searchable soon after
        refresh: 'true',
        id: indexRequestBodyJSONObject.fingerprint,
        body: indexRequestBodyJSONObject
      },(err, response) => {
          if (err){
            alert('La connessione ad Elasticsearch ha subito un reset. Riprova');
            throw err;
            return;
          }

          console.log('Document with _id: ' + indexRequestBodyJSONObject.fingerprint + ' has been successfully indexed!');

          App.finalizeInsertOperation(indexRequestBodyJSONObject);

      });
    }).catch( (error) => {
      alert('Transazione non eseguita!\n\nQuando richiesto, concedi i permessi per accedere ai tuoi accounts.');
      console.error(error);
    });

  },

  indexDocumentIntoElasticsearch: function (culturalGoodImgPath,culturalGoodCategory,culturalGoodDisciplinarySector,culturalGoodTypology,culturalGoodNctr,culturalGoodNctn,culturalGoodNcts,culturalGoodAtbd,culturalGoodCdgg,culturalGoodOgtd,culturalGoodSgti,culturalGoodDes,culturalGoodPvcs,culturalGoodPvcr,culturalGoodPvcp,culturalGoodPvcc,culturalGoodPvcl,culturalGoodPvce,culturalGoodLdc,culturalGoodDtsi,culturalGoodDtsv,culturalGoodDtsf,culturalGoodDtsl,culturalGoodMtc,culturalGoodAdsp,culturalGoodFingerprint) {

    //Will store the index request body object for this document
    let indexRequestBodyJSONObject;

    // First we need to upload the image on IPFS, if present.
    if (culturalGoodImgPath.length != 0) {

      //Will store the image extension. Required when retrieving images from ipfs
      let imgExtension = culturalGoodImgPath.slice(culturalGoodImgPath.lastIndexOf('.')+1);
      //console.log(imgExtension);

      let oReq = new XMLHttpRequest();
      /* ========= Images have to be uploaded inside src/images!!!  ========= */
      let imgFolder = 'images';

      oReq.open("GET", imgFolder + '/' + culturalGoodImgPath.slice(culturalGoodImgPath.lastIndexOf('\\')+1), true);
      oReq.responseType = "arraybuffer";

      oReq.onload = function(oEvent) {

        if (this.status == 200) {

          // Add img to IPFS
          ipfs.files.add(ipfs.Buffer.from(oReq.response),(err,res) => {

            if (err || !res) {
              console.error('Ipfs error: ' + err);
              alert('Errore durante l\'aggiunta dell\'immagine in IPFS. Apri la console per informazioni dettagliate.');
              return;
            }

            //retrieve IPFS CID (v0 as of October,2018) 
            let imgFileCID = res[0].hash;
            //console.log('Image CIDv0: ' + imgFileCID);

            indexRequestBodyJSONObject = App.buildESIndexRequestBodyJSONObject(culturalGoodImgPath,culturalGoodCategory,culturalGoodDisciplinarySector,culturalGoodTypology,culturalGoodNctr,culturalGoodNctn,culturalGoodNcts,culturalGoodAtbd,culturalGoodCdgg,culturalGoodOgtd,culturalGoodSgti,culturalGoodDes,culturalGoodPvcs,culturalGoodPvcr,culturalGoodPvcp,culturalGoodPvcc,culturalGoodPvcl,culturalGoodPvce,culturalGoodLdc,culturalGoodDtsi,culturalGoodDtsv,culturalGoodDtsf,culturalGoodDtsl,culturalGoodMtc,culturalGoodAdsp,culturalGoodFingerprint,imgExtension,imgFileCID);
          
            App.sendIndexRequest(indexRequestBodyJSONObject);
          });  
        } else {
          alert("Le immagini devono essere selezionate dal percorso: /cultural-good/src/images");
          return;
        }     
      };

      oReq.send();
    } else {
      indexRequestBodyJSONObject = App.buildESIndexRequestBodyJSONObject(null,culturalGoodCategory,culturalGoodDisciplinarySector,culturalGoodTypology,culturalGoodNctr,culturalGoodNctn,culturalGoodNcts,culturalGoodAtbd,culturalGoodCdgg,culturalGoodOgtd,culturalGoodSgti,culturalGoodDes,culturalGoodPvcs,culturalGoodPvcr,culturalGoodPvcp,culturalGoodPvcc,culturalGoodPvcl,culturalGoodPvce,culturalGoodLdc,culturalGoodDtsi,culturalGoodDtsv,culturalGoodDtsf,culturalGoodDtsl,culturalGoodMtc,culturalGoodAdsp,culturalGoodFingerprint,null,null);
      App.sendIndexRequest(indexRequestBodyJSONObject);
    }
  },

  insertDocument: function() {

    //Cultural good img path
    const imgPath = $('#formControlCulturalGoodImgInsert').val();
    //console.log('ImgPath: ' + imgPath);
    //Cultural good category
    const category = $('#formControlCulturalGoodCategoryInsert').val();
    //Cultural good disciplinary sector
    const disciplinarySector = $('#formControlCulturalGoodDisciplinarySectorInsert').val();
    //Cultural good typology
    const typology = $('#formControlCulturalGoodTypologyInsert').val();
    //Cultural good region code
    const nctr = $('#formControlCulturalGoodCdNctNctr').val();
    //Cultural good general catalog number
    const nctn = $('#formControlCulturalGoodCdNctNctn').val();
    //Cultural good general catalog number suffix
    const ncts = $('#formControlCulturalGoodCdNctNcts').val().toUpperCase();
    //Cultural good cultural sector - denominarion
    const atbd = $('#formControlCulturalGoodAuAtbAtbd').val();
    //Cultural good cultural sector - reasoning
    //const atbm = $('#formControlCulturalGoodAuAtbAtbm').val();
    //Cultural good legal status - generic indication
    const cdgg = $('#formControlCulturalGoodTuCdgCdgg').val();
    //Cultural good object definition
    const ogtd = $('#formControlCulturalGoodOgOgtOgtd').val();
    //Cultural good subject identification
    const sgti = $('#formControlCulturalGoodOgSgtSgti').val();
    //Cultural good analytical data - description
    const des = $('#formControlCulturalGoodDaDes').val();
    //Cultural good location - state
    const pvcs = $('#formControlCulturalGoodLcPvcPvcs').val().charAt(0).toUpperCase() + $('#formControlCulturalGoodLcPvcPvcs').val().slice(1);
    //Cultural good location - region
    const pvcr = $('#formControlCulturalGoodLcPvcPvcr').val();
    //Cultural good location - province
    const pvcp = $('#formControlCulturalGoodLcPvcPvcp').val().toUpperCase();
    //Cultural good location - comune
    const pvcc = $('#formControlCulturalGoodLcPvcPvcc').val().charAt(0).toUpperCase() + $('#formControlCulturalGoodLcPvcPvcc').val().slice(1);
    //Cultural good location - localita
    let pvcl = $('#formControlCulturalGoodLcPvcPvcl').val();
    //Cultural good foreign location
    let pvce = $('#formControlCulturalGoodLcPvcPvce').val();
    //Cultural good specific location - typology
    let ldct = $('#formControlCulturalGoodLcLdcLdct').val();
    //Cultural good specific location - typology specs
    let ldcq = $('#formControlCulturalGoodLcLdcLdcq').val();
    //Cultural good specific location - denomination
    let ldcn = $('#formControlCulturalGoodLcLdcLdcn').val();
    //Cultural good specific location - monumental complex
    let ldcc = $('#formControlCulturalGoodLcLdcLdcc').val();
    //Cultural good specific location - address
    let ldcu = $('#formControlCulturalGoodLcLdcLdcu').val();
    //Cultural good specific location - collection denomination
    let ldcm = $('#formControlCulturalGoodLcLdcLdcm').val();
    //Cultural good specific location - specs
    let ldcs = $('#formControlCulturalGoodLcLdcLdcs').val();
    //Cultural good history - initial date
    const dtsi = $('#formControlCulturalGoodDtDtsDtsi').val();
    //Cultural good history - initial date validity
    const dtsv = $('#formControlCulturalGoodDtDtsDtsv').val();
    //Cultural good history - final date
    const dtsf = $('#formControlCulturalGoodDtDtsDtsf').val();
    //Cultural good history - final date validity
    const dtsl = $('#formControlCulturalGoodDtDtsDtsl').val();
    //Cultural good technical data - materia e tecnica
    const mtc = $('#formControlCulturalGoodMtMtc').val();
    //Cultural good data accessibility - access profile
    const adsp = parseInt($('#formControlCulturalGoodAdAdsAdsp').val());

    //Computed from these fields: ldct,ldcq,ldcn,ldcc
    let ldctqnc;
    //Computed from these fields: ldcu,ldcm,ldcs
    let ldcums;
    //Computed from these fields: ldctqnc,ldcums
    let ldc;
    
    //Each cultural good is uniquely identified by nctr||nctn|ncts (the latter one when available)
    let uid;
    if (ncts.length != 0) {
    	uid = nctr + nctn + ncts;
    } else {
    	uid = nctr + nctn;
    }

    /* Based on the uid field a digest is computed to be used as document _id into Elasticsearch
     * It will store the actual fingerprint. */
    let fingerprint;
	  let uidArrayBuffer = new TextEncoder("utf-8").encode(uid);
	  App.subtleCrypto.digest("SHA-256",uidArrayBuffer).then(function (hash) {
	    let hexCodes = [];
		  let view = new DataView(hash);
		  for (let i = 0; i < view.byteLength; i += 4) {
		    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
		    let value = view.getUint32(i);
		    // toString(16) will give the hex representation of the number without padding
		    let stringValue = value.toString(16);
		    // We use concatenation and slice for padding
		    let padding = '00000000';
		    let paddedValue = (padding + stringValue).slice(-padding.length);
		    hexCodes.push(paddedValue);
		  }
		  // Join all the hex strings into one
		  fingerprint = hexCodes.join('');
		  //console.log(fingerprint);

		  App.importKeyAndIV().then( (key) => {
				App.cipherKey = key;
				//console.log(key);
				//console.log('Cipher key has been imported. Now available via: App.cipherKey');

				//Will store encryption operations waiting to be completed (i.e promises awaiting to be resolved)
				let promisesToBeResolved= [];
				//Will store correspondent fields on which encryption operations are being performed
				let fieldsToBeEncrypted = [];

				if (adsp == 3) {

		      if (pvcl.length != 0) {
		      	promisesToBeResolved.push(App.encryptField(pvcl));
		      	fieldsToBeEncrypted.push('pvcl');
		      }

		      if (pvce.length != 0) {
		      	promisesToBeResolved.push(App.encryptField(pvce));
		      	fieldsToBeEncrypted.push('pvce');
		      }
		    }

		    if ((disciplinarySector == 'Beni storici e artistici' && typology == 'Opera e oggetto d\'Arte' && ldcu.length != 0) 
		    		||
		    		(disciplinarySector == 'Beni archeologici' && typology == 'Reperto archeologico' && ldcn.length != 0)) {

          if(ldct.length != 0) {
            ldctqnc = ldct;
          } else {
            ldctqnc = '';
          }

          if(ldcq.length != 0) {
            ldctqnc = ldctqnc + '| ' + ldcq;
          } else {
            ldctqnc = ldctqnc + '| ' + '';
          }

          if(ldcn.length != 0) {
            ldctqnc = ldctqnc + '| ' + ldcn;
          } else {
            ldctqnc = ldctqnc + '| ' + '';
          }

          if(ldcc.length != 0) {
            ldctqnc = ldctqnc + '| ' + ldcc;
          } else {
            ldctqnc = ldctqnc + '| ' + '';
          }

          if(ldcu.length != 0) {
            ldcums = ldcu;
          } else {
            ldcums = '';
          }

          if(ldcm.length != 0) {
            ldcums = ldcums + '| ' + ldcm;
          } else {
            ldcums = ldcums + '| ' + '';
          }

          if(ldcs.length != 0) {
            ldcums = ldcums + '| ' + ldcs;
          } else {
            ldcums = ldcums + '| ' + '';
          }

          if (adsp == 1 || adsp == 3) {

            ldc = ldctqnc + '| ' + ldcums;


            if(adsp == 3) {
              //console.log('adsp: 3 -- ldc: ' + ldc);
              promisesToBeResolved.push(App.encryptField(ldc));
              fieldsToBeEncrypted.push('ldc');
            
            } else {
              //console.log('adsp: 1 -- ldc: ' + ldc);
              App.indexDocumentIntoElasticsearch(imgPath,category,disciplinarySector,typology,nctr,nctn,ncts,atbd,cdgg,ogtd,sgti,des,pvcs,pvcr,pvcp,pvcc,pvcl,pvce,ldc,dtsi,dtsv,dtsf,dtsl,mtc,adsp,fingerprint);

            }
          
          } else if (adsp == 2) {

            ldc = ldctqnc;
            
            console.log('adsp: 2 -- ldc: ' + ldc);
            if (ldcums != ('' + '| ' + '' + '| ' + '')) {
              //console.log('adsp: 2 -- ldcums: ' + ldcums);
              promisesToBeResolved.push(App.encryptField(ldcums));
              fieldsToBeEncrypted.push('ldcums');
              
            } else {
              App.indexDocumentIntoElasticsearch(imgPath,category,disciplinarySector,typology,nctr,nctn,ncts,atbd,cdgg,ogtd,sgti,des,pvcs,pvcr,pvcp,pvcc,pvcl,pvce,ldc,dtsi,dtsv,dtsf,dtsl,mtc,adsp,fingerprint);
            }

		    	}

          if (adsp == 3 || (adsp == 2 && ldcums != ('' + '| ' + '' + '| ' + '') )) {

            Promise.all(promisesToBeResolved).then( (values) => { 

              for(let i = 0; i < fieldsToBeEncrypted.length; i++) {

                switch (fieldsToBeEncrypted[i]) {
                  case 'pvcl':
                    pvcl = values[i];
                    //console.log('pvcl: ' + pvcl);
                    break;
                  case 'pvce':
                    pvce = values[i];
                    //console.log('pvce: ' + pvce);
                    break;
                  case 'ldc':
                    ldc = values[i];
                    //console.log('ldc: ' + ldc);
                    break;
                  case 'ldcums':
                    ldcums = values[i];
                    //console.log('ldcu: ' + ldcu);
                    break;
                  default:
                    break;
                }
              }

              if (adsp == 3) {

                ldc = ' ==== START ENCRYPTED PART ==== , ' + ldc;
                //console.log('adsp: 3 -- ldc: ' + ldc);

                if(pvcl.length != 0) {
                  pvcl = ' ==== START ENCRYPTED PART ==== , ' + pvcl;
                }

                if(pvce.length != 0) {
                  pvce = ' ==== START ENCRYPTED PART ==== , ' + pvce;
                }

              } else {

                ldc = ldc + ' ==== START ENCRYPTED PART ==== , ' + ldcums;
                //console.log('adsp: 2 -- ldc: ' + ldc);

              }

              App.indexDocumentIntoElasticsearch(imgPath,category,disciplinarySector,typology,nctr,nctn,ncts,atbd,cdgg,ogtd,sgti,des,pvcs,pvcr,pvcp,pvcc,pvcl,pvce,ldc,dtsi,dtsv,dtsf,dtsl,mtc,adsp,fingerprint);

            },(reason) => {
              console.error(reason);
            });
          }
		    } else {
          ldc = null;
          //console.log('esploro questo caso');

          if (adsp == 3) {

            Promise.all(promisesToBeResolved).then( (values) => { 

              for(let i = 0; i < fieldsToBeEncrypted.length; i++) {

                switch (fieldsToBeEncrypted[i]) {
                  case 'pvcl':
                    pvcl = values[i];
                    //console.log('pvcl: ' + pvcl);
                    break;
                  case 'pvce':
                    pvce = values[i];
                    //console.log('pvce: ' + pvce);
                    break;
                  default:
                    break;
                }
              }

              if(pvcl.length != 0) {
                pvcl = ' ==== START ENCRYPTED PART ==== , ' + pvcl;
              }

              if(pvce.length != 0) {
                pvce = ' ==== START ENCRYPTED PART ==== , ' + pvce;
              }

              App.indexDocumentIntoElasticsearch(imgPath,category,disciplinarySector,typology,nctr,nctn,ncts,atbd,cdgg,ogtd,sgti,des,pvcs,pvcr,pvcp,pvcc,pvcl,pvce,ldc,dtsi,dtsv,dtsf,dtsl,mtc,adsp,fingerprint);

            },(reason) => {
              console.error(reason);
            });

          } else {
            App.indexDocumentIntoElasticsearch(imgPath,category,disciplinarySector,typology,nctr,nctn,ncts,atbd,cdgg,ogtd,sgti,des,pvcs,pvcr,pvcp,pvcc,pvcl,pvce,ldc,dtsi,dtsv,dtsf,dtsl,mtc,adsp,fingerprint);
          }
        }
	  	}).catch( (error) => {
	  		console.error(error);
	  	});
	  }).catch( (error) => {
	  	console.error(error);
	  });
  },

  goAheadWithSearchResultsParsing: function(culturalGoodTemplate,response,culturalGoodPvcsSearch,culturalGoodPvcrSearch, isLastOne) {

    let culturalGoodRow  = $('#culturalGoodsRow');

    //console.log(response.hits.hits[j]._id);
    culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-id', response._id);

    //console.log(response.hits.hits[j]._source.og.ogt);
    let ogOgt = response._source.og.ogt;

    //console.log(response.hits.hits[j]._source.og.ogt.split(',')[0]);
    culturalGoodTemplate.find('.panel-title').text(ogOgt.split(',')[0]);
    culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-ogt', ogOgt);

    
    if (!('au' in response._source)){
      //console.log(response.hits.hits[j]._source.au.atb);
      culturalGoodTemplate.find('.culturalGoodAuAtbAtbd').text('Non specificato');
      culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-atbd', 'Non specificato');
    }
    else{
      //console.log(response.hits.hits[j]._source.au.atb);
      let auAtbAtbd = response._source.au.atb[0].atbd;
      culturalGoodTemplate.find('.culturalGoodAuAtbAtbd').text(auAtbAtbd);
      culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-atbd', auAtbAtbd);
    }
    

    if (culturalGoodPvcsSearch.toLowerCase() != 'italia') {

      let pvcs = response._source.lc.pvc.pvcs;
      //let pvce = response.hits.hits[j]._source.lc.pvc.pvce;
      //console.log('search results, pvcs: ' + pvcs);
      culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-pvcs', pvcs);

      if (!('pvce' in response._source.lc.pvc)) {
        culturalGoodTemplate.find('.culturalGoodLcPvc').text(pvcs);
        culturalGoodRow.append(culturalGoodTemplate.html());
        $('#loader').hide();
        $('#searchParametersBeingUsed').show();
        $('#hits').show();
        $('#culturalGoodsRow').show();
      } else {

        let pvce = response._source.lc.pvc.pvce;

        if ( pvce.indexOf(' ==== START ENCRYPTED PART ==== , ') == 0) {

          App.decryptField(pvce.split(' ==== START ENCRYPTED PART ==== , ')[1]).then( (decryptedField) => {

            let pvcePlaintext = new TextDecoder("utf-8").decode(decryptedField);
            culturalGoodTemplate.find('.culturalGoodLcPvc').text(pvcs + ' (' + pvcePlaintext + ')');
            culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-pvce', pvcePlaintext);
            
            culturalGoodRow.append(culturalGoodTemplate.html());
            if(isLastOne){
              $('#loader').hide();
              $('#searchParametersBeingUsed').show();
              $('#hits').show();
              $('#culturalGoodsRow').show();
            }
            
          }).catch((error) => {
            console.error(error);
          });
        } else {
          culturalGoodTemplate.find('.culturalGoodLcPvc').text(pvcs + ' (' + pvce + ')');
          culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-pvce', pvce);
          culturalGoodRow.append(culturalGoodTemplate.html());
          if(isLastOne){
            $('#loader').hide();
            $('#searchParametersBeingUsed').show();
            $('#hits').show();
            $('#culturalGoodsRow').show();
          }
        }
      }
    } else {
      let lcPvcPvcp = response._source.lc.pvc.pvcc + ' (' + response._source.lc.pvc.pvcp + ')';
      culturalGoodTemplate.find('.culturalGoodLcPvc').text(lcPvcPvcp);
      culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-pvcr', culturalGoodPvcrSearch);
      culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-pvccp', lcPvcPvcp);

      culturalGoodRow.append(culturalGoodTemplate.html());
      if(isLastOne){
        $('#loader').hide();
        $('#searchParametersBeingUsed').show();
        $('#hits').show();
        $('#culturalGoodsRow').show();
      }
    }
  },

  searchDocuments: function() {

    //Cultural good category
    const culturalGoodCategorySearch = $('#formControlCulturalGoodCategorySearch').val();
    
    //Cultural good disciplinary sector
    const culturalGoodDisciplinarySectorSearch = $('#formControlCulturalGoodDisciplinarySectorSearch').val();
    
    //Cultural good typology
    const culturalGoodTypologySearch = $('#formControlCulturalGoodTypologySearch').val();
    
    //Cultural good location - region
    const culturalGoodPvcsSearch = $('#formControlCulturalGoodLcPvcPvcsSearch').val().charAt(0).toUpperCase() + $('#formControlCulturalGoodLcPvcPvcsSearch').val().slice(1);
    
    //Cultural good location - region
    const culturalGoodPvcrSearch = $('#formControlCulturalGoodLcPvcPvcrSearch').val();
    
    
    let esClient = elasticsearch.Client({ host: App.esHost, log: ['error', 'warning'], apiVersion: '6.3', deadTimeout: 1000, keepAliveFreeSocketTimeout: 3600000});
    //console.log(esClient);

    culturalGoodTypologySearch == 'Opera e oggetto d\'Arte' ? App.elasticIndex = 'oa3_0' : App.elasticIndex = 'ra3_0';

    let searchRequestBodyJSONObject;

    if (culturalGoodPvcsSearch.toLowerCase() == 'italia') {

      searchRequestBodyJSONObject = {
        query: {
          bool: {
            filter: [
              {
                term: {
                  disciplinarySector: culturalGoodDisciplinarySectorSearch
                }
              },
              {
                term: {
                  category: culturalGoodCategorySearch
                }
              },
              {
                term: {
                  typology: culturalGoodTypologySearch
                }
              },
              {
                term: {
                  'lc.pvc.pvcr': culturalGoodPvcrSearch
                }
              }
            ]
          }
        }
      };
    } else {

      searchRequestBodyJSONObject = {
        query: {
          bool: {
            filter: [
              {
                term: {
                  disciplinarySector: culturalGoodDisciplinarySectorSearch
                }
              },
              {
                term: {
                  category: culturalGoodCategorySearch
                }
              },
              {
                term: {
                  typology: culturalGoodTypologySearch
                }
              },
              {
                term: {
                  'lc.pvc.pvcs': culturalGoodPvcsSearch
                }
              }
            ]
          }
        }
      };
    }

    //console.log(searchRequestBodyJSONObject);

    //Search OA3_0/RA3_0 document
    esClient.search({
      index: App.elasticIndex,
      type: App.elasticType,
      size : 1,
      _source: false,
      body: searchRequestBodyJSONObject
    },(err, response) => {

        if (err){
          alert('La connessione ad Elasticsearch ha subito un reset! Effettua nuovamente la ricerca');
          App.renderSearchResults();
          $('#searchForm')[0].reset();  
          $('#searchCulturalGoods').show();
          throw err;
        }

        //console.log(response);

        if(response.hits.total > 0) {

          //console.log(response.hits.total);

          $('#searchCulturalGoods').hide();
          $('#searchParametersBeingUsed').hide();

          $('#loader').show();

          if (culturalGoodPvcsSearch.toLowerCase() == 'italia') {
            $('#searchParametersBeingUsed h4').text(culturalGoodCategorySearch + ' > ' + culturalGoodDisciplinarySectorSearch + ' > ' + culturalGoodTypologySearch + ' > ' + culturalGoodPvcrSearch);
          } else {
            $('#searchParametersBeingUsed h4').text(culturalGoodCategorySearch + ' > ' + culturalGoodDisciplinarySectorSearch + ' > ' + culturalGoodTypologySearch + ' > ' + culturalGoodPvcsSearch);
          }

          //$('#searchParametersBeingUsed').show();
          $('#hits h5').text(response.hits.total + ' schede disponibili');
          //$('#hits').show();
          $("#culturalGoodsRow").empty();
          //Aggiungi reset template
          //$('#culturalGoodsRow').show();

          App.importKeyAndIV().then( (key) => {

            App.cipherKey = key;

            //Implements ES pagination
            let esFrom = 0;
            const esSize = 10;

            const culturalGoodsRowCount = Math.ceil(response.hits.total / esSize);
            //console.log(culturalGoodsRowCount);

            let srcFilter;
            let a = 0;
            for (let i = 0; i < culturalGoodsRowCount; i++) {
              
              if (culturalGoodPvcsSearch.toLowerCase() == 'italia') {
                srcFilter = [
                          'og.ogt',
                          'au.atb.atbd',
                          'lc.pvc.pvcr',
                          'lc.pvc.pvcc',
                          'lc.pvc.pvcp',
                          'img_ipfs_hash',
                          'img_extension'
                ]
              } else {
                srcFilter = [
                          'og.ogt',
                          'au.atb.atbd',
                          'lc.pvc.pvcs',
                          'lc.pvc.pvce',
                          'img_ipfs_hash',
                          'img_extension'
                ]
              }
              esClient.search({
                index: App.elasticIndex,
                type: App.elasticType,
                _source: srcFilter,
                from: esFrom,
                size : esSize,
                body: searchRequestBodyJSONObject
              },(err, response) => {
                
                if (err){
                  alert('La connessione ad Elasticsearch ha subito un reset! Effettua nuovamente la ricerca');
                  App.renderSearchResults();
                  $('#loader').hide();
                  $('#searchForm')[0].reset();  
                  $('#searchCulturalGoods').show();
                  throw err;
                }

                //console.log('========= ROW ' + i + ' =========\n' + response);

                let culturalGoodRow  = $('#culturalGoodsRow');
                let culturalGoodTemplate = $('#culturalGoodTemplate');

                for (let j = 0; j < response.hits.hits.length; j++) {
                  //a++;
                  //console.log('a:'+a);

                  $("#culturalGoodTemplate").replaceWith(App.culturalGoodTemplateClone.clone());

                  culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-category', culturalGoodCategorySearch);
                  culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-typology', culturalGoodTypologySearch);
                  culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-discsector', culturalGoodDisciplinarySectorSearch);

                  if ('img_ipfs_hash' in response.hits.hits[j]._source) {

                    ipfs.files.cat(response.hits.hits[j]._source.img_ipfs_hash,(err, culturalGoodImage) => {

                      if (err || !culturalGoodImage) {
                        console.error('Ipfs error: ' + err);
                        alert('Errore durante il recupero dell\'immagine da IPFS. Apri la console per informazioni dettagliate.');
                        culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-imgsrc', null);
                      } else{

                        let img = culturalGoodImage.toString('base64');
                        let imgSrc = 'data:image/' + response.hits.hits[j]._source.img_extension + ';base64,' + img;
                        culturalGoodTemplate.find('img').attr('src', imgSrc);
                        culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-imgsrc', imgSrc);
                      }
                      if ( (i == culturalGoodsRowCount - 1) && j == (response.hits.hits.length-1)){
                        App.goAheadWithSearchResultsParsing(culturalGoodTemplate, response.hits.hits[j],culturalGoodPvcsSearch, culturalGoodPvcrSearch, true);
                      }
                      else{
                        App.goAheadWithSearchResultsParsing(culturalGoodTemplate, response.hits.hits[j],culturalGoodPvcsSearch, culturalGoodPvcrSearch, false);
                      }
                    });  
                  }
                  else {
                    culturalGoodTemplate.find('.btn-showCulturalGoodDetails').attr('data-imgsrc', null);
                    if ( (i == culturalGoodsRowCount - 1) && j == (response.hits.hits.length-1))
                      App.goAheadWithSearchResultsParsing(culturalGoodTemplate, response.hits.hits[j],culturalGoodPvcsSearch, culturalGoodPvcrSearch,true);
                    else
                      App.goAheadWithSearchResultsParsing(culturalGoodTemplate, response.hits.hits[j],culturalGoodPvcsSearch, culturalGoodPvcrSearch,false);
                  } 
                }
              });
              esFrom += esSize;
              //console.log(esFrom);
            }     
          });  
        } else {

          alert('Non sono presenti schede di catalogo! Prova ad impostare altri parametri di ricerca.');

          if( $('#searchParametersBeingUsed').is(":visible") ){
            App.renderSearchResults();
            $('#searchForm')[0].reset();  
            $('#searchCulturalGoods').show();
          }

        }    
    });

  },

  finalizeRemoveOperation: function(documentId,documentTypology) {

    let deleteRequestBodyJSONObject = {id_to_delete: documentId};

    let stringifiedJSONDocument = JSON.stringify(deleteRequestBodyJSONObject);    

    ipfs.files.add(ipfs.Buffer.from(stringifiedJSONDocument),(err,res) => {

      if (err || !res) {
        console.error('Ipfs error: ' + err);
        alert('Errore durante l\'aggiunta dell\'operazione di delete in corso in IPFS. Apri la console per informazioni dettagliate.');
        return;
      }

      //retrieve IPFS CID (v0 as of October,2018) 
      let documentCID = res[0].hash;
      //console.log('Document CIDv0: ' + documentCID);

      /* Converts from base58 to multihash format.
       * Returns a Buffer */
      let multihash = multihashes.fromB58String(documentCID);

      /* Converts a type Buffer multihash to a type String multihash */
      let hexString = multihashes.toHexString(multihash);

      /* The first two bytes of a multihash are (always):fn code and length. 
       * (As of October, 2018) IPFS make use of CIDv0 (SHA2-256).
       * fn code is: 0x12 and length is: 0x20. We can get rid of these. 
       * When a restore operation has to be perfomed a correct multihash 
       * has to be reconstructed (by adding again fn code and length) */

      let parsedRestoreDocumentCID = '0x' + hexString.slice(4);
      //console.log('\nIPFS CIDv0 : ' + restoreJSONFileCID);
      //console.log('\nParsed Base16 equivalent: ' + hexString +'\n');

      //console.log('Parsed Document CIDv0: ' + parsedRestoreDocumentCID);

      App.interactWithTheSmartContract(parsedRestoreDocumentCID,documentTypology,App.deleteOperation);


    });
  },

  removeCulturalGood: function() {

    let documentId = $(event.target).data('id');
    let documentTypology = $(event.target).data('documenttypology');

    documentTypology == 'Opera e oggetto d\'Arte' ? documentTypology = App.lookupTable['operaEOggettoDArte'] : documentTypology = App.lookupTable['repertoArcheologico'];


    if(confirm("Eliminare la scheda definitivamente?")) {

      window.ethereum.enable().then( (success) => {

        let esClient = elasticsearch.Client({ host: App.esHost, log: ['error', 'warning'], apiVersion: '6.3', deadTimeout: 1000, keepAliveFreeSocketTimeout: 3600000});
        //console.log(esClient);

        esClient.delete({
          index: App.elasticIndex,
          type: App.elasticType,
          id: documentId
        }, (err, response) => {

          if (err){
            alert('La connessione ad Elasticsearch ha subito un reset! Riprova');
            App.renderCulturalGoodSuccessOperation();
            throw err;
          }

          console.log('Document with _id: ' + documentId + ' has been successfully deleted!');
          //alert('Scheda eliminata correttamente!');

          App.finalizeRemoveOperation(documentId, documentTypology);

        });  
      }).catch( (error) => {
        alert('Transazione non eseguita!\n\nQuando richiesto, concedi i permessi per accedere ai tuoi accounts.');
        console.error(error);
      });
    }

  },

  editCulturalGoodDetails: function() {

    //$(event.currentTarget) represents the DOM element that initiated the event
    let editingDocCategory = $(event.target).data('category');
    let editingDocTypology = $(event.target).data('typology');
    let editingDocDisciplinarySector = $(event.target).data('discsector');
    let editingDocObjectDescription = $(event.target).data('ogt');
    let editingDocCulturalContext = $(event.target).data('atbd');

    //WHEN NULL IT MEANS italia
    let editingDocPvcs = $(event.target).data('pvcs');
    let editingDocPvcr = $(event.target).data('pvcr');

    //NULL WHEN PVCS IS NULL, IE. PVCS = ITALIA
    let editingDocPvce = $(event.target).data('pvce');

    let editingDocPvccp = $(event.target).data('pvccp');

    //MAY BE NULL
    let editingDocPvcl = $(event.target).data('pvcl');

    let editingDocCdgg = $(event.target).data('cdgg');
    let editingDocSgti = $(event.target).data('sgti');
    let editingDocDescr = $(event.target).data('descr');
    let editingDocLdc = $(event.target).data('ldc');

    //MAY BE NULL
    let editingDocDtsi = $(event.target).data('dtsi');
    let editingDocDtsv = $(event.target).data('dtsv');
    let editingDocDtsf = $(event.target).data('dtsf');
    let editingDocDtsl = $(event.target).data('dtsl');


    let editingDocMtc = $(event.target).data('mtc');
    let editingDocAdsp = $(event.target).data('adsp');
    //console.log('editingDocAdsp: ' + editingDocAdsp);
    let editingDocNctr = $(event.target).data('nctr');
    let editingDocNctn = $(event.target).data('nctn');

    //MAY BE NULL
    let editingDocNcts = $(event.target).data('ncts');


    $('#searchParametersBeingUsed').hide();
    $('#iccdCode').hide();
    $('#culturalGoodDetailsContainer').hide();
    $('.nav-tabs a[href="#insertNewCulturalGood"]').tab('show');

    
    //console.log(event);
    //console.log(event.target);
    //console.log($(event.target).data('ncts'));

    if(editingDocNcts.length != 0)
      $('#insertNewCulturalGood h3').text('Modifica Scheda Di Catalogo: ' + editingDocNctr + ' ' + editingDocNctn + ' ' + editingDocNcts);
    else
      $('#insertNewCulturalGood h3').text('Modifica Scheda Di Catalogo: ' + editingDocNctr + ' ' + editingDocNctn);
    

    $('#formControlCulturalGoodCategoryInsert').val(editingDocCategory);
    $('#formControlCulturalGoodDisciplinarySectorInsert').val(editingDocDisciplinarySector);
    $('#formControlCulturalGoodTypologyInsert').val(editingDocTypology);

    $('#formControlCulturalGoodCdNctNctr').val(editingDocNctr);
    $('#formControlCulturalGoodCdNctNctn').val(editingDocNctn);
    if(editingDocNcts.length != 0)
      $('#formControlCulturalGoodCdNctNcts').val(editingDocNcts);

    if(editingDocCulturalContext != 'Non specificato')
      $('#formControlCulturalGoodAuAtbAtbd').val(editingDocCulturalContext);

    $('#formControlCulturalGoodTuCdgCdgg').val(editingDocCdgg);

    $('#formControlCulturalGoodOgOgtOgtd').val(editingDocObjectDescription);

    if(editingDocSgti.length != 'Non specificato')
      $('#formControlCulturalGoodOgSgtSgti').val(editingDocSgti);

    $('#formControlCulturalGoodDaDes').val(editingDocDescr);

    if(editingDocPvcs.length == 0){
      $('#formControlCulturalGoodLcPvcPvcs').val('Italia');
      $('#formControlCulturalGoodLcPvcPvcr').val(editingDocPvcr);
      $('#formControlCulturalGoodLcPvcPvcp').val(editingDocPvccp.split(" ")[1].replace('(','').replace(')',''));
      $('#formControlCulturalGoodLcPvcPvcc').val(editingDocPvccp.split(" ")[0]);
      if(editingDocPvcl.length != 0)
        $('#formControlCulturalGoodLcPvcPvcl').val(editingDocPvcl);
    }
    else{
      $('#formControlCulturalGoodLcPvcPvcs').val(editingDocPvcs);
      if(editingDocPvce.length != 0)
        $('#formControlCulturalGoodLcPvcPvce').val(editingDocPvce);
    }

    if(editingDocLdc.length != 0) {
      //console.log(editingDocLdc.split('| '));
      if(editingDocLdc.split('| ').length == 7) {
        $('#formControlCulturalGoodLcLdcLdct').val(editingDocLdc.split('| ')[0]);
        $('#formControlCulturalGoodLcLdcLdcq').val(editingDocLdc.split('| ')[1]);
        $('#formControlCulturalGoodLcLdcLdcn').val(editingDocLdc.split('| ')[2]);
        $('#formControlCulturalGoodLcLdcLdcc').val(editingDocLdc.split('| ')[3]);
        $('#formControlCulturalGoodLcLdcLdcu').val(editingDocLdc.split('| ')[4]);
        $('#formControlCulturalGoodLcLdcLdcm').val(editingDocLdc.split('| ')[5]);
        $('#formControlCulturalGoodLcLdcLdcs').val(editingDocLdc.split('| ')[6]);
      }
    }

    if(editingDocDtsi.length != 0) {
      $('#formControlCulturalGoodDtDtsDtsi').val(editingDocDtsi);
      if(editingDocDtsv.length != 0)
        $('#formControlCulturalGoodDtDtsDtsv').val(editingDocDtsv);
      $('#formControlCulturalGoodDtDtsDtsf').val(editingDocDtsf);
      if(editingDocDtsl.length != 0)
        $('#formControlCulturalGoodDtDtsDtsl').val(editingDocDtsl);
    }

    $('#formControlCulturalGoodMtMtc').val(editingDocMtc);

    if(editingDocAdsp.length != 0)
      $('#formControlCulturalGoodAdAdsAdsp').val(editingDocAdsp);
    
  },

  parseCulturalGoodLocation: function(location) {

    let ldcPlainextParsed = location.split('| '); //ldcPlaintext.replace(/\|\s/g, '; ');
    let ldcPlainextParsedString = '';

    for(let z = 0; z < ldcPlainextParsed.length; z++){

      if( ldcPlainextParsed[z] != ''){
        if(ldcPlainextParsedString != '')
          ldcPlainextParsedString += '; ' + ldcPlainextParsed[z];
        else
          ldcPlainextParsedString += ldcPlainextParsed[z];
      }
    }
    return ldcPlainextParsedString;
  },

  buildDatazioneCulturalGoodDetailsContainerField: function(dtzg, dtsi, dtsv, dtsf, dtsl, dtm) {

  	if(dtzg != undefined) {

  		if(dtsi != undefined) {

		    if(dtsv != undefined && dtsl != undefined) {

		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtsl + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtsl);
		      }
		    }else if (dtsv == undefined && dtsl == undefined) {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' - ' + dtsf + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' - ' + dtsf);
		      }
		    } else if(dtsv != undefined) {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' ' + dtsv + ' - ' + dtsf);
		      }
		    } else {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' - ' + dtsf + ' ' + dtsl + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' - ' + dtsi + ' - ' + dtsf + ' ' + dtsl);
		      }      
		    }
		  } else {

		    if(dtm != undefined) {
		      $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg + ' ' + dtm);
		    } else {
		      $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtzg);
		    }
		  }
		} else {

			if(dtsi != undefined) {

		    if(dtsv != undefined && dtsl != undefined) {

		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtsl + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtsl);
		      }
		    } else if (dtsv == undefined && dtsl == undefined) {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' - ' + dtsf + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' - ' + dtsf);
		      }
		    } else if(dtsv != undefined) {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' ' + dtsv + ' - ' + dtsf + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' ' + dtsv + ' - ' + dtsf);
		      }
		    } else {
		      if(dtm != undefined) {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' - ' + dtsf + ' ' + dtsl + ' ' + dtm);
		      } else {
		        $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtsi + ' - ' + dtsf + ' ' + dtsl);
		      }      
		    }
		  } else {

		    if(dtm != undefined) {
		      $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text(dtm);
		    } else {
		      $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text('Non specificato');
		    }
		  }
		}
  },

  showCulturalGoodDetails: function(event) {
    
    //$(event.currentTarget) represents the DOM element that initiated the event
    let documentId = $(event.currentTarget).data('id');
    let documentCategory = $(event.currentTarget).data('category');
    let documentTypology = $(event.currentTarget).data('typology');
    let documentDisciplinarySector = $(event.currentTarget).data('discsector');
    let objectDescription = $(event.currentTarget).data('ogt');
    let imgSource = $(event.currentTarget).data('imgsrc');
    let culturalContext = $(event.currentTarget).data('atbd');
    let pvcs = $(event.currentTarget).data('pvcs');
    //console.log(event);
    //console.log(event.currentTarget);
    //console.log($(event.currentTarget).data('pvcs'));
    let pvcr = $(event.currentTarget).data('pvcr');
    let pvce = $(event.currentTarget).data('pvce');
    let pvccp = $(event.currentTarget).data('pvccp');


    //$('#searchParametersBeingUsed').hide();
    $('#hits').hide();
    $('#culturalGoodsRow').hide();

    $('#loader').show();

    $("#culturalGoodDetailsContainer").replaceWith(App.culturalGoodDetailsContainerClone.clone());

    //App.renderSearchResults();
    let searchRequestBodyJSONObjectCulturalGoodDetails = { query: { term: { _id: documentId } } };

    let esClient = elasticsearch.Client({ host: App.esHost, log: ['error', 'warning'], apiVersion: '6.3', deadTimeout: 1000, keepAliveFreeSocketTimeout: 3600000});
    //console.log(esClient);

    let sourceFieldsToRetrieve;

    if(documentTypology == 'Reperto archeologico') {

      $('#auAtbAtbd').hide();

      sourceFieldsToRetrieve = [
              'ad.ads.adsp',
              'cd.nct.nctr',
              'cd.nct.nctn',
              'cd.nct.ncts',
              'og.sgt.sgti',
              'og.cls',
              'tu.cdg.cdgg',
              'da.des',
              'lc.ldc',
              'dt.dtz.dtzg',
              'dt.dtm',
              'dt.dts.dtsi',
              'dt.dts.dtsv',
              'dt.dts.dtsf',
              'dt.dts.dtsl',
              'mt.mtc' ];
    } else {

      $('#ogCls').hide();

      sourceFieldsToRetrieve = [
              'ad.ads.adsp',
              'cd.nct.nctr',
              'cd.nct.nctn',
              'cd.nct.ncts',
              'og.sgt.sgti',
              'tu.cdg.cdgg',
              'da.des',
              'lc.ldc',
              'dt.dtm',
              'dt.dts.dtsi',
              'dt.dts.dtsv',
              'dt.dts.dtsf',
              'dt.dts.dtsl',
              'mt.mtc' ];
    }
    

    if(pvcs.length == 0) {
      //pvcs not specified, it means pvc = Italia
      sourceFieldsToRetrieve.push('lc.pvc.pvcl');
    }

    //Search cultural good with that specific id.
    esClient.search({
      index: App.elasticIndex,
      type: App.elasticType,
      _source: sourceFieldsToRetrieve,
      body: searchRequestBodyJSONObjectCulturalGoodDetails
    },(err, response) => {

        if (err){
          alert('La connessione ad Elasticsearch ha subito un reset! Effettua nuovamente la ricerca');
          App.renderCulturalGoodDetails();
          throw err;
        }

        //console.log(response.hits.hits[0]._source);

        $("#culturalGoodDetailsContainer").find('.btn-removeCulturalGood').attr('data-id', documentId);

        $("#culturalGoodDetailsContainer").find('.btn-removeCulturalGood').attr('data-documenttypology', documentTypology);

        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-category', documentCategory);
        
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-discsector', documentDisciplinarySector);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-typology', documentTypology);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-ogt', objectDescription);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-atbd', culturalContext);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvcs', pvcs);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvcr', pvcr);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvccp', pvccp);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvce', pvce);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-nctr', response.hits.hits[0]._source.cd.nct.nctr);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-nctn', response.hits.hits[0]._source.cd.nct.nctn);

        if('ncts' in response.hits.hits[0]._source.cd.nct) {
          $('#iccdCode h4').text('Codice ICCD: ' + response.hits.hits[0]._source.cd.nct.nctr + ' ' + response.hits.hits[0]._source.cd.nct.nctn + ' ' + response.hits.hits[0]._source.cd.nct.ncts);
          $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-ncts', response.hits.hits[0]._source.cd.nct.ncts);
        } else {
          $('#iccdCode h4').text('Codice ICCD: ' + response.hits.hits[0]._source.cd.nct.nctr + ' ' + response.hits.hits[0]._source.cd.nct.nctn);
        } 

        $('#culturalGoodDetailsContainer').find('.panel-title').text(objectDescription);

        if(imgSource != null) {
          $('#culturalGoodDetailsContainer').find('img').attr('src', imgSource);
        }

        $('#culturalGoodDetailsContainer').find('.culturalGoodAuAtbAtbdDetails').text(culturalContext);
  
        $('#culturalGoodDetailsContainer').find('.culturalGoodTuCdgCdggDetails').text(response.hits.hits[0]._source.tu.cdg.cdgg);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-cdgg', response.hits.hits[0]._source.tu.cdg.cdgg);

        if (!('og' in response.hits.hits[0]._source)){
          $('#culturalGoodDetailsContainer').find('.culturalGoodOgSgtSgtiDetails').text('Non specificato');
          if(documentTypology == 'Reperto archeologico') {
            $('#culturalGoodDetailsContainer').find('.culturalGoodOgClsDetails').text('Non specificato');
          }
        } else {

          if('sgt' in response.hits.hits[0]._source.og) {
            if(response.hits.hits[0]._source.og.sgt.sgti.length != 0){
              $('#culturalGoodDetailsContainer').find('.culturalGoodOgSgtSgtiDetails').text(response.hits.hits[0]._source.og.sgt.sgti);
              $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-sgti', response.hits.hits[0]._source.og.sgt.sgti);
            } else {
              $('#culturalGoodDetailsContainer').find('.culturalGoodOgSgtSgtiDetails').text('Non specificato');
            }
          }
          if(documentTypology == 'Reperto archeologico') {
            if('cls' in response.hits.hits[0]._source.og) {
              $('#culturalGoodDetailsContainer').find('.culturalGoodOgClsDetails').text(response.hits.hits[0]._source.og.cls);
            } else {
              $('#culturalGoodDetailsContainer').find('.culturalGoodOgClsDetails').text('Non specificato');
            }
          }
        }

        $('#culturalGoodDetailsContainer').find('.culturalGoodDaDesDetails').text(response.hits.hits[0]._source.da.des);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-descr', response.hits.hits[0]._source.da.des);

        if(pvcs.length == 0) {
          if (!('lc' in response.hits.hits[0]._source)) {
            $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcr + ', ' + pvccp);
          } else if ('pvc' in response.hits.hits[0]._source.lc) {
            let pvcl = response.hits.hits[0]._source.lc.pvc.pvcl;

            if ( pvcl.indexOf(' ==== START ENCRYPTED PART ==== , ') == 0) {
              App.decryptField(pvcl.split(' ==== START ENCRYPTED PART ==== , ')[1]).then( (decryptedField) => {

                let pvclPlaintext = new TextDecoder("utf-8").decode(decryptedField);
                $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcr + ', ' + pvccp + ', ' + pvclPlaintext);
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvcl', pvclPlaintext);
                
              }).catch((error) => {
                console.error(error);
              });
            } else {
              if(pvcl.length != 0){
                $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcr + ', ' + pvccp + ', ' + pvcl);
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-pvcl', pvcl);
              }
              else
                $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcr + ', ' + pvccp);
            }
          }else {
            $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcr + ', ' + pvccp);
          }
        }else {
          if(pvce.length != 0)
            $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcs + ', ' + pvce);
          else
            $('#culturalGoodDetailsContainer').find('.culturalGoodLcPvcDetails').text(pvcs);
          
        }

        if (!('lc' in response.hits.hits[0]._source)) {
          $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text('Non specificato');
        } else if ('ldc' in response.hits.hits[0]._source.lc) {
          let ldc = response.hits.hits[0]._source.lc.ldc;

          if (ldc.indexOf(' ==== START ENCRYPTED PART ==== , ') != -1) {

            App.decryptField(ldc.split(' ==== START ENCRYPTED PART ==== , ')[1]).then( (decryptedField) => {

              let ldcPlaintext = new TextDecoder("utf-8").decode(decryptedField);

            
              if ( ldc.indexOf(' ==== START ENCRYPTED PART ==== , ') == 0){
                $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text(App.parseCulturalGoodLocation(ldcPlaintext)); 
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-ldc', ldcPlaintext);
              }
              else{
                let culturalGoodLocation = ldc.split(' ==== START ENCRYPTED PART ==== , ')[0] + '| ' + ldcPlaintext;
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-ldc', culturalGoodLocation);
                $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text(App.parseCulturalGoodLocation(culturalGoodLocation));
              }
              
            }).catch((error) => {
              console.error(error);
            });

          } else {
            if(ldc.length != 0){
              $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text(App.parseCulturalGoodLocation(ldc));
              $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-ldc', ldc);
            }
            else
              $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text('Non specificato');
          }
        } else {
          $('#culturalGoodDetailsContainer').find('.culturalGoodLcLdcDetails').text('Non specificato');
        }

        if (!('dt' in response.hits.hits[0]._source)) {
          $('#culturalGoodDetailsContainer').find('.culturalGoodDtDtDetails').text('Non specificato');
        }
        else{
          
          let dtsi;
          let dtsf;
          let dtsv;
          let dtsl;

          if('dts' in response.hits.hits[0]._source.dt) {

            dtsi = response.hits.hits[0]._source.dt.dts.dtsi;
            $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-dtsi', dtsi);

            dtsf = response.hits.hits[0]._source.dt.dts.dtsf;
            $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-dtsf', dtsf);


            if('dtsv' in response.hits.hits[0]._source.dt.dts){
              if(response.hits.hits[0]._source.dt.dts.dtsv.length != 0){
                dtsv = response.hits.hits[0]._source.dt.dts.dtsv;
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-dtsv', dtsv);
              }
            }

            if('dtsl' in response.hits.hits[0]._source.dt.dts){
              if(response.hits.hits[0]._source.dt.dts.dtsl.length != 0){
                dtsl = response.hits.hits[0]._source.dt.dts.dtsl;
                $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-dtsl', dtsl);
              }
            }

          }

          let dtzg;
          let dtm;

          if('dtz' in response.hits.hits[0]._source.dt){
            if(response.hits.hits[0]._source.dt.dtz.dtzg.length != 0){
              dtzg = response.hits.hits[0]._source.dt.dtz.dtzg;
            }
          }

          if('dtm' in response.hits.hits[0]._source.dt){
            if(response.hits.hits[0]._source.dt.dtm.length != 0){
              dtm = response.hits.hits[0]._source.dt.dtm;
              //alert('dtm: ' + dtm);
            }
          }

          if(dtzg != undefined) {
          	App.buildDatazioneCulturalGoodDetailsContainerField(dtzg, dtsi, dtsv, dtsf, dtsl, dtm);
          } else {
          	App.buildDatazioneCulturalGoodDetailsContainerField(null, dtsi, dtsv, dtsf, dtsl, dtm);
          }

          
        }

        $('#culturalGoodDetailsContainer').find('.culturalGoodMtMtcDetails').text(response.hits.hits[0]._source.mt.mtc);
        $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-mtc', response.hits.hits[0]._source.mt.mtc);

        if ('ad' in response.hits.hits[0]._source){
          $("#culturalGoodDetailsContainer").find('.btn-editCulturalGoodDetails').attr('data-adsp', response.hits.hits[0]._source.ad.ads.adsp);
          //console.log('adsp: ' + response.hits.hits[0]._source.ad.ads.adsp);
        }

        $('#loader').hide();
        $('#iccdCode').show();
        $('#culturalGoodDetailsContainer').show();

    });
    
  },

  renderCulturalGoodSuccessOperation: function() {

    $('#iccdCode').hide();
    $('#culturalGoodDetailsContainer').hide();
    $("#culturalGoodDetailsContainer").replaceWith(App.culturalGoodDetailsContainerClone.clone());
    App.searchDocuments();
  },

  renderCulturalGoodDetails: function() {

    $('#iccdCode').hide();
    $('#culturalGoodDetailsContainer').hide();
    $('#hits').show();
    $('#culturalGoodsRow').show();
    
  },

  renderSearchResults: function() {

    $('#searchParametersBeingUsed').hide();
    $('#hits').hide();
    $('#culturalGoodsRow').hide();
    $("#culturalGoodsRow").empty();
    $("#culturalGoodTemplate").replaceWith(App.culturalGoodTemplateClone.clone());
  }

};

$(function() {
  $(window).load(function() {

    App.culturalGoodTemplateClone = $("#culturalGoodTemplate").clone();

    App.culturalGoodDetailsContainerClone = $("#culturalGoodDetailsContainer").clone();


    $('.nav-tabs a[href="#insertNewCulturalGood"]').on('hidden.bs.tab', function(event) {

      $('#insertionForm')[0].reset();
      $('#insertionForm').validate().resetForm(); 
    });

    $('.nav-tabs a[href="#searchCulturalGoods"]').on('hidden.bs.tab', function(event) {

      if( $('#hits').is(":visible") ) {
        App.renderSearchResults();
        $('#searchForm')[0].reset();  
      } else if ($('#culturalGoodDetailsContainer').is(":visible") ){
        $('#iccdCode').hide();
        $('#culturalGoodDetailsContainer').hide();
        App.renderSearchResults();
        $('#searchForm')[0].reset(); 
      } else {
        //$('#searchForm')[0].reset(); 
        $('#searchCulturalGoods').hide();
      }

    });

    $('.nav-tabs a[href="#searchCulturalGoods"]').on('show.bs.tab', function(event) {

      if($(event.relatedTarget).text() == 'Nuova Scheda') {

        if( $('#insertNewCulturalGood h3').text().indexOf('Modifica Scheda Di Catalogo') != -1 ){
          $('#insertNewCulturalGood h3').text('Nuova Scheda Di Catalogo');
          $('#searchParametersBeingUsed').show();
          $('#iccdCode').show();
          $('#culturalGoodDetailsContainer').show();
        } else {
          if($('#culturalGoodDetailsContainer').is(":visible")){
            $('#iccdCode').hide();
            $('#culturalGoodDetailsContainer').hide();
            App.renderSearchResults();
            $('#searchCulturalGoods').show();
          } else {
            $('#searchForm')[0].reset(); 
            $('#searchCulturalGoods').show();
          }
        }
      }
      else if( $('#searchCulturalGoods').is(":hidden") ) {
        $('#searchForm')[0].reset(); 
        $('#searchCulturalGoods').show();
      }

    });

    //Global App object to manage the dapp client business logic
    App.init();

  });
});