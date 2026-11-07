"use client";

import "dayjs/locale/de";

import { Add } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Fragment } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Factor, Service } from "@mosaik/contract/models/service";
import Section from "@/components/section";
import type { FormInvoice } from ".";

export interface InvoicePosition {
  serviceDate?: string;
  service?: Service;
  amount: number;
  factor?: Factor;
  price?: number;
}

interface Props {
  services: Service[];
}

export default function ServiceSection({ services }: Props) {
  const { control, getValues, setValue } = useFormContext<FormInvoice>();
  const { fields, append, remove } = useFieldArray({ control, name: "invoicePositions" });

  const recomputeTotal = () => {
    const positions = getValues("invoicePositions");
    const total = positions.reduce((sum, p) => sum + (p.price ?? 0), 0);
    setValue("invoiceAmount", total);
  };

  const addEntry = () =>
    append({ serviceDate: undefined, service: undefined, amount: 1, factor: undefined });

  const removeEntry = (index: number) => {
    remove(index);
    recomputeTotal();
  };

  return (
    <Section>
      <h2 className="mb-4">Leistungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-4 lg:grid-cols-[2fr_2fr_1fr_1fr_auto] items-start">
        {fields.map((field, index) => (
          <Fragment key={field.id}>
            <ServiceRow
              index={index}
              services={services}
              onRemove={() => removeEntry(index)}
              isLast={index === fields.length - 1}
              onAdd={addEntry}
              canRemove={fields.length > 1}
              onRecomputeTotal={recomputeTotal}
            />
          </Fragment>
        ))}
      </div>
    </Section>
  );
}

interface ServiceRowProps {
  index: number;
  services: Service[];
  onRemove: () => void;
  isLast: boolean;
  onAdd: () => void;
  canRemove: boolean;
  onRecomputeTotal: () => void;
}

function ServiceRow({ index, services, onRemove, isLast, onAdd, canRemove, onRecomputeTotal }: ServiceRowProps) {
  const { control, setValue, getValues } = useFormContext<FormInvoice>();
  const service = useWatch({ control, name: `invoicePositions.${index}.service` });

  const computePrice = () => {
    const svc = getValues(`invoicePositions.${index}.service`);
    const factor = getValues(`invoicePositions.${index}.factor`);
    const amount = getValues(`invoicePositions.${index}.amount`);
    const price = svc && factor
      ? (svc.amounts.find((a) => a.factor === factor)?.price ?? 0) * amount
      : undefined;
    setValue(`invoicePositions.${index}.price`, price);
    onRecomputeTotal();
  };

  return (
    <>
      <Controller
        name={`invoicePositions.${index}.serviceDate`}
        control={control}
        rules={{ required: "Leistungs Datum wird benötigt" }}
        render={({ field, fieldState: { error } }) => (
          <DatePicker
            label="Leistungs Datum"
            value={field.value ? dayjs(field.value) : null}
            onChange={(newValue) => field.onChange(newValue ? newValue.format("YYYY-MM-DD") : null)}
            minDate={dayjs.unix(0)}
            slotProps={{
              textField: {
                helperText: error?.message,
                error: !!error,
                onBlur: field.onBlur,
              },
            }}
          />
        )}
      />
      <Controller
        name={`invoicePositions.${index}.service`}
        control={control}
        rules={{ required: "Eine Leistung wird benötigt" }}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            options={services}
            onChange={(_, value) => {
              field.onChange(value);
              setValue(`invoicePositions.${index}.factor`, value?.amounts.at(-1)?.factor ?? undefined);
              computePrice();
            }}
            getOptionLabel={(option) => option.short}
            getOptionKey={(option) => option.id}
            value={services.find((s) => s.id === field.value?.id) ?? null}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error}
                helperText={error?.message}
                label="Leistung"
                onBlur={field.onBlur}
              />
            )}
          />
        )}
      />
      <Controller
        name={`invoicePositions.${index}.amount`}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            disabled={!service}
            label="Anzahl"
            slotProps={{ htmlInput: { min: 1 } }}
            onChange={(e) => {
              field.onChange(Number(e.target.value));
              computePrice();
            }}
          />
        )}
      />
      <Controller
        name={`invoicePositions.${index}.factor`}
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Faktor"
            disabled={!service}
            value={field.value ?? ""}
            onChange={(e) => {
              field.onChange(e.target.value as Factor);
              computePrice();
            }}
            onBlur={field.onBlur}
          >
            {(service?.amounts ?? []).map(({ factor }) => (
              <MenuItem key={factor} value={factor}>
                {factor}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <div className="flex min-h-14 items-center">
        <IconButton onClick={onRemove} disabled={!canRemove}>
          <DeleteIcon />
        </IconButton>
      </div>
      {isLast && (
        <div className="justify-self-start">
          <IconButton onClick={onAdd}>
            <Add />
          </IconButton>
        </div>
      )}
    </>
  );
}
