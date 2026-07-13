FROM eclipse-temurin:17-jdk-alpine
WORKDIR /code
RUN adduser -D runner
USER runner