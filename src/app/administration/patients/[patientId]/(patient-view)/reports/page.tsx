import ReportsTab from "./reportsTab";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const api = await serverApi();
  const { rows: sessions } = await api.sessions.filter({
    patientId: Number(patientId),
    status: "final",
  });

  return <ReportsTab patientId={patientId} initialSessions={sessions} />;
}
