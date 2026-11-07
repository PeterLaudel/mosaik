import { Database } from "@/initialize";
import { Session, SessionPatient, SessionCreate, SessionUpdate } from "./model";
import { GivenHomework, ReviewHomework } from "./homework";
import { sessionSelector } from "./selector";
import { OutboxRepository } from "@/shared/outbox/repository";

export class SessionsRepository {
  constructor(private readonly database: Database) {}

  async find(id: number): Promise<Session> {
    return await sessionSelector(this.database)
      .where("sessions.id", "=", id)
      .where("sessions.deletedAt", "is", null)
      .executeTakeFirstOrThrow() as unknown as Session;
  }

  async filter({
    patientId,
    status,
    page = 0,
    pageSize = 50,
  }: {
    patientId?: number;
    status?: Session["status"];
    page?: number;
    pageSize?: number;
  }): Promise<{ rows: Session[]; total: number }> {
    let query = sessionSelector(this.database)
      .where("sessions.deletedAt", "is", null);

    if (patientId !== undefined) {
      query = query.where("sessions.patientId", "=", patientId);
    }
    if (status !== undefined) {
      query = query.where("sessions.status", "=", status);
    }

    const [rawRows, countResult] = await Promise.all([
      query
        .orderBy("sessions.sessionDate", "desc")
        .orderBy("sessions.id", "desc")
        .limit(pageSize)
        .offset(page * pageSize)
        .$castTo<Session>()
        .execute(),
      this.database
        .selectFrom("sessions")
        .select(this.database.fn.countAll<number>().as("total"))
        .where("sessions.deletedAt", "is", null)
        .$if(patientId !== undefined, (qb) => qb.where("sessions.patientId", "=", patientId!))
        .$if(status !== undefined, (qb) => qb.where("sessions.status", "=", status!))
        .executeTakeFirstOrThrow(),
    ]);

    return { rows: rawRows, total: Number(countResult.total) };
  }

  async findOpenSession(patientId: number): Promise<Session | null> {
    const row = await sessionSelector(this.database)
      .where("sessions.patientId", "=", patientId)
      .where("sessions.status", "=", "draft")
      .where("sessions.deletedAt", "is", null)
      .$castTo<Session>()
      .executeTakeFirst();

    return row ?? null;
  }

  async findPreviousSession(patientId: number, currentSessionNumber: number): Promise<Session | null> {
    const row = await sessionSelector(this.database)
      .where("sessions.patientId", "=", patientId)
      .where("sessions.sessionNumber", "=", currentSessionNumber - 1)
      .where("sessions.deletedAt", "is", null)
      .$castTo<Session>()
      .executeTakeFirst();

    return row ?? null;
  }

  async nextSessionNumber(patient: Pick<SessionPatient, "id">): Promise<number> {
    const result = await this.database
      .selectFrom("sessions")
      .select(this.database.fn.max("sessionNumber").as("max"))
      .where("sessions.patientId", "=", patient.id)
      .executeTakeFirst();

    return (result?.max ?? 0) + 1;
  }

  async findPatient(patientId: number): Promise<SessionPatient> {
    const patient = await this.database
      .selectFrom("patients")
      .select(["id", "name", "surname", "birthdate", "street", "zip", "city"])
      .where("id", "=", patientId)
      .executeTakeFirstOrThrow();
    const { street, zip, city, ...rest } = patient;
    return { ...rest, address: { street, zip, city } };
  }

  /** Names of all therapeuts, so pseudonymization can strip them from session notes. */
  async findTherapeutNames(): Promise<{ name: string; surname: string }[]> {
    return this.database.selectFrom("therapeuts").select(["name", "surname"]).execute();
  }

  async create(session: SessionCreate): Promise<Session> {
    const { givenHomework, reviewHomework } = session;
    const data = this.toRow(session);
    const isFinal = data.status === "final";

    const id = await this.database.transaction().execute(async (trx) => {
      const { id: createdId } = await trx
        .insertInto("sessions")
        .values(isFinal ? { ...data, pseudonymizationStatus: "pending" } : data)
        .returning(["id"])
        .executeTakeFirstOrThrow();

      await this.replaceHomework(createdId, givenHomework, reviewHomework, trx);
      if (isFinal) await this.enqueueFinalized(createdId, trx);

      return createdId;
    });

    return this.find(id);
  }

  async update(session: SessionUpdate): Promise<Session> {
    const { id, givenHomework, reviewHomework } = session;
    const data = this.toRow(session);

    await this.database.transaction().execute(async (trx) => {
      const { status: previousStatus } = await trx
        .selectFrom("sessions")
        .select("status")
        .where("sessions.id", "=", id)
        .executeTakeFirstOrThrow();
      const isFinalizing = data.status === "final" && previousStatus !== "final";

      await trx
        .updateTable("sessions")
        .set(isFinalizing ? { ...data, pseudonymizationStatus: "pending" } : data)
        .where("sessions.id", "=", id)
        .executeTakeFirstOrThrow();

      await this.replaceHomework(id, givenHomework, reviewHomework, trx);
      if (isFinalizing) await this.enqueueFinalized(id, trx);
    });

    return this.find(id);
  }

  private toRow(session: SessionCreate) {
    // Homework is stored in its own table (see replaceHomework), so it is split off here.
    const { interventions, patient, givenHomework, reviewHomework, ...columns } = session;
    return { ...columns, interventions: JSON.stringify(interventions), patientId: patient.id };
  }

  private async enqueueFinalized(sessionId: number, trx: Database) {
    await new OutboxRepository(trx).enqueue({
      eventType: "session.finalized",
      payload: { sessionId },
    });
  }

  private async replaceHomework(
    sessionId: number,
    givenHomework: GivenHomework[],
    reviewHomework: ReviewHomework[],
    trx: Database
  ) {
    await trx.deleteFrom("homework").where("homework.sessionId", "=", sessionId).execute();

    const rows = [
      ...givenHomework.map((h) => ({ sessionId, type: "given" as const, description: h.description, status: null })),
      ...reviewHomework.map((h) => ({ sessionId, type: "review" as const, description: h.description, status: h.status })),
    ];

    if (rows.length === 0) return;
    await trx.insertInto("homework").values(rows).execute();
  }

  // Safety net for sessions finalized before pseudonymization/outbox existed (or any other
  // path that left status "final" without ever enqueueing a pseudonymize job). The WHERE
  // clause makes this idempotent: only the first caller to see a null status wins the update
  // and enqueues, so concurrent calls can't create duplicate outbox events for the same session.
  async enqueuePseudonymizationIfMissing(session: Pick<Session, "id">): Promise<void> {
    await this.database.transaction().execute(async (trx) => {
      const result = await trx
        .updateTable("sessions")
        .set({ pseudonymizationStatus: "pending" })
        .where("id", "=", session.id)
        .where("pseudonymizationStatus", "is", null)
        .executeTakeFirst();

      if (Number(result.numUpdatedRows) > 0) {
        await new OutboxRepository(trx).enqueue({
          eventType: "session.finalized",
          payload: { sessionId: session.id },
        });
      }
    });
  }

  async softDelete(session: Pick<Session, "id">): Promise<void> {
    await this.database
      .updateTable("sessions")
      .set({ deletedAt: new Date().toISOString() })
      .where("sessions.id", "=", session.id)
      .execute();
  }
}
