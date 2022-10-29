FROM node:18

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@7
WORKDIR /app

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

ADD . ./
RUN pnpm install --offline --prod