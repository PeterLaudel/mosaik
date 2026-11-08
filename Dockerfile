FROM node:24.14.1 AS builder

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# install xmllint for XML validation
RUN apt-get update && apt-get install -y libxml2-utils && rm -rf /var/lib/apt/lists/*

# Building app: npm ci needs every workspace's manifest
COPY --chown=node:node package*.json ./
COPY --chown=node:node ui/package.json ./ui/
COPY --chown=node:node packages/contract/package.json ./packages/contract/

# Install node modules
# Note: We also install dev deps as TypeScript may be needed
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy files. Use dockerignore to avoid copying node_modules
COPY --chown=node:node . .

# Build the UI (its prebuild builds the contract package) and the API bundle
RUN npm run build && npm run api:build

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

# Running the UI
FROM gcr.io/distroless/nodejs24 AS runner
WORKDIR /app

# Mark as prod, disable telemetry, set port
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copy from build
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/packages/contract ./packages/contract
COPY --from=builder --chown=nonroot:nonroot /app/ui/package.json ./ui/package.json
COPY --from=builder --chown=nonroot:nonroot /app/ui/next.config.ts ./ui/next.config.ts
COPY --from=builder --chown=nonroot:nonroot /app/ui/public ./ui/public
COPY --from=builder --chown=nonroot:nonroot /app/ui/.next ./ui/.next

USER nonroot
WORKDIR /app/ui

# Run app command
CMD ["../node_modules/next/dist/bin/next", "start"]

# Running the API
FROM gcr.io/distroless/nodejs24 AS api
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=4000

COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist/api ./dist/api

USER nonroot

CMD ["--enable-source-maps", "dist/api/main.mjs"]
