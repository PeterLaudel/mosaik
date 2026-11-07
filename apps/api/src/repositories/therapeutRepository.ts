import { type Database } from "../initialize";
import { Therapeut } from "@mosaik/contract/models/therapeut";

export type TherapeutSave = Omit<Therapeut, "id"> & { id?: number };

export class TherapeutRepository {
  constructor(private readonly database: Database) {}

  public async all(): Promise<Therapeut[]> {
    return await this.database.selectFrom("therapeuts").selectAll().execute();
  }

  public async save(therapeut: TherapeutSave): Promise<Therapeut> {
    if (therapeut.id) {
      return await this.database
        .updateTable("therapeuts")
        .set({
          ...therapeut,
        })
        .where("id", "=", therapeut.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    }
    return await this.database
      .insertInto("therapeuts")
      .values(therapeut)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
