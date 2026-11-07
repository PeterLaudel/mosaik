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
import { Patient } from "@mosaik/contract/models/patient";
import SubmitButton from "@/components/submitButton";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient, orpc } from "@/lib/orpc";
import { billingInfoIsPatient } from "./billingInfoIsPatient";
import InvoiceSection from "./invoiceSection";
import { patientFormSchema, PatientFormData } from "./schema";

interface Props {
  initialValues?: Patient;
}

export default function PatientForm({ initialValues }: Props) {
  const queryClient = useQueryClient();
  const { showSuccessMessage } = useSnackbar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const methods = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      id: initialValues?.id,
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
      const { id, ...patient } = {
        ...data,
        diagnosis: diagnosis || null,
        invoicePassword: enableInvoiceEncryption ? invoicePassword ?? null : null,
      };
      if (id) {
        await apiClient.patients.update({ ...patient, id });
      } else {
        await apiClient.patients.create(patient);
      }
      await queryClient.invalidateQueries({ queryKey: orpc.patients.key() });
      showSuccessMessage("Patient wurde angelegt");
      router.push("/administration/patients");
      router.refresh();
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
