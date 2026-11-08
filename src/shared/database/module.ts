import { Global, Module } from "@nestjs/common";
import { getDb } from "@/initialize";

export const DATABASE = Symbol("DATABASE");

@Global()
@Module({
  providers: [{ provide: DATABASE, useFactory: getDb }],
  exports: [DATABASE],
})
export class DatabaseModule {}
