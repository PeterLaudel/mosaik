// Root oRPC contract: the API surface clients (mosaik-ui) are built against.
// Imports only the feature contract files so the published bundle carries no backend runtime.
import { authContract } from "@/auth/contract";
import { invoicesContract } from "@/features/invoices/contract";
import { patientsContract } from "@/features/patients/contract";
import { servicesContract } from "@/features/services/contract";
import { sessionsContract } from "@/features/sessions/contract";
import { therapeutsContract } from "@/features/therapeuts/contract";
import { treatmentPlansContract } from "@/features/treatment-plans/contract";

export const contract = {
  auth: authContract,
  invoices: invoicesContract,
  patients: patientsContract,
  services: servicesContract,
  sessions: sessionsContract,
  therapeuts: therapeutsContract,
  treatmentPlans: treatmentPlansContract,
};

export type Contract = typeof contract;
