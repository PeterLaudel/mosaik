FROM node:24.14.1 AS builder

WORKDIR /app

# install xmllint for XML validation
RUN apt-get update && apt-get install -y libxml2-utils && rm -rf /var/lib/apt/lists/*

# Building app: npm ci needs every workspace's manifest
COPY --chown=node:node package*.json ./
COPY --chown=node:node packages/contract/package.json ./packages/contract/

# Install node modules
# Note: We also install dev deps as TypeScript may be needed
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy files. Use dockerignore to avoid copying node_modules
COPY --chown=node:node . .

# Build the API bundle
RUN npm run api:build

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

# Running the API
FROM gcr.io/distroless/nodejs24 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=4000

COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist/api ./dist/api

USER nonroot

CMD ["--enable-source-maps", "dist/api/main.mjs"]
