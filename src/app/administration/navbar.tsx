"use client";

import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSnackbar } from "@/contexts/snackbarProvider";
import { authClient, signInWithGoogle } from "@/lib/auth/client";

export default function Navbar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { showErrorMessage } = useSnackbar();

  const onSignIn = async () => {
    try {
      await signInWithGoogle(pathname);
    } catch {
      showErrorMessage("Anmeldung fehlgeschlagen");
    }
  };

  const onSignOut = async () => {
    await authClient.signOut();
    router.push("/administration/sign-in");
  };

  const isPatientRoute = /patients/.test(pathname);
  const isInvoiceRoute = /invoice/.test(pathname);
  const isTherapeutRoute = /therapeuts/.test(pathname);
  const isServiceRoute = /services/.test(pathname);

  return (
    <nav className="bg-white">
      <div className="grid [grid-template-areas:'logo_button_menu''items_items_items'] md:[grid-template-areas:'logo_items_button'] items-center justify-between mx-auto px-2 py-2 md:px-8 md:py-4">
        <Link href="/administration/patients" className="[grid-area:logo]">
          <Image
            src="/logo.svg"
            alt="Logo von Psychotherapie Seliger"
            width="0"
            height="0"
            sizes="100%"
            className="w-auto h-10 md:h-12"
          />
        </Link>
        {session && (
          <Button variant="text" className="[grid-area:button]" onClick={onSignOut}>
            Abmelden
          </Button>
        )}
        {!session && (
          <Button
            variant="text"
            className="[grid-area:button]"
            onClick={onSignIn}
          >
            Anmelden
          </Button>
        )}
        <div className="peer [grid-area:menu] md:hidden">
          <input id="check01" type="checkbox" name="menu" className="hidden" />
          <label htmlFor="check01">
            <Image
              src="/menu.svg"
              alt="Menü für mobile Geräte"
              width="0"
              height="0"
              sizes="100%"
              className="w-auto h-8"
            />
          </label>
        </div>
        <div className="[grid-area:items] justify-self-start hidden peer-has-checked:block w-full md:block md:w-auto">
          <ul className="flex flex-col md:p-0 mt-4 md:flex-row md:space-x-8 md:mt-0 md:border-0">
            <li className={isTherapeutRoute ? "font-bold" : ""}>
              <Link href="/administration/therapeuts">Therapeut</Link>
            </li>
            <li className={isPatientRoute ? "font-bold" : ""}>
              <Link href="/administration/patients">Patienten</Link>
            </li>
            <li className={isInvoiceRoute ? "font-bold" : ""}>
              <Link href="/administration/invoices">Rechnungen</Link>
            </li>
            <li className={isServiceRoute ? "font-bold" : ""}>
              <Link href="/administration/services">Leistungen</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
