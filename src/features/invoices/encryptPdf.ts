import { PDF } from "@libpdf/core";

export async function encryptPdf(
  base64Pdf: string,
  userPw: string,
  ownerPw: string,
) {
  //base64 to bytes
  const pdfBytes = Buffer.from(base64Pdf, "base64");
  const pdf = await PDF.load(pdfBytes);
  pdf.setProtection({
    userPassword: userPw,
    ownerPassword: ownerPw,
    algorithm: "AES-256", // Recommended
  });
  const encrypted = await pdf.save();
  const buffer = Buffer.from(encrypted);
  return buffer.toString("base64");
}
