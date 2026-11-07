"use client";

import Section from "@/components/section";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { PatientFormData } from "./schema";

export default function InvoiceSection() {
  const { control, setValue } = useFormContext<PatientFormData>();

  const [enableInvoiceEncryption, name, surname, birthdate] = useWatch({
    control,
    name: ["enableInvoiceEncryption", "name", "surname", "birthdate"],
  });

  const onEnableChange = (enabled: boolean) => {
    setValue("enableInvoiceEncryption", enabled);
    setValue("invoicePassword", enabled ? createPassword(name, surname, birthdate) : null);
  };

  return (
    <Section>
      <h2 className="mb-4">Rechnungen</h2>
      <div className="grid grid-cols-2 gap-4">
        <FormControlLabel
          label="Rechnung mit Passwort schützen"
          control={
            <Checkbox
              checked={enableInvoiceEncryption}
              onChange={(e) => onEnableChange(e.target.checked)}
            />
          }
        />
        <Controller
          name="invoicePassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              disabled={!enableInvoiceEncryption}
              label="Rechnungspasswort"
            />
          )}
        />
      </div>
    </Section>
  );
}

function createPassword(name?: string, surname?: string, birthdate?: string) {
  return `${name?.at(0) ?? ""}${surname?.at(0) ?? ""}${birthdate?.replaceAll("-", "") ?? ""}`.toUpperCase();
}
