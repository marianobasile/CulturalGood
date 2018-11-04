# Logstash
#
# Use an official Logstash image
FROM docker.elastic.co/logstash/logstash:6.4.1

LABEL Description="Logstash is used to migrate the ICCD OA3_0 opendata (.csv) into Elasticsearch" Author="Mariano Basile" Maintainer="basilemariano92@gmail.com"

ENV ELASTICSEARCH_HOST elasticsearch

ENV OA_DIR /usr/share/logstash/OA3_0/toscana

ENV HMAC_KEY A4GLJ/qmBofevdQ6o4a9dQ==

RUN mkdir -p /usr/share/logstash/OA3_0/toscana/imgs

COPY ./migration /usr/share/logstash/OA3_0/toscana/

RUN /usr/share/logstash/bin/logstash-plugin install logstash-output-exec

ENTRYPOINT ["/usr/share/logstash/bin/logstash", "-f", "/usr/share/logstash/OA3_0/toscana/migration/logstash-oa3_0.conf"]