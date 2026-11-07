import {
  getInvoicesRepository,
  getPatientsRepository,
  getServicesRepository,
  getTherapeutsRepository,
} from "@api/src/server";
import { InvoiceViewer } from "./invoiceViewer";
import InvoiceForm from "../_forms/invoiceForm";
import { updateInvoice } from "./action";

type Props = {
  params: Promise<{
    invoiceId: number;
  }>;
};

export default async function Page({ params }: Props) {
  const therapeutsRepository = await getTherapeutsRepository();
  const therapeuts = await therapeutsRepository.all();
  const therapeut = therapeuts[0];
  if (!therapeut) {
    return <div>Bitte legen Sie zuerst den Therapeut vollständig an!</div>;
  }

  const { invoiceId } = await params;
  const invoiceRepository = await getInvoicesRepository();
  const invoice = await invoiceRepository.find(invoiceId);

  if (invoice.status !== "pending") {
    return <InvoiceViewer invoice={invoice} />;
  }

  const patientRepository = await getPatientsRepository();
  const patients = await patientRepository.all();

  const servicesRepository = await getServicesRepository();
  const services = await servicesRepository.all();


  return (
    <InvoiceForm
      action={updateInvoice}
      invoiceId={invoice.id}
      therapeut={therapeut}
      services={services}
      patients={patients}
      invoiceNumber={invoice.invoiceNumber}
      initialValues={{
        base64Pdf: invoice.base64Pdf,
        invoiceAmount: invoice.invoiceAmount,
        invoiceNumber: invoice.invoiceNumber,
        invoicePositions: invoice.positions,
        patient: invoice.patient,
      }}
    />
  );
}
