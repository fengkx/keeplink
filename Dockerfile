FROM node:lts
RUN apt update
RUN apt install -y git build-essential
WORKDIR /app
COPY . /app
RUN npm i -g npm
RUN npm ci
RUN npx next build
CMD ["sh", "/app/docker-entry.sh"]
EXPOSE 3000
