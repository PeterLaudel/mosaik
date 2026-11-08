"use server";

import InvoiceForm from "../_forms/invoiceForm";
import { createInvoice } from "./action";
import { serverApi } from "@/lib/api/server";

export default async function Page() {
  const api = await serverApi();
  const [patients, services, invoiceNumber, therapeut] = await Promise.all([
    api.invoices.findPatients(),
    api.invoices.findBillableServices(),
    api.invoices.generateInvoiceNumber(),
    api.invoices.findIssuer(),
  ]);
  if (!therapeut) {
    return <div>Bitte legen Sie zuerst den Therapeut vollständig an!</div>;
  }

  return (
    <InvoiceForm
      action={createInvoice}
      therapeut={therapeut}
      patients={patients}
      services={services}
      invoiceNumber={invoiceNumber}
    />
  );
}
