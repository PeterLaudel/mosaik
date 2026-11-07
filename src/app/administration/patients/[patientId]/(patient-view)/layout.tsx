import { getPatientsRepository } from "@/features/patients";
import PatientTabs from "../patientTabs";

interface Props {
  params: Promise<{ patientId: string }>;
  children: React.ReactNode;
}

export default async function Layout({ params, children }: Props) {
  const { patientId } = await params;
  const patientRepository = await getPatientsRepository();
  const patient = await patientRepository.find(Number(patientId));

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
