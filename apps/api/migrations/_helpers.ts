import { Kysely, CreateTableBuilder } from "kysely";

export function isPostgres(db: Kysely<unknown>): boolean {
  return db.getExecutor().adapter.supportsTransactionalDdl;
}

export function addIdColumn(
  db: Kysely<unknown>,
  builder: CreateTableBuilder<string, string>,
) {
  if (isPostgres(db)) {
    return builder.addColumn("id", "serial", (col) => col.primaryKey());
  }
  return builder.addColumn("id", "integer", (col) =>
    col.primaryKey().autoIncrement(),
  );
}
