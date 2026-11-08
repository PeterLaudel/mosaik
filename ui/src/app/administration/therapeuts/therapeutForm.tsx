"use client";

import Section from "@/components/section";
import SubmitButton from "@/components/submitButton";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { TherapeutFormData, therapeutSchema } from "./validateTherapeut";
import { Therapeut, TherapeutCreate } from "@peterlaudel/mosaik-contract";

interface Props {
  action: (data: TherapeutCreate) => Promise<void>;
  therapeut?: Therapeut;
}

export function TherapeutForm({ action, therapeut }: Props) {
  const { showSuccessMessage } = useSnackbar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<TherapeutFormData>({
    resolver: zodResolver(therapeutSchema),
    defaultValues: {
      title: therapeut?.title ?? "",
      name: therapeut?.name ?? "",
      surname: therapeut?.surname ?? "",
      street: therapeut?.street ?? "",
      zip: therapeut?.zip ?? "",
      city: therapeut?.city ?? "",
      email: therapeut?.email ?? "",
      phone: therapeut?.phone ?? "",
      taxId: therapeut?.taxId ?? "",
      bankName: therapeut?.bankName ?? "",
      iban: therapeut?.iban ?? "",
      bic: therapeut?.bic ?? "",
      website: therapeut?.website ?? "",
      enr: therapeut?.enr ?? "",
    },
  });

  const onSubmit = (data: TherapeutFormData) => {
    startTransition(async () => {
      await action(data);
      showSuccessMessage("Therapeut gespeichert");
      router.push("/administration/therapeuts");
    });
  };

  const field = (name: keyof TherapeutFormData, label: string, className?: string) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          label={label}
          className={className}
          {...field}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );

  return (
    <div className="grid gap-4 m-4">
      <h1>Therapeut</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <Section>
          <div className="grid gap-4 grid-cols-2">
            {field("title", "Titel")}
            {field("name", "Vorname", "col-start-[1]")}
            {field("surname", "Name")}
            {field("street", "Straße")}
            {field("zip", "PLZ")}
            {field("city", "Ort")}
            {field("email", "E-Mail")}
            {field("phone", "Telefon")}
            {field("taxId", "Steuer-ID")}
            {field("bankName", "Bankname")}
            {field("iban", "IBAN")}
            {field("bic", "BIC")}
            {field("website", "Webseite")}
            {field("enr", "ENR")}
          </div>
        </Section>
        <SubmitButton submitting={isSubmitting || isPending} className="justify-self-start">
          Speichern
        </SubmitButton>
      </form>
    </div>
  );
}
