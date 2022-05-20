FROM node:16.15.0 AS builder
RUN apt update && apt install -y git build-essential
RUN corepack enable

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -G nodejs nextjs
WORKDIR /home/nextjs
RUN chown -R nextjs /home/nextjs
USER nextjs
COPY --chown=nextjs:nodejs package.json prisma /home/nextjs/
RUN echo 'node-linker=hoisted' >> .npmrc
RUN pnpm install --prefer-frozen-lockfile
RUN pnpx prisma generate

FROM node:16.15.0 AS app
ENV NODE_PRODUCTION=true
RUN corepack enable

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 -G nodejs nextjs
WORKDIR /home/nextjs/
COPY --from=builder --chown=nextjs:nodejs /home/nextjs/node_modules /home/nextjs/node_modules
COPY --chown=nextjs:nodejs . /home/nextjs/
RUN chown -R nextjs /home/nextjs
USER nextjs
ENV PORT=3000
EXPOSE 3000

CMD ["sh", "/home/nextjs/docker-entry.sh"]
EXPOSE 3000
