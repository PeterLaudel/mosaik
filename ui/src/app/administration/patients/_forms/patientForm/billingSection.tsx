"use client";

import Section from "@/components/section";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { PatientFormData } from "./schema";

export default function BillingSection() {
  const { control, setValue, getValues } = useFormContext<PatientFormData>();
  const billingIsPatient = useWatch({ control, name: "billingInfoIsPatient" });

  const syncBillingFromPatient = () => {
    const name = getValues("name");
    const surname = getValues("surname");
    const email = getValues("email");
    const street = getValues("address.street");
    const zip = getValues("address.zip");
    const city = getValues("address.city");
    setValue("billingInfo.name", name);
    setValue("billingInfo.surname", surname);
    setValue("billingInfo.email", email);
    setValue("billingInfo.address.street", street);
    setValue("billingInfo.address.zip", zip);
    setValue("billingInfo.address.city", city);
  };

  return (
    <Section>
      <h2 className="mb-4">Rechnungsdaten</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Controller
            name="billingInfoIsPatient"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      field.onChange(enabled);
                      if (enabled) syncBillingFromPatient();
                    }}
                  />
                }
                label="Rechnung an Patienten"
              />
            )}
          />
        </div>
        <Controller
          name="billingInfo.name"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} label="Name" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name="billingInfo.surname"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} label="Nachname" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name="billingInfo.email"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} className="col-span-2" label="E-Mail" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name="billingInfo.address.street"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} className="col-span-2" label="Straße" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name="billingInfo.address.zip"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} label="PLZ" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
        <Controller
          name="billingInfo.address.city"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField {...field} label="Stadt" disabled={billingIsPatient} error={!!error} helperText={error?.message} />
          )}
        />
      </div>
    </Section>
  );
}
