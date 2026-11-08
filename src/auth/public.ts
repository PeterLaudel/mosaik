import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = Symbol("IS_PUBLIC");

/** Lets a route through the auth guard without a session (e.g. the e2e test API). */
export const Public = () => SetMetadata(IS_PUBLIC, true);
