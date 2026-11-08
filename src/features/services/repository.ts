import { type Database } from "@/initialize";
import { Amount, Service, ServiceCreate } from "./model";
import { serviceSelector } from "./selector";

// The note column is nullable, but the model has no null: a service without a note omits it.
function toService(row: Service): Service {
  if (row.note != null) return row;
  const { note, ...service } = row;
  return service;
}

export default class ServicesRepository {
  constructor(private readonly database: Database) {}

  public async all(): Promise<Service[]> {
    const rows = await serviceSelector(this.database).$castTo<Service>().execute();
    return rows.map(toService);
  }

  public async filter({
    page = 0,
    pageSize = 10,
  }: {
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: Service[]; total: number }> {
    const [rows, countResult] = await Promise.all([
      serviceSelector(this.database).$castTo<Service>().limit(pageSize).offset(page * pageSize).execute(),
      this.database.selectFrom("services").select(this.database.fn.countAll<number>().as("total")).executeTakeFirstOrThrow(),
    ]);
    return { rows: rows.map(toService), total: Number(countResult.total) };
  }

  public async find(serviceId: number): Promise<Service> {
    const row = await serviceSelector(this.database)
      .where("id", "=", serviceId)
      .$castTo<Service>()
      .executeTakeFirstOrThrow();
    return toService(row);
  }

  public async create(service: ServiceCreate): Promise<Service> {
    return await this.database.transaction().execute(async (trx) => {
      const { amounts, ...data } = service;
      const { id } = await trx
        .insertInto("services")
        .values(data)
        .returning(["id"])
        .executeTakeFirstOrThrow();
      await this.replaceAmounts(id, amounts, trx);
      return this.findIn(trx, id);
    });
  }

  public async update(service: Service): Promise<Service> {
    return await this.database.transaction().execute(async (trx) => {
      const { id, amounts, ...data } = service;
      await trx
        .updateTable("services")
        .set(data)
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
      await this.replaceAmounts(id, amounts, trx);
      return this.findIn(trx, id);
    });
  }

  private async findIn(database: Database, id: number): Promise<Service> {
    const row = await serviceSelector(database)
      .where("id", "=", id)
      .$castTo<Service>()
      .executeTakeFirstOrThrow();
    return toService(row);
  }

  private async replaceAmounts(
    serviceId: number,
    amounts: Amount[],
    database = this.database
  ) {
    await database
      .deleteFrom("serviceAmounts")
      .where("serviceAmounts.serviceId", "=", serviceId)
      .execute();
    await Promise.all(
      amounts.map(async (amount) => {
        return await database
          .insertInto("serviceAmounts")
          .values({
            serviceId,
            factor: amount.factor,
            price: amount.price,
          })
          .executeTakeFirstOrThrow();
      })
    );
  }
}
