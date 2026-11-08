import { Patient } from "@/contract";

export function billingInfoIsPatient(patient?: Patient) {
  if (!patient) return true;
  return (
    patient.address.street === patient.billingInfo.address.street &&
    patient.address.city === patient.billingInfo.address.city &&
    patient.address.zip === patient.billingInfo.address.zip &&
    patient.email === patient.billingInfo.email &&
    patient.name === patient.billingInfo.name &&
    patient.surname === patient.billingInfo.surname
  );
}
