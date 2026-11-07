import { getDb } from "@/initialize";
import { pseudonymizeSession } from "./pseudonymizer";
import { generateText } from "@/shared/ollama/client";
import { sessionFactory } from "factories/sessions";
import { patientFactory } from "factories/patients";
import { therapeutFactory } from "factories/therapeuts";

jest.mock("@/shared/ollama/client", () => ({
  generateText: jest.fn(),
}));

const mockedGenerateText = generateText as jest.MockedFunction<typeof generateText>;

describe("pseudonymizeSession", () => {
  beforeEach(() => {
    mockedGenerateText.mockReset();
    mockedGenerateText.mockImplementation((_system, userMessage) => Promise.resolve(JSON.parse(userMessage).text));
  });

  it("replaces patient and therapeut identifiers before calling the LLM, then stores the result", async () => {
    const patient = await patientFactory.create({
      name: "Anna",
      surname: "Muster",
      birthdate: "1990-05-03",
      street: "Hauptstraße 1",
      city: "Musterstadt",
      zip: "12345",
    });
    await therapeutFactory.create({ name: "Peter", surname: "Seliger" });
    const session = await sessionFactory.create({
      patientId: patient.id,
      clinicalNotes: "Anna Muster berichtet von ihrem Lebensgefährten. Termin bei Peter Seliger am 03.05.1990 in Musterstadt, Hauptstraße 1.",
      nextSessionPlan: "Nächster Termin mit Anna Muster in Musterstadt.",
    });

    await pseudonymizeSession(session.id);

    const row = await getDb()
      .selectFrom("sessions")
      .select(["pseudonymizedNotes", "pseudonymizedNextPlan", "pseudonymizationStatus"])
      .where("id", "=", session.id)
      .executeTakeFirstOrThrow();

    expect(row.pseudonymizationStatus).toBe("done");
    expect(row.pseudonymizedNotes).toBe(
      "[Patient] berichtet von ihrem Lebensgefährten. Termin bei [Therapeut] am [Geburtsdatum] in [Ort], [Ort]."
    );
    expect(row.pseudonymizedNextPlan).toBe("Nächster Termin mit [Patient] in [Ort].");
    expect(mockedGenerateText).toHaveBeenCalledTimes(2);
  });

  it("leaves pseudonymized fields null when there is no text to pseudonymize", async () => {
    const session = await sessionFactory.create({ clinicalNotes: null, nextSessionPlan: null });

    await pseudonymizeSession(session.id);

    const row = await getDb()
      .selectFrom("sessions")
      .select(["pseudonymizedNotes", "pseudonymizedNextPlan", "pseudonymizationStatus"])
      .where("id", "=", session.id)
      .executeTakeFirstOrThrow();

    expect(row).toMatchObject({
      pseudonymizedNotes: null,
      pseudonymizedNextPlan: null,
      pseudonymizationStatus: "done",
    });
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it("marks pseudonymization as failed and rethrows when the LLM call fails", async () => {
    mockedGenerateText.mockRejectedValue(new Error("Ollama unavailable"));
    const session = await sessionFactory.create({ clinicalNotes: "Patientin berichtet von Sorgen." });

    await expect(pseudonymizeSession(session.id)).rejects.toThrow("Ollama unavailable");

    const row = await getDb()
      .selectFrom("sessions")
      .select("pseudonymizationStatus")
      .where("id", "=", session.id)
      .executeTakeFirstOrThrow();
    expect(row.pseudonymizationStatus).toBe("failed");
  });
});
