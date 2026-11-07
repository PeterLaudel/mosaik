"use client";

import { IconButton, InputAdornment, TextField } from "@mui/material";
import { Close } from "@mui/icons-material";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export function Filter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const setSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if(value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const search = searchParams.get("search") || "";

  return (
    <TextField
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      label="Suche"
      size="small"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearch("")}
                sx={{ visibility: search ? "visible" : "hidden" }}
              >
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
