import { type Database } from "@/initialize";
import { Expression } from "kysely";
import { jsonArrayFrom, jsonObjectFrom } from "@/database";
import { BillableService, InvoiceIssuer } from "./model";

// These selectors read the patients, services and therapeuts tables directly instead of
// reusing the selectors of those features: features share the data, not the code.

export function invoicePatientSelector(database: Database) {
  return database
    .selectFrom("patients")
    .select(["id", "name", "surname", "birthdate", "diagnosis", "invoicePassword"])
    .select((eb) => [billingInfo(eb.ref("patients.id"), database).as("billingInfo")]);
}

function billingInfo(patientId: Expression<number>, database: Database) {
  return jsonObjectFrom(
    database
      .selectFrom("patients as billing")
      .select(["billingName as name", "billingSurname as surname", "billingEmail as email"])
      .select((eb) => [billingAddress(eb.ref("billing.id"), database).as("address")])
      .whereRef(patientId, "=", "billing.id"),
  ).$notNull();
}

function billingAddress(patientId: Expression<number>, database: Database) {
  return jsonObjectFrom(
    database
      .selectFrom("patients as billingAddress")
      .select(["billingStreet as street", "billingZip as zip", "billingCity as city"])
      .whereRef(patientId, "=", "billingAddress.id"),
  ).$notNull();
}

export function billableServiceSelector(database: Database) {
  return database
    .selectFrom("services")
    .select(({ ref }) => [
      "id",
      "short",
      "originalGopNr",
      "description",
      jsonArrayFrom(
        database
          .selectFrom("serviceAmounts")
          .select(["factor", "price"])
          .whereRef(ref("services.id"), "=", "serviceId"),
      ).as("amounts"),
    ])
    .$castTo<BillableService>();
}

export function issuerSelector(database: Database) {
  return database
    .selectFrom("therapeuts")
    .select([
      "id",
      "title",
      "name",
      "surname",
      "street",
      "zip",
      "city",
      "email",
      "taxId",
      "iban",
      "bic",
      "bankName",
      "enr",
    ])
    .$castTo<InvoiceIssuer>();
}
