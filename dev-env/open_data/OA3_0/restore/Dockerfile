# Logstash
#
# Use an official Logstash image
FROM docker.elastic.co/logstash/logstash:6.4.1

LABEL Description="Logstash is used to restore the ICCD OA3_0 (json) data into Elasticsearch" Author="Mariano Basile" Maintainer="basilemariano92@gmail.com"

ENV ELASTICSEARCH_HOST elasticsearch

ENV OA_DIR /usr/share/logstash/OA3_0/toscana

RUN mkdir -p /usr/share/logstash/OA3_0/toscana

COPY ./logstash-oa3_0-restore.conf /usr/share/logstash/OA3_0/toscana/

COPY ./oa3_0-template.json /usr/share/logstash/OA3_0/toscana/

COPY ./res /usr/share/logstash/OA3_0/toscana/

ENTRYPOINT ["/usr/share/logstash/bin/logstash", "-f", "/usr/share/logstash/OA3_0/toscana/logstash-oa3_0-restore.conf"]