import { getSessionsService } from "@/features/sessions";
import PatientSessionsList from "../../sessions/patientSessionsList";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page(props: Props) {
  const { patientId } = await props.params;

  const sessionsService = await getSessionsService();
  const [{ rows: sessions }, openSession] = await Promise.all([
    sessionsService.filter({ patientId: Number(patientId) }),
    sessionsService.findOpenSession(Number(patientId)),
  ]);

  return <PatientSessionsList patientId={patientId} initialSessions={sessions} openSession={openSession} />;
}
