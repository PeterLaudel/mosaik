"use client";

import {
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import Section from "@/components/section";
import SubmitButton from "@/components/submitButton";
import {
  THERAPY_FORMS,
  TREATMENT_PHASES,
  GOAL_STATUSES,
  TherapyForm,
  TreatmentPhase,
  GoalStatus,
} from "@mosaik/contract/models/treatmentPlan";

export type PlanFormValues = {
  startDate: string;
  endDate: string;
  therapyForm: TherapyForm;
  phase: TreatmentPhase;
  approvedSessions: number | null;
  notes: string;
  goals: Array<{ description: string; status: GoalStatus; priority: number }>;
};

const statusColors: Record<GoalStatus, "default" | "primary" | "success" | "error"> = {
  active: "primary",
  achieved: "success",
  abandoned: "error",
};

interface Props {
  onSubmit: () => void;
  isPending: boolean;
}

export default function TreatmentPlanForm({ onSubmit, isPending }: Props) {
  const { register, watch, control } = useFormContext<PlanFormValues>();
  const [therapyForm, phase] = watch(["therapyForm", "phase"]);

  const { fields, append, remove } = useFieldArray({ control, name: "goals" });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Section>
        <h2 className="mb-4">Behandlungsplan</h2>
        <div className="grid grid-cols-2 gap-4">
          <FormControl>
            <InputLabel>Therapieform</InputLabel>
            {/* MUI Select requires explicit value when used with register */}
            <Select {...register("therapyForm")} value={therapyForm ?? "Einzeltherapie"} label="Therapieform">
              {THERAPY_FORMS.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Phase</InputLabel>
            {/* MUI Select requires explicit value when used with register */}
            <Select {...register("phase")} value={phase ?? "Diagnostik"} label="Phase">
              {TREATMENT_PHASES.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            {...register("startDate")}
            label="Beginn"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            {...register("endDate")}
            label="Ende (optional)"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            {...register("approvedSessions", { valueAsNumber: true })}
            label="Bewilligte Sitzungen"
            type="number"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            {...register("notes")}
            label="Notizen"
            multiline
            minRows={3}
            className="col-span-2"
            fullWidth
          />
        </div>
      </Section>

      <Section>
        <h2 className="mb-4">Therapieziele</h2>

        <div className="grid gap-2 mb-4">
          {fields.map((field, index) => {
            const status = watch(`goals.${index}.status`);
            const statusLabel = GOAL_STATUSES.find((s) => s.value === status)?.label ?? status;
            return (
              <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                <TextField
                  {...register(`goals.${index}.description`)}
                  label="Beschreibung"
                  size="small"
                  fullWidth
                />

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Status</InputLabel>
                  {/* MUI Select requires explicit value when used with register */}
                  <Select
                    {...register(`goals.${index}.status`)}
                    value={status ?? "active"}
                    label="Status"
                  >
                    {GOAL_STATUSES.map(({ value, label }) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Chip
                  label={statusLabel}
                  color={statusColors[status ?? "active"]}
                  size="small"
                />

                <Tooltip title="Entfernen">
                  <IconButton size="small" aria-label="Ziel entfernen" onClick={() => remove(index)}>
                    🗑️
                  </IconButton>
                </Tooltip>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() => append({ description: "", status: "active", priority: 2 })}
        >
          + Therapieziel hinzufügen
        </Button>
      </Section>

      <SubmitButton submitting={isPending} className="justify-self-start">
        Speichern
      </SubmitButton>
    </form>
  );
}
