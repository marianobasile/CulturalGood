#!/bin/bash

echo -e "\nRunning setup script.."
DATA_DIR="data"
CONF_DIR="conf"
STAGING_DIR="staging"
TRUFFLE_BOX="pet-shop"
TRUFFLE_APP="cultural-good"
DEV_ENV_FOLDER=~/DEV-ENV
if [ -d "$DEV_ENV_FOLDER" ]; then
	if [ -L "$DEV_ENV_FOLDER" ]; then
		echo -e "A symlink DEV-ENV already exists in your home directory! Exiting..\n"
		exit 0
	else
		echo "A DEV-ENV folder already exists in your home directory! Do you want to remove it? [y/n]"
		read response
		while [ -z "$response" ]; do
			echo "You haven't pressed any key! Press y to remove, n to abort.."
			read response	
		done
		while [ "$response" != "y" ] && [ "$response" != "n" ]; do
			echo "Invalid typing! Press y to remove, n to abort.."
			read response
		done
		if [ "$response" == "y" ];then
			rm -rf $DEV_ENV_FOLDER
			echo  "Removed!"
		else
			echo -e "Exiting..\n"
			exit 0	
		fi
	fi
fi
	echo -e "\nCreating DEV-ENVIRONMENT inside the home directory.."
	mkdir $DEV_ENV_FOLDER
	#ENV_FOLDERS=("ipfs-peer1" "ipfs-peer2" "elasticsearch" "truffle" "logstash")
	ENV_FOLDERS=("ipfs-peer1" "elasticsearch" "ganache-cli" "truffle" "logstash")
	for FOLDER in ${ENV_FOLDERS[*]}
	do
		mkdir $DEV_ENV_FOLDER/$FOLDER
		case $FOLDER in
			#"ipfs-peer1"|"ipfs-peer2")
			"ipfs-peer1")
				# Directory to stage files for command line usage (ipfs add)
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$STAGING_DIR

				# Directory to store the IPFS local repo 
				# repo is the storage repository that stores: keys, config, datastore, logs
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$DATA_DIR

				rsync  ./ipfs-peer1/init_ipfs_peer.sh $DEV_ENV_FOLDER/ 
				continue
				;;

			"ganache-cli")
				# Directory to store the chain database
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$DATA_DIR
				continue
				;;

			#"elasticsearch"|"grafana")
			"elasticsearch")
				
				#Directory to store ES data
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$DATA_DIR
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$CONF_DIR && rsync -a ./elasticsearch/conf/ $DEV_ENV_FOLDER/$FOLDER/$CONF_DIR
				continue
				;;

			"logstash")
				
				#mkdir -p $DEV_ENV_FOLDER/$FOLDER/OA3_0/imgs && rsync -a ./open_data/OA3_0/ $DEV_ENV_FOLDER/$FOLDER/OA3_0 && echo -e "Downloading regione-toscana_OA3.00_0.csv opendata...\n" && curl http://www.catalogo.beniculturali.it/opendata/sites/default/files/regione-toscana_OA3.00_0.csv --output $DEV_ENV_FOLDER/$FOLDER/OA3_0/migration/regione-toscana_OA3.00_0.csv 
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/OA3_0/imgs && rsync -a ./open_data/OA3_0/ $DEV_ENV_FOLDER/$FOLDER/OA3_0 
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/RA3_0/imgs && rsync -a ./open_data/RA3_0/ $DEV_ENV_FOLDER/$FOLDER/RA3_0 && echo -e "\nDownloading regione-toscana_RA3.00.csv opendata...\n" && curl http://www.catalogo.beniculturali.it/opendata/sites/default/files/regione-toscana_RA3.00.csv  --output $DEV_ENV_FOLDER/$FOLDER/RA3_0/migration/regione-toscana_RA3.00.csv
				continue
				;;

			"truffle")
				
				#Directory to host the Truffle project "masterpiece"
				mkdir -p $DEV_ENV_FOLDER/$FOLDER/$TRUFFLE_APP && rsync -a ./truffle_project_template/$TRUFFLE_BOX/ $DEV_ENV_FOLDER/$FOLDER/$TRUFFLE_APP && rsync ./truffle_project_template/Dockerfile $DEV_ENV_FOLDER/$FOLDER/ 
				continue
				;;
		esac			
	done
	rsync ./docker-compose.yaml $DEV_ENV_FOLDER/
	rsync .env $DEV_ENV_FOLDER/
	echo -e "\nDone!\n"
	exit 0
