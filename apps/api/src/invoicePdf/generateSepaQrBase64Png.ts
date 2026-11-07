import QRCode from "qrcode";

export type SepaQrOptions = {
  bic?: string; // optional
  recipient: string;
  iban: string;
  amount: number; // in euros
  purposeCode: string; // e.g. MEDI for psychotherapy
  remittanceInfo: string; // invoice number, etc.
};

export async function generateSepaQrBase64Png({
  bic = "",
  recipient,
  iban,
  amount,
  purposeCode,
  remittanceInfo,
}: SepaQrOptions) {
  const data = [
    "BCD", // service tag
    bic ? "001" : "002", // version
    "1", // character set: UTF-8
    "SCT", // SEPA Credit Transfer
    bic, // BIC (optional)
    recipient, // beneficiary name
    iban, // IBAN
    `EUR${amount.toFixed(2)}`, // amount
    purposeCode,
    remittanceInfo, // remittance information
  ].join("\n");

  return QRCode.toDataURL(data, { type: "image/png" });
}

export async function generateSepaQrBase64PngBuffer({
  bic = "",
  recipient,
  iban,
  amount,
  purposeCode,
  remittanceInfo,
}: SepaQrOptions) {
  const data = [
    "BCD", // service tag
    bic ? "001" : "002", // version
    "1", // character set: UTF-8
    "SCT", // SEPA Credit Transfer
    bic, // BIC (optional)
    recipient, // beneficiary name
    iban, // IBAN
    `EUR${amount.toFixed(2)}`, // amount
    purposeCode,
    remittanceInfo, // remittance information
  ].join("\n");

  return await QRCode.toBuffer(data, { type: "png" });
}
