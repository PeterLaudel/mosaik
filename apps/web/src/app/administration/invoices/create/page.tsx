"use server";

import {
  getInvoicesRepository,
  getPatientsRepository,
  getServicesRepository,
  getTherapeutsRepository,
} from "@api/src/server";
import InvoiceForm from "../_forms/invoiceForm";
import { createInvoice } from "./action";

export default async function Page() {
  const patientRepository = await getPatientsRepository();
  const patients = await patientRepository.all();

  const servicesRepository = await getServicesRepository();
  const services = await servicesRepository.all();

  const invoiceRepository = await getInvoicesRepository();
  const invoiceNumber = await invoiceRepository.generateInvoiceNumber();

  const therapeutsRepository = await getTherapeutsRepository();
  const therapeuts = await therapeutsRepository.all();
  const therapeut = therapeuts[0];
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
