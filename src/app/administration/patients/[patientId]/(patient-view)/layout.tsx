import PatientTabs from "../patientTabs";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{ patientId: string }>;
  children: React.ReactNode;
}

export default async function Layout({ params, children }: Props) {
  const { patientId } = await params;
  const api = await serverApi();
  const patient = await api.patients.find({ id: Number(patientId) });

  return (
    <div className="m-4 grid gap-4 grid-flow-row h-fit">
      <h1>
        {patient.name} {patient.surname}
      </h1>
      <PatientTabs patientId={patientId} />
      {children}
    </div>
  );
}
