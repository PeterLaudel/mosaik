"use client";

import "dayjs/locale/de";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { deDE } from "@mui/x-date-pickers/locales";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PatientSection from "./patientSection";
import BillingSection from "./billingSection";
import SubmitButton from "@/components/submitButton";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { useRouter } from "next/navigation";
import { billingInfoIsPatient } from "./billingInfoIsPatient";
import InvoiceSection from "./invoiceSection";
import { patientFormSchema, PatientFormData } from "./schema";
import { Patient, PatientCreate } from "@/contract";

interface Props {
  action: (patient: PatientCreate) => Promise<void>;
  initialValues?: Patient;
}

export default function PatientForm({ initialValues, action }: Props) {
  const { showSuccessMessage } = useSnackbar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      surname: initialValues?.surname ?? "",
      email: initialValues?.email ?? "",
      birthdate: initialValues?.birthdate ?? "",
      address: {
        street: initialValues?.address?.street ?? "",
        zip: initialValues?.address?.zip ?? "",
        city: initialValues?.address?.city ?? "",
      },
      diagnosis: initialValues?.diagnosis ?? null,
      billingInfo: {
        name: initialValues?.billingInfo?.name ?? "",
        surname: initialValues?.billingInfo?.surname ?? "",
        email: initialValues?.billingInfo?.email ?? "",
        address: {
          street: initialValues?.billingInfo?.address?.street ?? "",
          zip: initialValues?.billingInfo?.address?.zip ?? "",
          city: initialValues?.billingInfo?.address?.city ?? "",
        },
      },
      invoicePassword: initialValues?.invoicePassword ?? null,
      billingInfoIsPatient: billingInfoIsPatient(initialValues),
      enableInvoiceEncryption: initialValues ? initialValues.invoicePassword !== null : false,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = ({ billingInfoIsPatient, enableInvoiceEncryption, diagnosis, invoicePassword, ...data }: PatientFormData) => {
    startTransition(async () => {
      await action({
        ...data,
        diagnosis: diagnosis || null,
        invoicePassword: enableInvoiceEncryption ? invoicePassword ?? null : null,
      });
      showSuccessMessage("Patient wurde angelegt");
      router.push("/administration/patients");
    });
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="de"
      localeText={deDE.components.MuiLocalizationProvider.defaultProps.localeText}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-flow-row gap-4 h-fit">
          <PatientSection />
          <BillingSection />
          <InvoiceSection />
          <SubmitButton
            submitting={isSubmitting || isPending}
            className="justify-self-start self-center"
          >
            {initialValues ? "Speichern" : "Anlegen"}
          </SubmitButton>
        </form>
      </FormProvider>
    </LocalizationProvider>
  );
}
