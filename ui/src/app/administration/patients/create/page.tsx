import PatientForm from "../_forms/patientForm";
import createPatient from "./action";

export default function Page() {
  return <PatientForm action={createPatient} />;
}
