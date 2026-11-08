import { getSessionsService } from "@/features/sessions/legacy";
import { getTreatmentPlansService } from "@/features/treatment-plans/legacy";
import SessionFormShell from "../_forms/sessionFormShell";

interface Props {
  params: Promise<{ patientId: string; sessionId: string }>;
}

export default async function Page(props: Props) {
  const { patientId, sessionId } = await props.params;
  const [sessionsService, treatmentPlansService] = await Promise.all([
    getSessionsService(),
    getTreatmentPlansService(),
  ]);

  const session = await sessionsService.find(Number(sessionId));

  const [treatmentPlan, previousSession] = await Promise.all([
    treatmentPlansService.findByPatientId(Number(patientId)),
    sessionsService.findPreviousSession(Number(patientId), session.sessionNumber),
  ]);

  return (
    <div className="m-4 grid gap-4 grid-flow-row h-fit">
      <h1>
        Sitzung {session.sessionNumber} — {session.patient.name}{" "}
        {session.patient.surname}
      </h1>
      <SessionFormShell
        initialSession={session}
        treatmentPlan={treatmentPlan}
        previousSession={previousSession}
      />
    </div>
  );
}
