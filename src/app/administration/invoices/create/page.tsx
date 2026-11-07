"use server";

import { getInvoicesRepository } from "@/features/invoices";
import InvoiceForm from "../_forms/invoiceForm";
import { createInvoice } from "./action";

export default async function Page() {
  const invoiceRepository = await getInvoicesRepository();
  const [patients, services, invoiceNumber, therapeut] = await Promise.all([
    invoiceRepository.findPatients(),
    invoiceRepository.findBillableServices(),
    invoiceRepository.generateInvoiceNumber(),
    invoiceRepository.findIssuer(),
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
