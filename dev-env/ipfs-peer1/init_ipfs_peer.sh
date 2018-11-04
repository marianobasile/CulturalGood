#!/bin/bash

echo -e "\n========= INITIALIZING IPFS_PEER1 ========\n"
containerid=$(docker ps -aqf "name=ipfs_peer1")
echo "IPFS_PEER1 CONTAINER ID: $containerid"
docker exec $containerid ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"http://localhost:3000\"]"
docker exec $containerid ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials "[\"true\"]"
docker exec $containerid ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"PUT\", \"POST\", \"GET\"]"
if [ $? -eq 0 ]; then
    echo "IPFS_PEER1 inizializzato correttamente!"
    docker-compose stop ipfs_peer1
    docker-compose up ipfs_peer1
else
    echo "Errore!"
fi
echo -e "\n========= END INITIALIZING IPFS_PEER1 ========\n"