import { Button, CircularProgress, Dialog, IconButton } from "@mui/material";
import { Delete, Download, Send } from "@mui/icons-material";
import { deleteInvoice, sendInvoiceEmail } from "./action";
import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Invoice } from "@/contract";

interface Props {
  invoice: Invoice;
}

export function InvoiceAction({ invoice }: Props) {
  return (
    <>
      {invoice.status === "pending" && <SendButton invoice={invoice} />}
      <DownloadButton invoice={invoice} />
      <DeleteButton invoice={invoice} />
    </>
  );
}

function SendButton({ invoice }: { invoice: Invoice }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <>
      <IconButton
        onClick={() => setOpen((isOpen) => !isOpen)}
        disabled={isPending}
        aria-label="Rechnung senden"
      >
        {!isPending && <Send />}
        {isPending && <CircularProgress size={"1em"} color="inherit" />}
      </IconButton>
      <Dialog open={open}>
        <div className="p-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Rechnung senden?</h2>
          <p>
            {`Sind Sie sicher, dass Sie diese Rechnung per E-Mail an ${invoice.patient.billingInfo.email} senden möchten?`}
          </p>
          <div className="flex justify-end gap-4">
            <Button onClick={() => setOpen(false)} disabled={isPending}>
              Abbrechen
            </Button>
            <Button
              onClick={() =>
                startTransition(async () => {
                  await sendInvoiceEmail(invoice.id);
                  setOpen(false);
                  await queryClient.invalidateQueries({ queryKey: ["invoices"] });
                })
              }
              disabled={isPending}
            >
              {!isPending && "Senden"}
              {isPending && <CircularProgress size={"1em"} color="inherit" />}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

function DownloadButton({ invoice }: { invoice: Invoice }) {
  return (
    <IconButton
      href={`/api/invoices/by-number/${invoice.invoiceNumber}/pdf`}
      target="_blank"
      download={true}
    >
      <Download />
    </IconButton>
  );
}

function DeleteButton({ invoice }: { invoice: Invoice }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <>
      <IconButton onClick={() => setOpen(true)} disabled={isPending}>
        {!isPending && <Delete />}
        {isPending && <CircularProgress size={"1em"} color="inherit" />}
      </IconButton>
      <Dialog open={open}>
        <div className="p-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Rechnung löschen?</h2>
          <p>Sind Sie sicher, dass Sie diese Rechnung löschen möchten?</p>
          <div className="flex justify-end gap-4">
            <Button onClick={() => setOpen(false)} disabled={isPending}>
              Abbrechen
            </Button>
            <Button
              onClick={() =>
                startTransition(async () => {
                  await deleteInvoice(invoice.id);
                  setOpen(false);
                  await queryClient.invalidateQueries({ queryKey: ["invoices"] });
                })
              }
              disabled={isPending}
            >
              {!isPending && "Löschen"}
              {isPending && <CircularProgress size={"1em"} color="inherit" />}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
