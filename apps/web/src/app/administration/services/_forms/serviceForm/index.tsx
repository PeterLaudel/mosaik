"use client";

import Section from "@/components/section";
import SubmitButton from "@/components/submitButton";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { Service, factorArray } from "@mosaik/contract/models/service";
import { ServiceSave } from "@api/src/repositories/servicesRepository";
import { TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ServiceFormData, serviceSchema } from "./schema";
import PriceInput from "./priceInput";

interface Props {
  action: (data: ServiceSave) => Promise<void>;
  initialValues?: Service;
}

export default function ServiceForm({ action, initialValues }: Props) {
  const { showSuccessMessage } = useSnackbar();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: determineDefaultValues(initialValues),
  });

  const onSubmit = ({ amounts, ...rest }: ServiceFormData) => {
    const serviceSave = {
      ...rest,
      amounts: amounts.filter((a): a is { factor: typeof a.factor; price: number } => a.price !== undefined),
    };
    startTransition(async () => {
      await action(serviceSave);
      showSuccessMessage("Leistung gespeichert");
      router.push("/administration/services");
    });
  };

  return (
    <div className="grid gap-4 m-4">
      <h1>{initialValues ? "Leistung bearbeiten" : "Leistung anlegen"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <Section>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="short"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField label="Kürzel" {...field} error={!!error} helperText={error?.message} />
              )}
            />
            <Controller
              name="originalGopNr"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField label="GOP-Nr" {...field} error={!!error} helperText={error?.message} />
              )}
            />
            <Controller
              name="points"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label="Punkte"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label="Beschreibung"
                  multiline
                  rows={4}
                  className="col-span-2"
                  {...field}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
            <Controller
              name="note"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  label="Hinweis"
                  multiline
                  rows={2}
                  className="col-span-2"
                  {...field}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </div>
        </Section>
        <Section>
          <h2 className="mb-4">Preise</h2>
          <div className="grid grid-cols-3 gap-4">
            {factorArray.map((factor, index) => (
              <Controller
                key={factor}
                name={`amounts.${index}.price`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <PriceInput
                    label={`${factor}-fach in €`}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            ))}
          </div>
        </Section>
        <SubmitButton submitting={isSubmitting || isPending} className="justify-self-start">
          {initialValues ? "Speichern" : "Anlegen"}
        </SubmitButton>
      </form>
    </div>
  );
}

function determineDefaultValues(initialValues?: Service): ServiceFormData {
  return {
    id: initialValues?.id,
    short: initialValues?.short ?? "",
    originalGopNr: initialValues?.originalGopNr ?? "",
    description: initialValues?.description ?? "",
    note: initialValues?.note,
    points: initialValues?.points ?? 0,
    amounts: factorArray.map((factor) => ({
      factor,
      price: initialValues?.amounts.find((a) => a.factor === factor)?.price,
    })),
  };
}
