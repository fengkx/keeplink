FROM supabase/postgres:14.1.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  gcc \
  make \
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
  && apt-get autoremove -y \
  && rm -rf \
  /zhparser-master \
  /zhparser.zip \
  /scws-1.2.3

# Run time values
ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_PORT=5432

EXPOSE 5432
