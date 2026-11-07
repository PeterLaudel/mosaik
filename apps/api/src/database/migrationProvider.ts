import type { Migration, MigrationProvider } from "kysely";
import * as m0001 from "../../migrations/0001_add_patients_table";
import * as m0002 from "../../migrations/0002_add_services_table";
import * as m0003 from "../../migrations/0003_add_service_amounts";
import * as m0004 from "../../migrations/0004_add_invoices_table";
import * as m0005 from "../../migrations/0005_add_patient_invoice_table";
import * as m0006 from "../../migrations/0006_add_therapeuts_table";
import * as m0007 from "../../migrations/0007_add_service_default_data";
import * as m0008 from "../../migrations/0008_add_invoice_status";
import * as m0009 from "../../migrations/0009_add_invoice_positions";
import * as m0010 from "../../migrations/0010_alter_patients_add_diagnosis";
import * as m0011 from "../../migrations/0011_drop_page_break";
import * as m0012 from "../../migrations/0012_alter_invoice_positions_add_price";
import * as m0013 from "../../migrations/0013_alter_patients_add_encryption";
import * as m0014 from "../../migrations/0014_add_more_service_default_data";
import * as m0015 from "../../migrations/0015_add_sessions";
import * as m0016 from "../../migrations/0016_add_treatment_plans";
import * as m0017 from "../../migrations/0017_add_homework";
import * as m0018 from "../../migrations/0018_alter_sessions_add_pseudonymization";
import * as m0019 from "../../migrations/0019_add_outbox";

const migrations: Record<string, Migration> = {
  "0001_add_patients_table": m0001,
  "0002_add_services_table": m0002,
  "0003_add_service_amounts": m0003,
  "0004_add_invoices_table": m0004,
  "0005_add_patient_invoice_table": m0005,
  "0006_add_therapeuts_table": m0006,
  "0007_add_service_default_data": m0007,
  "0008_add_invoice_status": m0008,
  "0009_add_invoice_positions": m0009,
  "0010_alter_patients_add_diagnosis": m0010,
  "0011_drop_page_break": m0011,
  "0012_alter_invoice_positions_add_price": m0012,
  "0013_alter_patients_add_encryption": m0013,
  "0014_add_more_service_default_data": m0014,
  "0015_add_sessions": m0015,
  "0016_add_treatment_plans": m0016,
  "0017_add_homework": m0017,
  "0018_alter_sessions_add_pseudonymization": m0018,
  "0019_add_outbox": m0019,
};

export const migrationProvider: MigrationProvider = {
  getMigrations: () => Promise.resolve(migrations),
};
