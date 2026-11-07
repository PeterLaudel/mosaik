FROM node:24.14.1 AS builder

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# install xmllint for XML validation
RUN apt-get update && apt-get install -y libxml2-utils && rm -rf /var/lib/apt/lists/*

# Building app
COPY --chown=node:node package*.json ./

# Install node modules
# Note: We also install dev deps as TypeScript may be needed
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy files. Use dockerignore to avoid copying node_modules
COPY --chown=node:node . .

# Build
RUN npm run build

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

# Running the app: one image, two processes. Default is the API; run the web app with
#   docker run <image> node_modules/next/dist/bin/next start apps/web
FROM gcr.io/distroless/nodejs24 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3001
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nonroot:nonroot /app/package.json ./
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/packages/contract/package.json ./packages/contract/
COPY --from=builder --chown=nonroot:nonroot /app/packages/contract/dist ./packages/contract/dist
COPY --from=builder --chown=nonroot:nonroot /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=nonroot:nonroot /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/package.json /app/apps/web/next.config.ts ./apps/web/
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nonroot:nonroot /app/apps/web/.next ./apps/web/.next
# Transitional @api/* bridge: web still loads apps/api sources for domains not yet behind the API
COPY --from=builder --chown=nonroot:nonroot /app/apps/api/src ./apps/api/src

USER nonroot

CMD ["apps/api/dist/src/main.js"]
