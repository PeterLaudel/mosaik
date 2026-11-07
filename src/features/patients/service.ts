import { Patient, PatientCreate } from "./model";
import { PatientsRepository } from "./repository";

export class PatientsService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async find(id: number): Promise<Patient> {
    return this.patientsRepository.find(id);
  }

  async filter(
    params: Parameters<PatientsRepository["filter"]>[0],
  ): Promise<{ rows: Patient[]; total: number }> {
    return this.patientsRepository.filter(params);
  }

  async create(patient: PatientCreate): Promise<Patient> {
    return this.patientsRepository.create(patient);
  }

  async update(patient: Patient): Promise<Patient> {
    return this.patientsRepository.update(patient);
  }
}
