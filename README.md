# A blockchain-based approach for digital archives:  a decentralized Ethereum application for the safeguarding of the cultural heritage.

To get the project up and running follow these steps:

## Step 1. Clone the project
`git clone https://github.com/marianobasile/CulturalGood`

## Step 2. Setup DEV-ENV
```
$ cd CulturalGood/dev-env
$ ./setup_dev-env.sh
```
At this point a DEV-ENV folder should be available under the home directory.

## Step 3. Start openiccd_oa_migration
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up openiccd_oa_migration
```

## Step 4. Start openiccd_ra_migration
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up openiccd_ra_migration
```

## Step 5. Start Kibana
Open a new terminal and type:
```
$ docker-compose up kibana
```
Kibana will be available at: http://localhost:5601


## Step 6. Stop openiccd_oa_migration and openiccd_ra_migration
After all records have been migrated, open a new terminal and type:
```
$ docker-compose stop openiccd_oa_migration openiccd_ra_migration
```

## Step 7. Start ipfs_peer1
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up ipfs_peer1
$ docker-compose stop openiccd_oa_migration openiccd_ra_migration
```

## Step 8. Enable CORS on ipfs_peer1
Open a new terminal and type:
```
$ cd DEV-ENV
$ ./init_ipfs_peer.sh
```

## Step 9. Start ganache_cli
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up ganache_cli
```

## Step 10. Start cultural_good
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker-compose up cultural_good
```

## Step 11. Attach to cultural_good_app container & init Dapp
Open a new terminal and type:
```
$ cd DEV-ENV
$ docker attach cultural_good_app
```

Once done, type:
```
$ cd cultural-good
$ ./utils/init_dapp.sh
```

## Step 12. Setup metamask and import accounts
Setup metamask and then import accounts exposed by ganache_cli

## Step 13. Launch lite-server
Use cultural_good_app container terminal to launch lite-server for serving web-pages:
```
$ npm run dev
```