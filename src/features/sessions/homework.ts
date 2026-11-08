import { z } from "zod";
import { givenHomeworkSchema, homeworkStatusSchema, reviewHomeworkSchema } from "./contract";

export type HomeworkStatus = z.infer<typeof homeworkStatusSchema>;

export const HOMEWORK_STATUSES: { value: HomeworkStatus; label: string }[] = [
  { value: "open", label: "Offen" },
  { value: "done", label: "Erledigt" },
  { value: "partial", label: "Teilweise" },
  { value: "not_done", label: "Nicht erledigt" },
];

export type GivenHomework = z.infer<typeof givenHomeworkSchema>;
export type ReviewHomework = z.infer<typeof reviewHomeworkSchema>;
