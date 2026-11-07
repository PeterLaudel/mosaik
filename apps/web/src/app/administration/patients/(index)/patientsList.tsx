"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, NoSsr } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Section from "@/components/section";
import { Patient } from "@mosaik/contract/models/patient";
import { Filter } from "./filter";
import { orpc } from "@/lib/orpc";
import { useState } from "react";

const columns: GridColDef<Patient>[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "surname", headerName: "Surname", flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
  {
    field: "birthdate",
    headerName: "Geburtsdatum",
    flex: 1,
    renderCell: (params) =>
      new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(params.value)),
  },
];

const DEFAULT_PAGE_SIZE = 10;

export default function PatientsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page")) || 0;
  const pageSize = Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE;

  const [paginationModel, setPaginationModel] = useState({
    page,
    pageSize,
    filterKey: search,
  });

  const currentPage =
    paginationModel.filterKey !== search ? 0 : paginationModel.page;
  const query = {
    search,
    page: currentPage,
    pageSize: paginationModel.pageSize,
  };

  const { data } = useQuery(
    orpc.patients.list.queryOptions({ input: query, placeholderData: keepPreviousData }),
  );

  return (
    <div className="m-4 grid gap-4 grid-flow-row h-fit">
      <h1>Patienten</h1>

      <Section>
        <div className="grid grid-flow-row gap-4">
          <div className="w-full flex justify-end gap-4">
            <Filter />
            <Button
              onClick={() => router.push("/administration/patients/create")}
            >
              Patienten anlegen
            </Button>
          </div>
          <NoSsr>
            <div className="h-full w-full">
              <DataGrid
                rows={data?.rows ?? []}
                rowCount={data?.total ?? 0}
                columns={columns}
                disableColumnMenu
                paginationMode="server"
                paginationModel={paginationModel}
                pageSizeOptions={[DEFAULT_PAGE_SIZE]}
                onPaginationModelChange={(model) =>
                  setPaginationModel({ ...model, filterKey: search })
                }
                onRowClick={(params) => {
                  router.push(`/administration/patients/${params.row.id}`);
                }}
                getRowId={(row) => row.id}
              />
            </div>
          </NoSsr>
        </div>
      </Section>
    </div>
  );
}
