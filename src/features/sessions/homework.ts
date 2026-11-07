export type HomeworkStatus = "open" | "done" | "partial" | "not_done";

export const HOMEWORK_STATUSES: { value: HomeworkStatus; label: string }[] = [
  { value: "open", label: "Offen" },
  { value: "done", label: "Erledigt" },
  { value: "partial", label: "Teilweise" },
  { value: "not_done", label: "Nicht erledigt" },
];

export interface GivenHomework {
  description: string;
}

export interface ReviewHomework {
  description: string;
  status: HomeworkStatus;
}
