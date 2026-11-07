import { getSessionsRepository } from "@api/src/server";
import PatientSessionsList from "../../sessions/patientSessionsList";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page(props: Props) {
  const { patientId } = await props.params;

  const sessionsRepository = await getSessionsRepository();
  const [{ rows: sessions }, openSession] = await Promise.all([
    sessionsRepository.filter({ patientId: Number(patientId) }),
    sessionsRepository.findOpenSession(Number(patientId)),
  ]);

  return <PatientSessionsList patientId={patientId} initialSessions={sessions} openSession={openSession} />;
}
