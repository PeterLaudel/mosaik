import { getSessionsService } from "@/features/sessions/legacy";
import ReportsTab from "./reportsTab";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const sessionsService = await getSessionsService();
  const { rows: sessions } = await sessionsService.filter({
    patientId: Number(patientId),
    status: "final",
  });

  return <ReportsTab patientId={patientId} initialSessions={sessions} />;
}
