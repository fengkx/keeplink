FROM supabase/postgres:0.13.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
      gcc \
      make \
      systemtap-sdt-dev \
      libc-dev \
      postgresql-server-dev-$PG_MAJOR \
      wget \
      ca-certificates \
      openssl \
	&& rm -rf /var/lib/apt/lists/* \
  && wget -q -O - "http://www.xunsearch.com/scws/down/scws-1.2.3.tar.bz2" | tar xjf - \
  && wget -q -O zhparser.tar.gz "https://github.com/amutu/zhparser/archive/master.tar.gz" \
  && tar xvf zhparser.tar.gz \
  && cd scws-1.2.3 \
  && ./configure \
  && make install \
  && cd /zhparser-master \
  && SCWS_HOME=/usr/local make && make install \
  && cd / \
  && wget -q -O rum.tar.gz "https://github.com/postgrespro/rum/archive/master/master.tar.gz" \
  && tar xvf rum.tar.gz \
  && cd /rum-master \
  && make USE_PGXS=1 \
  && make USE_PGXS=1 install \
  && apt-get purge -y gcc make libc-dev systemtap-sdt-dev postgresql-server-dev-$PG_MAJOR \
  && apt-get autoremove -y \
  && rm -rf \
    /zhparser-master \
    /zhparser.zip \
    /scws-1.2.3

COPY 00-initial-schema.sql /docker-entrypoint-initdb.d/00-initial-schema.sql
COPY auth-schema.sql /docker-entrypoint-initdb.d/auth-schema.sql
COPY 200-init-zhparser.sql /docker-entrypoint-initdb.d/200-init-zhparser.sql
COPY 201-init-rum.sql /docker-entrypoint-initdb.d/201-init-rum.sql

# Run time values
ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_PORT=5432

EXPOSE 5432
