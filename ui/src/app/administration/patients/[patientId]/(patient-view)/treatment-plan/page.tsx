import TreatmentPlanShell from "../../treatment-plan/treatmentPlanShell";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const api = await serverApi();
  const plan = await api.treatmentPlans.findByPatientId({ patientId: Number(patientId) });

  return <TreatmentPlanShell patientId={Number(patientId)} initialPlan={plan} />;
}
