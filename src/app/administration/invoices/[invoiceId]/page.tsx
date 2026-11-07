import { getInvoicesRepository } from "@/features/invoices";
import { InvoiceViewer } from "./invoiceViewer";
import InvoiceForm from "../_forms/invoiceForm";
import { updateInvoice } from "./action";

type Props = {
  params: Promise<{
    invoiceId: number;
  }>;
};

export default async function Page({ params }: Props) {
  const invoiceRepository = await getInvoicesRepository();
  const therapeut = await invoiceRepository.findIssuer();
  if (!therapeut) {
    return <div>Bitte legen Sie zuerst den Therapeut vollständig an!</div>;
  }

  const { invoiceId } = await params;
  const invoice = await invoiceRepository.find(invoiceId);

  if (invoice.status !== "pending") {
    return <InvoiceViewer invoice={invoice} />;
  }

  const [patients, services] = await Promise.all([
    invoiceRepository.findPatients(),
    invoiceRepository.findBillableServices(),
  ]);

  return (
    <InvoiceForm
      action={updateInvoice.bind(null, invoice.id)}
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
