import { getInvoicesService } from "@/features/invoices/legacy";
import { InvoiceViewer } from "./invoiceViewer";
import InvoiceForm from "../_forms/invoiceForm";
import { updateInvoice } from "./action";

type Props = {
  params: Promise<{
    invoiceId: number;
  }>;
};

export default async function Page({ params }: Props) {
  const invoicesService = await getInvoicesService();
  const therapeut = await invoicesService.findIssuer();
  if (!therapeut) {
    return <div>Bitte legen Sie zuerst den Therapeut vollständig an!</div>;
  }

  const { invoiceId } = await params;
  const invoice = await invoicesService.find(invoiceId);

  if (invoice.status !== "pending") {
    return <InvoiceViewer invoice={invoice} />;
  }

  const [patients, services] = await Promise.all([
    invoicesService.findPatients(),
    invoicesService.findBillableServices(),
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
