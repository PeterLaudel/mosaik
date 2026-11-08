"use client";

import { TextField } from "@mui/material";
import { useState } from "react";

interface Props {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  error: boolean;
  helperText?: string;
  label: string;
}

export default function PriceInput({ value, onChange, error, helperText, label }: Props) {
  const [display, setDisplay] = useState(
    value !== undefined ? String(value).replace(".", ",") : ""
  );

  return (
    <TextField
      label={label}
      inputMode="decimal"
      value={display}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplay(raw);
        if (raw === "") {
          onChange(undefined);
        } else {
          const num = parseFloat(raw.replace(",", "."));
          if (!isNaN(num)) onChange(num);
        }
      }}
      error={error}
      helperText={helperText}
    />
  );
}
