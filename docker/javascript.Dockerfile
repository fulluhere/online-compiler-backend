FROM node:20-alpine
WORKDIR /code
RUN adduser -D runner
USER runner