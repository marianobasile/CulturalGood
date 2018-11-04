/* ======== EXPORT ipfs ISTANCE TO App.js SCRIPT ======== */
const ipfsAPI = require('ipfs-api');

//Define IPFS daemon setting 
const ipfsHost = '127.0.0.1';
const ipfsPort = '5001';

//Connect to IPFS daemon
const ipfs = ipfsAPI(ipfsHost, ipfsPort, {protocol: 'http'});

// Create the global(window) ipfs namespace
window.ipfs = ipfs;
/* ======== END EXPORT IPFS NAMESPACE TO App.js SCRIPT ======== */


/* ======== EXPORT MULTIHASHES MODULE TO App.js SCRIPT ======== */
const multihashes = require('multihashes')

// Create the global(window) multihashes namespace
window.multihashes = multihashes;
/* ======== END EXPORT MULTIHASHES MODULE TO App.js SCRIPT ======== */