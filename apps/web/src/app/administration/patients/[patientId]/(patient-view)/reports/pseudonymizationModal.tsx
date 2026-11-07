"use client";

import { useState } from "react";
import { Button, Dialog } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getPseudonymizedTextForSessions } from "./actions";

interface Props {
  open: boolean;
  sessionIds: number[];
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export default function PseudonymizationModal({ open, sessionIds, onClose, onConfirm }: Props) {
  // null means "not edited yet" — falls back to the fetched text. Reset on close/confirm
  // so a stale edit doesn't leak into the next time the modal opens.
  const [editedText, setEditedText] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["pseudonymizedText", sessionIds],
    queryFn: () => getPseudonymizedTextForSessions(sessionIds),
    enabled: open && sessionIds.length > 0,
    // Keep checking while the worker is still processing or retrying a failed job.
    refetchInterval: (query) => (query.state.data?.status === "ready" ? false : 2000),
  });

  const isReady = data?.status === "ready";
  const displayText = editedText ?? (isReady ? data.text : "");

  const reset = () => setEditedText(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Datenschutz-Prüfung</h2>
        <p>
          Bitte prüfen Sie ob alle personenbezogenen Daten entfernt wurden, bevor die Daten zur
          Berichtsgenerierung übertragen werden.
        </p>

        {(isLoading || data?.status === "pending") && <p>⏳ Pseudonymisierung läuft...</p>}
        {data?.status === "failed" && (
          <p>⚠️ Pseudonymisierung fehlgeschlagen — wird automatisch erneut versucht.</p>
        )}
        {isReady && (
          <textarea
            aria-label="Pseudonymisierter Text"
            className="border rounded p-2 min-h-[200px]"
            value={displayText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Abbrechen
          </Button>
          <Button
            disabled={!isReady}
            onClick={() => {
              onConfirm(displayText);
              reset();
            }}
          >
            Bestätigen & Bericht erstellen
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
