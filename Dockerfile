FROM node:lts AS builder
RUN apt update && apt install -y git build-essential
WORKDIR /app
COPY package.json package-lock.json prisma /app/
RUN corepack enable && corepack prepare pnpm@6.32.0 --activate
RUN pnpm i --frozen-lockfile
RUN npx prisma generate

FROM node:lts AS app
ENV NODE_PRODUCTION=true
WORKDIR /app/
RUN corepack enable && corepack prepare pnpm@6.32.0 --activate
RUN pnpm i --frozen-lockfile
COPY --from=builder /app/node_modules /app/node_modules
COPY . /app/
CMD ["sh", "/app/docker-entry.sh"]
EXPOSE 3000
