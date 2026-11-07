import { getPatientsService } from "@/features/patients";
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

  const patientsService = await getPatientsService();
  const patient = await patientsService.find(patientId);

  return <PatientForm action={updatePatient.bind(null, patient.id)} initialValues={patient} />;
}
