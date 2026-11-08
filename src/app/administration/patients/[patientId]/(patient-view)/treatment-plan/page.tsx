import { getTreatmentPlansService } from "@/features/treatment-plans/legacy";
import TreatmentPlanShell from "../../treatment-plan/treatmentPlanShell";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const treatmentPlansService = await getTreatmentPlansService();
  const plan = await treatmentPlansService.findByPatientId(Number(patientId));

  return <TreatmentPlanShell patientId={Number(patientId)} initialPlan={plan} />;
}
