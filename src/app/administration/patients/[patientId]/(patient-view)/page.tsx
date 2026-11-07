import { getPatientsRepository } from "@/server";
import PatientForm from "../../_forms/patientForm";
import { updatePatient } from "../action";

interface Props {
  params: Promise<{
    patientId: number;
  }>;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { patientId } = params;

  const patientRepository = await getPatientsRepository();
  const patient = await patientRepository.find(patientId);

  return <PatientForm action={updatePatient.bind(null, patient.id)} initialValues={patient} />;
}
