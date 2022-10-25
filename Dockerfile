FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@7

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./

RUN pnpm fetch --prod

ADD . ./
RUN pnpm install --offline --prod