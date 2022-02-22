FROM node:lts AS builder
RUN apt update && apt install -y git build-essential
WORKDIR /app
COPY package.json prisma /app/
RUN npm i -g npm
RUN npm i
RUN npx prisma generate

FROM node:lts AS app
ENV NODE_PRODUCTION=true
WORKDIR /app/
RUN npm i -g npm
COPY --from=builder /app/node_modules /app/node_modules
COPY . /app/
CMD ["sh", "/app/docker-entry.sh"]
EXPOSE 3000
