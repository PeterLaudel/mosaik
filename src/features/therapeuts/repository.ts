import { type Database } from "@/initialize";
import { Therapeut } from "./model";

export type TherapeutCreate = Omit<Therapeut, "id">;

export class TherapeutRepository {
  constructor(private readonly database: Database) {}

  public async all(): Promise<Therapeut[]> {
    return await this.database.selectFrom("therapeuts").selectAll().execute();
  }

  public async create(therapeut: TherapeutCreate): Promise<Therapeut> {
    return await this.database
      .insertInto("therapeuts")
      .values(therapeut)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  public async update(therapeut: Therapeut): Promise<Therapeut> {
    const { id, ...data } = therapeut;
    return await this.database
      .updateTable("therapeuts")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
