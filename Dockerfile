FROM node:lts-alpine as builder
RUN apk add --update --no-cache build-base make python3

WORKDIR /app

COPY ["package.json", "package-lock.json", "tsconfig.json", "tsconfig.build.json", "nest-cli.json", ".eslintrc.js", "./"]
RUN npm ci
COPY src src

RUN npm run build && npm prune --production

FROM node:lts-alpine
RUN apk --update --no-cache add openssh sshpass

WORKDIR /app

COPY ["package.json", "ormconfig.js", "index.html", "./"]
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/dist dist
