import { CheckCircle, Email, HourglassEmpty } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import { useState } from "react";
import {
  markInvoiceAsPaid,
  markInvoiceAsPending,
  markInvoiceAsSent,
} from "./action";
import { useQueryClient } from "@tanstack/react-query";
import { Invoice } from "@peterlaudel/mosaik-contract";

interface Props {
  invoice: Invoice;
}

export function InvoiceStatus({ invoice }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const queryClient = useQueryClient();
  return (
    <>
      <Button
        onClick={(e) =>
          setAnchorEl((prev) => (prev ? null : e.currentTarget))
        }
        className="flex items-center gap-1"
      >
        {invoice.status === "pending" && (
          <>
            <HourglassEmpty className="text-amber-400" />
            Erstellt
            <ArrowDropDownIcon />
          </>
        )}
        {invoice.status === "sent" && (
          <>
            <Email className="text-blue-500" />
            Versendet
            <ArrowDropDownIcon />
          </>
        )}
        {invoice.status === "paid" && (
          <>
            <CheckCircle className="text-green-500" />
            Bezahlt
            <ArrowDropDownIcon />
          </>
        )}
      </Button>
      <Menu
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          value="pending"
          className="gap-2 flex items-center"
          onClick={async () => {
            await markInvoiceAsPending(invoice.id);
            setAnchorEl(null);
            await queryClient.invalidateQueries({ queryKey: ["invoices"] });
          }}
        >
          <HourglassEmpty className="text-amber-400" />
          Erstellt
        </MenuItem>
        <MenuItem
          value="sent"
          className="gap-2 flex items-center"
          onClick={async () => {
            await markInvoiceAsSent(invoice.id);
            setAnchorEl(null);
            await queryClient.invalidateQueries({ queryKey: ["invoices"] });
          }}
        >
          <Email className="text-blue-500" />
          Versendet
        </MenuItem>
        <MenuItem
          value="paid"
          className="gap-2 flex items-center"
          onClick={async () => {
            await markInvoiceAsPaid(invoice.id);
            setAnchorEl(null);
            await queryClient.invalidateQueries({ queryKey: ["invoices"] });
          }}
        >
          <CheckCircle className="text-green-500" />
          Als Bezahlt markieren
        </MenuItem>
      </Menu>
    </>
  );
}
