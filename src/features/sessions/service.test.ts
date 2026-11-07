import { getDb } from "@/initialize";
import { SessionsRepository } from "./repository";
import { givenHomeworkFactory } from "factories/homework";
import { patientFactory } from "factories/patient";
import { sessionFactory } from "factories/session";
import { SessionsService } from "./service";

describe("SessionsService", () => {
  let sessionsService: SessionsService;

  beforeEach(() => {
    const db = getDb();
    sessionsService = new SessionsService(new SessionsRepository(db));
  });

  describe("#createDraft", () => {
    it("creates a draft with the next session number", async () => {
      const patient = await patientFactory.create();
      await sessionFactory.create({ patientId: patient.id, sessionNumber: 1 });

      const session = await sessionsService.createDraft(patient.id);

      expect(session).toMatchObject({
        patient: { id: patient.id },
        sessionNumber: 2,
        status: "draft",
        durationMinutes: 50,
        sessionType: "Einzelgespräch",
        givenHomework: [],
      });
    });

    it("carries the previous session's given homework over as open review homework", async () => {
      const patient = await patientFactory.create();
      const previous = await sessionFactory.create({ patientId: patient.id, sessionNumber: 1 });
      await givenHomeworkFactory.create({ sessionId: previous.id, description: "Tagebuch führen" });

      const session = await sessionsService.createDraft(patient.id);

      expect(session.reviewHomework).toEqual([{ description: "Tagebuch führen", status: "open" }]);
    });
  });

  describe("#update", () => {
    it("merges the given fields into the existing session", async () => {
      const existing = await sessionFactory.create({ clinicalNotes: "alt", durationMinutes: 50 });

      const session = await sessionsService.update(existing.id, { clinicalNotes: "neu" });

      expect(session).toMatchObject({ id: existing.id, clinicalNotes: "neu", durationMinutes: 50 });
    });
  });

  describe("#getPseudonymizedText", () => {
    it("returns the joined pseudonymized text when all sessions are done", async () => {
      const first = await sessionFactory.create({
        pseudonymizationStatus: "done",
        pseudonymizedNotes: "Notiz 1",
        pseudonymizedNextPlan: "Plan 1",
      });
      const second = await sessionFactory.create({
        pseudonymizationStatus: "done",
        pseudonymizedNotes: "Notiz 2",
        pseudonymizedNextPlan: null,
      });

      const result = await sessionsService.getPseudonymizedText([first.id, second.id]);

      expect(result).toEqual({
        status: "ready",
        text: "Notiz 1\n\nPlan 1\n\n---\n\nNotiz 2",
      });
    });

    it("returns failed when any session failed", async () => {
      const done = await sessionFactory.create({ pseudonymizationStatus: "done" });
      const failed = await sessionFactory.create({ pseudonymizationStatus: "failed" });

      const result = await sessionsService.getPseudonymizedText([done.id, failed.id]);

      expect(result).toEqual({ status: "failed" });
    });

    it("enqueues orphaned sessions and reports pending", async () => {
      const orphaned = await sessionFactory.create({ status: "final", pseudonymizationStatus: null });

      const result = await sessionsService.getPseudonymizedText([orphaned.id]);

      expect(result).toEqual({ status: "pending" });
      const outboxRows = await getDb().selectFrom("outbox").selectAll().execute();
      expect(outboxRows).toHaveLength(1);
    });
  });
});
