"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import PatientSection from "./patientSection";
import ServiceSection from "./serviceSection";
import InvoiceViewer from "./invoiceViewer";
import SubmitButton from "@/components/submitButton";
import { InvoiceCreate } from "@/features/invoices/repository";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { BillableService, Invoice, InvoiceIssuer, InvoicePatient } from "@/features/invoices/model";
import { useRouter } from "next/navigation";
import type { InvoicePosition } from "./serviceSection";

interface Props {
  action: (invoice: InvoiceCreate) => Promise<Invoice>;
  patients: InvoicePatient[];
  services: BillableService[];
  therapeut: InvoiceIssuer;
  invoiceNumber: string;
  initialValues?: FormInvoice;
}

export type FormInvoice = {
  patient?: InvoicePatient;
  invoicePositions: InvoicePosition[];
  invoiceAmount: number;
  base64Pdf?: string;
  invoiceNumber: string;
};

export default function InvoiceForm({
  action,
  patients,
  services,
  invoiceNumber,
  therapeut,
  initialValues,
}: Props) {
  const router = useRouter();
  const { showSuccessMessage } = useSnackbar();
  const [isPending, startTransition] = useTransition();

  const methods = useForm<FormInvoice>({
    defaultValues: initialValues ?? {
      invoiceNumber,
      invoicePositions: [
        { serviceDate: undefined, service: undefined, amount: 1, factor: undefined },
      ],
      invoiceAmount: 0,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = (values: FormInvoice) => {
    startTransition(async () => {
      const invoice = await action({
        patient: values.patient!,
        invoiceNumber: values.invoiceNumber,
        base64Pdf: values.base64Pdf!,
        invoiceAmount: values.invoiceAmount,
        status: "pending",
        positions: values.invoicePositions.map((position) => ({
          serviceDate: position.serviceDate!,
          service: position.service!,
          amount: position.amount,
          factor: position.factor!,
          price: position.price!,
        })),
      });
      showSuccessMessage("Rechnung wurde gespeichert");
      router.push(`/administration/invoices/${invoice.id}`);
    });
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="de"
      localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <FormProvider {...methods}>
        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          <div className="overflow-auto h-full">
            <form onSubmit={handleSubmit(onSubmit)} className="grid m-4 grid-flow-row gap-4 h-fit">
              <h1>Rechnung erstellen</h1>
              <PatientSection patients={patients} />
              <ServiceSection services={services} />
              <SubmitButton
                submitting={isSubmitting || isPending}
                className="justify-self-start self-center"
              >
                {initialValues ? "Speichern" : "Anlegen"}
              </SubmitButton>
            </form>
          </div>
          <InvoiceViewer therapeut={therapeut} invoiceNumber={invoiceNumber} />
        </div>
      </FormProvider>
    </LocalizationProvider>
  );
}
