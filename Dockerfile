FROM denoland/deno:alpine AS build
USER deno
WORKDIR /app

COPY . .
RUN deno install
RUN deno task build

RUN deno compile --frozen --allow-net --allow-env --allow-read --output main main.ts

FROM denoland/deno:alpine
USER deno
WORKDIR /app

COPY --from=build /app/main .
COPY --from=build /app/dist ./dist

ENTRYPOINT ["./main"]
