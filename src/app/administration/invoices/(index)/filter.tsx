"use client";

import { HourglassEmpty, Send, CheckCircle, Close } from "@mui/icons-material";
import { Autocomplete, IconButton, InputAdornment, TextField } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Invoice } from "@/contract";

type InvoiceStatus = Invoice["status"];

const statusOptions: { value: InvoiceStatus; label: string; icon: React.ReactNode }[] = [
  { value: "pending", label: "Offen", icon: <HourglassEmpty className="text-amber-400" fontSize="small" /> },
  { value: "sent", label: "Gesendet", icon: <Send className="text-blue-400" fontSize="small" /> },
  { value: "paid", label: "Bezahlt", icon: <CheckCircle className="text-green-400" fontSize="small" /> },
];

export function Filter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if(value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const selectedOption = statusOptions.find((o) => o.value === searchParams.get("status"));

  return (
    <div className="flex items-center gap-4">
      <TextField
        value={searchParams.get("search") || ""}
        onChange={(e) => setParam("search", e.target.value)}
        label="Suche"
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setParam("search", null)}
                  sx={{ visibility: searchParams.get("search") ? "visible" : "hidden" }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <Autocomplete
        value={selectedOption}
        onChange={(_, option) => setParam("status", option?.value ?? null)}
        options={statusOptions}
        getOptionLabel={(o) => o.label}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
          </li>
        )}
        renderInput={(params) => <TextField {...params} label="Status" size="small" />}
        sx={{ minWidth: 150 }}
      />
    </div>
  );
}
