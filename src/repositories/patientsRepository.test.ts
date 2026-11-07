import { getDb } from "@/initialize";
import { PatientsRepository } from "./patientsRepository";
import { patientFactory } from "factories/patient";

describe("PatientsRepository", () => {
  let patientRepository: PatientsRepository;

  beforeEach(() => {
    const db = getDb();
    patientRepository = new PatientsRepository(db);
  });

  describe("#all", () => {
    it("returns a list of all patients", async () => {
      const createdPatients = await patientFactory.createList(3);

      const patients = await patientRepository.all();

      expect(new Set(patients)).toEqual(new Set(createdPatients));
    });
  });

  describe("#find", () => {
    it("returns a patient by id", async () => {
      const patient = await patientFactory.create();

      const foundPatient = await patientRepository.find(patient.id);

      expect(foundPatient).toEqual(patient);
    });

    it("throws an error if the patient does not exist", async () => {
      await expect(patientRepository.find(999)).rejects.toThrow();
    });
  });

  describe("#create", () => {
    it("creates a new patient", async () => {
      const patientAttributes = patientFactory.build();

      const patient = await patientRepository.create(patientAttributes);

      expect(patient).toEqual({
        id: expect.any(Number),
        ...patientAttributes,
      });
    });

  });

  describe("#update", () => {
    it("updates an existing patient", async () => {
      const patient = await patientFactory.create();

      const updatedPatient = await patientRepository.update({
        ...patient,
        diagnosis: "nono",
      });

      expect(updatedPatient).toEqual({
        ...patient,
        id: patient.id,
        diagnosis: "nono",
      });
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
