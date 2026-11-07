"use server";

import { getInvoicesService } from "@/features/invoices";
import InvoiceForm from "../_forms/invoiceForm";
import { createInvoice } from "./action";

export default async function Page() {
  const invoicesService = await getInvoicesService();
  const [patients, services, invoiceNumber, therapeut] = await Promise.all([
    invoicesService.findPatients(),
    invoicesService.findBillableServices(),
    invoicesService.generateInvoiceNumber(),
    invoicesService.findIssuer(),
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
