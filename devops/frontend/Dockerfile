FROM node:18-bullseye-slim AS build

ARG STAGE="dev"

WORKDIR /app

COPY ["package*.json", "/app/"]

RUN yarn

COPY . /app

RUN yarn build:${STAGE}

FROM nginx:stable-alpine3.17 AS deploy

COPY --from=build /app/dist /var/www/html

CMD ["nginx", "-g", "daemon off;"]
