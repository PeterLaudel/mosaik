import { testingApi } from "./api";

// Rows come back as the API's factories create them: plain table rows, as JSON.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

/** Seeds rows through the API's table factory `name`, with the same create/createList shape. */
function remoteFactory(name: string) {
  return {
    create(attributes: Row = {}): Promise<Row> {
      return testingApi<Row>(`/factories/${name}`, attributes);
    },
    async createList(count: number, attributes: Row = {}): Promise<Row[]> {
      const rows: Row[] = [];
      // One after another, so ids and sequences keep the order the specs expect
      for (let index = 0; index < count; index++) {
        const row = await testingApi<Row>(`/factories/${name}`, attributes);
        rows.push(row);
      }
      return rows;
    },
  };
}

export const homeworkFactory = remoteFactory("homework");
export const invoiceFactory = remoteFactory("invoices");
export const invoicePositionFactory = remoteFactory("invoicePositions");
export const patientFactory = remoteFactory("patients");
export const patientInvoiceFactory = remoteFactory("patientInvoices");
export const serviceAmountFactory = remoteFactory("serviceAmounts");
export const serviceFactory = remoteFactory("services");
export const sessionFactory = remoteFactory("sessions");
export const therapeutFactory = remoteFactory("therapeuts");
export const treatmentGoalFactory = remoteFactory("treatmentGoals");
export const treatmentPlanFactory = remoteFactory("treatmentPlans");
