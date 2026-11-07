import { type Database } from "@/initialize";
import { InvoicePosition, type Invoice } from "@/models/invoice";
import { Expression } from "kysely";
import { patientSelector } from "./selectors/patient";
import { Patient } from "@/models/patient";
import { serviceSelector } from "./selectors/service";
import { jsonObjectFrom, jsonArrayFrom } from "@/database";
export type InvoiceCreate = Omit<Invoice, "id">;

export class InvoicesRepository {
  constructor(private readonly database: Database) {}

  public async create(invoice: InvoiceCreate): Promise<Invoice> {
    return await this.database.transaction().execute(async (trx) => {
      const { id } = await trx
        .insertInto("invoices")
        .values(this.toRow(invoice))
        .returning(["id"])
        .executeTakeFirstOrThrow();
      await this.replacePatient(id, invoice.patient, trx);
      await this.replacePositions(id, invoice.positions, trx);

      return this.modelSelector(trx)
        .where("invoices.id", "=", id)
        .executeTakeFirstOrThrow();
    });
  }

  public async update(invoice: Invoice): Promise<Invoice> {
    return await this.database.transaction().execute(async (trx) => {
      const { id } = invoice;
      await trx
        .updateTable("invoices")
        .set(this.toRow(invoice))
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
      await this.replacePatient(id, invoice.patient, trx);
      await this.replacePositions(id, invoice.positions, trx);

      return this.modelSelector(trx)
        .where("invoices.id", "=", id)
        .executeTakeFirstOrThrow();
    });
  }

  public async filter({
    search,
    status,
    page = 0,
    pageSize = 25,
  }: {
    search?: string;
    status?: Invoice["status"];
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: Invoice[]; total: number }> {
    let query = this.modelSelector();

    if (search) {
      query = query.where((eb) =>
        eb.or([
          eb("patients.name", "like", `%${search}%`),
          eb("patients.surname", "like", `%${search}%`),
        ]),
      );
    }

    if (status) {
      query = query.where("invoices.status", "=", status);
    }

    const [rows, countResult] = await Promise.all([
      query.orderBy("invoices.id", "desc").limit(pageSize).offset(page * pageSize).execute(),
      this.database
        .selectFrom(query.as("filtered"))
        .select(this.database.fn.countAll<number>().as("total"))
        .executeTakeFirstOrThrow(),
    ]);

    return { rows, total: Number(countResult.total) };
  }

  public async find(id: number): Promise<Invoice> {
    return this.modelSelector()
      .where("invoices.id", "=", id)
      .executeTakeFirstOrThrow();
  }

  public async delete(id: number): Promise<void> {
    await this.database
      .deleteFrom("patientInvoices")
      .where("invoiceId", "=", id)
      .execute();
  }

  public async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    return this.modelSelector()
      .where("invoices.invoiceNumber", "=", invoiceNumber)
      .executeTakeFirstOrThrow();
  }

  public async all(): Promise<Invoice[]> {
    return this.modelSelector(this.database).orderBy("invoiceNumber").execute();
  }

  public async generateInvoiceNumber() {
    // For SQLite: get max id and add 1
    const result = await this.database
      .selectFrom("invoices")
      .select(this.database.fn.max("id").as("max_id"))
      .executeTakeFirst();

    const next_id = (result?.max_id ?? 0) + 1;
    const currentDate = new Date();
    const isoDate = currentDate.toISOString().split("T")[0];

    return `${isoDate.replace(/-/g, "")}${next_id}`;
  }

  private modelSelector(transaction: Database = this.database) {
    return transaction
      .selectFrom("invoices")
      .innerJoin("patientInvoices", "invoices.id", "patientInvoices.invoiceId")
      .innerJoin("patients", "patientInvoices.patientId", "patients.id")
      .select(({ ref }) => [
        "invoices.id as id",
        "invoices.invoiceNumber as invoiceNumber",
        "invoices.base64Pdf as base64Pdf",
        "invoices.invoiceAmount as invoiceAmount",
        "invoices.status as status",
        this.selectPositions(ref("invoices.id"))
          .$castTo<InvoicePosition[]>()
          .as("positions"),
        jsonObjectFrom(
          patientSelector(this.database).whereRef(
            "patients.id",
            "=",
            ref("patientInvoices.patientId"),
          ),
        )
          .$notNull()
          .as("patient"),
      ]);
  }

  private toRow(invoice: InvoiceCreate) {
    return {
      invoiceNumber: invoice.invoiceNumber,
      base64Pdf: invoice.base64Pdf,
      invoiceAmount: invoice.invoiceAmount,
      status: invoice.status,
    };
  }

  private async replacePatient(
    invoiceId: number,
    patient: Patient,
    transaction: Database = this.database,
  ) {
    await transaction
      .deleteFrom("patientInvoices")
      .where("patientInvoices.invoiceId", "=", invoiceId)
      .execute();

    await transaction
      .insertInto("patientInvoices")
      .values({
        invoiceId: invoiceId,
        patientId: patient.id,
      })
      .execute();
  }

  private selectPositions(invoiceId: Expression<number>) {
    return jsonArrayFrom(
      this.database
        .selectFrom("invoicePositions")
        .select(({ ref }) => [
          "invoicePositions.serviceDate as serviceDate",
          "invoicePositions.amount as amount",
          "invoicePositions.factor as factor",
          this.selectService(ref("invoicePositions.serviceId"))
            .$notNull()
            .as("service"),
          "invoicePositions.price as price",
        ])
        .whereRef("invoicePositions.invoiceId", "=", invoiceId),
    );
  }

  private selectService(serviceId: Expression<number>) {
    return jsonObjectFrom(
      serviceSelector(this.database).whereRef(serviceId, "=", "services.id"),
    );
  }

  private async replacePositions(
    invoiceId: number,
    positions: InvoicePosition[],
    transaction = this.database,
  ) {
    await transaction
      .deleteFrom("invoicePositions")
      .where("invoicePositions.invoiceId", "=", invoiceId)
      .execute();

    return Promise.all(
      positions.map((position) =>
        transaction
          .insertInto("invoicePositions")
          .values({
            serviceId: position.service.id,
            serviceDate: position.serviceDate,
            amount: position.amount,
            factor: position.factor,
            invoiceId: invoiceId,
            price: position.price,
          })
          .execute(),
      ),
    );
  }
}
