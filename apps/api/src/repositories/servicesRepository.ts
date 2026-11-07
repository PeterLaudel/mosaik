import { type Database } from "../initialize";
import { Amount, Service } from "@mosaik/contract/models/service";
import { serviceSelector } from "./selectors/service";

export type ServiceSave = Omit<Service, "id"> & { id?: number };

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

  public async save(service: ServiceSave): Promise<Service> {
    return await this.database.transaction().execute(async (trx) => {
      const { id } = await this.upsertService(service, trx);
      await this.upsertAmounts(id, service.amounts, trx);
      return serviceSelector(trx)
        .where("id", "=", id)
        .$castTo<Service>()
        .executeTakeFirstOrThrow();
    });
  }

  private async upsertService(service: ServiceSave, database = this.database) {
    const { id, amounts, ...rest } = service;
    if (id) {
      return await database
        .updateTable("services")
        .set(rest)
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
    }

    return await database
      .insertInto("services")
      .values(rest)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  private async upsertAmounts(
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
