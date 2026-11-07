import { invoiceFactory } from "factories/invoices";
import { test, expect } from "../fixtures";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { therapeutFactory } from "factories/therapeuts";

test("sents an invoice email", async ({ page }) => {
  const therapeut = await therapeutFactory.create();
  const patient = await patientFactory.create({
    invoicePassword: null,
  });
  const invoice = await invoiceFactory.create({ status: "pending", base64Pdf: "JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKEhlbGxvIFdvcmxkKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAxNzggMDAwMDAgbiAKMDAwMDAwMDQ1NyAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgIC9Sb290IDEgMCBSCiAgICAgIC9TaXplIDUKICA+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==" });
  await patientInvoiceFactory.create({
    patientId: patient.id,
    invoiceId: invoice.id,
  });

  await page.goto("/administration/invoices");

  await page.getByRole("button", { name: "Rechnung senden" }).click();
  await page.getByRole("button", { name: "Senden" }).click();

  await expect(page.getByText("Versendet")).toBeVisible();

  const sendedEmail = await page.request.get("/api/invoices/test"); // wait for email to be sent
  const emailData = await sendedEmail.json();

  expect(emailData["from"]).toStrictEqual({
    address: therapeut.email,
    name: `${therapeut.name} ${therapeut.surname}`,
  });
  expect(emailData["to"]).toStrictEqual([
    {
      address: patient.billingEmail,
      name: `${patient.name} ${patient.surname}`,
    },
  ]);
  expect(emailData["subject"]).toStrictEqual(
    `Ihre Rechnung ${invoice.invoiceNumber}`
  );
  expect(emailData["attachments"]).toHaveLength(1);
  expect(emailData["attachments"][0]).toStrictEqual({
    filename: `Rechnung_${invoice.invoiceNumber}.pdf`,
    content: expect.any(String),
    encoding: "base64",
    contentType: "application/pdf",
  });
});
