FROM denoland/deno:alpine AS build
USER deno
WORKDIR /app

COPY . .

RUN deno compile --frozen --allow-net --allow-env --allow-read --output main main.ts

ENTRYPOINT ["./main"]
