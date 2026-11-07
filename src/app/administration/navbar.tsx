"use client";

import { Button } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { status } = useSession();

  const pathname = usePathname();

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
        {status === "authenticated" && (
          <Button
            variant="text"
            className="[grid-area:button]"
            onClick={() => signOut()}
          >
            Abmelden
          </Button>
        )}
        {status !== "authenticated" && (
          <Button
            variant="text"
            className="[grid-area:button]"
            onClick={() => signIn()}
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
