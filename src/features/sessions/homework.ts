import { z } from "zod";
import { givenHomeworkSchema, homeworkStatusSchema, reviewHomeworkSchema } from "./contract";

export type HomeworkStatus = z.infer<typeof homeworkStatusSchema>;

export type GivenHomework = z.infer<typeof givenHomeworkSchema>;
export type ReviewHomework = z.infer<typeof reviewHomeworkSchema>;
