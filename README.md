# A decentralized Ethereum application for the safeguarding of the cultural heritage.

To get the project up and running follow these steps:

## Dependencies
The followings are required:
- Docker(for Windows): https://docs.docker.com/docker-for-windows/install/
- Docker (for Mac): https://docs.docker.com/docker-for-mac/install/
- Metamask: https://metamask.io/

## GET OA/RA IMGS
Images are no more available in the ICCD open data after the ICCD old website shutdown (end of October, 2018). 
You can download from here:
- OA_IMGS: https://drive.google.com/open?id=1l_-_r4Q2yGMnhGT3Oqxzq6_3nua4Wd_L
- RA_IMGS: https://drive.google.com/open?id=1e1IQJe9NXR12HtMSvxQ7zHwK5jVUxHUs 

## Step 1. Clone the project
`git clone https://github.com/marianobasile/CulturalGood`

## Step 2. Setup DEV-ENV
```
$ cd CulturalGood/dev-env
$ ./setup_dev-env.sh
```
At this point a DEV-ENV folder should be available under the home directory.

## Step 3. Start Docker daemon
Start Docker

## Step 4. Start openiccd_oa_migration
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up openiccd_oa_migration
```

## Step 5. Start openiccd_ra_migration
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up openiccd_ra_migration
```

## Step 6. Start Kibana
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up kibana
```
- Open Kibana UI: http://localhost:5601 
- Go under Dev Tools and copy the following:

GET oa3_0/_search?pretty
{
  "query": {
    "match_all": {}
  }
}

GET ra3_0/_search?pretty
{
  "query": {
    "match_all": {}
  }
}

If you get,respectively, 100 hits and 77 hits data migration has completed successfully.


## Step 7. Stop openiccd_oa_migration and openiccd_ra_migration
After all records have been migrated, open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose stop openiccd_oa_migration openiccd_ra_migration
```

## Step 8. Start ipfs_peer1
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up ipfs_peer1
```

## Step 9. Enable CORS on ipfs_peer1
Open a new terminal and type:
```
$ cd DEV-ENV
$ ./init_ipfs_peer.sh
```

## Step 10. Start ganache_cli
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up ganache_cli
```

## Step 11. Start cultural_good
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up cultural_good
```

## Step 12. Attach to cultural_good_app container
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker attach cultural_good_app
```

## Step 13. Finalize data migration, compile and deploy smart contract
Once done, type:
```
$ cd cultural-good
$ ./utils/init_dapp.sh
```

## Step 14. Setup metamask and import accounts
- Setup metamask.
- Import accounts exposed by ganache_cli.
- Switch to localhost 8545.

## Step 15. Launch lite-server
Use the cultural_good_app container terminal to launch lite-server for serving the client-side of the Dapp:
```
$ npm run dev
```

## Restore Elasticsearch indices
In the cultural_good_app container terminal type:
```
$ cd cultural-good
$ truffle exec ./utils/restoreDbViaBlockchain.js
```

According to the Elasticsearch index previously specified, open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up openiccd_oa_restore
```
or
```
$ cd DEV-ENV
$ docker-compose up openiccd_ra_restore
```
or both in two different terminals.


