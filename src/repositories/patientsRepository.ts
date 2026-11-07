import { Patient } from "@/models/patient";
import { Database } from "@/initialize";
import { patientSelector } from "./selectors/patient";

export type PatientCreate = Omit<Patient, "id">;

export class PatientsRepository {
  constructor(private readonly database: Database) {}

  async find(id: number): Promise<Patient> {
    return await patientSelector(this.database)
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  }

  async filter({
    search,
    page = 0,
    pageSize = 10,
  }: {
    search: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: Patient[]; total: number }> {
    let query = patientSelector(this.database);

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("name", "like", `%${search}%`),
          eb("surname", "like", `%${search}%`),
          eb("email", "like", `%${search}%`),
        ]),
      );
    }

    const [rows, countResult] = await Promise.all([
      query
        .orderBy("patients.id", "desc")
        .limit(pageSize)
        .offset(page * pageSize)
        .execute(),
      this.database
        .selectFrom(query.as("filtered"))
        .select(this.database.fn.countAll<number>().as("total"))
        .executeTakeFirstOrThrow(),
    ]);

    return { rows, total: Number(countResult.total) };
  }

  async all(): Promise<Patient[]> {
    return await patientSelector(this.database).execute();
  }

  async create(patient: PatientCreate): Promise<Patient> {
    return await this.database.transaction().execute(async (trx) => {
      const { id } = await trx
        .insertInto("patients")
        .values(this.toRow(patient))
        .returning(["id"])
        .executeTakeFirstOrThrow();

      return await patientSelector(trx)
        .where("patients.id", "=", id)
        .executeTakeFirstOrThrow();
    });
  }

  async update(patient: Patient): Promise<Patient> {
    return await this.database.transaction().execute(async (trx) => {
      const { id, ...data } = patient;
      await trx
        .updateTable("patients")
        .set(this.toRow(data))
        .where("patients.id", "=", id)
        .executeTakeFirstOrThrow();

      return await patientSelector(trx)
        .where("patients.id", "=", id)
        .executeTakeFirstOrThrow();
    });
  }

  async delete(patientId: number) {
    await this.database
      .deleteFrom("patients")
      .where("id", "=", patientId)
      .execute();
  }

  private toRow(patient: PatientCreate) {
    const { address, billingInfo, ...rest } = patient;
    return {
      ...rest,
      ...address,
      billingName: billingInfo.name,
      billingSurname: billingInfo.surname,
      billingEmail: billingInfo.email,
      billingStreet: billingInfo.address.street,
      billingCity: billingInfo.address.city,
      billingZip: billingInfo.address.zip,
    };
  }
}
