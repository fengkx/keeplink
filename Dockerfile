FROM node:lts AS builder
RUN apt update && apt install -y git build-essential
WORKDIR /app
COPY package.json prisma /app/
RUN corepack enable
RUN echo 'node-linker=hoisted' >> .npmrc
RUN pnpm install --prefer-frozen-lockfile
RUN pnpx prisma generate

FROM node:lts AS app
ENV NODE_PRODUCTION=true
WORKDIR /app/
RUN corepack enable
COPY --from=builder /app/node_modules /app/node_modules
COPY . /app/
CMD ["sh", "/app/docker-entry.sh"]
EXPOSE 3000
