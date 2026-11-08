"use client";

import Section from "@/components/section";
import { Button, NoSsr, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchServices, servicesQueryKey } from "@/lib/queries/services";
import { useState } from "react";
import { Service, FACTORS } from "@peterlaudel/mosaik-contract";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", flex: 1 },
  { field: "short", headerName: "Kürzel", flex: 1 },
  { field: "originalGopNr", headerName: "GopNr", flex: 1 },
  {
    field: "description",
    headerName: "Beschreibung",
    flex: 3,
    renderCell: (params) => (
      <Tooltip title={params.value} placement="top-start">
        <span className="truncate">{params.value}</span>
      </Tooltip>
    ),
  },
  { field: "points", headerName: "Punkte", flex: 1 },
  ...FACTORS.map<GridColDef>((factor) => ({
    field: `${factor}`,
    headerName: `${factor}-fach in €`,
    flex: 1,
  })),
];

const DEFAULT_PAGE_SIZE = 10;

export default function ServiceList() {
  const router = useRouter();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const query = { ...paginationModel };

  const { data } = useQuery({
    queryKey: servicesQueryKey(query),
    queryFn: () => fetchServices(query),
    placeholderData: keepPreviousData,
  });

  const rows = (data?.rows ?? []).map((service: Service) => ({
    ...service,
    ...service.amounts.reduce((acc, amount) => {
      return { [amount.factor]: amount.price, ...acc };
    }, {} as Record<string, number | null>),
  }));

  return (
    <div className="m-4 grid gap-4 grid-flow-row h-fit">
      <h1>Leistungen</h1>
      <Section>
        <div className="grid grid-flow-row gap-4">
          <div className="w-full flex justify-end">
            <Button
              onClick={() => router.push("/administration/services/create")}
            >
              Leistung anlegen
            </Button>
          </div>
          <NoSsr>
            <div className="h-full w-full">
              <DataGrid
                rows={rows}
                rowCount={data?.total ?? 0}
                columns={columns}
                disableColumnMenu
                paginationMode="server"
                paginationModel={paginationModel}
                pageSizeOptions={[DEFAULT_PAGE_SIZE]}
                onPaginationModelChange={setPaginationModel}
                onRowClick={(params) =>
                  router.push(`/administration/services/${params.row.id}`)
                }
              />
            </div>
          </NoSsr>
        </div>
      </Section>
    </div>
  );
}
