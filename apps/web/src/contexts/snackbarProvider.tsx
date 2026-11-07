"use client";

import { Alert } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import { createContext, useContext, useState } from "react";

const SnackBarContext = createContext<{
  showSuccessMessage: (message: string) => void;
} | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const showSuccessMessage = (msg: string) => {
    setMessage(msg);
    setSeverity("success");
    setOpen(true);
  };

  return (
    <SnackBarContext.Provider
      value={{
        showSuccessMessage,
      }}
    >
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackBarContext.Provider>
  );
}

export const useSnackbar = () => {
  const context = useContext(SnackBarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
