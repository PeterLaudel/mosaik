"use client";

import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller, useFormContext } from "react-hook-form";
import Section from "@/components/section";
import type { FormInvoice } from ".";
import { InvoicePatient } from "@/contract";

interface Props {
  patients: InvoicePatient[];
}

export default function PatientSection({ patients }: Props) {
  const { control } = useFormContext<FormInvoice>();

  return (
    <Section>
      <h2 className="mb-4">Patient</h2>
      <div className="grid grid-flow-col gap-x-4">
        <Controller
          name="patient"
          control={control}
          rules={{ required: "Bitte wählen Sie einen Patienten aus" }}
          render={({ field, fieldState: { error } }) => (
            <Autocomplete
              options={patients}
              onChange={(_, value) => field.onChange(value)}
              getOptionLabel={(patient) => `${patient.name} ${patient.surname}`}
              getOptionKey={(patient) => patient.id}
              value={patients.find(({ id }) => id === field.value?.id) ?? null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Patient"
                  onBlur={field.onBlur}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />
      </div>
    </Section>
  );
}
