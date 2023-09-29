FROM node:18-bullseye-slim

ARG STAGE='development'

ARG PORT=4000

WORKDIR /app

ENV NODE_ENV=${STAGE}

COPY ["package*.json", "yarn.lock", "/app/"]

RUN yarn

COPY . /app

RUN yarn build

RUN npm install -g pm2

RUN chmod +x entrypoint.sh

EXPOSE ${PORT}

CMD ["/bin/sh", "-c", "./entrypoint.sh"]