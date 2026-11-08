"use client";

import { Tab, Tabs } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  patientId: string;
}

export default function PatientTabs({ patientId }: Props) {
  const pathname = usePathname();

  const base = `/administration/patients/${patientId}`;

  const currentTab = pathname.endsWith("/sessions")
    ? "sessions"
    : pathname.endsWith("/treatment-plan")
    ? "treatment-plan"
    : pathname.endsWith("/reports")
    ? "reports"
    : "stammdaten";

  return (
    <Tabs value={currentTab} textColor="primary" indicatorColor="primary">
      <Tab
        label="Stammdaten"
        value="stammdaten"
        component={Link}
        href={base}
      />
      <Tab
        label="Behandlungsplan"
        value="treatment-plan"
        component={Link}
        href={`${base}/treatment-plan`}
      />
      <Tab
        label="Sitzungen"
        value="sessions"
        component={Link}
        href={`${base}/sessions`}
      />
      <Tab
        label="Berichte"
        value="reports"
        component={Link}
        href={`${base}/reports`}
      />
    </Tabs>
  );
}
