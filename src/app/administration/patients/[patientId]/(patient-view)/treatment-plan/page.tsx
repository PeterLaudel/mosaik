import { getTreatmentPlansRepository } from "@/features/treatment-plans";
import TreatmentPlanShell from "../../treatment-plan/treatmentPlanShell";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const repo = await getTreatmentPlansRepository();
  const plan = await repo.findByPatientId(Number(patientId));

  return <TreatmentPlanShell patientId={Number(patientId)} initialPlan={plan} />;
}
