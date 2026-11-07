import { Patient } from "./patient";
import { Factor, Service } from "./service";

export interface InvoicePosition {
  serviceDate: string;
  service: Service;
  amount: number;
  factor: Factor;
  price: number;
}

export interface Invoice {
  id: number;
  base64Pdf: string;
  invoiceNumber: string;
  invoiceAmount: number;
  status: "pending" | "sent" | "paid";
  positions: InvoicePosition[];
  patient: Patient;
}
