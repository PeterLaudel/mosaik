import { billingInfoFactory } from "../factories/billingInfo";
import { invoiceFactory } from "../factories/invoice";
import { patientFactory } from "../factories/patient";
import { patientInvoiceFactory } from "../factories/patientInvoice";
import { therapeutFactory } from "../factories/therapeut";

export async function seed() {
  await therapeutFactory.create();

  for (let i = 0; i < 100; i++) {
    const patient1 = await patientFactory.create({
      name: "Jane",
      surname: "Doe",
      email: "peter.laudel+jane.doe@gmail.com",
      billingInfo: billingInfoFactory.build({
        email: "peter.laudel+jane.do.invoice@gmail.com",
      }),
    });
    const patient2 = await patientFactory.create({
      name: "John",
      surname: "Smith",
      email: "peter.laudel+john.smith@gmail.com",
      billingInfo: billingInfoFactory.build({
        email: "peter.laudel+john.smith.invoice@gmail.com",
      }),
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
