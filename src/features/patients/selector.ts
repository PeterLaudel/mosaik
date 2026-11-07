import { type Database } from "@/initialize";
import { Expression } from "kysely";
import { jsonObjectFrom } from "@/database";

export function patientSelector(database: Database) {
  return database
    .selectFrom("patients")
    .select(["id", "name", "surname", "email", "birthdate", "diagnosis", "invoicePassword"])
    .select((eb) => [
      address(eb.ref("patients.id"), database).as("address"),
      billingInfo(eb.ref("patients.id"), database).as("billingInfo"),
    ]);
}

function address(
  patientId: Expression<number>,
  database: Database
) {
  return jsonObjectFrom(
    database
      .selectFrom("patients as address")
      .select(["street", "zip", "city"])

      .whereRef(patientId, "=", "address.id")
  ).$notNull();
}

function billingInfo(
  patientId: Expression<number>,
  database: Database
) {
  return jsonObjectFrom(
    database
      .selectFrom("patients as billing")
      .select([
        "billingName as name",
        "billingSurname as surname",
        "billingEmail as email",
      ])
      .select((eb) => [
        billingAddress(eb.ref("billing.id"), database).as("address"),
      ])
      .whereRef(patientId, "=", "billing.id")
  ).$notNull();
}

function billingAddress(
  patientId: Expression<number>,
  database: Database
) {
  return jsonObjectFrom(
    database
      .selectFrom("patients as billingAddress")
      .select([
        "billingStreet as street",
        "billingZip as zip",
        "billingCity as city",
      ])
      .whereRef(patientId, "=", "billingAddress.id")
  ).$notNull();
}
