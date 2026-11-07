"use client";

import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Chip, NoSsr } from "@mui/material";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Section from "@/components/section";
import { Session } from "@/features/sessions/model";
import { sessionsQueryKey, fetchSessions } from "@/features/sessions/queries";
import { createSession } from "./actions";

const riskColors: Record<string, "default" | "warning" | "error" | "success"> = {
  none: "default",
  low: "warning",
  moderate: "warning",
  high: "error",
};

const riskLabels: Record<string, string> = {
  none: "Kein",
  low: "Niedrig",
  moderate: "Mittel",
  high: "Hoch",
};

const columns: GridColDef<Session>[] = [
  {
    field: "sessionDate",
    headerName: "Datum",
    flex: 1,
    renderCell: (params) =>
      new Intl.DateTimeFormat("de-DE").format(new Date(params.value)),
  },
  { field: "sessionNumber", headerName: "Nr.", width: 60 },
  { field: "sessionType", headerName: "Typ", flex: 1 },
  { field: "phase", headerName: "Phase", flex: 1, valueFormatter: (value) => value ?? "—" },
  {
    field: "riskLevel",
    headerName: "Risiko",
    flex: 1,
    renderCell: (params) =>
      params.value ? (
        <Chip
          label={riskLabels[params.value] ?? params.value}
          color={riskColors[params.value] ?? "default"}
          size="small"
        />
      ) : (
        "—"
      ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 100,
    renderCell: (params) =>
      params.value === "draft" ? (
        <Chip label="Entwurf" size="small" variant="outlined" />
      ) : null,
  },
];

interface Props {
  patientId: string;
  initialSessions: Session[];
  openSession: Session | null;
}

export default function PatientSessionsList({ patientId, initialSessions, openSession }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const query = { patientId: Number(patientId) };

  const { data } = useQuery({
    queryKey: sessionsQueryKey(query),
    queryFn: () => fetchSessions(query),
    initialData: { rows: initialSessions, total: initialSessions.length },
  });

  const sessionUrl = (id: number) =>
    `/administration/patients/${patientId}/sessions/${id}`;

  return (
    <Section>
      <div className="grid grid-flow-row gap-4">
        <div className="flex justify-end">
          {openSession ? (
            <Button onClick={() => router.push(sessionUrl(openSession.id))}>
              Sitzung fortsetzen
            </Button>
          ) : (
            <Button
              disabled={creating}
              onClick={() => {
                setCreating(true);
                void createSession(Number(patientId)).then((session) => {
                  router.push(sessionUrl(session.id));
                });
              }}
            >
              Sitzung starten
            </Button>
          )}
        </div>
        <NoSsr>
          <div className="h-full w-full">
            <DataGrid
              rows={data?.rows ?? []}
              columns={columns}
              disableColumnMenu
              autoHeight
              onRowClick={(params) =>
                router.push(
                  `/administration/patients/${patientId}/sessions/${params.row.id}`
                )
              }
              getRowId={(row) => row.id}
            />
          </div>
        </NoSsr>
      </div>
    </Section>
  );
}
