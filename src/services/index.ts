import { InvoicesService } from "./invoicesService";
import { PatientsService } from "./patientsService";
import { ServicesService } from "./servicesService";
import { SessionsService } from "./sessionsService";
import { TherapeutsService } from "./therapeutsService";
import { TreatmentPlansService } from "./treatmentPlansService";
import { getInvoicesRepository } from "@/server/getInvoicesRepository";
import { getPatientsRepository } from "@/server/getPatientsRepository";
import { getServicesRepository } from "@/server/getServiceRepository";
import { getSessionsRepository } from "@/server/getSessionsRepository";
import { getTherapeutsRepository } from "@/server/getTherapeutsRepository";
import { getTreatmentPlansRepository } from "@/server/getTreatmentPlansRepository";

export async function getPatientsService(): Promise<PatientsService> {
  return new PatientsService(await getPatientsRepository());
}

export async function getServicesService(): Promise<ServicesService> {
  return new ServicesService(await getServicesRepository());
}

export async function getTherapeutsService(): Promise<TherapeutsService> {
  return new TherapeutsService(await getTherapeutsRepository());
}

export async function getTreatmentPlansService(): Promise<TreatmentPlansService> {
  const [patientsRepository, treatmentPlansRepository] = await Promise.all([
    getPatientsRepository(),
    getTreatmentPlansRepository(),
  ]);
  return new TreatmentPlansService(patientsRepository, treatmentPlansRepository);
}

export async function getInvoicesService(): Promise<InvoicesService> {
  const [invoicesRepository, therapeutsRepository] = await Promise.all([
    getInvoicesRepository(),
    getTherapeutsRepository(),
  ]);
  return new InvoicesService(invoicesRepository, therapeutsRepository);
}

export async function getSessionsService(): Promise<SessionsService> {
  const [patientsRepository, sessionsRepository] = await Promise.all([
    getPatientsRepository(),
    getSessionsRepository(),
  ]);
  return new SessionsService(patientsRepository, sessionsRepository);
}
