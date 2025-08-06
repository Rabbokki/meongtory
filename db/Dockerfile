# FROM postgres:15
#   RUN apt-get update && apt-get install -y \
#       build-essential \
#       git \
#       postgresql-server-dev-15
#   RUN git clone https://github.com/pgvector/pgvector.git && \
#       cd pgvector && \
#       make && \
#       make install

FROM postgres:15
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-15
RUN git clone https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \
    make install