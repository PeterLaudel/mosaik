# @peterlaudel/mosaik-contract

The oRPC contract of the mosaik API: zod schemas and procedures for every feature. It is built
from `src/contract.ts` in the mosaik repo and contains no backend runtime code.

## Install (GitHub Packages)

`.npmrc` in the consuming repo:

```
@peterlaudel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` is a token with `read:packages`. In GitHub Actions, use `secrets.GITHUB_TOKEN`
and grant the consuming repository access to this package.

```sh
npm install @peterlaudel/mosaik-contract @orpc/contract@2.0.0-beta.49 @orpc/openapi@2.0.0-beta.49 zod
```

## Use

```ts
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi/fetch";
import type { RouterContractClient } from "@orpc/contract";
import { contract, type Contract } from "@peterlaudel/mosaik-contract";

const link = new OpenAPILink(contract, { origin: "http://localhost:4000" });
const api: RouterContractClient<Contract> = createORPCClient(link);

const { rows } = await api.patients.filter({ search: "Doe" });
```

## Releasing

Bump `version` in `packages/contract/package.json` in the PR that changes a contract. The
`Publish contract` workflow publishes every version that is not on the registry yet once it lands
on `main`.
