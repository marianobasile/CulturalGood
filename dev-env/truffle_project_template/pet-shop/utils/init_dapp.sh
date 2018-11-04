#!/bin/bash

echo -e "\n========= FINALIZING DATA MIGRATION ========\n"
node /cultural-good/finalize_migration/finalizeDataMigration.js
if [ $? -eq 0 ]; then
    echo "Migrazione dati completata con successo!"
else
    echo "Errore!"
fi
echo -e "\n========= END FINALIZING DATA MIGRATION ========\n"

echo -e "\n========= COMPILING SMART CONTRACTS ========\n"
truffle compile --all
echo -e "\n========= END COMPILING SMART CONTRACTS ========\n"

echo -e "\n========= DEPLOYING SMART CONTRACTS ========\n"
truffle migrate --reset
echo -e "\n========= END DEPLOYING SMART CONTRACTS ========\n"

cp ./external_res/OA3_0/restore/oa3_0-migration.json ./finalize_migration/OA3_0/restore/oa3_0-migration.txt
cp ./external_res/RA3_0/restore/ra3_0-migration.json ./finalize_migration/RA3_0/restore/ra3_0-migration.txt

#echo -e "\n========= NOTIFYING DB STATE CHANGE TO THE BLOCKCHAIN ========\n"
#truffle exec finalize_migration/notifyDBStateChange.js
#echo -e "\n========= NOTIFYING DB STATE CHANGE TO THE BLOCKCHAIN ========\n"