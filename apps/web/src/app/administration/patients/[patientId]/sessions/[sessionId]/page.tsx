import { getSessionsRepository, getTreatmentPlansRepository } from "@api/src/server";
import SessionFormShell from "../_forms/sessionFormShell";

interface Props {
  params: Promise<{ patientId: string; sessionId: string }>;
}

export default async function Page(props: Props) {
  const { patientId, sessionId } = await props.params;
  const [sessionsRepo, plansRepo] = await Promise.all([
    getSessionsRepository(),
    getTreatmentPlansRepository(),
  ]);

  const session = await sessionsRepo.find(Number(sessionId));

  const [treatmentPlan, previousSession] = await Promise.all([
    plansRepo.findByPatientId(Number(patientId)),
    sessionsRepo.findPreviousSession(Number(patientId), session.sessionNumber),
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
