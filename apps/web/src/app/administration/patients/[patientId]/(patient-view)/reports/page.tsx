import { getSessionsRepository } from "@api/src/server";
import ReportsTab from "./reportsTab";

interface Props {
  params: Promise<{ patientId: string }>;
}

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const sessionsRepository = await getSessionsRepository();
  const { rows: sessions } = await sessionsRepository.filter({
    patientId: Number(patientId),
    status: "final",
  });

  return <ReportsTab patientId={patientId} initialSessions={sessions} />;
}
