# Node
#
# Use an official Node.js image
FROM node

LABEL Description="In order to build a DApp on Ethereum (from a Node.js parent image) the TRUFFLE framework and all the required dependecies are installed" Author="Mariano Basile" Maintainer="basilemariano92@gmail.com"

RUN mkdir -p /cultural-good/external_res/OA3_0/imgs

RUN mkdir -p /cultural-good/external_res/RA3_0/imgs

RUN mkdir -p /cultural-good/external_res/OA3_0/restore

RUN mkdir -p /cultural-good/external_res/RA3_0/restore

COPY ./cultural-good /cultural-good

RUN npm install -g truffle

RUN npm install -g browserify

RUN npm install ipfs-api 

RUN npm install multihashes 

RUN npm install elasticsearch

RUN npm install -g bower

RUN bower --allow-root install elasticsearch

RUN cp /bower_components/elasticsearch/elasticsearch.js /cultural-good/src/js/