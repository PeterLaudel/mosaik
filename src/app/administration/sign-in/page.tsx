"use client";

import { Button } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Section from "@/components/section";
import { signInWithGoogle } from "@/lib/auth/client";

// Only same-site paths are accepted as a target after sign-in
function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/administration/patients";
  return value;
}

function SignIn() {
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const [pending, setPending] = useState(false);

  const onSignIn = async () => {
    setPending(true);
    await signInWithGoogle(returnTo);
  };

  return (
    <div className="m-4 grid justify-items-center">
      <Section>
        <div className="grid gap-4 max-w-md">
          <h1>Anmelden</h1>
          <p>
            Melden Sie sich mit Ihrem Google-Konto an. Rechnungen werden über dieses Konto
            versendet.
          </p>
          <Button variant="contained" onClick={onSignIn} disabled={pending}>
            Mit Google anmelden
          </Button>
        </div>
      </Section>
    </div>
  );
}

export default function Page() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
