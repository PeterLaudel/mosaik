"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FormInvoice } from ".";
import type { InvoicePosition } from "./serviceSection";
import { Therapeut } from "@mosaik/contract/models/therapeut";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { CreatePdfParams } from "@api/src/invoicePdf";

interface Props {
  therapeut: Therapeut;
  invoiceNumber: string;
}

const MUTATE_TIMEOUT = 250;

export default function InvoiceViewer({ therapeut, invoiceNumber }: Props) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Viewer therapeut={therapeut} invoiceNumber={invoiceNumber} />
    </QueryClientProvider>
  );
}

function Viewer({ therapeut, invoiceNumber }: Props) {
  const timeoutId = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [data, setData] = useState<string | null>(null);
  const { control, setValue } = useFormContext<FormInvoice>();
  const patient = useWatch({ control, name: "patient" });
  const invoicePositions = useWatch({ control, name: "invoicePositions" });
  const invoiceAmount = useWatch({ control, name: "invoiceAmount" });

  const mutation = useMutation({
    mutationFn: (postData: CreatePdfParams) => {
      return fetch("/api/invoices/generate", {
        method: "POST",
        body: JSON.stringify(postData),
      }).then(async (res) => {
        const blob = await res.blob();
        setData(URL.createObjectURL(blob));
        const base64 = await blobToBase64(blob);
        setValue("base64Pdf", base64.split(",")[1]);
      });
    },
  });

  const stringifiedPositions = JSON.stringify(invoicePositions);
  const mappedPositions = useMemo(
    () =>
      invoicePositions
        .filter(
          (position): position is Required<InvoicePosition> =>
            !!position &&
            !!position.serviceDate &&
            !!position.service &&
            !!position.factor &&
            !!position.amount &&
            !!position.price
        )
        .map((position, index) => ({ id: index, ...position })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stringifiedPositions]
  );

  const stringifiedMappedPositions = JSON.stringify(mappedPositions);
  useEffect(() => {
    if (timeoutId.current !== null) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(
      () =>
        mutation.mutate({
          therapeut,
          invoiceNumber,
          patient,
          positions: mappedPositions,
          invoiceAmount: invoiceAmount ?? 0,
        }),
      MUTATE_TIMEOUT
    );
    return () => { if (timeoutId.current !== null) clearTimeout(timeoutId.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [therapeut, invoiceNumber, patient, stringifiedMappedPositions, invoiceAmount]);

  if (!data) {
    return null;
  }

  return <iframe key={patient?.id} src={data} className="w-full h-full" />;
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
