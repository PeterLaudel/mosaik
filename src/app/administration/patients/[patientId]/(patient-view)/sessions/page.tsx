import PatientSessionsList from "../../sessions/patientSessionsList";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page(props: Props) {
  const { patientId } = await props.params;

  const api = await serverApi();
  const [{ rows: sessions }, openSession] = await Promise.all([
    api.sessions.filter({ patientId: Number(patientId) }),
    api.sessions.findOpenSession({ patientId: Number(patientId) }),
  ]);

  return <PatientSessionsList patientId={patientId} initialSessions={sessions} openSession={openSession} />;
}
