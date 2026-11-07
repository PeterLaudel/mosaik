import { Patient } from "@/models/patient";
import {
  PatientCreate,
  PatientsRepository,
  PatientUpdate,
} from "@/repositories/patientsRepository";

export class PatientsService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async create(patient: PatientCreate): Promise<Patient> {
    return this.patientsRepository.create(patient);
  }

  async update(patient: PatientUpdate): Promise<Patient> {
    return this.patientsRepository.update(patient);
  }
}
