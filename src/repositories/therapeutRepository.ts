import { type Database } from "@/initialize";
import { Therapeut } from "@/models/therapeut";

export type TherapeutCreate = Omit<Therapeut, "id">;
export type TherapeutUpdate = TherapeutCreate & { id: number };

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

  public async update(therapeut: TherapeutUpdate): Promise<Therapeut> {
    const { id, ...data } = therapeut;
    return await this.database
      .updateTable("therapeuts")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
