/* eslint-disable no-param-reassign */
import { InvoiceIssuer, InvoicePatient, InvoicePosition } from "../model";
import PDFDocument from "pdfkit";
import logoBuffer from "./logo";
import { generateSepaQrBase64PngBuffer } from "./generateSepaQrBase64Png";
import blobStream from "blob-stream";
import { createZugferdXml } from "./zugferd";
import dayjs from "dayjs";

export interface CreatePdfParams {
  patient?: InvoicePatient;
  therapeut: InvoiceIssuer;
  invoiceNumber: string;
  invoiceDate?: string;
  positions: InvoicePosition[];
  invoiceAmount: number;
  options?: {
    invoicePassword?: string;
  };
}

/** PDF points from millimetres (DIN / Fensterbrief layout). */
function mm(n: number) {
  return (n * 72) / 25.4;
}

/** Page margins and DIN 5008–oriented zones (window envelope–friendly). */
const PAGE_MARGIN = mm(20);
/** DIN 5008 §4.3 Form A: Schreibfeld starts 24.1 mm from left edge. */
const BODY_LEFT = mm(24.1);
/** Sender / return line — sits in upper part of address window. */
const RETURN_ADDRESS_TOP = mm(27);
/** First line of recipient address (Form A, common for business mail). */
const RECIPIENT_ADDRESS_TOP = mm(50.8);
/** Right edge of address field is at 105 mm from page edge (DIN 5008 envelope window). */
const ADDRESS_FIELD_WIDTH = mm(105) - BODY_LEFT;
/** Right column for logo + practice (outside left window). */
const RIGHT_COLUMN_WIDTH = mm(72);
/** DIN 5008 Form A: body / information zone starts at 97.4 mm from top. */
const INFO_ZONE_TOP = mm(97.4);
/** Fold marks (left edge tick lines) at DIN 5008–specified positions. */
const FOLD_1 = mm(87);
const FOLD_2 = mm(192);
/** Hole punch mark at vertical centre of A4. */
const PUNCH = mm(148.5);

/**
 * Font sizes in PDF points (aligned with common DE business letters / DIN 5008).
 * - 11 pt body matches typical Word “Standard” for letters.
 * - 12 pt for the invoice title (slightly below default 14 pt Word heading).
 * - 10 pt in tables keeps columns readable without crowding.
 * - 9 pt for footer / practice block is usual for bank / legal lines.
 * - 8 pt return line above the address window is typical.
 */
const FS = {
  title: 12,
  body: 11,
  table: 10,
  fine: 9,
  returnLine: 8,
} as const;

const BODY_LINE_GAP = 2;

type PdfDoc = InstanceType<typeof PDFDocument>;

function footerContent(therapeut: CreatePdfParams["therapeut"]) {
  return (
    `${therapeut.bankName}\n` +
    `IBAN: ${therapeut.iban} • Swift/BIC: ${therapeut.bic}\n` +
    `Steuernummer: ${therapeut.taxId}`
  );
}

function footerTextWidth(doc: PdfDoc) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

/** Reserve bottom margin so body text never runs into the footer (must match wrapped height). */
function reserveBottomMarginForFooter(doc: PdfDoc, therapeut: CreatePdfParams["therapeut"]) {
  const content = footerContent(therapeut);
  const w = footerTextWidth(doc);
  const textHeight = doc
    .font("Helvetica")
    .fontSize(FS.fine)
    .heightOfString(content, { width: w });
  doc.page.margins.bottom = textHeight + PAGE_MARGIN + mm(2);
}

