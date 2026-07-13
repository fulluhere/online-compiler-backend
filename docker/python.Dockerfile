FROM python:3.11-alpine
WORKDIR /code
RUN adduser -D runner
USER runner