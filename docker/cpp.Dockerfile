FROM gcc:13
WORKDIR /code
RUN useradd -m runner
USER runner