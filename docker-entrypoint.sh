#!/bin/sh
set -e

if [ "$1" = "test" ]; then
  export NODE_ENV=test
  export DATABASE_DIALECT=postgres
  npm run db:create
  npm run db:migrate
  npm run test
  export DATABASE_DIALECT=sqlite
  npm run db:create
  npm run db:migrate
  npm run test
  npm run lint
  exec npm run typecheck
elif [ "$1" = "e2e" ]; then
  # The UI's e2e tests run the built UI against a mocked API: no database or API needed
  npx playwright install --with-deps chromium
  exec npm run e2e
elif [ "$1" = "run" ]; then
  exec npm start
else
  # Fallback: run whatever command was passed
  exec "$@"
fi