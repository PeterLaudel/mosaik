import { type Database } from "@/initialize";
import { Amount, Service, ServiceCreate } from "./model";
import { serviceSelector } from "./selector";


export default class ServicesRepository {
  constructor(private readonly database: Database) {}

  public async all(): Promise<Service[]> {
    return await serviceSelector(this.database).$castTo<Service>().execute();
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
    return { rows, total: Number(countResult.total) };
  }

  public async find(serviceId: number): Promise<Service> {
    return await serviceSelector(this.database)
      .where("id", "=", serviceId)
      .$castTo<Service>()
      .executeTakeFirstOrThrow();
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

  private findIn(database: Database, id: number): Promise<Service> {
    return serviceSelector(database)
      .where("id", "=", id)
      .$castTo<Service>()
      .executeTakeFirstOrThrow();
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
