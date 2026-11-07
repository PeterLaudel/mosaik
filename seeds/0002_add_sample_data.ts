import { invoiceFactory } from "factories/invoices";
import { patientFactory } from "factories/patients";
import { patientInvoiceFactory } from "factories/patientInvoices";
import { therapeutFactory } from "factories/therapeuts";

export async function seed() {
  await therapeutFactory.create();

  for (let i = 0; i < 100; i++) {
    const patient1 = await patientFactory.create({
      name: "Jane",
      surname: "Doe",
      email: "peter.laudel+jane.doe@gmail.com",
      billingEmail: "peter.laudel+jane.do.invoice@gmail.com",
    });
    const patient2 = await patientFactory.create({
      name: "John",
      surname: "Smith",
      email: "peter.laudel+john.smith@gmail.com",
      billingEmail: "peter.laudel+john.smith.invoice@gmail.com",
    });

    const invoice1 = await invoiceFactory.create({
      invoiceAmount: 100,
      status: "paid",
    });

    const invoice2 = await invoiceFactory.create({
      invoiceAmount: 200,
      status: "sent",
    });

    await patientInvoiceFactory.create({
      patientId: patient1.id,
      invoiceId: invoice1.id,
    });

    await patientInvoiceFactory.create({
      patientId: patient2.id,
      invoiceId: invoice2.id,
    });
  }
}
