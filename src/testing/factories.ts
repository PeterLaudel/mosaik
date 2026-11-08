// The table factories e2e may seed through the test API, by name. Loaded lazily, so faker and the
// factories are only pulled in when the test API is actually used.
export async function loadFactories() {
  const [
    homework,
    invoicePositions,
    invoices,
    patientInvoices,
    patients,
    serviceAmounts,
    services,
    sessions,
    therapeuts,
    treatmentGoals,
    treatmentPlans,
  ] = await Promise.all([
    import("factories/homework"),
    import("factories/invoicePositions"),
    import("factories/invoices"),
    import("factories/patientInvoices"),
    import("factories/patients"),
    import("factories/serviceAmounts"),
    import("factories/services"),
    import("factories/sessions"),
    import("factories/therapeuts"),
    import("factories/treatmentGoals"),
    import("factories/treatmentPlans"),
  ]);

  return {
    homework: homework.homeworkFactory,
    invoicePositions: invoicePositions.invoicePositionFactory,
    invoices: invoices.invoiceFactory,
    patientInvoices: patientInvoices.patientInvoiceFactory,
    patients: patients.patientFactory,
    serviceAmounts: serviceAmounts.serviceAmountFactory,
    services: services.serviceFactory,
    sessions: sessions.sessionFactory,
    therapeuts: therapeuts.therapeutFactory,
    treatmentGoals: treatmentGoals.treatmentGoalFactory,
    treatmentPlans: treatmentPlans.treatmentPlanFactory,
  };
}

export type FactoryName = keyof Awaited<ReturnType<typeof loadFactories>>;
