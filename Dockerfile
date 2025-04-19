FROM denoland/deno:alpine AS build
USER deno
WORKDIR /app

COPY . .

RUN deno compile --frozen --allow-net --allow-env --allow-read --output main main.ts


FROM denoland/deno:alpine
USER deno
WORKDIR /app



COPY --from=build /app/main .
COPY --from=build /app/dist ./dist

# Drop tini; rely on Fly’s built‑in init to reap zombies & forward signals
ENTRYPOINT []
CMD ["./main"]
