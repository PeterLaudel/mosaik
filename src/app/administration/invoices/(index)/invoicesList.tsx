"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, NoSsr } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Invoice } from "@/features/invoices/model";
import Section from "@/components/section";
import { InvoiceAction } from "./invoiceAction";
import { InvoiceStatus } from "./invoiceStatus";
import { Filter } from "./filter";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchInvoices, invoicesQueryKey } from "@/features/invoices/queries";
import { useState } from "react";

const GermanyCurrencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const columns: GridColDef<Invoice>[] = [
  { field: "invoiceNumber", headerName: "Rechnungsnummer", flex: 1 },
  {
    field: "name",
    headerName: "Vorname",
    flex: 1,
    renderCell: (params) => params.row.patient.name,
  },
  {
    field: "surname",
    headerName: "Nachname",
    flex: 1,
    renderCell: (params) => params.row.patient.surname,
  },
  {
    field: "invoiceAmount",
    headerName: "Betrag",
    width: 110,
    valueFormatter: (params) => GermanyCurrencyFormatter.format(params),
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
    align: "center",
    renderCell: (params) => <InvoiceStatus invoice={params.row} />,
  },
  {
    field: "action",
    headerName: "",
    renderCell: (params) => <InvoiceAction invoice={params.row} />,
    flex: 1,
    align: "right",
  },
];

const DEFAULT_PAGE_SIZE = 10;

export function InvoicesList() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const filters = {
    search: searchParams.get("search") ?? "",
    status: searchParams.get("status") as Invoice["status"] ?? undefined,
  };

  const filterKey = `${filters.search}|${filters.status}`;
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: DEFAULT_PAGE_SIZE, filterKey });

  const page = paginationModel.filterKey !== filterKey ? 0 : paginationModel.page;
  const query = { ...filters, page, pageSize: paginationModel.pageSize };

  const { data } = useQuery({
    queryKey: invoicesQueryKey(query),
    queryFn: () => fetchInvoices(query),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="m-4 grid gap-4 grid-flow-row h-fit">
      <h1>Rechnungen</h1>
      <Section>
        <div className="grid grid-flow-row gap-4">
          <div className="w-full flex justify-end gap-4">
            <Filter />
            <Button
              onClick={() => router.push("/administration/invoices/create")}
            >
              Rechnung anlegen
            </Button>
          </div>
          <NoSsr>
            <div className="h-full w-full">
              <DataGrid<Invoice>
                rows={data?.rows ?? []}
                rowCount={data?.total ?? 0}
                columns={columns}
                disableColumnMenu
                paginationMode="server"
                paginationModel={paginationModel}
                pageSizeOptions={[DEFAULT_PAGE_SIZE]}
                onPaginationModelChange={(model) => setPaginationModel({ ...model, filterKey })}
                onRowClick={(params, event) => {
                  const tartget = event.target as HTMLElement;
                  if (tartget.closest("button") || tartget.closest("a")) {
                    return;
                  }
                  router.push(`/administration/invoices/${params.row.id}`);
                }}
              />
            </div>
          </NoSsr>
        </div>
      </Section>
    </div>
  );
}
