import PatientForm from "../../_forms/patientForm";
import { updatePatient } from "../action";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{
    patientId: number;
  }>;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { patientId } = params;

  const api = await serverApi();
  const patient = await api.patients.find({ id: patientId });

  return <PatientForm action={updatePatient.bind(null, patient.id)} initialValues={patient} />;
}
