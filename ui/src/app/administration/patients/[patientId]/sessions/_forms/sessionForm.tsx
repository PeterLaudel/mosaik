"use client";

import {
  Button,
  Chip,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import Section from "@/components/section";
import { SessionFormValues } from "./sessionFormShell";
import { Session, SESSION_TYPES, SESSION_PHASES, RiskLevel, HomeworkStatus, TreatmentPlan } from "@peterlaudel/mosaik-contract";
import { RISK_LEVELS, INTERVENTIONS, HOMEWORK_STATUSES, GOAL_STATUSES } from "@/lib/labels";

interface Props {
  session: Session;
  saveStatus: "idle" | "saving" | "saved";
  onFinalize: () => void;
  treatmentPlan: TreatmentPlan | null;
  previousSession: Session | null;
}

const riskButtonColors: Record<RiskLevel, string> = {
  none: "bg-gray-100",
  low: "bg-yellow-100",
  moderate: "bg-orange-100",
  high: "bg-red-100",
};

const saveStatusLabel: Record<"idle" | "saving" | "saved", string> = {
  idle: "",
  saving: "Wird gespeichert…",
  saved: "Entwurf gespeichert",
};

function ContextPanel({ treatmentPlan, previousSession }: Pick<Props, "treatmentPlan" | "previousSession">) {
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [prevOpen, setPrevOpen] = useState(false);

  const activeGoals = treatmentPlan?.goals.filter((g) => g.status === "active") ?? [];

  return (
    <div className="shadow-xl bg-white p-4 grid gap-4 self-start lg:sticky lg:top-4">
      <h2>Kontext</h2>

      {treatmentPlan ? (
        <div className="grid gap-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Behandlungsplan</p>
          <p className="text-sm">{treatmentPlan.therapyForm}</p>
          <p className="text-sm text-gray-500">{treatmentPlan.phase}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Kein Behandlungsplan vorhanden.</p>
      )}

      {treatmentPlan && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
            onClick={() => setGoalsOpen((o) => !o)}
          >
            Therapieziele ({activeGoals.length})
            <span>{goalsOpen ? "▲" : "▼"}</span>
          </button>
          <Collapse in={goalsOpen}>
            {activeGoals.length === 0 ? (
              <p className="text-sm text-gray-400">Keine aktiven Ziele.</p>
            ) : (
              <ul className="grid gap-1">
                {activeGoals.map((g, i) => {
                  const statusLabel = GOAL_STATUSES.find((s) => s.value === g.status)?.label;
                  return (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <Chip label={statusLabel} size="small" color="primary" />
                      <span>{g.description}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Collapse>
        </div>
      )}

      {previousSession && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
            onClick={() => setPrevOpen((o) => !o)}
          >
            Letzte Sitzung ({new Intl.DateTimeFormat("de-DE").format(new Date(previousSession.sessionDate))})
            <span>{prevOpen ? "▲" : "▼"}</span>
          </button>
          <Collapse in={prevOpen}>
            <div className="grid gap-1">
              {previousSession.riskLevel && previousSession.riskLevel !== "none" && (
                <p className="text-sm">
                  Risiko:{" "}
                  <span className="font-medium">
                    {RISK_LEVELS.find((r) => r.value === previousSession.riskLevel)?.label ?? previousSession.riskLevel}
                  </span>
                </p>
              )}
              {previousSession.nextSessionPlan && (
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{previousSession.nextSessionPlan}</p>
              )}
            </div>
          </Collapse>
        </div>
      )}
    </div>
  );
}

export default function SessionForm({ session, saveStatus, onFinalize, treatmentPlan, previousSession }: Props) {
  const { control, register, watch } = useFormContext<SessionFormValues>();
  const { fields: givenFields, append: appendGiven, remove: removeGiven } = useFieldArray({ control, name: "givenHomework" });
  const { fields: reviewFields } = useFieldArray({ control, name: "reviewHomework" });

  const [riskLevel, sessionDate, sessionType, phase] = watch([
    "riskLevel",
    "sessionDate",
    "sessionType",
    "phase",
  ]);

  const isFinalizeable =
    session.status !== "final" && !!sessionDate && !!riskLevel && !!sessionType;

  const formPanel = (
    <div className="grid gap-4">
      {riskLevel === "high" && (
        <div className="bg-red-500 text-white px-4 py-3 rounded font-semibold">
          Hohe Risikoeinstufung — bitte sofortige Maßnahmen prüfen.
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{saveStatusLabel[saveStatus]}</span>
        <Button variant="contained" disabled={!isFinalizeable} onClick={onFinalize}>
          Abschließen
        </Button>
      </div>

      {/* Controller required: custom button group, not a native input */}
      <Section>
        <h2 className="mb-4">Risikoeinschätzung</h2>
        <Controller
          name="riskLevel"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 flex-wrap">
              {RISK_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={`px-4 py-2 rounded border-2 font-medium transition-all ${
                    riskButtonColors[value]
                  } ${
                    field.value === value
                      ? "border-blue-600 ring-2 ring-blue-300"
                      : "border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        />
      </Section>

      <Section>
        <h2 className="mb-4">Basis</h2>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Patient"
            value={`${session.patient.name} ${session.patient.surname}`}
            disabled
            className="col-span-2"
          />

          <TextField
            {...register("sessionDate")}
            label="Datum"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Sitzungsnummer"
            type="number"
            value={session.sessionNumber}
            disabled
          />

          <TextField
            {...register("durationMinutes", { valueAsNumber: true })}
            label="Dauer (Minuten)"
            type="number"
          />

          <FormControl>
            <InputLabel>Sitzungstyp</InputLabel>
            <Select
              {...register("sessionType")}
              value={sessionType ?? ""}
              label="Sitzungstyp"
            >
              {SESSION_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Phase</InputLabel>
            <Select {...register("phase")} value={phase ?? ""} label="Phase">
              <MenuItem value="">—</MenuItem>
              {SESSION_PHASES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Section>

      {/* Controller required: MUI Slider has no native input */}
      <Section>
        <h2 className="mb-4">Stimmung</h2>
        <div className="grid grid-cols-2 gap-8">
          <Controller
            name="moodStart"
            control={control}
            render={({ field }) => (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Zu Beginn: {field.value ?? "—"}
                </p>
                <Slider
                  value={field.value ?? 5}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_e, v) => field.onChange(v)}
                />
              </div>
            )}
          />
          <Controller
            name="moodEnd"
            control={control}
            render={({ field }) => (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Am Ende: {field.value ?? "—"}
                </p>
                <Slider
                  value={field.value ?? 5}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_e, v) => field.onChange(v)}
                />
              </div>
            )}
          />
        </div>
      </Section>

      {/* Controller required: chip toggle is not a native input */}
      <Section>
        <h2 className="mb-4">Interventionen</h2>
        <Controller
          name="interventions"
          control={control}
          render={({ field }) => (
            <div className="flex gap-2 flex-wrap mb-3">
              {INTERVENTIONS.map((intervention) => {
                const selected = field.value.includes(intervention);
                return (
                  <Chip
                    key={intervention}
                    label={intervention}
                    clickable
                    color={selected ? "primary" : "default"}
                    variant={selected ? "filled" : "outlined"}
                    onClick={() => {
                      const next = selected
                        ? field.value.filter((i: string) => i !== intervention)
                        : [...field.value, intervention];
                      field.onChange(next);
                    }}
                  />
                );
              })}
            </div>
          )}
        />
      </Section>

      <Section>
        <h2 className="mb-4">Klinische Notizen 🔒</h2>
        <TextField
          {...register("clinicalNotes")}
          label="Notizen (verschlüsselt)"
          multiline
          minRows={6}
          fullWidth
        />
      </Section>

      <Section>
        <h2 className="mb-4">Planung</h2>
        <TextField
          {...register("nextSessionPlan")}
          label="Nächste Sitzung — Planung"
          multiline
          minRows={3}
          fullWidth
        />
      </Section>

      {reviewFields.length > 0 && (
        <Section>
          <h2 className="mb-4">Hausaufgaben — Rückschau</h2>
          <div className="grid gap-4">
            {/* Controller required: ToggleButtonGroup is not a native input */}
            {reviewFields.map((field, index) => (
              <Controller
                key={field.id}
                name={`reviewHomework.${index}.status`}
                control={control}
                render={({ field: statusField }) => (
                  <div className="grid gap-1">
                    <p className="text-sm">{field.description}</p>
                    <ToggleButtonGroup
                      value={statusField.value}
                      exclusive
                      onChange={(_e, value: HomeworkStatus | null) => {
                        if (value) statusField.onChange(value);
                      }}
                      size="small"
                      aria-label="Hausaufgaben-Status"
                    >
                      {HOMEWORK_STATUSES.map(({ value, label }) => (
                        <ToggleButton key={value} value={value} aria-label={label}>
                          {label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </div>
                )}
              />
            ))}
          </div>
        </Section>
      )}

      <Section>
        <h2 className="mb-4">Hausaufgaben — Vergabe</h2>
        <div className="grid gap-2">
          {givenFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <TextField
                {...register(`givenHomework.${index}.description`)}
                label={`Hausaufgabe ${index + 1}`}
                size="small"
                fullWidth
              />
              <IconButton
                onClick={() => removeGiven(index)}
                aria-label="Hausaufgabe entfernen"
                size="small"
              >
                ✕
              </IconButton>
            </div>
          ))}
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={() => appendGiven({ description: "" })}
            className="justify-self-start"
          >
            + Hausaufgabe hinzufügen
          </Button>
        </div>
      </Section>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
      <ContextPanel treatmentPlan={treatmentPlan} previousSession={previousSession} />
      {formPanel}
    </div>
  );
}
