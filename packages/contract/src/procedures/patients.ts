import { oc } from "@orpc/contract";
import { z } from "zod";
import { patientCreateSchema, patientSchema } from "../models/patient";

// Path and query params arrive as strings over HTTP, hence z.coerce for numbers
const idInput = z.object({ id: z.coerce.number().int().positive() });

export const patientsContract = {
  list: oc
    .route({ method: "GET", path: "/patients", tags: ["patients"] })
    .input(
      z.object({
        search: z.string().default(""),
        page: z.coerce.number().int().min(0).default(0),
        pageSize: z.coerce.number().int().min(1).max(100).default(10),
      }),
    )
    .output(z.object({ rows: z.array(patientSchema), total: z.number().int() })),

  find: oc
    .route({ method: "GET", path: "/patients/{id}", tags: ["patients"] })
    .input(idInput)
    .output(patientSchema),

  create: oc
    .route({ method: "POST", path: "/patients", successStatus: 201, tags: ["patients"] })
    .input(patientCreateSchema)
    .output(patientSchema),

  update: oc
    .route({ method: "PUT", path: "/patients/{id}", tags: ["patients"] })
    .input(patientSchema.extend(idInput.shape))
    .output(patientSchema),
};
