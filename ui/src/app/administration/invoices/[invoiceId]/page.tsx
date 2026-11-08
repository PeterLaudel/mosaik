import { InvoiceViewer } from "./invoiceViewer";
import InvoiceForm from "../_forms/invoiceForm";
import { updateInvoice } from "./action";
import { serverApi } from "@/lib/api/server";

type Props = {
  params: Promise<{
    invoiceId: number;
  }>;
};

export default async function Page({ params }: Props) {
  const api = await serverApi();
  const therapeut = await api.invoices.findIssuer();
  if (!therapeut) {
    return <div>Bitte legen Sie zuerst den Therapeut vollständig an!</div>;
  }

  const { invoiceId } = await params;
  const invoice = await api.invoices.find({ id: invoiceId });

  if (invoice.status !== "pending") {
    return <InvoiceViewer invoice={invoice} />;
  }

  const [patients, services] = await Promise.all([
    api.invoices.findPatients(),
    api.invoices.findBillableServices(),
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
