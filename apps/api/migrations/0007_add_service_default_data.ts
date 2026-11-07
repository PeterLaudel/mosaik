import { Database } from "../src/db";
import { Kysely } from "kysely";

const services = [
  {
    short: "85 analog",
    originalGopNr: "85",
    description:
      "Erstellung des verfahrensspezifischen Berichts an den Gutachter für die Beantragung einer Psychotherapie mit einem wissenschaftlich anerkannten Psychotherapieverfahren unter Einbeziehung vorliegender Befunde und ggf. Abstimmung mit vor- und mitbehandelnden Ärzten und Psychotherapeuten. Je angefangene Stunde Arbeitszeit.",
    note: "Kann anstelle der bisher üblichen Nr. 808 abgerechnet werden",
    points: 500,
    amounts: [
      { factor: "1.0", price: 29.14 },
      { factor: "2.3", price: 67.03 },
    ],
  },
  {
    short: "801 analog",
    originalGopNr: "801",
    description:
      "Erhebung des aktuellen psychischen Befunds ohne Mindestdauer.",
    note: "Kann bei der Psychotherapeutischen Sprechstunde (812 analog) nicht zugesetzt werden",
    points: 250,
    amounts: [
      { factor: "1.0", price: 14.57 },
      { factor: "2.3", price: 33.52 },
    ],
  },
  {
    short: "804 analog",
    originalGopNr: "804",
    description:
      "Psychotherapeutische Behandlung durch eingehendes therapeutisches Gespräch – auch mit gezielter Exploration",
    note: "Ohne Mindestdauer",
    points: 150,
    amounts: [
      { factor: "1.0", price: 8.74 },
      { factor: "2.3", price: 20.11 },
    ],
  },
  {
    short: "807 analog (Kinder/Jugendliche)",
    originalGopNr: "807",
    description:
      "Vertiefte Exploration in Fortführung einer biographischen psychotherapeutischen Anamnese bei Kindern oder Jugendlichen unter Einschaltung der Bezugs- und Kontaktpersonen mit schriftlicher Aufzeichnung, auch in mehreren Sitzungen",
    points: 400,
    amounts: [
      { factor: "1.0", price: 23.31 },
      { factor: "2.3", price: 53.62 },
    ],
  },
  {
    short: "807 analog (Erwachsene)",
    originalGopNr: "807",
    description:
      "Vertiefte Exploration in Fortführung einer biographischen psychotherapeutischen Anamnese bei Erwachsenen unter Einschaltung der Bezugs- und Kontaktpersonen mit schriftlicher Aufzeichnung",
    points: 400,
    amounts: [
      { factor: "1.0", price: 23.31 },
      { factor: "2.3", price: 53.62 },
    ],
  },
  {
    short: "812 analog",
    originalGopNr: "812",
    description:
      "Psychotherapeutische Sprechstunde – Abklärung des Vorliegens einer krankheitswertigen Störung.",
    note: "Höchstens sechsmal im Jahr, bei Kindern und Jugendlichen sowie Patienten mit geistiger Behinderung höchstens zehnmal berechnungsfähig.",
    points: 500,
    amounts: [
      { factor: "1.0", price: 29.14 },
      { factor: "2.3", price: 67.03 },
    ],
  },
  {
    short: "812 analog (Akutbehandlung)",
    originalGopNr: "812",
    description:
      "Psychotherapeutische Akutbehandlung zur Entlastung bei akuten psychischen Krisen- und Ausnahmezuständen. Behandlungsbeginn nach Indikationsstellung innerhalb von zwei Wochen.",
    note: "Bis zu zweimal an einem Kalendertag und bis zu vierundzwanzigmal im Jahr berechnungsfähig.",
    points: 500,
    amounts: [
      { factor: "1.0", price: 29.14 },
      { factor: "2.3", price: 67.03 },
    ],
  },
  {
    short: "812 analog (Kurzzeittherapie)",
    originalGopNr: "812",
    description:
      "Psychotherapeutische Kurzzeittherapie – symptom- und/oder konfliktbezogene Behandlung mittels geeigneter psychotherapeutischer Interventionen.",
    note: "Bis zu zweimal an einem Kalendertag und bis zu achtundvierzigmal im Jahr berechnungsfähig.",
    points: 500,
    amounts: [
      { factor: "1.0", price: 29.14 },
      { factor: "2.3", price: 67.03 },
    ],
  },
  {
    short: "812 analog (Gruppentherapie)",
    originalGopNr: "812",
    description:
      "Gruppenpsychotherapeutische Kurzzeittherapie mit mindestens 2 bis 9 Teilnehmern.",
    note: "Bis zu zweimal an einem Kalendertag und bis zu achtundvierzigmal im Jahr berechnungsfähig.",
    points: 500,
    amounts: [
      { factor: "1.0", price: 29.14 },
      { factor: "2.3", price: 67.03 },
    ],
  },
  {
    short: "817 analog (Kinder/Jugendliche)",
    originalGopNr: "817",
    description:
      "Eingehende psychotherapeutische Beratung der Bezugsperson von Kindern oder Jugendlichen anhand erhobener Befunde und Erläuterung geplanter therapeutischer Maßnahmen.",
    points: 180,
    amounts: [
      { factor: "1.0", price: 10.49 },
      { factor: "2.3", price: 24.13 },
    ],
  },
  {
    short: "817 analog (Erwachsene)",
    originalGopNr: "817",
    description:
      "Eingehende psychotherapeutische Beratung der Bezugsperson von Erwachsenen anhand erhobener Befunde und Erläuterung geplanter therapeutischer Maßnahmen.",
    points: 180,
    amounts: [
      { factor: "1.0", price: 10.49 },
      { factor: "2.3", price: 24.13 },
    ],
  },
  {
    short: "855 analog (Testbatterie)",
    originalGopNr: "855",
    description:
      "Durchführung, Auswertung und Besprechung einer psychologischen – auch neuropsychologischen – Testbatterie zum umfassenden Assessment (mindestens 3 Testverfahren, z.B. PHQ-D, BDI, PSSI, ISR, HAQ).",
    points: 722,
    amounts: [
      { factor: "1.0", price: 42.08 },
      { factor: "1.8", price: 75.75 },
    ],
  },
  {
    short: "855 analog (Klinisch-diagnostisches Interview)",
    originalGopNr: "855",
    description:
      "Anwendung eines validierten, standardisierten, strukturierten klinisch-diagnostischen Interviews (z.B. SIAB-EX, Module des SCID-5-CV, PANSS-Interview) mit schriftlicher Aufzeichnung.",
    points: 722,
    amounts: [
      { factor: "1.0", price: 42.08 },
      { factor: "1.8", price: 75.75 },
    ],
  },
  {
    short: "860 analog",
    originalGopNr: "860",
    description:
      "Erhebung einer biographischen Anamnese mit schriftlicher Aufzeichnung zur Einleitung und Indikationsstellung eines wissenschaftlich anerkannten Psychotherapieverfahrens.",
    points: 920,
    amounts: [
      { factor: "1.0", price: 53.62 },
      { factor: "2.3", price: 123.34 },
    ],
  },
  {
    short: "870 analog",
    originalGopNr: "870",
    description:
      "Systemische Therapie sowie Neuropsychologische Psychotherapie oder EMDR als psychotherapeutische Methode in den Anwendungsbereichen der Psychotherapie.",
    note: "Einzelbehandlung, Dauer mindestens 50 Minuten.",
    points: 750,
    amounts: [
      { factor: "1.0", price: 43.72 },
      { factor: "2.3", price: 100.55 },
    ],
  },
];

export async function up(kysely: Kysely<Database>) {
  for (const service of services) {
    const { amounts, ...rest } = service;
    const { id } = await kysely
      .insertInto("services")
      .values(rest)
      .returning("id")
      .executeTakeFirstOrThrow();

    for (const amount of amounts) {
      const { factor, price } = amount;
      await kysely
        .insertInto("serviceAmounts")
        .values({
          serviceId: id,
          factor: factor as "1.0" | "2.3" | "1.8",
          price,
        })
        .executeTakeFirstOrThrow();
    }
  }
}

export async function down(kysely: Kysely<Database>) {
  for (const { originalGopNr } of services) {
    await kysely
      .deleteFrom("services")
      .where("originalGopNr", "=", originalGopNr)
      .executeTakeFirstOrThrow();
  }
}
