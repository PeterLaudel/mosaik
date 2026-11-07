#!/bin/bash
set -e

STANDALONE=".next/standalone"

npm run build

# Standalone trace omits these; Next expects them next to the traced server
mkdir -p "${STANDALONE}/.next/static"
cp -R .next/static/. "${STANDALONE}/.next/static/"
cp -R public "${STANDALONE}/public"

# Custom server + migrations + DB bootstrap (overwrites Next's default standalone/server.js)
npx tsc --project tsconfig.pkg.json --outDir "${STANDALONE}"

# pkg snapshots assets; standalone tree is far smaller than full .next/**/*
NODE_OPTIONS="${NODE_OPTIONS:+${NODE_OPTIONS} }--max-old-space-size=12288" \
  npx pkg "${STANDALONE}/server.js" --config pkg.json --output src-tauri/binary/mosaik-aarch64-apple-darwin
