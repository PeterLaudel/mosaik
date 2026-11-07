import { authContract } from "./procedures/auth";
import { invoicesContract } from "./procedures/invoices";
import { patientsContract } from "./procedures/patients";

/**
 * The oRPC contract between @mosaik/api (implements it) and @mosaik/web (consumes it).
 * Paths are relative to the API's global prefix `/api`.
 */
export const contract = {
  auth: authContract,
  invoices: invoicesContract,
  patients: patientsContract,
};

export type Contract = typeof contract;

export * from "./procedures/auth";
export * from "./models/patient";
export { addressSchema } from "./models/address";
export type { default as Address } from "./models/address";
