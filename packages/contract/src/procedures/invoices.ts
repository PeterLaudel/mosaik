import { oc } from "@orpc/contract";
import { z } from "zod";

export const invoicesContract = {
  /** Encrypts the invoice PDF, mails it with the signed-in user's Gmail account and marks it as sent. */
  sendEmail: oc
    .route({ method: "POST", path: "/invoices/{id}/send-email", tags: ["invoices"] })
    .input(z.object({ id: z.coerce.number().int().positive() }))
    .output(z.object({ status: z.literal("sent") })),
};
