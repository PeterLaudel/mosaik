"use client";

import { useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Button, Chip, MenuItem, NoSsr, Select } from "@mui/material";
import Section from "@/components/section";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { Session } from "@mosaik/contract/models/session";
import PseudonymizationModal from "./pseudonymizationModal";

const REPORT_TYPES = ["Verlaufsbericht", "Konsiliarbericht"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

const pseudonymizationLabels: Record<string, string> = {
  done: "Bereit",
  pending: "Wird pseudonymisiert",
  failed: "Fehlgeschlagen",
};

const pseudonymizationColors: Record<string, "default" | "warning" | "error" | "success"> = {
  done: "success",
  pending: "warning",
  failed: "error",
};

const columns: GridColDef<Session>[] = [
  {
    field: "sessionDate",
    headerName: "Datum",
    flex: 1,
    renderCell: (params) => new Intl.DateTimeFormat("de-DE").format(new Date(params.value)),
  },
  { field: "sessionNumber", headerName: "Nr.", width: 60 },
  { field: "sessionType", headerName: "Typ", flex: 1 },
  {
    field: "pseudonymizationStatus",
    headerName: "Pseudonymisierung",
    flex: 1,
    renderCell: (params) => {
      const status = params.value ?? "pending";
      return (
        <Chip
          label={pseudonymizationLabels[status] ?? status}
          color={pseudonymizationColors[status] ?? "default"}
          size="small"
        />
      );
    },
  },
];

const emptySelection: GridRowSelectionModel = { type: "include", ids: new Set() };

interface Props {
  patientId: string;
  initialSessions: Session[];
}

export default function ReportsTab({ initialSessions }: Props) {
  const { showSuccessMessage } = useSnackbar();
  const [reportType, setReportType] = useState<ReportType>("Verlaufsbericht");
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(emptySelection);
  const [modalOpen, setModalOpen] = useState(false);

  // GridRowSelectionModel's `ids` means different things depending on `type`: for "include" it's
  // the selected ids, for "exclude" (set by the header "select all" checkbox) it's the ids left
  // OUT of an otherwise-full selection — an empty set there means everything is selected.
  const selectedSessionIds =
    selectionModel.type === "include"
      ? Array.from(selectionModel.ids, Number)
      : initialSessions.map((session) => session.id).filter((id) => !selectionModel.ids.has(id));

  const handleConfirm = () => {
    // TODO: wire up to generateReport() once Step 5 (report generation service) exists.
    setModalOpen(false);
    showSuccessMessage("Datenschutz-Prüfung bestätigt");
  };

  return (
    <Section>
      <div className="grid grid-flow-row gap-4">
        <div className="flex items-center justify-between">
          <Select
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
            size="small"
          >
            {REPORT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            disabled={selectedSessionIds.length === 0}
            onClick={() => setModalOpen(true)}
          >
            Bericht generieren
          </Button>
        </div>
        <NoSsr>
          <div className="h-full w-full">
            <DataGrid
              rows={initialSessions}
              columns={columns}
              disableColumnMenu
              autoHeight
              checkboxSelection
              rowSelectionModel={selectionModel}
              onRowSelectionModelChange={setSelectionModel}
              getRowId={(row) => row.id}
            />
          </div>
        </NoSsr>
      </div>

      <PseudonymizationModal
        open={modalOpen}
        sessionIds={selectedSessionIds}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </Section>
  );
}
