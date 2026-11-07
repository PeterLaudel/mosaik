import { Patient } from "./model";
import {
  PatientCreate,
  PatientsRepository,
} from "./repository";

export class PatientsService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async create(patient: PatientCreate): Promise<Patient> {
    return this.patientsRepository.create(patient);
  }

  async update(patient: Patient): Promise<Patient> {
    return this.patientsRepository.update(patient);
  }
}
