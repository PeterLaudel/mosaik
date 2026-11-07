import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "isPublic";

/** Skips the session check of AuthGuard for a controller or route. */
export const Public = () => SetMetadata(IS_PUBLIC, true);
