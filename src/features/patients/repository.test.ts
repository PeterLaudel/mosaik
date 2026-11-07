import { getDb } from "@/initialize";
import { PatientsRepository } from "./repository";
import { patientFactory } from "factories/patients";
import { Patient, PatientCreate } from "./model";

type PatientRow = Awaited<ReturnType<typeof patientFactory.create>>;

// The model the repository should assemble from a flat patients row.
function expectedPatient(row: PatientRow): Patient {
  const address = { street: row.street, city: row.city, zip: row.zip };
  const billingAddress = { street: row.billingStreet, city: row.billingCity, zip: row.billingZip };
  const billingInfo = {
    name: row.billingName,
    surname: row.billingSurname,
    email: row.billingEmail,
    address: billingAddress,
  };
  return {
    id: row.id,
    name: row.name,
    surname: row.surname,
    email: row.email,
    birthdate: row.birthdate,
    address,
    diagnosis: row.diagnosis,
    billingInfo,
    invoicePassword: row.invoicePassword,
  };
}

describe("PatientsRepository", () => {
  let patientRepository: PatientsRepository;

  beforeEach(() => {
    const db = getDb();
    patientRepository = new PatientsRepository(db);
  });

  describe("#all", () => {
    it("returns a list of all patients", async () => {
      const rows = await patientFactory.createList(3);

      const patients = await patientRepository.all();

      const expected = rows.map(expectedPatient);
      expect(patients).toEqual(expect.arrayContaining(expected));
      expect(patients).toHaveLength(3);
    });
  });

  describe("#find", () => {
    it("returns a patient by id", async () => {
      const row = await patientFactory.create();

      const foundPatient = await patientRepository.find(row.id);

      expect(foundPatient).toEqual(expectedPatient(row));
    });

    it("throws an error if the patient does not exist", async () => {
      await expect(patientRepository.find(999)).rejects.toThrow();
    });
  });

  describe("#create", () => {
    it("creates a new patient", async () => {
      const patientAttributes: PatientCreate = {
        name: "Anna",
        surname: "Muster",
        email: "anna@example.com",
        birthdate: "1990-05-03",
        address: { street: "Hauptstraße 1", city: "Musterstadt", zip: "12345" },
        diagnosis: null,
        billingInfo: {
          name: "Bernd",
          surname: "Muster",
          email: "bernd@example.com",
          address: { street: "Nebenstraße 2", city: "Rechnungsstadt", zip: "54321" },
        },
        invoicePassword: null,
      };

      const patient = await patientRepository.create(patientAttributes);

      expect(patient).toEqual({ id: expect.any(Number), ...patientAttributes });
      const row = await getDb()
        .selectFrom("patients")
        .selectAll()
        .where("id", "=", patient.id)
        .executeTakeFirstOrThrow();
      expect(row).toMatchObject({ street: "Hauptstraße 1", billingCity: "Rechnungsstadt" });
    });

  });

  describe("#update", () => {
    it("updates an existing patient", async () => {
      const row = await patientFactory.create();
      const patient = expectedPatient(row);

      const updatedPatient = await patientRepository.update({ ...patient, diagnosis: "nono" });

      expect(updatedPatient).toEqual({ ...patient, diagnosis: "nono" });
    });
  });

  describe("#delete", () => {
    it("deletes the patient from the database", async () => {
      const database = getDb();
      const patient = await patientFactory.create();

      await patientRepository.delete(patient.id);

      const patients = await database
        .selectFrom("patients")
        .selectAll()
        .execute();
      expect(patients.length).toEqual(0);
    });
  });
});
