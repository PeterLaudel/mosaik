import { serverApiClient } from "@/lib/orpc.server";
import PatientForm from "../../_forms/patientForm";

interface Props {
  params: Promise<{
    patientId: string;
  }>;
}

export default async function Page(props: Props) {
  const { patientId } = await props.params;
  const patient = await serverApiClient.patients.find({ id: Number(patientId) });

  return <PatientForm initialValues={patient} />;
}
