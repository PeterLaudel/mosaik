import { Global, Inject, Module, OnApplicationShutdown } from "@nestjs/common";
import { getDb } from "../initialize";
import type { Database } from "../initialize";

export const DATABASE = Symbol("DATABASE");

/** Use as a constructor parameter decorator: `@InjectDatabase() db: Database`. */
export const InjectDatabase = () => Inject(DATABASE);

@Global()
@Module({
  providers: [{ provide: DATABASE, useFactory: getDb }],
  exports: [DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@InjectDatabase() private readonly db: Database) {}

  async onApplicationShutdown() {
    await this.db.destroy();
  }
}
