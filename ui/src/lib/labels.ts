import type { GoalStatus, HomeworkStatus, RiskLevel } from "@peterlaudel/mosaik-contract";

// German display labels for the contract's enum values; UI-only, so they live here, not in the API.

export const RISK_LEVELS: { value: RiskLevel; label: string }[] = [
  { value: "none", label: "Kein" },
  { value: "low", label: "Niedrig" },
  { value: "moderate", label: "Mittel" },
  { value: "high", label: "Hoch" },
];

export const HOMEWORK_STATUSES: { value: HomeworkStatus; label: string }[] = [
  { value: "open", label: "Offen" },
  { value: "done", label: "Erledigt" },
  { value: "partial", label: "Teilweise" },
  { value: "not_done", label: "Nicht erledigt" },
];

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Aktiv" },
  { value: "achieved", label: "Erreicht" },
  { value: "abandoned", label: "Aufgegeben" },
];

/** Suggested interventions for the session form; free text is allowed too. */
export const INTERVENTIONS: string[] = [
  "Kognitive Umstrukturierung",
  "Verhaltensexperiment",
  "Exposition (in sensu / in vivo)",
  "Entspannungsverfahren (PME, Atemübungen)",
  "Schematherapie",
  "EMDR",
  "Aktivitätenaufbau",
  "Problemlösetraining",
  "Psychoedukation",
  "Ressourcenaktivierung",
  "Gesprächsführung / Aktives Zuhören",
];
