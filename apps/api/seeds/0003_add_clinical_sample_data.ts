import { getDb } from "../src/initialize";
import { patientFactory } from "../factories/patient";
import { sessionFactory } from "../factories/session";
import { givenHomeworkFactory, reviewHomeworkFactory } from "../factories/homework";

async function createTreatmentPlan(patientId: number) {
  const db = getDb();
  const { id } = await db
    .insertInto("treatment_plans")
    .values({
      patientId,
      therapeutId: null,
      startDate: "2025-01-15",
      therapyForm: "Einzeltherapie",
      phase: "Therapiephase",
      approvedSessions: 25,
      notes: "Patient zeigt gute Therapiemotivation. Fokus auf Verhaltensaktivierung und kognitive Umstrukturierung.",
    })
    .returning(["id"])
    .executeTakeFirstOrThrow();

  await db
    .insertInto("treatment_goals")
    .values([
      { treatmentPlanId: id, description: "Depressive Symptomatik reduzieren", status: "active", priority: 1 },
      { treatmentPlanId: id, description: "Soziale Isolation überwinden", status: "active", priority: 2 },
      { treatmentPlanId: id, description: "Selbstwirksamkeit stärken", status: "active", priority: 3 },
    ])
    .execute();
}

export async function seed() {
  // Patient 1 — active therapy with several finalized sessions and one open draft
  const anna = await patientFactory.create({
    name: "Anna",
    surname: "Berger",
    email: "peter.laudel+anna.berger@gmail.com",
  });

  await createTreatmentPlan(anna.id);

  const s1 = await sessionFactory.create({
    patientId: anna.id,
    sessionNumber: 1,
    sessionDate: "2025-02-03",
    sessionType: "Erstgespräch",
    phase: "Diagnostik",
    riskLevel: "none",
    status: "final",
    moodStart: 4,
    moodEnd: 5,
    interventions: JSON.stringify(["Psychoedukation", "Gesprächsführung / Aktives Zuhören"]),
    clinicalNotes: "Erste Kontaktaufnahme. Patientin berichtet von anhaltend gedrückter Stimmung seit ca. 8 Monaten.",
    nextSessionPlan: "Stimmungstagebuch einführen, Verhaltensaktivierung besprechen.",
  });

  await givenHomeworkFactory.create({ sessionId: s1.id, description: "Stimmungstagebuch täglich ausfüllen" });
  await givenHomeworkFactory.create({ sessionId: s1.id, description: "Liste angenehmer Aktivitäten erstellen" });

  const s2 = await sessionFactory.create({
    patientId: anna.id,
    sessionNumber: 2,
    sessionDate: "2025-02-17",
    sessionType: "Einzelgespräch",
    phase: "Therapiephase",
    riskLevel: "low",
    status: "final",
    moodStart: 5,
    moodEnd: 6,
    interventions: JSON.stringify(["Aktivitätenaufbau", "Kognitive Umstrukturierung"]),
    clinicalNotes: "Stimmungstagebuch wurde unregelmäßig geführt. Aktivitätenliste erstellt. Automatische negative Gedanken identifiziert.",
    nextSessionPlan: "Gedankenprotokoll einüben. Aktivitätenplan für die Woche erstellen.",
  });

  // reviewHomework on s2 — copied from s1's givenHomework at session creation
  await reviewHomeworkFactory.create({ sessionId: s2.id, description: "Stimmungstagebuch täglich ausfüllen", status: "partial" });
  await reviewHomeworkFactory.create({ sessionId: s2.id, description: "Liste angenehmer Aktivitäten erstellen", status: "done" });

  await givenHomeworkFactory.create({ sessionId: s2.id, description: "Gedankenprotokoll für 3 belastende Situationen ausfüllen" });
  await givenHomeworkFactory.create({ sessionId: s2.id, description: "Jeden Tag eine Aktivität aus der Liste umsetzen" });

  // Draft session (session 3) — reviewHomework copied from s2's givenHomework
  const s3 = await sessionFactory.create({
    patientId: anna.id,
    sessionNumber: 3,
    sessionDate: "2025-03-03",
    sessionType: "Einzelgespräch",
    phase: "Therapiephase",
    riskLevel: null,
    status: "draft",
    moodStart: null,
    moodEnd: null,
    interventions: "[]",
    clinicalNotes: null,
    nextSessionPlan: null,
  });

  await reviewHomeworkFactory.create({ sessionId: s3.id, description: "Gedankenprotokoll für 3 belastende Situationen ausfüllen", status: "open" });
  await reviewHomeworkFactory.create({ sessionId: s3.id, description: "Jeden Tag eine Aktivität aus der Liste umsetzen", status: "open" });

  // Patient 2 — early stage, only probatoric sessions done
  const markus = await patientFactory.create({
    name: "Markus",
    surname: "Klein",
    email: "peter.laudel+markus.klein@gmail.com",
  });

  const m1 = await sessionFactory.create({
    patientId: markus.id,
    sessionNumber: 1,
    sessionDate: "2025-03-10",
    sessionType: "Probatorik",
    phase: "Diagnostik",
    riskLevel: "none",
    status: "final",
    moodStart: 3,
    moodEnd: 4,
    interventions: JSON.stringify(["Psychoedukation"]),
    clinicalNotes: "Probatorische Sitzung. Patient berichtet von Panikattacken und Vermeidungsverhalten.",
    nextSessionPlan: "Psychoedukation zu Angst und Panik vertiefen.",
  });

  await givenHomeworkFactory.create({ sessionId: m1.id, description: "Informationsblatt zu Panikattacken lesen" });

  // Draft session for Markus — reviewHomework copied from m1's givenHomework
  const m2 = await sessionFactory.create({
    patientId: markus.id,
    sessionNumber: 2,
    sessionDate: "2025-03-24",
    sessionType: "Probatorik",
    phase: "Diagnostik",
    riskLevel: null,
    status: "draft",
    moodStart: null,
    moodEnd: null,
    interventions: "[]",
    clinicalNotes: null,
    nextSessionPlan: null,
  });

  await reviewHomeworkFactory.create({ sessionId: m2.id, description: "Informationsblatt zu Panikattacken lesen", status: "open" });
}
