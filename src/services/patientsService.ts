import { Patient } from "@/models/patient";
import { PatientSave, PatientsRepository } from "@/repositories/patientsRepository";

export class PatientsService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async save(patient: PatientSave): Promise<Patient> {
    return this.patientsRepository.save(patient);
  }
}
