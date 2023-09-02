# syntax=docker/dockerfile:1
# stage 1 build
FROM golang:1.19-alpine AS build


RUN apk add -v build-base
RUN apk add -v ca-certificates
RUN apk add --no-cache \
    openssh

WORKDIR /pb

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY *.go ./
# migrations to recreate your dev schemma when deploy
COPY pb_migrations/ /pb/pb_migrations
RUN go build -o pocketbase

# stage 2 build to cut down final image size
FROM alpine

WORKDIR /
COPY --from=build /pb /pb
EXPOSE 5555
CMD [ "/pb/pocketbase","serve", "--http=0.0.0.0:5555", "--debug" ]