function formatDate(date: string) {
  const d = Date.parse(date) ? new Date(date) : new Date();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatCurrency(amount: number) {
  return amount.toFixed(2).replace(".", ",") + " €";
}


export async function generateInvoiceBlob(params: CreatePdfParams) {
  const doc = new PDFDocument({
    margins: {
      left: PAGE_MARGIN,
      right: PAGE_MARGIN,
      top: PAGE_MARGIN,
      bottom: PAGE_MARGIN,
    },
    size: "A4",
    autoFirstPage: false,
    pdfVersion: "1.7",
    userPassword: params.options?.invoicePassword,
  });
  const stream = doc.pipe(blobStream());
  pageFooter(doc, params);

  doc.addPage();
  reserveBottomMarginForFooter(doc, params.therapeut);

  const rightColumnBottom = letterheadRight(doc, params);
  const addressBottom = addressPart(doc, params);
  doc.y = Math.max(rightColumnBottom, addressBottom, INFO_ZONE_TOP);

  invoiceContext(doc, params);
  positionsPart(doc, params);
  doc.moveDown(2);

  await addPaymentInfo(doc, params);

  attachZugferXml(doc, params);

  doc.end();

  return await new Promise<Blob>((resolve) => {
    stream.on("finish", function () {
      const blob = stream.toBlob("application/pdf");
      resolve(blob);
    });
  });
}

export function generateInvoiceBase64(params: CreatePdfParams) {
  return generateInvoiceBlob(params).then((blob) => blobToBase64(blob));
}

function pageFooter(doc: PdfDoc, { therapeut }: CreatePdfParams) {
  doc.on("pageAdded", () => {
    reserveBottomMarginForFooter(doc, therapeut);

    const content = footerContent(therapeut);
    const w = footerTextWidth(doc);
    const textHeight = doc
      .font("Helvetica")
      .fontSize(FS.fine)
      .heightOfString(content, { width: w });

    const bottomInset = PAGE_MARGIN;
    const y = doc.page.height - textHeight - bottomInset;

    // Large margins.bottom lowers maxY(); footer Y sits below that limit, so
    // doc.text() would paginate → addPage → pageAdded → infinite recursion.
    const reservedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.text(content, doc.page.margins.left, y, {
      width: w,
      align: "center",
    });
    doc.page.margins.bottom = reservedBottom;

    // DIN 5008 fold marks (4 mm ticks at left paper edge)
    doc.save();
    doc.lineWidth(0.25).strokeColor("#888888");
    doc.moveTo(0, FOLD_1).lineTo(mm(4), FOLD_1).stroke();
    doc.moveTo(0, FOLD_2).lineTo(mm(4), FOLD_2).stroke();
    doc.moveTo(0, PUNCH).lineTo(mm(3), PUNCH).stroke();
    doc.restore();

    doc.text("", BODY_LEFT, doc.page.margins.top);
  });
}

/** Logo + practice block on the right (outside the left address window). */
function letterheadRight(doc: PdfDoc, { therapeut }: CreatePdfParams) {
  const rightEdge = doc.page.width - doc.page.margins.right;
  const colX = rightEdge - RIGHT_COLUMN_WIDTH;
  const logoTop = mm(12);
  const logoBoxW = mm(52);
  const logoBoxH = mm(20);

  doc.image(logoBuffer, colX + (RIGHT_COLUMN_WIDTH - logoBoxW) / 2, logoTop, {
    fit: [logoBoxW, logoBoxH],
  });

  const practiceTop = logoTop + logoBoxH + mm(5);
  const practiceContent =
    `${therapeut.title} ${therapeut.name} ${therapeut.surname}\n` +
    "Psychologische Psychotherapeutin\n" +
    `ENR: ${therapeut.enr}\n\n` +
    `${therapeut.street}\n` +
    `${therapeut.zip} ${therapeut.city}\n\n` +
    `${therapeut.email}`;

  doc.font("Helvetica").fontSize(FS.fine);
  const height = doc.heightOfString(practiceContent, {
    width: RIGHT_COLUMN_WIDTH,
  });

  doc
    .lineWidth(0.75)
    .moveTo(colX - mm(3), practiceTop - mm(2))
    .lineTo(colX - mm(3), practiceTop + height + mm(2))
    .strokeColor("#333333")
    .stroke()
    .strokeColor("black");

  doc.font("Helvetica").fontSize(FS.fine).text(practiceContent, colX, practiceTop, {
    width: RIGHT_COLUMN_WIDTH,
    align: "left",
    lineGap: 1,
  });

  return practiceTop + height + mm(2);
}

/**
 * DIN-oriented address field: return line in window zone, recipient from ~50.8 mm.
 * Returns bottom Y of the address block (for continuing body text).
 */
function addressPart(doc: PdfDoc, { therapeut, patient }: CreatePdfParams) {
  const left = BODY_LEFT;
  const returnLine =
    `${therapeut.name} ${therapeut.surname} · ${therapeut.street} · ${therapeut.zip} ${therapeut.city}`;

  doc.font("Helvetica").fontSize(FS.returnLine).fillColor("#222222");
  doc.text(returnLine, left, RETURN_ADDRESS_TOP, {
    width: ADDRESS_FIELD_WIDTH,
    lineGap: 0,
  });
  doc.fillColor("black");

  const returnBottom =
    RETURN_ADDRESS_TOP +
    doc.heightOfString(returnLine, { width: ADDRESS_FIELD_WIDTH });

  if (!patient) {
    return returnBottom + mm(4);
  }

  const recipientTop = Math.max(RECIPIENT_ADDRESS_TOP, returnBottom + mm(4));
  const recipient =
    `${patient.billingInfo.name} ${patient.billingInfo.surname}\n` +
    `${patient.billingInfo.address.street}\n` +
    `${patient.billingInfo.address.zip} ${patient.billingInfo.address.city}`;

  doc.font("Helvetica").fontSize(12);
  doc.text(recipient, left, recipientTop, {
    width: ADDRESS_FIELD_WIDTH,
    lineGap: BODY_LINE_GAP,
  });

  return (
    recipientTop +
    doc.heightOfString(recipient, {
      width: ADDRESS_FIELD_WIDTH,
      lineGap: BODY_LINE_GAP,
    })
  );
}

function invoiceContext(
  doc: PdfDoc,
  { invoiceNumber, invoiceDate, patient, therapeut }: CreatePdfParams
) {
  const invTop = doc.y;
  const dateStr = formatDate(invoiceDate ?? new Date().toISOString());

  doc
    .font("Helvetica-Bold")
    .fontSize(FS.title)
    .text(`Rechnung Nr. ${invoiceNumber}`, BODY_LEFT, invTop, {
      align: "left",
    });

  doc
    .fontSize(FS.table)
    .font("Helvetica")
    .text(
      `${therapeut.city}, ${dateStr}`,
      BODY_LEFT,
      invTop,
      {
        align: "right",
      }
    );

  doc.y = doc.y + mm(7);

  const birth =
    patient?.birthdate != null && patient.birthdate !== ""
      ? formatDate(patient.birthdate)
      : "—";

  doc.font("Helvetica").fontSize(FS.body).lineGap(BODY_LINE_GAP);
  doc.text(
    `Behandelt wurde: ${patient?.surname ?? "—"}, ${patient?.name ?? "—"}, geb.: ${birth}\n\n` +
      `${patient?.diagnosis ?? ""}\n\n` +
      "Sehr geehrte Damen und Herren,\n\n" +
      "vielen Dank für Ihr Vertrauen. Für meine Leistungen berechne ich den folgenden Betrag:\n\n"
  );
}

function positionsPart(
  doc: PdfDoc,
  { invoiceAmount, positions }: CreatePdfParams
) {
  const table = doc.fontSize(FS.table).table({
    rowStyles: (i) => {
      return i < 1
        ? { border: [0, 0, 1, 0], padding: [0, 0, mm(1.5), 0] }
        : { border: false, padding: [mm(2), 0, 0, 0] };
    },
    columnStyles: ["70", "*", "200", "*", "*", "*"],
  });
  table.row([
    { text: "Datum", align: "center", font: { src: "Helvetica-Bold" } },
    { text: "Code", align: "center", font: { src: "Helvetica-Bold" } },
    {
      text: "Leistung",
      align: "center",
      font: { src: "Helvetica-Bold" },
    },
    { text: "Faktor", align: "center", font: { src: "Helvetica-Bold" } },
    { text: "Anzahl", align: "center", font: { src: "Helvetica-Bold" } },
    {
      text: "Betrag",
      align: { x: "right" },
      font: { src: "Helvetica-Bold" },
    },
  ]);

  positions.forEach((position) =>
    table.row([
      {
        text: formatDate(position.serviceDate),
        align: { x: "center", y: "top" },
      },
      {
        text: position.service.originalGopNr,
        align: { x: "center", y: "top" },
      },
      {
        text: position.service.description,
        align: { x: "left", y: "top" },
      },
      { text: position.factor, align: { x: "center", y: "top" } },
      { text: String(position.amount), align: { x: "center", y: "top" } },
      {
        text: formatCurrency(position.price),
        align: { x: "right", y: "top" },
      },
    ])
  );
  table.end();
  doc
    .font("Helvetica-Bold")
    .fontSize(FS.table)
    .text(`Gesamtsumme ${formatCurrency(invoiceAmount)}`, {
      align: "right",
    });
}

async function addPaymentInfo(
  doc: PdfDoc,
  { invoiceNumber, therapeut, invoiceAmount }: CreatePdfParams
) {
  doc.font("Helvetica").fontSize(FS.body).lineGap(BODY_LINE_GAP).moveDown(1.25);

  doc.text(
    "Leistungen gemäß Katalog: GOÄ | Heilbehandlung – daher von der Umsatzsteuer nach § 4 Nr. 14a UStG befreit.\n\n" +
    "Bitte überweisen Sie den Rechnungsbetrag innerhalb von 7 Tagen auf mein unten genanntes Konto. Geben Sie dabei bitte als Verwendungszweck die Rechnungsnummer an.\n\n",
  );

  const buffer = await generateSepaQrBase64PngBuffer({
    recipient: `${therapeut.name} ${therapeut.surname}`,
    bic: therapeut.bic,
    iban: therapeut.iban,
    amount: invoiceAmount,
    purposeCode: "MEDI",
    remittanceInfo: invoiceNumber,
  });

  const blockHeight = 115; // QR code + text + margin
  ensureSpace(doc, blockHeight);

  const currentX = doc.page.width - doc.page.margins.right;
  const currentY = doc.y;
  doc
    .font("Helvetica-Bold")
    .fontSize(FS.fine)
    .text("Überweisen per Code", currentX - 175 - 75, currentY + 30, {
      width: 175,
      height: 75,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(FS.fine)
    .text(
      "Code mit der Banking-App scannen",
      currentX - 175 - 75,
      currentY + 40,
      {
        width: 175,
        height: 75,
        align: "center",
      }
    );
  doc.image(buffer, currentX - 75, currentY, {
    width: 75,
    height: 75,
  });
  doc
    .lineWidth(1)
    .rect(currentX - 175 - 75 - 10, currentY, 260, 75)
    .stroke();
}

function ensureSpace(doc: PdfDoc, neededHeight: number) {
  const bottom = doc.page.height - doc.page.margins.bottom;

  if (doc.y + neededHeight > bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top; // reset cursor
  }
}

function attachZugferXml(doc: PdfDoc, params: CreatePdfParams) {
  const zugferdXml = createZugferdXml({
    invoiceDate: params.invoiceDate
      ? dayjs(params.invoiceDate).format("YYYYMMDD")
      : dayjs().format("YYYYMMDD"),
    invoiceNumber: params.invoiceNumber,
    positions: params.positions.map((p, index) => ({
      id: index.toString(),
      description: p.service.description,
      price: p.price,
      quantity: p.amount,
      tax: 0.0, // Assuming no tax for medical services
    })),
    buyer: {
      name: params.patient?.name || "",
      street: params.patient?.billingInfo.address.street || "",
      city: params.patient?.billingInfo.address.city || "",
      zip: params.patient?.billingInfo.address.zip || "",
      country: "DE",
    },
    seller: {
      name: `${params.therapeut.name} ${params.therapeut.surname}`,
      street: params.therapeut.street,
      city: params.therapeut.city,
      zip: params.therapeut.zip,
      country: "DE",
      vatId: params.therapeut.taxId,
    },
  });

  const xmlBytes = Buffer.from(zugferdXml, "utf-8");

  doc.file(xmlBytes, {
    name: "zugferInvoice.xml",
    type: "application/xml",
    description: "ZUGFeRD Invoice XML",
    creationDate: new Date(),
  });
}

function blobToBase64(blob: Blob) {
  return blob
    .arrayBuffer()
    .then((buffer) => Buffer.from(buffer).toString("base64"));
}
