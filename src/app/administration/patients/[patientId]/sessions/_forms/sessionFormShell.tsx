"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { updateSession } from "../actions";
import SessionForm from "./sessionForm";
import { Session, HomeworkStatus, TreatmentPlan } from "@/contract";

export type SessionFormValues = {
  sessionDate: string;
  durationMinutes: number;
  sessionType: string;
  phase: string;
  moodStart: number | null;
  moodEnd: number | null;
  riskLevel: string;
  interventions: string[];
  clinicalNotes: string;
  nextSessionPlan: string;
  givenHomework: { description: string }[];
  reviewHomework: { description: string; status: HomeworkStatus }[];
};

function toFormValues(session: Session): SessionFormValues {
  return {
    sessionDate: session.sessionDate,
    durationMinutes: session.durationMinutes,
    sessionType: session.sessionType,
    phase: session.phase ?? "",
    moodStart: session.moodStart,
    moodEnd: session.moodEnd,
    riskLevel: session.riskLevel ?? "",
    interventions: session.interventions,
    clinicalNotes: session.clinicalNotes ?? "",
    nextSessionPlan: session.nextSessionPlan ?? "",
    givenHomework: session.givenHomework,
    reviewHomework: session.reviewHomework,
  };
}

function toSessionPayload(values: SessionFormValues): Partial<Session> {
  return {
    ...values,
    sessionType: values.sessionType as Session["sessionType"],
    phase: (values.phase as Session["phase"]) || null,
    riskLevel: (values.riskLevel as Session["riskLevel"]) || null,
    clinicalNotes: values.clinicalNotes || null,
    nextSessionPlan: values.nextSessionPlan || null,
  };
}

interface Props {
  initialSession: Session;
  treatmentPlan: TreatmentPlan | null;
  previousSession: Session | null;
}

export default function SessionFormShell({ initialSession, treatmentPlan, previousSession }: Props) {
  const [session, setSession] = useState<Session>(initialSession);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const methods = useForm<SessionFormValues>({
    defaultValues: toFormValues(initialSession),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library -- RHF watch() subscription; cleaned up on unmount
    const subscription = methods.watch(() => {
      setSaveStatus("saving");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const values = methods.getValues();
        await updateSession(session.id, toSessionPayload(values));
        setSaveStatus("saved");
      }, 2500);
    });
    return () => subscription.unsubscribe();
  }, [session, methods]);

  const handleFinalize = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const values = methods.getValues();
    const updated = await updateSession(session.id, {
      ...toSessionPayload(values),
      status: "final",
    });
    setSession(updated);
    setSaveStatus("saved");
  }, [session, methods]);

  return (
    <FormProvider {...methods}>
      <SessionForm
        session={session}
        saveStatus={saveStatus}
        onFinalize={handleFinalize}
        treatmentPlan={treatmentPlan}
        previousSession={previousSession}
      />
    </FormProvider>
  );
}
