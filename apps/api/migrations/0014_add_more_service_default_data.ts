import { Database } from "../src/db";
import { Kysely } from "kysely";

const services = [
  {
    short: "870 analog (Probatorik)",
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
  {
    short: "00 Ausfallhonorar",
    originalGopNr: "00",
    description: "Ausfallhonorar",
    note: "Ausfallhonorar",
    points: 0,
    amounts: [{ factor: "1.0", price: 107.26 }],
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
