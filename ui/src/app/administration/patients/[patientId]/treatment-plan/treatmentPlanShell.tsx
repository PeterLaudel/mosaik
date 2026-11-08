"use client";

import { useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { createTreatmentPlan, updateTreatmentPlan } from "./actions";
import TreatmentPlanForm, { PlanFormValues } from "./treatmentPlanForm";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { TreatmentPlan } from "@peterlaudel/mosaik-contract";

function toFormValues(plan: TreatmentPlan | null): PlanFormValues {
  return {
    startDate: plan?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: plan?.endDate ?? "",
    therapyForm: plan?.therapyForm ?? "Einzeltherapie",
    phase: plan?.phase ?? "Diagnostik",
    approvedSessions: plan?.approvedSessions ?? null,
    notes: plan?.notes ?? "",
    goals: plan?.goals ?? [],
  };
}

interface Props {
  patientId: number;
  initialPlan: TreatmentPlan | null;
}

export default function TreatmentPlanShell({ patientId, initialPlan }: Props) {
  const [plan, setPlan] = useState<TreatmentPlan | null>(initialPlan);
  const [isPending, startTransition] = useTransition();
  const { showSuccessMessage } = useSnackbar();

  const methods = useForm<PlanFormValues>({
    defaultValues: toFormValues(initialPlan),
  });

  const onSubmit = (values: PlanFormValues) => {
    startTransition(async () => {
      const data = {
        startDate: values.startDate,
        endDate: values.endDate || null,
        therapyForm: values.therapyForm,
        phase: values.phase,
        approvedSessions: values.approvedSessions,
        notes: values.notes || null,
        goals: values.goals,
      };
      const saved = plan
        ? await updateTreatmentPlan(plan.id, data)
        : await createTreatmentPlan(patientId, data);
      setPlan(saved);
      showSuccessMessage("Behandlungsplan gespeichert");
    });
  };

  return (
    <FormProvider {...methods}>
      <TreatmentPlanForm
        onSubmit={methods.handleSubmit(onSubmit)}
        isPending={isPending}
      />
    </FormProvider>
  );
}
